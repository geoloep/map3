import Renderer from './renderer/renderer';
export interface IMapOptions {
    renderer: Renderer;
}
export default class Map {
    options: IMapOptions;
    renderer: Renderer;
    private layers;
    constructor(container: string, options?: IMapOptions);
    addLayer(layer: any): void;
    removeLayer(layer: any): void;
}
