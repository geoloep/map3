import {AmbientLight, Camera, Clock, DirectionalLight, Mesh, PerspectiveCamera, Plane, Raycaster, Scene, SphereBufferGeometry, Vector2, Vector3, WebGLRenderer} from 'three';

import { MapControls } from '../controls/mapControls';
import Map from '../core/map';
import { Bounds } from '../geometry/basic';

export default class Renderer {
    // events = new EventEmitter();

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

    constructor(readonly map: Map, readonly container: HTMLElement) {
        const camera = this.camera = new PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 20000000);
        const scene = this.scene = new Scene();

        // let controls = this.controls = new OrbitControls(camera, container);
        // controls.target.set(142892.19, 470783.87, 0);

        // controls.minAzimuthAngle = - 0.5 * Math.PI; // radians
        // controls.maxAzimuthAngle = 0.5 * Math.PI; // radians

        const licht1 = new DirectionalLight(0xffffff, 0.6);
        licht1.position.set(0, 0, 1);
        // licht.target.position.set(142892.19, 470783.87, 250000);
        scene.add(licht1);
        // scene.add(licht.target);

        const licht = new AmbientLight(0x404040, 1);
        scene.add(licht);

        const renderer = this.renderer = new WebGLRenderer({
            antialias: true,
            logarithmicDepthBuffer: true,
        });
        renderer.setClearColor(0xbfd1e5);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);

        container.appendChild(renderer.domElement);

        camera.position.set(142892.19, 470783.87, 15000);
        // camera.position.set(-285401.920, 903401.920, 250000);

        camera.up.set(0, 0, 1);

        const plane = this.plane = new Plane(new Vector3(0, 0, 1));

        const controls = this.controls = new MapControls(map, camera, renderer, plane);

        // const sg = new SphereBufferGeometry(20000, 32, 32);
        // const sp = new Mesh(sg);
        // sp.position.copy(controls.target);
        // scene.add(sp);

        // controls.addEventListener('change', () => {
        //     this.render();
        //     sp.position.copy(controls.target);

        // });

        // controls.onChange = () => {
        //     this.render();
        //     // sp.position.copy(controls.panStart);
        // };

        controls.events.on('move', () => {
            this.render();
        });

        this.render();
    }

    animate = () => {
        requestAnimationFrame(this.render);

        this.render();
    }

    render = () => {
        // this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    get bounds() {
        this.bottomLeft.set(Infinity, Infinity);
        this.topRight.set(-Infinity, -Infinity);

        for (const screenPos of this.screenVectors) {
            this.boundRay.setFromCamera(screenPos, this.camera);

            const point = this.boundRay.ray.intersectPlane(this.plane);

            if (point === null) {
                // what to do?
            }  else {
                this.bottomLeft.set(Math.min(this.bottomLeft.x, point.x), Math.min(this.bottomLeft.y, point.y));
                this.topRight.set(Math.max(this.topRight.x, point.x), Math.max(this.topRight.y, point.y));
            }
        }

        console.log(this.bottomLeft);
        console.log(this.topRight);

        return new Bounds(
            this.bottomLeft,
            this.topRight,
        );

        // const bottomLeftRay = new Raycaster();
        // const topRightRay = new Raycaster();

        // bottomLeftRay.setFromCamera(new Vector2(-1, -1), this.camera);
        // topRightRay.setFromCamera(new Vector2(1, 1), this.camera);

        // let bottomLeftVec = bottomLeftRay.ray.intersectPlane(this.plane);
        // let topRightVec = topRightRay.ray.intersectPlane(this.plane);

        // if (bottomLeftVec === null) {
        //     bottomLeftVec = new Vector3(Infinity, Infinity, 0);
        // }

        // if (topRightVec === null) {
        //     topRightVec = new Vector3(Infinity, Infinity, 0);
        // }

        // return new Bounds(
        //     bottomLeftVec,
        //     topRightVec,
        // );
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
}
