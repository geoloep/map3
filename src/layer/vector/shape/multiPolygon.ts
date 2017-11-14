import { Group, Mesh, Shape, ShapeBufferGeometry } from 'three';

import PolygonShape from './polygon';

export default class MultiPolygonShape {
    constructor(private feature: GeoJSON.Feature<GeoJSON.MultiPolygon>, style?: any) {
    }

    mesh() {
        const geom = this.toShape(this.feature.geometry);

        // const group = new Group();

        return new Mesh(new ShapeBufferGeometry(geom));

        // for (const s of geom) {
        //     group.add(new Mesh(new ShapeBufferGeometry(s)));
        // }
    }

    protected toShape(geom: GeoJSON.MultiPolygon) {
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
}
