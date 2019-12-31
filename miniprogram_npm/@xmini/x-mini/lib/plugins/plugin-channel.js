"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pluginBase = _interopRequireDefault(require("../core/plugin-base"));

var _index = require("../utils/index");

var _index2 = _interopRequireDefault(require("../index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

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

// function toMap(arr = []) {
//   return arr.reduce((obj, item) => {
//     obj[item] = true;
//     return obj;
//   }, {})
// }

/**
 * 小程序业务渠道&参数处理(如果扩展可以支持业务之外的参数处理)
 * 支持业务参数配置 spm channel_id 等，可新增
 * 支持参数的 parse stringify merge 操作
 *
 * @class Plugin
 * @extends {PluginBase}
 */
var Plugin =
/*#__PURE__*/
function (_PluginBase) {
  _inherits(Plugin, _PluginBase);

  function Plugin() {
    var _this;

    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Plugin);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Plugin).call(this, config));

    _defineProperty(_assertThisInitialized(_this), "name", 'channel');

    _defineProperty(_assertThisInitialized(_this), "events", {
      'app.onLaunch.before': 'preAppOnLaunch',
      'app.onShow.before': 'preAppOnShow',
      'page.onLoad.before': 'prePageOnLoad'
    });

    _defineProperty(_assertThisInitialized(_this), "methods", {
      getChannel: 'getChannel',
      setChannel: 'setChannel',
      getChannelFilter: 'getChannelFilter'
    });

    _this.startParams = _this.setChannel(config);
    return _this;
  } // install(xm) {}


  _createClass(Plugin, [{
    key: "preAppOnLaunch",
    value: function preAppOnLaunch() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.initChannel(options, 'App onLaunch');
    }
  }, {
    key: "preAppOnShow",
    value: function preAppOnShow() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.initChannel(options, 'App onShow');
    }
  }, {
    key: "prePageOnLoad",
    value: function prePageOnLoad() {
      var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var ctx = arguments.length > 1 ? arguments[1] : undefined;
      // console.warn(ctx);
      // ctx.$pageQuery = query;
      // `不允许重写 ${ctx.$getPageName()} 中的 onLoad 方法的 query 参数`，但暂时无法控制
      Object.defineProperty(ctx, '$pageQuery', {
        value: query,
        writable: false
      });
    }
  }, {
    key: "initChannel",
    value: function initChannel() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var type = arguments.length > 1 ? arguments[1] : undefined;
      // console.log(options, type);
      var query = options.query,
          _options$referrerInfo = options.referrerInfo,
          referrerInfo = _options$referrerInfo === void 0 ? {} : _options$referrerInfo;
      var extraData = referrerInfo.extraData; // 微信可能有个 query.scene
      // if (query && query.scene) {
      //   Object.assign(query, parse(query.scene));
      // }
      // console.log(path, query, scene, shareTicket);
      // console.log(extraData);

      this.setChannel(query || extraData);
      return this;
    }
  }, {
    key: "getChannelFilter",
    value: function getChannelFilter() {
      return this.getConfig();
    }
  }, {
    key: "channelFilter",
    value: function channelFilter(params, filters) {
      if (!filters) {
        filters = this.getConfig();
      }

      return (0, _index.filterObj)(params, filters);
    }
  }, {
    key: "setChannel",
    value: function setChannel(options) {
      // 内部变量全是用channel 而不要用channel_id
      if (_typeof(options) !== 'object') return; // 此参数，在切换到后台后，再切换回来，参数丢失了
      // 更新业务渠道参数
      // 每次启动时，获取参数设置为默认值，之后透传当前页面的配置，若无则使用默认值替代
      // 其值为api、分享或页面使用
      // 仅仅取有效的参数值
      // 目前 channel 与 channel_id 保持同步

      var _this$channelFilter = this.channelFilter(options),
          _this$channelFilter$c = _this$channelFilter.channel_id,
          channel_id = _this$channelFilter$c === void 0 ? '' : _this$channelFilter$c,
          _this$channelFilter$c2 = _this$channelFilter.channel,
          channel = _this$channelFilter$c2 === void 0 ? channel_id : _this$channelFilter$c2,
          rest = _objectWithoutProperties(_this$channelFilter, ["channel_id", "channel"]);

      var temp = _objectSpread({
        channel_id: channel_id,
        channel: channel
      }, rest);

      this.startParams = _objectSpread({}, this.getConfig(), (0, _index.compactObject)(temp));
      return this; // 如果业务参数更新，需要刷新页面数据，渠道更新，不用刷新数据
      // 业务参数被更新，仅仅更新渠道参数
      // const oldParams = this.getChannel();
      // if(channel_id != oldParams.channel || spm != oldParams.spm){
      //   this.updateCurrentPage();
      // }
    }
  }, {
    key: "getChannel",
    value: function getChannel() {
      var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      // 获取传入 url 的业务参数，如果没传，则获取当前[页面]的业务参数
      // 参数由以下三部分数据合成(需要提供给 piwik 以及 api 使用)
      // - 默认参数 config
      // - 启动参数 startParams
      // - 指定 url 页面参数，默认为当前页面
      // 获取业务渠道参数，由全局参数以及page参数运算得出
      // 提供给API、forward以及统计使用
      var _xmini$me$$getPageInf = _index2.default.me.$getPageInfo(),
          _xmini$me$$getPageInf2 = _xmini$me$$getPageInf.pageQuery,
          pageQuery = _xmini$me$$getPageInf2 === void 0 ? {} : _xmini$me$$getPageInf2;

      var current = (0, _index.compactObject)(this.channelFilter(pageQuery));
      return _objectSpread({}, this.getConfig(), this.startParams, current);
    }
  }]);

  return Plugin;
}(_pluginBase.default);

var _default = Plugin; // 注意事项
// 以下测试要以真机结果为准
// 支付宝小程序
// !!!如果当前已经打开蚂蚁会员小程序，在钉钉跳转到积分小程序，触发两次这个App 的 onShow();
// 第一次为从后台切到前台，参数为空
// 第二次为schema唤醒，传入参数
// 支付宝 schema 传参在 options.query 这里取
// alipay://platformapi/startApp?appId=2018051160096372&query=channel_id%3Dalipay_ant
// alipays://platformapi/startApp?appId=2017112000051610&query=spm%3D222%26channel%3D333%26channel_id%3Dpoint&page=pages%2Findex%2Findex%3Fid%3D111
// 参数结构如下,默认扫码(打开scene为四个0，小程序列表打开为 1001，无 query)
// options = { path: 'pages/index/index', query: { channel: 333, channel_id: 'point', spm: '222' }, scene: '0000' }
// 支付宝小程序间跳转，参数在 referrerInfo 中，结构如下：
// options = { path: 'pages/index/index', scene: '1037', referrerInfo: { appId: '来源的 appId,如2018051160096372', extraData: { channel_id: '', spm: '', refer: '来源页面,如pages/profile/profile' } } };
// my.alert({
//   title: 'onShow:' + JSON.stringify(options),
// });
// 微信小程序
// 分享后的
// options = { path: 'pages/index/index', query: { spm:xxx, channel: xxx }, referrerInfo: {}, scene: 1001, shareTicket: undefined }
// 扫码进来的
// options = { path: 'pages/index/index', query: { scene: encode(spm=xxx&channel=xxx) }, referrerInfo: {}, scene: 1001, shareTicket: undefined }
//

exports.default = _default;
module.exports = exports.default;