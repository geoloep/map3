"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var three_1 = require("three");
var MapControls = (function () {
    function MapControls(camera, renderer, plane) {
        var _this = this;
        this.camera = camera;
        this.renderer = renderer;
        this.plane = plane;
        this.target = new three_1.Vector3();
        this.touch = false;
        this.mousePosition = new three_1.Vector2();
        this.mouseCast = new three_1.Vector3();
        this.raycaster = new three_1.Raycaster();
        this.panning = false;
        this.panStart = new three_1.Vector3();
        this.panOffset = new three_1.Vector3();
        this.zooming = false;
        this.zoomStart = new three_1.Vector2();
        this.zoomOffset = new three_1.Vector2();
        this.minZoom = 0;
        this.maxZoom = 400000;
        this.zoomScale = 100;
        this.touchZoomScale = 500000;
        this.rotating = false;
        this.rotateStart = new three_1.Spherical();
        this.rotateMouseStart = new three_1.Vector2();
        this.rotateOffset = new three_1.Vector2();
        this.maxPhi = 0.5 * Math.PI;
        this.minPhi = 0.001;
        this.quat = new three_1.Quaternion().setFromUnitVectors(new three_1.Vector3(0, 1, 0), new three_1.Vector3(0, 0, 1));
        this.spherical = new three_1.Spherical();
        this.offset = new three_1.Vector3();
        this.onMouseMove = function (e) {
            e.preventDefault();
            if (!_this.touch) {
                _this.setMousePosition(e.offsetX, e.offsetY);
            }
        };
        this.onMouseDown = function (e) {
            e.preventDefault();
            if (e.button === 0) {
                if (e.ctrlKey) {
                    _this.startRotate();
                }
                else {
                    _this.startPan();
                }
            }
            else if (e.button === 2) {
                _this.startRotate();
            }
        };
        this.onMouseUp = function (e) {
            e.preventDefault();
            _this.stopPan();
            _this.stopRotate();
        };
        this.onTouchDown = function (e) {
            e.preventDefault();
            _this.touch = true;
            if (e.touches.length === 1) {
                _this.setMousePosition(e.touches[0].pageX - _this.bounds.left, e.touches[0].pageY - _this.bounds.top);
                _this.startPan();
            }
            else {
                _this.setMousePosition(e.touches[0].pageX - _this.bounds.left, e.touches[0].pageY - _this.bounds.top);
                _this.stopPan();
                _this.startZoom();
            }
        };
        this.onTouchMove = function (e) {
            e.preventDefault();
            if (e.touches.length > 0) {
                _this.setMousePosition(e.touches[0].pageX - _this.bounds.left, e.touches[0].pageY - _this.bounds.top);
            }
        };
        this.onTouchUp = function (e) {
            e.preventDefault();
            _this.touch = false;
            _this.stopPan();
            _this.stopRotate();
            _this.stopZoom();
        };
        this.onWheel = function (e) {
            if (e.deltaY > 0) {
                _this.zoomOut(e);
            }
            else {
                _this.zoomIn(e);
            }
        };
        this.animate = function () {
            if (_this.panning) {
                _this.pan();
            }
            if (_this.rotating) {
                _this.rotate();
            }
            if (_this.zooming) {
                _this.zoom();
            }
            window.requestAnimationFrame(_this.animate);
        };
        this.bounds = renderer.domElement.getBoundingClientRect();
        renderer.domElement.addEventListener('contextmenu', function (e) {
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
    MapControls.prototype.onChange = function () {
    };
    MapControls.prototype.setMousePosition = function (x, y) {
        this.mousePosition.set((x / this.renderer.domElement.clientWidth) * 2 - 1, -(y / this.renderer.domElement.clientWidth) * 2 + 1);
    };
    MapControls.prototype.update = function () {
        this.offset.setFromSpherical(this.spherical);
        this.offset.applyQuaternion(this.quat);
        this.camera.position.copy(this.target).add(this.offset);
        this.camera.lookAt(this.target);
        this.onChange();
    };
    MapControls.prototype.startPan = function () {
        this.panStart.copy(this.raycast(this.mousePosition));
        this.panning = true;
    };
    MapControls.prototype.stopPan = function () {
        this.panning = false;
    };
    MapControls.prototype.startZoom = function () {
        this.zoomStart.copy(this.mousePosition);
        this.zooming = true;
    };
    MapControls.prototype.stopZoom = function () {
        this.zooming = false;
    };
    MapControls.prototype.zoomIn = function (e) {
        this.spherical.radius = Math.max(this.spherical.radius + e.deltaY * this.zoomScale, this.minZoom);
        this.update();
    };
    MapControls.prototype.zoomOut = function (e) {
        this.spherical.radius = Math.min(this.spherical.radius + e.deltaY * this.zoomScale, this.maxZoom);
        this.update();
    };
    MapControls.prototype.startRotate = function () {
        this.rotating = true;
        this.rotateStart.copy(this.spherical);
        this.rotateMouseStart.copy(this.mousePosition);
    };
    MapControls.prototype.stopRotate = function () {
        this.rotating = false;
    };
    MapControls.prototype.rotate = function () {
        this.rotateOffset.subVectors(this.rotateMouseStart, this.mousePosition);
        this.spherical.phi = Math.max(this.minPhi, Math.min(this.spherical.phi - this.rotateOffset.y * Math.PI, this.maxPhi));
        this.spherical.theta += this.rotateOffset.x * Math.PI;
        this.rotateMouseStart.copy(this.mousePosition);
        this.update();
    };
    MapControls.prototype.pan = function () {
        var pos = this.raycast(this.mousePosition);
        this.panOffset.subVectors(this.panStart, pos);
        this.target.add(this.panOffset);
        this.update();
    };
    MapControls.prototype.zoom = function () {
        this.zoomOffset.subVectors(this.zoomStart, this.mousePosition);
        this.spherical.radius += this.zoomOffset.y * this.touchZoomScale;
        this.zoomStart.copy(this.mousePosition);
        this.update();
    };
    MapControls.prototype.raycast = function (mouse) {
        this.raycaster.setFromCamera(mouse, this.camera);
        return this.raycaster.ray.intersectPlane(this.plane, this.mouseCast);
    };
    return MapControls;
}());
exports.MapControls = MapControls;
