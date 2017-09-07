import { ILayer } from '../layer';

import { Mesh, Vector2, PlaneBufferGeometry } from 'three';

export default class Tile implements ILayer {
    mesh: Mesh;

    private geom: PlaneBufferGeometry;

    constructor(origin: Vector2, size: Vector2) {
        this.geom = new PlaneBufferGeometry(size.x, size.y);
        this.geom.translate(origin.x, origin.y, 0);

        this.mesh = new Mesh(this.geom);
    }

    onAdd() {

    }
}
