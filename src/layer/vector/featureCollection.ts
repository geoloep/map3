// import * as THREE from 'three';
// import * as chroma from 'chroma-js';

import { Group, MeshBasicMaterial, Shape} from 'three';
import chroma from 'chroma-js';

import Polygon from './polygon';
import MultiPolygon from './multiPolygon';

export default class FeatureCollectionLayer {
    group = new Group();

    constructor(private geosjon: GeoJSON.FeatureCollection<GeoJSON.Polygon>, readonly style?: any) {

    }

    mesh() {
        for (const feature of this.geosjon.features) {
            // if (feature.geometry.type === 'Polygon') {
            // let shape = this.geometryToShape(feature.geometry);
            // this.group.add(new Mesh(new (THREE as any).ShapeBufferGeometry(shape)));
            // }
            const layer = this.featureToLayer(feature);
            if (layer) {
                this.group.add(layer.mesh());
            }
        }

        return this.group;
    }

    featureToLayer(feature: GeoJSON.Feature<GeoJSON.DirectGeometryObject>) {
        switch (feature.geometry.type) {
            case 'Polygon':
                return new Polygon(feature as GeoJSON.Feature<GeoJSON.Polygon>, this.style);
            case 'MultiPolygon':
                return new MultiPolygon(feature as GeoJSON.Feature<GeoJSON.MultiPolygon>, this.style);
            default:
                console.error(`Cannot convert ${feature.geometry.type} into a shape`);
                return false;
        }
    }

    // geometryToShape(geom: GeoJSON.Polygon | GeoJSON.MultiPolygon): Shape {
    //     console.log(geom);
    //     switch (geom.type) {
    //         case 'Polygon':
    //             return this.polygonToShape(geom, this.st);
    //         case 'MultiPolygon':
    //             return this.multiPolygonToShape(geom);
    //         default:
    //             console.error(`Cannot convert ${geom} into a shape`);
    //             return new Shape();
    //     }
    // }

    polygonToShape(geom: GeoJSON.Polygon) {
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

    multiPolygonToShape(geom: GeoJSON.MultiPolygon) {
        console.log('ja');
        const shape = new Shape();

        let first = true;

        for (const part of geom.coordinates) {
            for (const ring of part) {
                for (const vertice of ring) {
                    if (first) {
                        shape.moveTo(vertice[0], vertice[1]);
                        first = false;
                    } else {
                        shape.lineTo(vertice[0], vertice[1]);
                    }
                }
            }

            first = true;
        }

        return shape;
    }

    material() {
        return new MeshBasicMaterial({
            color: 0x2194ce,
        });
    }

    symbology() {
        return {
            color: chroma.random().css(),
        };
    }
}
