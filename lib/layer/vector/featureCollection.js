"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var three_1 = require("three");
var chroma_js_1 = require("chroma-js");
var polygon_1 = require("./polygon");
var multiPolygon_1 = require("./multiPolygon");
var FeatureCollectionLayer = (function () {
    function FeatureCollectionLayer(geosjon, style) {
        this.geosjon = geosjon;
        this.style = style;
        this.group = new three_1.Group();
    }
    FeatureCollectionLayer.prototype.mesh = function () {
        for (var _i = 0, _a = this.geosjon.features; _i < _a.length; _i++) {
            var feature = _a[_i];
            var layer = this.featureToLayer(feature);
            if (layer) {
                this.group.add(layer.mesh());
            }
        }
        return this.group;
    };
    FeatureCollectionLayer.prototype.featureToLayer = function (feature) {
        switch (feature.geometry.type) {
            case 'Polygon':
                return new polygon_1.default(feature, this.style);
            case 'MultiPolygon':
                return new multiPolygon_1.default(feature, this.style);
            default:
                console.error("Cannot convert " + feature.geometry.type + " into a shape");
                return false;
        }
    };
    FeatureCollectionLayer.prototype.polygonToShape = function (geom) {
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
    FeatureCollectionLayer.prototype.multiPolygonToShape = function (geom) {
        console.log('ja');
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
    FeatureCollectionLayer.prototype.material = function () {
        return new three_1.MeshBasicMaterial({
            color: 0x2194ce,
        });
    };
    FeatureCollectionLayer.prototype.symbology = function () {
        return {
            color: chroma_js_1.default.random().css(),
        };
    };
    return FeatureCollectionLayer;
}());
exports.default = FeatureCollectionLayer;
