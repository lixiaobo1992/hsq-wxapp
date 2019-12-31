"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _module = _interopRequireDefault(require("./module"));

var _util = require("../util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ModuleCollection =
/*#__PURE__*/
function () {
  function ModuleCollection(rawRootModule) {
    _classCallCheck(this, ModuleCollection);

    // register root module (Vuex.Store options)
    this.register([], rawRootModule, false);
  } // example:
  // -> ['account', 'user'] 获取到对应的 module


  _createClass(ModuleCollection, [{
    key: "get",
    value: function get(path) {
      return path.reduce(function (module, key) {
        return module.getChild(key);
      }, this.root);
    } // ['account'] -> account/
    // getNamespace (path) {
    //   let module = this.root
    //   return path.reduce((namespace, key) => {
    //     module = module.getChild(key)
    //     return namespace + (module.namespaced ? key + '/' : '')
    //   }, '')
    // }

  }, {
    key: "update",
    value: function update(rawRootModule) {
      _update([], this.root, rawRootModule);
    }
  }, {
    key: "register",
    value: function register(path, rawModule) {
      var _this = this;

      var runtime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var newModule = new _module.default(rawModule, runtime);

      if (path.length === 0) {
        this.root = newModule;
      } else {
        // arr.slice(?start, ?end)
        var parent = this.get(path.slice(0, -1));
        parent.addChild(path[path.length - 1], newModule);
      } // register nested modules
      // key: errorLog, user...


      if (rawModule.modules) {
        (0, _util.forEachValue)(rawModule.modules, function (rawChildModule, key) {
          _this.register(path.concat(key), rawChildModule, runtime);
        });
      }
    }
  }, {
    key: "unregister",
    value: function unregister(path) {
      var parent = this.get(path.slice(0, -1));
      var key = path[path.length - 1];
      if (!parent.getChild(key).runtime) return;
      parent.removeChild(key);
    }
  }]);

  return ModuleCollection;
}();

exports.default = ModuleCollection;

function _update(path, targetModule, newModule) {
  // update target module
  targetModule.update(newModule); // update nested modules

  if (newModule.modules) {
    for (var key in newModule.modules) {
      if (!targetModule.getChild(key)) return;

      _update(path.concat(key), targetModule.getChild(key), newModule.modules[key]);
    }
  }
} // function assertRawModule (path, rawModule) {}
// function makeAssertionMessage (path, key, type, value, expected) {}


module.exports = exports.default;