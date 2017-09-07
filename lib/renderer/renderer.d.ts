import { Camera, Clock, Scene, WebGLRenderer } from 'three';
export default class Renderer {
    renderer: WebGLRenderer;
    scene: Scene;
    camera: Camera;
    controls: any;
    clock: Clock;
    constructor(container: HTMLElement);
    animate: () => void;
    render: () => void;
}
