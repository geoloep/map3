import DebugTile from './debugTile';

import { EventEmitter } from 'eventemitter3';
import { ILayer } from '../../layer';

import { Bounds } from '../../../geometry/basic';

import { Group, Mesh, MeshBasicMaterial, PlaneBufferGeometry, TextureLoader, Vector2, Vector3 } from 'three';

export default class Tile extends DebugTile implements ILayer {

    constructor(public position: Vector3, public bounds: Bounds, zIndex: number, public image?: string) {
        super(position, bounds, zIndex);
    }

    async construct() {
        this.geom = new PlaneBufferGeometry(this.bounds.width, this.bounds.height);
        const center = this.bounds.center;

        // Move the top-left corner tot the origin vector
        this.geom.translate(center.x, center.y, 0);

        let material: MeshBasicMaterial | undefined;

        if (this.image) {
            material = await this.imageMaterial(this.image);
            // console.log(material.polygonOffsetUnits);
        }

        this.tileMesh = new Mesh(this.geom, material);

        // this.tileMesh.renderOrder = this.zIndex;
        // this.mesh.renderOrder = this.zIndex;
        // this.tileMesh.onBeforeRender = ( renderer: any ) => { renderer.clearDepth(); };
        

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
                    transparent: true,
                    // depthWrite: false,
                    // depthTest: false,
                    // polygonOffset: false,
                    // polygonOffsetFactor: this.zIndex * -10,
                    // polygonOffsetUnits: 10,
                }));
            });
        });
    }
}
