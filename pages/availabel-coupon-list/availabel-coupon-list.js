// pages/availabel-coupons-list/availabel-coupons-list.js
import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import {
  dealPrice,
} from '../../utils/index';
import mixins from '../../utils/mixins';

// import { formatDate } from '../../utils/dateUtil';

const app = getApp();
let paramers;

// let defaultCouponTitle = ['会员优惠券','平台优惠券'];
xPage({
  ...mixins,
  /**
   * 页面的初始数据
   */
  data: {
    listData: [],          // 可用优惠券列表  已处理数据
    // availabelList: [], // 可用优惠券列表  未处理数据
    // info: {},          // 使用优惠金额相关信息
    // couponTitle:defaultCouponTitle,
    couponType: 1,
    ...mapState({
      // logged: state => state.user.logged,
      // userInfo: state => state.user.userInfo,
      currentCoupon: state => state.order_commit.currentCoupon,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (query) {
    this.onPageInit(query);
    console.log(query.coupon_type,'query');
    this.setData({
      couponType:query.coupon_type || 1,
    })
  },

  onShow() {
    const { couponList } = xmini.store.state.order_commit;
    console.log(couponList,'couponList');
    if (couponList.length) {
      // let couponMember = couponList.filter(item => item.member_coupon == 2);
      // let couponArr = couponList.filter(item => item.member_coupon !== 2);
      // let couponList = [...couponMember, ...couponArr];
      let couponMember = couponList.filter(item => item.member_coupon == 2 );
      let couponArr = couponList.filter(item => item.member_coupon !== 2 );
      let newCouponList = [...couponMember, ...couponArr];
      const listData = this.dealList(newCouponList);
      xmini.store.dispatch('setSelectCouponList', newCouponList);
      this.setData({
        listData,
      })
    }
  },

  onUnload() {

  },


  // dealwith data
  dealList(list = []) {
    return (list || []).map((item, index) => {
      return {
        ...item,
        value: dealPrice(item.value, 100, false),
        // startStr: formatDate(item.start_at, 'Y.M.D'),
        // endStr: formatDate(item.end_at, 'Y.M.D'),
        expired_date_text: item.expired_date_text_two,
      }
    })
  },

  // 选择优惠券
  onSelectedCoupon(e) {
    const { index } = e.currentTarget.dataset;
    const { couponList, currentCoupon } = xmini.store.state.order_commit;
    xmini.piwikEvent('c_vipconponsel',{index});
    let tempCurrentCoupon = couponList[index];

    if (currentCoupon && currentCoupon.coupon_code == tempCurrentCoupon.coupon_code) {
      tempCurrentCoupon = {}
    }
    xmini.store.dispatch('setCurrentCoupon', tempCurrentCoupon);
  },

  // 确定
  onConfirm(e) {
    this.back();
  },
});
