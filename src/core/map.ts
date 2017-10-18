import Evented from './evented';

import MapControls from '../controls/mapControls';
import CRS from '../projection/28992';
import Renderer from '../renderer/renderer';

import { Bounds } from '../geometry/basic';
import GridUtil from '../layer/grid/gridUtil';
import { ILayer } from '../layer/layer';

import { Scene, Vector2, Vector3 } from 'three';

export interface ICustomMapOptions {
    renderer?: Renderer;
    zoomstep?: number;
    zoom?: number;
}

// export interface IMapOptions {
//     controls: MapControls;
//     renderer: Renderer;
//     zoomstep: number;
// }

const defaultOptions = {
    zoomstep: 0.25,
    zoom: 0,
    renderer: Renderer,
    controls: MapControls,
};

export default class Map extends Evented {
    container: HTMLElement;

    options = defaultOptions;

    renderer: Renderer;
    controls: MapControls;

    projection = new CRS();

    gridUtil = new GridUtil(this);

    scenes: Scene[] = [];

    private layers: any[] = [];

    constructor(readonly containerName: string, options?: ICustomMapOptions) {
        super();

        if (options) {
            Object.assign(this.options, options);
        }

        const element: HTMLElement | null = document.getElementById(containerName);

        if (element !== null) {
            this.container = element;
            this.renderer = new Renderer(this);
        } else {
            throw new Error(`Container ${containerName} not found`);
        }

        this.controls = new MapControls(this);

        this.bindEvents(this.controls, [
            'movestart',
            'move',
            'moveend',
        ]);
    }

    addLayer(layer: ILayer) {
        this.layers.push(layer);

        const scene = new Scene();
        scene.add(layer.mesh);
        this.scenes.push(scene);

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

    get zoom() {
        return this.options.zoom;
    }

    set zoom(zoom: number) {
        this.options.zoom = zoom;
        this.renderer.zoom = zoom;
    }

    private bindEvents(evented: Evented, events: string[]) {
        for (const event of events) {
            evented.on(event, () => {
                this.emit(event);
            });
        }
    }
}
