/*
Copyright 2017 Geoloep

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import Evented from './evented';

import MapControls from '../controls/mapControls';
import CRS from '../projection/28992';
import Renderer from '../renderer/renderer';

import { Bounds } from '../geometry/basic';
import GridUtil from '../layer/grid/gridUtil';
import { ILayer } from '../layer/layer';

import { Object3D, Scene, Vector2, Vector3 } from 'three';

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

interface ILayerDesc {
    layer: ILayer;
    order: number;
    scenes: Scene[];
}

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

    private layers: ILayerDesc[] = [];

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

        this.renderer.once('frame', () => {
            this.emit('init');
        });
    }

    addLayer(layer: ILayer) {
        const scenes = this.allocateScenes(layer);

        this.layers.push({
            layer,
            order: this.layers.length,
            scenes,
        });

        this.queueScenes();

        layer.onAdd(this);

        layer.on('update', () => {
            this.renderer.render();
        });

        this.renderer.render();
    }

    removeLayer(layer: ILayer) {
        for (let i = 0; i < this.layers.length; i++) {
            if (this.layers[i].layer === layer) {
                this.layers.splice(i, 1);
                layer.clear();
            }
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

    /**
     * Order layers by their order value
     */
    private get orderedLayers() {
        return this.layers.sort((a, b) => {
            return a.order - b.order;
        });
    }

    /**
     * Add all sublayers of layer to a scene
     * @param layer
     */
    private allocateScenes(layer: ILayer) {
        const layers = 'length' in layer.mesh ? layer.mesh as Object3D[] : [layer.mesh as Object3D];
        const scenes: Scene[] = [];
        let scene: Scene;

        for (const l of layers) {
            scene = new Scene();
            scene.add(l);
            scenes.push(scene);
        }

        return scenes;
    }

    /**
     * Create an array of scenes in the correct render order
     */
    private queueScenes() {
        this.scenes.splice(0);

        for (const layer of this.orderedLayers) {
            for (const scene of layer.scenes) {
                if (this.scenes.indexOf(scene) === -1) {
                    this.scenes.push(scene);
                }
            }
        }
    }

    private bindEvents(evented: Evented, events: string[]) {
        for (const event of events) {
            evented.on(event, () => {
                this.emit(event);
            });
        }
    }
}
