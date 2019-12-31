// pages/coupon-list/coupon-list.js
import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../../config/xmini';
import api from '../../../api/index';
import {
  pullList,
  dealPrice,
} from '../../../utils/index';
import mixins from '../../../utils/mixins';

import { formatDate } from '../../../utils/dateUtil';

const couponType = [
  {
    name: '未使用',
    num: 0
  },
  {
    name: '已过期',
    num: 0
  },
  {
    name: '已使用',
    num: 0
  }
]

xPage({
  ...mixins,
  ...pullList,
  // 页面的初始数据
  data: {
    isLoading: true,

    list: [], // 优惠券列表
    showFooter: false,
    pullLoading: false,
    inputValue: '',

    type: 1,
    couponType,

    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    }),
  },

  // 生命周期函数--监听页面加载
  onLoad(options) {
    this.onPageInit(options);

    this.refresh();
  },

  onShow() {

  },

  onUnload() {

  },
  refresh() {
    this.onFetchData();
  },
  onTabTypeChange(e) {
    const { type } = e.currentTarget.dataset;
    console.log('type:', type);
    this.setData({
      type,
    }, () => {
      this.refresh();
    })
  },
  // 优惠券列表
  onFetchData() {
    this.initPullList();
    wx.showLoading();
    // 1: 可使用 2: 已过期 3已使用
    this.pullParams.pageNum = 1
    this.pullParams.type = this.data.type; // 类型：1可用优惠券
    this.pullParams.scope = this;
    this.pullParams.weights = 1;
    this.pullModel = api.getUserCouponList;

    this.setData({
      isLoading: true,
    })
    // 主动触发加载事件
    this.onScrollToLower();
  },

  dealList(list = []) {

    return (list || []).map((item, index) => {
      let usage_desc = item.usage_desc ? item.usage_desc + '' : ''
      usage_desc = usage_desc.replace('\\r\\n', '\n');
      let status = 0;
      let btnText = '...'
      const {
        is_expired, //
        is_used,
      } = item;

      if (is_expired) {
        status = 2;
        btnText = '已过期'
      }
      if (is_used) {
        status = 3;
        btnText = '已使用'
      }
      if (!is_expired && !is_used) {
        status = 1;
        btnText = '立即使用'
      }

      return {
        ...item,
        value: dealPrice(item.value, 100, false),
        startStr: formatDate(item.start_at, 'Y.M.D'),
        endStr: formatDate(item.end_at, 'Y.M.D'),
        coupon_status: status,
        btnText,
        usage_desc,
        isShowRule: false, // 是否显示详细信息
        piwikEvent: 'c_use',
        piwikData: {
          couponcode: item.coupon_id,
          name: item.title
        }
      }
    })
  },
  afterPull(res) {
    this.setData({
      isLoading: false
    })
    // console.log(res);
    if (this.pullParams.pageNum != 1) return
    delete this.pullParams.scope;
    delete this.pullParams.weights;
    const { couponCnt } = res.data;
    this.setData({
      [`couponType[0].num`]: couponCnt.avaliableCnt || 0,
      [`couponType[1].num`]: couponCnt.expiredCnt || 0,
      [`couponType[2].num`]: couponCnt.usedCnt || 0
    })
  },

  // 扫码
  onScan() {
    wx.scanCode({
      success:(res) => {
        console.log(res);
        this.coderedeem(res.result);
      },
      fail:(err) => {
        wx.showToast(err.message);
      },
    })
  },

  // 添加券码
  formSumbit(e) {
    const { code } = e.detail.value;
    xmini.piwikEvent('c_addcoupom');
    if (!code) {
      wx.showToast('请输入活动码')
      return;
    }

    this.coderedeem(code);
  },

  // 添加券码接口
  coderedeem(code) {
    xmini.piwikEvent('c_scanadd', {
      'code': code,
    });
    wx.showLoading();
    api.addCoderedeem({
      code,
    }, (res) => {
      wx.hideLoading();
      wx.showToast('添加成功');
      this.refresh();
      this.setData({
        inputValue: '',
      });
    }, (err) => {
      wx.hideLoading();
      wx.showToast(err.message);
    });
  },

  // 使用说明
  onDesc() {
    xmini.piwikEvent('c_info');
    this.forward('coupon-desc');
  },

  // 详情信息
  onRule(e) {
    const { index, name } = e.currentTarget.dataset;
    xmini.piwikEvent('c_coupon_detail', {
      'index': index,
      name,
    });
    this.setData({
      [`list[${index}].isShowRule`]: !this.data.list[index].isShowRule,
    });
  },
  // goDetail(e){
  //   this.onUrlPage(e);
  // }
});
