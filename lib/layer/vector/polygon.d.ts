import { Mesh, Shape } from 'three';
import VectorLayer from './vector';
export default class PolygonLayer extends VectorLayer {
    constructor(feature?: GeoJSON.Feature<GeoJSON.Polygon>, style?: any);
    polygonToShape(geom: GeoJSON.Polygon): Shape;
    mesh(): Mesh;
}
