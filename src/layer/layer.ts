import { Mesh } from 'three';

import Map from '../map';

export interface ILayer {
    mesh: any;

    onAdd(map: Map): void;
}
