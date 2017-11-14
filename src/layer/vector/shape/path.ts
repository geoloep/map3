import {Mesh, Shape, ShapeBufferGeometry} from 'three';

export default class PathShape {
    constructor(private feature: GeoJSON.Feature<GeoJSON.Polygon>, style?: any) {
        // super(feature, style);

        // if (feature) {
        //     this.feature = feature;
        // }
    }

    mesh() {
        const geom = this.toShape(this.feature.geometry);

        return new Mesh(new ShapeBufferGeometry(geom));
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
