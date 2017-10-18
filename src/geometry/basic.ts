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
        return ((other.topRight.x >= this.bottomLeft.x) && (other.bottomLeft.x <= this.topRight.x)) && ((other.topRight.y >= this.bottomLeft.y) && (other.bottomLeft.y <= this.topRight.y));
    }
}
