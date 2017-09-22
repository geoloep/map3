import Map from '../../core/map';
import Projection from '../../projection/28992';

import { EventEmitter } from 'eventemitter3';

import { Bounds } from '../../geometry/basic';

import { Matrix3, Vector2, Vector3 } from 'three';

export default class GridUtil {
    events = new EventEmitter();

    private tiles: Vector3[] = [];
    private newTiles: Vector3[] = [];

    private newTarget: Vector3 = new Vector3();

    private splitMatrix = new Matrix3().set(
        2, 0, 0,
        0, 2, 0,
        0, 0, 1,
    );

    private splitOffsets: Vector3[] = [
        new Vector3(0, 0, 1),
        new Vector3(1, 0, 1),
        new Vector3(0, 1, 1),
        new Vector3(1, 1, 1),
    ];

    constructor(readonly map: Map) {
        this.map.events.on('moveend', () => {
            this.calculateTiles();
            const res = this.calculateRes();

            // const zoom = this.map.projection.zoom(res);

            console.log(res);
        });
    }

    get currentTiles() {
        return this.tiles;
    }

    private calculateTilesOld() {
        /*
        const zoom = Math.ceil(this.calculateZoom(this.calculateRes()));

        console.log(zoom);


        const bounds = this.map.bounds.clamp(this.map.projection.bounds);
        const tileSize = this.map.projection.tileSize * this.map.projection.resolution(zoom);

        // Create bounds in transfomed space
        const transformedBounds = new Bounds(
            this.map.projection.transform(bounds.topLeft),
            this.map.projection.transform(bounds.bottomRight),
        );

        const tiles: Vector3[] = [];

        const topLeftTile = this.pointToTilePos(transformedBounds.bottomLeft, zoom, this.newTarget);

        const position = new Vector3();
        const tileBounds = new Bounds(new Vector2(), new Vector2());

        for (let x = topLeftTile.x; ; x++) {
            tileBounds.bottomLeft.setX(x * tileSize);
            tileBounds.topRight.setX(x * tileSize + tileSize);

            if (tileBounds.left > transformedBounds.right) {
                break;
            }

            for (let y = topLeftTile.y; ; y++) {
                tileBounds.bottomLeft.setY(y * tileSize);
                tileBounds.topRight.setY(y * tileSize + tileSize);

                if (tileBounds.bottom > transformedBounds.top) {
                    break;
                }

                position.set(x, y, zoom);
                tiles.push(position.clone());
            }
        }

        this.tiles = tiles;
        this.events.emit('renew');
        */
    }

    private calculateTilesNew() {
        /*
        const zoom = Math.ceil(this.calculateZoom(this.calculateRes()));
        const horizon = this.map.horizon;
        const target = new Vector2(horizon.x, horizon.y);

        let i: number;
        let j: number;


        this.newTiles.splice(0);

        const tileAtZoom = this.newTarget;
        let tileToSplit: Vector3;

        // Start with better startTile
        this.newTiles.push(new Vector3(0, 0, 0));

        // while (true) {
        //     for (let tile of this.newTiles) () {

        //     }
        // }

        // // Break down to horizontile
        for (i = 0; i < zoom; i++) {
            this.pointToTilePos(target, i, tileAtZoom);

            // for (const tile of this.newTiles) {
            //     if (tile.equals(tileAtZoom)) {
            //         this.newTiles.splice(this.newTiles.indexOf(tile), )
            //     }
            // }

            for (j = 0; j < this.newTiles.length; j++) {
                if (this.newTiles[j].equals(tileAtZoom)) {
                    tileToSplit = this.newTiles[j];
                    this.newTiles.splice(j, 1);
                }
            }
        }
*/
    }

    private calculateTiles() {
        let i: number;
        let j: number;

        const bounds = this.map.bounds.clamp(this.map.projection.bounds);

        // Create bounds in transfomed space
        const transformedBounds = new Bounds(
            this.map.projection.transform(bounds.topLeft),
            this.map.projection.transform(bounds.bottomRight),
        );

        // Calculate starting tile
        const startTile = new Vector3();
        const topLeftTile = new Vector3();
        const bottomRightTile = new Vector3();

        for (i = 0; i <= this.map.projection.maxZoom; i++) {
            if (this.pointToTilePos(transformedBounds.topLeft, i, topLeftTile).equals(this.pointToTilePos(transformedBounds.bottomRight, i, bottomRightTile))) {
                startTile.copy(topLeftTile);
            } else {
                break;
            }
        }

        // Break tile down until we reach the horizontile at the right zoomlevel
        const zoom = Math.ceil(this.calculateZoom(this.calculateRes()));
        const horizon = this.map.horizon;
        const target = this.map.projection.transform(new Vector2(horizon.x, horizon.y));
        const tileAtZoom = topLeftTile;
        let tileToSplit: Vector3;

        this.tiles.splice(0);
        this.tiles.push(startTile);

        // Move through the zoomlevels
        for (i = startTile.z; i < zoom; i++) {
            // Set the tile that intersects the target on this zoom level
            this.pointToTilePos(target, i, tileAtZoom);

            // Check all tiles
            for (j = 0; j < this.tiles.length; j++) {
                if (this.tiles[j].equals(tileAtZoom)) {
                    // If the target intersects this tile: split it
                    tileToSplit = this.tiles[j];
                    this.tiles.splice(j, 1);

                    for (const splitTile of this.tileSplit(tileToSplit)) {
                        this.tiles.push(splitTile);
                    }
                }
            }
        }
        console.log(this.tiles.length);
        this.events.emit('renew');
    }

    private pointToTilePos(point: Vector2, zoom: number, target: Vector3) {
        const scale = this.map.projection.resolution(zoom);

        //
        const pos = point.clone().divideScalar(scale).divideScalar(this.map.projection.tileSize).floor();

        return target.set(pos.x, pos.y, zoom);
    }

    private tileSplit(tile: Vector3) {
        tile.applyMatrix3(this.splitMatrix);

        const children: Vector3[] = [
        ];

        for (const offset of this.splitOffsets) {
            children.push(tile.clone().add(offset));
        }

        return children;
    }

    /**
     * Calculte the resolution at the horizon point
     */
    private calculateRes() {
        const distance = this.map.horizon.distanceTo(this.map.renderer.camera.position);
        const fov = this.map.renderer.camera.fov * Math.PI / 180;

        const visibleHeight = 2 * Math.tan(fov / 2) * distance;

        return visibleHeight / this.map.renderer.clientHeight;
    }

    /**
     * Calculate the zoomlevel corrosponding to the input resolution
     * @param res resolution
     */
    private calculateZoom(res: number) {
        return this.map.projection.zoom(res);
    }
}
