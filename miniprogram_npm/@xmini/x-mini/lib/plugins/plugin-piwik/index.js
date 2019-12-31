"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pluginBase = _interopRequireDefault(require("../../core/plugin-base"));

var _index = _interopRequireDefault(require("../../index"));

var _index2 = require("../../utils/index");

var _regionMap = require("./regionMap");

var _storage = require("../../core/storage");

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

var storagePiwik = new _storage.Storage('piwik', 31536000);
/**
 * 公共参数 idsite、rec、r、url、urlref、h、m、s、send_image、cookie、gt_ms、_ref、pv_id、country、region、city、lat、long、cdt
 * 访客属性 _id、uid、_idts、_idvc、_idn、_refts、_viewts、res、cvar、_cvar
 * 事件参数：action_name
 *
 * _hmt.push(['_trackPageview', pageURL]);
 * _hmt.push(['_trackEvent', category, action, opt_label, opt_value]);
 * _hmt.push(['_setCustomVar', index, name, value, opt_scope]);
 * _hmt.push(['_setAccount', siteId);
 * _hmt.push(['_setAutoPageview', false]);
 */

/**
 * piwik 数据统计（负责实现数据上报）
 * 支持配置必备业务参数透传
 * 参考 https://p-2q9b.tower.im/p/2fl2
 * https://developer.matomo.org/guides/tracking-api-clients
 * 基于piwik接口的统计方案 https://p-2q9b.tower.im/p/ccuo
 * 百度统计 http://tongji.baidu.com/open/api/more?p=ref_setCustomVar
 * 暴露三个方法
 *  - piwikInit 配置接口(受限)
 *  - piwikUpdate 更新数据接口(受限)
 *  - piwikLog 接收log，之后合并公共数据，然后 push 到数组中，并触发log上报
 *    - 内部方法 pushLog piwikReport send
 * https://developer.matomo.org/api-reference/tracking-api
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

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Plugin).call(this, {}));

    _defineProperty(_assertThisInitialized(_this), "name", 'piwik');

    _defineProperty(_assertThisInitialized(_this), "events", {});

    _defineProperty(_assertThisInitialized(_this), "requestCount", 0);

    _defineProperty(_assertThisInitialized(_this), "methods", {
      piwikInit: 'piwikInit',
      piwikUpdate: 'piwikUpdate',
      piwikEvent: 'piwikEvent'
    });

    _defineProperty(_assertThisInitialized(_this), "_data", {});

    _defineProperty(_assertThisInitialized(_this), "_logs", []);

    _this.piwikInit(config);

    _this._logs = (storagePiwik.get('piwikLog') || []).concat(_this._logs);
    return _this;
  }

  _createClass(Plugin, [{
    key: "install",
    value: function install() {
      _index2.emitter.on('stat_data', this.setData, this);

      _index2.emitter.on('stat_log', this.statLog, this);
    }
  }, {
    key: "setData",
    value: function setData(config) {
      if (!config) return;
      Object.assign(this._data, config);
    }
  }, {
    key: "getData",
    value: function getData(key) {
      return key ? this._data[key] : _objectSpread({}, this._data);
    } // 不需要这个，因为直接 new 时，就可以配置好了

  }, {
    key: "piwikInit",
    value: function piwikInit() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (!opts.reportURI || !opts.siteId || !opts.authToken) {
        console.error("\u8BF7\u68C0\u67E5 plugin ".concat(this.name, " \u7684\u8BBE\u7F6E\uFF0C\u521D\u59CB\u5316\u5FC5\u987B\u914D\u7F6E reportURI, siteId, authToken"));
        return;
      } // 只允许设置以下值


      var whiteList = {
        size: 1,
        siteId: 1,
        category: 1,
        reportURI: 1,
        authToken: 1
      }; // 这里做过滤，无效的删除，非白名单的删除

      var temp = (0, _index2.filterObj)(opts, whiteList);
      var config = {
        size: temp.size || 5,
        idsite: temp.siteId,
        category: temp.category,
        reportURI: temp.reportURI,
        token_auth: temp.authToken,
        rec: 1
      };
      this.setConfig((0, _index2.compactObject)(config));
    }
  }, {
    key: "piwikUpdate",
    value: function piwikUpdate() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      // 只允许更新以下值
      if (opts.userId) opts.userId = opts.userId.toString();

      var whiteList = _objectSpread({
        openId: 1,
        location: 1,
        userId: 1,
        screen: 1,
        cityName: 1,
        path: 1,
        refer: 1
      }, _index.default.getChannelFilter()); // ['screen', 'userId', 'openId', 'location', 'cityName', 'path', 'refer', 'channel', 'spm']
      // console.warn(opts);


      var config = (0, _index2.filterObj)(opts, whiteList); // console.warn('更新用户信息');

      this.setData(config);
    }
  }, {
    key: "piwikPageView",
    value: function piwikPageView(pagePath, referer) {
      // console.warn('pv');
      // pv 统计页面 url 以及页面名称
      // const { pageName, pagePath, referer = '' } = xmini.me.$getPageInfo();
      var url = pagePath;

      if (!/^http/.test(pagePath)) {
        url = 'http://' + pagePath;
      } // const { lastPage } = this.getData();
      // pv 信息都应该从 pageInfo 上取


      var data = {
        url: url,
        action_name: pagePath,
        urlref: referer || 'istoppage',
        _ref: referer
      };
      this.setData({
        url: url,
        urlref: referer || 'istoppage',
        _ref: referer
      });
      this.pushLog(data);
    } // cvar 暂时只有固定的数量，通过 stat_update/piwikUpdate 更新
    // piwikCustomVar(index, name, value) { }
    // 上报自定义事件

  }, {
    key: "piwikEvent",
    value: function piwikEvent(action) {
      var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var category = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
      // console.warn('event');
      // 上报自定义事件
      if (!action) return;

      if (value && typeof value !== 'string') {
        value = JSON.stringify(value);
      } // 系统生命周期的事件，别用 action 直接用，category=lifecycle
      // 用户交互事件，使用 action 区别行为
      // 曝光事件，使用 action 以 ex_ 开头, category=exposure


      category = category || this.getConfig('category') || 'miniapp';
      var temp = {
        action_name: action,
        // 页面路径
        e_c: category,
        e_a: action,
        e_n: value
      };
      var immediately = false;

      if (action === 'app') {
        if (value === 'hide' || value === 'unlaunch') {
          immediately = true;
        }
      }

      this.pushLog(temp, immediately);
    } // 暂时只支持两种log：event pv

  }, {
    key: "statLog",
    value: function statLog(data) {
      if (!(0, _index2.isObject)(data) || !data.type) {
        console.error('statLog 上报数据格式必须为对象，且必须指定type 和 action');
        return;
      }

      switch (data.type) {
        case 'event':
          this.piwikEvent(data.action, data.value, data.category);
          break;

        case 'pv':
          this.piwikPageView(data.action, data.value, data.category);
          break;

        default:
          // doNothing
          break;
      }
    }
  }, {
    key: "piwikLog",
    value: function piwikLog(data) {
      // 通用结构
      if (!(0, _index2.isObject)(data) && !data.action_name) {
        console.error('piwikLog 上报数据格式必须为对象，且必须指定 action_name 和 action');
        return;
      }

      this.pushLog(data);
    }
  }, {
    key: "pushLog",
    value: function pushLog(data, immediately) {
      var log = (0, _index2.merge)(this.getCommon(), data); // console.warn(log);

      this._logs.push("?".concat((0, _index2.stringify)(log)));

      this.checkLog();
    }
  }, {
    key: "checkLog",
    value: function checkLog(immediately) {
      if (this.reporting) return;
      if (!this._logs.length) return;
      this.piwikReport(immediately);
    }
  }, {
    key: "piwikReport",
    value: function piwikReport(immediately) {
      var _this2 = this;

      // "?urlref=istoppage&_ref=istoppage&action_name=index&url=http%3A%2F%2Fpages%2Findex%2Findex%3Fspm%3Daliapp%26channel_id%3Daliapp%26ide_internal_page%3Dpages%252Findex%252Findex%26port%3D60154&idsite=5&rec=1&_id=c3b80d787042a4c8&uid=&res=375x667&r=366229&h=17&m=25&s=17&send_image=0&cvar=%7B%221%22%3A%5B%22channel%22%2C%22aliapp%22%5D%2C%222%22%3A%5B%22city_name%22%2Cnull%5D%2C%223%22%3A%5B%22spm%22%2C%22aliapp%22%5D%2C%224%22%3A%5B%22user_id%22%2C%22%22%5D%7D&_cvar=%7B%221%22%3A%5B%22spm%22%2C%22aliapp%22%5D%2C%222%22%3A%5B%22openid%22%2Cnull%5D%2C%223%22%3A%5B%22city_name%22%2Cnull%5D%2C%224%22%3A%5B%22user_id%22%2C%22%22%5D%7D&cdt=1547803517"
      if (this.reporting && !immediately) return;

      var logs = this._logs.splice(0);

      var retryTimes = 0;

      var _this$getConfig = this.getConfig(),
          reportURI = _this$getConfig.reportURI,
          token_auth = _this$getConfig.token_auth;

      this.reporting = true;

      var reportData = function reportData() {
        // logs = logs.map(item => {
        //   return item
        //     .replace(/rq_c=(\d+)/g, (match, $1) => {
        //       const count = $1 > this.requestCount ? $1 : this.requestCount;
        //       return `rq_c=${count}`;
        //     })
        //     .replace(/retryTimes=(\d+)/g, (match, $1) => {
        //       const count = $1 > retryTimes ? $1 : retryTimes;
        //       return `retryTimes=${count}`;
        //     });
        // });
        // console.log('report 上报数据', JSON.stringify(logs));
        var data = {
          token_auth: token_auth,
          requests: logs
        }; // data['rq_c'] = this.requestCount;

        _this2.requestCount++;

        _index.default.me.request({
          url: "".concat(reportURI),
          method: 'POST',
          // 默认就是这个
          // header: {
          //   'content-type': 'application/json',
          // },
          // headers: {
          //   'content-type': 'application/json',
          // },
          data: JSON.stringify(data),
          dataType: 'json',
          success: function success(res) {
            // 成功就销毁数据，失败就多尝试两次，还失败就暂存
            // 成功后检查是否有数据
            _this2.reporting = false;

            _this2.checkLog();
          },
          fail: function fail(err) {
            if (retryTimes < 2) {
              retryTimes++; // data['retryTimes'] = retryTimes;

              setTimeout(function () {
                reportData();
              }, 300);
            } else {
              _this2.reporting = false; // 把数据存起来，留待后面再上报使用

              _this2.save(logs);
            }
          }
        });
      };

      reportData();
    }
  }, {
    key: "save",
    value: function save(logs) {
      // 未上报成功的数据存储下来
      storagePiwik.set('piwikLog', logs);
    }
  }, {
    key: "random",
    value: function random(size) {
      var temp = '';

      for (var i = 0; i < size; i++) {
        temp += Math.floor(Math.random() * 10);
      }

      return temp;
    }
  }, {
    key: "getCommon",
    value: function getCommon() {
      var date = new Date();
      var config = this.getConfig();
      var data = this.getData();
      var devId = (0, _index2.hexMD5)(data.uuid + config.idsite).substr(8, 16);
      var screenWidth = data.screenWidth,
          screenHeight = data.screenHeight;

      var channelParams = _index.default.getChannel();

      var _ref = data.showOptions || {},
          _ref$scene = _ref.scene,
          scene = _ref$scene === void 0 ? '' : _ref$scene; // 支付宝版本低时，取不到省市相关信息


      var regionId = this.getRegionId(data.province);
      var locate = {};
      var _data$location = data.location,
          location = _data$location === void 0 ? {} : _data$location;
      Object.assign(locate, {
        country: 'cn',
        lat: location.latitude || 0,
        long: location.longitude || 0
      });

      if (regionId) {
        Object.assign(locate, {
          region: regionId,
          city: location.province
        });
      }

      var temp = _objectSpread({
        idsite: config.idsite,
        rec: 1,
        _id: devId,
        // 支付宝小程序使用 user_id + idsite 前端生成ID，微信小程序使用 openid + idsite 前端生成ID
        // ...channelParams,
        uid: '',
        // 这里不加
        res: screenWidth ? "".concat(screenWidth, "x").concat(screenHeight) : '',
        r: this.random(6),
        h: date.getHours(),
        m: date.getMinutes(),
        s: date.getSeconds(),
        send_image: 0,
        url: data.url,
        urlref: data.urlref,
        _ref: data._ref,
        action_name: '',
        // 事件名称，用户上报PV、UV时的页面路径
        // 额外参数 上报次数，以及错误重试次数
        // rq_c: 0,
        // retryTimes: 0,
        // 当前页面访问时的数据
        cvar: JSON.stringify({
          1: ['channel', channelParams.channel],
          2: ['city_name', data.cityName],
          3: ['spm', channelParams.spm],
          4: ['user_id', data.userId || '']
        }),
        // 记录访问最后一个页面的数据(每次上报，只是 piwik 数据库中覆盖式记录只存在一条记录)
        // https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/scene.html
        _cvar: JSON.stringify({
          1: ['spm', channelParams.spm],
          2: ['openid', data.openId || null],
          3: ['city_name', data.cityName || null],
          4: ['user_id', data.userId || ''],
          5: ['scene', scene || ''] // 场景值

        }),
        cdt: parseInt(date / 1000)
      }, locate);

      return temp;
    }
  }, {
    key: "getRegionId",
    value: function getRegionId(province) {
      if (!province) return '';
      return _regionMap.regionMap[province] || '';
    }
  }]);

  return Plugin;
}(_pluginBase.default);

var _default = Plugin;
exports.default = _default;
module.exports = exports.default;