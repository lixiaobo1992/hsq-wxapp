// pages/search/search.js
import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import mixins from '../../utils/mixins';
import { debounce } from '../../utils/index';

const app = getApp();
let localHistory = [];

xPage({
  ...mixins,
  /**
   * 页面的初始数据
   */
  data: {
    historyList: [], // 历史搜索记录
    inputValue: '',
    couponId: '',
    focus: true,
    isPinSku: false, // 从单品sku列表跳转过来为true，其它情况为false
    hotSearchList: [],
    hotSearch:{},   // 推荐热词
    placeholder: '',
    searchList: [],     //原始搜索建议列表

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onPageInit(options);
    const { hotSearch = {} } = app.getData();
    console.log(app.getData())
    let placeholder = '';
    if (options.isPinSku) {
      const { skuHistoryList } = app.getData();
      localHistory = skuHistoryList || [];
      placeholder = '搜索可使用券的商品';
    }else {
      const { historyList } = app.getData();
      localHistory = historyList || [];
      this.onFecthData();
      placeholder = (hotSearch && hotSearch.value) || '搜索您想找的商品';
    }
    console.log(placeholder, 'placeholder');
    this.setData({
      historyList: localHistory,
      couponId: options.id || '',
      isPinSku: options.isPinSku || false,
      hotSearch: hotSearch || {},
      placeholder,
    });
  },

  onShow() {

    this.setData({
      focus: true,
    });
  },

  onUnload() {

  },

  // dealwith data
  onFecthData() {
    wx.showLoading();
    api.getHotSearch({
    }, (res) => {
      wx.hideLoading();
      this.setData({
        hotSearchList: res.data.list,
      });
    }, (err) => {
      wx.hideLoading();
    });
  },
  clearInput() {
    this.setData({
      inputValue: '',
      focus: true,
      searchList: []
    });
  },

  // 获取input value
  onInputValue(e) {
    this.setData({
      inputValue: e.detail.value,
    });
    if (e.detail.value) {
      debounce(this.getSearchSuggest.bind(this), 300)();
    } else {
      this.setData({
        searchList: []
      })
    }
  },
  getSearchSuggest() {
    api.getSearchSuggest({
      isLoading: false,
      keywords: this.data.inputValue
    }, res => {
      let { data: { list } } = res;
      this.setData({
        searchList: list
      });
    }, err => {
      console.log(err);
    })
  },
  goBack() {
    wx.navigateBack();
  },

  // 热门搜索
  onHotSearch(e) {
    const { value,index } = e.currentTarget.dataset;
    this.forward('couple-search-list', {
      q: value,
    });
    console.log(value, 'value111');
    xmini.piwikEvent('c_hotsch',{
      link:'',
      name:value,
      index,
    });
    this.onSaveLocal(false, value);
  },
  // onUrlPage(e){
  //   const { url,value,index } = e.currentTarget.dataset;
  //   console.log('e1111', e);
  //   xmini.piwikEvent('c_hotsch',{
  //     link: url,
  //     value,
  //     index,
  //   });
  // },
  // 搜索
  onInputSearch(e) {
    let value = this.data.inputValue;
    const { isPinSku } = this.data;
    const hotSearch = e.currentTarget.dataset.hotsearch;
    if (!hotSearch.url && hotSearch.value && !value) {
      value = hotSearch.value;
    }

    if (!value.length) {
      wx.showToast("关键字不能为空");
      return;
    }
    console.log('value', value);
    xmini.piwikEvent('c_schbox_textsch',{name:value});
    this.onSaveLocal(isPinSku, value);
    this.onForward(e.currentTarget.dataset.id, value, isPinSku);
  },

  // 保存在本地
  onSaveLocal(isPinSku, value) {
    if (localHistory.length) {
      let index = localHistory.indexOf(value);
      if (index > -1) {
        localHistory.splice(index, 1);
      }
      /* index: 数组开始下标
        len: 替换 / 删除的长度
        item: 替换的值，删除操作的话 item为空
      */
      localHistory.splice(0, 0, value);
    }else {
      localHistory.push(value);
    }

    // 取前10个
    if (localHistory.length > 10) {
      const array = localHistory.slice(0, 10);
      localHistory = array;
    }

    if (isPinSku) {
      app.updateData({ skuHistoryList: localHistory });
    }else {
      app.updateData({ historyList: localHistory });
    }

    this.setData({
      historyList: localHistory,
    });
  },

  // 点击历史记录跳转
  onClickHistory(e) {
    const { id, value } = e.currentTarget.dataset;
    const isPinSku = e.currentTarget.dataset.ispinsku;
    let index = localHistory.indexOf(value);
    if (index > -1) {
      localHistory.splice(index, 1);
    }
    /* index: 数组开始下标
      len: 替换 / 删除的长度
      item: 替换的值，删除操作的话 item为空
    */
    localHistory.splice(0, 0, value);
    app.updateData({ historyList: localHistory });
    this.setData({
      historyList: localHistory,
    });
    xmini.piwikEvent('c_hissch',{name:value});
    this.onForward(id, value, isPinSku);
  },

  onForward(couponId, q, isPinSku) {
    if (isPinSku) {
      this.forward('coupon-sku-list', {
        couponId,
        q,
      });
    }else {
      this.forward('couple-search-list', {
        q,
      });
    }
  },

  // 清空历史记录
  onGarbage(e) {
    const isPinSku = e.currentTarget.dataset.ispinsku;
    wx.showModal({
      title: '提示',
      content: '确定清空搜索历史吗？',
      success:(res) => {
        if (res.confirm) {
          if (isPinSku) {
            app.updateData({ skuHistoryList: null });
          }else {
            app.updateData({ historyList: null });
          }

          localHistory = [];
          this.setData({
            historyList: [],
          });
          xmini.piwikEvent('c_hissch_delebtn');
        }
      }
    })
  },
});
