import * as THREE from 'three';

import Polygon from './polygon';
import VectorLayer from './vector';

export default class MulitPolygonLayer extends VectorLayer {
    constructor(feature: GeoJSON.Feature<GeoJSON.MultiPolygon>, style?: any) {
        super(feature, style);
    }

    multiPolygonToShape(geom: GeoJSON.MultiPolygon) {
        let shapes: THREE.Shape[] = [];

        for (let part of geom.coordinates) {
            let shape = new THREE.Shape();
            let first = true;

            for (let ring of part) {
                for (let vertice of ring) {
                    if (first) {
                        shape.moveTo(vertice[0], vertice[1]);
                        first = false;
                    } else {
                        shape.lineTo(vertice[0], vertice[1]);
                    }

                }
            }
            shapes.push(shape);
        }

        return shapes;
    }

    mesh(): THREE.Mesh {
        let style = this.parseStyle(this.style);

        // let shape = this.polygonToShape(this.feature.geometry);
        let shape = this.multiPolygonToShape(this.feature.geometry);

        let geom = this.styleToGeometry(shape, style);



        // let geom = new (THREE as any).ShapeBufferGeometry(shape);

        return new THREE.Mesh(geom, this.styleToMaterial(style));


        // return new THREE.Mesh(geom);
    }
}
