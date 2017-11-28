import Evented from '../core/evented';

import { ILayer } from './layer';

import { Group, Mesh } from 'three';

export default class GeoJsonLayer extends Evented implements ILayer {
    mesh = new Group();
    constructor() {
        super();
    }

    add(mesh: Mesh) {
        this.mesh.add(mesh);
    }

    onAdd() {
    }
}
