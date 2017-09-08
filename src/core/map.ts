import CRS from '../projection/28992';
import Renderer from '../renderer/renderer';

import { Bounds } from '../geometry/basic';
import GridUtil from '../layer/grid/gridUtil';
import { ILayer } from '../layer/layer';

import { Vector2 } from 'three';


export interface IMapOptions {
    renderer: Renderer;
}

const defaultOptions = {
}

export default class Map {
    options: IMapOptions;

    renderer: Renderer;
    projection = new CRS();

    gridUtil = new GridUtil(this);

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

    get bounds() {
        return this.renderer.getBounds();
    }

    get center() {
        return new Vector2(this.renderer.camera.position.x, this.renderer.camera.position.y);
    }
}
