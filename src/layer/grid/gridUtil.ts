import Map from '../../core/map';
import Projection from '../../projection/28992';

import { Bounds } from '../../geometry/basic';

import { Vector2, Vector3 } from 'three';

export default class GridUtil {
    constructor(readonly map: Map) {

    }

    visibleTiles(zoom: number) {
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

            // if (x > 30) {
            //     break;
            // }

            for (let y = topLeftTile.y; ; y++) {
                tileBounds.bottomLeft.setY(y * tileSize);
                tileBounds.topRight.setY(y * tileSize + tileSize);

                if (tileBounds.bottom > transformedBounds.top) {
                    break;
                }

                // if (y > 20) {
                //     break;
                // }

                // if (transformedBounds.contains(tileBounds.topLeft)) {
                position.set(x, y, zoom);
                tiles.push(position.clone());
                // } else {
                    // break;
                // }
                // break;
            }
        }

        return tiles;
    }

    private pointToTilePos(point: Vector2, zoom: number) {
        const scale = this.map.projection.resolution(zoom);

        // const transformed = this.map.projection.transform(point);

        // Should be cloned?
        point.divideScalar(scale).divideScalar(this.map.projection.tileSize).floor();

        return new Vector3(point.x, point.y, zoom);
    }

    private tileToBounds(position: Vector3, tileSize: number) {
        // const tileSize = this.map.projection.tileSize * this.map.projection.resolution(position.z);
        // const tileOrigin = this.map.projection.untransform(new Vector2(position.x, position.y).multiplyScalar(this.map.projection.tileSize).multiplyScalar(this.map.projection.resolution(position.z)));
    }
}
