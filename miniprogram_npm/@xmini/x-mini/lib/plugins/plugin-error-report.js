"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pluginBase = _interopRequireDefault(require("../core/plugin-base"));

var _index = _interopRequireDefault(require("../index"));

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

// https://tongji.doweidu.com/log.php
var Plugin =
/*#__PURE__*/
function (_PluginBase) {
  _inherits(Plugin, _PluginBase);

  function Plugin(config) {
    var _this;

    _classCallCheck(this, Plugin);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Plugin).call(this, config));

    _defineProperty(_assertThisInitialized(_this), "name", 'error-report');

    _defineProperty(_assertThisInitialized(_this), "events", {
      'app.onError.before': 'preOnError'
    });

    _defineProperty(_assertThisInitialized(_this), "methods", {
      errReport: 'errReport'
    });

    return _this;
  }

  _createClass(Plugin, [{
    key: "install",
    value: function install(xm, options) {//
    }
  }, {
    key: "errReport",
    value: function errReport(err) {
      this.preOnError(err);
    }
  }, {
    key: "preOnError",
    value: function preOnError(err, ctx) {
      if (!err) return;

      if (typeof err !== 'string') {
        err = JSON.stringify(err);
      } // err 的数据格式是？


      console.log(err);
      var regErr = /Yn\.env\.USER_DATA_PATH/i;
      if (regErr.test(err)) return;
      var config = this.getConfig();

      var _xmini$getConfig = _index.default.getConfig(),
          appName = _xmini$getConfig.appName,
          miniappType = _xmini$getConfig.miniappType;

      var me = _index.default.me;
      var systemInfo = me.$getSystemInfo();
      var pageInfo = me.$getPageInfo();
      /* eslint dot-notation: 0 */

      var os = systemInfo['platform'] === 'iPhone OS' ? 'iOS' : systemInfo['platform']; // 错误上报
      // 要记录报错信息，平台信息以及当前页面

      if (!_index.default.me && !_index.default.me.request) {
        console.error("xmini.me || xmini.me.request \u4E0D\u5B58\u5728");
        return;
      }

      _index.default.me.request({
        url: config.reportURI,
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          appName: appName,
          miniappType: miniappType,
          project: appName,
          os: os,
          // 客户端平台 Android iOS
          osVersion: systemInfo['system'],
          // 操作系统版本
          host: systemInfo['app'] || 'wechat',
          // 当前运行的客户端 alipay wechat
          hostVersion: systemInfo['version'],
          // 宿主版本号
          sdkVersion: systemInfo['SDKVersion'] || '-1',
          // 客户端基础库版本
          // language: systemInfo['language'], // 设置的语言
          brand: systemInfo['brand'],
          // 手机品牌
          model: systemInfo['model'],
          // 手机型号
          // pixelRatio: systemInfo['pixelRatio'], // 设备像素比
          pagePath: pageInfo.pagePath,
          pageQuery: JSON.stringify(pageInfo.pageQuery),
          value: err
        },
        dataType: 'json',
        success: function success(res) {},
        fail: function fail(res) {},
        complete: function complete(res) {}
      });
    }
  }, {
    key: "preAppOnShow",
    value: function preAppOnShow() {}
  }]);

  return Plugin;
}(_pluginBase.default);

var _default = Plugin;
exports.default = _default;
module.exports = exports.default;