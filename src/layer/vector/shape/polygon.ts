import { Geometry, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, ShaderMaterial, Shape,  ShapeBufferGeometry, Vector3 } from 'three';

import buffer from '@turf/buffer';
import { Group } from 'three';

export default class PolygonShape {
    private shape: Shape;
    private _mesh: Mesh;
    private _line: Line;

    constructor(private feature: GeoJSON.Feature<GeoJSON.Polygon>, style?: any) {
    }

    get mesh() {
        if (!this.shape) {
            this.shape = this.toShape(this.feature.geometry as any);
        }

        return new Mesh(new ShapeBufferGeometry(this.shape));
    }

    get line() {
        if (!this.shape) {
            this.shape = this.toShape(this.feature.geometry);
        }

        return new Line(this.shape.createPointsGeometry(1), new LineBasicMaterial());
    }

    protected toShape(geom: GeoJSON.Polygon) {
        const shape = new Shape();

        let first = true;

        for (const ring of geom.coordinates) {
            for (const vertice of ring) {
                if (first) {
                    shape.moveTo(vertice[0], vertice[1]);
                    first = false;
                } else {
                    shape.lineTo(vertice[0], vertice[1]);
                }

            }
        }

        return shape;
    }
}
