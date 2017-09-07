import { Group, MeshBasicMaterial, Shape } from 'three';
import Polygon from './polygon';
import MultiPolygon from './multiPolygon';
export default class FeatureCollectionLayer {
    private geosjon;
    readonly style: any;
    group: Group;
    constructor(geosjon: GeoJSON.FeatureCollection<GeoJSON.Polygon>, style?: any);
    mesh(): Group;
    featureToLayer(feature: GeoJSON.Feature<GeoJSON.DirectGeometryObject>): false | Polygon | MultiPolygon;
    polygonToShape(geom: GeoJSON.Polygon): Shape;
    multiPolygonToShape(geom: GeoJSON.MultiPolygon): Shape;
    material(): MeshBasicMaterial;
    symbology(): {
        color: string;
    };
}
