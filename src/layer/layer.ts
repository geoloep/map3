import { Group, Mesh } from 'three';

import Evented from '../core/evented';

import Map from '../core/map';

export interface ILayer extends Evented {
    mesh: Mesh | Group;
    zIndex: number;

    onAdd(map: Map): void;
}
