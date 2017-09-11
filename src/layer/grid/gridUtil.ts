import Map from '../../core/map';
import Projection from '../../projection/28992';

import { EventEmitter } from 'eventemitter3';

import { Bounds } from '../../geometry/basic';

import { Vector2, Vector3 } from 'three';

export default class GridUtil {
    events = new EventEmitter();

    private tiles: Vector3[];

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

    private calculateTiles() {
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

        const topLeftTile = this.pointToTilePos(transformedBounds.bottomLeft, zoom);

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
    }

    private pointToTilePos(point: Vector2, zoom: number) {
        const scale = this.map.projection.resolution(zoom);

        // Should be cloned?
        point.divideScalar(scale).divideScalar(this.map.projection.tileSize).floor();

        return new Vector3(point.x, point.y, zoom);
    }

    private calculateRes() {
        const distance = this.map.horizon.distanceTo(this.map.renderer.camera.position);
        const fov = this.map.renderer.camera.fov * Math.PI / 180;

        const visibleHeight = 2 * Math.tan( fov / 2 ) * distance;

        return visibleHeight / this.map.renderer.clientHeight ;
    }

    private calculateZoom(res: number) {
        return this.map.projection.zoom(res);
    }
}
