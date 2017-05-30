import * as THREE from 'three';

export default class VectorLayer {
    feature: GeoJSON.Feature<any>;

    // customStyle?: any;

    protected style = {
        color: 0x0000ff,
        light: false,
        extrude: false,
    }

    constructor(feature?: GeoJSON.Feature<any>, style?: any) {
        if (feature) {
            this.feature = feature;
        }

        if (typeof (style) !== 'function') {
            Object.assign(this.style, style);
        } else {
            this.style = style;
        }
    }

    parseStyle(style: any) {
        if (typeof (style) === 'function') {
            style = Object.assign(this.style, style(this.feature));
        }

        return style;
    }

    styleToMaterial(style: any) {
        let mat: any;

        if (style.light) {
            mat = THREE.MeshLambertMaterial;
        } else {
            mat = THREE.MeshBasicMaterial;
        }

        return new mat({
            color: style.color,
        });
    }

    styleToGeometry(shapes: any, style: any) {
        if (style.extrude) {
            return new (THREE as any).ExtrudeBufferGeometry(shapes, {
                amount: style.extrude,
            });
        } else {
            return new (THREE as any).ShapeBufferGeometry(shapes);
        }
    }
}
