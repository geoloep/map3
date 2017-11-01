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

import Evented from '../../../core/evented';

import { EventEmitter } from 'eventemitter3';
import { ILayer } from '../../layer';

import { Bounds } from '../../../geometry/basic';

import { Group, Mesh, MeshBasicMaterial, PlaneBufferGeometry, TextureLoader, Vector2, Vector3 } from 'three';

export default class Tile extends Evented implements ILayer {
    mesh = new Group();

    protected geom: PlaneBufferGeometry;
    protected tileMesh: Mesh;

    protected options = {
        zIndex: 0,
    };

    constructor(public position: Vector3, public bounds: Bounds) {
        super();

        // this.zIndex = zIndex;
    }

    get zIndex() {
        return this.options.zIndex;
    }

    set zIndex(zIndex: number) {
        this.options.zIndex = zIndex;
    }

    // tslint:disable-next-line:no-empty
    onAdd() {
    }

    async construct() {
        await new Promise((resolve, reject) => {
            window.setTimeout(() => {
                this.geom = new PlaneBufferGeometry(this.bounds.width, this.bounds.height);
                const center = this.bounds.center;

                this.geom.translate(center.x, center.y, 0);

                this.tileMesh = new Mesh(this.geom, this.material());

                this.mesh.add(this.tileMesh);

                this.emit('tileloaded');

                resolve();
            }, Math.random() * 2000);
        });
    }

    material() {
        return new MeshBasicMaterial({
            color: Math.random() * 0xffffff,
            depthTest: false,
            depthWrite: false,
        });
    }
}
