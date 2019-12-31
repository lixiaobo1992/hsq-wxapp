"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Store", {
  enumerable: true,
  get: function get() {
    return _store.Store;
  }
});
Object.defineProperty(exports, "mapState", {
  enumerable: true,
  get: function get() {
    return _helpers.mapState;
  }
});
Object.defineProperty(exports, "mapMutations", {
  enumerable: true,
  get: function get() {
    return _helpers.mapMutations;
  }
});
Object.defineProperty(exports, "mapActions", {
  enumerable: true,
  get: function get() {
    return _helpers.mapActions;
  }
});
exports.default = void 0;

var _pluginBase = _interopRequireDefault(require("../../core/plugin-base"));

var _store = require("./store");

var _helpers = require("./helpers");

var _index = _interopRequireDefault(require("../../index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Plugin =
/*#__PURE__*/
function (_PluginBase) {
  _inherits(Plugin, _PluginBase);

  function Plugin() {
    var _this;

    _classCallCheck(this, Plugin);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Plugin).call(this));

    _defineProperty(_assertThisInitialized(_this), "name", 'store');

    _defineProperty(_assertThisInitialized(_this), "events", {
      'app.onLaunch.before': 'resetStore',
      'app.onShow.before': 'resetStore',
      'page.onLoad.before': 'resetStore',
      'page.onShow.before': 'resetStore'
    });

    _defineProperty(_assertThisInitialized(_this), "methods", {// getPages: 'getPages',
      // setChannel: 'setChannel',
      // getChannelFilter: 'getChannelFilter',
    });

    return _this;
  }

  _createClass(Plugin, [{
    key: "resetStore",
    value: function resetStore(options, ctx) {
      // 只能更新当前页，也就是调用 commit dispatch 仅在当前页才起效
      // ctx.$store = xmini.store;
      // store 更新，会通过此方法，更新当前页面
      _index.default.store.$callback = function (state) {
        ctx.setData && ctx.setData(state);
      }; // 如果非当前页面时，已更新了 store，需要进入当前页面时再次触发初始化设置最新的store
      // 4 最后每次进入都要重新设置 最新的 store


      if (ctx.$storeKey) {
        var state = _helpers.mapState.call(ctx, ctx.$storeKey);

        for (var key in state) {
          if (typeof state[key] == 'function') {
            state[key] = state[key].call(ctx);
          }
        }

        ctx.setData(state);
      }
    } // install(xm) {
    //   const that = this;
    //   const mixin = function(opts, ctx) {
    //   };
    //   // 混入生命周期内，执行以上的逻辑
    //   xm.emitter.on('app.onLaunch.before', mixin);
    //   xm.emitter.on('app.onShow.before', mixin);
    //   xm.emitter.on('page.onLoad.before', mixin);
    //   xm.emitter.on('page.onShow.before', mixin);
    //   // xm.emitter.on('component.show.before', mixin);
    // }

  }]);

  return Plugin;
}(_pluginBase.default);

;
var _default = Plugin;
exports.default = _default;