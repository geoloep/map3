import * as THREE from 'three';

/**
 * Based upon OrbitControls.js from the three.js repository
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

export class MapControls {
    target = new THREE.Vector3(0, 0, 0);

    // How far you can dolly in and out ( PerspectiveCamera only )
    minDistance = 0;
    maxDistance = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    minPolarAngle = 0; // radians
    maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    inAzimuthAngle = - Infinity; // radians
    maxAzimuthAngle = Infinity; // radians

    // Set to false to disable rotating
    enableRotate = true;
    rotateSpeed = 1.0;

    // Set to false to disable panning
    enablePan = true;
    keyPanSpeed = 7.0;	// pixels moved per arrow key push

    // The four arrow keys
    keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

    // Mouse buttons
    mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.LEFT };

    //
    // internals
    //

    changeEvent = { type: 'change' };
    startEvent = { type: 'start' };
    endEvent = { type: 'end' };

    STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };

    state = this.STATE.NONE;

    EPS = 0.000001;

    // current position in spherical coordinates
    spherical = new THREE.Spherical();
    sphericalDelta = new THREE.Spherical();

    scale = 1;
    panOffset = new THREE.Vector3();
    zoomChanged = false;

    rotateStart = new THREE.Vector2();
    rotateEnd = new THREE.Vector2();
    rotateDelta = new THREE.Vector2();

    panStart = new THREE.Vector2();
    panEnd = new THREE.Vector2();
    panDelta = new THREE.Vector2();

    dollyStart = new THREE.Vector2();
    dollyEnd = new THREE.Vector2();
    dollyDelta = new THREE.Vector2();

    offset = new THREE.Vector3();

    constructor(private camera: THREE.PerspectiveCamera, private domElement: HTMLElement) {
        // super();
        domElement.addEventListener('mousedown', this.onMouseDown, false);
        domElement.addEventListener('mouseup', this.onMouseUp, false);
    }

    change() {
    };

    onMouseDown = (e: MouseEvent) => {
        e.preventDefault();

        switch (e.button) {
            case this.mouseButtons.PAN:
                this.state = this.STATE.PAN;
                break;
            default:
                console.error('Unknown mousebutton ' + e.button);
        }
    }

    onMouseMove = (e: MouseEvent) => {
        switch (this.state) {
            case this.STATE.ROTATE:
                this.handleMouseMovePan(e);
                break;
            default:
        }
    }

    onMouseUp = (e: Event) => {
        this.state = this.STATE.NONE;
    }

    handleMouseDownPan(e: MouseEvent) {
        this.panStart.set(e.clientX, e.clientY);
    }

    handleMouseMovePan(e: MouseEvent) {
        this.panEnd.set(e.clientX, e.clientY);
        this.panDelta.subVectors(this.panEnd, this.panStart);
        this.pan(this.panDelta.x, this.panDelta.y);

        this.panStart.copy(this.panEnd);
        this.update();
    }

    update() {

    }

    pan(deltaX: number, deltaY: number) {
        let position = this.camera.position;
        this.offset.copy(position).sub(this.target);
        let distance = this.offset.length();

        distance *= Math.tan( ( this.camera.fov / 2 ) * Math.PI / 180.0 );
    }

    // panLeft(distance: number, matrix: THREE.Matrix) {

    // }

    panLeft() {
        let v = new THREE.Vector3();

        return (distance: number, matrix: THREE.Matrix4) => {
            v.setFromMatrixColumn(matrix, 1);
            v.multiplyScalar(distance);

            this.panOffset.add(v);
        };
    }

}

export default MapControls;
