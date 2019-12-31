// pages/coupon-desc/coupon-desc.js
import {
  me,
  xmini,
  xPage,
} from '../../../config/xmini';
import mixins from '../../../utils/mixins';

xPage({
  ...mixins,

  /**
   * 页面的初始数据
   */
  data: {
    list:[
      '优惠券只能抵扣货款，不找零，不能抵扣配送费及其他费用；',
      '优惠券必须在有效期内使用，一旦使用将无法退回；',
      '使用优惠券消费时，开票金额不包含优惠金额；',
      '使用优惠券支付的订单，如发生退货，优惠券不予兑现，将按照货品实际金额退还实 际支付货款；',
      '优惠券细则由好食期在法律许可范围内提供解释。',
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onPageInit(options);
  },

  onShow() {
  },

  onUnload() {
  },
});
