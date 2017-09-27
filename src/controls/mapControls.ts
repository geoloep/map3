import Evented from '../core/evented';

import Map from '../core/map';

import { EventEmitter } from 'eventemitter3';
import { Camera, Plane, Quaternion, Raycaster, Spherical, Vector2, Vector3, WebGLRenderer } from 'three';

/**
 * Inspired by the js orbitcontrols
 * https://github.com/mrdoob/js/blob/dev/examples/js/controls/OrbitControls.js
 */

/**
 * Controls for a Google maps like panning and rotating experience
 */
export class MapControls extends Evented {
    target = new Vector3();

    bounds: {
        top: number,
        left: number,
    };

    touch = false;

    // For RayCasting
    mousePosition = new Vector2();
    mouseCast = new Vector3();
    raycaster = new Raycaster();

    // Panning
    panning = false;
    panStart = new Vector3();
    panOffset = new Vector3();

    // Zooming
    zooming = false;
    zoomStart = new Vector2();
    zoomOffset = new Vector2();

    zoomLevel = 8;
    minZoom = 0;
    maxZoom = 14;

    // zoomScale = 100;
    touchZoomScale = 500000;

    // Rotation
    rotating = false;
    rotateStart = new Spherical();
    rotateMouseStart = new Vector2();
    rotateOffset = new Vector2();

    maxPhi = (2 * Math.PI) / 5;
    minPhi = 0.001;

    // No use fot his yet?
    // maxTheta = 0.5 * Math.PI;
    // minTheta = 0;

