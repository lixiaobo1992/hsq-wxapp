
// 此页面作为一个权限检测页面
import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import mixins from '../../utils/mixins';
import { urlfix } from '../../utils/index';

const app = getApp();
// !! 目前当前页面只适用与会员支付
// 新增普通支付
xPage({
  ...mixins,
  data: {

  },
  onLoad(query) {
    this.onPageInit(query);

    const { pay_type = '' } = query;
     // 支付类型
    switch(pay_type) {
      case 'open-member': // 开通会员
        this.getMemberPayInfo();
      break;
      case 'phone-cost': // 话费充值
        this.goPay();
      break;
    }

  },

  onShow() {

  },
  onUnload() {

    // 页面被关闭时
    // app.checkAuth();
  },

  getMemberPayInfo() {
    wx.showLoading({
      title: "正在加载",
      mask: true
    });
    const { logged, userInfo } = xmini.store.state.user
    const { template_id = 0, } = this.pageQuery;
    api.bussinessOrderPay({
      type: 5, // 支付类型（ 1.微信 2.百川 3.支付宝app 4.支付宝网页 5.微信公众号 6.免支付 )
      templateId: template_id, // 用户所签约的模板Id
      bussinessType: 1,
      wxopenid: userInfo.wechat_open_id
    }, res => {
      // 去支付
      this.requestPayment({
        data: res.data,
        success(res1) {
          //
          const app = getApp();
          app.onPublishEvent('WEB_VIEW_CHANGE', {
            change_type: 'open-member',
            isPaySuccess: true,
            paymentId: res.data.paymentId
          });
          this.back();

          // 确认订单
          this.confirmOrder({
            data: {
              // ...res.data,
              paymentId: res.data.paymentId,
              orderType: 5,
              confirmType: 2
            },
            success(res2) {
              //...
            }
          })
        },
        fail(err){
          // 支付失败
          this.back(); //
        }
      })

    }, err => {
      // 获取支付信息失败

      this.back(); //
    })

  },

  goPay() {
    const { orderIds = [] } = this.pageQuery;
    const { logged, userInfo } = xmini.store.state.user
    // 根据订单id 获取支付信息
    api.orderPay({
      type: 5, // 1.微信支付 2.百川支付 3.支付宝支付, 4.支付宝网页支付, 5.公众号支付, 7.微信扫码支付
      orderIds: orderIds,
      wxopenid: userInfo.wechat_open_id
    }, res => {
      // 调起支付
      this.requestPayment({
        data: { ...res.data },
        success: res1 => {
          console.log(res1);
          this.confirmOrder({
            data: {
              paymentId: res.data.paymentId,
              mergeType: res.data.mergeType,  // 1普通订单,2单独购,4拼团订单,8抽奖团
            },
            success: (res2) => {
              if (res2.data.url) {
                let urlData = {
                  currentTarget: {
                    dataset: {
                      url: urlfix(res2.data.url, 'replace=true')
                    }
                  }
                }
                this.onUrlPage(urlData);
                return;
              }
              this.forward('order-list', {
                type: 0,
                replace: true,
              });
              //...
            },
            fail: (err) => {
              // 去 全部订单列表
              this.forward('order-list', { type: 0, replace: true });
            }
          })
        },
        fail: err1 => {
          // 订单失败默认条订单列表
          // 去待付款列表
          this.forward('order-list', { type: 1, replace: true });
        },
      });
    }, err => {
      this.forward('order-list', {
        type: 1,
        replace: true,
      });
    });
  },


  // 公共请求
  requestPayment({ data, success, fail }) {
    const that = this;
    wx.showLoading({
      title: "支付中...",
      mask: true
    });
    wx.requestPayment({
      ...data,
      success: (res) => {
        if (res.errMsg != 'requestPayment:ok') {
          fail && fail.call(that, res);
          return;
        }
        // 确认订单
        success && success.call(that, res);
      },
      fail: (res) => {
        wx.hideLoading();
        fail && fail.call(that, res);
      },
      complete: (res) => {
        console.log(JSON.stringify(res));
      },
    })
  },

  confirmOrder({ data, success, fail }) {
    api.orderPayConfirm(data, (res) => {
      success && success.call(this, res);
    }, (err) => {
      wx.hideLoading();
      fail && fail.call(this, err);
      return true;
    });
  },
});
