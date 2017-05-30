import * as THREE from 'three';

/**
 * Inspired by the three.js orbitcontrols
 * https://github.com/mrdoob/three.js/blob/dev/examples/js/controls/OrbitControls.js
 */

/**
 * Controls for a Google maps like panning and rotating experience
 */
export class MapControls {
    target = new THREE.Vector3();

    bounds: {
        top: number,
        left: number,
    };

    touch = false;

    // For RayCasting
    mousePosition = new THREE.Vector2();
    mouseCast = new THREE.Vector3();
    raycaster = new THREE.Raycaster();

    // Panning
    panning = false;
    panStart = new THREE.Vector3();
    panOffset = new THREE.Vector3();

    // Zooming
    zooming = false;
    zoomStart = new THREE.Vector2();
    zoomOffset = new THREE.Vector2();
    // zoomStart = 0;

    minZoom = 0;
    maxZoom = 400000;

    zoomScale = 100;
    touchZoomScale = 500000;

    // Rotation
    rotating = false;
    rotateStart = new THREE.Spherical();
    rotateMouseStart = new THREE.Vector2();
    rotateOffset = new THREE.Vector2();

    maxPhi = 0.5 * Math.PI;
    minPhi = 0.001;

    // No use fot his yet?
    // maxTheta = 0.5 * Math.PI;
    // minTheta = 0;

    // Camera position
    quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
    spherical = new THREE.Spherical();
    offset = new THREE.Vector3();

    constructor(private camera: THREE.Camera, private renderer: THREE.WebGLRenderer, private plane: THREE.Plane) {
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

    /**
     * Called when a rerender of camera position is possible. Replace with your own handler.
     */
    onChange() {

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

        this.stopPan();
        this.stopRotate();
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
            - (y / this.renderer.domElement.clientWidth) * 2 + 1,
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

        this.onChange();
    }

    private startPan() {
        // console.log('startPan');

        this.panStart.copy(this.raycast(this.mousePosition));
        this.panning = true;
    }

    private stopPan() {
        this.panning = false;
    }

    private startZoom() {
        // console.log('startZoom');
        this.zoomStart.copy(this.mousePosition);
        this.zooming = true;
    }

    private stopZoom() {
        this.zooming = false;
    }

    private zoomIn(e: WheelEvent) {
        this.spherical.radius = Math.max(this.spherical.radius + e.deltaY * this.zoomScale, this.minZoom);

        this.update();
    }

    private zoomOut(e: WheelEvent) {
        this.spherical.radius = Math.min(this.spherical.radius + e.deltaY * this.zoomScale, this.maxZoom);

        this.update();
    }

    private startRotate() {
        this.rotating = true;
        this.rotateStart.copy(this.spherical);
        this.rotateMouseStart.copy(this.mousePosition);
    }

    private stopRotate() {
        this.rotating = false;
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

    private raycast(mouse: THREE.Vector2) {
        this.raycaster.setFromCamera(mouse, this.camera);

        return this.raycaster.ray.intersectPlane(this.plane, this.mouseCast);
    }
}
