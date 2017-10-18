import Evented from '../core/evented';

import { AmbientLight, Camera, Clock, DirectionalLight, Mesh, PerspectiveCamera, Plane, Raycaster, Scene, SphereBufferGeometry, Vector2, Vector3, WebGLRenderer } from 'three';

import Map from '../core/map';
import { Bounds } from '../geometry/basic';

/**
 * This default WebGL renderer renders with a ThreeJS Perspective Camera
 */
export default class Renderer extends Evented {
    container: HTMLElement;
    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
    controls: any;
    clock = new Clock();
    plane: Plane;

    private horizonRay = new Raycaster();

    // Objects for calculating bounds
    private boundRay = new Raycaster();
    private screenVectors = [
        new Vector2(-1, -1),
        new Vector2(-1, 1),
        new Vector2(1, -1),
        new Vector2(1, 1),
    ];
    private bottomLeft = new Vector2(Infinity, Infinity);
    private topRight = new Vector2(-Infinity, -Infinity);

    private redraw = true;

    constructor(readonly map: Map) {
        super();

        const container = this.container = map.container;

        const camera = this.camera = new PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 300000);
        const scene = this.scene = new Scene();

        const renderer = this.renderer = new WebGLRenderer({
            antialias: true,
            logarithmicDepthBuffer: true,
        });

        renderer.autoClear = false;
        renderer.setClearColor(0xbfd1e5);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);

        container.appendChild(renderer.domElement);

        camera.position.set(142892.19, 470783.87, 15000);

        camera.up.set(0, 0, 1);

        const plane = this.plane = new Plane(new Vector3(0, 0, 1));

        this.animate();
    }

    /**
     * Request that the map be redrawn
     */
    render() {
        this.redraw = true;
    }

    set zoom(zoom: number) {
        
    }

    get topDown() {
        return this.camera.quaternion.x < 0.1;
    }

    get bounds() {
        let vector: Vector3;
        this.bottomLeft.set(Infinity, Infinity);
        this.topRight.set(-Infinity, -Infinity);

        for (const screenPos of this.screenVectors) {
            this.boundRay.setFromCamera(screenPos, this.camera);

            const point = this.boundRay.ray.intersectPlane(this.plane);

            if (point !== null) {
                this.bottomLeft.set(Math.min(this.bottomLeft.x, point.x), Math.min(this.bottomLeft.y, point.y));
                this.topRight.set(Math.max(this.topRight.x, point.x), Math.max(this.topRight.y, point.y));
            } else {
                // Ray did not cross plane, infinite bounds in the direction of the ray
                vector = this.boundRay.ray.direction.normalize();

                if (vector.x > 0) {
                    this.topRight.setX(Infinity);
                } else {
                    this.bottomLeft.setX(-Infinity);
                }

                if (vector.y > 0) {
                    this.topRight.setY(Infinity);
                } else {
                    this.bottomLeft.setY(-Infinity);
                }
            }
        }

        return new Bounds(
            this.bottomLeft,
            this.topRight,
        );
    }

    get horizon() {
        this.horizonRay.setFromCamera(new Vector2(0, -1), this.camera);

        return this.horizonRay.ray.intersectPlane(this.plane);
    }

    get clientWidth() {
        return this.container.clientWidth;
    }

    get clientHeight() {
        return this.container.clientHeight;
    }

    zoomDistance(zoom: number) {
        const res = this.map.projection.resolution(zoom);

        const fov = this.map.renderer.camera.fov * Math.PI / 180;
        const ratio = 2 * Math.tan(fov / 2);

        const distance = (this.map.renderer.clientHeight * res) / ratio;
        return distance;
    }

    private animate = () => {
        this.emit('tick');

        if (this.redraw) {
            this.renderFrame();
            this.redraw = false;
        }

        requestAnimationFrame(this.animate);
    }

    private renderFrame = () => {
        // this.renderer.render(this.scene, this.camera);

        this.renderer.clear();
        for (const scene of this.map.scenes) {
            this.renderer.render(scene, this.camera);
            this.renderer.clearDepth();
        }

        this.emit('frame');
    }
}
