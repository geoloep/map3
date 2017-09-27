import { Mesh } from 'three';

import Evented from '../core/evented';

import Map from '../core/map';

export interface ILayer extends Evented {
    mesh: any;

    onAdd(map: Map): void;
}