    // Camera position
    quat = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(0, 0, 1));
    spherical = new Spherical();
    offset = new Vector3();

    constructor(private map: Map, private camera: Camera, private renderer: WebGLRenderer, private plane: Plane) {
        super();

        this.bounds = renderer.domElement.getBoundingClientRect();

        renderer.domElement.addEventListener('contextmenu', (e: Event) => {
            e.preventDefault();
        });

        renderer.domElement.addEventListener('mousedown', this.onMouseDown);
        renderer.domElement.addEventListener('mousemove', this.onMouseMove);
        renderer.domElement.addEventListener('mouseup', this.onMouseUp);

        renderer.domElement.addEventListener('touchstart', this.onTouchDown);
        renderer.domElement.addEventListener('touchmove', this.onTouchMove);
        renderer.domElement.addEventListener('touchend', this.onTouchUp);

        renderer.domElement.addEventListener('wheel', this.onWheel);

        this.spherical.radius = camera.position.z;
        this.spherical.phi = this.minPhi;

        this.target.set(camera.position.x, camera.position.y, 0);

        window.requestAnimationFrame(this.animate);
    }

    private onMouseMove = (e: MouseEvent) => {
        e.preventDefault();

        if (!this.touch) {
            this.setMousePosition(e.offsetX, e.offsetY);
        }

        // this.mousePosition.set(
        //     (e.offsetX / this.renderer.domElement.clientWidth) * 2 - 1,
        //     - (e.offsetY / this.renderer.domElement.clientWidth) * 2 + 1,
        // );
    }

    private onMouseDown = (e: MouseEvent) => {
        e.preventDefault();

        if (e.button === 0) {
            if (e.ctrlKey) {
                this.startRotate();
            } else {
                this.startPan();
            }
        } else if (e.button === 2) {
            this.startRotate();
        }
    }

    private onMouseUp = (e: MouseEvent) => {
        e.preventDefault();

        if (this.panning) {
            this.stopPan();
        }

        if (this.rotating) {
            this.stopRotate();
        }
    }

    private onTouchDown = (e: TouchEvent) => {
        e.preventDefault();

        // console.log(e.touches);

        this.touch = true;

        if (e.touches.length === 1) {
            this.setMousePosition(e.touches[0].pageX - this.bounds.left, e.touches[0].pageY - this.bounds.top);
            this.startPan();
        } else {
            this.setMousePosition(e.touches[0].pageX - this.bounds.left, e.touches[0].pageY - this.bounds.top);
            this.stopPan();
            this.startZoom();
        }
    }

    private onTouchMove = (e: TouchEvent) => {
        e.preventDefault();

        if (e.touches.length > 0) {
            this.setMousePosition(e.touches[0].pageX - this.bounds.left, e.touches[0].pageY - this.bounds.top);
        }
    }

    private onTouchUp = (e: TouchEvent) => {
        e.preventDefault();

        // console.log('up');
        this.touch = false;

        this.stopPan();
        this.stopRotate();
        this.stopZoom();
    }

    private setMousePosition(x: number, y: number) {
        this.mousePosition.set(
            (x / this.renderer.domElement.clientWidth) * 2 - 1,
            - (y / this.renderer.domElement.clientHeight) * 2 + 1,
        );
    }

    private onWheel = (e: WheelEvent) => {
        if (e.deltaY > 0) {
            this.zoomOut(e);
        } else {
            this.zoomIn(e);
        }
    }

    private animate = () => {
        if (this.panning) {
            this.pan();
        }

        if (this.rotating) {
            this.rotate();
        }

        if (this.zooming) {
            this.zoom();
        }

        window.requestAnimationFrame(this.animate);
    }

    private update() {
        // Calculate cartesian offset
        this.offset.setFromSpherical(this.spherical);

        // Rotate offset into a z = up position
        this.offset.applyQuaternion(this.quat);

        // console.log(this.offset);

        // Place camera at target and add the offsett
        this.camera.position.copy(this.target).add(this.offset);

        // Rotate camera to the target
        this.camera.lookAt(this.target);

        // console.log(this.camera.position);

        this.emit('move');
    }

    private startPan() {
        this.panStart.copy(this.raycast(this.mousePosition));
        this.panning = true;

        this.emit('panstart');
        this.emit('movestart');
    }

    private stopPan() {
        this.panning = false;

        this.emit('panend');
        this.emit('moveend');
    }

    private startZoom() {
        this.zoomStart.copy(this.mousePosition);
        this.zooming = true;

        this.emit('zoomstart');
        this.emit('movestart');
    }

    private stopZoom() {
        this.zooming = false;

        this.emit('zoomend');
        this.emit('moveend');
    }

    private zoomIn(e: WheelEvent) {
        this.emit('zoomstart');
        this.emit('movestart');

        this.zoomLevel += this.map.options.zoomstep;

        if (this.zoomLevel > this.maxZoom) {
            this.zoomLevel = this.maxZoom;
        }

        this.setZoom(this.zoomLevel);

        // this.spherical.radius = Math.max(this.spherical.radius + e.deltaY * this.zoomScale, this.minZoom);

        this.update();

        this.emit('zoomend');
        this.emit('moveend');
    }

    private zoomOut(e: WheelEvent) {
        this.emit('zoomstart');
        this.emit('movestart');

        this.zoomLevel -= this.map.options.zoomstep;

        if (this.zoomLevel < this.minZoom) {
            this.zoomLevel = this.minZoom;
        }

        this.setZoom(this.zoomLevel);

        // this.spherical.radius = Math.min(this.spherical.radius + e.deltaY * this.zoomScale, this.maxZoom);

        this.update();

        this.emit('zoomend');
        this.emit('moveend');
    }

    private startRotate() {
        this.rotating = true;
        this.rotateStart.copy(this.spherical);
        this.rotateMouseStart.copy(this.mousePosition);

        this.emit('rotatestart');
        this.emit('movestart');
    }

    private stopRotate() {
        this.rotating = false;

        this.emit('rotateend');
        this.emit('moveend');
    }

    private rotate() {
        this.rotateOffset.subVectors(this.rotateMouseStart, this.mousePosition);

        // These appear to be the wrong way around.
        this.spherical.phi = Math.max(this.minPhi, Math.min(this.spherical.phi - this.rotateOffset.y * Math.PI, this.maxPhi));
        this.spherical.theta += this.rotateOffset.x * Math.PI;

        this.rotateMouseStart.copy(this.mousePosition);

        this.update();
    }

    private pan() {
        let pos = this.raycast(this.mousePosition);

        this.panOffset.subVectors(this.panStart, pos);

        this.target.add(this.panOffset);

        this.update();
    }

    private zoom() {
        this.zoomOffset.subVectors(this.zoomStart, this.mousePosition);

        this.spherical.radius += this.zoomOffset.y * this.touchZoomScale;

        this.zoomStart.copy(this.mousePosition);

        this.update();
    }

    private setZoom(zoom: number) {
        this.spherical.radius = this.zoomDist(zoom);
    }

    private zoomDist(zoom: number) {
        const res = this.map.projection.resolution(zoom);

        const fov = this.map.renderer.camera.fov * Math.PI / 180;
        const ratio = 2 * Math.tan(fov / 2);

        const distance = (this.map.renderer.clientHeight * res) / ratio;
        return distance;

        // console.log(this.zoomLevel, res, distance, ratio);

        // const visibleHeight = this.map.renderer.clientHeight * res;

        // const distance = this.map.horizon.distanceTo(this.map.renderer.camera.position);
        // const fov = this.map.renderer.camera.fov * Math.PI / 180;

        // const visibleHeight = 2 * Math.tan( fov / 2 ) * distance;

        // return visibleHeight / this.map.renderer.clientHeight ;
    }

    private raycast(mouse: Vector2) {
        this.raycaster.setFromCamera(mouse, this.camera);

        return this.raycaster.ray.intersectPlane(this.plane, this.mouseCast);
    }
}
