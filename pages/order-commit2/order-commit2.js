// pages/order-commit/order-commit.js
import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import { storage } from '@xmini/x-mini/lib/index';
import {
  clone,
  urlfix,
  dealPrice,
} from '../../utils/index';
import mixins from '../../utils/mixins';
import orderPay from '../../utils/orderPay';
import { trim } from '../../utils/base/string';

const app = getApp();

xPage({
  ...mixins,
  ...orderPay,
  _data: {
    skuInfo: [],
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
    isLoading: true,

    isFastbuy: 0, // 是否是立即购买
    orderType: 1, // 订单类型,普通购订单:1,默认:1

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

    notes: {}, //留言信息

    msgboard: { // 公告
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
      isMergePay: false,
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

    const tempSkuInfo = JSON.parse(decodeURIComponent(query.skus_info || ''));

    let skuInfo = [];
    let skuKey = { s: 'skuId', c: 'amount', p: 'price' };
    for (let i = 0; i < tempSkuInfo.length; i++) {
      let tempSku = tempSkuInfo[i];
      let sku = {}
      const tempSkuKey = Object.keys(tempSku)
      for (let s = 0; s < tempSkuKey.length; s++) {
        let key = skuKey[tempSkuKey[s]];
        sku[key] = tempSku[tempSkuKey[s]];
      }
      skuInfo.push(sku);
    }
    console.log(skuInfo);

    this._data.skuInfo = skuInfo;

    this.setData({
      isFastbuy: query.isFastbuy ? 1 : 0,
    })

    // 获取订单数据
    this.refresh();
    this.getMsgboard();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const { listenAddressResult, selectCouponType } = this._data;

    // 选完地址|选完券刚回来
    if (listenAddressResult || selectCouponType) {
      this.refresh()
      return;
    }
    // this.refresh();
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
    // this._data.initParams

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
        memberCoupon:status ?currentMerchantCoupon.member_coupon : '',
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
        memberCoupon:currentPlatformCoupon.member_coupon || '',
      })
    }

    return jsonInfo;
  },
  // 选择优惠券
  selectCouponEvent(e) {
    const { type, merchantId } = e.currentTarget.dataset;
    xmini.piwikEvent('c_openvip');
    let couponList = [];
    let couponType = 0
    let currentCoupon = {};
    // 选择商家券
    if (type == 'merchant' && merchantId) {
      const currentMerchant = this.data.merchantCoupon[merchantId];
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
    // console.log(e);
    if (!this.data.isFastbuy) {
      return;
    }
    // data.oldVal
    // data.value
    const { value, oldVal } = e.detail;
    let tempVal = 1; // 0 是增加 1减少
    if (value > oldVal) {
      tempVal = 0;
    }
    xmini.piwikEvent('c_num', { skuid: this._data.skuInfo[0].skuId, index: tempVal, name: value });
    if (this._data.skuInfo[0].amount != value ){
      // 立即购买过来的 只有一个品
      this._data.skuInfo[0].amount = value;
      this.refresh();
    }
  },

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
    const initParams = this._data.initParams || {};
    const { address } = xmini.store.state.order_commit;
    this.setData({
      isLoading: true,
    })
    const params = {
      scope: this,
      weights: 1,

      skusInfo: JSON.stringify(this._data.skuInfo), // 下单商品信息,skuId,amount,price
      note: '',
      orderType: 1, // 订单类型,普通购订单:1,默认:1
      addressId: address.id, // 收货地址ID,默认为用户默认收货地址
      isFastbuy: this.pageQuery.isFastbuy ? 1 : 0, // 是否直接购买，1-是，0-否 默认0
      couponCodeInfo: JSON.stringify(initParams.jsonInfo),
      isCheckedMember:this.data.goodMemberInfo.isSelectMember,
    };
    if(initParams.isMember){
        params.couponCodeInfo = [];
    }
    api.orderInit_v1(
      params,
      res => {
        //
        this.dealInitData(res);

      },
      err => {
        // if( err.errno == 610028 || err.errno == 610029 ){
        //   // wx.showErrPage(err.errmsg);
        // }

      }
    );

  },
  //初始化接口
  // initPage(params = this.data.orderParams){
  // },
  dealInitData(res) {
    const {
      itemList = [],
      platformDiscount = 0, // 实际平台优惠金额
      platformCouponList = [], // 平台优惠券
      totalPrice = 0, // 订单总金额
      needPayPrice = 0, // 支付金额
      totalAmount = 0, // 总件数
      savePrice = 0, // 节省的价格
    } = res.data.packageInfo || {};
    const { memberOpenInfo = {}, canOpenMember= false } = res.data;
    console.log(res.data.packageInfo, 'memberOpenInfo');

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
    // 留言
    let notes = {};
    let merchantCoupon = {}; // 商家可用券
    const productList = (itemList || []).map((item, index) => {
      let canDelivery = true;
      const newSkuList = (item.skuList || []).map((sku, i) => {
        if (!sku.canDelivery) canDelivery = false;

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
          'amount': sku.amount, // 数量
          'attrs': sku.attrs_desc, // 规格信息
          'expired_date': sku.expired_date,
          'max_cart_nums': sku.max_cart_nums,
          // 'canDelivery': sku.canDelivery, // 是否支持配送
          discount_activity,
          is_member_price:sku.is_member_price,
        };
      })
      //处理店铺优惠信息
      item.shop_reduce = item.shop_reduce || [];
      let newShopReduce = this.dealShopReduce(item.shop_reduce);


      notes[item.merchant_id] = ''; //存储 几率哪些门店 后面存储留言信息

      // 记录商家优惠券
      if (item.merchantCouponList && item.merchantCouponList.length) {
        let currentMerchantCoupon = item.merchantCouponList.find((it) => {
          return it.selected;
        })
        merchantCoupon[item.merchant_id] = {
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


      return {
        canDelivery, // true 支持配送
        deliveryPrice: item.deliveryPrice, // 邮费
        isFreeDelivery: item.isFreeDelivery, // 是否免运费 1 免费
        deliveryPriceText, // 运费文案

        lately_double_tips: item.lately_double_tips || '', // 商家优惠活动
        total_double_discount_price: dealPrice(item.total_double_discount_price),

        'merchant_id': item.merchant_id,
        'merchant_name': item.merchant_name,
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
      needPayPriceText:dealPrice(needPayPrice),

      totalAmount, // 总件数

      notes, // 留言

      merchantCoupon,

      currentPlatformCoupon: currentPlatformCoupon,
      platformCouponList,

      confirmSid, // 临时订单id
      openMemberText:{
        ...memberOpenInfo,
        discountPrice: dealPrice(memberOpenInfo.discountPrice),
        price: dealPrice(memberOpenInfo.price),
      },//好会员卡片信息
      canOpenMember: canOpenMember,
      'goodMemberInfo.isSelectMember': memberOpenInfo.isCheckedMember,
    })
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
      reduce.detail_list.map(detail => reduceDetail += ('，' + detail.text));
      reduceDetail = reduceDetail.substring(1);
      return {
        tips: reduce.tips,
        price: dealPrice(reduce.price),
        reduceDetail: reduceDetail,
      }
    })
  },
  // 提交订单
  orderSubmit() {
    xmini.piwikEvent('c_sumit');
    //判断是否有不支持配送的品
    //
    const that = this;

    const {
      confirmSid = '',
      productList = [],
      address = {},
      needPayPrice = 0,
    } = this.data;

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
    // 留言
    const notesKey = Object.keys(notes);
    const tempNotes = [];
    if (notesKey.length) {
      for (let i = 0; i < notesKey.length; i++) {
        let tempKey = notesKey[i]
        tempNotes.push({
          merchantId: tempKey,
          note: notes[tempKey],
        })
      }
    }
    // 券
    const jsonInfo = this.getCouponInfo({ currentPlatformCoupon, merchantCoupon });
    //好会员参数

    let params = {
      confirmOrderSerialId: confirmSid,
      couponCodeInfo: JSON.stringify(jsonInfo),
      notes: JSON.stringify(tempNotes),
      addressId: address.id,
      orderType: orderType,
      isCheckedMember: this.data.goodMemberInfo.isSelectMember,
      memberTemplateId: this.data.openMemberText.templateId,
    };
    wx.showLoading();
    api.orderSubmit_v1(
      params,
      res => {
        this.payAction(res);
      },
      err => {
        return this.payError(err);
      }
    )
  },
  payError(err) {
    const tempErrno = [9910002, 9210074, 9210075, 9210076, 9210077, 9210078, 9210079];
    const that = this;
    if (tempErrno.indexOf(err.errno)>-1) {
      wx.showModal({
        // title: '提示',
        content: err.errmsg || '',
        showCancel: false,
        confirmText: '我知道了',
        success(res) {
          // console.log(res.confirm);
          if (res.confirm) {
            xmini.piwikEvent('c_popup', { errno: err.errno });
            if (err.errno == 9910002) that.refresh();
          }
        }
      })
      return true;
    }
    const tempErrno1 = [9210032, 9210033, 9910002, 9610020, 9610019, 210003, 9210003]
    if (tempErrno1.indexOf(err.errno) > -1) {
      this.refresh();
      return true;
    }
  },
  payAction(res) {
    // console.log(res);
    const {
      needPay,
      orderIds,
      order_ids,
    } = res.data;

    // this.reportData('PayOrder', {
    //   //订单ID
    //   order_id: orderIds
    //   order_amount:
    //   order_actual_amount:
    //   payment_method: '公众号支付',
    // });

    const { needPayPrice, totalPrice, productList, totalAmount } = this.data;
    const skuInfo = (productList[0] && productList[0].skuList) && productList[0].skuList[0] || {};
    if (!needPay) {
      this.reportData('PayOrder', {
        //订单ID
        order_id: orderIds,
        order_amount: totalPrice,
        order_actual_amount: 0,
        payment_method: '公众号支付',
      });
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
        // let url = 'https://m.dev.haoshiqi.net/v2/order-result?id=2190227516';
        // let jumpUrl = urlfix(url, 'token=' + token);
        this.forward('order-result', { id: (orderIds || []).toString(), replace: true });
        // this.forward('web-view', { url: encodeURIComponent(jumpUrl) });
      }
      this.reportData('PayOrderResult', {
        //订单ID
        order_id: orderIds,
        is_success: true,
        commodity_id: skuInfo.id,
        commodity_name: skuInfo.name,
        commodity_num: totalAmount,
        order_amount: totalPrice,
        order_actual_amount: 0,
        payment_method: '公众号支付',
      });
      return;
    }

    this.reportData('PayOrder', {
      //订单ID
      order_id: orderIds,
      order_amount: totalPrice,
      order_actual_amount: needPayPrice,
      payment_method: '公众号支付',
    });
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
            this.reportData('PayOrderResult', {
              //订单ID
              order_id: orderIds,
              is_success: true,
              commodity_id: skuInfo.id,
              commodity_name: skuInfo.name,
              commodity_num: totalAmount,
              order_amount: totalPrice,
              order_actual_amount: needPayPrice,
              payment_method: '公众号支付',
            });

            // 确认支付
            this.confirmOrder({
              data: {
                paymentId: res.data.paymentId,
                mergeType: res.data.mergeType,  // 1普通订单,2单独购,4拼团订单,8抽奖团
              },
              success: (res2) => {
                if (res2.data.url) {
                  const { token = ''} = this.data.userInfo;
                  let urlData = {
                    currentTarget: {
                      dataset: {
                        url: urlfix(res2.data.url, 'replace=true&token=' + token)
                      }
                    }
                  }
                  this.onUrlPage(urlData)
                  return;
                }
                this.forward('order-list', { type: 0, replace: true });
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
            this.reportData('PayOrderResult', {
              //订单ID
              order_id: orderIds,
              is_success: false,
            });
          }
        });
      },
      fail: err => {}
    });

  },
  //处理特殊错误单号
  dealPayErr(err){
    switch(err.errno){
      case 210018:
        this.setData({
          errMsg: err.errmsg,
          mergeInfo:{
            mergePayList: this.dealPayList(err.data.list),
            isMergePay: true,
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
        console.log('没处理');
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
      // console.log('msgres', res)
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
    }, (err) => {
      console.log(err);
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
    xmini.piwikEvent('c_openvip',{index:toggleStatus});
    if( toggleStatus ){
      this._data.initParams.isMember = true;
    }
    this.setData({
      'goodMemberInfo.isSelectMember':!toggleStatus,
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
    if (url) {
      this.onUrlPage(e);
    }
  },
  //处理合并支付拦截弹窗
  handlePayModal(){
    const mergePayStatus = this.data.mergeInfo.isMergePay;
    let orderIds = this.data.mergeInfo.mergePayList.map( (item) =>{ return item.orderId });
    this.setData({
      mergeInfo:{
        isMergePay:!mergePayStatus,
        orderIds:orderIds,
      }
    });
  },
});
