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

import Map from '../../core/map';
import Projection from '../../projection/28992';

import { EventEmitter } from 'eventemitter3';

import { Bounds } from '../../geometry/basic';

import { Matrix3, Vector2, Vector3 } from 'three';

export interface ITileDescriptor {
    pos: Vector3;
    bounds: Bounds;
}

export default class GridUtil extends Evented {
    private tiles: ITileDescriptor[] = [];
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
        super();

        this.map.on('init', () => {
            this.calculateTiles();
        });

        this.map.on('moveend', () => {
            this.calculateTiles();
        });
    }

    get currentTiles() {
        return this.tiles;
    }

    private calculateTiles() {
        if (this.map.renderer.topDown) {
            this.calculateTilesTopDown();
        } else {
            this.calculateTilesPitched();
        }
    }

    private calculateTilesTopDown() {
        // let i: number;
        // let j: number;

        const bounds = this.map.bounds.clamp(this.map.projection.bounds);
        const zoom =  Math.ceil(this.calculateZoom(this.horizonResolution()));

        // Create bounds in transfomed space
        const transformedBounds = new Bounds(
            this.map.projection.transform(bounds.topLeft),
            this.map.projection.transform(bounds.bottomRight),
        );

        const topLeftTile = new Vector3();
        const bottomRightTile = new Vector3();

        this.pointToTilePos(transformedBounds.topLeft, zoom, topLeftTile);
        this.pointToTilePos(transformedBounds.bottomRight, zoom, bottomRightTile);

        this.tiles.splice(0);

        let newPos: Vector3;

        for (let i = topLeftTile.x; i <= bottomRightTile.x; i++) {
            for (let j = bottomRightTile.y; j <= topLeftTile.y; j++) {
                newPos = new Vector3(i, j, zoom);

                this.tiles.push({
                    pos: newPos,
                    bounds: this.calculateBounds(newPos),
                });
            }
        }

        console.log(this.tiles.length);
        this.emit('renew');
    }

    private calculateTilesPitched() {
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
        const zoom = Math.ceil(this.calculateZoom(this.horizonResolution()));
        const horizon = this.map.horizon;
        const target = this.map.projection.transform(new Vector2(horizon.x, horizon.y));
        const tileAtZoom = topLeftTile;
        let tileToSplit: Vector3;

        this.newTiles.splice(0);
        this.newTiles.push(startTile);

        // Move through the zoomlevels
        for (i = startTile.z; i < zoom; i++) {
            // Set the tile that intersects the target on this zoom level
            this.pointToTilePos(target, i, tileAtZoom);

            // Check all tiles
            for (j = 0; j < this.newTiles.length; j++) {
                if (this.newTiles[j].equals(tileAtZoom)) {
                    // If the target intersects this tile: split it
                    tileToSplit = this.newTiles[j];
                    this.newTiles.splice(j, 1);

                    for (const splitTile of this.tileSplit(tileToSplit)) {
                        this.newTiles.push(splitTile);
                    }
                }
            }
        }

        let checkTile: Vector3;
        let distance: number;
        let center: Vector2;
        let tileBounds: Bounds;
        const center3 = new Vector3();
        const ratio = this.resolutionRatio();

        this.tiles.splice(0);

        // check all new tiles
        while (this.newTiles.length > 0) {
            checkTile = (this.newTiles.pop() as Vector3);
            tileBounds = this.calculateBounds(checkTile);

            // Discard if outside bounds
            if (bounds.intersects(tileBounds)) {
                center = this.tileToPoint(checkTile);
                center3.set(center.x, center.y, 0);

                distance = this.map.renderer.camera.position.distanceTo(center3);

                if (this.map.projection.zoom(this.resolution(ratio, distance)) > checkTile.z) {
                    // Split tile if it's to close to the camera
                    for (const t of this.tileSplit(checkTile)) {
                        this.newTiles.push(t);
                    }
                } else {
                    // We can push the tile to the final stack
                    this.tiles.push({
                        pos: checkTile,
                        bounds: tileBounds,
                    });
                }
            }
        }

        console.log(this.tiles.length);
        this.emit('renew');
    }

    private pointToTilePos(point: Vector2, zoom: number, target: Vector3) {
        const scale = this.map.projection.resolution(zoom);

        const pos = point.clone().divideScalar(scale).divideScalar(this.map.projection.tileSize).floor();

        return target.set(pos.x, pos.y, zoom);
    }

    /**
     * Return the center coordinates of the tile in untransformed(!) space
     * @param tile
     */
    private tileToPoint(tile: Vector3) {
        return this.map.projection.untransform(tile.clone().multiplyScalar(this.map.projection.tileSize).addScalar(0.5 * this.map.projection.tileSize).multiplyScalar(this.map.projection.resolution(tile.z)));
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
     * Calculate the distance to resolution ratio
     */
    private resolutionRatio() {
        const fov = this.map.renderer.camera.fov * Math.PI / 180;
        return 2 * Math.tan(fov / 2);
    }

    /**
     * Calculate the resolution at the horizon
     */
    private horizonResolution() {
        return this.resolution(this.resolutionRatio(), this.map.horizon.distanceTo(this.map.renderer.camera.position));
    }

    /**
     * Calculate the resolution at the given distance
     */
    private resolution(ratio: number, distance: number) {
        const visibleHeight = ratio * distance;

        return visibleHeight / this.map.renderer.clientHeight;
    }

    /**
     * Calculate the zoomlevel corrosponding to the input resolution
     * @param resolution
     */
    private calculateZoom(resolution: number) {
        return this.map.projection.zoom(resolution);
    }

    private calculateBounds(position: Vector3) {
        const scale = this.map.projection.resolution(position.z);

        const topLeft = this.map.projection.untransform(new Vector2(position.x, position.y).multiplyScalar(this.map.projection.tileSize).multiplyScalar(scale));
        const bottomRight = new Vector2(topLeft.x + this.map.projection.tileSize * scale, topLeft.y - this.map.projection.tileSize * scale);

        return new Bounds(
            new Vector2(topLeft.x, bottomRight.y),
            new Vector2(bottomRight.x, topLeft.y),
        );
    }
}
