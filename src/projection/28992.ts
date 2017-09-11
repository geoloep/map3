import { Bounds } from '../geometry/basic';
import { Vector2 } from 'three';

export default class RD {
    tileSize = 256;
    // tileHeight = 256;

    // bounds = new Bounds(
    //     new Vector2(-285401.920, 903401.920),
    //     new Vector2(595401.920, 22598.080),
    // );

    bounds = new Bounds(
        new Vector2(-285401.920, 22598.080),
        new Vector2(595401.920, 903401.920),
    );

    tileOrigin = new Vector2(-285401.920, 903401.920);

    zeroScale = 3440.640;

    constructor() {
    }

    resolution(zoom: number) {
        return (this.zeroScale * Math.pow(0.5, zoom));
    }

    zoom(resolution: number) {
        return Math.log(resolution / this.zeroScale) / (Math.log(0.5));
    }

    transform(point: Vector2) {
        return new Vector2(
            point.x - this.tileOrigin.x,
            this.tileOrigin.y - point.y,
        );
    }

    untransform(point: Vector2) {
        return new Vector2(
            point.x + this.tileOrigin.x,
            this.tileOrigin.y - point.y,
        );
    }
}
