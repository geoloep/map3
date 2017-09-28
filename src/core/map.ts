import Evented from './evented';

import MapControls from '../controls/mapControls';
import CRS from '../projection/28992';
import Renderer from '../renderer/renderer';

import { Bounds } from '../geometry/basic';
import GridUtil from '../layer/grid/gridUtil';
import { ILayer } from '../layer/layer';

import { Vector2, Vector3 } from 'three';

export interface ICustomMapOptions {
    renderer?: Renderer;
    zoomstep?: number;
}

// export interface IMapOptions {
//     controls: MapControls;
//     renderer: Renderer;
//     zoomstep: number;
// }

const defaultOptions = {
    zoomstep: 0.25,
    renderer: Renderer,
    controls: MapControls,
};

export default class Map extends Evented {
    options = defaultOptions;

    renderer: Renderer;
    controls: MapControls;

    projection = new CRS();

    gridUtil = new GridUtil(this);

    private layers: any[] = [];

    constructor(container: string, options?: ICustomMapOptions) {
        super();

        if (options) {
            Object.assign(this.options, options);
        }

        const element: HTMLElement | null = document.getElementById(container);

        if (element !== null) {
            this.renderer = new Renderer(this, element);
        } else {
            throw new Error(`Container ${container} not found`);
        }

        this.controls = new MapControls(this);

        this.bindEvents(this.controls, [
            'movestart',
            'move',
            'moveend',
        ]);
    }

    addLayer(layer: ILayer) {
        layer.zIndex = this.layers.length * 10;
        this.layers.push(layer);
        this.renderer.scene.add(layer.mesh);

        layer.onAdd(this);

        layer.on('update', () => {
            this.renderer.render();
        });

        this.renderer.render();
    }

    removeLayer(layer: any) {
        if (this.layers.indexOf(layer) >= 0) {
            this.layers.splice(this.layers.indexOf(layer), 1);
        }
    }

    get bounds() {
        return this.renderer.bounds;
    }

    get center() {
        return new Vector2(this.renderer.camera.position.x, this.renderer.camera.position.y);
    }

    get horizon() {
        return this.renderer.horizon;
    }

    private bindEvents(evented: Evented, events: string[]) {
        // const cloneEvents = [
        //     'movestart',
        //     'move',
        //     'moveend',
        // ];

        for (const event of events) {
            evented.on(event, () => {
                this.emit(event);
            });
        }
    }
}
