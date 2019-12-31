// pages/lottery-detail-share/lottery-detail-share.js
import {
  // me,
  // xmini,
  xPage,
} from '../../../config/xmini';
import { mapTo } from '../../../utils/index';

import api from '../../../api/index';
import mixins from '../../../utils/mixins';

import {
  formatDate,
  formatCountDown,
} from '../../../utils/dateUtil';

const app = getApp();

xPage({
  ...mixins,

  // 需要倒计时的列表项
  countDownItems: [],

  // 是否需要渲染页面
  isNeedLayout: false,

  timer: null,

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (query) {
    this.onPageInit(query);
    this.id = query.id
    if (!this.id) this.id = 81;


    // 订阅 提醒状态 改变
    app.onSubscribeEvent(this, 'KREMIND_STATUS', (res) => {
      this.refreshSubscribeStatus(res.index, res.remindStatus)
    });
  },

  onShow: function () {

    this.isNeedLayout = true;
  },

  onHide: function () {
    this.isNeedLayout = false;
  },

  refresh(){
    // 加载数据
    this.loadData();
  },

  onUnload: function () {

    clearInterval(this.timer);
    this.timer = null;

    // 取消订阅
    app.offSubscribeEvent('KREMIND_STATUS', this.getPageName);
  },

  // 初始化定时器
  initTimer: function () {
    this.timer = setInterval(this.timerCallback, 1000)
  },

  // 定时器回调 1s 回调一次
  timerCallback: function () {
    if (!this.isNeedLayout) return;
    let temp = this.data.list
    this.countDownItems.forEach((item) => {

      temp[item.index].time = this.lotteryEndTimeFromNow(item.endTime)
    })
    this.setData({
      list: temp
    })
  },

  /**
   * 开团中的item添加到countDownItems中
   * index:  数据源中的index
   * item:   原始数据
   */
  addToCountDown: function (index, item) {
    this.countDownItems.push({
      index,
      endTime: item.endTime,
    })
  },

  loadData: function () {
    this.setData({
      isLoading: true,
    })
    api.getLotteryShareDetail(
      {
        scope: this,
        weights: 1,

        pinActivitiesId: this.id
      },
      (res) => {
        console.log(res);
        this.setData({
          timestamp: res.timestamp,
          diffTime: res.timestamp * 1000 - Date.now(),
        });

        const result = this.dealData(res.data);
        if (this.countDownItems.length != 0) {
          this.initTimer();
        }
        this.setData({
          isLoading: false,
          ...result,
        });
      },
      (err) => {
        console.log(err)
      });
  },

  // 处理数据
  dealData: function (data) {
    let index = -1
    const list = mapTo(data.recommendLotteryActivities, (item) => {
      index += 1
      // 按钮标题
      let btnTitle = ""
      // 按钮样式class
      let btnCls = "goods-btn-normal"
      // 按钮类型
      let btnType  // 0 提醒我 1 取消提醒 2 马上抢 3 开奖中 4 中奖详情
      let time = "已结束"
      switch (item.status) {
        case 1: // 预热
          {
            const today = (new Date(this.data.timestamp * 1000)).getDate()
            const target = formatDate(item.startTime, "d")
            const diff = target - today

            let per = ""
            if (diff == 1) {
              per = "明天"
            } else if (diff > 1) {
              per = "D"
            }
            time = formatDate(item.startTime, `${per} H:F开抢`)
            if (item.remindStatus == 1) {
              btnTitle = "取消提醒"
              btnCls = "goods-btn-cancel"
              btnType = 1
            } else {
              btnTitle = "提醒我"
              btnType = 0
            }
            break;
          }
        case 2: // 开团中
          {
            // 加入倒计时列表中
            this.addToCountDown(index, item)
            time = this.lotteryEndTimeFromNow(item.endTime)
            btnTitle = "马上抢"
            btnType = 2
            break;
          }
        case 3: // 开奖中
          {
            btnTitle = "开奖中"
            btnType = 3
            break;
          }
        case 4: // 开奖结束
          {
            btnTitle = "中奖详情"
            btnCls = "goods-btn-detail"
            btnType = 4
          }
      }
      return {
        index: index,
        id: item.pinActivitiesId,
        imageSrc: item.lotteryPics,
        goodsName: item.title,
        goodsPrice: (item.groupPrice / 100).toFixed(2),
        goodsOldPrice: (item.marketPrice / 100).toFixed(2),
        btnTitle,
        btnCls,
        btnType,
        time,
        loading: false,
      };
    });
    return {
      // 商品model
      goodsInfo: {
        goodsIcon: data.skuPic,
        title: data.title,
        groupPrice: "￥" + (data.groupPrice / 100).toFixed(2),
        marketPrice: (data.marketPrice / 100).toFixed(2),
        joinCount: data.joinCount
      },
      users: {
        icons: data.lotteryUserList.splice(0, 6),
        showMore: true,
      },
      list,
    }
  },

  /**
   * 按钮点击事件
   */
  onBtnClick: function (options) {
    console.log(options);
    const { id, btnType: status, index } = options.target.dataset;


    switch (status) {
      case 0: { // 提醒我
        this.setData({
          [`list[${index}].loading`]: true,
        })
        api.getLotterySubScribe({
          pinActivitiesId: id,
          type: 1, // 1.订阅 2.取消订阅
        },
          (res) => {
            this.refreshSubscribeStatus(index, 1)
          },
          (err) => {
            console.log(`----err-----${err}`)
            this.setData({
              [`list[${index}].loading`]: false,
            })
          });
        break;
      }
      case 1: { // 取消提醒
        this.setData({
          [`list[${index}].loading`]: true,
        })
        api.getLotterySubScribe({
          pinActivitiesId: id,
          type: 2, // 1.订阅 2.取消订阅
        },
          (res) => {
            this.refreshSubscribeStatus(index, 2)
          },
          (err) => {
            console.log(`----err-----${err}`)
            this.setData({
              [`list[${index}].loading`]: false,
            })
          });
        break;
      }
      case 2: {
        this.goLotteryDetail(id, index)
        break;
      }
      case 3: {
        this.goLotteryDetail(id, index)
        break;
      }
      case 4: { // 中奖详情
        this.forward('lottery-win-list', {
          id,
        })
        break;
      }
    }
  },

  // item 点击事件
  onItemClick: function (options) {
    //TODO: 测试代码
    this.forward("lottery-detail-share")
    console.log(options);
    const { id, index } = options.currentTarget.dataset;
    this.goLotteryDetail(id, index);
  },

  // info view 点击事件
  onInfoViewClick: function (sender) {

    this.goLotteryDetail(this.id);
  },

  // 用户头像点击
  userAvatarClick: function (sender) {
    this.forward('lottery-win-list', {
      id: this.id,
    });
  },

  // 更多拼团点击
  onMore: function (sender) {
    this.forward('index');
  },

  /**
   * 计算现在到结束时间还要多久
   * target 结束时间的时间戳 以s为单位
   */
  lotteryEndTimeFromNow: function (target) {
    const localEndTime = target * 1000 - this.data.diffTime
    const leftTime = localEndTime - Date.now();
    if (leftTime >= 0) {
      const format = leftTime > 86400000 ? 'D天 H:F:S' : 'H:F:S';
      return formatCountDown(leftTime, format) + " 结束";
    } else {
      const format = 'H:F:S';
      return formatCountDown(0, format) + " 结束";
    }
  },

  // 刷新订阅状态
  refreshSubscribeStatus(index, status) {
    if (status == 1) {// 取消提醒
      let temp = this.data.list[index];
      temp.loading = false;
      temp.btnTitle = "取消提醒";
      temp.btnCls = "goods-btn-cancel";
      temp.btnType = 1;
      this.setData({
        [`list[${index}]`]: temp,
      });
    } else { // 提醒我
      let temp = this.data.list[index];
      temp.loading = false;
      temp.btnTitle = "提醒我";
      temp.btnCls = "goods-btn-normal";
      temp.btnType = 0;
      this.setData({
        [`list[${index}]`]: temp,
      });
    }
  },

  // 跳转抽奖详情
  goLotteryDetail: function (id, index) {
    this.forward('lottery-detail', {
      id,
      index,
    });
  },

});
