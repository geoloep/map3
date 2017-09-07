export default class VectorLayer {
    feature: GeoJSON.Feature<any>;
    protected style: {
        color: number;
        light: boolean;
        extrude: boolean;
    };
    constructor(feature?: GeoJSON.Feature<any>, style?: any);
    parseStyle(style: any): any;
    styleToMaterial(style: any): any;
    styleToGeometry(shapes: any, style: any): any;
}
