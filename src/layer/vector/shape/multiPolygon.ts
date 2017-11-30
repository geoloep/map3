import { Geometry, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Shape, ShapeBufferGeometry, Vector3 } from 'three';

import PolygonShape from './polygon';

export default class MultiPolygonShape {
    private shape: Shape[];
    private _mesh: Mesh;
    private _line: Line;

    constructor(private feature: GeoJSON.Feature<GeoJSON.MultiPolygon>, style?: any) {

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

        return new Line(this.shape[0].createPointsGeometry(1), new LineBasicMaterial());
    }

    protected toShape(geom: GeoJSON.MultiPolygon) {
        let shape: Shape;
        const shapes: Shape[] = [];

        let first;

        for (const part of geom.coordinates) {
            shape = new Shape();
            first = true;
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
