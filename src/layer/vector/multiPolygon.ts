import { Mesh, Shape } from 'three';

import Polygon from './polygon';
import VectorLayer from './vector';

export default class MulitPolygonLayer extends VectorLayer {
    constructor(feature: GeoJSON.Feature<GeoJSON.MultiPolygon>, style?: any) {
        super(feature, style);
    }

    multiPolygonToShape(geom: GeoJSON.MultiPolygon) {
        const shapes: Shape[] = [];

        for (const part of geom.coordinates) {
            const shape = new Shape();
            let first = true;

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
            shapes.push(shape);
        }

        return shapes;
    }

    mesh(): Mesh {
        const style = this.parseStyle(this.style);

        // let shape = this.polygonToShape(this.feature.geometry);
        const shape = this.multiPolygonToShape(this.feature.geometry);

        const geom = this.styleToGeometry(shape, style);

        // let geom = new (THREE as any).ShapeBufferGeometry(shape);

        return new Mesh(geom, this.styleToMaterial(style));

        // return new THREE.Mesh(geom);
    }
}
