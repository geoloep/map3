// import * as THREE from 'three';
import * as chroma from 'chroma-js';

import {Mesh, Shape} from 'three';

import VectorLayer from './vector';

export default class PolygonLayer extends VectorLayer {
    constructor(feature?: GeoJSON.Feature<GeoJSON.Polygon>, style?: any) {
        super(feature, style);

        // if (feature) {
        //     this.feature = feature;
        // }
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

    mesh(): Mesh {
        const style = this.parseStyle(this.style);

        const shape = this.polygonToShape(this.feature.geometry);

        const geom = this.styleToGeometry(shape, style);

        return new Mesh(geom, this.styleToMaterial(style));
    }
}
