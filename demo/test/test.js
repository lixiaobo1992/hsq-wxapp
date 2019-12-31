import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import mixins from '../../utils/mixins';
import { urlfix } from '../../utils/index';

const imgTest = 'https://img1.haoshiqi.net/wxapp/img/service_2133de7c13.png';

const app = getApp();

// const qrcode = 'https://qr.alipay.com/c1x06601lqldxvu9cxarm91';
// const alipayScheme = 'alipays://platformapi/startapp?appId=10000007&qrcode=' + encodeURIComponent(qrcode);
// const alipayUrl = 'https://ds.alipay.com/?from=mobilecodec&scheme=' + encodeURIComponent(alipayScheme);
// // https://ds.alipay.com/?from=mobilecodec&scheme=alipays%3A%2F%2Fplatformapi%2Fstartapp%3FappId%3D10000007%26qrcode%3Dhttps%253A%252F%252Fqr.alipay.com%252Fc1x06601lqldxvu9cxarm91


import dealSku from '../../components/sku-select1/sku-deal';

const stocksList = {
  '539206;539204;539205': {
    name: '海太蜂蜜黄油薯片',
    // 缩略图
    thumbnail: 'http://img2.haoshiqi.net/mabe517dfd1b05e93478d8a12203bf6d49.jpg?imageView2/0/q/70',
    left_stock: 111, // 库存
    price: 1111, //sku价格（当前售价）
    market_price: 111, // 原价（删除价）
    id: 1112,
    skuid: 1112, // skuid
    max_buy_num: 10, // 当前sku限购数
  },
};

