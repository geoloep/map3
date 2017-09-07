"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chroma_js_1 = require("chroma-js");
var three_1 = require("three");
var GeoJsonLayer = (function () {
    function GeoJsonLayer(geosjon) {
        this.geosjon = geosjon;
        this.group = new three_1.Group();
    }
    GeoJsonLayer.prototype.mesh = function () {
        for (var _i = 0, _a = this.geosjon.features; _i < _a.length; _i++) {
            var feature = _a[_i];
            var shape = this.geometryToShape(feature.geometry);
            this.group.add(new three_1.Mesh(new THREE.ShapeBufferGeometry(shape)));
        }
        return this.group;
    };
    GeoJsonLayer.prototype.geometryToShape = function (geom) {
        console.log(geom);
        switch (geom.type) {
            case 'Polygon':
                return this.polygonToShape(geom);
            case 'MultiPolygon':
                return this.multiPolygonToShape(geom);
            default:
                console.error("Cannot convert " + geom + " into a shape");
                return new three_1.Shape();
        }
    };
    GeoJsonLayer.prototype.polygonToShape = function (geom) {
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
    GeoJsonLayer.prototype.multiPolygonToShape = function (geom) {
        var shape = new three_1.Shape();
        var first = true;
        for (var _i = 0, _a = geom.coordinates; _i < _a.length; _i++) {
            var part = _a[_i];
            for (var _b = 0, part_1 = part; _b < part_1.length; _b++) {
                var ring = part_1[_b];
                for (var _c = 0, ring_2 = ring; _c < ring_2.length; _c++) {
                    var vertice = ring_2[_c];
                    if (first) {
                        shape.moveTo(vertice[0], vertice[1]);
                        first = false;
                    }
                    else {
                        shape.lineTo(vertice[0], vertice[1]);
                    }
                }
            }
            first = true;
        }
        return shape;
    };
    GeoJsonLayer.prototype.material = function () {
        return new three_1.MeshBasicMaterial({
            color: 0x2194ce,
        });
    };
    GeoJsonLayer.prototype.symbology = function () {
        return {
            color: chroma_js_1.default.random().css(),
        };
    };
    return GeoJsonLayer;
}());
exports.default = GeoJsonLayer;
