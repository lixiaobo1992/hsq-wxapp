// pages/index/index.js
import {
  me,
  xmini,
  xPage,
  mapState,
  storage,
  mapActions
} from '../../config/xmini';
import api from '../../api/index';
import dealData from '../../utils/dealData';
// console.warn('=====index.js api', api);
import {
  mapTo,
  pullList,
} from '../../utils/index';
import mixins from '../../utils/mixins';

import { urlMap, getUrlType } from '../../utils/urlMap';
import CountManger from '../../utils/CountManger';
import { formatCountDown,formatDate } from '../../utils/dateUtil';
import { clone } from '../../utils/index';
import formatNum from '../../utils/formatNum';
let windowWidth;
const app = getApp();

xPage({
  ...mixins,
  ...dealData,
  ...pullList,
  /**
   * 页面的初始数据
   */
  oldE: {},
  hasOldE: false,
  _data: {
    collectionTipTimeoutTag: false,
    collectionTipTimeout: null, // 收藏弹窗的滑动隐藏计时器
  },
  data: {
    isLoading: true,
    collectionTip: true, // 收藏提示弹窗
    banner: {},
    showFooter: false,
    listMode: 'card',
    list: [],
    shareInfo: true,
    showBackTop: false,
    lowerThreshold: 300,
    pullLoading: true,
    couponList: [],
    showCouponTip: false,
    showFavorite: false,
    activeShow: true,
    couponShow: true,
    modules: [], // 首页模块
    newMsg: {},
    ...mapState({
      newMsg: state => state.msg.newMsg,
      logged: state => state.user.logged,
      // userInfo: state => state.user.userInfo,
    }),
    killTime:{}
  },
  // ...mapActions(['startPollingMsg', 'stopPollingMsg']),
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (query) {
    console.warn('============index.js onLoad', this)
    this.onPageInit(query);
    this.shareJump();
    this.initData();
    // const that = this;
    // app.onSubscribeEvent(this, 'KHOT_SEARCH_WORDS', (res) => {
    //   const { hotSearch } = app.getData();
    //   that.setData({
    //     hotSearch: hotSearch || {},
    //   });
    // });

    // const { hotSearch } = app.getData();
    // windowWidth = wx.getSystemInfoSync().windowWidth;
    // this.setData({
    //   lowerThreshold: wx.getSystemInfoSync().screenHeight / 2,
    //   hotSearch: hotSearch || {},
    // });
    // this.refresh();
  },

  onShow() {
    this.updatadSpmPage(); // 新增更新spm 三段中的 page
    // console.log('========', this.selectComponent('#dwd-page'));

    this.onMessage();

    this.getServiceConfig();
    // this.startPollingMsg();
    // this.dealCountDown('item','1563246799');
  },
  onReachBottom() {
    this.onScrollToLower();
  },
  onUnload() {

    this.clearCountDown();
    app.offSubscribeEvent('KHOT_SEARCH_WORDS', this.getPageName);

    this.closeTip();
    // this.stopPollingMsg();
  },

  onHide() {
    this.clearCountDown();
    // this.stopPollingMsg();
    this.closeTip();

    // 隐藏弹窗
    this.selectComponent('#dwd-page-index').closePopup();
  },
  gotoTest() {

    this.forward('test')
  },
  initData() {
    const that = this;
    app.onSubscribeEvent(this, 'KHOT_SEARCH_WORDS', (res) => {
      const { hotSearch } = app.getData();
      that.setData({
        hotSearch: hotSearch || {},
      });
    });

    const { hotSearch } = app.getData();
    windowWidth = wx.getSystemInfoSync().windowWidth;
    this.setData({
      lowerThreshold: wx.getSystemInfoSync().screenHeight / 2,
      hotSearch: hotSearch || {},
    });
    this.refresh();
  },
  refresh() {
    this.getIndex();
    this.initPullList();
    this.pullModel = api.getCoupleListV1;
  },
  // 页面滑动监听
  scrpllIndex(e){
    if (this.data.collectionTip && !this._data.collectionTipTimeoutTag){
      this._data.collectionTipTimeoutTag = true;
      clearTimeout(this._data.collectionTipTimeout);
      this._data.collectionTipTimeout = setTimeout(() => {
        this.setData({
          collectionTip: false,
        })
      }, 3000)
    }
  },
  onAuthSuccess() {
    console.log('授权成功喽')
  },
  // 获取首页广告模块数据
  getIndex() {
    this.setData({
      isLoading: true,
    })
    api.getIndex({
      scope: this,
      weights: 1,
    }, (res) => {
      wx.hideLoading();
      wx.stopPullDownRefresh()
      const { info = {} } = res.data;
      const newModules = this.getModules(res);
      // console.log(this.data.list, 'item list');
      // console.log('newModules', newModules);
      // this.dealCountDown(list)
      this.setData({
        isLoading: false,
        modules: newModules,
        floats: info.floats || [],
      }, () => {
        //
      });
      // console.log(this.data.timestamp,'times moduleItem');
      // 主动触发加载事件
      this.onScrollToLower();
    }, (err) => {
      wx.stopPullDownRefresh()
    });
  },
  onShowAll(data){
    const { index,id,status } = data;
    const moduleIndex = this.data.modules.findIndex((item,index) => {return item.id == id});
    console.log(this.data, 'index data', moduleIndex);
    this.setData ({
      [`modules[${moduleIndex}].list[${index}].showupArrow`]: !status
    })
  },
  dealList(list) {
    return mapTo(list, (item,index) => {
      return {
        ...item,
        tags: (item.tags || []).splice(0, 2),
        market_price: (item.market_price / 100).toFixed(2),
        price: this.productPrice((item.price / 100).toFixed(2)),
        member_price:(item.member_price  / 100).toFixed(2),
        link: item.link,
        expired_date_text: item.expired_date_text_two,
        // 添加统计信息
        'piwikName':'c_pdr2',
        'piwikData':{
          index,
          pinActivitiesId:item.biz_id,
        },
      };
    });
  },
  //处理秒杀场次
  dealTimeOpt(startTime,endTime,serveTime){
      // console.log(startTime, 'deal moduleItem');
      let remainTime = endTime - serveTime;
      let mStatus = formatDate(startTime,'YM') == formatDate(serveTime,'YM');//是否跨月
      if(!mStatus){
        return formatDate(startTime,'m月d日')
      }
      if(remainTime > 0){
        let day = Math.abs(formatNum((serveTime - startTime) * 1000).day);
        switch (day){
          case 0:
            return formatDate(startTime,'h')+`点场`;
          case 1:
            return `明天`+formatDate(startTime,'h')+`点`;
          // case 2:
          //   return formatDate(startTime,'M日H点');
          default:
            return formatDate(startTime,'d日h点');
        }
        // console.log(formatNum(remainTime).day,'time moduleItem');
      }else{
        // remainTime = (serveTime - startTime) * 1000;
        // console.log(formatNum(remainTime),'moduleItem day');
        return 'end';
      }
  },
  afterPullData() {
    //console.log('length', this.data.list.length);
    // this.startCountDown();
  },

  startCountDown() {
    const that = this;

    const { list = [], diffTime } = that.data;
    if (!list.length) return;

    const countDownOptions = {
      times: 1000,
      dataList: list,
      set() {
        this.localEndTime = (this.data.endTime * 1000) + diffTime;
        const leftTime = this.localEndTime - Date.now();
        const isStartCountdown = leftTime > 0 && leftTime < (this.data.showCountDownLimit * 1000);
        if (isStartCountdown) {
          this.start();
        }
        that.setData({
          [`list[${this.index}].isSetCountDown`]: true,
        });
      },
      callback() {
        const leftTime = this.localEndTime - Date.now();
        if (leftTime > 0) {
          const format = leftTime > 86400000 ? 'd天 H:F:S' : 'H:F:S';
          const info = formatCountDown(leftTime, format);
          that.setData({
            [`list[${this.index}]`]: Object.assign({}, that.data.list[this.index], { countDownInfo: info }),
          });
        } else {
          that.setData({
            [`list[${this.index}]`]: Object.assign({}, that.data.list[this.index], { countDownInfo: null }),
          });
          this.clear();
        }
      },
    };

    if (!this.countManger) {
      this.countManger = new CountManger(countDownOptions);
    } else {
      this.countManger.add(countDownOptions);
    }
  },

  clearCountDown() {
    const that = this;
    // if (this.countManger) {
    //   this.countManger.clear(function() {
    //     // 不要使用箭头函数
    //     that.setData({
    //       [`list[${this.index}].isSetCountDown`]: false,
    //     });
    //   });
    // }
  },

  onTapNext(e) { //暂停使用，走afterFormIdSubmit
    this.setOldE(e);
  },

  // 去地址选择页面
  // onLocationPage(e){ //暂停使用，走afterFormIdSubmit
  //   this.setOldE(e);
  // },

  onDetailPage(e){ //暂停使用，走afterFormIdSubmit
    this.setOldE(e);
  },

  // 搜索
  onSearch(e) { //暂停使用，走afterFormIdSubmit
    xmini.piwikEvent('c_schbox');
    this.setOldE(e);
  },

  setOldE(e) {
    if (e) {
      this.oldE = clone(e);
      this.hasOldE = true;  //阻止点击空白地区跳转
    }
  },

  calculateModuleHeight(width, height){
    if(!width || width == 0){
      width = windowWidth;
    }
    return Math.round(height / width * windowWidth);
  },

  calculateModuleMargin(margin = 0){
    return Math.round(windowWidth / 375 * margin);
  },

  onUrlPage(e) { //覆盖mixins中的方法，并存下e，在发送formId后重新调用
    this.setOldE(e);
  },

  afterFormIdSubmit() { //formId提交之后调用，注意给页面、组件的事件view上加data-form-type
    const oldE = this.oldE || {};
    if (this.hasOldE && oldE.currentTarget && oldE.currentTarget.dataset) {
      const { formType } = oldE.currentTarget.dataset;
      if (formType == 'onUrlPage') {
        mixins.onUrlPage.call(this, oldE);
      } else if (formType == 'search') {
        this.forward('search');
      } else if (formType == 'cardRecPin') {
        const {
          id,
          index,
          canBought,
        } = oldE.currentTarget.dataset;
        if(canBought){
          xmini.piwikEvent('推荐商品', {
            index: (index && index + 1) || 0,
            id: id,
          })
          this.forward('detail', {
            id,
          });
        }
      } else if (formType == 'card') {
        const {
          id,
          online,
          instock,
          index,
        } = oldE.currentTarget.dataset;
        xmini.piwikEvent('首页点击列表', {
          index: (index && index + 1) || 0,
          id: id,
        })
        if (online && instock) {
          this.forward('detail', {
            id,
          });
        }
      }
      this.hasOldE = false;
    }
  },
  getServiceConfig() {
    api.getServiceConfig({
      isLoading: false
    }, res => {
      const { list = [] } = res.data;
      // console.log(list);
      this.setData({
        tipList: list.slice(0, 2)
      })
      // console.log(res);
    }, err => {
      console.log(err);
      return true;
    })
  },
  closeTip() {
    const tipList = this.data.tipList || [];
    // 只有一个活动
    if (tipList.length && tipList.length == 1) {
      this.setData({
        activeShow: false,
        couponShow: false,
      })
    } else if (tipList.length && tipList.length == 2) {
      if (this.data.activeShow) {
        this.setData({
          activeShow: false,
        })
      } else {
        this.setData({
          couponShow: false,
        })
      }
    }
  },
  closeActiveTip(e) {
    const { type } = e.currentTarget.dataset;
    switch (type) {
      case '1':
        this.setData({
          activeShow: false,
        })
        break;
      case '2':
        this.setData({
          couponShow: false,
        })
        break;
      default:
        // do nothing
        break;
    }
  },
  couponItemClick(e) {
    const { couponindex, tipindex, code } = e.currentTarget.dataset;
    // console.log(couponindex);
    // console.log(tipindex);
    this.coderedeem(tipindex, couponindex, code)
  },
  coderedeem(tipindex, couponindex, code) {
    wx.showLoading();
    api.couponRedeem({
      code,
    }, (res) => {
      wx.hideLoading();
      wx.showToast('领取成功');
      this.setData({
        [`tipList[${tipindex}].list[${couponindex}].receiveType`]: 2,
      })
    }, (err) => {
      if (err.errno === 510010 || err.errno === 210013) {
        // 主动授权
        authMixin.userAuthLogin.call(this, {
          authType: 'auth_user',
          resolve: (res) => {
            this.coderedeem(code)
          },
          reject: (err) => {
            console.log(err);
          }
        })
        return true;
      } else {
        wx.hideLoading();
      }
    });
  },
  // 修改弹窗显示隐藏
  setCollectionTip(){
    this.setData({
      collectionTip: !this.data.collectionTip
    })
  },
  //
  goLogin(){
    const { logged } = this.data;
    const pageComponent = this.selectComponent('#dwd-page-index');
    if (!logged) {
      // 显示登录弹窗
      pageComponent.setData({
        isShowLoginPopup: true
      });
      return false
    }
  },
});
