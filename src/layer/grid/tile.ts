import { EventEmitter } from 'eventemitter3';
import { ILayer } from '../layer';

import { Group, Mesh, MeshBasicMaterial, PlaneBufferGeometry, TextureLoader, Vector2 } from 'three';

export default class Tile implements ILayer {
    events = new EventEmitter();

    mesh = new Group();

    private geom: PlaneBufferGeometry;
    private tileMesh: Mesh;

    constructor(public origin: Vector2, public size: number, public image?: string) {
        this.constructTile();
    }

    private async constructTile() {
        this.geom = new PlaneBufferGeometry(this.size, this.size);

        // Move the top-left corner tot the origin vector
        this.geom.translate(this.origin.x + this.size * 0.5, this.origin.y - this.size * 0.5, 0);

        let material: MeshBasicMaterial | undefined;

        if (this.image) {
            material = await this.imageMaterial(this.image);
        }

        this.tileMesh = new Mesh(this.geom, material);
        this.mesh.add(this.tileMesh);

        this.events.emit('tileloaded');
    }

    private async imageMaterial(path: string) {
        return new Promise<MeshBasicMaterial>((resolve, reject) => {
            const loader = new TextureLoader();
            loader.crossOrigin = '';

            loader.load(path, (texture) => {
                resolve (new MeshBasicMaterial({
                    map: texture,
                }));
            });
        });
    }

    onAdd() {

    }
}
