import { ILayer } from '../layer';

import Map from '../../core/map';

import { Group, Vector2, Vector3 } from 'three';

import Tile from './tile';

export interface ITileIndex {
    pos: Vector3;
    tile: Tile;
}

export default class GridLayer implements ILayer {
    map: Map;

    mesh = new Group();

    // private tiles: {[index: number]: {[index: number]: {[index: number]: Tile}}};
    private tiles: ITileIndex[] = [];

    constructor(readonly urlTemplate: string) {
        // const geom = new PlaneBufferGeometry(100000, 100000);

        // geom.translate(142892.19, 470783.87, 0);
    }

    createTiles(zoom: number) {
        const tiles = this.map.gridUtil.visibleTiles(zoom);

        this.compareTiles(tiles);
    }

    onAdd(map: Map) {
        this.map = map;

        this.createTiles(5);
    }

    private addTile(position: Vector3) {
        const scale = this.map.projection.resolution(position.z);

        const tileSize = this.map.projection.tileSize * scale;
        const tileOrigin = this.map.projection.untransform(new Vector2(position.x, position.y).multiplyScalar(this.map.projection.tileSize).multiplyScalar(scale));

        const tile = new Tile(tileOrigin, tileSize, this.imageUrl(position));
        this.mesh.add(tile.mesh);
        this.tiles.push({
            pos: position,
            tile,
        });
    }

    private addTiles(tiles: Vector3[]) {
        for (const position of tiles) {
            this.addTile(position);
        }
    }

    private compareTiles(target: Vector3[]) {
        const toAdd = target.filter((x) => {
            return !this.tileExists(x);
        });

        this.addTiles(toAdd);
    }

    private tileExists(tilePos: Vector3) {
        for (const existing of this.tiles) {
            if (existing.pos.equals(tilePos)) {
                return true;
            }
        }
        return false;
    }

    private imageUrl(position: Vector3) {
        return this.urlTemplate.replace('{x}', position.x.toString(10)).replace('{y}', position.y.toString(10)).replace('{z}', position.z.toString(10));
    }
}
