import Renderer from './renderer/renderer';

export interface IMapOptions {
    renderer: Renderer;
}

const defaultOptions = {
}

export default class Map {
    options: IMapOptions;

    renderer: Renderer;

    private layers: any[];

    constructor(container: string, options?: IMapOptions) {
        const element: HTMLElement | null = document.getElementById(container);

        if (element !== null) {
            this.renderer = new Renderer(element);
        } else {
            throw new Error(`Container ${container} not found`);
        }
    }

    addLayer(layer: any) {
        this.layers.push(layer);
    }

    removeLayer(layer: any) {
        if (this.layers.indexOf(layer) >= 0) {
            this.layers.splice(this.layers.indexOf(layer), 1);
        }
    }
}
