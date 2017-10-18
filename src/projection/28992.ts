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
import { Bounds } from '../geometry/basic';

export default class RD {
    tileSize = 256;
    maxZoom = 14;

    bounds = new Bounds(
        new Vector2(-285401.920, 22598.080),
        new Vector2(595401.920, 903401.920),
    );

    tileOrigin = new Vector2(-285401.920, 903401.920);

    zeroScale = 3440.640;

    resolution(zoom: number) {
        return (this.zeroScale * Math.pow(0.5, zoom));
    }

    zoom(resolution: number) {
        return Math.log(resolution / this.zeroScale) / (Math.log(0.5));
    }

    transform(point: Vector2 | Vector3) {
        return new Vector2(
            point.x - this.tileOrigin.x,
            this.tileOrigin.y - point.y,
        );
    }

    untransform(point: Vector2 | Vector3) {
        return new Vector2(
            point.x + this.tileOrigin.x,
            this.tileOrigin.y - point.y,
        );
    }
}
