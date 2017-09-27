import { Mesh } from 'three';

import Evented from '../core/evented';

import Map from '../core/map';

export interface ILayer extends Evented {
    mesh: any;
    zIndex: number;

    onAdd(map: Map): void;
}
