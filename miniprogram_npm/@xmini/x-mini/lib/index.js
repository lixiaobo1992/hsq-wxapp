"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "storage", {
  enumerable: true,
  get: function get() {
    return _storage.storage;
  }
});
Object.defineProperty(exports, "Storage", {
  enumerable: true,
  get: function get() {
    return _storage.Storage;
  }
});
exports.default = void 0;

var _index = require("./utils/index");

var _core = _interopRequireDefault(require("./core/core"));

var _storage = require("./core/storage");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var noop = function noop() {}; // Core 加入必备功能或插件，如 wxapp aliapp config支持 addPlugin 等
// XMini 在此基础上扩展


var XMini =
/*#__PURE__*/
function (_Core) {
  _inherits(XMini, _Core);

  function XMini() {
    var _this;

    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, XMini);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(XMini).call(this, config));

    _defineProperty(_assertThisInitialized(_this), "emitter", new _index.Emitter());

    _defineProperty(_assertThisInitialized(_this), "xApp", function (options) {
      return _this.create(options, {
        type: 'app',
        cb: App
      });
    });

    _defineProperty(_assertThisInitialized(_this), "xPage", function (options) {
      return _this.create(options, {
        type: 'page',
        cb: Page
      });
    });

    return _this;
  }

  _createClass(XMini, [{
    key: "init",
    value: function init() {
      var _this2 = this;

      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var _config$plugins = config.plugins,
          plugins = _config$plugins === void 0 ? [] : _config$plugins,
          _config$mixins = config.mixins,
          mixins = _config$mixins === void 0 ? {} : _config$mixins,
          store = config.store,
          adaptor = config.adaptor,
          rest = _objectWithoutProperties(config, ["plugins", "mixins", "store", "adaptor"]); // rest.plugin = {};


      this.setConfig(_objectSpread({}, rest, {
        adaptor: adaptor,
        miniappType: adaptor.objMe.name
      }));
      this.store = store;
      this.lifecycle = adaptor.lifecycle;
      this.miniappType = adaptor.objMe.name;
      this.me = adaptor.objMe.init();
      this.getCurrentPages = adaptor.objMe.getCurrentPages;
      Object.keys(mixins).forEach(function (key) {
        _this2.addMixin(key, mixins[key]);
      });
      this.addPlugin(plugins);
    }
  }, {
    key: "addMixin",
    value: function addMixin(target) {
      var mixin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      // let type = target && target._xmini_type;
      if (typeof target === 'string') {
        // type = target;
        target = this.lifecycle[target];
      }

      if (typeof mixin === 'function') {
        mixin.call(target, this);
        return;
      }

      if (!Array.isArray(mixin)) {
        mixin = [mixin];
      } // component 机制不同，不要这里实现了
      // if (type === 'component') {
      //   if (this.miniappType === 'wxapp') {
      //     if (!target.behaviors) target.behaviors = [];
      //     const behaviors = mixin.map(item => {
      //       return Behavior(item);
      //     });
      //     target.behaviors = target.behaviors.concat(behaviors);
      //   }
      // } else {


      _index.merge.apply(null, [target].concat(_toConsumableArray(mixin))); // }

    }
  }, {
    key: "addPlugin",
    value: function addPlugin(plugin) {
      var _this3 = this;

      if (Array.isArray(plugin)) {
        plugin.forEach(function (p) {
          _this3.addPlugin(p);
        });
        return this;
      }

      this.use(plugin);
      var _plugin$events = plugin.events,
          events = _plugin$events === void 0 ? {} : _plugin$events,
          _plugin$methods = plugin.methods,
          methods = _plugin$methods === void 0 ? {} : _plugin$methods;
      Object.keys(events).forEach(function (key) {
        var cbName = events[key];
        var fn = plugin[cbName];

        _this3.emitter.on(key, fn.bind(plugin));
      }); // 后面通过 bridge 来解决通信问题
      // this.addMethods(methods, plugin);

      Object.keys(methods).forEach(function (key) {
        var fnName = methods[key];

        if (!_this3[key] && plugin[key]) {
          _this3[key] = plugin[fnName].bind(plugin);
        } else {
          if (!_this3[key]) {
            console.error("\u63D2\u4EF6 ".concat(plugin.name, " \u4E0B\u7684\u516C\u5F00\u65B9\u6CD5 ").concat(key, " \u4E0D\u5B58\u5728"));
          }

          if (plugin[key]) {
            console.error("\u63D2\u4EF6 ".concat(plugin.name, " \u4E0B\u7684\u516C\u5F00\u65B9\u6CD5 ").concat(key, " \u5B58\u5728\u51B2\u7A81\uFF0C\u8BF7\u4F7F\u7528\u522B\u540D\uFF0C\u4FEE\u6539\u5BF9\u5E94\u63D2\u4EF6\u7684 methods \u503C"));
          }
        }
      }); // console.log(`:::add plugin::: ${plugin.name}`);

      return this;
    } // addPlugin

  }, {
    key: "use",
    value: function use(plugin) {
      var installedPlugins = this._installedPlugins || (this._installedPlugins = []);
      if (installedPlugins.indexOf(plugin) > -1) return this;

      for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        rest[_key - 1] = arguments[_key];
      }

      if (typeof plugin.install === 'function') {
        var _plugin$install;

        (_plugin$install = plugin.install).call.apply(_plugin$install, [plugin, this].concat(rest));
      } else if (typeof plugin === 'function') {
        plugin.call.apply(plugin, [this].concat(rest));
      }

      installedPlugins.push(plugin);
      return this;
    }
  }, {
    key: "create",
    value: function create() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var type = config.type,
          cb = config.cb; // 只添加生命周期的 还是全加(page 也应用在 component 组件上)
      // Object.keys(newOpts).forEach((key, index) => {

      var newOpts = {};
      options.$store = this.store; // 1 先设置 $store

      switch (type) {
        // case 'component':
        //   const { lifetimes, pageLifetimes } = this.lifecycle[type];
        //   newOpts = {
        //     ...this.lifecycle[type],
        //     ...options,
        //     lifetimes: this.rwLifeCycle(lifetimes, options.lifetimes, type),
        //     pageLifetimes: this.rwLifeCycle(
        //       pageLifetimes,
        //       options.pageLifetimes,
        //       type
        //     ),
        //   };
        //   break;
        case 'page':
        case 'app':
          newOpts = this.rwLifeCycle(this.lifecycle[type], options, type);
          break;

        default:
          // do nothing...
          break;
      }

      cb(newOpts);
      return this;
    }
  }, {
    key: "rwLifeCycle",
    value: function rwLifeCycle(hooksFn, options, type) {
      var that = this;

      var newOpts = _objectSpread({}, hooksFn, options, {
        _xmini_type: type
      });

      if (newOpts.mixins) {
        this.addMixin(newOpts, newOpts.mixins);
      } // newOpts.mixin = function(obj) {
      //   that.addMixin(newOpts, obj);
      // };


      Object.keys(hooksFn).forEach(function (key, index) {
        var oldFn = newOpts[key] || noop;

        newOpts[key] = function (opts) {
          var k = key;
          var t = type; // 这里应该使用 this 而不是 newOpts

          that.emitter.emit("".concat(t, ".").concat(k, ".before"), opts, this);
          var result = oldFn.call(this, opts);
          that.emitter.emit("".concat(t, ".").concat(k, ".after"), opts, this);
          return result;
        };
      }); // 2 就调用 $store

      var data = newOpts.data;

      for (var key in data) {
        if (typeof data[key] === 'function') {
          data[key] = data[key].call(newOpts);
        }
      }

      return newOpts;
    } // xComponent = options => {
    //   return this.create(options, {
    //     type: 'component',
    //     cb: Component,
    //   });
    // };

  }]);

  return XMini;
}(_core.default);

var _default = new XMini();

exports.default = _default;