import { Group, MeshBasicMaterial, Shape } from 'three';
export default class GeoJsonLayer {
    private geosjon;
    group: Group;
    constructor(geosjon: GeoJSON.FeatureCollection<GeoJSON.Polygon>);
    mesh(): Group;
    geometryToShape(geom: GeoJSON.Polygon | GeoJSON.MultiPolygon): Shape;
    polygonToShape(geom: GeoJSON.Polygon): Shape;
    multiPolygonToShape(geom: GeoJSON.MultiPolygon): Shape;
    material(): MeshBasicMaterial;
    symbology(): {
        color: string;
    };
}
