import {
  me,
  xmini,
  mapState,
  mapActions,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import {
  mapTo,
  pullList,
} from '../../utils/index';
import mixins from '../../utils/mixins';

import authMixin from '../../utils/authMixin';
// const app = getApp();

// const defaultUserInfo = {
//   avatar: 'https://img1.haoshiqi.net/wxapp/img/avatar_9dc3749044.png',
//   userName: '未登录',
// };

const userOrder = [
  {
    image: 'https://img1.haoshiqi.net/miniapp/profile/order_pay_82ff4c393e.png',
    title: '待付款',
    itemId: 'pay',
    num: 0,
  },
  {
    image: 'https://img1.haoshiqi.net/miniapp/profile/order_share_cd5df03bc9.png',
    title: '待分享',
    itemId: 'share',
    num: 0,
  },
  {
    image: 'https://img1.haoshiqi.net/miniapp/profile/order_receipt_1f21374b89.png',
    title: '待收货',
    itemId: 'receipt',
    num: 0,
  },
  {
    image: 'https://img1.haoshiqi.net/miniapp/img/order_service_b0ee5a3eac.png',
    title: '售后',
    itemId: 'service',
    num: 0,
  },
];

const userService = [
  {
    image: 'https://img1.haoshiqi.net/miniapp/profile/user_couple_79dc520636.png',
    title: '我的拼团',
    num: 0,
    itemId: 'couple',
  },
  {
    image: 'https://img1.haoshiqi.net/miniapp/profile/user_coupon_9b70458adf.png',
    title: '我的优惠券',
    num: 0,
    itemId: "coupon",
  },
  {
    image: 'https://img1.haoshiqi.net/miniapp/profile/shoucang_2b250b9023.png',
    title: '我的收藏',
    num: 0,
    itemId: "collection",
  },
  {
    image: 'https://img1.haoshiqi.net/miniapp/profile/user_browse_ba823e36a3.png',
    title: '我的浏览',
    num: 0,
    itemId: "browse",
  },
  {
    image: 'https://img1.haoshiqi.net/miniapp/profile/user_lottery_e576c5b9ac.png',
    title: '我的抽奖',
    num: 0,
    itemId: 'lottery',
  },
  {
    image: 'https://img1.haoshiqi.net/miniapp/profile/user_address_4b3f830ff0.png',
    title: '收货地址',
    num: 0,
    itemId: 'address',
  },
  {
    image: 'https://img1.haoshiqi.net/miniapp/profile/user_customer_5ed25fbc0f.png',
    title: '官方客服',
    num: 0,
    itemId: 'customer',
  },
  {
    image: 'https://img1.haoshiqi.net/miniapp/user_setting@2x_2a242c7baa.png',
    title: '设置',
    num: 0,
    itemId: 'setup',
  },
];

xPage({
  ...mixins,
  ...pullList,
  ...authMixin,
  data: {
    isLoading: true,
    imgRecomment: 'https://img1.haoshiqi.net/miniapp/profile/user_recomment_6c65488079.png',
    arrow: 'https://img1.haoshiqi.net/miniapp/profile/arrow_gray_2ea60b824d.png',
    lowerThreshold: 300,
    pullLoading: true,
    userOrder: userOrder,
    userService,
    list: [],
    listMode: 'card',
    savePrice: 0.00,
    memberInfo:{
      status: 1, //1.未登录 和 已登录未开卡, 2:登录是会员 3.会员已过期
      desc: '开通好会员，帮你省149元',
      memberSavePrice: 0,
      canSavePrice: 0,
      benefits: [],
      url: ''
    },
    touchStartY: 0,
    touchEndY:0,
    dragSts: true,
    dragStyle: 'transform:translate3d(0,4px,0)',

    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    })
  },
  ...mapActions(['setUserInfo']),
  onLoad(query) {
    this.onPageInit(query);
    this.initPullList();
    this.pullParams.showType = 1;
    this.pullModel = api.getRecommendlist;
    // 主动触发加载事件
    // this.onScrollToLower();
  },

  onShow() {
    this.updatadSpmPage(); // 新增更新spm 三段中的 page
    // 更新code;
    this.updatedAuthCode();
    this.refresh();
    setTimeout (() => {
      this.endDrag();
    },2000);
  },

  onUnload() {
    this.setData({
      dragSts: false,
    });
  },
  refresh() {
    this.getProfile();
    this.getMemberInfo();
  },
  onAuthSuccess() {
    this.refresh()
  },
  getProfile() {
    api.getProfile({
      scope: this,
      weights: 1,
    }, (res) => {
      let { data } = res;

      // const { wechat_open_id, wechat_mp_open_id } = data.userInfo

      // data.userInfo.wechat_open_id = wechat_mp_open_id ? wechat_mp_open_id : wechat_open_id;
      // 更新store 用户信息
      this.setUserInfo(data.userInfo);

      let userOrder = this.data.userOrder;
      for (const item of userOrder) {
        switch (item.itemId) {
          case 'pay':
            item.num = data.toPayNum;
            break;
          case 'receipt':
            item.num = data.toReceiptN
            break;
          case 'service':
            item.num = data.toRefundNum;
            break;
          case 'share':
            item.num = data.pinOrderCnt;
            break;
          default:
            item.num = 0;
            break;
        }
      }

      const { pinOrderCnt, couponCnt, lotteryOrderCnt } = data;

      let userService = this.data.userService
      for (const index in userService) {
        let item = userService[index];
        switch (item.itemId) {
          case 'coupon':
            item.num = couponCnt;
            break;
          case 'couple':
            item.num = pinOrderCnt;
            break;
          case 'lottery':
            item.num = lotteryOrderCnt;
            break;
          default:
            item.num = 0;
            break;
        }
      }

      const savePrice = (data.totalSavedMoney/100).toFixed(2)

      this.setData({
        isLoading: false,
        savePrice,
        logged: true,
        userOrder,
        userService,
      }, () =>{
        // 主动触发加载事件
        this.onScrollToLower();
      });
    }, (err) => {
      // 需要登录时，返回
      // if (err.errno === 510010) {
        // 主动触发加载事件
        this.onScrollToLower();
        this.setData({
          isLoading: false,
        })
        return true;
      // }
    });
  },
  getMemberInfo(){
    api.getMemberInfo({
    }, (res) => {
      let { data } = res;
      console.log(data, 'data');
      this.setData({
        memberInfo:{
          status: data.status,
          memberSavePrice: data.save_price / 100,
          canSavePrice: data.can_save_price / 100,
          benefits: data.benefit || [],
          desc: data.desc,
          url: data.url,
        }
      });
    }, (err) => {
      // 需要登录时，返回
      // if (err.errno === 510010) {
        // 主动触发加载事件
      // }
    });
  },
  startDrag(ev){
    const startY = ev.touches[0].pageY;
    this.setData({
      touchStartY: startY,
      dragSts: true,
    });
  },
  changeBox(ev){
    const endY = ev.touches[0].pageY;
    console.log(this.data.touchStartY, 'startY');
    const offsetY = endY - this.data.touchStartY;
    if (offsetY > 0 && offsetY < 86) {
      const offset = -75 + offsetY < 2 ? -75 + offsetY : 0;
      this.swiperMove(offset);
    }
    if(offsetY < 0){
      const offset = -76 + offsetY;
      // this.swiperMove(offset);
      this.setData({
        dragSts: false,
      });
    }
    console.log(endY, 'ev');
  },
  endDrag(ev){
    console.log(ev, 'ev');
      this.setData({
        dragStyle:"transform:translate3d(0, -75px, 0); animation:ball 1.5s ease-in 0s;",
        dragSts: false,
      });
  },
  swiperMove(offset){
    const transform = "translate3d(0," + offset + "px, 0)";
    const  transition =this.data.dragSts?'none': '.6s cubic-bezier(0.845, -0.375, 0.215, 1.335)';
    // const animation = 'ball 1s ease-in 0s infinite alternate';
    this.setData({
      dragStyle: "\n  -webkit-transform: " + transform + ";\n        -webkit-transition: " + transition + ";\n        transform: " + transform + ";\n        transition: " + transition + ";\n ",
    });
  },
  dealList(list) {
    return mapTo(list, (item) => {
      const isShowLootAll = !item.onLine || !item.inStock;
      return {
        id: item.pinActivitiesId,
        title: item.coupleTitle,
        image: item.skuPic,
        priceObj: {
          rmb: 1,
          price: item.couplePrice,
          marketPrice: item.marketPrice,
          memberPrice: item.member_price,
        },
        isShowLootAll,
        tags: item.tags.splice(0,2) || [],
        inStock: item.inStock,
        onLine: item.onLine,
        endTime: item.endTime,
        showCountDownLimit: item.showCountDownLimit,
        merchantType: item.merchant_type,
        expired_date_text: item.expired_date_text_two,
        link:item.link,
      };
    });
  },

  verifyAuth() {
    const { logged, userInfo } = this.data;
    const pageComponent = this.selectComponent('#dwd-page-profile');
    if (!logged) {
      // 显示登录弹窗
      pageComponent.setData({
        isShowLoginPopup: true
      });
      return false
    }
    return true;
  },

  goOrderList(orderType) {
    const type = orderType || 0;

    switch (type) {
      case 0:
        xmini.piwikEvent('c_gerenzhongxin', {
          name: '全部订单',
        });
        break;
      case 1:
        xmini.piwikEvent('c_gerenzhongxin', {
          name: '待付款',
        });
        break;
      case 2:
        xmini.piwikEvent('c_gerenzhongxin', {
          name: '待收货',
        });
        break;
      case 3:
        xmini.piwikEvent('c_gerenzhongxin', {
          name: '待评论'
        });
        break;
      case 4:
        xmini.piwikEvent('c_gerenzhongxin', {
          name: '售后',
        });
        break;
      default:
        break;
    }
    this.forward('order-list', {
      type,
    });
  },

  goCoupleOrderlist(type, listType, hiddenTabs = false) {
    this.forward('couple-order-list', {
      type: type,  // 拼团
      listType,
      hiddenTabs,
    });
  },
  gotoVipCenter(e) {
    if (!this.verifyAuth()) return;
    this.onUrlPage(e);
  },
  onClickItem: function(e) {
    const { id } = e.currentTarget.dataset;
    if (!this.verifyAuth()) return;

    switch (id) {
      case 'all':
        this.goOrderList(0);
        break;
      case 'pay':
        this.goOrderList(1);
        break;
      case 'share':
        xmini.piwikEvent('c_gerenzhongxin',{
          name:'待分享',
        });
        this.goCoupleOrderlist(1, 1, true);
        break;
      case 'receipt':
        this.goOrderList(2);
        break;
      case 'service':
        this.goOrderList(4);
        break;
      case 'couple':
        xmini.piwikEvent('c_gerenzhongxin',{
          name:'我的拼团',
        });
        this.goCoupleOrderlist(1,1);
        break;
      case 'collection':
        xmini.piwikEvent('c_gerenzhongxin',{
          name:'我的收藏',
        });
        this.forward('favorite-list');
        break;
      case 'browse':
        xmini.piwikEvent('c_gerenzhongxin',{
          name:'我的浏览',
        });
        this.forward('view-history');
        break;
      case 'coupon':
        xmini.piwikEvent('c_gerenzhongxin',{
          name:'我的优惠券',
        });
        this.forward('coupon-list');
        break;
      case 'lottery':
        xmini.piwikEvent('个人中心点击抽奖团',{
          name:'我的抽奖',
        });
        this.goCoupleOrderlist(1,2);
        break;
      case 'address':
        xmini.piwikEvent('c_gerenzhongxin',{
          name:'我的地址',
        });
        this.forward('address-list');
        break;
      case 'customer':
        xmini.piwikEvent('c_gerenzhongxin',{
          name:'官方客服',
        });
        this.goService();
        break;
      case 'setup':
        xmini.piwikEvent('c_gerenzhongxin', {
          name: '设置',
        });
        this.forward('setup');
        break;
      default:
        break;
    }
  },

  // click event
  onTapNext: function (e) {
    const {
      id,
      online,
      instock,
      index,
      url = ''
    } = e.currentTarget.dataset;
    xmini.piwikEvent('个人中心推荐', {
      'id': id,
    });
    if (online && instock && url) {
      // this.forward('detail', {
      //   id,
      // });
      this.onUrlPage(e);
    }
  },
});
