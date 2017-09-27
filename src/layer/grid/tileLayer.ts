import gridLayer, { IGridLayerCustomOptions } from './gridLayer';
import { ITileDescriptor } from './gridUtil';

import ImageTile from './tiles/imageTile';

import { Vector3 } from 'three';

export default class TileLayer extends gridLayer {
    constructor(public urlTemplate: string, options?: IGridLayerCustomOptions) {
        super(options);
    }

    protected constructTile(description: ITileDescriptor) {
        return new ImageTile(description.pos, description.bounds, this.options.zIndex, this.imageUrl(description.pos));
    }

    private imageUrl(position: Vector3) {
        return this.urlTemplate.replace('{x}', position.x.toString(10)).replace('{y}', position.y.toString(10)).replace('{z}', position.z.toString(10));
    }
}
