import Evented from '../../../core/evented';

import { EventEmitter } from 'eventemitter3';
import { ILayer } from '../../layer';

import { Bounds } from '../../../geometry/basic';

import { Group, Mesh, MeshBasicMaterial, PlaneBufferGeometry, TextureLoader, Vector2, Vector3 } from 'three';

export default class Tile extends Evented {
    mesh = new Group();

    private geom: PlaneBufferGeometry;
    private tileMesh: Mesh;

    constructor(public position: Vector3, public bounds: Bounds, public image?: string) {
        super();

        this.constructTile();
    }

    private async constructTile() {
        this.geom = new PlaneBufferGeometry(this.bounds.width, this.bounds.height);
        const center = this.bounds.center;

        // Move the top-left corner tot the origin vector
        // this.geom.translate(this.origin.x + this.size * 0.5, this.origin.y - this.size * 0.5, 0);
        // this.geom.translate(this.bounds.bottomLeft.x + this.bounds.width * 0.5, this.origin.y - this.size * 0.5, 0);
        this.geom.translate(center.x, center.y, 0);
        // this.geom.

        let material: MeshBasicMaterial | undefined;

        if (this.image) {
            material = await this.imageMaterial(this.image);
        }

        this.tileMesh = new Mesh(this.geom, undefined);
        // this.tileMesh.position.set(center.x, center.y, 0);
        this.mesh.add(this.tileMesh);

        this.emit('tileloaded');
    }

    private async imageMaterial(path: string) {
        return new Promise<MeshBasicMaterial>((resolve, reject) => {
            const loader = new TextureLoader();
            loader.crossOrigin = '';

            loader.load(path, (texture) => {
                resolve (new MeshBasicMaterial({
                    map: texture,
                    polygonOffset: true,
                    polygonOffsetFactor: 0.5,
                }));
            });
        });
    }
}
