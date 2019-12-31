import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import {
  formatNum,
  mapTo
} from '../../utils/index';
import mixins from '../../utils/mixins';
import orderPay from '../../utils/orderPay';
import { formatDate } from '../../utils/dateUtil';
import CountManger from '../../utils/CountManger';
import {
  getQueryString,
} from '../../utils/stringUtil';
import { isEmptyObject } from '../../utils/is';

let timeStamp;
let endTime;

xPage({
  ...mixins,
  ...orderPay,
  data: {
    img_service: 'https://img1.haoshiqi.net/miniapp/order_service_2cac765f25.png',
    img_mobile: 'https://img1.haoshiqi.net/miniapp/order_mobile_b7a4998954.png',
    showFooterIndex: 0,  // 0 不显示，1倒计时，2邀请好友
    isLoading: true,
    msgStatus: false,
    isMergePay:false,
    mergeInfo: {},
    errMsg: '',
    isMemberModal: false,
  },
  onLoad(option) {
    this.onPageInit(option);
    this.refresh();
  },

  onShow() {
    this.onMessage();
  },

  refresh() {
    const params = {
      orderId: this.pageQuery.id,
    };
    this.setData({
      isLoading: true,
      options: params,
    });
    this.getData(params);
  },
  onAuthSuccess() {
    this.refresh();
  },
  onUnload() {

    this.clearPageData();
  },

  getData(params) {

    api.orderDetail(
      Object.assign({}, params, {scope: this,weights: 1}), (res) => {
      const { data } = res;

      timeStamp = res.timestamp;
      endTime = data.created_at + 3600;
      let msgEndTime = data.message && data.message.end_time || 0;

      if (endTime * 1000 > timeStamp && data.canPay) {
        this.countDown();
      }

      // 公告展示判断
      if(timeStamp < msgEndTime){
        this.setData({
          msgStatus: true,
          msgContent: data.message || {}
        })
      }

      let orderStatus = {};
      orderStatus = {
        canPay: data.canPay || false,
        canCancel: data.canCancel || false,
        canRefund: data.canRefund && data.delivery_status === 1,
        canViewDelivery: data.canViewDelivery || false,
        canConfirm: data.canConfirm || false,
        refundId: data.refundId || 0,
      };
      orderStatus.hasBottom = orderStatus.canPay || orderStatus.canCancel || orderStatus.canRefund || (orderStatus.refundId > 0) || orderStatus.canViewDelivery || orderStatus.canConfirm;
      console.log(orderStatus);

      const statusCode = data.statusCode

      let statusDesc = {};
      statusDesc = {
        statusText: data.status || data.statusDesc,
        statusLogo: data.statusLogo,
      };
      let orderDesc = {};
      orderDesc = {
        id: data.id,
        createdAt: formatDate(data.created_at * 1000, 'Y-M-D H:F:S'),
      };
      let userDesc = {};
      const city = data.deliveryCity || data.delivery_city;
      let address = data.delivery_province ;
      address += city + data.delivery_district;
      address +=  data.delivery_detail_address;
      userDesc = {
        name: data.order_type === 16 ? '充值手机号' : data.consignee,
        phone: data.consigneePhone || data.consignee_phone,
        address,
      };
      const productDesc = [];
      if (data.skuList) {
        data.skuList.forEach((item) => {
          const price = (item.unit_price / 100).toFixed(2);
          productDesc.push({
            subOrderId: item.id,
            pinId: item.pin_activities_id || data.pin_activities_id,
            skuId: item.sku_id, // 普通商品
            skuName: item.sku_name,
            imgUrl: item.skuThumbnail,
            price,
            amount: item.amount,
            attrs: item.attrs_desc,
            schema: item.schema,
            orderId: item.order_id,
            status: item.status,
            refundId: item.refundId,
            canRefund: item.subCanRefund,
            refundStatus: item.refundStatusDesc || '退款详情',
          });
        });
      }
      const priceDesc = [];
      priceDesc.push({
        name: '商品总额',
        value: ((data.productsPrice) / 100).toFixed(2),
        icon: '￥',
      });
      // data.delivery_price = data.isFreeDelivery ? 0 : data.delivery_price;
      priceDesc.push({
        name: '运费',
        value: (data.delivery_price / 100).toFixed(2),
        icon: '+￥',
      });
      data.merchant_discount = data.merchant_discount || 0;
      priceDesc.push({
        name: '店铺活动',
        value: (data.merchant_discount / 100).toFixed(2),
        icon: '-￥',
      });
      data.platform_discount = data.platform_discount || 0;
      priceDesc.push({
        name: '平台券',
        value: (data.platform_discount / 100).toFixed(2),
        icon: '-￥',
      });
      let invoiceDesc = {};
      let invoiceText;
      if (data.invoice_type === 2) {
        invoiceText = '个人';
      } else if (data.invoice_type === 3) {
        invoiceText = '公司';
      } else {
        invoiceText = '不需要发票';
      }
      invoiceDesc = {
        title: invoiceText,
        type:data.invoice_type,
        desc: data.invoiceTitle || data.invoice_title,
      };

      let tags = '';
      switch (data.lotteryStatus) {
        case 2:
          tags = 'https://img1.haoshiqi.net/miniapp/couple-order/lottery_fail_b2f895764f.png';
          break;
        case 3:
          tags = 'https://img1.haoshiqi.net/miniapp/couple-order/lottery_win_855127f729.png';
          break;
        default:
          tags = '';
          break;
      }
      this.shareImage = data.skuList && data.skuList[0].skuThumbnail || '';
      this.pinStatusLink = data.pinStatusLink;
      //0普通订单, 1拼团中, 2拼团成功, 3拼团失败, 4付款后拼团订单, 5拼团未付款取消订单
      let showFooterIndex = 0;
      switch (data.coupleStatus) {
        case 1:
          if (orderStatus.canPay || orderStatus.canCancel) {
            showFooterIndex = 1;
          }else {
            showFooterIndex = 2;
          }
        break;
        case 3:
        case 4:
          showFooterIndex = 2;
        break;
        default:
          if (orderStatus.hasBottom) {
            showFooterIndex = 1;
          }
        break;
      }
      this.serviceTel = data.serviceTel || '';

      const savePrice = (data.saved_money / 100).toFixed(2)
      const stepList = data.stepList

      this.setData({
        statusCode,
        savePrice,
        statusDesc,
        orderDesc,
        userDesc,
        merchantName: data.merchantName,
        merchantSchema: data.schema,
        productDesc: productDesc || [],
        userMsg: (data.note) ? data.note : '无留言',
        priceDesc,
        needPayPrice: (data.need_pay_price / 100).toFixed(2),
        orderStatus,
        orderType: data.order_type,
        invoiceDesc,
        stepList,
        orderType: data.orderType,
        pinEventId: data.pin_event_id,
        detailData: {
          merchant_id: data.merchant_id || '',
          merchantName: data.merchantName || '',
          udesk_merchant_id: data.udesk_merchant_id || '',
        },
        tags,
        pinStatusDesc: data.pinStatusDesc || '',
        showFooterIndex,
        coupleStatus: data.coupleStatus,
        isLoading: false,
      });
    }, (err) => {
      console.log(err);
    });
  },
  goCoupleDetail(e) {
    const orderType = this.data.orderType;
    const { id } = e.currentTarget.dataset;
    if (orderType == 2 || orderType == 3) {
      this.forward('detail', {
        id,
      });
    } else if (orderType == 4 || orderType == 5) {
      this.forward('lottery-detail', {
        id,
      });
    }
  },
  // 申请退款
  goRefund(e) {
    const { orderid, suborderid, refundprice } = e.currentTarget.dataset;
    this.forward('order-refund', {
      orderId: orderid,
      subOrderId: suborderid,
      refundPrice: refundprice
    });
    xmini.piwikEvent('c_refsubm', {
      suborderid: suborderid
    });
  },

  // 查看退款详情
  goRefundDetail(e) {
    const { suborderid, orderstatus, refundid } = e.currentTarget.dataset;
    this.forward('order-refund-detail', {
      refundId: refundid,
    });
    xmini.piwikEvent('c_refview', {
      suborderid: suborderid,
      status: orderstatus,
      refundid: refundid,
    });
  },
  countDown() {
    const that = this;
    const diffTime = (timeStamp * 1000) - (+new Date());
    const localEndTime = (endTime * 1000) + diffTime;

    this.countDownManger = new CountManger({
      times: 1000,
      dataList: [{}], // this.data.leftTime,
      set() {
        if (localEndTime - new Date() > 0) {
          this.start();
        } else {
          that.setData({
            leftTime: 0,
          });
        }
      },
      callback() {
        const leftTime = localEndTime - new Date();
        if (leftTime > 0) {
          const countDown = formatNum(leftTime, true);
          that.setData({
            countDownInfo: `剩余${countDown.minute}分${countDown.second}秒自动关闭`,
          });
        } else {
          const countDown = formatNum(0, true);
          that.setData({
            countDownInfo: `剩余${countDown.minute}分${countDown.second}秒自动关闭`,
          });
          this.clear();
        }
        console.log();
      },
    });
  },
  goDetail(e) {
    const { id } = e.currentTarget.dataset;
    console.log('去id为：' + id + '的普通商品详情页');
    // wx.navigateTo({
    //   url: '../../pages/detail/detail?id='+id,
    // });
  },
  cancelOrder() {
    console.log('取消订单号为' + this.data.orderDesc.id + '的订单');
    const me = this;
    wx.showActionSheet({
      // title: '取消订单的理由',
      itemList: ['我不想买了', '信息填写错误', '商品停售或缺货', '其他原因'], // 菜单按钮的文字数组
      success: (res) => {
        const index = res.tapIndex + 1;
        if (!(index === 0)) {
          wx.showLoading({
            title: '订单正在取消...',
          });
          let params = {};
          params = {
            orderId: me.data.orderDesc.id,
            reason: index,
          };
          api.orderCancel(params, (res) => {
            console.log(res);
            wx.hideLoading();
            wx.showToast({
              title: '订单取消成功',
            });
            me.postMessage('order-list', {
              needRefresh: true,
            });
            setTimeout(() => {
              if (me.countDownManger) {
                me.countDownManger.clear();
              }
              me.getData({
                orderId: params.orderId,
              });
            }, 1000);
          xmini.piwikEvent('c_gupaybtn',{
            orderIds:this.data.pinEventId,
            orderType:this.data.orderType,
          });
          }, (err) => {
            console.log(err);
            wx.showToast({
              title: '订单取消失败',
            });
          });
        }
      },
    });
    xmini.piwikEvent('c_cancelorder', {
      orderid: me.data.orderDesc.id
    });
  },
  //检测订单
  checkOrder(e){
    const { type } = e.detail;
    let id = 0;
    if(type === 'merge'){
      id = e.detail.id;
      this.payOrder(id);
      return;
    } else {
      id = e.currentTarget.dataset.orderid;
    }
    api.orderCheck({
      orderIds: [id],
    }, (res) => {
        console.log(res.data, 'data');
        let data = res.data;
        if(isEmptyObject(data)){
          //当这里有值时，处理合并支付
          this.setData({
            isMergePay: true,
            // mergeInfo:this.dealPay(data),
            mergeInfo:data,
          });
        } else {
          this.payOrder(id);  //去支付流程
        }
    }, (err) => {
      if(err.errno === 230004 && err.errmsg){
        this.setData({
          isMemberModal: true,
          isMergePay: false,
          errMsg: err.errmsg,
        })
        return true;
      } else {
        wx.showToast({
          icon:'none',
          title: err.errmsg,
          duration: 3000,
        })
        return true;
      }
    });
  },
  //付款
  payOrder(id) {
    xmini.piwikEvent('c_pay', {
      orderid: id
    });
    let  orderIds = [id];
    // 根据订单id 获取支付信息
    this.getOrderPayInfo({
      data: {
        type: 5, // 1.微信支付 2.百川支付 3.支付宝支付, 4.支付宝网页支付, 5.公众号支付, 7.微信扫码支付
        orderIds: orderIds,
      },
      success: (res) => {
        // 调起支付
        this.requestPayment({
          data: {
            // orderIds: orderIds,
            ...res.data,
          },
          success: (res1) => { // res1 微信返回的信息
            // 确认支付
            this.confirmOrder({
              data: {
                paymentId: res.data.paymentId,
                mergeType: res.data.mergeType,  // 1普通订单,2单独购,4拼团订单,8抽奖团
              },
              success: (res2) => {
                this.refresh();

                if (res2.data.url) {
                  let mergeType = res.data.mergeType
                  if (mergeType == 4 || mergeType == 8) { // 拼团订单
                    const pinEventId = getQueryString(res2.data.url, 'id')
                    if (pinEventId) {
                      let tempPage = 'pin-share';
                      if (mergeType == 4) {
                        tempPage = 'pin-share';
                      }
                      if (mergeType == 8) {
                        tempPage = 'couple-share'
                      }
                      this.forward(tempPage, { id: pinEventId, replace: true });
                    } else {
                      this.forward('couple-order-list', {
                        type: 1,
                        listType: mergeType == 4 ? 1 : 8,
                        replace: true
                      });
                    }
                    return
                  }

                  let urlData = {
                    currentTarget: {
                      dataset: {
                        url: res2.data.url
                      }
                    }
                  }
                  this.onUrlPage(urlData);
                  return;
                }
              },
              fail: err2 => {
                this.refresh();
              }
            });
          },
          fail: err1 => {
            this.refresh();
          }
        });
      },
      fail:err =>{},
    });
  },
  goDelivery() {
    console.log('查看订单号为' + this.data.orderDesc.id + '的物流');
    this.forward('delivery', {
      orderId: this.data.orderDesc.id,
    });
    xmini.piwikEvent('c_logview', {
      orderid: this.data.orderDesc.id
    });
  },
  // 确认收货
  confirmReceipt() {
    // debugger;
    const that = this;
    const { id } = this.data.orderDesc;
    wx.showModal({
      title: '确认已经收到货了吗？',
      content: '请务必在已收货的情况下进行确认！',
      confirmText: '确认收货',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading();
          api.confirmReceived({
            orderId: id,
          }, (res) => {
            wx.hideLoading();
            that.postMessage('order-list', {
              needRefresh: true,
            });
            setTimeout(function () {
              wx.showToast({
                title: '确认收货成功！', // 文字内容
              });
            }, 1000);
            setTimeout(() => {
              that.getData({orderId:id});
            }, 2000);
          }, (err) => {
            wx.showToast('确认收货失败');
            console.log(err);
          });
        }
      },
    });
    xmini.piwikEvent('c_pdagree', {
      orderid: that.data.orderDesc.id
    });
  },
  onHide() {
    this.clearPageData();
  },
  clearPageData() {
    console.log('clear');
    if (this.countDownManger) {
      this.countDownManger.clear();
    }
  },

  // 邀请好友参团
  onShareAppMessage(res) {
    let path = '';
    if ((this.pinStatusLink || []).includes('lotteryactivitylist')) {
      path = 'pages/lottery-list/lottery-list';
    } else if ((this.pinStatusLink || []).includes('coupleskulist')) {
      path = 'pages/index/index';
    }else {
      path = `pages/couple-share/couple-share?id=${this.data.pinEventId}`;
    }
    return {
      imageUrl: this.shareImage,
      path,
    }
  },

  // 跳转到抽奖团列表
  onLotterList() {
    const orderType = this.data.orderType;
    if (orderType == 2 || orderType == 3) {
      this.forward('index', {});
    } else if (orderType == 4 || orderType == 5) {
      this.forward('lottery-list', {});
    }
  },

  handleCopy() {
    wx.setClipboardData({
      data: this.data.orderDesc.id + '',
      success: (res) => {
        wx.showToast({
          title: '复制成功',
        });
      }
    });
  },

  // 联系卖家
  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.serviceTel,
    });
    xmini.piwikEvent('c_tel', {
      orderid: this.data.orderDesc.id
    });
  },
  //显示/隐藏弹窗
  handlePayModal(){
    const mergePayStatus = this.data.isMergePay;
    this.setData({
        isMergePay:!mergePayStatus,
    })
  },
  //处理重复开会员弹窗状态
  handleMemberModal(){
    const memberModalStatus = this.data.isMemberModal;
    this.setData({
        isMemberModal:!memberModalStatus,
    });
  },
});
