"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SCENES = exports.lifecycle = exports.objMe = void 0;

var _storage = require("../core/storage");

var _index = require("../utils/index");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// import queue from '../core/queue';
// 系统相关
var storageSystem = new _storage.Storage('system', 31536000); // 适配小程序方法等
// 增强方法或属性全使用$开头
//   - $storage   优化缓存设置
//   - $getSystemInfo  获取系统信息
//   - $getCurPage() 获取当前页面
//   - $getPageInfo() 获取当前页面信息，如 pageName pagePath pageQuery
// 微信小程序是否是并发6个，怎么判断，目前在开发者工具上是6个（这个可能和浏览器有关系 http/1.1）

var objMe = {
  name: 'aliapp',
  getCurrentPages: function (_getCurrentPages) {
    function getCurrentPages() {
      return _getCurrentPages.apply(this, arguments);
    }

    getCurrentPages.toString = function () {
      return _getCurrentPages.toString();
    };

    return getCurrentPages;
  }(function () {
    return getCurrentPages();
  }),
  // 兼容处理微信小程序和支付宝小程序的差异
  init: function init() {
    var me = my;

    if (!me.request && me.httpRequest) {
      me.request = me.httpRequest;
    } // Object.defineProperty(me, 'request', {
    //   get() {
    //     return queue(me.request, 10);
    //   },
    // });


    me.$storage = _storage.storage;

    me.$getUUID = function () {
      var uid = storageSystem.get('uuid');

      if (!uid) {
        uid = (0, _index.uuid)(32);
        storageSystem.set('uuid', uid); // $log.set({ is_first_open: true });
      } // console.warn(':::uuid:', uid)


      return uid;
    };

    me.$getSystemInfo = function () {
      var systemInfo = storageSystem.get('systemInfo');

      if (!systemInfo) {
        systemInfo = me.getSystemInfoSync();
        storageSystem.set('systemInfo', systemInfo, 86400 * 365);
      }

      return systemInfo;
    }; // 此方法没必要缓存，因为网络状态随时可手动变
    // me.$getNetworkType = (cb) => {
    //   let natworkType = storageSystem.get('natworkType');
    //   if (!natworkType) {
    //     me.getNetworkType({
    //       success(res) {
    //         storageSystem.set('natworkType', res.natworkType);
    //         cb && cb(res);
    //       },
    //       fail(err) {
    //         cb && cb({});
    //       },
    //     });
    //   } else {
    //     cb && cb({
    //       natworkType,
    //     });
    //   }
    // };


    me.$getLocation = function (cb) {
      var location = storageSystem.get('location');

      if (!location) {
        me.getLocation({
          type: 'wgs84',
          // wxapp
          // type: 1, // aliapp
          // cacheTimeout: '600', // aliapp 默认30秒
          success: function success(res) {
            // 缓存15分钟
            storageSystem.set('location', res, 600);
            cb && cb(res);
          },
          fail: function fail(err) {
            cb && cb({});
          }
        });
      } else {
        cb && cb(location);
      }
    };

    me.$getCurPage = function () {
      var pages = getCurrentPages();
      var length = pages.length;
      if (!length) return {};
      var currentPage = pages[length - 1] || {};
      return currentPage;
    };

    me.$getPageInfo = function () {
      var currentPage = me.$getCurPage();
      var _currentPage$route = currentPage.route,
          route = _currentPage$route === void 0 ? '' : _currentPage$route,
          _currentPage$$pageQue = currentPage.$pageQuery,
          $pageQuery = _currentPage$$pageQue === void 0 ? {} : _currentPage$$pageQue;
      return {
        pageQuery: _objectSpread({}, $pageQuery),
        pagePath: route,
        pageName: route.split('/').reverse()[0] || '',
        referer: ''
      };
    };

    return me;
  }
}; // 生命周期回调、事件处理函数

exports.objMe = objMe;
var lifecycle = {
  app: {
    onLaunch: function onLaunch() {},
    // 小程序初始化完成时（全局只触发一次）
    onShow: function onShow() {},
    // 小程序启动，或从后台进入前台显示时
    onHide: function onHide() {},
    // 小程序从前台进入后台时
    onError: function onError() {},
    // 小程序发生脚本错误，或者 api 调用失败时触发，会带上错误信息
    onPageNotFound: function onPageNotFound() {}
  },
  page: {
    onLoad: function onLoad() {},
    // 监听页面加载
    onShow: function onShow() {},
    // 监听页面显示
    onReady: function onReady() {},
    // 监听页面初次渲染完成
    onHide: function onHide() {},
    // 监听页面隐藏
    onUnload: function onUnload() {},
    // 监听页面卸载
    // onPullDownRefresh() {}, // 监听用户下拉动作
    // onReachBottom() {}, // 页面上拉触底事件的处理函数
    onShareAppMessage: function onShareAppMessage() {},
    // 用户点击右上角转发
    // onPageScroll() {}, // 页面滚动触发事件的处理函数
    onResize: function onResize() {},
    // 页面尺寸改变时触发，详见 响应显示区域变化
    onTabItemTap: function onTabItemTap() {}
  } // component: {
  //   didMount() {},
  //   didUpdate() {},
  //   didUnmount() {},
  // },

};
exports.lifecycle = lifecycle;
var SCENES = {};
exports.SCENES = SCENES;