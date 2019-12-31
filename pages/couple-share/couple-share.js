// pages/couple-share/couple-share.js
import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import {
  mapTo,
  pullList,
} from '../../utils/index';
import mixins from '../../utils/mixins';

import CountManger from '../../utils/CountManger';
import formatNum from '../../utils/formatNum';

const app = getApp();

let nowUserPage;
let coupleCountLimit;
let coupleJoinCount;
let nowShowList; // 当前展示的头像
let nowResList; // 一共存在的头像列表
let params;
let localDiffTime;
let localETime;

xPage({
  ...mixins,
  ...pullList,
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    shareInfo: true,
    isJoin: 1,
    status: 0,
    countLimit: 2,
    joinCount: 1,
    listMode: 'card',
    list: [],
    lowerThreshold: 300,
    pBatchTit: '',
    pBatch: '',
    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(query) {
    this.onPageInit(query);
    // 一时删不掉
    params = {
      pinEventId: query.id || '706974',
    };
    // this.setData({
    //   pageParams: params,
    // });
    // this.fetchData();
    // this.getCoupleRecommend();

    this.payRefresh = query.replace || false;
    // replace 支付成功打开的页面不监听
    if (!this.payRefresh) {
      // 从邀请好友页面支付成功后返回到当前页面时刷新
      app.onSubscribeEvent(this, 'KPAY_SUCCESS', (res) => {
        this.refresh();
      });
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.onMessage();
    if (this.data.leftTime > 0 && this.data.status === 1) {
      this.countDown();
    }
    this.refresh();
  },

  onUnload() {

    if (!this.payRefresh) {
      app.offSubscribeEvent('KPAY_SUCCESS', this.getPageName);
    }
    coupleCountLimit = 2;
    coupleJoinCount = 1;
    nowShowList = [];
    nowResList = [];
    this.clearPageData();
  },

  refresh() {
    this.fetchData();
  },
  onAuthSuccess() {
    this.refresh();
  },
  verifyAuth() {
    const { logged, userInfo } = this.data;
    const pageComponent = this.selectComponent('#dwd-page-couple-share');
    if (!logged) {
      // 显示登录弹窗
      pageComponent.setData({
        isShowLoginPopup: true
      });
      return false
    }
    return true;
  },
  getCoupleRecommend(){
    api.coupleRecommend({
      pinEventId: this.pageQuery.id || '706974',
    }, (res) => {
      wx.hideLoading();
      const { data } = res;
      const pinList = this.dealList(data);
      this.setData({
        isLoading: false,
        list: pinList,
      });
    }, (err) => {

    });
  },
  dealList: function (list) {
    return mapTo(list, (item) => {
      return {
        id: item.pinActivitiesId,
        title: item.coupleTitle,
        image: item.skuPic,
        priceObj: {
          rmb: 1,
          price: item.couplePrice,
          marketPrice: item.marketPrice,
        },
        member_price:(item.member_price  / 100).toFixed(2),
        tags: item.tags.splice(0,2) || [],
        inStock: item.inStock,
        onLine: item.onLine,
        merchantType: item.merchant_type,
        expired_date_text: item.expired_date_text_two,
      };
    });
  },
  fetchData() {
    coupleCountLimit = 2;
    coupleJoinCount = 1;
    nowShowList = [];
    nowResList = [];

    const { id = '1423' } =this.pageQuery;
    if(!id){
      wx.showToast('参数错误');
      return;
    }
    this.setData({
      isLoading: true,
    })
    api.coupleShareDetail({
      scope: this,
      weights: 1,

      pinEventId: id
    }, (res) => {
      // wx.hideLoading();
      const { data } = res;
      let leftTime = 1;
      let stateUrl = '';
      if (data.status !== 1) {
        if (data.status === 2) {
          if(data.activity_type == 2){
            if (data.lotteryStatus == 1){//等待开奖
              stateUrl = 'https://img1.haoshiqi.net/miniapp/couple-order/lottery_wait_2bf537d55e.png';
            } else if (data.lotteryStatus == 3){//中奖
              stateUrl = 'https://img1.haoshiqi.net/miniapp/couple-order/lottery_win_855127f729.png';
            } else {//未中奖
              stateUrl = 'https://img1.haoshiqi.net/miniapp/couple-order/lottery_fail_b2f895764f.png';
            }
          }else{
            stateUrl = 'https://img1.haoshiqi.net/wxapp/img/group_sc_1a1ed234f9.png';
          }
        } else {
          stateUrl = 'https://img1.haoshiqi.net/wxapp/img/group_fl_12af7b3a48.png';
        }
      }
      if (data.endTime <= res.timestamp) {
        leftTime = 0;
      }
      // 1拼团， 2抽奖团
      this.activityType = data.activity_type;
      this.setData({
        isLoading: false,

        orderType: data.activity_type == 1 ? 3 : 4,
        status: data.status, // 1:拼团中，2：拼团成功，3：拼团失败，
        isJoin: data.isJoin,
        countLimit: data.countLimit,
        joinCount: data.joinCount,
        stateUrl,
        title: data.title,
        endTime: data.endTime,
        timestamp: res.timestamp,
        leftTime,
        params: {
          pinEventId: id,
          pinActivitiesId: data.pinActivitiesId,
          skuId: data.skuId,
        },
        pinId: data.pinActivitiesId,
        shareInfo: {
          title: data.shareInfo.wechat.title,
          desc: data.shareInfo.wechat.content,
          imageUrl: data.shareInfo.wechat.thumbnail,
          piwikAction: 'c_share',
          piwikData:{
            link:data.stateUrl
          },
        },
      });

      if (data.skuInfo && data.skuInfo.pinActivitiesTitle)      {
        const pData = data.skuInfo;
        this.setData({
          // isJoin: true,//0：加入别人的团,1：自己开的团
          picList: pData.skuPics,
          pTit: pData.pinActivitiesTitle,
          pPrice: (pData.groupPrice/100).toFixed(2),
          pAmount: pData.restrictionAmount || 0,
          pMarketTit: pData.pricePrefix,
          pMarketPrice: (pData.marketPrice/100).toFixed(2),
          pBatchTit: pData.batch && pData.batch.name,
          pBatch: pData.batch && pData.batch.batch,
          pId: pData.skuId,
          pDescription: pData.description,
          pLabels: pData.labels,
        });
      }
      if (leftTime > 0 && data.status === 1) {
        this.countDown();
      }

      this.getCoupleRecommend();
    }, (err) => {
      // console.log(err);
    });
    params.pageNum = 1;
    nowUserPage = 1;
    this.getUserList(params);
  },
  // 获取头像列表
  getUserList(params1) {
    api.coupleUserList(params1, (res) => {
      coupleCountLimit = res.data.countLimit; // 拼团总人数
      coupleJoinCount = res.data.joinCount; // 当前参团人数
      if (params1.pageNum == 1){
        nowResList = [];
      }
      nowResList = [...nowResList, ...res.data.list]; // 当前加载过的头像
      nowShowList = [...nowResList]; // 当前展示的列表
      if (res.data.list.length < 10 && nowShowList.length < coupleCountLimit) {
        let length;
        if ((coupleCountLimit - nowShowList.length) > 10) {
          length = 10 - res.data.list.length;
        } else {
          length = coupleCountLimit - nowShowList.length;
        }
        const addRobotLength = new Array(length);
        nowResList = [...nowResList, ...addRobotLength];
        nowShowList = [...nowResList];
      }
      this.setData({
        showUserList: nowShowList,
      });
      this.showMoreAndLess();
    }, (err) => {
      // console.log(err);
      return true;
    });
  },
  // 控制显示和隐藏的按钮
  showMoreAndLess() {
    let showMore;
    let showLess;
    if (nowShowList.length >= coupleCountLimit) {
      showMore = false;
    } else {
      showMore = true;
    }
    if (nowShowList.length > 10) {
      showLess = true;
    } else {
      showLess = false;
    }
    this.setData({
      showMore,
      showLess,
    });
  },
  // 加载更多
  showMoreUser() {
    let length;
    const flag = nowShowList.length < nowResList.length;
    // 拼团人数大于现在展示的人数
    if (nowShowList.length < coupleJoinCount) {
      // 展示的人数小于加载过的人数，这时不用请求
      if (flag) {
        if ((nowResList.length - nowShowList.length) > 10) {
          length = 10;
        } else {
          length = nowResList.length - nowShowList.length;
        }
        nowShowList = nowResList.slice(0, nowShowList.length + length);
      } else {
        // 展示人数 >= 加载的人数 这时要加载
        params.pageNum = nowUserPage + 1;
        nowUserPage += 1;
        this.getUserList(params);
      }
    } else if (flag) {
      if (nowResList.length - nowShowList.length) {
        length = 10;
      } else {
        length = nowResList.length - nowShowList.length;
      }
      nowShowList = nowResList.slice(0, nowShowList.length + length);
    } else {
      if (coupleCountLimit - nowShowList.length) {
        length = 10;
      } else {
        length = coupleCountLimit - nowShowList.length;
      }
      const addRobotLength = new Array(length);
      nowResList = [...nowResList, ...addRobotLength];
      nowShowList = [...nowResList];
    }
    this.showMoreAndLess();
    this.setData({
      showUserList: nowShowList,
    });
  },
  // 隐藏
  showLessUser() {
    const { length } = nowShowList;
    if (length <= 10) {
      return;
    } else {
      nowShowList = nowShowList.slice(0, length - 10);
    }
    this.showMoreAndLess();
    this.setData({
      showUserList: nowShowList,
    });
  },
  countDown() {
    const that = this;
    const diffTime = (localDiffTime) ? localDiffTime : ((this.data.timestamp * 1000) - (+new Date()));
    const localEndTime =this.data.localEndTime ? this.data.localEndTime : ((this.data.endTime * 1000) + diffTime);

    localDiffTime = diffTime;
    localETime = localEndTime;
    this.countDownManger = new CountManger({
      times: 1000,
      dataList: [{}], // this.data.leftTime,
      set() {
        if (localEndTime - new Date() > 0) {
          this.start();
        } else {
          that.setData({
            leftTime: 0,
          });
        }
      },
      callback() {
        const leftTime = localEndTime - new Date();
        if (leftTime > 0) {
          const countDownInfo = formatNum(leftTime, true);
          countDownInfo.mark = ':';
          that.setData({
            countDownInfo,
          });
        } else {
          const countDownInfo = formatNum(0, true);
          countDownInfo.mark = ':';
          that.setData({
            countDownInfo,
          });
          this.clear();
        }
        console.log();
      },
    });
  },
  goDetail() {
    xmini.piwikEvent('拼团分享点击商品详情');
    let pageName = '';
    if (this.activityType == 1) {
      pageName = 'detail';
    }else {
      pageName = 'lottery-detail';
    }
    this.forward(pageName, {
      id: this.data.pinId,
    });
  },
  goIndex() {
    xmini.piwikEvent('拼团分享点击返回首页');
    wx.switchTab({
      url: '../index/index',
    });
  },
  // 参团
  joinNow() {
    xmini.piwikEvent('拼团分享点击立即参团');
    if(!this.verifyAuth()) return
    const { status, params } = this.data;
    if (status !== 1 || this.data.isJoin === 1) {
      return;
    }
    this.forward('order-commit', {
      skuId: params.skuId,
      pinActivitiesId: params.pinActivitiesId,
      pinEventId: params.pinEventId,
      orderType: this.data.orderType,
      amount: 1,
    });
  },
  // 当团长
  creatNow() {
    if (!this.verifyAuth()) return
    const { status, params } = this.data;
    if (status === 2) {
      xmini.piwikEvent('拼团分享点击我也要开团');
    } else if (status === 3) {
      xmini.piwikEvent('拼团分享点击我来当团长');
    }
    this.forward('order-commit', {
      skuId: params.skuId,
      pinActivitiesId: params.pinActivitiesId,
      orderType: this.data.orderType,
      amount: 1,
    });
  },
  onHide() {
    this.clearPageData();
  },
  clearPageData() {
    if (this.countDownManger) {
      this.countDownManger.clear();
    }
  },
  goRule() {
    xmini.piwikEvent('拼团分享点击参团规则');
    const ruleType = (this.activityType == 1) ? 0 : 1;
    this.forward('rule', { type: ruleType});
  },
  onTapNext: function (e) {
    const {
      id,
      online,
      instock
    } = e.currentTarget.dataset;

    this.forward('detail', {
      id,
    });
  },
});
