"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// const globalConfig = {};
function copy() {
  var v = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return JSON.parse(JSON.stringify(v));
}

var Core =
/*#__PURE__*/
function () {
  function Core() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var isGlobal = arguments.length > 1 ? arguments[1] : undefined;

    _classCallCheck(this, Core);

    this.config = config; // if (isGlobal) {
    //   this.setGlobalConfig(config);
    //   this.setConfig = this.setGlobalConfig;
    //   this.getConfig = this.getGlobalConfig;
    // }
  }

  _createClass(Core, [{
    key: "getConfig",
    value: function getConfig(key) {
      return copy(key ? this.config[key] : this.config);
    }
  }, {
    key: "setConfig",
    value: function setConfig() {
      var newConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return Object.assign(this.config, newConfig);
    } // getGlobalConfig() {
    //   console.warn('get global config:');
    //   return { ...globalConfig };
    // }
    // setGlobalConfig(newConfig = {}) {
    //   console.warn('set global config:');
    //   return Object.assign(globalConfig, newConfig);
    // }
    // installPlugin(pluginId, plugin) {
    //   uninstallPlugin(pluginId);
    //   this.pluginList[pluginId] = plugin;
    //   plugin.install();
    // }
    // uninstallPlugin(pluginId) {
    //   const temp = this.pluginList[pluginId];
    //   if (this.pluginList[pluginId]) {
    //     temp.uninstall();
    //   }
    // }
    // invokeMethod(method, params) {
    //   let list = [];
    //   for (const core in this.pluginList) {
    //     const result = core.invokeMethod(method, params);
    //     if (result.handled) {
    //       result.pluginId = core;
    //       console.log('==========');
    //       list.push(result);
    //       break;
    //     }
    //   }
    //   return list;
    // }
    // invoke(id, method, params) {
    //   const plugin = this.pluginList[id];
    //   if (!plugin) {
    //     return {
    //       handled: false,
    //     };
    //   }
    //   return plugin.invokeMethod(method, params);
    // }
    // install() {}
    // uninstall() {}

  }]);

  return Core;
}(); // const core = new Core();


var _default = Core;
exports.default = _default;
module.exports = exports.default;