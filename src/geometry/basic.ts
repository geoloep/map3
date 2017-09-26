import { Vector2, Vector3 } from 'three';

export class Bounds {
    bottomLeft: Vector2;
    topRight: Vector2;

    constructor(bottomLeft: Vector2 | Vector3, topRight: Vector2 | Vector3) {
        if ((bottomLeft as any).isVector2) {
            this.bottomLeft = (bottomLeft as Vector2);
        } else {
            this.bottomLeft = new Vector2(bottomLeft.x, bottomLeft.y);
        }

        if ((topRight as any).isVector2) {
            this.topRight = (topRight as Vector2);
        } else {
            this.topRight = new Vector2(topRight.x, topRight.y);
        }
    }

    get topLeft() {
        return new Vector2(this.bottomLeft.x, this.topRight.y);
    }

    get bottomRight() {
        return new Vector2(this.topRight.x, this.bottomLeft.y);
    }

    get left() {
        return this.bottomLeft.x;
    }

    get right() {
        return this.topRight.x;
    }

    get top() {
        return this.topRight.y;
    }

    get bottom() {
        return this.bottomLeft.y;
    }

    get height() {
        return this.topRight.x - this.bottomLeft.x;
    }

    get width() {
        return this.topRight.y - this.bottomLeft.y;
    }

    get center() {
        return this.bottomLeft.clone().add(new Vector2(this.width / 2, this.height / 2));
    }

    clamp(otherBounds: Bounds) {
        return new Bounds(
            this.bottomLeft.clone().clamp(otherBounds.bottomLeft, otherBounds.topRight),
            this.topRight.clone().clamp(otherBounds.bottomLeft, otherBounds.topRight),
        );
    }

    contains(point: Vector2) {
        return point.x >= this.bottomLeft.x && point.x <= this.topRight.x && point.y >= this.bottomLeft.y && point.y <= this.topRight.y;
    }

    intersects(other: Bounds) {
        // return (other.left > this.left && this.left < other.right) || (other.left < this.right && this.right) || (other.bottom < this.bottom && other.bottom < this.top) || (other.top > this.bottom)
        return ((other.left < this.right && other.left > this.left) || (other.right > this.left && other.right < this.right)) && ((other.top > this.bottom && other.top < this.top) || (other.bottom < this.top && other.bottom > this.bottom));
    }
}
