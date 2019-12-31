// pages/lottery-list/lottery-list.js
import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import {
  pullList,
  mapTo,
} from '../../utils/index';
import mixins from '../../utils/mixins';

import {
  formatDate,
  formatCountDown,
} from '../../utils/dateUtil';

import { clone } from '../../utils/index';

const app = getApp();

xPage({

  ...mixins,

  ...pullList,

  // 需要倒计时的列表项
  countDownItems: [],

  // 当前倒计时项的index
  index: -1,

  // 是否需要渲染页面
  isNeedLayout: false,

  timer: null,


  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    showFooter: false,
    list: [],
    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(query) {
    this.onPageInit(query)

    this.initTimer();
    this.refresh();
    // 订阅 提醒状态 改变
    app.onSubscribeEvent(this, 'KREMIND_STATUS', (res) => {
      this.refreshSubscribeStatus(res.index, res.remindStatus)
    });
  },

  onShow() {

    this.isNeedLayout = true;
  },

  onHide() {
    this.isNeedLayout = false;
  },

  onUnload() {

    clearInterval(this.timer);
    this.timer = null;

    // 取消订阅
    app.offSubscribeEvent('KREMIND_STATUS', this.getPageName);
  },

  refresh() {

    // 请求拼团列表
    this.requestData();

  },

  // 初始化定时器
  initTimer() {
    this.timer = setInterval(this.timerCallback, 1000)
  },

  // 定时器回调 1s 回调一次
  timerCallback() {
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
   * 请求数据
   */
  requestData() {
    // 初始化请求参数
    this.initPullList()

    this.pullParams.scope = this;
    this.pullParams.weights = 1;
    this.pullModel = api.getLotteryList

    this.setData({
      isLoading: true,
    })
    // 主动触发请求
    this.onScrollToLower()
  },

  afterPull() {
    this.setData({
      isLoading: false,
    })
    const { pageNum } = this.pullParams
    if (pageNum === 1) {
      this.countDownItems = []
      this.index = -1;

      delete this.pullParams.scope;
      delete this.pullParams.weights;
    }
  },

  /**
   * 处理列表数据
   * 在pullList中调用，不需要主动要用
   * params
   *  list: 列表数据
   */
  dealList(list) {

    return mapTo(list, (item) => {
      this.index += 1
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

            switch (diff) {
              case 0: {
                time = formatDate(item.startTime, `H:F开抢`);
                break;
              }
              case 1: {
                time = formatDate(item.startTime, `明天H:F开抢`);
                break;
              }
              case 2: {
                time = formatDate(item.startTime, `后天H:F开抢`);
                break;
              }
              default: {
                time = `${diff}天后开抢`
                break;
              }
            }

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
            this.addToCountDown(this.index, item)
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
        index: this.index,
        id: item.pinActivitiesId,
        imageSrc: item.lotteryPics,
        goodsName: item.title,
        goodsPrice: (item.groupPrice / 100).toFixed(2),
        goodsOldPrice: (item.marketPrice / 100).toFixed(2),
        btnTitle,
        btnCls,
        btnType,
        time,

      };
    });
  },

  /**
   * 开团中的item添加到countDownItems中
   * index:  数据源中的index
   * item:   原始数据
   */
  addToCountDown(index, item) {
    this.countDownItems.push({
      index,
      endTime: item.endTime,
    })
  },

  setOldE(e) {
    if (e) {
      this.oldE = clone(e);
      this.hasOldE = true;  //阻止点击空白地区跳转
    }
  },

  /**
   * 按钮点击事件
   */
  onBtnClick(options) {
    console.log(options);
    this.setOldE(options)
  },
  verifyAuth() {
    const { logged, userInfo } = this.data;
    const pageComponent = this.selectComponent('#dwd-page-lottery');
    if (!logged) {
      // 显示登录弹窗
      pageComponent.setData({
        isShowLoginPopup: true
      });
      return false
    }
    return true;
  },
  handleBtnClick(e){
    const { id, btnType: status, index } = e.target.dataset;
    if (status == 0 || status == 1 || status == 4) {
      if(!this.verifyAuth()) return;
    }
    switch (status) {
      case 0: { // 提醒我
        wx.showLoading()
        api.getLotterySubScribe({
          pinActivitiesId: id,
          type: 1, // 1.订阅 2.取消订阅
          nodeHideLoading: true
        },
          (res) => {
            wx.hideLoading()
            this.refreshSubscribeStatus(index, 1)
          },
          (err) => {
            console.log(`----err-----${err}`)
            wx.hideLoading()
          });
        break;
      }
      case 1: { // 取消提醒
        wx.showLoading()
        api.getLotterySubScribe({
          pinActivitiesId: id,
          type: 2, // 1.订阅 2.取消订阅
          nodeHideLoading: true
        },
          (res) => {
            wx.hideLoading()
            this.refreshSubscribeStatus(index, 2)
          },
          (err) => {
            console.log(`----err-----${err}`)
            wx.hideLoading()
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
  onItemClick(options) {
    console.log(options);
    this.setOldE(options);
  },
  handleItemClick(e){
    const { id, index } = e.currentTarget.dataset;
    this.goLotteryDetail(id, index);
  },

  // 跳转抽奖详情
  goLotteryDetail(id, index) {
    this.forward('lottery-detail', {
      id,
      index,
    });
  },

  /**
   * 计算现在到结束时间还要多久
   * target 结束时间的时间戳 以s为单位
   */
  lotteryEndTimeFromNow(target) {
    const localEndTime = target * 1000 - this.data.diffTime
    const leftTime = localEndTime - Date.now();
    if (leftTime >= 0) {
      const format = leftTime > 86400000 ? 'D天 H:F:S' : 'H:F:S';
      return formatCountDown(leftTime, format) + " 结束";
    } else {

      return "已结束";
    }
  },

  // 刷新订阅状态
  refreshSubscribeStatus(index, status) {
    if (status == 1) {// 取消提醒
      let temp = this.data.list[index];
      temp.btnTitle = "取消提醒";
      temp.btnCls = "goods-btn-cancel";
      temp.btnType = 1;
      this.setData({
        [`list[${index}]`]: temp,
      });
    } else { // 提醒我
      let temp = this.data.list[index];
      temp.btnTitle = "提醒我";
      temp.btnCls = "goods-btn-normal";
      temp.btnType = 0;
      this.setData({
        [`list[${index}]`]: temp,
      });
    }
  },

  afterFormIdSubmit() { //formId提交之后调用，注意给页面、组件的事件view上加data-form-type
    const oldE = this.oldE || {};
    if (this.hasOldE && oldE.currentTarget && oldE.currentTarget.dataset) {
      const { formType } = oldE.currentTarget.dataset;
      switch (formType) {
        case 'detail':
          this.handleItemClick(oldE)
          break;
        case 'remind':
          this.handleBtnClick(oldE)
          break;
        default:
          // do nothing
          break;
      }
      this.hasOldE = false;
    }
  }
});
