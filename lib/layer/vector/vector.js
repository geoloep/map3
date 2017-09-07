"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var VectorLayer = (function () {
    function VectorLayer(feature, style) {
        this.style = {
            color: 0x0000ff,
            light: false,
            extrude: false,
        };
        if (feature) {
            this.feature = feature;
        }
        if (typeof (style) !== 'function') {
            Object.assign(this.style, style);
        }
        else {
            this.style = style;
        }
    }
    VectorLayer.prototype.parseStyle = function (style) {
        if (typeof (style) === 'function') {
            style = Object.assign(this.style, style(this.feature));
        }
        return style;
    };
    VectorLayer.prototype.styleToMaterial = function (style) {
        var mat;
        if (style.light) {
            mat = THREE.MeshLambertMaterial;
        }
        else {
            mat = THREE.MeshBasicMaterial;
        }
        return new mat({
            color: style.color,
        });
    };
    VectorLayer.prototype.styleToGeometry = function (shapes, style) {
        if (style.extrude) {
            return new THREE.ExtrudeBufferGeometry(shapes, {
                amount: style.extrude,
            });
        }
        else {
            return new THREE.ShapeBufferGeometry(shapes);
        }
    };
    return VectorLayer;
}());
exports.default = VectorLayer;
