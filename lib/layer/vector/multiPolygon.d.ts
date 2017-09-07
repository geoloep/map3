import { Mesh, Shape } from 'three';
import VectorLayer from './vector';
export default class MulitPolygonLayer extends VectorLayer {
    constructor(feature: GeoJSON.Feature<GeoJSON.MultiPolygon>, style?: any);
    multiPolygonToShape(geom: GeoJSON.MultiPolygon): Shape[];
    mesh(): Mesh;
}
