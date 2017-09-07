"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var three_1 = require("three");
var mapControls_1 = require("../controls/mapControls");
var Renderer = (function () {
    function Renderer(container) {
        var _this = this;
        this.clock = new three_1.Clock();
        this.animate = function () {
            requestAnimationFrame(_this.render);
            _this.render();
        };
        this.render = function () {
            _this.renderer.render(_this.scene, _this.camera);
        };
        var camera = this.camera = new three_1.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 20000000);
        var scene = this.scene = new three_1.Scene();
        var licht1 = new three_1.DirectionalLight(0xffffff, 0.6);
        licht1.position.set(0, 0, 1);
        scene.add(licht1);
        var licht = new three_1.AmbientLight(0x404040, 1);
        scene.add(licht);
        var renderer = this.renderer = new three_1.WebGLRenderer({
            antialias: true,
            logarithmicDepthBuffer: true,
        });
        renderer.setClearColor(0xbfd1e5);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);
        camera.position.set(142892.19, 470783.87, 250000);
        camera.up.set(0, 0, 1);
        var plane = new three_1.Plane(new three_1.Vector3(0, 0, 1));
        var controls = new mapControls_1.MapControls(camera, renderer, plane);
        controls.onChange = function () {
            _this.render();
        };
        this.render();
    }
    return Renderer;
}());
exports.default = Renderer;
