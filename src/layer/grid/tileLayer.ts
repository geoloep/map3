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

import gridLayer, { IGridLayerCustomOptions } from './gridLayer';
import { ITileDescriptor } from './gridUtil';

import ImageTile from './tiles/imageTile';

import { Vector3 } from 'three';

export default class TileLayer extends gridLayer {
    constructor(public urlTemplate: string, options?: IGridLayerCustomOptions) {
        super(options);
    }

    protected constructTile(description: ITileDescriptor) {
        return new ImageTile(description.pos, description.bounds, this.imageUrl(description.pos));
    }

    private imageUrl(position: Vector3) {
        return this.urlTemplate.replace('{x}', position.x.toString(10)).replace('{y}', position.y.toString(10)).replace('{z}', position.z.toString(10));
    }
}
