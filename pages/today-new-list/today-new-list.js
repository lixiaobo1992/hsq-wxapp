// pages/today-new-list/today-new-list.js
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

xPage({
  ...mixins,
  ...pullList,
  /**
   * 页面的初始数据
   */
  data: {
    isLoading:true,

    list: [],
    showFooter: false,
    listMode: 'card',
    lowerThreshold: 300,
    pullLoading: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onPageInit(options);
    this.setData({
      lowerThreshold: wx.getSystemInfoSync().screenHeight / 2,
    });
    this.refresh();
  },

  onShow() {
    this.updatadSpmPage(); // 新增更新spm 三段中的 page
  },

  onUnload() {

  },

  // pull refresh
  refresh: function () {
    this.initPullList();
    wx.showLoading();
    this.pullParams.scope = this;
    this.pullParams.weights = 1;
    this.pullModel = api.getNewSkuList;
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
  afterPullData(){
    this.setData({
      isLoading: false,
    })
  },
  // dealwith data
  dealList: function (list = []) {
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
          memberPrice: item.member_price,
        },
        isShowLootAll,
        tags: item.tags.splice(0,2) || [],
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

  // click event
  onTapNext: function (e) {
    const {
      id,
      index,
      online,
      instock,
      url = '',
    } = e.currentTarget.dataset;
    xmini.piwikEvent('pinActivitiesId', {
      'pinActivitiesId': id,
      index,
    });
    if (online && instock && url) {
      this.onUrlPage(e);
    }
  },
});
