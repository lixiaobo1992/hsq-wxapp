import api from '../api/index';
// import { getQueryString } from './stringUtil';
import {
  xmini,
} from '../config/xmini';


const mini = {
  // {type:3,orderIds:orderIds}
  getOrderPayInfo({ data, success, fail }) {
    // 微信支付需添加openId
    const { logged, userInfo } = xmini.store.state.user
    const newData = Object.assign({}, data, {
      orderIds: (data.orderIds || []).toString(),
      wxopenid: userInfo.wechat_open_id
    });
    console.log(userInfo);
    wx.showLoading({
      title: "正在加载",
      mask: true
    });
    api.orderPay(newData, (res) => {
      // this.requestPayment(param.orderIds, res.data.paymentId, res.data.mergeType, res.data, callback);
      success && success.call(this, res);
    }, (err) => {
      if (err && err.errmsg) {
        const listErr = [230004,210018];
        if(listErr.indexOf(err.errno) > -1){
          this.dealPayErr(err);
        } else {
          wx.showToast(`${err.errmsg}`);
        }
      } else {
        wx.showToast('数据请求失败');
      }
      fail && fail.call(this, err);
      return true;
    });
  },
  requestPayment({ data, success, fail }) {
    const that = this;
    wx.showLoading({
      title: "正在加载",
      mask: true
    });
    wx.requestPayment({
      ...data,
      success: (res) => {
        if (res.errMsg != 'requestPayment:ok') {
          fail && fail.call(this, res);
          return;
        }
        this.postMessage('order-list', {
          needRefresh: true,
        });

        // 确认订单
        success && success.call(this, res);

        // api.orderPayConfirm({
        //   paymentId,
        //   mergeType,
        // }, (res) => {

          /*
            1.普通订单(助力免单) 2.单人购 4.拼团 8.抽奖团

            case 1|2:     //3   合并支付订单：普通订单、单人购订单
            case 1|4:     //5   合并支付订单：普通订单、拼团订单
            case 1|2|8:   //11  合并支付订单：普通订单、单人购、抽奖团
            以此类推
          */
          // switch (mergeType) {
          //   //待收货列表
          //   case 1:
          //     if (callback) {
          //       callback(true, { action: 'order-result' });
          //       return;
          //     }
          //     that.forward('order-result', { id: orderId, replace: true });
          //     break;
          //   case 2:
          //   case 1|2:
          //     that.toOrderList(callback, true, 2);
          //   break;

          //   case 4: {
          //     const pinEventId = getQueryString(res.data.url, 'pineventid');
          //     if (pinEventId) {
          //       //拼团邀请好友页面
          //       that.toCoupleShare(callback, pinEventId, mergeType);
          //     }else {
          //       //拼团订单列表
          //       that.toCouplesOrderList(callback, 1);
          //     }
          //   }
          //   break;
          //   //拼团订单列表
          //   case 1|4:
          //   case 2|4:
          //   case 1|2|4:
          //     that.toCouplesOrderList(callback, 1);
          //   break;

          //   case 8: {
          //     const pinEventId = getQueryString(res.data.url, 'pineventid');
          //     if (pinEventId) {
          //       //抽奖团邀请好友页面
          //       that.toCoupleShare(callback, pinEventId, mergeType);
          //     } else {
          //       //抽奖团订单列表
          //       that.toCouplesOrderList(callback, 2);
          //     }
          //   }
          //   break;
          //   //抽奖团订单列表
          //   case 1|8:
          //   case 2|8:
          //   case 1|2|8:
          //     that.toCouplesOrderList(callback, 2);
          //   break;
          //   //全部订单列表
          //   case 4|8:
          //   case 1|4|8:
          //   case 2|4|8:
          //   case 1|2|4|8:
          //     that.toOrderList(callback, true, 0);
          //   break;
          //   //全部订单列表
          //   default:
          //     that.toOrderList(callback, true, 0);
          //   break;
          // }

        //   that.sendRefreshMessage();
        // }, (err) => {
        //   wx.hideLoading();
        //   fail && fail.call(this, err);
        //   return true;
        // });
      },
      fail: (res) => {
        wx.hideLoading();
        fail && fail.call(this, res);
      },
      complete: (res) => {
        console.log(JSON.stringify(res));
      },
    });
  },
  // 确认支付
  confirmOrder({ data, success, fail }) {
    api.orderPayConfirm(data, (res) => {
      success && success.call(this, res);
      this.sendRefreshMessage();
    }, (err) => {
      wx.hideLoading();
      fail && fail.call(this, err);
      return true;
    });
  },

  // // 拼团、抽奖团订单列表
  // toCouplesOrderList(callback, listType) {
  //   if (callback) {
  //     callback(true, {
  //       action: 'couple-order-list',
  //       type: 1,
  //       listType,
  //     });
  //     return;
  //   }
  //   this.forward('couple-order-list', {
  //     type: 1,
  //     listType,
  //     replace: true,
  //   });
  // },

  // // 邀请好友参加
  // toCoupleShare(callback, pinEventId, mergeType) {
  //   let act;
  //   switch (mergeType) {
  //     case 4:
  //       act = 'pin-share';
  //       break;
  //     case 8:
  //       act = 'couple-share';
  //       break;
  //     default:
  //       act = 'pin-share';
  //       break;
  //   }
  //   if (callback) {
  //     callback(true, { action: act, pinEventId });
  //     return;
  //   }
  //   this.forward(act, { id: pinEventId, replace: true });
  // },

  // // 订单列表页
  // toOrderList(callback, isSucess, type) {
  //   if (callback) {
  //     callback(isSucess, { action: 'order-list', type });
  //     return;
  //   }
  //   this.forward('order-list', {
  //     type,
  //     replace: true,
  //   });
  // },

  // 发消息通知列表页更新对应的状态
  sendRefreshMessage() {
    var app = getApp();
    app && app.onPublishEvent && app.onPublishEvent('KPAY_SUCCESS', {});
  },
};

module.exports = mini;
