// pages/coupon-sku-list/coupon-sku-list.js
import {
  me,
  xmini,
  xPage,
} from '../../../config/xmini';
import api from '../../../api/index';
import {
  mapTo,
  pullList,
} from '../../../utils/index';
import mixins from '../../../utils/mixins';

xPage({
  ...mixins,
  ...pullList,
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,

    lowerThreshold: 300,
    list: [], // 优惠券列表
    showFooter: false,
    pullLoading: false,
    listMode: 'card',
    params: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onPageInit(options);
    this.setData({
      lowerThreshold: wx.getSystemInfoSync().screenHeight / 2,
    });
    this.setNavigationBarTitle();
    this.refresh();
  },

  onShow() {
  },

  refresh() {
    this.onFetchData();
  },

  setNavigationBarTitle() {
    const { params } = this.data;
    let title = '';
    if (params.q) {
      title = params.q;
    } else {
      title = "使用范围";
    }
    wx.setNavigationBarTitle({
      title: title,
    });
  },

  // 优惠券列表
  onFetchData() {
    this.initPullList();
    wx.showLoading();
    const params = this.pageQuery;
    this.pullParams.pageNum= 1;
    this.pullParams.couponId= params.couponId;
    this.pullParams.q= params.q;
    this.pullParams.scope = this;
    this.pullParams.weights = 1;
    this.pullModel = api.getCouponSkuList;
    this.setData({
      isLoading: true,
    })
    // 主动触发加载事件
    this.onScrollToLower();
  },
  afterPull() {
    if (this.pullParams.pageNum == 1) {
      delete this.pullParams.scope;
      delete this.pullParams.weights;
    }
  },
  // dealwith data
  dealList: function (list) {
    return mapTo(list, (item) => {
      const isShowLootAll = !item.onLine || !item.inStock;
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
        isShowLootAll,
        tags: item.tags || [],
        inStock: item.inStock,
        onLine: item.onLine,
        endTime: item.endTime,
        showCountDownLimit: item.showCountDownLimit,
        merchantType: item.merchant_type,
        expired_date_text: item.expired_date_text_two,
        link: item.link,
      };
    });
  },
  afterPullData(){
    this.setData({
      isLoading: false
    })
  },
  // click event
  onTapNext: function (e) {
    const {
      id,
      index,
      online,
      instock,
      url = '',
    } = e.currentTarget.dataset;
    xmini.piwikEvent('优惠券商品列表点击商品', {
      'id': id,
      'index': index,
    });
    if (online && instock && url ) {
      // this.forward('detail', {
      //   id,
      // });
      this.onUrlPage(e);
    }
  },

  // 搜索
  onSearch(e) {
    const { id } = e.currentTarget.dataset;
    xmini.piwikEvent('优惠券商品列表点击搜索', {
      'id': id,
    });
    this.forward('search', {
      id,
      isPinSku: true,
    });
  },
});
