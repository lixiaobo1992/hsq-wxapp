"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _util = require("../util");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// 传入的参数rawModule就是对象
// {
//   state,
//   mutations,
//   actions,
// }
var Module =
/*#__PURE__*/
function () {
  function Module(rawModule, runtime) {
    _classCallCheck(this, Module);

    this.runtime = runtime;
    this._children = Object.create(null);
    this._rawModule = rawModule;
    var rawState = rawModule.state;
    this.state = (typeof rawState === 'function' ? rawState() : rawState) || {};
  } // get namespaced() {
  //   return !!this._rawModule.namespaced;
  // }


  _createClass(Module, [{
    key: "addChild",
    value: function addChild(key, module) {
      this._children[key] = module;
    }
  }, {
    key: "removeChild",
    value: function removeChild(key) {
      delete this._children[key];
    }
  }, {
    key: "getChild",
    value: function getChild(key) {
      return this._children[key];
    }
  }, {
    key: "update",
    value: function update(rawModule) {
      this._rawModule.namespaced = rawModule.namespaced;

      if (rawModule.actions) {
        this._rawModule.actions = rawModule.actions;
      }

      if (rawModule.mutations) {
        this._rawModule.mutations = rawModule.mutations;
      } // if (rawModule.getters) {
      //   this._rawModule.getters = rawModule.getters;
      // }

    }
  }, {
    key: "forEachChild",
    value: function forEachChild(fn) {
      (0, _util.forEachValue)(this._children, fn);
    } // forEachGetter(fn) {
    //   if (this._rawModule.getters) {
    //     forEachValue(this._rawModule.getters, fn)
    //   }
    // }

  }, {
    key: "forEachAction",
    value: function forEachAction(fn) {
      if (this._rawModule.actions) {
        (0, _util.forEachValue)(this._rawModule.actions, fn);
      }
    }
  }, {
    key: "forEachMutation",
    value: function forEachMutation(fn) {
      if (this._rawModule.mutations) {
        (0, _util.forEachValue)(this._rawModule.mutations, fn);
      }
    }
  }]);

  return Module;
}(); // Object.create(null);
// https://stackoverflow.com/questions/15518328/creating-js-object-with-object-createnull


exports.default = Module;
module.exports = exports.default;