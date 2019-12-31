import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import {
  // mixins,
  mapTo,
  pullList,
} from '../../utils/index';
import mixins from '../../utils/mixins';

import { formatLeftTimeObj } from '../../utils/dateUtil';
import CountManger from '../../utils/CountManger';
// import { formatDate } from '../../utils/dateUtil';
import coupon from '../../components/coupon-list/coupon';
xPage({
  ...mixins,
  ...pullList,
  ...coupon,
  data:{
    isLoading: true,

    storeId: 0,
    skuId: null,
    topicId: null,
    storeData: {},
    brandData: '',
    isLike: false,
    shopAllBtnStatus: true,
    activityList: [],
    arrowClick: false,
    coupleTitle: '店铺领券',
    showdownArrow: false,
    coupleList: [], //显示领券的信息
    showCoupons: false, //是否显示优惠券列表
    sucToast: false, // 显示领取成功的toast
    coupons: [], //领券列表

    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    }),
  },
  onLoad(query = {}) {
    this.onPageInit(query);
    this.setData({
      storeId: query.id,
      skuId: query.sku_id || null,
      topicId: query.topic_id || null,
    })
    var sysInfo = wx.getSystemInfoSync();
    var winHeight = sysInfo.windowHeight;
    this.setData({
      winHeight: winHeight,
    })
  },
  onShow() {
    this.refresh();
  },
  onHide() {
    this.clearCountDown();
  },
  refresh() {
    console.log('refresh')
    this.clearCountDown();
    this.getStoreInfo();
    this.initPullList();
    this.pullParams.merchantId = this.data.storeId;

    this.pullModel = api.getMerchantList;
    //主动触发加载事件
    this.onScrollToLower();
  },
  onAuthSuccess() {
    ///
  },
  verifyAuth() {
    const { logged, userInfo } = this.data;
    const pageComponent = this.selectComponent('#dwd-page-merchant');
    if (!logged) {
      // 显示登录弹窗
      pageComponent.setData({
        isShowLoginPopup: true
      });
      return false
    }
    return true;
  },
  // 获取店铺信息
  getStoreInfo() {
    this.clearCountDown();
    this.setData({
      isLoading: true,
    })
    api.getMerchantInfo({
      scope: this,
      weights: 1,

      merchantId: this.data.storeId,
      skuId: this.data.skuId,
      topicId: this.data.topicId,
    }, (res) => {
      wx.hideLoading();
      let brandList = res.data.brandList;
      let brandName = [];
      for (let i = 0; i < brandList.length; i++){
        brandName.push(brandList[i].name)
      }
      this.setData({
        isLoading: false,

        storeData: res.data,
        isLike: res.data.is_like,
        brandData: brandName.join(' , '),
        coupleList: res.data.coupons || [],
        activityList: this.dealProductList(res.data.activityList, res.timestamp),
        timeStamp: res.timestamp,
      })
      //判断店铺公告是否需要展开
      if(this.data.brandData.length>24){
        console.log(this.data.brandData.length, 'this.data.brandData.length');
        this.setData({
          arrowClick:true,
          showdownArrow:true,
        })
      }
      // 主动触发加载事件
      this.onScrollToLower();
      if(res.data.activityList.length > 0){
        this.startCountDown();
        console.log('startcountdown')
      }
    }, (err) => {
      console.log(err);
    })
  },
  // 收藏按钮
  collectBtn(e){
    let collectStatus = e.currentTarget.dataset.status;
    console.log('collectStatus',collectStatus);
    if (!collectStatus){
      xmini.piwikEvent('c_collect',{index:0});
      api.userLikeMerchat({
        merchantId: this.data.storeId,
      },(res)=>{
        wx.showToast('收藏成功')
        this.setData({
          isLike: true
        })
      },(err)=>{
        console.log(err);
      })
    }else{
      xmini.piwikEvent('c_collect',{index:1});
      api.removeLikeMerchat({
        merchantIds: this.data.storeId
      }, (res) => {
        wx.showToast('已取消收藏')
        this.setData({
          isLike: false
        })
      }, (err) => {
        console.log(err);
      })
    }
  },

  // 处理商品列表数据
  dealProductList(list = [], serveTimer) {
    return list.map(item => {
      let retaData = parseInt(((item.all_stock - item.left_stock) / item.all_stock) * 100);
      let serveBtnStatus = item.is_subscribe || false;   // 服务端返回按钮状态模拟   true 提醒、 false 取消提醒和马上抢
      return {
        ...item,
        tags: (item.tags || []),
        market_price: (item.market_price / 100).toFixed(2),
        price: this.productPrice((item.price / 100).toFixed(2)),
        rate_percent: retaData,
        can_bought: true,
        hintText: this.seckillBtn(serveTimer, item.start_time, item.end_time, serveBtnStatus),
        // link: `https://m.haoshiqi.net/v2/couple-detail?id=${item.biz_id}`,
        serveTimer,                 // 服务器当前时间
        diffTime: serveTimer * 1000 - Date.now(),
        endTime: item.end_time,
        residueTime: item.start_time - serveTimer || 0,
        serveBtnStatus,
        expired_date_text:item.expired_date_text_one,
        showupArrow:true,
        arrowClick: item.tags.toString().length > 48
      };
    });
  },
  onShowTag(e){
    console.log(e, 'e data');
    const {index, status} = e;
    this.setData ({
      [`activityList[${index}].showupArrow`]: !status
    })
  },
  // 处理按钮名称
  seckillBtn(serveTimer, startTimer, endTimer, serveBtnStatus){
    let timeText = {
      btnText: '',
      activityCountTip: '',
      btnType: '',
    };
    if(serveTimer > startTimer && serveTimer < endTimer) {
      timeText.btnText = '马上抢';
      timeText.activityCountTip = '距结束';
      timeText.btnType = '';
    }else if(serveTimer < startTimer && serveTimer < endTimer) {
      if(!serveBtnStatus){
        timeText.btnText = '提醒我';
        timeText.activityCountTip = '距开始';
        timeText.btnType = 'hintmsg';
      }else{
        timeText.btnText = '取消提醒';
        timeText.activityCountTip = '距开始';
        timeText.btnType = 'clearmsg';
      }
    }
    return timeText
  },

  // 开始倒计时
  startCountDown() {
    const that = this;
    const { activityList = [] } = this.data;
    // var localEndTime = item.endTime*1000 + diffTime;
    // var localLeftTime = localEndTime - Date.now();
    const countDownOptions = {
      times: 1000,
      dataList: activityList,
      set() {
        if( Date.now() >=  (this.data.start_time * 1000)){
          this.localEndTime = this.data.endTime * 1000 + this.data.diffTime;
        }else{
          this.localEndTime = this.data.start_time * 1000 + this.data.diffTime;
        }
        if (this.localEndTime - Date.now() > 0 && !this.data.isSetCountDown) {
          this.start();
        }else{
          this.countManger = null;
          this.clear();
          that.refresh();
        }
        that.setData({
          [`activityList[${this.index}].isSetCountDown`]: true,
        });
      },
      callback() {
        const localLeftTime = this.localEndTime - Date.now();
        if (localLeftTime > 0) {
          let timeInfo = formatLeftTimeObj(localLeftTime);
          that.setData({
            [`activityList[${this.index}]`]: Object.assign({}, that.data.activityList[this.index], { countDownInfo: timeInfo }),
          });

        } else {
          this.countManger = null;
          that.setData({
            [`activityList[${this.index}].isSetCountDown`]: false,
          });
          this.clear();
          that.refresh();
        }
      },
    };
    if (!this.countManger) {
      this.countManger = new CountManger(countDownOptions);
    } else {
      this.countManger.add(countDownOptions);
    }
  },

  // 清除到计时

  clearCountDown() {
    const that = this;
    if (this.countManger) {
      this.countManger.clear(function() {
        that.setData({
          [`activityList[${this.index}].isSetCountDown`]: false,
        });
      });
      this.countManger = null;
    }
  },

  // 处理商品价格数据
  productPrice(price) {
    let priceArray = price.split('.');
    return {
      price_yuan: priceArray[0],
      price_fen: priceArray[1],
    };
  },

  dealList(list) {
    return mapTo(list, (item) => {
      let isShowLootAll = 0;
      if (!item.onLine) {
        isShowLootAll = 1;
      } else if (!item.inStock) {
        isShowLootAll = 2;
      }
      return {
        id: item.pinActivitiesId,
        title: item.coupleTitle,
        image: item.skuPic,
        priceObj: {
          rmb: 1,
          price: item.couplePrice,
          marketPrice: item.marketPrice,
          memberPrice:item.member_price,
        },
        isShowLootAll,
        tags: item.tags.splice(0,2) || [],
        inStock: item.inStock,
        onLine: item.onLine,
        endTime: item.endTime,
        showCountDownLimit: item.showCountDownLimit,
        merchantType: item.merchant_type,
        expired_date_text: item.expired_date_text_two,
        link: item.link,
      };
    });
  },
  // 去详情
  onTapNext(e){
    const {
      id,
      online,
      instock,
      index,
      url = "",
    } = e.currentTarget.dataset;
    xmini.piwikEvent('c_pdr2',{
      index,
      pinActivitiesId:id,
    });
    if(online && instock && url ) {
      this.onUrlPage(e);
    }
  },

  // 锚点到商品列表
  allShopBtn() {
    const query = wx.createSelectorQuery().in(this);
    query.select('#shop-list').boundingClientRect( (res) => {
      this.setData({
        scrollTop: res.top,
      })
    }).exec()
    xmini.piwikEvent('c_dpqbsp',{
      merchantid: this.data.storeId
    });
  },
  watchScroll(e) {
    let topNum = e.detail.scrollTop;
    if(topNum > 200){
      this.setData({
        shopAllBtnStatus: false
      })
    }else{
      this.setData({
        shopAllBtnStatus: true
      })
    }
  },
  afterFormIdSubmit(){
    const oldE = this.oldE || {};
    if (this.hasOldE && oldE.currentTarget && oldE.currentTarget.dataset) {
      this.hasOldE = false;
    }
  },
  updateBtnStatus(e){
    let { index , btnType, value,type,status } = e.detail;
    switch (type) {
      case 'arrow':
        this.setData ({
          [`activityList[${index}].showupArrow`]: !status
        })
      break;
      default:
        this.setData({
          [`activityList[${index}].hintText.btnType`]: btnType == 'hintmsg' ? 'clearmsg' : 'hintmsg',
          [`activityList[${index}].hintText.btnText`]: btnType == 'hintmsg' ? '取消提醒' : '提醒我',
          [`activityList[${index}].is_subscribe`]: value
        })
      break;
    }
  },
  //展示店铺全部信息
  onShowAll(){
    this.setData({
      showdownArrow:!this.data.showdownArrow,
    })
    },

  //显示券弹层
  showCoupons() {
    this.setData({
      showCoupons: true,
    },() => {
      this.couponParams.merchantId = this.data.storeId;
      this.getCouponList();
    });
  },
  //隐藏弹层
  onClose() {
    this.setData({
      showCoupons: false,
    });
  },

});
