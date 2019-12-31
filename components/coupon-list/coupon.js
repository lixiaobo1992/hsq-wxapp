import {
  me,
  xmini,
} from '../../config/xmini';
import api from '../../api/index';
//提取获取券信息,和券兑换js
const coupon  = {
    //获取券列表的参数
    couponParams :{
      merchantId:0,
    },
    //获取券列表
    getCouponList() {
      me.showLoading();
      api.getMerchantCouponlist({
          ...this.couponParams,
        },
        res => {
          me.hideLoading();
          console.log(res, 'res data');
          const data = res.data;
          let coupons = data.list || [];
          if (coupons.length) {
            coupons = coupons.map(item => {
              return {
                isRedeem: item.usable_num,
                code: item.code,
                desc: item.usage_desc,
                title: item.title,
                subTitle: item.sub_title,
                value: item.value / 100,
                time: item.enabled_time_display,
              };
            });
          }
          this.setData({
            coupons,
          });
        },
        err => {
          console.log(err, 'err');
        });
    },
    //领取券
    getCoupon(data) {
      if (!this.verifyAuth()) return;
      const {
        index
      } = data.detail;
      const item = this.data.coupons[index];
      // if (item.isRedeem) return;
      api.codeRedeem({
          code: item.code,
          type: '0',
        },
        res => {
          item.isRedeem = item.isRedeem - 1;
          this.setData({
            [`coupons[${index}].isRedeem`]: item.isRedeem,
            sucToast: true,
          }, () => {
            setTimeout(() => {
              this.hideToast();
            }, 2000);
          });
        },
        err => {
          console.log(err, 'err');
          if (err.errno === 9310009) {
            item.isRedeem = item.isRedeem - 1;
            this.setData({
              [`coupons[${index}].isRedeem`]: item.isRedeem,
              sucToast: true,
            }, () =>{
                this.hideToast();
            });
            return true;
          }
        },
      );
    },
  //隐藏领取成功
    hideToast(){
      setTimeout(() => {
        this.setData({
          sucToast: false,
        });
      }, 2000);
    },
  }
export default coupon;
