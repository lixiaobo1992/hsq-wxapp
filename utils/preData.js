
// 整理数据格式

// 产品类型 product-type
// 1普通sku 2拼团 3抽奖 6助力免单
// 订单类型 order-type
// 1.普通订单 2.单独购 3.两人购 4.抽奖团购 5.抽奖单独 7.助力免单
// 目前仅仅使用2

// 产品名称 title
// 价格： priceObj = {
//   price: '',
//   marketPrice: '',
// }
// 缩略图 image: ''

import { mapTo } from './map';

const mini = {
  detail(data) {
    // mapTo
    return data;
  },
  orderCommmit(data) {
    return data;
  },

  // 订单id    id
  // 店铺名称     merchantName
  // 订单状态描述  statusDesc
  // 商品图片     skuThumbnail
  // 商品数量     amount
  // 购买价格     payPrice
  // 订单状态     status
  // 可取消       canCancel
  // 可支付      canPay
  // 可退款      canRefund
  // 退款id      refundId
  // 可查看物流   canViewDelivery
  // 可确收      canConfirm
  // 可评论      canComment
  // 退款状态描述 refundStatusDesc
  orderListData(list) {
    return mapTo(list, (item) => {
      const [skuItem = {}] = item.skuList;
      return {
        id: item.orderId,
        merchantName: item.merchantName,
        statusDesc: item.status,
        name: skuItem.name,
        skuThumbnail: skuItem.skuThumbnail,
        amount: skuItem.amount,
        payPrice: (item.need_pay_price / 100).toFixed(2),
        status: item.order_status || item.statusCode,
        canCancel: item.canCancel,
        canPay: item.canPay,
        canRefund: item.canRefund,
        refundId: item.refundId || skuItem.refundId,
        canViewDelivery: item.canViewDelivery,
        canConfirm: item.canConfirm,
        canComment: item.canComment,
        canApplyRefund: item.canApplyRefund,
        refundStatusDesc: item.refundStatusDesc || skuItem.refundStatusDesc,
        subOrderId: skuItem.id || '',
      };
    });
  },

  // //取消订单数据处理
  cancelOrderData(list) {
    return mapTo(list, (item) => {
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
    });
  },

  // //确认收货订单数据处理
  confirmOrderData(list) {
    return mapTo(list, (item) => {
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
    });
  },
};

module.exports = mini;

