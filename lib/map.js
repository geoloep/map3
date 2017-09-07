"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var renderer_1 = require("./renderer/renderer");
var defaultOptions = {};
var Map = (function () {
    function Map(container, options) {
        var element = document.getElementById(container);
        if (element !== null) {
            this.renderer = new renderer_1.default(element);
        }
        else {
            throw new Error("Container " + container + " not found");
        }
    }
    Map.prototype.addLayer = function (layer) {
        this.layers.push(layer);
    };
    Map.prototype.removeLayer = function (layer) {
        if (this.layers.indexOf(layer) >= 0) {
            this.layers.splice(this.layers.indexOf(layer), 1);
        }
    };
    return Map;
}());
exports.default = Map;
