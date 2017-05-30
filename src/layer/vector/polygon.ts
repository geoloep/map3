import * as THREE from 'three';
import * as chroma from 'chroma-js';

import VectorLayer from './vector';

export default class PolygonLayer extends VectorLayer {
    constructor(feature?: GeoJSON.Feature<GeoJSON.Polygon>, style?: any) {
        super(feature, style);

        // if (feature) {
        //     this.feature = feature;
        // }
    }

    polygonToShape(geom: GeoJSON.Polygon) {
        let shape = new THREE.Shape();

        let first = true;

        for (let ring of geom.coordinates) {
            for (let vertice of ring) {
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

    mesh(): THREE.Mesh {
        let style = this.parseStyle(this.style);

        let shape = this.polygonToShape(this.feature.geometry);

        let geom = this.styleToGeometry(shape, style);

        return new THREE.Mesh(geom, this.styleToMaterial(style));
    }
}
