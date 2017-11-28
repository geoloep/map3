import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, RawShaderMaterial, ShaderMaterial, Float32BufferAttribute, DoubleSide } from 'three';

import FragShader from '../../../shaders/path-frag';
import VertShader from '../../../shaders/path-vert';

import { Geometry } from 'three';

export default class PathShape {
    constructor(private feature: GeoJSON.Feature<GeoJSON.Polygon>, style?: any) {
        // super(feature, style);

        // if (feature) {
        //     this.feature = feature;
        // }
    }

    mesh() {
        const [geom, length] = this.toGeometry(this.feature.geometry);

        const material = new RawShaderMaterial({
            fragmentShader: FragShader,
            vertexShader: VertShader,
            uniforms: {
                u_color: {
                    value: [0, 0, 0, 1],
                },
                translate: {
                    value: [0, 0],
                },
                scale: {
                    value: 1,
                },
                theta: {
                    value: 0,
                },
                u_linewidth: {
                    value: 20,
                },
                u_antialias: {
                    value: 1,
                },
                u_linecaps: {
                    value: [2, 3],
                },
                u_linejoin: {
                    value: 0,
                },
                u_miter_limit: {
                    value: 10,
                },
                u_length: {
                    value: length[0],
                },
                u_closed: {
                    value: 0,
                },
            },
            side: DoubleSide,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });

        return new Mesh(geom, material);

    }

    toGeometry(geom: GeoJSON.Polygon) {
        const attrs: any[] = [];
        const vertices: any[] = [];

        let curr: any[];
        let prev: any[];
        let next: any[];

        let attr: any[];

        let tangents: any[];
        let segments: number[];

        let length = 0;
        let nextLength = 0;

        for (const ring of geom.coordinates) {
            for (let i = 0; i < ring.length; i++) {
                // Construct attributes for each point
                attr = [];
                tangents = [];
                segments = [];

                prev = ring[i - 1];
                curr = ring[i];
                next = ring[i + 1];

                // Position
                attr.push([curr[0], curr[1], 0]);

                // Tangents
                if (prev) {
                    tangents.push(
                        curr[0] - prev[0],
                        curr[1] - prev[1],
                    );
                }

                if (next) {
                    tangents.push(
                        next[0] - curr[0],
                        next[1] - curr[1],
                    );
                }

                if (tangents.length < 4) {
                    tangents.push(
                        tangents[0],
                        tangents[1],
                    );
                }

                // Segments
                segments.push(length);

                if (next) {
                    nextLength = length + Math.sqrt(Math.pow(tangents[2], 2) + Math.pow(tangents[3], 2));
                    segments.push(nextLength);

                    length = nextLength;
                } else {
                    segments.push(0);
                }

                const angle = Math.atan2(
                    tangents[2] * tangents[3] - tangents[0] * tangents[1],
                    tangents[0] * tangents[2] + tangents[1] * tangents[3],
                );

                attr.push(segments);
                attr.push(angle);
                attr.push(tangents);

                attrs.push(attr);
            }
        }

        // Attributes for buffer input
        const aPositions: number[] = [];
        const aTangents: number[] = [];
        const aSegments: number[] = [];
        const aAngles: number[] = [];
        const aTextcoord: number[] = [];
        const aIndices: number[] = [];

        // Textcoord pattern
        const textcoords = [
            [
                [-1, -1],
                [-1, 1],
            ], [
                [1, -1],
                [1, 1],
            ],
        ];

        const indexPattern = [0, 1, 2, 1, 2, 3];
        const index = [];
        let indexFactor;

        for (let i = 0; i < attrs.length; i++) {
            curr = attrs[i];
            next = attrs[i + 1];

            if (next) {

                for (const texcoord of textcoords[0]) {
                    aPositions.push(...curr[0]);
                    aTangents.push(...curr[3]);
                    aSegments.push(...curr[1]);
                    aAngles.push(curr[2], next[2]);
                    aTextcoord.push(...texcoord);
                }

                for (const texcoord of textcoords[1]) {
                    aPositions.push(...next[0]);
                    aTangents.push(...next[3]);
                    aSegments.push(...curr[1]);
                    aAngles.push(curr[2], next[2]);
                    aTextcoord.push(...texcoord);
                }

                indexFactor = i * 4;

                for (const ii of indexPattern) {
                    index.push(ii + indexFactor);
                }
            }

        }

        const geometry = new BufferGeometry();

        geometry.setIndex(index);

        // Load all the data in the appropiate buffers
        geometry.addAttribute('position', new BufferAttribute(new Float32Array(aPositions), 3));
        geometry.addAttribute('a_tangents', new BufferAttribute(new Float32Array(aTangents), 4));
        geometry.addAttribute('a_segment', new BufferAttribute(new Float32Array(aSegments), 2));
        geometry.addAttribute('a_angles', new BufferAttribute(new Float32Array(aAngles), 2));
        geometry.addAttribute('a_texcoord', new BufferAttribute(new Float32Array(aTextcoord), 2));

        return [geometry, aSegments.slice(-1)] as [BufferGeometry, number[]];
    }
}
