"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pluginBase = _interopRequireDefault(require("../../core/plugin-base"));

var _index = require("../../utils/index");

var _index2 = _interopRequireDefault(require("../../index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function workspaceInit() {}
/**
 * 负责实现数据收集
 *
 * @class Plugin
 * @extends {PluginBase}
 */


var Plugin =
/*#__PURE__*/
function (_PluginBase) {
  _inherits(Plugin, _PluginBase);

  function Plugin(config) {
    var _this;

    _classCallCheck(this, Plugin);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Plugin).call(this, config));

    _defineProperty(_assertThisInitialized(_this), "name", 'stat');

    _defineProperty(_assertThisInitialized(_this), "events", {
      'app.onError.before': 'preAppOnError',
      'app.onLaunch.before': 'preAppOnLaunch',
      'app.onShow.before': 'preAppOnShow',
      'app.onHide.before': 'preAppOnHide',
      'app.onUnlaunch.before': 'preAppOnUnlaunch',
      'page.onLoad.before': 'prePageOnLoad',
      'page.onReady.before': 'prePageOnReady',
      'page.onShow.before': 'prePageOnShow',
      'page.onHide.before': 'prePageOnHide',
      'page.onUnload.before': 'prePageOnUnload',
      'page.onTabItemTap.before': 'prePageOnTabItemTap'
    });

    _defineProperty(_assertThisInitialized(_this), "methods", {// getStatData: 'getData',
    });

    _defineProperty(_assertThisInitialized(_this), "_data", {});

    _this.setData({
      startTime: Date.now()
    });

    return _this;
  }

  _createClass(Plugin, [{
    key: "setData",
    value: function setData() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _index.emitter.emit('stat_data', _objectSpread({}, options), this);

      Object.assign(this._data, options);
    }
  }, {
    key: "getData",
    value: function getData(key) {
      return key ? this._data[key] : _objectSpread({}, this._data);
    }
  }, {
    key: "statLog",
    value: function statLog(type, action, value, category) {
      // 数据类型，app page component event
      // 每触发一次抛出一次数据，数据可以被其他插件接收（通过特定的形式）
      // 不同的触发，产生的数据也不同，需要按类别进行过滤处理
      // 参考百度统计，输出规范化的数据
      // _hmt.push(['_trackPageview', pageURL]);
      // _hmt.push(['_trackEvent', category, action, opt_label, optValue]);
      // _hmt.push(['_setCustomVar', index, name, value, opt_scope]);
      // _hmt.push(['_setAccount', siteId);
      // _hmt.push(['_setAutoPageview', false]);
      // _trackPageview, pageURL
      // _trackEvent, category, action, value
      // _setCustomVar, index, name, value
      // let temp = this.getData();
      // 触发 更新 事件 以及 log
      switch (type) {
        case 'event':
        case 'pv':
        default:
          _index.emitter.emit('stat_log', {
            type: type,
            action: action,
            value: value,
            category: category
          }, this);

        // do nothing...
      }
    }
  }, {
    key: "preAppOnError",
    value: function preAppOnError(err) {
      var count = this.getData('errorCount') || 0;
      this.setData({
        errorCount: count + 1
      }); // 这里自定义事件不上报错误
      // this.statLog('event', 'error', JSON.stringify(err));
      // emitter.emit('stat', ['TrackEvent', 'error_message', JSON.stringify(err)], this);
    }
  }, {
    key: "preAppOnLaunch",
    value: function preAppOnLaunch(options) {
      var _this2 = this;

      workspaceInit();
      var that = this; // 初始化

      this.setData({
        uuid: _index2.default.me.$getUUID(),
        timestamp: Date.now(),
        showTime: Date.now(),
        duration: 0,
        errorCount: 0,
        pageCount: 1,
        firstPage: 0,
        showOptions: options,
        // 下面几个暂无意义，需要对应的 event 总数累加
        // 否则需要本地拿到上一次的次数累加才有效
        launchTimes: 0,
        showTimes: 0,
        hideTimes: 0
      }); // 异步获取网络以及定位相关信息

      _index2.default.me.getNetworkType({
        success: function success(res) {
          that.setData({
            networkType: res.networkType || 'nt_no_name'
          });
        },
        fail: function fail(err) {
          that.setData({
            networkType: 'nt_fail'
          });
        }
      });

      _index2.default.me.$getLocation(function (res) {
        // console.warn('geo');
        // console.log(res);
        _this2.setData({
          location: res // latitude: res.latitude || 0,
          // longitude: res.longitude || 0,
          // speed: res.speed || 0,
          // province: res.province || 0,
          // city: res.city || 0,
          // district: res.district || 0,

        });
      }); // 同步获取系统信息


      var systemInfo = _index2.default.me.$getSystemInfo();

      this.setData({
        // platform: systemInfo['platform'], // 平台、终端
        os: systemInfo.platform,
        // 客户端平台 Android iOS
        osVersion: systemInfo.system,
        // 操作系统版本
        host: systemInfo.app || 'wechat',
        // 当前运行的客户端 alipay wechat
        hostVersion: systemInfo.version,
        // 宿主版本号
        sdkVersion: systemInfo.SDKVersion || '1.0.0',
        // 客户端基础库版本
        language: systemInfo.language,
        // 设置的语言
        brand: systemInfo.brand,
        // 手机品牌
        model: systemInfo.model,
        // 手机型号
        pixelRatio: systemInfo.pixelRatio,
        // 设备像素比
        screenWidth: systemInfo.screenWidth,
        // 屏幕宽高
        screenHeight: systemInfo.screenHeight,
        windowWidth: systemInfo.windowWidth,
        // 可使用窗口宽高
        windowHeight: systemInfo.windowHeight
      }); // 用户信息，需要业务设定，登录后有
      // getUserInfo();
      // this.statLog('event', 'app_launch', '', 'lifecycle');
    }
  }, {
    key: "preAppOnShow",
    value: function preAppOnShow() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.setData({
        appShowTime: Date.now(),
        showOptions: options // showTimes: this.getData('showTimes') + 1,

      }); // if (options.shareTicket) { }
      // 上报启动时长(注意保活 这个不好处理)
      // this.statLog('event', 'appStartTimes', Date.now() - startTime);
    }
  }, {
    key: "preAppOnHide",
    value: function preAppOnHide() {// const appDuration = Date.now() - this.getData('appShowTime');
      // this.setData({
      //   appDuration,
      //   // hideTimes: this.getData('hideTimes') + 1,
      // });
      // this.statLog('event', 'app_hide', appDuration, 'lifecycle');
      // 上报使用时长
    }
  }, {
    key: "preAppOnUnlaunch",
    value: function preAppOnUnlaunch() {// 强制上报一次数据
      // const appDuration = Date.now() - this.getData('appShowTime');
      // this.setData({
      //   appDuration,
      //   // hideTimes: this.getData('hideTimes') + 1,
      // });
      // this.statLog('event', 'app_unlaunch', appDuration, 'lifecycle');
      // 上报使用时长
    }
  }, {
    key: "prePageOnLoad",
    value: function prePageOnLoad() {
      var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.setData({
        pageQuery: query,
        pageStartTime: Date.now()
      }); // this.statLog('event', 'page_load');
    }
  }, {
    key: "prePageOnReady",
    value: function prePageOnReady() {// const duration = Date.now() - this.getData('pageStartTime');
      // this.statLog('event', 'page_ready', duration, 'lifecycle');
    }
  }, {
    key: "prePageOnShow",
    value: function prePageOnShow() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var ctx = arguments.length > 1 ? arguments[1] : undefined;
      var route = ctx.route,
          pageQuery = ctx.pageQuery,
          $pageQuery = ctx.$pageQuery;
      var query = (0, _index.stringify)(pageQuery || $pageQuery);
      query = query ? "?".concat(query) : query;
      var fullPage = "".concat(route).concat(query);
      var data = {
        pageCount: this.getData('pageCount') + 1,
        showTime: 0,
        lastPage: fullPage,
        referer: this.getData('lastPage') || ''
      };

      if (!this.getData('firstPage')) {
        /* eslint dot-notation: 0 */
        data['firstPage'] = fullPage;
      }

      this.setData(data); // pv, url, referer

      this.statLog('pv', fullPage, data['referer']); // 此处存储当前 path 路径，并上报一次 pv
      // this.statLog('event', 'page', 'show');
      // this.statLog('pv', 'pageName', url);
    }
  }, {
    key: "prePageOnHide",
    value: function prePageOnHide() {// const duration = Date.now() - this.getData('showTime');
      // this.setData({
      //   duration,
      // });
      // this.statLog('event', 'page_hide', duration, 'lifecycle');
      // 上报当前页面浏览时长
    }
  }, {
    key: "prePageOnUnload",
    value: function prePageOnUnload() {// const duration = Date.now() - this.getData('showTime');
      // this.setData({
      //   duration,
      // });
      // this.statLog('event', 'page_unload', duration, 'lifecycle');
      // 上报当前页面浏览时长
    }
  }, {
    key: "prePageOnTabItemTap",
    value: function prePageOnTabItemTap() {
      var _xmini$me$$getPageInf = _index2.default.me.$getPageInfo(),
          pageName = _xmini$me$$getPageInf.pageName;

      this.statLog('event', "tap_tabbar_".concat(pageName));
    }
  }]);

  return Plugin;
}(_pluginBase.default);

var _default = Plugin;
exports.default = _default;
module.exports = exports.default;