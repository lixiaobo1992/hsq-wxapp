const ald = require('./utils/ald-stat.js')
import {
  me,
  xmini,
  xApp,
  storage,
  mapActions
} from './config/xmini';

import { scStats } from './utils/shence.js';
import { gioInit } from './utils/gioConfig.js';

// growingio 数据统计
gioInit();
// 神策数据统计
scStats();


// import { openIdUrl } from './config';

import api from './api/index';
// console.warn('======index.js api', api);
import rewrite from './utils/rewrite';
import { limitGeo } from './utils/limitTip';
import urlParse from './utils/url-parse/index';
import bzbcTack from './utils/bzbcTask';
const { qs } = urlParse;

import {
  mixins,
  isRedDot
} from './utils/index';
// import limitTip from './utils/limitTip';
// import { default as MiniApp, test } from './utils/MiniApp';
// import MiniApp from './utils/MiniApp';

// console.log(limitGeo)

// console.log(MiniApp);
// test(123);
// 覆写小程序内部分方法(要启动时就调用执行)
rewrite();


const defaultAddressInfo = { "currentProvinceId": '857', "currentAddress": "上海 上海市", "addressId": null, "cityId": '857' };
const defalutGlobalData = {
  systemInfo: {}, // 系统信息
  netInfo: {},    // 网络信息
  addressId: null,
  qnInfo: {}, // 七牛 token 等
  location: '',
  logicDeviceId: '',
  sceneData: 1001,
  memberInfo:{},
};
let globalData = { ...defalutGlobalData };
// 初始化
Object.assign(globalData, wx.getStorageSync('globalData'));

let eventListenerCache = {};


