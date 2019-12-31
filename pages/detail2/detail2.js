import {
  me,
  xmini,
  mapState,
  xPage,
  mapActions
} from '../../config/xmini';
import api from '../../api/index';
import {
  dealPrice,
} from '../../utils/index';
import mixins from '../../utils/mixins';

import CountManger from '../../utils/CountManger';
import {
  formatCountDown,
  formatDate,
  formatLeftTimeObj
} from '../../utils/dateUtil';
import wxParse from '../../wxparse/wxParse';
import { isEmptyObject } from '../../utils/is';
import skuMixin from '../../components/sku-select/skuMixin';
import coupon from '../../components/coupon-list/coupon';
const app = getApp();
let width;
// let skusKey;
// let dataAttrs;
// let attrDatasList = [];

xPage({
  ...mixins,
  ...skuMixin,
  ...coupon,
  _data: {
    // 收藏／未收藏的icon
    unLikeImg: 'https://img1.haoshiqi.net/miniapp/unlike_879608c2d8.png',
    likeImg: 'https://img1.haoshiqi.net/miniapp/like_93c1d5ceb0.png',

  },
  data: {
    isLoading: true,
    // sku
    isShowPopup: false, // v-model
    normSelectTag: 0,
    currentSum: 1,
    maxBuySum: 100,

    skuBtnStatus: {
      isBtnActive: true, // 按钮否可用
      buyBtnText: '立即购买',
      cartBtnText: '加入购物车',
    },

    attrList: [],
    skuStocksList: {}, // 属性ID 对应 sku列表

    currentSkuData: {}, // 当前skuData
    smallCurrentSkuData: {},
    selectedAttrName: [], // 已选择 attr
    notSelectedAttrName: '', // 未选择属性提示
    // sku end

    cartNumber: 0,
    showCoupons: false, //是否显示优惠券列表
    sucToast:false, // 显示领取成功的toast
    couponList:[],//显示的券详情
    coupons: [],//领券列表

    isShowGoHome: false,
    shareInfo: true,
    priceObj: {
      price: '',
      point: '',
      marketPrice: '',
    },
    descData: {},
    labels: [],
    // pinActivitiesId: -1,
    // skuId: -1,
    // showArrow: false,       // 新人首单立减是否可点击
    // showNewUserRule: false, // 显示新人首单立减规则
    // promotions: [],
    priceExplain: '被划去的“价格”指同品牌同种等量规格的商品在国内大陆地区主流电商平台，但不仅限于电商平台上的标示价格、或厂家、供应商的指导价；商品实际售价为本平台实时销售价格\n\n“单独购“为拼团产品中1人单买价格，”X人团“为拼团产品中多人（人数大于或等于2人）拼团购买价格',
    // showSelect: false,
    // amountNum: 1,
    merchantData:{},
    showAct:false,
    activityTime: {},
    // showActivity: false,
    // memberStatus: 0,    // 轻会员状态   0没有开通 1 已开通 2失效中 3 已失效
    // userStatus: true,
    onShowPromotionInfo: false,
    //好会员
    isShowMemberModel:false,
    isMember:false,
    goodMemberInfo:{
      logo: 'https://img1.haoshiqi.net/miniapp/profile/profile-member-icon_6b175c2fdc.png',
      memberText: '开通好会员本单减',  //折扣文案
      discountPrice: 5, //折扣价格
      possessionPrice:'',
      type: '立即开通', //1.立即开通 2.去续费  3.更多权益 4.去领券
      url : 'http://m.dev.haoshiqi.net/v2/member-open?type=1', //按钮跳转url
      left_title: '好会员尊享',
      num: 5,
      right_title:'好会员优惠', //好会员弹窗标题
      content: [],//权益项
      showMember:false,
    },
    isInit: true,
    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
      addresses: state => state.location.addresses
    })
  },

  onLoad(query) {
    this.onPageInit(query);
    this.initData();

    width = wx.$getSystemInfo().windowWidth;
  },
  onShow(){
    this.setData({
      isInit: true
    })
    this.refresh();
    this.checkNewCurrentCity();
    if (this.type) {
      this.startActivityCountDown();
    }
    this.updateUserCart();
  },
  onHide() {
    this.clearCountDown();
    this.onClose();
  },
  onUnload() {
    if (this.countManager) {
      this.countManager.clear();
      this.countManager = null;
    }
    this.clearCountDown();
    this.onClose();
  },
  ...mapActions([
    'getGeo',
  ]),
  getGeoLocation() {
    this.setData({
      isInit: false
    })
    // 获取地址位置
    this.getGeo({
      name: 'app',
      success: res => {
        console.warn('app.js 定位回调', res);
        let currentAddress = res.province + ' ' + res.city;
        xmini.store.dispatch('setAddressInfo', { "currentProvinceId": res.provinceId, "currentAddress": currentAddress, "addressId": null, "cityId": res.cityId });
        this.setLocation();
        this.checkDelivery();
      },
      fail: err => {
        console.log(err);
        this.setLocation();
        this.checkDelivery();
      },
      hasLocation: () => {
        this.setLocation();
        this.checkDelivery();
      }
    })
  },
  setLocation() {
    const { addressInfo } = xmini.store.state.location;
    this.setData({
      currentCity: addressInfo,
    });
  },
  initData() {
    this.setLocation();
    this.setData({
      skuId: this.pageQuery.id,
    });
  },
  refresh(query = this.pageQuery){
    const { id = 33971 } = query;
    // query.id = query.id ? query.id : '12073'
    if (id) {
      this.getItemInfo(id);
      // this.data.pinActivitiesId = id;
    }
  },

  onAuthSuccess() {
    this.setData({
      isInit: true
    })
    this.refresh();
  },
  clearCountDown() {
    if (this.activityCountManager) {
      this.activityCountManager.clear();
      this.activityCountManager = null;
    }
  },
  skuDataOnChange(skuData = {}) {
    console.log('=======来新的sku了', skuData);
    if (!skuData.skuid) return;
    this.getItemInfo(skuData.skuid);
  },
  //获取好会员信息
  getGoodMemberInfo({price = 0}){
    const memberBtnType = ['立即开通','去续费','更多权益','去领券'];
    api.getProductMemberInfo({
      price:price || 0,
      skuId:this.data.skuId,
      type:0,
    },(res) =>{
      const data = res.data;
      if(isEmptyObject(data)){
        this.setData ({
          goodMemberInfo:{
            memberText: data.discount_text,
            discountPrice: data.discount_price?data.discount_price / 100:0,
            possessionPrice:(data.possession_price > 0 && data.possession_text)?`￥${(data.possession_price /100).toFixed(2)}${data.possession_text}`:'',
            type: memberBtnType[data.type - 1], //1.立即开通 2.去续费  3.更多权益 4.去领券
            url : data.url, //按钮跳转url
            left_title: data.tips.left_title,
            num: data.tips.num,
            right_title:data.tips.right_title,
            content: data.tips.content || [],//权益项
            showMember:true,
          },
        });
        console.log(data, 'memberInfo');
        //将权益弹窗的存储
        app.updateData({
          memberInfo:data
        });
      }
    }, (err) =>{
      console.log(err,'err');
      return true;
    })
  },
  // 获取商品信息
  getItemInfo(id) {
    const that = this;
    // this.setData({
    //   isLoading: true,
    // })
    api.getItemInfo({
      skuId: id,

      scope: this,
      weights: 1,
      // noHideLoading: true
    }, (res) => {
      const data = res.data;
      this.timestamp = res.timestamp;

      const {
        productId = 0,
        pics = [] , // banner 图

        merchantInfo = {}, // 商家信息
        merchant_type, //商家信息类型

        attrDatas = {},
        attrKeys = [],

        name = '',

        description = '',
        restriction_amount = 0,
        canDelivery,        //是否可配送
        freightInfo = '',   //运费信息

        pricePrefix = '¥',
        price = 0,
        market_price = 0,
        left_stock = 0,

        enabled = false,

        is_like = false,

        coupons = [],

        labels = [],

        activityPreheat, // // 活动预热的数据
        shareInfo = {},

        maxCartSkuCnt = 100,
        member_price = 0,
        is_member = false,
        // is_member_price = false,
      } = data;
      // this.attrKeys = data.attrKeys || [];
      // this.attrDatas = data.attrDatas || {};
      // skusKey = this.getKeysAttr(this.attrKeys);
      // dataAttrs = this.getAttrDataKeys(this.attrDatas);
      // let selectAttrKeys = this.getSelectKeys();
      // const buyBtnStatus = (!data.coupleIsOnline || data.left_stock < 1 || data.startTime > res.timestamp) ? 'disabled' : '';

      this.reportData('CommodityDetail', {
        //商品ID
        commodity_id: id,
        commodity_name: name,
        commodity_originalprice: market_price,
        commodity_presentprice: price,
      });

      const swiperList = (pics || []).map((item) => {
        return {
          image: item,
          url: '',
        };
      });

      const { wechat = {} } = data.shareInfo;

      // const noStock = data.left_stock < 1 ? true: false; // 是否已抢光
      // const unLine = data.coupleIsOnline ? false: true;  // 是否已停售

      // 商家信息
      const newMerchantData = {
        ...merchantInfo
      }
      let isMember = member_price ? true : false; //是否是会员品
      let userIsMember = is_member ? true : false; // 用户是否是好会员

      const collectionImg = is_like ? this._data.likeImg : this._data.unLikeImg;


      // 价格的逻辑
      let priceObj = {};
      if(isMember && userIsMember){
        priceObj = {
          rmb: 1,
          price: member_price,
          singlePrice:price,
          marketPrice: market_price,
          memberPrice:member_price,
        };
      }else if(isMember){
        priceObj = {
          rmb: 1,
          price: member_price,
          singlePrice:price,
          marketPrice: market_price,
          memberPrice:member_price,
        };
      }else{
        priceObj = {
          rmb: 1,
          price,
          singlePrice:price,
          marketPrice: market_price,
        };
      }

      function mapObj(obj, cb) {
        const result = {};
        const temp = {};
        for (const key in obj) {
          result[key] = cb(obj[key], key);
        }
        return result;
      }

      const stocksList = mapObj(attrDatas, item => {
        return {
          id: item.id,
          name: item.name,
          thumbnail: item.thumbnail,
          price: item.price,
          priceText: dealPrice(item.price),
          market_price: item.market_price,
          left_stock: item.left_stock,
          skuid: item.id,
          max_buy_num: item.left_stock,
        };
      });

      // 处理活动预热模块数据
      let showAct = false;
      let tempActivityPreheat = {
        activityType: activityPreheat && activityPreheat.activityType || 0, // 营销活动类型：1 普通 2 秒杀
      };
      // 判断是否有秒杀活动
      if (activityPreheat) {
        let tempPrice = activityPreheat.activityPrice || 0;
        if (member_price && userIsMember) {
          tempPrice = member_price || 0;
        }

        tempActivityPreheat.price = dealPrice(tempPrice).split('.');
        tempActivityPreheat.activityStock = activityPreheat.activityStock || 0;
        tempActivityPreheat.activityMarketPrice = (activityPreheat.marketPrice / 100).toFixed(2);
        showAct = true;
        if (res.timestamp > activityPreheat.startTime && res.timestamp <= activityPreheat.endTime) {
          // 活动中
          tempActivityPreheat.activityCountTip = '距离结束还有'
          tempActivityPreheat.activityStatus = 'start'
        } else if (res.timestamp <= activityPreheat.startTime) {
          // 活动还没开始
          tempActivityPreheat.activityCountTip = '距离开始还有'
          tempActivityPreheat.activityStatus = 'ready'
        } else {
          tempActivityPreheat.activityStatus = 'end'
          showAct = false;
        }

        // 活动进度条展示
        tempActivityPreheat.rateNumber = 100 - (parseInt( tempActivityPreheat.activityStock / activityPreheat.allStock * 100) || 0);

        tempActivityPreheat.activityPrice = activityPreheat.activityPrice || 0;
        tempActivityPreheat.activityStartTimeTip = `${formatDate(activityPreheat.startTime || 0, 'M.D H:F')}开抢`;

        tempActivityPreheat.activityStartTime = activityPreheat.startTime || 0;
        tempActivityPreheat.activityEndTime = activityPreheat.endTime || 0;
      }
      let skuSelectPrice = userIsMember && isMember ? member_price : price;
      const smallCurrentSkuData = {
        priceText: '￥' + dealPrice(skuSelectPrice),
      }

      this.setData({
        isLoading: false,

        smallCurrentSkuData,

        attrList: attrKeys,
        skuStocksList: stocksList,

        maxBuySum: maxCartSkuCnt,
        'skuBtnStatus.isBtnActive': enabled && left_stock ? true : false, // 按钮否可用'
        canDelivery, 
        freightInfo,
        // showAct,
        // priceInt,
        // priceFloat,
        // activityStock,
        // activityMarketPrice,
        // rateNumber: 100 - rateNumber,
        // activityType: activityPreheat.activityType || 0,
        // shopDiscount: data.shopDiscount && data.shopDiscount.join('，') || '',
        // activityCountTip,
        // activityStartTime: activityPreheat.startTime || 0,
        // activityEndTime: activityPreheat.endTime || 0,
        // activityStatus,
        // timestamp: res.timestamp,
        // maxBuySum: data.max_cart_nums || 100,

        descData: {
          merchant_type: merchant_type,
          title: name,
          pricePrefix: pricePrefix,
          desc: description.replace(/[\r\n]/g, ''),
          restriction_amount: restriction_amount || 0,
          left_stock: left_stock,
          is_show_stock: (left_stock <= 30 && left_stock >= 0) ? true : false,
        },
        priceObj,
        // 多件优惠信息,活动预热倒计时
        showAct,
        activityPreheat: tempActivityPreheat,

        is_like
        ,
        collectionImg,

        shareInfo: {
          title: wechat.title,
          desc: wechat.content,
          imageUrl: wechat.thumbnail,
          piwikAction: '详情页分享',
        },
        swiperInfo: {
          list: swiperList || [], // 如果数据不符合格式，可以使用 mapTo 方法
          hwRatio: 1,
          height: width,
        },
        // 促销信息
        promotions: merchantInfo && merchantInfo.promotions || [],
        labels,
        isLoadig: false,
        merchantData: newMerchantData,
        // coupons, //领券列表
        coupleList: coupons,//领券信息
        isMember,
        memberPrice: member_price,
        userIsMember,
      }, () =>{
        //初始化时获取位置信息
        if (this.data.isInit) {
          this.getGeoLocation();
        }
         // 计算当前传入价格
          let tempPrice = 0
          if (member_price) {
            tempPrice = member_price
          } else if (tempActivityPreheat.selfPrice && tempActivityPreheat.activityType !==2) {
            tempPrice = tempActivityPreheat.selfPrice
          } else {
            tempPrice = priceObj.price;
          }
          this.getGoodMemberInfo({
            price: tempPrice,
          });
        if (showAct && tempActivityPreheat.activityStatus == 'ready') {
          this.type = 1;
          this.startActivityCountDown()
        } else if (showAct && tempActivityPreheat.activityStatus == 'start') {
          this.type = 2;
          this.startActivityCountDown()
        }
      });

      wx.hideLoading();
      this.getSkuDetailMore(productId);
      if (this.countManager) {
        this.countManager.clear();
        this.countManager = null;
      }
    }, (err) => {
    });
  },
  startActivityCountDown(type = this.type) {
    const { activityPreheat } = this.data;
    const that = this;
    const diffTime = Date.now() - this.timestamp * 1000;
    this.diffTime = diffTime
    const localStartTime = activityPreheat.activityStartTime * 1000 + diffTime;
    this.localStartTime = localStartTime
    const localEndTime = activityPreheat.activityEndTime * 1000 + diffTime;
    this.localEndTime = localEndTime

    this.activityCountManager = new CountManger({
      times: 1000,
      dataList: [{}],
      set() {
        // 剩余结束时间
        const leftEndTimes = that.localEndTime - Date.now();
        // 剩余开始时间
        const leftStartTimes = that.localStartTime - Date.now();
        if (leftEndTimes > 0 || leftStartTimes > 0) {
          this.start();
        }else{
          this.clear();
          that.refresh();
        }
      },
      callback() {
        let leftEndTimes = that.localEndTime - Date.now();
        let leftStartTimes = that.localStartTime - Date.now()
        // 没开始的状态，且还没到开始时间
        if (leftStartTimes > 0 && type == 1) {
          // 活动还没开始，倒计时
          that.setData({
            'activityPreheat.activityStatus': 'ready',
            'activityPreheat.activityCountTip': '距离开始还有',
            'activityPreheat.activityTime': formatLeftTimeObj(leftStartTimes) || 0,
          })
        } else if (leftStartTimes <= 0 && type == 1) {
          // 没开始的状态，且到了开始时间，清除倒计时，重新调接口
          this.clear();
          that.refresh();
        } else if (leftEndTimes > 0 && type != 1) {
          // 活动开始了的状态，且活动还没结束，倒计时
          that.setData({
            'activityPreheat.activityStatus': 'start',
            'activityPreheat.activityCountTip': '距结束还有',
            'activityPreheat.activityTime': formatLeftTimeObj(leftEndTimes)
          })
        } else if (leftEndTimes <= 0 && type != 1) {
          // 活动开始的状态，且活动已结束，清除倒计时，重新调接口
          this.clear();
          that.refresh();
        }
      },
    })
  },
  showCoupons() {
    this.setData({
      showCoupons: true,
    },() => {
      this.couponParams = {
        merchantId : this.data.merchantData.id,
        skuId: this.data.skuId,
      }
      this.getCouponList();
    });
  },
  onClose() {
    this.clearCountDown();
    this.setData({
      showCoupons: false,
    });
  },

  // 显示/隐藏 多件优惠弹窗
  onShowShopDiscount() {
    const toggleShow = this.data.showshopDiscount
    this.setData({
      showshopDiscount: !toggleShow,
    })
  },

  toggleCollection() {
    if (!this.verifyAuth()) return;
    if (this.data.is_like) {
      this.removeCollection();
    } else {
      this.addCollection();
    }
  },
  removeCollection() {
    api.removeLikeProduct({
      skuIds: this.data.skuId,
    }, (res) => {
      this.setData({
        is_like: false,
        collectionImg: this._data.unLikeImg,
      });
    });
  },
  addCollection() {
    api.addLikeProduct({
      skuIds: this.data.skuId,
    }, (res) => {
      this.setData({
        is_like: true,
        collectionImg: this._data.likeImg,
      });
    });
  },

  // 获取图文详情
  getSkuDetailMore(pid) {
    let that = this;
    api.getProductDetail({
      productId: pid,
      sourceType: 4,
    }, (res) => {
      const detailMore = res.data;
      // 富文本处理
      const tempDetail = detailMore.graphicDetail;
      wxParse.wxParse('data', 'html', tempDetail, that, 10, 'detail');

    }, (err) => {
      // console.log(err);
    });
  },

  // 跳转到在线客服
  toCustomService() {
    xmini.piwikEvent('详情页点击联系客服');
    this.forward('service');
  },
  goCart() {
    xmini.piwikEvent('c_cartbtn');
    if (!this.verifyAuth()) return;
    this.forward('shopping-cart');
  },
  onSelectNorm() {
    this.setData({
      normSelectTag: 0,
      isShowPopup: true,
    });
  },
  goAddCart(e) {
    console.log(this.data.userIsMember ,'price');
    if (!this.data.skuBtnStatus.isBtnActive) return;
    if (!this.verifyAuth()) return;
    this.clearCountDown();
    let skuInitPrice = 0;
    if(this.data.userIsMember && this.data.memberPrice){
      skuInitPrice = '￥' + dealPrice(this.data.memberPrice)
    } else {
      skuInitPrice = '￥' + dealPrice(this.data.priceObj.singlePrice)
    }
    this.setData({
      normSelectTag: 1,
      isShowPopup: true,
      smallCurrentSkuData: {
        priceText: skuInitPrice || '¥0'
      }
    });
    const { skuId, name, priceObj: { price, marketPrice } } = this.data;
    this.reportData('AddToShoppingCart', {
      //商品ID
      commodity_id: skuId,
      commodity_name: name,
      commodity_originalprice: marketPrice,
      commodity_presentprice: price,
      commodity_num: 1,
    });
  },
  goBuyCommit(e) {
    if (!this.data.skuBtnStatus.isBtnActive) return;
    if (!this.verifyAuth()) return;
    this.clearCountDown();
    let skuInitPrice = 0;
    if(this.data.userIsMember && this.data.memberPrice){
      skuInitPrice = '￥' + dealPrice(this.data.memberPrice)
    } else {
      skuInitPrice = '￥' + dealPrice(this.data.priceObj.singlePrice)
    }
    this.setData({
      normSelectTag: 2,
      isShowPopup: true,
      smallCurrentSkuData: {
        priceText: skuInitPrice || '¥0'
      }
    });
    const { skuId, name, priceObj: { price, marketPrice } } = this.data;
    this.reportData('buyNow', {
      //商品ID
      commodity_id: skuId,
      commodity_name: name,
      commodity_originalprice: marketPrice,
      commodity_presentprice: price,
      commodity_num: 1,
    });
  },
  goOrderCommit(data) {
    const skus_info = [
      {
        s: this.data.currentSkuData.skuid,
        c: this.data.currentSum,
        p: this.data.currentSkuData.price
      }
    ]
    this.forward('order-commit2', {
      skus_info: JSON.stringify(skus_info),
      orderType: 1,
      isFastbuy: 1, // 立即购买
    });
  },
  fetchAddCart() {
    const data = this.data.currentSkuData;
    api.addSkuToCart(
      {
        type: 1,
        skuId: data.skuid,
        amount: this.data.currentSum,
      },
      res => {
        this.updateUserCart();
        wx.showToast('添加购物车成功');
        this.setData({
          isShowPopup: false,
        });
      }
    )
  },
  updateUserCart() {
    api.getUserCart(
      {
        isLoading: false,
      },
      res => {
        this.setData({
          cartNumber: res.data.total_sku_cnt,
        });
      },
      err =>{
        return true;
      }
    );
  },
  // 接收sku 点击的事件
  onBtnClick(data) {
    this.clearCountDown();
    const { type } = data.detail;

    if (!this.verifyAuth()) return;

    switch(type) {
      case 'buyBtn':
        xmini.piwikEvent('c_buy', { skuid: this.data.currentSkuData.skuid });
        this.goOrderCommit();
        this.setData({
          isShowPopup: false,
        });
        break;
      case 'addShoppingCart':
        xmini.piwikEvent('c_addcart', { skuid: this.data.currentSkuData.skuid });
        this.fetchAddCart();
        break;
    }
  },
  verifyAuth() {
    const { logged, userInfo } = this.data;
    const pageComponent = this.selectComponent('#dwd-page-detail2');
    if (!logged) {
      // 显示登录弹窗
      pageComponent.setData({
        isShowLoginPopup: true
      });
      return false
    }
    return true;
  },
  // 跳转到拼团规则页
  toRule() {
    xmini.piwikEvent('详情页点击拼团规则');
    this.forward('rule');
  },

  gotoServe() {
    if (!this.verifyAuth()) return;
    this.goService();
  },

  //显示/隐藏 促销信息弹窗
  onShowPromotionCon(){
    const toggleShowPromotion = this.data.onShowPromotionInfo;
    this.setData({
      onShowPromotionInfo: !toggleShowPromotion,
  })
  },
  showSelect(){
    this.numInput(this.data.amountNum)
    this.setData({
      showSelect: true
    })
  },
  closeSelect(){
    this.clearCountDown();
    this.setData({
      showSelect: false
    })
  },
  // 跳转到店铺首页
  goStore(){
    xmini.piwikEvent('c_store_info')
    let id = this.data.merchantData.id;
    this.forward('merchant', { id });
  },
  //隐藏领取成功
  hideToast(){
    this.setData({
      sucToast: false,
    });
  },
  gotoVipCenter(e) {
    if (!this.verifyAuth()) return;
    this.onUrlPage(e);
  },
  //隐藏/显示会员权益弹窗
  ModalClick(){
    const toggleShowStatus = this.data.isShowMemberModel;
    this.setData({
      isShowMemberModel:!toggleShowStatus,
    });
  },

  //选择城市
  onSelectCity() {
    this.setData({
      didShowCitySelection: true,
    });
    xmini.piwikEvent('pv_add');
  },
  checkDelivery() {
    api.checkDelivery({
      skuId: this.data.skuId,
      isLoading: !this.data.isInit
    }, res => {
      const { data = {} } = res;
      const { canDelivery, freightInfo = '' } = data;
      this.setData({
        canDelivery,
        freightInfo
      })
    }), err => {
      console.log(err);
    }
  },
  onSelectingNewCity() {
    const { addressInfo } = xmini.store.state.location;
    if (addressInfo.currentAddress != this.data.currentCity.currentAddress) {
      this.setData({
        currentCity: addressInfo,
      });
      this.checkDelivery();
    }
  },

  checkNewCurrentCity() {
    console.warn(xmini.store.state)
    const { addressInfo } = xmini.store.state.location;
    let newAddress = this.data.currentCity.currentAddress != addressInfo.currentAddress;
    if (newAddress) {
      this.setData({
        currentCity: addressInfo,
      });
      this.refresh();
      this.postMessage('index', {
        needRefresh: true,
      });
    }
  },
  //跳转至凑单列表页
  goFullList(e){
    console.log(e.detail);
    const { id } = e.detail;
    let merchantId = this.data.merchantData.id;
    xmini.piwikEvent('coudanentry',{ activityid:id,merchantid:merchantId,skuid:this.data.skuId });
    this.forward('full-reduction',{ id, merchantId:this.data.merchantData.id });
  },

});
