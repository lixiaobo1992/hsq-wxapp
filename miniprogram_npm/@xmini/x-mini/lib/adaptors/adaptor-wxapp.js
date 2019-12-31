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
  name: 'wxapp',
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
    /* eslint no-global-assign: 0 */
    wx = Object.assign({}, wx);
    var me = wx; // const request = me.request;
    // Object.defineProperty(me, 'request', {
    //   get() {
    //     return queue(request, 10);
    //   },
    // });

    me.$storage = _storage.storage;

    me.$getUUID = function () {
      var uid = storageSystem.get('uuid');

      if (!uid) {
        uid = (0, _index.uuid)(32);
        storageSystem.set('uuid', uid); // $log.set({ is_first_open: true });
      } // console.warn(':::uuid:', uid);


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
    // onResize() {}, // 页面尺寸改变时触发，详见 响应显示区域变化
    onTabItemTap: function onTabItemTap() {}
  } // component: {
  //   lifetimes: {
  //     created() {}, // 在组件实例刚刚被创建时执行 1.6.3
  //     attached() {}, // 在组件实例进入页面节点树时执行 1.6.3
  //     ready() {}, // 在组件在视图层布局完成后执行 1.6.3
  //     moved() {}, // 在组件实例被移动到节点树另一个位置时执行 1.6.3
  //     detached() {}, // 在组件实例被从页面节点树移除时执行 1.6.3
  //     error() {}, // 每当组件方法抛出错误时执行 2.4.1
  //   },
  //   pageLifetimes: {
  //     show() {}, // 页面被展示
  //     hide() {}, // 页面被隐藏
  //     resize() {}, // 页面尺寸变化
  //   },
  // },

}; // 场景值 https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/scene.html

exports.lifecycle = lifecycle;
var SCENES = {
  '1001': '发现栏小程序主入口，「最近使用」列表（基础库2.2.4版本起包含「我的小程序」列表）',
  '1005': '顶部搜索框的搜索结果页',
  '1006': '发现栏小程序主入口搜索框的搜索结果页',
  '1007': '单人聊天会话中的小程序消息卡片',
  '1008': '群聊会话中的小程序消息卡片',
  '1011': '扫描二维码',
  '1012': '长按图片识别二维码',
  '1013': '手机相册选取二维码',
  '1014': '小程序模板消息',
  '1017': '前往体验版的入口页',
  '1019': '微信钱包',
  '1020': '公众号 profile 页相关小程序列表',
  '1022': '聊天顶部置顶小程序入口',
  '1023': '安卓系统桌面图标',
  '1024': '小程序 profile 页',
  '1025': '扫描一维码',
  '1026': '附近小程序列表',
  '1027': '顶部搜索框搜索结果页「使用过的小程序」列表',
  '1028': '我的卡包',
  '1029': '卡券详情页',
  '1030': '自动化测试下打开小程序',
  '1031': '长按图片识别一维码',
  '1032': '手机相册选取一维码',
  '1034': '微信支付完成页',
  '1035': '公众号自定义菜单',
  '1036': 'App 分享消息卡片',
  '1037': '小程序打开小程序',
  '1038': '从另一个小程序返回',
  '1039': '摇电视',
  '1042': '添加好友搜索框的搜索结果页',
  '1043': '公众号模板消息',
  '1044': '带 shareTicket 的小程序消息卡片 详情',
  '1045': '朋友圈广告',
  '1046': '朋友圈广告详情页',
  '1047': '扫描小程序码',
  '1048': '长按图片识别小程序码',
  '1049': '手机相册选取小程序码',
  '1052': '卡券的适用门店列表',
  '1053': '搜一搜的结果页',
  '1054': '顶部搜索框小程序快捷入口',
  '1056': '音乐播放器菜单',
  '1057': '钱包中的银行卡详情页',
  '1058': '公众号文章',
  '1059': '体验版小程序绑定邀请页',
  '1064': '微信连Wi-Fi状态栏',
  '1067': '公众号文章广告',
  '1068': '附近小程序列表广告',
  '1069': '移动应用',
  '1071': '钱包中的银行卡列表页',
  '1072': '二维码收款页面',
  '1073': '客服消息列表下发的小程序消息卡片',
  '1074': '公众号会话下发的小程序消息卡片',
  '1077': '摇周边',
  '1078': '连Wi-Fi成功页',
  '1079': '微信游戏中心',
  '1081': '客服消息下发的文字链',
  '1082': '公众号会话下发的文字链',
  '1084': '朋友圈广告原生页',
  '1089': '微信聊天主界面下拉，「最近使用」栏（基础库2.2.4版本起包含「我的小程序」栏）',
  '1090': '长按小程序右上角菜单唤出最近使用历史',
  '1091': '公众号文章商品卡片',
  '1092': '城市服务入口',
  '1095': '小程序广告组件',
  '1096': '聊天记录',
  '1097': '微信支付签约页',
  '1099': '页面内嵌插件',
  '1102': '公众号 profile 页服务预览'
};
exports.SCENES = SCENES;