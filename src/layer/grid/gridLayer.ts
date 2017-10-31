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

import Evented from '../../core/evented';

import { ILayer } from '../layer';

import Map from '../../core/map';

import { Group, Vector2, Vector3 } from 'three';

import { ITileDescriptor } from './gridUtil';
import Tile from './tiles/debugTile';

export interface ITileIndex {
    pos: Vector3;
    tile: Tile;
}

export interface IGridLayerCustomOptions {
    zIndex?: number;
}

export default class GridLayer extends Evented implements ILayer {
    map: Map;

    mesh = new Group();

    protected tiles: ITileIndex[] = [];
    protected tilesLoading: ITileIndex[] = [];
    protected tilesDeleting: ITileIndex[] = [];

    protected cacheLimit = 100;
    protected tileCache: ITileIndex[] = [];

    protected options = {
        zIndex: 0,
    };

    constructor(options?: IGridLayerCustomOptions) {
        super();
    }

    createTiles() {
        const tiles = this.map.gridUtil.currentTiles;

        this.compareTiles(tiles);
    }

    onAdd(map: Map) {
        this.map = map;

        this.createTiles();

        this.map.gridUtil.on('renew', () => {
            this.purgeTiles();
            this.createTiles();
        });

    }

    get zIndex() {
        return this.options.zIndex;
    }

    set zIndex(zIndex: number) {
        this.options.zIndex = zIndex;
        // this.mesh.renderOrder = zIndex;
    }

    protected constructTile(description: ITileDescriptor) {
        return new Tile(description.pos, description.bounds);
    }

    private createTile(description: ITileDescriptor) {
        const tile = this.constructTile(description);

        const tileIndex = {
            pos: description.pos,
            tile,
        };

        this.tilesLoading.push(tileIndex);
        this.mesh.add(tile.mesh);

        tile.once('tileloaded', () => {
            this.emit('update');

            this.tiles.push(this.tilesLoading.splice(this.tilesLoading.indexOf(tileIndex), 1)[0]);
        });

        return tile.construct();
    }

    private restoreTile(tile: ITileIndex) {
        this.tileCache.splice(this.tileCache.indexOf(tile), 1);

        // tile.tile.zIndex = this.zIndex + .01;
        this.mesh.add(tile.tile.mesh);
        this.tiles.push(tile);

        this.emit('update');
    }

    private async addTiles(tiles: ITileDescriptor[]) {
        let inCache: ITileIndex | undefined;
        const constructors: Array<Promise<void>> = [];

        for (const tile of tiles) {
            inCache = this.tileInCache(tile.pos);

            if (inCache) {
                this.restoreTile(inCache);
            } else {
                constructors.push(this.createTile(tile));
            }
        }

        await Promise.all(constructors);
    }

    private purgeTiles() {
        let tile: ITileIndex;

        while (this.tilesDeleting.length > 0) {
            tile = (this.tilesDeleting.pop() as ITileIndex);

            this.mesh.remove(tile.tile.mesh);
            this.emit('update');

            this.tileCache.push(tile);
        }
    }

    private truncateCache() {
        for (const tile of this.tilesDeleting) {
            this.mesh.remove(tile.tile.mesh);

        }
    }

    /**
     * Tag tiles to be removed
     * @param tiles
     */
    private removeTiles(tiles: ITileIndex[]) {
        for (const tile of tiles) {
            // tile.tile.zIndex = this.options.zIndex;
            this.emit('update');

            this.tilesDeleting.push(this.tiles.splice(this.tiles.indexOf(tile), 1)[0]);
        }
    }

    private async compareTiles(target: ITileDescriptor[]) {
        const toAdd = target.filter((x) => {
            return !this.tileExists(x);
        });

        const toRemove: ITileIndex[] = [];

        ex: for (const existing of this.tiles) {
            for (const n of target) {
                if (existing.pos.equals(n.pos)) {
                    continue ex;
                }
            }
            toRemove.push(existing);
        }

        this.removeTiles(toRemove);
        await this.addTiles(toAdd);
        this.purgeTiles();
        this.truncateCache();
    }

    private tileExists(tilePos: ITileDescriptor) {
        for (const existing of this.tiles) {
            if (existing.pos.equals(tilePos.pos)) {
                return true;
            }
        }
        return false;
    }

    private tileInCache(tilePos: Vector3) {
        for (const existing of this.tileCache) {
            if (existing.pos.equals(tilePos)) {
                return existing;
            }
        }
    }
}
