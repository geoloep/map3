// import * as THREE from 'three';
// import * as chroma from 'chroma-js';

import chroma from 'chroma-js';
import {Group, Mesh, MeshBasicMaterial, Shape} from 'three';

export default class GeoJsonLayer {
    group = new Group();

    constructor(private geosjon: GeoJSON.FeatureCollection<GeoJSON.Polygon>) {

    }

    mesh() {
        for (const feature of this.geosjon.features) {
            // if (feature.geometry.type === 'Polygon') {
                const shape = this.geometryToShape(feature.geometry);
                this.group.add(new Mesh(new (THREE as any).ShapeBufferGeometry(shape)));
            // }
        }

        return this.group;
    }

    geometryToShape(geom: GeoJSON.Polygon | GeoJSON.MultiPolygon): Shape {
        console.log(geom);
        switch (geom.type) {
            case 'Polygon':
                return this.polygonToShape(geom);
            case 'MultiPolygon':
                return this.multiPolygonToShape(geom);
            default:
                console.error(`Cannot convert ${geom} into a shape`);
                return new Shape();
        }
    }

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
