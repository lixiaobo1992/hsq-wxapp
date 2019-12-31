import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import {
  mapTo,
  pullList,
} from '../../utils/index';
import mixins from '../../utils/mixins';
// import { getQueryString } from '../../utils/stringUtil';
import { formatDate } from '../../utils/dateUtil';
const WxParse = require('../../wxparse/wxParse.js');

xPage({
  ...mixins,
  ...pullList,

  data: {
    banner: {},
    showFooter: false,
    listMode: 'card',
    list: [],
    shareInfo: true,
    lowerThreshold: 300,
    showCoupon: false,
    couponHasMore: false,
    couponList: []
  },
  onLoad(query) {
    this.onPageInit(query);

    this.setData({
      lowerThreshold: wx.getSystemInfoSync().screenHeight / 2,
      shareInfo: {
        piwikAction: '专题页分享'
      }
    });

    this.fetchData();
  },

  onShow() {

  },

  onUnload() {

  },

  refresh() {
    this.initPullList();
    this.fetchData();
  },

  fetchData() {
    const { pageQuery } = this;
    // pageQuery.topic_code = 'f318c94a0772b58678985fd01a1154da';
    this.params = {
      // BETA
      // topicCode: pageQuery.topic_code || '6495ab8cc8d15adbb1987e5ab7723cd6',
      // PROD
      topicCode: pageQuery.id || pageQuery.topic_code,
    };
    this.pullParams.topicCode =  pageQuery.id || pageQuery.topic_code;
    this.pullModel = api.getTopicList;

    wx.showLoading();
    wx.showNavigationBarLoading()
    api.getTopicInfo({
      ...this.params,
    }, (res) => {
      wx.hideNavigationBarLoading()
      const { data: { status, detail, title } } = res
      if (status && status !== 3) {
        wx.showErrPage({
          title: '稍等一下，页面一会就回来'
        }, true);
        return;
      } else {

      }
      // 修改标题
      if (title && title !== '') {
        this.setHeaderTitle(title)
      }

      if(detail){
        const tempDetail = decodeURIComponent(detail || '');
        let that = this;
        WxParse.wxParse('banner', 'html', tempDetail, that);
      }

      this.onScrollToLower();

    }, (err) => {
      wx.hideNavigationBarLoading()
      if (err.errno === 9610024) {
        wx.showErrPage('稍等一会儿，马上回来');
        return true;
      }
    });


  },

  dealList(list) {
    return mapTo(list, (item) => {
      return item.pinActivityId ? {
        id: item.pinActivityId,
        title: item.title,
        image: item.sku_pic,
        priceObj: {
          rmb: 1,
          price: item.group_price,
          marketPrice: item.market_price,
        },
        tags: item.tags || [],
        merchantType: item.merchant_type,
      } : false;
    });
  },

  onTapZtUrl(e) {
    // console.log(e);
    let { url, index } = e.currentTarget.dataset;
    xmini.piwikEvent('专题点击banner', url);
    if(url.indexOf('tpBridge.getCoupon') >= 0){
      const reg = /javascript\:tpBridge.getCoupon\(\'(.*?)\'\)/;
      let code = url.match(reg)[1];
      if(!code){
        wx.alert({
          title: '',
          content: '领券出错，无效的活动码',
          buttonText: '确定',
        });
      } else {
        wx.showLoading();
        api.addCoderedeem({
          code: code
        }, (res) => {
          this.getCoupons(code);
        }, (err) => {
          wx.hideLoading();
          if (err.errno != 510010) {
            wx.alert({
              title: '',
              content: err.errmsg,
              buttonText: '确定',
            });
            return true;
          }
        });
      }
    } else {
      this.onUrlPage(e);
    }
  },

  getCoupons(code) {
    api.getCouponInfo({
      rewardCode: code
    }, (res) => {
      wx.hideLoading();
      this.openCoupon(res.data);
    }, (err) => {
      wx.hideLoading();
      wx.showToast('领取成功');
      return true;
    });
  },

  openCoupon(data) {
    let couponList = data.couponList || [];
    let couponHasMore = false;
    if(couponList.length > 3){
      couponList = couponList.slice(0,3);
      couponHasMore = true;
    }
    for(let item of couponList){
      if(/^[0-9]*$/.test(item.value)){
        item.value = item.value / 100;
        item.isNum = true;
      } else {
        item.isNum = false;
      }
      item.start_at = formatDate(item.start_at, 'Y.M.D');
      item.end_at = formatDate(item.end_at, 'Y.M.D');
    }
    this.setData({
      showCoupon: true,
      couponHasMore: couponHasMore,
      couponList: couponList
    })
  },

  closeCoupon() {
    this.setData({
      showCoupon: false
    })
  },

  stopProp() {

  },

  goCoupon() {
    xmini.piwikEvent('专题点击优惠券列表');
    this.closeCoupon();
    this.forward('coupon-list');
  },

  onTapNext(e) {
    const { index, id } = e.currentTarget.dataset;
    xmini.piwikEvent('专题点击列表', {
      index: (index && index + 1) || 0,
      id,
    });
    this.forward('detail', {
      id,
    });
  },
});
