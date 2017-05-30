import * as THREE from 'three';

import '../controls/FirstPersonControls.js';
import '../controls/TrackballControls.js';
import '../controls/OrbitControls.js';
import { MapControls } from '../controls/mapControls';

export default class Renderer {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
    controls: THREE.OrbitControls;
    clock = new THREE.Clock();

    constructor(container: HTMLElement) {
        let camera = this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 20000000);
        let scene = this.scene = new THREE.Scene();

        // let controls = this.controls = new THREE.OrbitControls(camera, container);
        // controls.target.set(142892.19, 470783.87, 0);

        // controls.minAzimuthAngle = - 0.5 * Math.PI; // radians
        // controls.maxAzimuthAngle = 0.5 * Math.PI; // radians

        let licht1 = new THREE.DirectionalLight(0xffffff, 0.6);
        licht1.position.set(0, 0, 1);
        // licht.target.position.set(142892.19, 470783.87, 250000);
        scene.add(licht1);
        // scene.add(licht.target);

        let licht = new THREE.AmbientLight(0x404040, 1);
        scene.add(licht);

        let renderer = this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            logarithmicDepthBuffer: true,
        });
        renderer.setClearColor(0xbfd1e5);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);

        container.appendChild(renderer.domElement);

        camera.position.set(142892.19, 470783.87, 250000);
        camera.up.set(0, 0, 1);

        let plane: any = new THREE.Plane(new THREE.Vector3(0, 0, 1));

        let controls = new MapControls(camera, renderer, plane);

        // let sg = new THREE.SphereBufferGeometry(20000, 32, 32);
        // let sp = new THREE.Mesh(sg);
        // sp.position.copy(controls.target);
        // scene.add(sp);

        // controls.addEventListener('change', () => {
        //     this.render();
        //     sp.position.copy(controls.target);

        // });

        controls.onChange = () => {
            this.render();
        };

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

}
