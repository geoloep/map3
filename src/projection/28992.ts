// import { Point } from '../geometry/basic';

import { Vector2 } from 'three';

export default class RD {
    tileSize = 256;
    // tileHeight = 256;

    topLeft = new Vector2(-285401.920, 903401.920);
    bottomRight = new Vector2(595401.920, 22598.080);

    zeroScale = 3440.640;

    constructor() {
    }

    resolution(zoom: number) {
        return (this.zeroScale * Math.pow(0.5, zoom));
    }
}
