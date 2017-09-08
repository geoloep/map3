import { Mesh } from 'three';

import Map from '../core/map';

export interface ILayer {
    mesh: any;

    onAdd(map: Map): void;
}
