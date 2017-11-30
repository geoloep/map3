import Evented from '../../core/evented';

import { ILayer } from '../layer';

import { Group } from 'three';

import MultiPolygonShape from './shape/multiPolygon';
import PolygonShape from './shape/polygon';

export type AnyGeometry = GeoJSON.Polygon | GeoJSON.MultiPolygon;

export default class GeoJsonLayer extends Evented implements ILayer {
    features: Array<GeoJSON.Feature<AnyGeometry>> = [];

    mesh = [
        new Group(),
        new Group(),
    ];

    constructor(private geojson: GeoJSON.FeatureCollection<AnyGeometry> | GeoJSON.Feature<AnyGeometry>) {
        super();
    }

    onAdd() {
        this.parse(this.geojson);
        this.convert();
    }

    /**
     * Discover features in input data
     * @param input GeoJSON input
     */
    private parse(input: GeoJSON.FeatureCollection<AnyGeometry> | GeoJSON.Feature<AnyGeometry>) {
        if (input.type === 'FeatureCollection') {
            for (const feature of input.features) {
                this.features.push(feature);
            }
        } else if (input.type === 'Feature') {
            this.features.push(input);
        } else {
            throw new Error('No features discovered in GeoJSON input');
        }
    }

    private convert() {
        let shape: any;

        for (const feature of this.features) {
            // this.mesh.add(new PolygonShape(feature as any).mesh());

            if (feature.geometry.type === 'Polygon') {
                shape = new PolygonShape(feature as any);

                this.mesh[0].add(shape.mesh);
                this.mesh[1].add(shape.line);
            } else if (feature.geometry.type === 'MultiPolygon') {
                shape = new MultiPolygonShape(feature as any);

                this.mesh[0].add(shape.mesh);
                this.mesh[1].add(shape.line);
            }


        }
    }
}
