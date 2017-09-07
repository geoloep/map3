"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var three_1 = require("three");
var vector_1 = require("./vector");
var PolygonLayer = (function (_super) {
    __extends(PolygonLayer, _super);
    function PolygonLayer(feature, style) {
        return _super.call(this, feature, style) || this;
    }
    PolygonLayer.prototype.polygonToShape = function (geom) {
        var shape = new three_1.Shape();
        var first = true;
        for (var _i = 0, _a = geom.coordinates; _i < _a.length; _i++) {
            var ring = _a[_i];
            for (var _b = 0, ring_1 = ring; _b < ring_1.length; _b++) {
                var vertice = ring_1[_b];
                if (first) {
                    shape.moveTo(vertice[0], vertice[1]);
                    first = false;
                }
                else {
                    shape.lineTo(vertice[0], vertice[1]);
                }
            }
        }
        return shape;
    };
    PolygonLayer.prototype.mesh = function () {
        var style = this.parseStyle(this.style);
        var shape = this.polygonToShape(this.feature.geometry);
        var geom = this.styleToGeometry(shape, style);
        return new three_1.Mesh(geom, this.styleToMaterial(style));
    };
    return PolygonLayer;
}(vector_1.default));
exports.default = PolygonLayer;
