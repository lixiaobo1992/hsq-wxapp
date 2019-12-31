"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observe = observe;

var _behavior = require("./behavior");

var _props = require("./props");

function observe(dwdOptions, options) {
  const {
    watch,
    computed
  } = dwdOptions;
  options.behaviors.push(_behavior.behavior);

  if (watch) {
    const props = options.properties || {};
    Object.keys(watch).forEach(key => {
      if (key in props) {
        let prop = props[key];

        if (prop === null || !('type' in prop)) {
          prop = {
            type: prop
          };
        }

        prop.observer = watch[key];
        props[key] = prop;
      }
    });
    options.properties = props;
  }

  if (computed) {
    options.methods = options.methods || {};

    options.methods.$options = () => dwdOptions;

    if (options.properties) {
      (0, _props.observeProps)(options.properties);
    }
  }
}