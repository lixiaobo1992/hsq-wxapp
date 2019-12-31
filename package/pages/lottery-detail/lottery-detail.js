// pages/lottery-detail/lottery-detail.js
import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../../config/xmini';
import api from '../../../api/index.js';
import {
  mapTo,
  regImgs,
} from '../../../utils/index';
import mixins from '../../../utils/mixins';

// import CountManger from '../../../utils/CountManger';
import {
  formatDate,
  formatCountDown
} from '../../../utils/dateUtil';
// import formatNum from '../../../utils/formatNum';

let width;

xPage({
  ...mixins,

  // 页面的初始数据
  data: {
    isLoading: true,

    pinActivitiesId: 0,
    skuId: 0,
    currentCity: {},
    canDelivery: false,
    buttonTitle: '',   // 底部按钮文本
    remindStatus: 0,   // 用户订阅状态 0: 未操作过 1.已定阅 2 取消订阅
    status: 0, // 活动状态 1.预热 2.开团中 3.开奖中 4.开奖结束  1, 2未在线状态; 3,4为已结束状态
    statusTitle: '',   // 状态文本

    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    })
  },

  // 生命周期函数--监听页面加载
  onLoad: function (query) {
    this.onPageInit(query);
    this.index = query.index || 0;
    if (query.id) {
      width = wx.getSystemInfoSync().windowWidth;
      const { addressInfo } = xmini.store.state.location;
      this.setData({
        pinActivitiesId: query.id,
        currentCity: addressInfo,
      }, () =>{
        this.refresh();
      });
    } else {
      wx.showToast('参数错误');
    }
  },

  // 生命周期函数--监听页面显示
  onShow: function () {

    this.checkNewCurrentCity();
    this.isNeedLayout = true;
  },

  onHide: function () {
    this.isNeedLayout = false;
  },

  onUnload: function () {

    clearInterval(this.timer);
    this.timer = null;
  },

  // 初始化定时器
  initTimer: function () {
    this.timer = setInterval(this.timerCallback, 1000)
  },

  // 定时器回调 1s 回调一次
  timerCallback: function () {
    if (!this.isNeedLayout) return;
    const statusTitle = this.lotteryEndTimeFromNow();
    this.setData({
      statusTitle,
    })
  },

  refresh() {
    this.getLotteryInfo(this.data.pinActivitiesId);
  },
  onAuthSuccess() {
    console.log('详情页授权成功');
    this.refresh();
  },
  // 发消息通知列表页更新对应的状态
  sendRefreshMessage() {
    const app = getApp();
    app && app.onPublishEvent && app.onPublishEvent('KREMIND_STATUS', {
      remindStatus: this.data.remindStatus,
      index: this.index,
    });
  },

  // api
  getLotteryInfo(id) {
    this.setData({
      isLoading: true,
    })
    api.getLotteryInfo({
      scope: this,
      weights: 1,

      pinActivitiesId: id,
    }, (res) => {
      wx.hideLoading();
      const { data={} } = res;
      const { skuInfo={} } = data;
      const pics = skuInfo.pics || [];
      const swiperList = mapTo(pics, (item) => {
        return {
          image: item,
          url: '',
        };
      });
      this.timestamp = res.timestamp;
      this.diffTime = this.timestamp * 1000 - Date.now();
      this.startTime = data.startTime;
      this.endTime = data.endTime;
      let buttonTitle = this.setButtonTitle(data.status, data.remindStatus);
      const canBuy = (res.timestamp >= data.startTime) && skuInfo.canDelivery;
      const canSingle = Boolean(canBuy && skuInfo.canBuy);
      const canGroup = Boolean(canBuy && data.canBuy);
      this.setData({
        swiperInfo: {
          list: swiperList, // 如果数据不符合格式，可以使用 mapTo 方法
          hwRatio: 1,
          goUrlPage: 'goUrlPage',
          height: width,
        },
        title: data.title,
        price: data.groupPrice,
        marketPrice: data.marketPrice,
        joinCount: data.joinCount,
        rule:  data.rule && data.rule.split("\n") || [],
        remindStatus: data.remindStatus,
        skuId: data.skuId,
        pinActivitiesId: data.pinActivitiesId,
        status: data.status,
        desc: skuInfo.description,
        canDelivery: skuInfo.canDelivery,
        labels: skuInfo.labels,
        footerPriceObj: {
          singlePrice: data.singlePrice,
          groupPrice: data.groupPrice,
          count: data.countLimit,
          canSingle,
          canGroup,
          isLottery: true,
        },
        buttonTitle,
        isLoading: false,
      });
      this.setStatusText();
      this.getSkuDetailMore(data.productId);
    }, (err) => {
      wx.hideLoading();
    });
  },

  // 获取图文详情
  getSkuDetailMore(pid) {
    api.getProductDetail({
      productId: pid,
      sourceType: 4,
    }, (res) => {
      const detailMore = res.data;
      const pics = regImgs(detailMore.graphicDetail, true);
      this.setData({
        morePics: pics,
      });
    }, (err) => {
      // console.log(err);
    });
  },

  // 检查更新城市
  checkNewCurrentCity() {
    const { addressInfo } = xmini.store.state.location;
    let newAddress = this.data.currentCity.currentAddress != addressInfo.currentAddress;
    if (newAddress) {
      this.setData({
        currentCity: addressInfo,
      });
      this.refresh();
      this.postMessage('index', {
        needRefresh: true,
      });
    }
  },

  // 城市选择
  onSelectCity() {
    this.setData({
      didShowCitySelection: true,
    });
  },

  // 切换地址
  onSelectingNewCity() {
    const { addressInfo } = xmini.store.state.location;
    this.setData({
      currentCity: addressInfo,
    });
    this.refresh();
  },

  // 底部按钮文本
  setButtonTitle(status, remindStatus) {
    switch (status) {
      case 1:
        if (remindStatus == 1) {
          return "取消提醒";
        }else {
          return "提醒我";
        }
        break;
      case 3:
        return "更多抽奖团";
        break;
      case 4:
        return "查看中奖详情";
        break;
      default:
        return "";
        break;
    }
  },
  verifyAuth() {
    const { logged, userInfo } = this.data;
    const pageComponent = this.selectComponent('#dwd-page-lottery-detail');
    if (!logged) {
      // 显示登录弹窗
      pageComponent.setData({
        isShowLoginPopup: true
      });
      return false
    }
    return true;
  },
  // 购买
  toOrderCommitOld(e) {
    if (!this.data.footerPriceObj.canSingle) {
      return;
    }

    if (!this.data.footerPriceObj.canGroup) {
      return;
    }

    if (!this.verifyAuth()) return;

    const { type } = e.currentTarget.dataset;
    this.forward('order-commit', {
      pinActivitiesId: this.data.pinActivitiesId,
      skuId: this.data.skuId,
      orderType: type,
      amount: 1,
    });
  },

  // 点击按钮状态
  onClickStatus() {
    if (this.data.status == 1 || this.data.status == 4) {
      if (!this.verifyAuth()) return
    }
    switch (this.data.status) {
      case 1:
        let remindStatus = this.data.remindStatus;
        let buttonTitle;
        if (remindStatus == 1) {
          remindStatus = 2;
          buttonTitle = "提醒我";
        }else {
          remindStatus = 1;
          buttonTitle = "取消提醒"
        }
        wx.showLoading();
        api.getLotterySubScribe({
          pinActivitiesId: this.data.pinActivitiesId,
          type: remindStatus,
        }, (res)=> {
          wx.hideLoading();
          this.setData({
            remindStatus,
            buttonTitle,
          });
          this.sendRefreshMessage();
        }, (err) => {
          wx.hideLoading();
        });
        break;
      case 3:
        this.forward('lottery-list', {
        });
        break;
      case 4:
        this.forward('lottery-win-list', {
          id: this.data.pinActivitiesId,
        });
        break;
      default:
        break;
    }
  },

  // 状态文本
  setStatusText() {
    switch (this.data.status) {
      case 1:
        const today = (new Date(this.timestamp * 1000)).getDate();
        const target = formatDate(this.startTime, "d");
        const day = target - today;
        const hour = formatDate(this.startTime, "H:F");
        let statusTitle;
        if (day >= 3) {
          statusTitle = day + '天后开抢'
        } else {
          switch (day) {
            case 0:
              statusTitle = hour + '开抢';
              break;
            case 1:
              statusTitle = '明天' + hour + '开抢';
              break;
            case 2:
              statusTitle = '后天' + hour + '开抢';
              break;
          }
        }
        this.setData({
          statusTitle,
        })
        break;
      case 2:
        if (this.endTime < this.timestamp) {
          statusTitle = "已结束";
        }else {
          this.initTimer();
          statusTitle = this.lotteryEndTimeFromNow();
        }
        this.setData({
          statusTitle,
        })
        break;
      case 3:
        this.setData({
          statusTitle: "开奖中",
        })
        break;
      case 4:
        this.setData({
          statusTitle: "已开奖",
        })
        break;
      default:
        break;
    }
  },

  /**
    * 计算现在到结束时间还要多久
    * target 结束时间的时间戳 以s为单位
  */
  lotteryEndTimeFromNow() {
    const localEndTime = this.endTime * 1000 - this.diffTime;
    const leftTime = localEndTime - Date.now();
    if (leftTime >= 0) {
      const format = leftTime > 86400000 ? 'D天 H:F:S' : 'H:F:S';
      return formatCountDown(leftTime, format) + " 结束";
    } else {
      return "已结束";
    }
  },
});
