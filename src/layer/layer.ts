import { EventEmitter } from 'eventemitter3';
import { Mesh } from 'three';

import Map from '../core/map';

export interface ILayer {
    events: EventEmitter;

    mesh: any;

    onAdd(map: Map): void;
}
