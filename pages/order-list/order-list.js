import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import {
  pullList,
  mapTo,
  dealPrice,
} from '../../utils/index';
import mixins from '../../utils/mixins';
import orderPay from '../../utils/orderPay';
import { isEmptyObject } from '../../utils/is';
import {
  getQueryString,
} from '../../utils/stringUtil'

const app = getApp();

xPage({
  ...mixins,
  ...orderPay,
  ...pullList,

  data: {
    isLoading: true,

    showFooter: false,
    hideHeader: true,
    list: [],
    pageType: '0',
    isMergePay:false,
    // mergeInfo,
    mergeInfo: {},
    isMemberModal:false,
    errMsg: '',
  },

  onLoad(query) {
    this.onPageInit(query);
    const listType = query.type || '0';
    this.setData({
      pageType: listType,
      height: wx.getSystemInfoSync().windowHeight,
    }, ()=>{
      this.getOrderList();
    })

  },
  onShow() {
    this.getHeaderData();

    this.onMessage();
  },
  refresh() {
    this.getHeaderData();
    // this.initPullList();
    this.getOrderList();
  },
  onAuthSuccess() {
    this.refresh();
  },
  getHeaderData() {
    api.getProfile({
      isLoading: false
    }, (res) => {
      const { data } = res;
      const toPayNum = data.toPayNum
      const toReceiptNum = data.toReceiptNum
      const toRefundNum = data.toRefundNum
      const pinOrderNum = data.pinOrderCnt
      this.setData({
        pinOrderNum,
        toPayNum,
        toReceiptNum,
        toRefundNum,
        hideHeader: false,
      })
    }, (err) => {
      return true;
    })
  },

  getOrderList() {
    this.initPullList();
    const listType = this.data.pageType
    this.pullParams.scope = this;
    this.pullParams.weights = 1;

    this.pullParams.type = listType;

    switch (listType) {
      case '0': // 全部订单
      case '1': // 待付款
      case '2': // 待收货
        this.pullModel = api.getUserOrders;
        break;
      case '3': // 待评论
        // this.pullModel = api.getNeedCommentOrders;
        break;
      case '4': // 售后
        this.pullModel = api.getUserServiceOrders;
        break;

      default:
        this.pullModel = api.getUserOrders;
        break;
    }
    this.setData({
      isLoading: true,
    })
    this.changePageTitle();
    this.onScrollToLower();

  },
  afterPull() {
    if (this.pullParams.pageNum == 1) {
      delete this.pullParams.scope;
      delete this.pullParams.weights;
    }
  },
  afterPullData() {
    this.setData({
      isLoading: false
    })
  },
  initPullList() {
    this.pullParams.pageNum = 1;
    this.hasMore = true;
    this.setData({
      list: [],
    });
  },

  dealList(list) {
    return mapTo(list, item => {
      const products = mapTo(item.skuList, it => {
        return {
          name: it.name,
          thumbnail: it.sku_thumbnail,
          price: (it.unit_price*0.01).toFixed(2),
          amount: it.amount,
          refundId: it.refundId,
          refundStatusDesc: it.refundStatusDesc,
          id: it.subOrderId,
          skus: it.attrs_desc || [],
        };
      });
      return {
        id: item.orderId,
        merchantId: item.merchantId,
        merchantName: item.merchantName,
        total_amount: item.total_amount,
        statusDesc: item.status,
        list: products,
        payPrice: (item.need_pay_price*0.01).toFixed(2),
        status: item.order_status || item.statusCode,
        canCancel: item.canCancel,
        canPay: item.canPay,
        canRefund: item.canRefund,
        canViewDelivery: item.canViewDelivery,
        canConfirm: item.canConfirm,
        canComment: item.canComment,
        canApplyRefund: item.canApplyRefund,
        refundId: item.refundId || 0,
        refundStatusDesc: item.refundStatusDesc,
        orderType: item.order_type,
      };
    });
  },
  refreshList(index){
    this.setData({
      pageType: index,
    })
    this.refresh();
  },
  switchHeader(e) {
    const index = e.currentTarget.dataset.index;
    if (this.data.pageType == index) {
      return;
    }
    switch (index) {
      case '0'://全部
      case '1'://待付款
      case '2'://待收货
      case '4'://售后
      // case '3'://待评价
        this.refreshList(index);
        break;
      case '5':
        this.forward('couple-order-list', {
          type: 1,
          listType: 1,  // 拼团
          hiddenTabs: true,
        });
        break;
    }
  },
  // 订单详情
  goOrderDetail(e) {
    this.forward('order-detail', {
      refresh: true,
      id: e.currentTarget.dataset.orderid,
    });
  },
  goMerchant(e) {
    xmini.piwikEvent('c-shop');
    this.forward('merchant', {
      id: e.currentTarget.dataset.id,
    });
  },
  //检测订单
  checkOrder(e){
    const { type } = e.detail;
    let id = 0;
    let index = 0;
    if(type === 'merge'){
      id = e.detail.id;
      this.goPay(id);
      return;
    } else {
      id = e.currentTarget.dataset.orderid;
      index = e.currentTarget.dataset.index;
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
            mergeInfo:data,
          });
        } else {
          this.goPay(id,index);  //去支付流程
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
  // 付款
  goPay(id,index = 0) {
    xmini.piwikEvent('c_pay',{
      orderid:id,
      index,
    });
    let orderIds = [id];
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
                this.forward('order-list', {
                  type: 0,
                  replace: true,
                });
              },
              fail: err2 => {
                // 去 全部订单列表
                this.forward('order-list', { type: 0, replace: true });
              }
            });
          },
          fail: err1 => {
            // 订单失败默认条订单列表
            // 去待付款列表
            this.refresh();
          }
        });
      },
      fail: err => {}
    });

  },
  // 确认收货
  goConfirm(e) {
    const that = this;
    let listType = this.data.pageType;
    const clickIndex = e.currentTarget.dataset.index;
    const id = e.currentTarget.dataset.orderid;
    const newDataList = [...this.data.list];
    xmini.piwikEvent('c_pdagree',{
      orderid:id,
      index:clickIndex,
    });
    wx.showModal({
      title: '确认已经收到货了吗？', // confirm 框的标题
      content: '请务必在已收货的情况下进行确认！',
      confirmText: '确认收货',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          api.confirmReceived({
            orderId: id,
          }, (res) => {
            setTimeout(function(){
              wx.showToast({
                title: '确认收货成功！', // 文字内容
              });
            }, 500);
            xmini.piwikEvent('c_pdagreecomf',{
              index:clickIndex,
              orderid:id,
            });
            if (listType === '2') {
              this.refresh();
            } else {
              const data = mapTo([res.data], (item) => {
                return {
                  id: item.id,
                  statusDesc: item.status,
                  status: item.statusCode,
                  canCancel: item.canCancel,
                  canPay: item.canPay,
                  canRefund: item.canRefund,
                  refundId: item.refundId,
                  canViewDelivery: item.canViewDelivery,
                  canConfirm: item.canConfirm,
                  canComment: item.canComment,
                  refundStatusDesc: item.refundStatusDesc,
                };
              })[0];
              const newData = Object.assign({}, newDataList[clickIndex], data);
              that.setData({
                [`list[${clickIndex}]`]: newData,
              });
            }
          }, (err) => {
            wx.showToast({
              icon: 'success',
              title: '确认收货失败',
            });
          });
        }
      },
    });
  },
  // 查看物流
  goDelivery(e) {
    const { orderid,index, status} = e.currentTarget.dataset;
    xmini.piwikEvent('c_logview',{
      orderid,
      index,
      status,
    });
    this.forward('delivery', {
      orderId: orderid,
    });
  },
  // 取消订单
  goCancelOrder(e) {
    const that = this;
    let listType = this.data.pageType
    const clickIndex = e.currentTarget.dataset.index;
    const newDataList = [...this.data.list];
    const id = e.currentTarget.dataset.orderid;
    xmini.piwikEvent('c_cancelorder',{
      orderid:id,
      index:clickIndex,
    });
    wx.showActionSheet({
      // title: '取消订单的理由', // 微信没这个
      // cancelButtonText: '取消',
      itemList: ['我不想买了', '信息填写错误', '商品停售或缺货', '其他原因'],
      success: (res) => {
        const index = res.tapIndex + 1;
        if (!(index === 0)) {
          wx.showLoading({
            title: '订单正在取消...',
          });
          api.orderCancel({
            orderId: id,
            reason: index,
          }, (res) => {
            wx.hideLoading();
            setTimeout(function(){
                wx.showToast({
                  title: "取消成功！",
                });
              }, 500);

            if (listType === '1') {
              this.refresh();
            } else {
              const data = mapTo([res.data], (item) => {
                return {
                  statusDesc: item.status,
                  status: item.statusCode,
                  canCancel: item.canCancel,
                  canPay: item.canPay,
                  canRefund: item.canRefund,
                  refundId: item.refundId,
                  canViewDelivery: item.canViewDelivery,
                  canConfirm: item.canConfirm,
                  canComment: item.canComment,
                  refundStatusDesc: item.refundStatusDesc,
                };
              })[0];
              const newData = Object.assign({}, newDataList[clickIndex], data);
              xmini.piwikEvent('c_cancelorderres',{
                orderid:id,
                index:clickIndex,
                reasons:newData[clickIndex],
              });
              that.setData({
                [`list[${clickIndex}]`]: newData,
              });
            }
          }, (err) => {
            // console.log(err);
            wx.showToast({
              title: "订单取消失败"
            });
          });
        }
      },
    });
  },
  // 申请退款
  goRefund(e) {
    const {
      orderid: orderId,
      orderstatus: orderStatus,
      refundprice: refundPrice,
      suborderid,
    } = e.currentTarget.dataset;
    const subOrderId = (orderStatus == 3) ? suborderid : '';
    this.forward('order-refund', {
      orderId,
      subOrderId,
      refundPrice,
    });
  },

  // 查看退款详情
  goRefundDetail(e) {
    const { refundid: refundId } =  e.currentTarget.dataset;
    if (!refundId) {
      wx.showToast(`参数错误 refundId: ${refundId}`);
      return;
    }
    this.forward('order-refund-detail', {
      refundId,
    });
  },
  // 修改页面title
  changePageTitle() {
    let title;
    let listType = this.data.pageType;
    switch (listType) {
      case '1':
        title = '待付款';
        break;
      case '2':
        title = '待收货';
        break;
      case '3':
        title = '待评价';
        break;
      case '4':
        title = '售后';
        break;
      case '0':
      default:
        title = '全部订单';
        break;
    }
    wx.setNavigationBarTitle({
      title,
    });
  },
 //处理合并支付拦截弹窗
  handlePayModal(){
    const mergePayStatus = this.data.isMergePay;
    this.setData({
      isMergePay:!mergePayStatus,
    });
  },
  //处理重复开会员弹窗状态
  handleMemberModal(){
    const memberModalStatus = this.data.isMemberModal;
    this.setData({
        isMemberModal:!memberModalStatus,
    });
  },
});