const attrList = [
  {
    attrId: 4,
    attrName: '保质期',
    attrValues: [
      {
        id: 539206,
        value: '2020/03/01',
      },
      {
        id: 333,
        value: '2020/03/02',
      },
    ],
  },
  {
    attrId: 2,
    attrName: '规格',
    attrValues: [
      {
        id: 539204,
        value: '120g*2支',
      },
      {
        id: 5153861,
        value: '120g*2支',
      },
    ],
  },
  {
    attrId: 3,
    attrName: '口味',
    attrValues: [
      {
        id: 539205,
        value: '臭味',
      },
      {
        id: 515386,
        value: '煤气味',
      },
    ],
  },
];
xPage({
  ...mixins,
  ...dealSku,
  // ...utils.mixins,
  // ...list,
  // ...lifecycle,
  _data: {
    authCode: 0
  },
  data: {
    // sku
    isShowPopup: false, // v-model
    normSelectTag: 0,
    currentSum: 1,
    maxBuySum: 10,

    skuBtnStatus: {
      isBtnActive: true, // 按钮否可用
      buyBtnText: '立即购买',
      cartBtnText: '加入购物车',
    },
    attrData: [],
    skuStocksList: {}, // 属性ID 对应 sku列表

    defaultSelectedIds: [], // 默认已选择id
    defaultSkuData: {}, // 默认skuData
    currentSkuData: {}, // 当前skuData
    selectedAttrName: [], // 已选择 attr
    notSelectedAttrName: '', // 未选择属性提示

    // sku end
    // login
    authCode: 0,
    userPhoneData: '',
    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    }),
    //

    shareInfo: true,
    pageInfo: {
      pageId: 0,
    },
    debug: true,
    onItemTap: 'handleListItemTap',
    price: {
      // type: '花呗价：',
      price: 12.3,
      point: 88,
      marketPrice: 23.3,
    },
    pages: {
      onItemTap: 'onGridItemTap',
      curIndex: 0,
      list: [
        { text: 'hhm首页', page: 'index', status: 'done' },
        { text: 'hhm专题页2', page: 'zt2', status: 'done' },
        { text: 'wz详情页', page: 'detail', status: 'done' },
        { text: 'cn确认订单', page: 'order-commit', status: 'done' },
        { text: 'wz订单结果', page: 'order-result', status: 'done' },
        { text: 'wz订单列表', page: 'order-list', status: 'done', query: { type: 2 } },
        { text: 'wz申请退款', page: 'order-refund', status: 'done' },
        { text: 'wz退款详情', page: 'order-refund-detail', status: 'done' },
        { text: 'hjs订单详情', page: 'order-detail', status: 'done' },
        { text: 'hjs个人中心', page: 'profile', status: 'done' },
        { text: 'xx查看物流', page: 'delivery', status: 'done' },
        { text: 'xx拼团规则', page: 'rule', status: 'done' },
        { text: 'xx我的拼团', page: 'couple-order-list', status: 'done' },
        { text: 'cn地址列表', page: 'address-list', status: 'done' },
        { text: 'cn地址新增/编辑', page: 'address-update', status: 'done' },
        { text: 'yzj登录', page: 'login', status: 'done' },
        { text: 'yzj客服', page: 'service', status: 'done' },
        { text: 'yzj错误页', page: 'error', status: 'done', query: { message: '错误信息自己定' } },
        { text: 'hjs拼团分享', page: 'couple-share', status: 'done' },
        { text: '关注生活号', page: 'service', query: { 'page-type': 'life' } },
        { text: '专题活动', page: 'topic', status: 'done', query: { url: encodeURIComponent('https://topic.dev.doweidu.com/?id=285f901b39f6ba7d90b05d9f90006e49')} },
        // demo
        { text: '测试参团', page: 'couple-share', query: { id: 228098 } },
        { text: 'test列表页', page: 'list', type: 'demo' },
        { text: 'test上传七牛', page: 'qiniu', type: 'demo' },
        { text: 'testswiper', page: 'swiper', type: 'demo' },
      ],
    },
  },

  onLoad(query) {
    // this.onPageInit(query);
  },
  onShow() {
    // this.onMessage();
    // this.setShareMessage();
    // this.setData({ todos: app.todos });
    // login
    this.updatedCode();
  },

  onReady() {

    this.dealSKUData({
      stocksList: stocksList,
      attrList: attrList,
      defaultSkuData: {
        name: '海太蜂蜜黄油薯片1',
        thumbnail: '',
        max_buy_num: 10,
      },
      currentSkuData: {
        name: '海太蜂蜜黄油薯片1',
        // 缩略图
        thumbnail:
          'http://img2.haoshiqi.net/mabe517dfd1b05e93478d8a12203bf6d49.jpg?imageView2/0/q/70',
        stock: 111, // 库存
        price: 1111, //sku价格（当前售价）
        market_price: 111, // 原价（删除价）
        skuid: 111, // skuid
        max_buy_num: 10, // 当前sku限购数
      },
    });
  },
  onGoToView(e) {
    const { url = '' } = e.currentTarget.dataset;
    console.log(e);
    if (this.data.logged && url) {

      const { token } = api.getCommonParams();
      console.log('token:', token);
      let tempUrl = urlfix(url, 'token=' + token);
      console.log('tempUrl:',tempUrl);
      this.forward('web-view', { url: encodeURIComponent(tempUrl) })
    }
  },
  // onTodoChanged(e) {
  //   const checkedTodos = e.detail.value;
  //   app.todos = app.todos.map(todo => ({
  //     ...todo,
  //     completed: checkedTodos.indexOf(todo.text) > -1,
  //   }));
  //   this.setData({ todos: app.todos });
  // },
  onGridItemTap(e) {
    const {
      page,
      index,
      query = this.data.pages.list[index].query,
    } = e.currentTarget.dataset;
    // const page = this.data.pages.list[e.currentTarget.dataset.index].page;
    this.forward(page, query);
  },
  onClick(e) {
    const { type } = e.currentTarget.dataset;
    switch (type) {
      // case 'url':
      //   window.location.href = qrcode;
      //   break;
      // case 'schema':
      //   window.location.href = alipayScheme;
      //   break;
      case 'store':
        wx.clearStorage({
          success() {
            wx.showToast('清除缓存成功');
          },
        });
        api.logout({}, (res) => {
          console.log(res.data);
        }, (err) => {
          console.log(err);
        });
        break;
      case 'test':
        break;
      default:
        // do nothing...
        break;
    }
  },

  countChangeVal(data) {
    console.log(data);
    const { value } = data;
  },

  //////////sku
  addShoppingCartClick() {
    this.setData({
      normSelectTag: 1,
      isShowPopup: true,
    });
  },
  buyBtnClick() {
    this.setData({
      normSelectTag: 2,
      isShowPopup: true,
    });
  },
  // 点击规格选择
  onSelectNorm() {
    this.setData({
      normSelectTag: 0,
      isShowPopup: true,
    });
  },
  // 接收sku 点击的事件
  onBtnClick(data) {
    console.log(data);
    const { type } = data;
    switch (type) {
      case 'buyBtn':
        //
        break;
      case 'addShoppingCart':
        //
        break;
    }
  },
  // 登录的逻辑
  updatedCode() {
    const that = this
    wx.login({
      success(auth) {
        if (auth.code) {
          console.log('auth code :', auth);
          that._data.authCode = auth.code;
          that.setData({
            authCode: auth.code
          })
        }
      }
    })
  },

  getUserInfo(res) {

    // 登录前，先清除下之前登录相关的缓存数据
    app.clearUserInfo();
    xmini.store.dispatch('setUserInfo', {})
    console.log(res)

    const detail = res.detail;
    console.log(detail)
    if (detail.errMsg == 'getUserInfo:ok') {
      console.log('xxxx')
      this.login({
        code: this._data.authCode,
        // userInfo: res.userInfo,
        encryptedData: encodeURIComponent(detail.encryptedData),
        iv: encodeURIComponent(detail.iv),
      });
    } else {
      // 失败！
      if (detail.errMsg === 'getUserInfo:fail auth deny' || detail.errMsg === 'getUserInfo:fail:auth deny') {
        // 获取用户信息授权失败，展示引导
        wx.showModal({
          title: '提示',
          content: '需要你到授权，才能使用完整版的好食期',
          confirmText: '知道了',
          showCancel: false,
          success(res) {
            console.log(res)
            // if (res.confirm) {
            //   that.getAuthorize('scope.userInfo')
            // } else if (res.cancel) {
            //   console.log('用户点击取消');
            //   // 登录点击取消授权默认返回2层页面，如果需要特殊处理需要在跳转到login页面的时候传step参数。
            //   let step = 2;
            //   if (that.pageQuery.step) {
            //     step = that.pageQuery.step
            //   }
            //   that.back(step);
            // }
          }
        });

      }
    }


  },
  getPhoneNumber(e) {
    console.log('getPhoneNumber:', e)
    this.setData({
      userPhoneData: JSON.stringify(e.detail)
    })
    api.userAuthPrepose({
      code: this._data.authCode,
      type: 2,
      encryptedData: encodeURIComponent(e.detail.encryptedData),
      iv: encodeURIComponent(e.detail.iv),
    }, (res) => {
      console.log(res);
    }, (err) => {
      console.log(err);
    })
  },
  login(data) {
    api.login({
      type: 2,
      ...data,
    }, (res) => {
      this.updatedCode(); // 更新code
      const { data } = res;
      const userId = data.user_id;
      // data.userId = userId;
      xmini.piwikUpdate({
        isTrackWorking: true,
        userId: data.user_id || '',
        openId: data.wechat_open_id || '',
      });
      if (userId) {
        // 更新store
        xmini.store.dispatch('setUserInfo', data)
        console.log('登录成功');
      } else {
        wx.showToast('用户登录信息有误，请重新登录');
      }
    }, (err) => {
      wx.showToast(`登录失败! ${err.errmsg}`,);
      return true;
    });
  },


});
