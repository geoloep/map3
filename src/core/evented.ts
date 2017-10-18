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

import { EventEmitter } from 'eventemitter3';

export default class Evented {
    private events = new EventEmitter();

    on = (event: string | symbol, fn: EventEmitter.ListenerFn, context?: any): EventEmitter => {
        return this.events.on(event, fn, context);
    }

    once = (event: string | symbol, fn: EventEmitter.ListenerFn, context?: any): EventEmitter => {
        return this.events.once(event, fn, context);
    }

    emit = (event: string | symbol, ...args: any[]): boolean => {
        return this.events.emit(event, ...args);
    }

    off = (event: string | symbol, fn?: EventEmitter.ListenerFn, context?: any, once?: boolean): EventEmitter => {
        return this.events.removeListener(event, fn, context);
    }

    clear = (): EventEmitter => {
        return this.events.removeAllListeners();
    }
}
