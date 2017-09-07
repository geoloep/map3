import CRS from './projection/28992';
import Renderer from './renderer/renderer';

import { ILayer } from './layer/layer';

import { Bounds } from './geometry/basic';

export interface IMapOptions {
    renderer: Renderer;
}

const defaultOptions = {
}

export default class Map {
    options: IMapOptions;

    renderer: Renderer;
    projection = new CRS();

    private layers: any[] = [];

    constructor(container: string, options?: IMapOptions) {
        const element: HTMLElement | null = document.getElementById(container);

        if (element !== null) {
            this.renderer = new Renderer(element);
        } else {
            throw new Error(`Container ${container} not found`);
        }
    }

    addLayer(layer: ILayer) {
        this.layers.push(layer);
        this.renderer.scene.add(layer.mesh);

        layer.onAdd(this);

        this.renderer.render();
    }

    removeLayer(layer: any) {
        if (this.layers.indexOf(layer) >= 0) {
            this.layers.splice(this.layers.indexOf(layer), 1);
        }
    }

    getBounds() {
        return this.renderer.getBounds();
    }
}
