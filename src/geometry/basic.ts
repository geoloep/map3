import { Vector2, Vector3 } from 'three';

export class Bounds {
    topLeft: Vector2;
    bottomRight: Vector2;

    constructor(topLeft: Vector2 | Vector3, bottomRight: Vector2 | Vector3) {
        if ((topLeft as Vector2).width) {
            this.topLeft = (topLeft as Vector2);
        } else {
            this.topLeft = new Vector2(topLeft.x, topLeft.y);
        }

        if ((bottomRight as Vector2).width) {
            this.bottomRight = (bottomRight as Vector2);
        } else {
            this.bottomRight = new Vector2(bottomRight.x, bottomRight.y);
        }
    }
}