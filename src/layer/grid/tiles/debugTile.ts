import Evented from '../../../core/evented';

import { EventEmitter } from 'eventemitter3';
import { ILayer } from '../../layer';

import { Bounds } from '../../../geometry/basic';

import { Group, Mesh, MeshBasicMaterial, PlaneBufferGeometry, TextureLoader, Vector2, Vector3 } from 'three';

export default class Tile extends Evented implements ILayer {
    mesh = new Group();

    protected geom: PlaneBufferGeometry;
    protected tileMesh: Mesh;

    protected options = {
        zIndex: 0,
    };

    constructor(public position: Vector3, public bounds: Bounds, zIndex: number) {
        super();

        this.options.zIndex = zIndex;
    }

    get zIndex() {
        return this.options.zIndex;
    }

    set zIndex(zIndex: number) {
        console.log(this.tileMesh.material.polygonOffsetFactor, zIndex);
        this.options.zIndex = zIndex;
        this.tileMesh.material.polygonOffsetFactor = -zIndex;
    }

    // tslint:disable-next-line:no-empty
    onAdd() {
    }

    async construct() {
        await new Promise((resolve, reject) => {
            window.setTimeout(() => {
                this.geom = new PlaneBufferGeometry(this.bounds.width, this.bounds.height);
                const center = this.bounds.center;

                this.geom.translate(center.x, center.y, 0);

                this.tileMesh = new Mesh(this.geom, this.material());

                this.mesh.add(this.tileMesh);

                this.emit('tileloaded');

                resolve();
            }, Math.random() * 2000);
        });
    }

    material() {
        return new MeshBasicMaterial({
            color: Math.random() * 0xffffff,
            polygonOffset: true,
            polygonOffsetFactor: -this.zIndex,
            // polygonOffsetUnits: -10,
        });
    }
}