xApp({
  onError(err) {
    console.error('小程序出错了', err);
  },
  onLaunch(options = {}) {
    console.warn('============app.js onLaunch')
    let { scene } = options;
    // xmini.piwikInit({
    //   siteId: 7,  // 2 用来测试
    //   uuid: me.$uuid(),
    //   category: 'hsq_wxapp',  // 默认事件分类
    //   ...xmini.getChannel(),
    // });

    const systemInfo = me.$getSystemInfo() || {};
    this.updateData({
      systemInfo: systemInfo,
      sceneData: scene
    });

    // initconfig api
    this.getConfig();

    xmini.store.dispatch('getZones');
    xmini.store.dispatch('setAddresses');
    // this.setBarRedDot();
  },
  onShow(options = {}) {

    // TODO: 添加发现新版本时更新小程序
    if (wx.canIUse('getUpdateManager')) {

      const updateManager = wx.getUpdateManager();

      updateManager.onCheckForUpdate(function (res) {
        // 如果有最新版
        console.log('是否有版本更新:', res)
        if (res.hasUpdate) {
          console.log('有新版本要更新');
        }
      });

      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success(res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
            }
          }
        })
      });

      updateManager.onUpdateFailed(function () {
        // 新版本下载失败
        wx.showModal({
          title: '已经有新版本了哟~',
          content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
        });
      });
    }


    console.log("APP onShow的参数options = ", options)
    const { logged, userInfo } = xmini.store.state.user
    xmini.piwikUpdate({
      isTrackWorking: true,
      userId: userInfo.user_id || '',
      openId: userInfo.wechat_open_id || '',
    });
    let { query, scene, referrerInfo, reLaunch } = options;
    console.log('scene___________', scene);
    if (query.scene) {
      query = Object.assign({}, query, mixins.dealSceneQuery(query.scene))
    }

    // 如果是从边走边吃小程序过来，并且isStartTask = true，启动任务计时器
    if (query && query.isStartTask == 1) {
      bzbcTack.startTimer(query.sign, query.taskTime);
    }

    console.log('new Query ===== ', query);

    if (query) {
      // 获取spm等参数，
      let newParams = this.getChannelParams(query);
      // 1047 扫码小程序码进入 自带渠道
      // 1048 长按图片识别小程序码
      // 1049 手机相册选取小程序码
      // 1037 小程序打开小程序
      const sceneArray = [1047, 1048, 1049];
      if (sceneArray.includes(scene) && query.scene) {
        let queryScene = decodeURIComponent(query.scene)
        queryScene = qs.parse(queryScene);
        newParams = this.getChannelParams(queryScene);
      } else if (scene == 1037 && referrerInfo.extraData) {
        // 小程序打开小程序
        // let appid = referrerInfo.appId;
        const extraData = referrerInfo.extraData
        newParams = this.getChannelParams(extraData);
      }
      console.log('app onshow newParams:', newParams);

      // !!尽量不影响原来的逻辑
      if (newParams.spm) {
        const newSpm = this.parsingSpm(newParams.spm);
        this.updatedSpm(newSpm)
        delete newParams.spm;
      }

      // 更新 请求参数
      api.setCommonParams(newParams)

      // 更新 信息
      xmini.setChannel(newParams);

    }

    this.updateData({
      sceneData: scene
    });


    // 获取广告投放的 gdt_vid
    if (query && query.gdt_vid) {
      const { gdt_vid, weixinadinfo, weixinadkey } = query;

      api.setCommonParams({
        ad_click_id: gdt_vid,
        weixinadinfo,
        weixinadkey
      })

    }

    // wx.showToast('demo testing');
    wx.getNetworkType({
      success: (res) => {
        console.log(res);
        // if (!res.networkAvailable) {
        //   wx.showToast('网络不可用，请稍后重试...');
        // }
        this.updateData({
          netInfo: res,
        });
      },
    });
    // wx.showTabBarRedDot({
    //   index: 2,   //代表哪个tabbar（从0开始）
    // });
    this.setBarRedDot();

  },

  onHide() {
    console.log('App Hide')
    bzbcTack.clearTimer();
  },
  getConfig() {
    api.getConfig({
      isLoading: false,
    }, (res) => {
      const { hotSearch } = res.data;
      this.updateData({ hotSearch: hotSearch });

      this.onPublishEvent && this.onPublishEvent('KHOT_SEARCH_WORDS', {});
    }, (err) => {
      console.log('initconfig:' + err.message);
      return true;
    });
  },
  // 解析spm
  parsingSpm(tempSpm){
    const setArray = ['spm', 'page', 'block'];
    const spmObj = tempSpm.split('.');
    let newSpm = {};
    // 这里在解析三段spm
    if (spmObj.length > 1) {
      for (let i = 0; i < spmObj.length; i++) {
        newSpm[setArray[i]] = spmObj[i];
      }
    } else {
      newSpm['spm'] = tempSpm
    }

    return newSpm;
  },
  updatedSpm(newSpm) {
    xmini.store.dispatch('updatedSPM', newSpm);

    const { currentSpm, pre_spm } = xmini.store.state.spm;

    api.setCommonParams({
      spm: currentSpm || 'hsq_wxapp'
    })
    xmini.piwikUpdate({
      spm: currentSpm || 'hsq_wxapp',
      preSpm: pre_spm || ''
    })
  },
  getChannelParams(options) {
    // 内部变量全是用channel 而不要用channel_id
    if (typeof options !== 'object') return;
    // 此参数，在切换到后台后，再切换回来，参数丢失了
    // 更新业务渠道参数
    // 每次启动时，获取参数设置为默认值，之后透传当前页面的配置，若无则使用默认值替代
    // 其值为api、分享或页面使用

    const oldSpm = storage.get('spm');
    const { channel_id = '', spm = oldSpm } = options;

    if (!spm || (spm && spm !== oldSpm)) {
      storage.set('spm', spm || 'hsq_wxapp', 604800)
    }

    // https://tower.im/projects/9dc0e68edc64436aa73e8f0fa0a8ffad/docs/738f14ee9afa45df8d01846e3f3e0010/
    // 配置默认渠道参数等
    const entryChannel = {
      spm: spm, // 这里不要加默认的spm 当用户再次进入小程序的时候会重置上次的spm 值
      channel: channel_id || 'hsq_wxapp',
    };

    // xmini.setChannel(entryChannel);

    return entryChannel;
  },
  updateCommonParams(data = {}) {
    const {
      systemInfo = {},
      netInfo = {},
    } = data;
    api.setCommonParams({
      terminal: 'wxapp', // 系统版本，用于获取最新版数据
      device: systemInfo.brand,      // 设备
      swidth: systemInfo.windowWidth,      // 屏幕宽度
      sheight: systemInfo.windowHeight,    // 屏幕高度
      net: netInfo.networkType,        // 网络
    });
  },
  updateData(options = {}, reset) {
    if (reset) {
      globalData = { ...defalutGlobalData };
      wx.removeStorage({
        key: 'globalData',
        success() {
          console.log('reset 数据成功');
        },
      });
    } else {
      Object.assign(globalData, options);
      wx.setStorage({
        key: 'globalData',
        data: globalData,
        success() {
          console.log('写入数据成功');
        },
      });
    }
    const data = this.getData();
    this.updateCommonParams(data);
    return data;
  },
  resetData() {
    this.updateData(null, true);
  },

  clearUserInfo() {
    this.updateData({
      addressId: null,
    });
    xmini.store.dispatch('setAddresses', []);
    xmini.store.dispatch('setAddressInfo', defaultAddressInfo);
  },

  getData(key) {
    return (key && globalData[key]) ? { ...globalData[key] } : { ...globalData };
  },

  // 订阅通知
  onSubscribeEvent(that, key, fun) {
    console.log('订阅通知:', key)
    if (!fun && typeof fun != 'function') {
      console.warn('缺少订阅参数！')
      return;
    }
    let array = eventListenerCache[key] && eventListenerCache[key].slice(0);
    if (!array) {
      array = [];
    }
    let index = -1;
    const currPageName = that.getPageName()
    for (let i = 0; i < array.length; i++) { // 检查是否存在重复订阅
      if (array[i]['pagename'] === currPageName) {
        index = i;
        break;
      }
    }
    if (index !== -1) { //  删除重复订阅
      array.splice(index, 1);
    }
    array.push({ pagename: currPageName, fun: fun });
    eventListenerCache[key] = array;
    console.log('订阅事件列表：', eventListenerCache)
  },

  // 发送订阅通知  key建议全用大写，例如：KAA_BBB
  onPublishEvent(key, ...args) {
    console.log('发送订阅通知: ', key)
    const array = eventListenerCache[key] && eventListenerCache[key].slice(0);
    if (!array) {
      console.warn('未查到订阅项！')
      return;
    }
    for (var i = 0; i < array.length; i++) {
      if (array[i]["fun"]) {
        array[i]["fun"].call(this, ...args);
      }
    }
  },
  // 取消订阅
  offSubscribeEvent(key, pageName) {
    if (!pageName) {
      delete eventListenerCache[key];
    } else {
      let array = eventListenerCache[key] && eventListenerCache[key].slice(0);
      if (array && array.length > 1) {
        let index = -1;
        for (let i = 0; i < array.length; i++) {
          if (array[i]['pagename'] === pageName) {
            index = i;
            break;
          }
        }
        if (index !== -1) { //  删除重复订阅
          array.splice(index, 1);
        }
        eventListenerCache[key] = array
      } else {
        delete eventListenerCache[key];
      }
    }
  },
  //设置底部购物车红点
  setBarRedDot(){
    api.getUserCart(
      {
        isLoading: false,
      },
      res => {
        isRedDot(res.data.total_sku_cnt, 2);
      },
      err => {
        return true;
      }
    );
  },
});
