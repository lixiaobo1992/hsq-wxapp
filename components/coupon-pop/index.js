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
      const {
        index
      } = data.detail;
      console.log(data,'data');
      const item = this.data.coupons[index];
      console.log(this.data.coupons, 'data3', index);
      // if (item.isRedeem) return;
      api.codeRedeem({
          code: item.code,
          type: '0',
        },
        res => {
          console.log('领取成功！ data', this.data);
          item.isRedeem = item.isRedeem - 1;
          this.setData({
            [`coupons[${index}].isRedeem`]: item.isRedeem,
            sucToast: true,
          }, () => {
            setTimeout(() => {
              this.hideToast();
            }, 2000);
          });
          console.log(this.data.sucToast, 'data3');
        },
        err => {
          console.log(err, 'err');
          this.data.sucToast = true;
          if (err.errno === 9310009) {
            item.isRedeem = item.isRedeem - 1;
            this.setData({
              [`coupons[${index}].isRedeem`]: item.isRedeem,
              sucToast: true,
            }, () =>{
              setTimeout(() => {
                this.hideToast();
              }, 2000);
            });
            return true;
          }
        },
      );
    },
  //隐藏领取成功
    hideToast(){
      this.setData({
        sucToast: false,
      });
    },
  }
export default coupon;
