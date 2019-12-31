import {
  me,
  xmini,
  mapState,
  xPage,
  mapActions,
} from '../../config/xmini';
import api from '../../api/index';
import {
  dealPrice
} from '../../utils/index';
import mixins from '../../utils/mixins';

import CountManger from '../../utils/CountManger';
import {
  formatCountDown,
  formatDate,
  formatLeftTimeObj
} from '../../utils/dateUtil';
import { isEmptyObject } from '../../utils/is';
import ViewHistoryManager from '../../utils/viewHistoryManager'
import wxParse from '../../wxparse/wxParse';
import coupon from '../../components/coupon-list/coupon';
import skuMixin from '../../components/sku-select/skuMixin';
// import { urlfix } from '../../utils/index';

let width;

// let skusKey, dataAttrs;
// let attrDatasList = new Array();

const app = getApp();
xPage({
  ...mixins,
  ...coupon,
  ...skuMixin,
  /**
   * 页面的初始数据
   */
  _data: {
    // 收藏／未收藏的icon
    unLikeImg: 'https://img1.haoshiqi.net/miniapp/unlike_879608c2d8.png',
    likeImg: 'https://img1.haoshiqi.net/miniapp/like_93c1d5ceb0.png',

    pinActivitiesId: 0, // 拼团活动id
  },
  data: {
    isLoading: true,

    // sku
    isShowPopup: false, // v-model
    normSelectTag: 0,
    currentSum: 1,
    maxBuySum: 100,
    attrList: [],
    skuStocksList: {}, // 属性ID 对应 sku列表

    currentSkuData: {}, // 当前skuData
    smallCurrentSkuData: {},
    selectedAttrName: [], // 已选择 attr
    notSelectedAttrName: '', // 未选择属性提示

    // sku end
    // pinActivitiesId: -1,
    skuId: -1,
    fastInfo: {},
    priceObj: {
      price: '',
      point: '',
      marketPrice: '',
    },
    didShowCitySelection: false,
    currentCity: {},
    shareInfo: true,
    // showArrow: false,       // 新人首单立减是否可点击
    promotions: [],
    merchantData:{},
    jumpAppData: '',         // 唤起App传的数据
    sceneData: 1001,         // 场景值
    // activityTime: {},
    textData: {},
    coupleList:[], //显示领券的信息
    showCoupons:false, //是否显示优惠券列表
    coupons: [],//领券列表
    sucToast: false,
    onShowPromotionInfo: false,
    // acticityType:1,
    cartNumber: 0,
    //好会员
    isShowMemberModel:false,
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(query) {
    console.warn(this.data.userInfo);
    this.onPageInit(query);
    this.initData();
  },

  onShow() {

    this.checkNewCurrentCity();
    // console.log(this, 'this type');
    if (this.acticityType) {
      this.startActivityCountDown();
    }
    this.startCountDown();
    this.updateUserCart();
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
    let storageObj = wx.getStorageSync('globalData');

    this.setData({
      jumpAppData: `haoshiqi://com.doweidu/couplesbuydetail?pinActivityId=${this.pageQuery.id}`,
      sceneData: storageObj.sceneData
    })
    // console.log(storageObj,'storageObjstorageObjstorageObj')
    // console.log(storageObj.sceneData,"storageObj.sceneData");

    if (this.pageQuery.id) {
      width = wx.getSystemInfoSync().windowWidth;
      this.refresh();
      this.setData({
        // pinActivitiesId: this.pageQuery.id,
        showHome: getCurrentPages().length == 1,
      });
    } else {
      // wx.showToast('参数错误');
    }
  },

  refresh(query = this.pageQuery) {
    const { id } = query;
    if(id){
      this._data.pinActivitiesId = id
    }
    this.getSkuInfoDetail(id || this._data.pinActivitiesId);
  },
  onAuthSuccess() {
    // console.log('详情页授权成功');
    this.refresh();
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
      isLoading: !this.data.isInit,
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

  // 当前sku 改变时调用
  skuDataOnChange(skuData = {}) {
    if (!skuData.skuid) return;
    this.refresh({id: skuData.pinactivitiesid});
  },
  // 接收sku 点击的事件
  onBtnClick(data) {
    console.log(data);
    switch(data.detail.type) {
      case 'buyBtn':
        xmini.piwikEvent('c_addcart', { skuid: this.data.skuId });
        this.fetchAddCart();
        break;
      case 'confirmBtn':
        xmini.piwikEvent('c_buy', { skuid: this.data.skuId });
        this.toOrderCommit();
        this.setData({
          isShowPopup: false,
        });
        break;
    }
  },
  //获取好会员信息
  getGoodMemberInfo({ price=0 }){
    const memberBtnType = ['立即开通','去续费','更多权益','去领券'];
    api.getProductMemberInfo({
      price:price || 0,
      skuId:this.data.skuId,
      type:1,
    },(res) =>{
      const data = res.data;
      console.log(isEmptyObject(data), 'data1');
      if(isEmptyObject(data)){
        this.setData ({
          goodMemberInfo:{
            memberText: data.discount_text,
            discountPrice: data.discount_price?data.discount_price / 100:0,
            possessionPrice: (data.possession_price > 0 && data.possession_text)?`￥${(data.possession_price /100).toFixed(2)}${data.possession_text}`:'',
            type: memberBtnType[data.type - 1], //1.立即开通 2.去续费  3.更多权益 4.去领券
            url : data.url, //按钮跳转url
            left_title: data.tips.left_title,
            num: data.tips.num,
            right_title:data.tips.right_title,
            content: data.tips.content || [],//权益项
            showMember:true,
          },
        });
      }
    }, (err) =>{
      console.log(err,'err');
      return true;
    })
  },
  // 获取商品信息
  getSkuInfoDetail(id) {

    // this.setData({
    //   isLoading: true,
    // })
    api.getCoupleDetail({
      pinActivitiesId: id,
      isLoading: false,

      scope: this,
      weights: 1,
    }, (res) => {
      const data = res.data;
      this.timestamp = res.timestamp;

      const {
        skuId = 0,
        productId = 0,
        pinActivitiesId = 0,

        attrKeys = [],
        attrDatas = {},

        name = '',
        description = '',

        pics = {},

        left_stock = 0,

        couplePrice = 0,
        singlePrice = 0,
        market_price = 0,

        startTime = 0,
        canDelivery,
        freightInfo = '',
        singeCanBought,
        coupleCanBought,

        is_like = false,

        activityPreheat,

        merchantInfo = {},
        merchant_type,

        // shopDiscount = [],

        labels = [],

        countLimit, // 拼团人数

        maxCartSkuCnt = 100, //

        selled_cnt = 0, // 已销售量

        fastJoinList = {},
        coupons = [],
        member_price = 0,
        member_expose_info = {},
        is_member = false,
        is_member_price = false,
        price = 0,
      } = data;

      const swiperList = (pics || []).map((item) => {
        return {
          image: item,
          url: '',
        };
      });

      const {
        wechat = {}
      } = data.shareInfo;


      const canBuy = (res.timestamp >= startTime);
      let canSingle = Boolean(canBuy && singeCanBought);
      const canGroup = Boolean(canBuy && coupleCanBought);


      const newMerchantData = {
        ...merchantInfo
      }
      const isMember =  member_price ? true : false;
      let userIsMember = is_member? true : false; // 用户是否是好会员
      // is_like 是否收藏
      const collectionImg = is_like ? this._data.likeImg : this._data.unLikeImg;

      // 是否是单品购买
      const singleOnly = this.data.singleOnly || false;
      // 价格的逻辑
      const priceObj = {
          rmb: 1,
          price,
          memberPrice:member_price,
          marketPrice: market_price,
          singlePrice:isMember && userIsMember ? member_price:singlePrice,
          couplePrice:isMember && userIsMember ? member_price:couplePrice,
          count: countLimit,
          canSingle,
          canGroup
      };
      //sku切换时，sku价格
      const normSelectTag = this.data.normSelectTag;
      let skuSinglePrice = userIsMember && isMember? member_price:singlePrice;
      let skuCouplePrice = userIsMember && isMember ? member_price:couplePrice;
      const smallCurrentSkuData = {
        priceText: normSelectTag == 2 ?  '￥' + dealPrice(skuSinglePrice) : '￥' + dealPrice(skuCouplePrice),
      }

      function mapObj(obj, cb) {
        const result = {};
        const temp = {};
        for (const key in obj) {
          result[key] = cb(obj[key], key);
        }
        return result;
      }

      const stocksList = mapObj((attrDatas || {}), item => {
        return {
          id: item.id,
          pinactivitiesid: item.pinactivitiesid,
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
        activityType: (activityPreheat && activityPreheat.activityType) || 0, // 营销活动类型：1 普通 2 秒杀
      };
      // 判断是否有秒杀活动
      if (activityPreheat) {
        let tempPrice = activityPreheat.activityPrice || 0;
        if (member_price && userIsMember) {
          tempPrice = member_price || 0;
        }

        tempActivityPreheat.price = dealPrice(tempPrice).split('.');
        tempActivityPreheat.selfPrice = tempPrice;

        tempActivityPreheat.activityStock = activityPreheat.activityStock || 0;

        // !!!注意
        if (tempActivityPreheat.activityStock == 0) canSingle = false;

        tempActivityPreheat.activityMarketPrice = (activityPreheat.marketPrice / 100).toFixed(2);

        if (res.timestamp > activityPreheat.startTime && res.timestamp <= activityPreheat.endTime) {
          // 活动中
          tempActivityPreheat.activityCountTip = '距离结束还有';
          tempActivityPreheat.activityStatus = 'start';
          showAct = true;
        } else if (res.timestamp <= activityPreheat.startTime) {
          // 活动还没开始
          tempActivityPreheat.activityCountTip = '距离开始还有';
          tempActivityPreheat.activityStatus = 'ready';
          showAct = true;
        } else {
          tempActivityPreheat.activityStatus = 'end';
          showAct = false;
        }

        // 活动进度条展示
        tempActivityPreheat.rateNumber = 100 - (parseInt((tempActivityPreheat.activityStock / activityPreheat.allStock) * 100) || 0);

        tempActivityPreheat.activityPrice = activityPreheat.activityPrice || 0;
        tempActivityPreheat.activityStartTimeTip = `${formatDate(activityPreheat.startTime || 0, 'M.D H:F')}开抢`;

        tempActivityPreheat.activityStartTime = activityPreheat.startTime || 0;
        tempActivityPreheat.activityEndTime = activityPreheat.endTime || 0;
      }


      this.setData({
        isLoading: false,

        smallCurrentSkuData,

        attrList: attrKeys,
        skuStocksList: stocksList,

        showAct,
        activityPreheat: tempActivityPreheat,
        // shopDiscount: shopDiscount && shopDiscount.join(',') || '',

        is_like,
        collectionImg,
        left_stock,
        skuId,
        shareInfo: {
          title: wechat.title,
          desc: wechat.content,
          imageUrl: wechat.thumbnail,
          piwikAction: 'c_share',
          piwikData: pinActivitiesId,
        },
        swiperInfo: {
          list: swiperList, // 如果数据不符合格式，可以使用 mapTo 方法
          hwRatio: 1,
          goUrlPage: 'goUrlPage',
          height: width,
        },
        name,
        desc: description,
        priceObj,
        canDelivery,
        freightInfo,

        // singleCanBought: data.singeCanBought,
        // coupleCanBought: data.coupleCanBought,


        promotions: merchantInfo.promotions || [],

        labels,
        countLimit: countLimit + '人团',
        limitNum: countLimit,
        rule: '支付开团并邀请' + (countLimit - 1) + '人参团，人数不足自动退款，详见规则',
        fastInfo: fastJoinList,

        merchantData: newMerchantData,
        merchantType: merchant_type,

        maxBuySum: maxCartSkuCnt,       // 最大购买数量

        selledCnt: selled_cnt,              // 销售数量

        coupleList: coupons || [],
        isMember,
        userIsMember,
      }, () => {
        //初始化时获取位置信息
        if (this.data.isInit) {
          this.getGeoLocation();
        }

        // 计算当前传入价格
        let tempPrice = 0
        if (member_price) {
          tempPrice = member_price
        } else if (tempActivityPreheat.selfPrice) {
          tempPrice = tempActivityPreheat.selfPrice
        } else {
          tempPrice = priceObj.price;
        }
        this.getGoodMemberInfo({
          price:tempPrice,
        });
        this.startCountDown();
        if (showAct && tempActivityPreheat.activityStatus == 'ready') {
          this.acticityType = 1;
          this.startActivityCountDown();
        } else if (showAct && tempActivityPreheat.activityStatus == 'start') {
          this.acticityType = 2;
          this.startActivityCountDown();
        }
      });

      if (this.countManager) {
        this.countManager.clear();
        this.countManager = null;
      }

      this.getSkuDetailMore(productId);
      // 添加浏览记录
      ViewHistoryManager.addViewHistory({
        pinActivityId: id,
        productId: data.productId,
      });
    }, (err) => {
      // console.log(err);
    });
  },
  startActivityCountDown(type = this.acticityType) {
    const { activityPreheat } = this.data;
    const that = this;
    const diffTime = Date.now() - this.timestamp * 1000;
    this.diffTime = diffTime
    const localStartTime = activityPreheat.activityStartTime * 1000 + diffTime;
    this.localStartTime = localStartTime
    const localEndTime = activityPreheat.activityEndTime * 1000 + diffTime;
    this.localEndTime = localEndTime

    if (this.activityCountManager && this.activityCountManager.clear) {
      this.activityCountManager.clear();
    }
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
            'activityPreheat.activityTime': formatLeftTimeObj(leftStartTimes),
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
            'activityPreheat.activityTime': formatLeftTimeObj(leftEndTimes),
          })
        } else if (leftEndTimes <= 0 && type != 1) {
          // 活动开始的状态，且活动已结束，清除倒计时，重新调接口
          this.clear();
          that.refresh();
        }
      },
    })
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
      wxParse.wxParse('textData', 'html', tempDetail, that, 10, 'detail');
    }, (err) => {
      // console.log(err);
    });
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
    const { userInfo } = this.data
    api.removeLikeProduct({
      userId: userInfo.user_id,
      activityIds: this._data.pinActivitiesId,
    }, (res) => {
      this.setData({
        is_like: false,
        collectionImg: this._data.unLikeImg,
      })
    }, (err) => {
      console.error(err)
    })
    xmini.piwikEvent('c_like', {
      pinActivityId: this._data.pinActivitiesId,
      index: 1,
    });

  },



  addCollection() {
    const { userInfo } = this.data
    api.addLikeProduct({
      userId: userInfo.user_id,
      activityId: this._data.pinActivitiesId,
      skuIds: this.data.skuId,
    }, (res) => {
      this.setData({
        is_like: true,
        collectionImg: this._data.likeImg,
      })
    }, (err) => {
      console.error(err)
    })
    xmini.piwikEvent('c_like', {
      pinActivityId: this._data.pinActivitiesId,
      index: 0,
    });
  },

  verifyAuth() {
    const { logged, userInfo } = this.data;
    const pageComponent = this.selectComponent('#dwd-page-detail');
    if (!logged) {
      // 显示登录弹窗
      pageComponent.setData({
        isShowLoginPopup: true
      });
      return false
    }
    return true;
  },
  buyBtnClick(e) {
    const { type } = e.currentTarget.dataset;
    const { canSingle, canGroup } = this.data.priceObj || {};

    if (!this.verifyAuth()) return;

    if (type == 2 && !canSingle) return;
    if (type == 3 && !canGroup) return;

    let skuInitPrice;
    let skuId = this.data.skuId;
    const priceObj = this.data.priceObj;
    if (type == 2) {
      xmini.piwikEvent('c_pinsingle', {
        pinActivityId: this._data.pinActivitiesId,
        orderType: type,
      });
      if(this.data.userIsMember && priceObj.memberPrice){
        skuInitPrice = '￥' + dealPrice(priceObj.memberPrice)
      } else {
        skuInitPrice = '￥' + dealPrice(priceObj.singlePrice)
      }
    } else if (type == 3) {
      xmini.piwikEvent('c_pincouples', {
        pinActivityId: this._data.pinActivitiesId,
        orderType: type,
      });
      if(this.data.userIsMember && priceObj.memberPrice){
        skuInitPrice = '￥' + dealPrice(priceObj.memberPrice)
      } else {
        skuInitPrice ='￥' + dealPrice( priceObj.couplePrice)
      }
    }

    this.type = type;

    this.setData({
      normSelectTag: type == 2 ? 2 : 3,
      isShowPopup: true,

      smallCurrentSkuData: {
        priceText: skuInitPrice || '¥0'
      }
    });


    // this.showSelect();
  },
  // 跳转到确认订单
  toOrderCommit() {
    const { maxBuySum, left_stock, currentSum = 1, limitNum } = this.data;

    if (this.type == 2 && currentSum > left_stock) {
      wx.showToast('库存不足')
      return
    } else if (this.type == 3 && limitNum > left_stock) {
      wx.showToast('当前库存不足以成团')
      return
    }else if(currentSum > maxBuySum){
      wx.showToast(`亲，最多购买${maxBuySum}件哦，去看看其他商品吧～`)
      return
    }
    //添加埋点
    xmini.piwikEvent('c_buy', {
      pinActivityId: this._data.pinActivitiesId,
      orderType: this.type || 3,
    });
    this.forward('order-commit', {
      pinActivitiesId: this._data.pinActivitiesId,
      skuId: this.data.skuId,
      orderType: this.type || 3,
      amount: currentSum,
    });
  },

  // 跳转到拼团规则页
  toRule() {
    xmini.piwikEvent('c_rule');
    // console.log('goRule');
    this.forward('rule');
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

  clearCountDown() {
    if (this.countManager) {
      this.countManager.clear();
      this.countManager = null;
    }
    if (this.activityCountManager) {
      this.activityCountManager.clear();
      this.activityCountManager = null;
    }
  },

  startCountDown() {
    const { fastInfo = [] } = this.data;
    if (!fastInfo.list || !fastInfo.list.length) {
      return;
    }

    const that = this;
    // const diffTime = Date.now() - this.data.timestamp * 1000;
    const diffTime = this.diffTime || (Date.now() - this.data.timestamp * 1000);
    this.diffTime = diffTime
    this.countManager = new CountManger({
      times: 1000,
      dataList: fastInfo.list,
      set() {
        const localEndTime = this.data.localEndTime || (this.data.endTime * 1000 + diffTime);
        that.setData({
          [`fastInfo.list[${this.index}].localEndTime`]: localEndTime,
        });
        const leftTimes = localEndTime - Date.now();
        if (leftTimes > 0) {
          this.data.localEndTime = localEndTime;
          this.start();
        }
      },
      callback() {
        const leftTimes = this.data.localEndTime - Date.now();
        if (leftTimes > 0) {
          that.setData({
            [`fastInfo.list[${this.index}].countDown`]: `剩余 ${formatCountDown(leftTimes)} 结束`,
          });
        } else {
          this.clear();
          that.setData({
            [`fastInfo.list[${this.index}].disabled`]: true,
          });
        }
      },
    })
  },

  goNext(e) {
    const { id, type, index } = e.currentTarget.dataset;
    switch (type) {
      case 'couple-share':
        xmini.piwikEvent('c_joinbtn2', {
          pinEventid:id,
          orderType:type
        });
        this.forward('pin-share', {
          id,
        });
        break;
      default:
        // do nothing...
        break;
    }
  },

  goIndex() {
    xmini.piwikEvent('c_index');
    this.forward('index')
  },

  //显示/隐藏 促销信息弹窗
  onShowPromotionCon(){
    const toggleShowPromotion = this.data.onShowPromotionInfo;
    this.setData({
      onShowPromotionInfo: !toggleShowPromotion,
    })
  },

  goStore() {
    xmini.piwikEvent('c_shop');
    let id = this.data.merchantData.id;
    // console.log(id,"---------id-----------");
    this.forward('merchant', { id });
  },
  goHome(){
    xmini.piwikEvent('c_index');
    this.forward('index');
  },
  // 监听打开App时错误
  launchAppError(e){
    console.log(e.detail.errMsg,'errMsg');
    // if (e.detail.errMsg.indexOf('sdk launch fail') != -1){
    //   wx.showToast('请下载好时期App')
    // }
  },
  showCoupons(){
    // console.log('打开优惠券列表');
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
  //关闭优惠券列表
  onClose() {
    this.setData({
      showCoupons: false,
    });
  },
  goCart(e) {
    // console.log('去购物车页面',e);
    if (!this.verifyAuth()) return;
    this.forward('shopping-cart');
  },
  //调购物车接口
  fetchAddCart(){
    api.addSkuToCart(
      {
        type: 1,
        skuId: this.data.skuId,
        amount: this.data.currentSum,
      },
      res => {
        wx.showToast('添加购物车成功');
        this.updateUserCart();
        this.setData({
          isShowPopup: false
        })
      }
    )
  },
   //更新购物车
  updateUserCart(){
    api.getUserCart(
      {
        isLoading: false,
      },
      res => {
        this.setData({
          cartNumber: res.data.total_sku_cnt,
        });
      },
      err => {
        return true;
      }
    );
  },
  gotoVipCenter(e) {
    if (!this.verifyAuth()) return;
    this.onUrlPage(e);
  },
  ModalClick(){
    const toggleShowStatus = this.data.isShowMemberModel;
    this.setData({
      isShowMemberModel:!toggleShowStatus,
    });
  },
  goFullList(e){
    console.log(e.detail);
    const { id } = e.detail;
    let merchantId = this.data.merchantData.id;
    xmini.piwikEvent('coudanentry',{ activityid:id,merchantid:merchantId,skuid:this.data.skuId });
    this.forward('full-reduction',{ id, merchantId:this.data.merchantData.id });
  },
});
