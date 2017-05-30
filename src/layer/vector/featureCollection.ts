import * as THREE from 'three';
// import * as chroma from 'chroma-js';

import Polygon from './polygon';
import MultiPolygon from './multiPolygon';

export default class FeatureCollectionLayer {
    group = new THREE.Group();

    constructor(private geosjon: GeoJSON.FeatureCollection<GeoJSON.Polygon>, readonly style?: any) {

    }

    mesh() {
        for (let feature of this.geosjon.features) {
            // if (feature.geometry.type === 'Polygon') {
            // let shape = this.geometryToShape(feature.geometry);
            // this.group.add(new THREE.Mesh(new (THREE as any).ShapeBufferGeometry(shape)));
            // }
            let layer = this.featureToLayer(feature);
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

    // geometryToShape(geom: GeoJSON.Polygon | GeoJSON.MultiPolygon): THREE.Shape {
    //     console.log(geom);
    //     switch (geom.type) {
    //         case 'Polygon':
    //             return this.polygonToShape(geom, this.st);
    //         case 'MultiPolygon':
    //             return this.multiPolygonToShape(geom);
    //         default:
    //             console.error(`Cannot convert ${geom} into a shape`);
    //             return new THREE.Shape();
    //     }
    // }

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

    multiPolygonToShape(geom: GeoJSON.MultiPolygon) {
        console.log('ja')
        let shape = new THREE.Shape();

        let first = true;

        for (let part of geom.coordinates) {
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

            first = true;
        }

        return shape;
    }

    material() {
        return new THREE.MeshBasicMaterial({
            color: 0x2194ce,
        });
    }

    symbology() {
        return {
            color: chroma.random().css(),
        };
    }
}
