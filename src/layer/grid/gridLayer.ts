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

export default class GridLayer extends Evented implements ILayer {
    map: Map;

    mesh = new Group();

    private tiles: ITileIndex[] = [];

    private cacheLimit = 100;
    private tileCache: ITileIndex[] = [];

    constructor(readonly urlTemplate: string) {
        super();
    }

    createTiles() {
        const tiles = this.map.gridUtil.currentTiles;

        this.compareTiles(tiles);
    }

    onAdd(map: Map) {
        this.map = map;

        this.map.gridUtil.events.on('renew', () => {
            this.createTiles();
        });

    }

    private createTile(description: ITileDescriptor) {
        const tile = new Tile(description.pos, description.bounds, this.imageUrl(description.pos));

        tile.events.once('tileloaded', () => {
            this.emit('update');
        });

        this.mesh.add(tile.mesh);
        this.tiles.push({
            pos: description.pos,
            tile,
        });
    }

    private restoreTile(tile: ITileIndex) {
        this.tileCache.splice(this.tileCache.indexOf(tile), 1);

        this.mesh.add(tile.tile.mesh);
        this.tiles.push(tile);

        this.emit('update');
    }

    private addTiles(tiles: ITileDescriptor[]) {
        let inCache: ITileIndex | undefined;
        for (const tile of tiles) {
            inCache = this.tileInCache(tile.pos);

            if (inCache) {
                this.restoreTile(inCache);
            } else {
                this.createTile(tile);
            }
        }
    }

    private removeTiles(tiles: ITileIndex[]) {
        for (const tile of tiles) {
            this.mesh.remove(tile.tile.mesh);
            this.tileCache.push(this.tiles.splice(this.tiles.indexOf(tile), 1)[0]);
        }

        if (this.tileCache.length > this.cacheLimit) {
            this.tileCache.splice(0, this.tileCache.length - this.cacheLimit);
        }
    }

    private compareTiles(target: ITileDescriptor[]) {
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

        this.addTiles(toAdd);
        this.removeTiles(toRemove);
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

    private imageUrl(position: Vector3) {
        return this.urlTemplate.replace('{x}', position.x.toString(10)).replace('{y}', position.y.toString(10)).replace('{z}', position.z.toString(10));
    }
}
