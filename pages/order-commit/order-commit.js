// pages/order-commit/order-commit.js
import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import {
  dealPrice,
  urlfix,
  clone,
} from '../../utils/index';
import mixins from '../../utils/mixins';
import orderPay from '../../utils/orderPay';
import {
  getQueryString,
} from '../../utils/stringUtil'
import { trim } from '../../utils/base/string'
import animModal from '../../components/order-commit-pop/index';

const app = getApp();

const statusIconArray = { // 商品标签
  restriction: 'https://img1.haoshiqi.net/wxapp/img/order-confirm/limit_buy_0b5da08a92.png', // 限购
  noDelivery: 'https://img1.haoshiqi.net/wxapp/img/order-confirm/order_no_delivery_a6d94a5606.png', // 无法配送
  lowstock: 'https://img1.haoshiqi.net/wxapp/img/order-confirm/order_no_enouth_left_6d1557cfa4.png', // 库存不足
  outstock: 'https://img1.haoshiqi.net/wxapp/img/order-confirm/order_no_left_f402de5ea9.png', // 已抢光
  offline: 'https://img1.haoshiqi.net/wxapp/img/order-confirm/order_off_shelf_9dda0c575b.png', // 已停售
};

xPage({
  ...mixins,
  ...orderPay,
  ...animModal.animOp,
  _data: {
    tempInputTime: null,

    initParams: {

    },
    listenAddressResult: false, // 去选地址了
    listenCoupons: false, // 去选券了
  },
  /**
   * 页面的初始数据
   */
  data: {
    ...animModal.data,
    isLoading: true,

    orderType: 0,             // 订单类型：2.普通拼团单独购 3.普通拼团团购 4.抽奖团团购 5.抽奖团单独购
    isFastbuy: true, // 直接购买

    // 可用平台券列表
    platformCouponList: [],
    // 当前使用的平台券
    currentPlatformCoupon: {
      value: 0
    },
    // 商家优惠券
    merchantCoupon: {},

    savePrice: 0, // 省的金额
    savePriceText: '',

    totalPrice: 0, // 订单总金额
    needPayPrice: 0, // 支付金额
    needPayPriceText: '',
    totalAmount: 0, // 总件数
    discountTotal: 0, // 优惠的金额
    discountTotalText: '',

    productList: [],

    notes: {}, // 买家留言

    windowHidden: true, // 默认隐藏弹窗
    popWindowData: {},

    msgboard: {  // 公告
      title: ''
    },

    currentMerchantIndex: 0,
    isOfferPopupShow: false, // 多件优惠
    //好会员相关
    canOpenMember: false,
    goodMemberInfo:{
      isSelectMember: false, //单选按钮选中/隐藏
      memberModelStatus: false, //会员权益弹窗状态
      isAgreementModel:false, //服务协议弹窗状态
    },
    openMemberText: {},
    rightsInfo:{//权益弹窗信息
      left_title: '好会员尊享',
      num: 5,
      right_title:'好会员优惠', //好会员弹窗标题
      content: [],//权益项
    }, //权益弹窗内容
    errMsg: '',
    mergeInfo:{
      isMergePay:false,
      isMemberModal:false,
      mergePayList:[],
      orderIds:[],//合并支付的id
    },

    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
      address: state => state.order_commit.address,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (query) {
    this.onPageInit(query);
    // 3 拼团 4抽奖团 7助力
    // 保存订单数据
    this.setData({
      orderType: query.orderType || 3, // 默认拼团
    });

    // 获取订单数据
    this.refresh();
    this.getMsgboard();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const { listenAddressResult, selectCouponType } = this._data;

    // 选完地址|选完券刚回来
    if (listenAddressResult || selectCouponType) {
      this.refresh()
      return;
    }

    this.onMessage();
  },

  onAuthSuccess() {
    this.refresh();
  },

  refresh() {
    this.updateInitParams();
    this.orderInit();
  },
  // 显示隐藏多件优惠
  setOfferPopup() {
    this.setData({
      isOfferPopupShow: !this.data.isOfferPopupShow,
    })
  },
  // 更新 初始化参数
  updateInitParams() {
    let params = { ...this.pageQuery };

    this._data.listenAddressResult = false;

    // 更新券参数
    if (this._data.selectCouponType) {

      const { type, merchantId } = this._data.selectCouponType

      this._data.selectCouponType = null;

      const { currentCoupon } = xmini.store.state.order_commit;

      let currentPlatformCoupon = clone(this.data.currentPlatformCoupon || '');
      let merchantCoupon = clone(this.data.merchantCoupon);

      let jsonInfo = [];

      // 选择门店券刚回来
      if (type == 1 && merchantId) {
        merchantCoupon[merchantId].currentMerchantCoupon = currentCoupon;
      } else if (type == 2) {
        currentPlatformCoupon = currentCoupon;
      }

      jsonInfo = this.getCouponInfo({ currentPlatformCoupon, merchantCoupon });

      params.jsonInfo = jsonInfo;

    }

    this._data.initParams = params;
  },
  getCouponInfo({ currentPlatformCoupon, merchantCoupon }) {
    const jsonInfo = [];
    const merchantCouponKeys = Object.keys(merchantCoupon);
    for (let i = 0; i < merchantCouponKeys.length; i++) {
      const key = merchantCouponKeys[i];
      const currentMerchantCoupon = merchantCoupon[key].currentMerchantCoupon;
      let status = 1;
      if (!currentMerchantCoupon || !currentMerchantCoupon.coupon_code) {
        status = 0
      }
      jsonInfo.push({
        merchantId: key,
        couponCode: status ? currentMerchantCoupon.coupon_code : '',
        status,
        memberCoupon:status ?currentMerchantCoupon.member_coupon:'',
      })
    }

    // 平台券
    if (currentPlatformCoupon) {
      let status = 0;
      if (currentPlatformCoupon.coupon_code) {
        status = 1;
      }
      jsonInfo.push({
        couponCode: currentPlatformCoupon.coupon_code || '',
        status,
        memberCoupon:currentPlatformCoupon.member_coupon,
      })
    }

    return jsonInfo;
  },
  // 选择优惠券
  selectCouponEvent(e) {
    const { type, merchantId } = e.currentTarget.dataset;

    let couponList = [];
    let couponType = 0
    let currentCoupon = {};
    // 选择商家券
    if (type == 'merchant' && merchantId) {
      const currentMerchant = this.data.merchantCoupon[merchantId] || {}
      couponList = currentMerchant.list ? currentMerchant.list : [];
      currentCoupon = currentMerchant.currentMerchantCoupon;
      couponType = 1; // 商家券
    } else if (type == 'platform') {
      couponList = this.data.platformCouponList || [];
      currentCoupon = this.data.currentPlatformCoupon;
      couponType = 2; // 平台券
    }

    if (!couponList.length || !couponType) return;

    this._data.selectCouponType = {
      type: couponType,
      merchantId,
    }

    xmini.store.dispatch('setCurrentCoupon', currentCoupon);
    xmini.store.dispatch('setSelectCouponList', couponList);

    this.forward('availabel-coupon-list', {
      coupon_type: couponType,
    })
  },

  // 去选择地址
  onAddressBtnClicked(e) {
    xmini.piwikEvent('c_addaddress');
    this._data.listenAddressResult = true;
    const page = this.data.address.id ? 'address-list' : 'address-update';
    this.forward(page, {
      refresh: true,
      orderAddress: 1, // 说明是从订单确认页去的
    });
  },

  // 数量的改变
  countChangeVal(e) {
    console.log(e);
    if (!this.data.isFastbuy) {
      return;
    }
    // data.oldVal
    // data.value
    const { value, oldVal } = e.detail;
    // let tempVal = 1; // 0 是增加 1减少
    // if (value > oldVal) {
    //   tempVal = 0;
    // }
    if (this.pageQuery.amount != value) {
      // 立即购买过来的 只有一个品
      this.pageQuery.amount = value;
      this.refresh();
    }
  },
  // 留言
  bindMessageInput(e) {
    // console.log(e);
    const { id } = e.currentTarget.dataset;
    const { value } = e.detail;
    clearTimeout(this._data.tempInputTime);
    this._data.tempInputTime = setTimeout(() => {
      this.setData({
        [`notes.${id}`]: trim(value)
      })
    }, 500)
  },

  /**
   * 初始化订单
   */
  orderInit() {
    const that = this;
    const initParams = this._data.initParams || {};
    const { address } = xmini.store.state.order_commit;
    if (!initParams.pinActivitiesId || !initParams.skuId) {
      wx.showErrPage('无效商品Id');
      return;
    }

    const params = {
      scope: this,
      weights: 1,

      orderType: this.data.orderType,
      pinActivitiesId: initParams.pinActivitiesId,
      skuId: initParams.skuId,
      amount: initParams.amount || 1,
      pinEventId: initParams.pinEventId,

      addressId: address.id || 0,

      couponCodeInfo: JSON.stringify(initParams.jsonInfo),
      isCheckedMember:this.data.goodMemberInfo.isSelectMember,
    };
    this.setData({
      isLoading: true,
    })
    if(initParams.isMember){
      params.couponCodeInfo = [];
    }
    api.coupleOrderInit(
      params,
      (res) => {
        this.dealInitData(res);
      }, (err) => {
        if (err.errno === 510010) {
          this.forward('login');
          return true;
        }
        if (err.errno === 320007) {
          // 你不能参加自己的团
          wx.showToast(`${err.errno}: ${err.errmsg}`);
          this.postMessage('couple-share', {
            needRefresh: true,
          });
          setTimeout(() => {
            that.back();
          }, 1000);
          return true;
        }
        if (err.errno === 610021) {

          this.dealInitData(err);
          // this.setData({}, ()=>{
          //   // 是否有不可购买的商品
          //   if (this.data.canNotBuyList && this.data.canNotBuyList.length > 0) {
          //     this.onShowPopupWindow(this.data.canNotBuyList, true);
          //   }
          // })
          return true;
        }
      }
    );
  },

  /**
   * 提交订单
   */
  orderSubmit: function () {
    const that = this;
    const {
      pinActivitiesId,
      orderType,

      confirmSid = '',
      productList = [],
      address = {},
      needPayPrice = 0,
    } = this.data;

    xmini.piwikEvent('c_sumit', {
      pinActivitiesId: this.data.pinActivitiesId,
      orderType: this.data.orderType,
    });

    if (!confirmSid) {
      wx.showModal({
        // title: '提示',
        content: '订单初始化失败！',
        showCancel: false,
        confirmText: '我知道了',
        success(res) {
        }
      })
      return;
    }
    // 是否有不可购买的商品
    if (this.data.canNotBuyList && this.data.canNotBuyList.length > 0) {
      this.onShowPopupWindow(this.data.canNotBuyList, false);
      return;
    }

    if (!address.id) {
      wx.showModal({
        // title: '提示',
        content: '您的收货地址为空，是否添加收货地址？',
        confirmText: '添加',
        success(res) {
          if (res.confirm) {
            that.onAddressBtnClicked(); // 去添加地址
          }
        }
      })
      return;
    }

    // 是否包邮
    let merchant_name = '';
    for (let i = 0; i < productList.length; i++) {
      let tempPro = productList[i];
      if (!tempPro.canDelivery) {
        merchant_name = tempPro.merchant_name;
        break;
      }
    }

    if (merchant_name) {
      wx.showModal({
        // title: '提示',
        content: `店铺${merchant_name}不支持配送您选择的收货区域`,
        showCancel: false,
        confirmText: '我知道了',
        success(res) {
        }
      })
      return;
    }

    if (!needPayPrice) {
      wx.showModal({
        // title: '提示',
        content: '是否确认提交？',
        success(res) {
          if (res.confirm) {
            that.createOrder();
          }
        }
      })
      return
    }

    this.createOrder();
  },

  createOrder() {
    const {
      confirmSid = '',
      notes = {},
      productList = [],
      address = {},
      orderType,

      currentPlatformCoupon,
      merchantCoupon
    } = this.data;

    const initParams = this._data.initParams || {};

    const jsonInfo = this.getCouponInfo({ currentPlatformCoupon, merchantCoupon });

    let params = {
      confirmOrderSerialId: confirmSid,
      couponCodeInfo: JSON.stringify(jsonInfo),
      notes: JSON.stringify(notes),

      orderType: orderType,
      addressId: address.id,

      conformNewUser: 0,
      isCheckedMember: this.data.goodMemberInfo.isSelectMember,
      memberTemplateId: this.data.openMemberText.templateId,
    };

    api.orderSubmit(
      params,
      (res) => {
        const { needPay, orderIds } = res.data;
        if (!needPay) {
          if (res.data.url) {
            const { token = ''} = this.data.userInfo;
            let urlData = {
              currentTarget: {
                dataset: {
                  url: urlfix(res.data.url, 'replace=true&token='+ token)
                }
              }
            }
            this.onUrlPage(urlData);
          } else {
            this.forward('order-list', { type: 0, replace: true });
          }
          return;
        }

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
                      const { token = ''} = this.data.userInfo;
                      let urlData = {
                        currentTarget: {
                          dataset: {
                            url: urlfix(res2.data.url, 'replace=true&token='+ token)
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
                this.forward('order-list', { type: 1, replace: true });
              }
            });
          },
          fail: err => {}
        });

      }, (err) => {
        const tempErr = [9610020, 9610019, 210003, 9210003];
        if (tempErr.indexOf(err.errno) > -1) {
          this.refresh();
          return true;
        }
      }
    );

  },
 //处理错误单号
  dealPayErr(err){
    switch(err.errno){
      case 210018:
        this.setData({
          errMsg: err.errmsg,
          mergeInfo:{
            mergePayList: this.dealPayList(err.data.list),
            isMergePay: true,
            desc:err.data.desc,
          },
        });
      break;
      case 230004:
        this.setData({
          mergeInfo:{
            isMemberModal: true,
          },
          errMsg: err.errmsg,
        });
      break;
      default:
      break;
    }
  },
  //处理合并支付list
  dealPayList(list = []){
    return mapTo(list, (item,index) => {
      return {
        ...item,
        price:this.payPrice((item.price/100).toFixed(2)),
      };
    });
  },
  //处理价格
  payPrice(price){
    let priceArray = price.split('.');
    return {
      price_yuan: priceArray[0],
      price_fen: priceArray[1],
    };
  },
  /**
   * 不能购买的商品
   */
  initOrderCanNotBuy(data = {}) {
    const needRemoveGoods = [];

    const itemList = data.itemList || [];
    for (let i = 0; i < itemList.length; i++) {
      const merchant = itemList[i];
      const { skuList } = merchant;

      skuList.canNotBuyCount = 0;
      for (let j = 0; j < skuList.length; j++) {
        const item = skuList[j];
        item.uiItemStatus = 'normal';

        let canNotBuy = false;
        if (!item.canDelivery) { // 无法配送
          item.itemBackText = '更换收货地址';
          // item.itemStatusMsg = '商品无法配送至' + (this.data.address ? this.data.address.province || '' : '');
          item.itemStatusMsg = '商品无法配送至' + (this.data.address.id ? this.data.address.province || '' : '');
          item.uiItemStatus = 'canotdelivery';
          item.statusIcon = statusIconArray.noDelivery;
          canNotBuy = true;
        }
        if (item.restriction_amount && item.orderAmount > item.restriction_amount) { // 超出限购数
          item.itemBackText = '返回';
          item.itemStatusMsg = '超出限购数量';
          item.uiItemStatus = 'restriction';
          item.statusIcon = statusIconArray.restriction;
          item.eventId = "BACK";
          canNotBuy = true;
        }
        if (item.enabled === 0 || (item.expired_date - item.offline_before_expired - this.data.timestamp) <= 0) { // 已停售
          item.itemBackText = '返回';
          item.uiItemStatus = 'offline';
          item.itemStatusMsg = '商品无法购买';
          item.statusIcon = statusIconArray.offline;
          item.eventId = "BACK";
          canNotBuy = true;
        }
        if (item.left_stock < item.orderAmount || item.outOfStock) { // 库存不足
          item.itemBackText = '返回';
          item.itemStatusMsg = '商品已抢光';
          item.uiItemStatus = 'lowstock';
          item.statusIcon = statusIconArray.outstock; // 库存不足打上已抢光
          item.eventId = "BACK";
          canNotBuy = true;
        }
        if (item.outOfStock) { // 已抢光
          item.itemBackText = '返回';
          item.itemStatusMsg = '商品已抢光';
          item.uiItemStatus = 'outstock';
          item.statusIcon = statusIconArray.outstock;
          item.eventId = "BACK";
          canNotBuy = true;
        }

        if (!canNotBuy) {
          skuList.canNotBuyCount += 1;
        }
        // 将过滤掉的商品存入变量中
        if (item.uiItemStatus !== 'normal') {
          // isDisabled = true;
          needRemoveGoods.push(item);
        } else {
          // isDisabled = false;
        }
        this.setData({
          isDisabled: item.uiItemStatus !== 'normal',
          orderStatus: item.uiItemStatus,
        });
        // orderStatus = item.itemStatus;
      }
    }

    return needRemoveGoods;
  },

  /**
   * 解析OrderInit接口数据
   */
  // 接口数据
  dealInitData(res) {
    console.log(res);
    const that = this;
    const {
      itemList = [],
      platformDiscount = 0, // 实际平台优惠金额
      platformCouponList = [], // 平台优惠券

      totalPrice = 0, // 订单总金额
      needPayPrice = 0, // 支付金额
      totalAmount = 0, // 总件数

      savePrice = 0, // 节省的价格

      orderType, // 订单类型
    } = res.data.packageInfo || {};
    const { memberOpenInfo = {}, canOpenMember = false } = res.data;
    this._data.timestamp = res.timestamp;

    let {
      address = {},
      confirmSid,
    } = res.data;

    // 当前默认选中的平台券
    let currentPlatformCoupon = (platformCouponList || []).find((item) => {
      return item.selected;
    })
    if (!currentPlatformCoupon) {
      currentPlatformCoupon = null;
    } else {
      currentPlatformCoupon.platformDiscount = platformDiscount || 0;
    }

    let notes = {};
    let merchantCoupon = {}; // 商家可用券
    const productList = (itemList || []).map((item, index) => {
      let canDelivery = true;
      const newSkuList = (item.skuList || []).map((sku, i) => {
        if (!sku.canDelivery) canDelivery = false;
        const attrs = sku.attrs.map((it) => {
          return it.name + ':' + it.value;
        })

        // sku多件优惠
        let discount_activity = sku.discount_activity || {
          discount_price: 0,
          shop_discount: []
        }
        discount_activity.discount_price = dealPrice(discount_activity.discount_price)

        return {
          'id': sku.id,
          'product_id': sku.product_id,
          'name': sku.name,
          'thumbnail': sku.thumbnail,
          'price': dealPrice(sku.orderPrice), // 单价
          'market_price': sku.market_price, // 原价
          'left_stock': sku.left_stock,
          'enabled': sku.enabled, // 是否已停售 0 已停售 1未停售
          'amount': sku.orderAmount, //sku.amount, // 数量
          'attrs': attrs,// sku.attrs_desc, // 规格信息
          'expired_date': sku.expired_date,
          'max_cart_nums': sku.maxCartSkuCnt, //
          // 'canDelivery': sku.canDelivery, // 是否支持配送 sku
          discount_activity,
          is_member_price:sku.is_member_price,
        };
      })

      notes[item.merchantId] = ''; //存储 几率哪些门店 后面存储留言信息

      // 记录商家优惠券
      if (item.merchantCouponList && item.merchantCouponList.length) {
        let currentMerchantCoupon = item.merchantCouponList.find((it) => {
          return it.selected;
        })
        merchantCoupon[item.merchantId] = {
          list: item.merchantCouponList,
          currentMerchantCoupon,
          merchantDiscount: dealPrice(item.merchantDiscount)
        }
      }

      let deliveryPriceText = '';
      if (canDelivery) {
        if (item.deliveryPrice) {
          deliveryPriceText = `¥${dealPrice(item.deliveryPrice)}`
        } else {
          deliveryPriceText = '免运费';
        }
      } else {
        deliveryPriceText = '此店铺不支持配送您选择的收货区域';
      }
      //处理店铺优惠信息
      item.shop_reduce = item.shop_reduce || [];
      let newShopReduce = this.dealShopReduce(item.shop_reduce);

      return {
        canDelivery, // true 支持配送
        deliveryPrice: item.deliveryPrice, // 配送费
        isFreeDelivery: item.isFreeDelivery, // 是否免运费 1 免费
        deliveryPriceText, // 运费文案

        lately_double_tips: item.lately_double_tips || '', // 商家优惠活动

        total_double_discount_price: dealPrice(item.total_double_discount_price),
        'merchant_id': item.merchantId,
        'merchant_name': item.merchantName,
        'totalAmount': item.totalAmount, // 小计件数
        needPayPrice: dealPrice(item.needPayPrice), // 小计实付金额
        'totalPrice': dealPrice(item.totalPrice), // 小计总金额价格
        skuList: newSkuList,
        shop_activity_discount_price: dealPrice(item.shop_activity_discount_price),    //优惠总金额
        shopReduce: newShopReduce,                    //商家优惠
      }
    })


    // 订单总金额
    let tempTotalPrice = totalPrice;

    // 暂无商家优惠（没有做修改商家优惠券之后的计算逻辑）
    // 节省金额公式：（划线价-商品单价）*商品数量+平台优惠金额+商户优惠金额
    // 对应字段：
    // 划线价 packageInfo.itemList.skuList.market_price
    // 商品单价 packageInfo.itemList.skuList.orderPrice
    // 商品数量 packageInfo.itemList.skuList.orderAmount
    // 平台优惠金额 packageInfo.platformDiscount
    // 商户优惠金额 packageInfo.itemList.merchantDiscount

    // 处理 不能购买的商品
    let canNotBuyList = this.initOrderCanNotBuy(res.data.packageInfo);

    if (address.id) {
      xmini.store.dispatch('setOrderCommitAddress', address);
    }

    this.setData({
      isLoading: false,

      productList,

      savePrice, // 省的金额
      savePriceText: dealPrice(savePrice),

      totalPrice: tempTotalPrice, // 订单总金额
      needPayPrice, // 支付金额
      needPayPriceText: dealPrice(needPayPrice),

      totalAmount,

      notes, // 留言

      merchantCoupon,

      currentPlatformCoupon: currentPlatformCoupon,
      platformCouponList,

      // 筛选无法购买的商品列表
      canNotBuyList,

      confirmSid: confirmSid,

      orderType,
      openMemberText: {
        ...memberOpenInfo,
        discountPrice: dealPrice(memberOpenInfo.discountPrice),
        price: dealPrice(memberOpenInfo.price),
      },//好会员卡片信息
      canOpenMember: canOpenMember,
      'goodMemberInfo.isSelectMember': memberOpenInfo.isCheckedMember,
    });
    if (canNotBuyList && canNotBuyList.length > 0) {
      this.onShowPopupWindow(canNotBuyList);
    }
    if(canOpenMember){
      this.setData({
        rightsInfo:{
          left_title: memberOpenInfo.productSaleServes.left_title,
          num: memberOpenInfo.productSaleServes.num,
          right_title:memberOpenInfo.productSaleServes.right_title, //好会员弹窗标题
          content: memberOpenInfo.productSaleServes.content,//权益项
        },
      });
    }
  },
  //处理店铺优惠信息
  dealShopReduce(shopReduce) {
    return shopReduce.map(reduce => {
      let reduceDetail = '';
      reduce.detail_list.map(detail => reduceDetail += ('，' +  detail.text));
      reduceDetail = reduceDetail.substring(1);
      return {
        tips: reduce.tips,
        price: dealPrice(reduce.price),
        reduceDetail: reduceDetail,
      }
    })
  },

  /**
   * 商品信息弹窗
   */
  onShowPopupWindow: function (e = [], handleBack = false) {
    const popWindowData = {};
    popWindowData.title = e[0].itemStatusMsg; // '商品停售';
    popWindowData.backText = e[0].itemBackText;
    if (handleBack) {
      popWindowData.eventId = e[0].eventId || '';
    }
    popWindowData.itemList = e;
    popWindowData.listenBack = 'onHidePopupWindow';

    this.setData({
      popWindowData,
      windowHidden: !this.data.windowHidden,
    });
    // this.createMaskShowAnim();
    // this.createContentShowAnim();
  },

  onHidePopupWindow: function (e) {
    if (e.currentTarget.dataset.actionId === '更换收货地址') {
      this.onAddressBtnClicked();
    }
    if (e.currentTarget.dataset.eventId === 'BACK') {
      // this.back();
    }

    setTimeout(() => {
      this.setData({
        windowHidden: true,
      });
    }, 210);
  },

  // 控制公告弹层
  setModalBtn() {
    wx.showModal({
      // title: '提示',
      content: this.data.msgboard.content || '',
      showCancel: false,
      success(res) {
      }
    })
  },
  // 获取公告
  getMsgboard() {
    const params = {
      channelId: 1
    }
    api.getListMsgboard(params, (res) => {
      const { list = [] } = res.data;
      let msgboard = {};
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        if (item.position == 2) {
          msgboard = {
            content: item.content || '',
            title: item.title || ''
          }
        }
      }
      this.setData({
        msgboard,
      })
    }, () =>{
      return true;
    })
  },
  // 显示/隐藏 多件优惠弹窗
  onShowShopDiscount(e) {
    if (e) {
      const { index } = e.currentTarget.dataset;
      if (typeof index != 'undefined') {
        const currentItem = this.data.productList[index];
        if (!currentItem || !currentItem.lately_double_tips) return;
      }

      this.setData({
        currentMerchantIndex: index,
      });
      xmini.piwikEvent('c_coupon');
      this.setOfferPopup();
    }
  },
  //好会员选中
  selectMember(){
    const toggleStatus = this.data.goodMemberInfo.isSelectMember;
    if( toggleStatus ){
      this._data.initParams.isMember = true;
    }
    this.setData({
      'goodMemberInfo.isSelectMember': !toggleStatus,
    }, () => {
      this.orderInit();
    });
  },
  //显示/隐藏好会员权益弹窗
  toggleMemberModel(){
    const toggleModelStatus = this.data.goodMemberInfo.memberModelStatus;
    this.setData({
      'goodMemberInfo.memberModelStatus':!toggleModelStatus,
    })
  },
 //服务协议
  openMember(e){
    const { url = '' } = e.currentTarget.dataset;
    console.log(url,'url');
    this.onUrlPage(e);
  },
});
