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

import DebugTile from './debugTile';

import { EventEmitter } from 'eventemitter3';
import { ILayer } from '../../layer';

import { Bounds } from '../../../geometry/basic';

import { Group, Mesh, MeshBasicMaterial, PlaneBufferGeometry, TextureLoader, Vector2, Vector3 } from 'three';

export default class Tile extends DebugTile implements ILayer {

    constructor(public position: Vector3, public bounds: Bounds, public image?: string) {
        super(position, bounds);
    }

    async construct() {
        this.geom = new PlaneBufferGeometry(this.bounds.width, this.bounds.height);
        const center = this.bounds.center;

        // Move the top-left corner tot the origin vector
        this.geom.translate(center.x, center.y, 0);

        let material: MeshBasicMaterial | undefined;

        if (this.image) {
            material = await this.imageMaterial(this.image);
        }

        this.tileMesh = new Mesh(this.geom, material);
        this.mesh.add(this.tileMesh);

        this.emit('tileloaded');
    }

    private async imageMaterial(path: string) {
        return new Promise<MeshBasicMaterial>((resolve, reject) => {
            const loader = new TextureLoader();
            loader.crossOrigin = '';

            loader.load(path, (texture) => {
                resolve (new MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    depthTest: false,
                    depthWrite: false,
                }));
            });
        });
    }
}
