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
