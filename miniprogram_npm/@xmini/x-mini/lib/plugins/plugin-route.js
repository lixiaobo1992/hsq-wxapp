"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pluginBase = _interopRequireDefault(require("../core/plugin-base"));

var _index = require("../utils/index");

var _index2 = _interopRequireDefault(require("../index"));

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

    _defineProperty(_assertThisInitialized(_this), "name", 'route');

    _defineProperty(_assertThisInitialized(_this), "events", {});

    _defineProperty(_assertThisInitialized(_this), "methods", {
      getPages: 'getPages' // setChannel: 'setChannel',
      // getChannelFilter: 'getChannelFilter',

    });

    _this.initPages(config.appConfig);

    return _this;
  }

  _createClass(Plugin, [{
    key: "pagesMap",
    value: function pagesMap() {
      var pageArr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      // 应该去掉最后一项，有可能是 index，以及第一项为 pages 的
      return pageArr.reduce(function (obj, item) {
        var page = item.split('/').reverse()[1] || '';
        /* eslint no-param-reassign: 0 */

        obj[page] = "".concat(item);
        return obj;
      }, {});
    }
  }, {
    key: "pagesObj",
    value: function pagesObj(allPages, tabPages) {
      return {
        allPages: this.pagesMap(allPages),
        tabPages: this.pagesMap(tabPages),
        defaultPage: allPages[0] && allPages[0].split('/').reverse()[1] || ''
      };
    }
  }, {
    key: "getPages",
    value: function getPages() {
      return {
        allPages: _objectSpread({}, this.pages.allPages),
        tabPages: _objectSpread({}, this.pages.tabPages),
        default: this.pages.defaultPage
      };
    } // const appConfig = typeof __wxConfig !== 'undefined' ? __wxConfig : require('/app.json');

  }, {
    key: "initPages",
    value: function initPages() {
      var appConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _appConfig$pages = appConfig.pages,
          pages = _appConfig$pages === void 0 ? [] : _appConfig$pages,
          _appConfig$tabBar = appConfig.tabBar,
          tabBar = _appConfig$tabBar === void 0 ? {} : _appConfig$tabBar;
      var tabBarList = tabBar.items || tabBar.list || [];
      var tabPages = tabBarList.map(function (item) {
        return item.pagePath;
      });
      this.pages = this.pagesObj(pages, tabPages);
      return this.pages;
    }
  }, {
    key: "urlParse",
    value: function urlParse() {
      var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var query = _objectSpread({}, params);

      var urlArr = url ? url.split('?') : [];
      var pageName = urlArr[0];
      if (!pageName) return;

      var _this$getPages = this.getPages(),
          allPages = _this$getPages.allPages,
          tabPages = _this$getPages.tabPages;

      var pagePath = '';
      var urlType = '';

      if (/^miniapp/.test(url)) {
        urlType = 'miniapp';
        pagePath = pageName.replace('miniapp://', '');
      }

      pagePath = allPages[pageName] || '';
      query = !urlArr[1] ? (0, _index.stringify)(query) : [(0, _index.stringify)(query), urlArr[1]].join('&');

      if (!pagePath) {
        if (url === '/') {
          pagePath = '';
        }
      }

      query = query ? "?".concat(query) : '';
      return {
        isTabPage: !!tabPages[pageName],
        urlType: urlType,
        pageName: pageName,
        pageQuery: query,
        pagePath: "".concat(pagePath),
        pageUrl: "".concat(pagePath).concat(query)
      };
    }
  }, {
    key: "goPage",
    value: function goPage(url) {
      var query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!url) return;
      var me = _index2.default.me;
      var replace = query.replace,
          back = query.back,
          appid = query.appid; // TODO: deal channel

      var page = url;
      var type = '';

      var _ref = this.urlParse(url, query) || {},
          pagePath = _ref.pagePath,
          pageUrl = _ref.pageUrl,
          isTabPage = _ref.isTabPage;

      type = replace ? 'replace' : back ? 'back' : '';

      if (/^miniapp/.test(url)) {
        var urlArr = url ? url.split('?') : [];
        url = urlArr[0].replace('miniapp://', ''); // appid, 跳转到的小程序appId
        // path, 打开的页面路径，如果为空则打开首页
        // extraData, 需要传递给目标小程序的数据

        var miniParams = {
          appid: appid,
          extraData: query,
          success: function success(res) {},
          fail: function fail(res) {},
          complete: function complete(res) {}
        };

        if (url) {
          miniParams.path = url;
        }

        this.goMiniUrl({
          path: url.replace('miniapp://', '/')
        });
        me.navigateToMiniProgram(miniParams);
        return;
      }

      if (!pagePath) return;
      page = {
        url: "/".concat(pageUrl)
      };

      if (isTabPage) {
        type = 'switch';
        page = {
          url: "/".concat(pagePath)
        };
      }

      delete query.replace;
      delete query.back; // 上传formid事件没办法触发，需要一点时间延迟
      // 不支持 async
      // await sleep(100);

      switch (type) {
        case 'replace':
          me.redirectTo(page);
          break;

        case 'back':
          me.navigateBack(page);
          break;

        case 'switch':
          // url 不支持 queryString
          me.switchTab(page);
          break;

        default:
          // navigateTo, redirectTo 只能打开非 tabBar 页面。
          // switchTab 只能打开 tabBar 页面。
          if (getCurrentPages().length === 10) {
            me.redirectTo(page);
          } else {
            me.navigateTo(page);
          }

          break;
      }
    }
  }, {
    key: "install",
    value: function install(xm) {
      var that = this;
      var mixins = {
        $forward: function $forward(url, query) {
          console.error('此方法公共不完善，请不要使用');
          that.goPage(url, query);
        },
        back: function back() {}
      };
      xm.addMixin('app', mixins);
      xm.addMixin('page', mixins); // xm.addMixin('component', mixins);
    }
  }]);

  return Plugin;
}(_pluginBase.default);

var _default = Plugin;
exports.default = _default;
module.exports = exports.default;