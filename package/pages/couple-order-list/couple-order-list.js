import {
  me,
  xmini,
  xPage,
} from '../../../config/xmini';
import api from '../../../api/index'
import {
  mapTo,
  pullList,
} from '../../../utils/index'
import mixins from '../../../utils/mixins';

import CountManger from '../../../utils/CountManger';
import { formatCountDown } from '../../../utils/dateUtil';

// const app = getApp();

xPage({
  ...mixins,
  ...pullList,
  data: {
    isLoading: true,
    tabs: [
      '拼团中',
      '拼团成功',
      '拼团失败',
    ],
    clickIndex: 0,

    showFooter: false,
    hiddenTabs: false,
  },

  onLoad(query) {
    this.onPageInit(query);
    const type = query.type || 1;
    const listType = query.listType || 1;
    const hiddenTabs = query.hiddenTabs || false;
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      height: systemInfo.windowHeight,
      type,
      listType,
      hiddenTabs,
    }, () => {
      // this.refresh()
    });

    const title = (listType == 1) ? (hiddenTabs ? "待分享成团": "我的拼团") : "我的抽奖";
    wx.setNavigationBarTitle({
      title ,
    });
  },

  onShow() { //以后改为onMessage的
    this.setData({},() =>{
      this.refresh();
    })

  },


  onUnload() {
    this.clearCountDown();
  },

  onHide() {
    this.clearCountDown();
  },

  refresh(){
    this.initPullList();
    this.getCoupleOrderList();
  },

  switchTab(e) {
    const that = this;
    const { index,name } = e.currentTarget.dataset;
    const switchType = index + 1;
    if (that.data.clickIndex === index) {
      return;
    }

    xmini.piwikEvent('c_nav',{
      name,
      listtype:1,
    });
    this.clearCountDown();
    that.setData({
      type: switchType,
      clickIndex: index,
    }, () =>{
      this.refresh();
    });
  },
  getCoupleOrderList() {
    const selectType = this.data.type;
    this.setData({
      isLoading: true,
      list: [],
    });
    this.initPullList();
    this.pullParams.scope = this;
    this.pullParams.weights = 1;
    this.pullParams.type = selectType;
    this.pullParams.listType = this.data.listType;

    this.pullModel = api.coupleOrderList;
    this.onScrollToLower();
  },
  afterPull() {
    this.setData({
      isLoading: false
    })
    if (this.pullParams.pageNum == 1) {
      delete this.pullParams.scope;
      delete this.pullParams.weights;
    }
  },
  afterPullData() {
    this.startCountDown();
  },

  startCountDown() {
    const that = this;
    if (that.data.type != 1) {
      return;
    }
    const { list = [], diffTime } = this.data;
    // var localEndTime = item.endTime*1000 + diffTime;
    // var localLeftTime = localEndTime - Date.now();
    const countDownOptions = {
      times: 1000,
      dataList: list,
      set() {
        this.localEndTime = this.data.endTime * 1000 + diffTime;
        if (this.localEndTime - Date.now() > 0 && !this.data.isSetCountDown) {
          this.start();
          // this.data.isSetCountDown = true;
        }
        that.setData({
          [`list[${this.index}].isSetCountDown`]: true,
          // [`list[${this.index}].localEndTime`]: this.localEndTime,
        });
      },
      callback() {
        const localLeftTime = this.localEndTime - Date.now();
        if (localLeftTime > 0) {
          const format = localLeftTime > 86400000 ? 'D天 H:F:S' : 'H:F:S';
          const info = formatCountDown(localLeftTime, format);
          console.log(info);
          that.setData({
            [`list[${this.index}]`]: Object.assign({}, that.data.list[this.index], { countDownInfo: info }),
          });
        } else {
          const info = '00:00:00';
          that.setData({
            [`list[${this.index}]`]: Object.assign({}, that.data.list[this.index], {
              countDownInfo: info,
              // status: 2,
            }),
          });
          this.clear();
        }
      },
    };
    if (!this.countManger) {
      this.countManger = new CountManger(countDownOptions);
    } else {
      this.countManger.add(countDownOptions);
    }
  },

  clearCountDown() {
    const that = this;
    if (this.countManger) {
      this.countManger.clear(function() {
        that.setData({
          [`list[${this.index}].isSetCountDown`]: false,
        });
      });
      this.countManger = null;
    }
  },

  goCoupleShare(e) {
    const { eventid, status, listtype, orderid } = e.currentTarget.dataset;
    if (this.data.type == 1) {
      this.initPullList();
    }
    const pinType = listtype || 1;
    if (pinType == 1) {
      xmini.piwikEvent('c_invite',{
        orderid: orderid,
        index: status,
        listType:1,
      });
      this.forward('pin-share', {
        id: eventid,
      });
    }else {
      xmini.piwikEvent('c_invite',{
        orderid: orderid,
        index: status,
        listType:1,
      });
      this.forward('couple-share', {
        id: eventid,
      });
    }
    // this.clearCountDown();
  },
  goOrderDetail(e) {
    const { orderid } = e.currentTarget.dataset;
    if (this.data.type == 1) {
      this.initPullList();
    }
    xmini.piwikEvent('c_orderdetail',{
      orderid,
      index:this.data.type,
    });
    this.forward('order-detail', {
      id: orderid,
    });
    // this.clearCountDown();
  },

  dealList(list) {
    return mapTo(list, (item) => {
      const tags = this.setStatusIcon(item.lotteryStatus);
      return {
        id: item.order_id,
        pinActivityId: item.pinActivitiesId,
        eventId: item.pin_event_id,
        status: item.pin_event_status,
        type: item.type,
        price: item.couplePrice,
        title: item.coupleTitle,
        img: item.skuPic,
        endTime: item.endTime,
        lotteryStatus: item.lotteryStatus,
        tags,
        expired_date_text: item.expired_date_text_two,
      };
    });
  },

  setStatusIcon(lotteryStatus) {
    switch (this.data.type) {
      case 1:
        return '';
        break;

      case 2:
        let tags = 'https://img1.haoshiqi.net/wxapp/img/couple-order/pin_success_ef31a00330.png';
        if (this.data.listType == 2) {
          //1.等待开奖 2.未中奖 3.中奖
          switch (lotteryStatus) {
            case 1:
              tags = 'https://img1.haoshiqi.net/miniapp/couple-order/lottery_wait_2bf537d55e.png';
              break;
            case 2:
              tags = 'https://img1.haoshiqi.net/miniapp/couple-order/lottery_fail_b2f895764f.png';
              break;
            case 3:
              tags = 'https://img1.haoshiqi.net/miniapp/couple-order/lottery_win_855127f729.png';
              break;
          }
        }
        return tags;

        break;

      case 3:
        return 'https://img1.haoshiqi.net/wxapp/img/couple-order/pin_fail_600573cb6e.png';
        break;

      default:
        break;
    }
  },
  // goIndex() {
  //   wx.switchTab({
  //     url: '../index/index',
  //   });
  // },
  // 中奖详情
  goWinDetail(e) {
    const { id } = e.currentTarget.dataset;
    this.forward('lottery-win-list', {
      id,
    });
  },
});
