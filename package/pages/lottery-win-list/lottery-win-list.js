// pages/lottery-win-list/lottery-win-list.js
import {
  // me,
  // xmini,
  xPage,
} from '../../../config/xmini';
import api from '../../../api/index';
import {
  mapTo,
  pullList,
} from '../../../utils/index';
import mixins from '../../../utils/mixins';


xPage({
  ...mixins,
  ...pullList,
  // 页面的初始数据
  data: {
    isLoading: true,

    lowerThreshold: 300,
    pullLoading: true,
    lotteryList: [],
    // 是否需要渲染页面
    isNeedLayout: false,
  },

  // 生命周期函数--监听页面加载
  onLoad: function (query) {
    this.onPageInit(query);
    this.pinActivitiesId = query.id || 0;
    this.refresh();
  },

  onShow() {

    this.onMessage();
  },

  onUnload() {

  },

  refresh() {
    this.onFecthData(this.pinActivitiesId);
  },

  onFecthData(id) {
    this.initPullList();
    this.pullParams.scope = this;
    this.pullParams.weights = 1;
    this.pullParams.pinActivitiesId = id;

    this.pullModel = api.getLotteryWinInfo;
    this.setData({
      isLoading: true,
    })
    // 主动触发加载事件
    this.onScrollToLower();
  },

  // 接口成功回调
  afterPull(res) {
    if (this.pullParams.pageNum == 1) {
      delete this.pullParams.scope;
      delete this.pullParams.weights;
    }
    const { lotteryStatus = 0, lotteryUserList = [] } = res.data;
    // 这边lotteryList不能用list，这边数据自己处理，不用pullList里面处理list，所以不能跟list同名，否则pullList里面pageNum==1是会清空list，
    const lotteryList = this.dealList(lotteryUserList);
    // 0.未参与活动 2.未中奖 3.已中奖 4.活动失效
    let headerIcon = '';
    let headerTitle = '';
    let headerSubTitle = '';
    switch (lotteryStatus) {
      case 0:
        headerIcon = 'https://img1.haoshiqi.net/miniapp/lottery_sad_5ba6156a5c.png';
        headerTitle = '您还没有购买此商品哦~';
        headerSubTitle = '参加其它抽奖团 赢得好运';
      break;
      case 2:
        headerIcon = 'https://img1.haoshiqi.net/miniapp/lottery_sad_5ba6156a5c.png';
        headerTitle = '很遗憾  未中奖';
        headerSubTitle = '别哭！参加其它抽奖团 赢得好运~';
      break;
      case 3:
        headerIcon = 'https://img1.haoshiqi.net/miniapp/lottery_yeah_eeceb0d071.png';
        headerTitle = '恭喜你，中奖啦~！！';
        headerSubTitle = '快去跟朋友炫耀一下！';
      break;
      case 4:
        headerIcon = 'https://img1.haoshiqi.net/miniapp/lottery_sad_5ba6156a5c.png';
        headerTitle = '很抱歉，此次活动已失效';
        headerSubTitle = '';
      break;
      default:
      break;
    }
    this.setData({
      isLoading: false,
      lotteryStatus,
      lotteryList,
      headerIcon,
      headerTitle,
      headerSubTitle,
    });
  },

  dealList(lotteryList) {
    return mapTo(lotteryList, (item) => {
      let orderSting = item.orderId + '';
      const orderId = this.strReplace(orderSting, orderSting.length - 4, 4);
      return {
        name: item.userName,
        avatar: item.userAvatar,
        orderId,
      }
    });
  },

  // 字符串指定位置替换
  strReplace(str, start, len) {
    str = str + '';
    return str.substr(0, start) + '*'.repeat(len) + str.substr(start + len);
  },

  // 更多抽奖团
  onMoreLotter() {
    this.forward('lottery-list', {});
  },

  //设置分享信息
  onShareAppMessage(res) {
    let path = '';
    if (this.data.lotteryStatus == 3) {
      path = `pages/lottery-detail-share/lottery-detail-share?id=${this.pinActivitiesId}`;
    }else {
      path = 'pages/lottery-list/lottery-list';
    }
    return {
      path,
    }
  },
});
