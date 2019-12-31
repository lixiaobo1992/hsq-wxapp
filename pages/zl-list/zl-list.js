import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import {
  mapTo,
  pullList,
} from '../../utils/index';
import mixins from '../../utils/mixins';
import dealData from '../../utils/dealData';
import CountManger from '../../utils/CountManger';
import { formatLeftTimeObj } from '../../utils/dateUtil';

xPage({
  ...mixins,
  ...pullList,
  ...dealData,
  data: {
    showStartPopup: false,
    showSuccessPopup: false,
    showFailPopup: false,
    showGetSuccessPopup: false,
    showRulePopup: false,
    showExchangeSuccess: false,
    taskStatus: 0, // 0: 未领取，1：已经领取，2：任务完成，4：任务失败
    showCountDown: false,
    countDownInfo: {},
    showTab: 2,
    currentIndex: 0,
    historyTaskList: [],
    watchTaskInfo: {},
    baseInfo: {},
    popToIndex: {},
    taskSkuList: [],
    categoryList: [],
    showPrizeInfo: {},
    rules: [],
    zlUserList: [],
    startHasBoostPercent: 0,
    modules: [],
    newUserUrl: '',
    showNewUserPopup: false,
    exchangeSuccessObj: {},
    ...mapState({
      userInfo: state => state.user.userInfo,
    })
  },
  onLoad(query) {
    this.onPageInit(query);
  },
  onPullDownRefresh(){
    const that = this
    wx.showLoading()
    this.refresh()
    setTimeout(function () {
      wx.hideLoading()
      wx.stopPullDownRefresh();
    }, 1000);
  },
  onShow() {
    // 更新code;
    this.refresh()
  },
  onHide() {
    this.clearCountDown()
  },
  onUnload() {
    this.clearCountDown()
  },
  refresh(){
    this.clearCountDown()
    this.getInitPost()
    this.getIndex();
  },
  getInitPost() {
    api.getAcceleratorInfo({
      inviteUserId: this.pageQuery.inviteUserId,
      skuId: this.pageQuery.skuId,
      zeroTaskId: this.pageQuery.zeroTaskId,
      dontShowPopup: this.dontShowPopup,
    }, res => {
      const { data = {} } = res;
      this.setData({
        showPrizeInfo: {
          hasBoostPercent: data.hasBoostPercent,
          avatar: data.avatar,
          helpSuccess: data.isSuccess,
          speed: data.speed,
          startBoostPercent: data.startBoostPercent
        },
        showStartPopup: data.needPopup,
        isLoading: false,
      })
      this.getZlInfo()
    }, err => {
      this.getZlInfo()
      // 防止跳两次登录页面
      if (err.errno === 510010) {
        return true;
      }
    })
  },
  getZlInfo(){
    api.getZeroBoostIndex({
      hideLoading: true,
    }, res => {
      const { data = {} } = res;
      const baseInfo = {
        speed: data.speed,
        startBoostPercent: data.startBoostPercent,
        taskSkuInfo: data.skuInfo || {},
        taskRate: data.taskRate,
        speedRate: data.speedRate,
        hasInviteList: data.hasInviteList,
        zeroTaskId: data.zeroTaskId,
      }
      const categoryList = data.bbhCategory || []
      const rules = data.rules || []
      const diffTime = (res.timestamp * 1000) - (+new Date())
      this.localEndTime = (data.leftTime * 1000) + diffTime;
      const taskStatus = data.taskStatus // 0待领取 1领取 2助力完成 3兑换成功 4任务已过期
      const popToIndex = data.popToIndex
      this.setData({
        categoryList,
        rules,
        taskStatus,
        baseInfo,
        popToIndex,
        watchTaskInfo: data.zeroTaskInfo || {},
        zlUserList: [],
        shareInfo: {
          path: `pages/zl-list/zl-list?skuId=${data.skuInfo && data.skuInfo.skuId}&zeroTaskId=${data.zeroTaskId}&inviteUserId=${this.data.userInfo.user_id}`,
          title: data.shareInfo.title,
          imageUrl: data.shareInfo.img,
        },
        newUserUrl: data.newUserRedirectUrl || '',
        showNewUserPopup: data.isNewUser,
      })
      if (data.taskStatus === 1) {
        this.startCountDown()
      } else {
        this.setData({
          showCountDown: false
        })
      }
      if (data.taskStatus === 1 || data.taskStatus === 2) {
        this.getHistoryList()
      } else {
        this.getTaskSkuList()
      }
      if (data.hasInviteList && (data.taskStatus === 1 || data.taskStatus === 2)) {
        this.getZlUserListInit()
      }
      if (data.taskStatus === 2) {
        this.setData({
          showSuccessPopup: true
        })
      } else if (data.taskStatus === 4) {
        this.setData({
          showFailPopup: true
        })
      }
    }, err => {
      console.log(err)
    })
  },
  getZlUserListInit() {
    this.zlUserListPageNum = 1;
    this.zlUserListHasNextPage = true;
    this.getZlUserList();
  },
  zlUserListNextPage() {
    if (!this.zlUserListHasNextPage) {
      return;
    }
    this.zlUserListPageNum = this.zlUserListPageNum + 1;
    this.getZlUserList();
  },
  getZlUserList() {
    const that = this;
    api.getUserHelpHistory({
      hideLoading: true,
      zeroTaskId: this.data.baseInfo.zeroTaskId,
      pageNum: this.zlUserListPageNum,
      pageSize: 20,
    }, res => {
      const { data = {} } = res
      this.zlUserListHasNextPage = data.nextPage
      if (this.zlUserListPageNum === 1) {
        this.setData({
          zlUserList: data.list || []
        })
      } else {
        this.setData({
          zlUserList: this.zlUserList.push(...data.list)
          // [`zlUserList[${index}].isRedeem`]: item.isRedeem,
        })
      }
    }, err => {
      console.log(err)
    })
  },
  getTaskSkuList() {
    api.getTaskSkuList({
      pageSize: 20,
      pageNum: 1,
      hideLoading: true,
    }, res => {
      this.setData({
        taskSkuList: res.data.list || []
      })
    }, err => {
      console.log(err)
    })
  },
  getHistoryList() {
    api.getHistoryTask({
      pageNum: 1,
      pageSize: 30,
      hideLoading: true,
    }, res => {
      const list = res.data.list || []
      this.setData({
        historyTaskList: list
      })
      if (list.length && list.length > 1) {
        list.push(list[0])
        this.setData({
          // [`historyTaskList[${list.length}]`]: item.isRedeem,
          historyTaskList: list,
        })
        const that = this;
        this.timeInterbal = setInterval(() => {
          that.setData({
            currentIndex: that.data.currentIndex + 1
          })
          if (that.data.currentIndex === that.data.historyTaskList.length - 1) {
            setTimeout(() => {
              that.setData({
                currentIndex: 0
              })
            }, 2000)
          }
        }, 5000)
      }
    }, err => {
      console.log(err)
    })
  },
  startTask(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.taskSkuList[index]
    api.getZeroBoostTask({
      skuId: item.skuId
    }, res => {
      console.log(res);
      this.setData({
        startHasBoostPercent: res.data.hasBoostPercent,
        showGetSuccessPopup: true,
      })
      this.refresh()
    }, err => {
      console.log(err)
    })
  },
  startCountDown() {
    const that = this;
    this.countManager && this.countManager.clear();

    this.countManger = new CountManger({
      times: 1000,
      dataList: [{}],
      set() {
        const leftTime = that.localEndTime - new Date()
        // 倒计时在一天以内
        if (leftTime > 0) {
          this.start();
        } else {
          that.setData({
            showCountDown: false,
          })
        }
      },
      callback() {
        const localLeftTime = that.localEndTime - Date.now();
        if (localLeftTime > 0) {
          that.setData({
            showCountDown: true,
            countDownInfo: formatLeftTimeObj(localLeftTime),
          })
        } else {
          that.setData({
            showCountDown: false,
          })
          this.clear();
        }
      },
    });
  },
  clearCountDown() {
    if (this.timeInterbal) {
      clearInterval(this.timeInterbal)
    }
    if (this.countManger) {
      this.countManger.clear();
      this.countManger = null;
    }
  },
  switchTab(e){
    const { index } = e.currentTarget.dataset;
    this.setData({
      showTab: parseInt(index),
    })
  },
  hidePopup(type){
    switch (type.detail){
      case 'start':
        this.setData({
          showStartPopup: false,
        })
        break;
      case 'success':
        this.setData({
          showSuccessPopup: false,
        })
        break;
      case 'fail':
        this.setData({
          showFailPopup: false,
        })
        break;
      case 'get-success':
        this.setData({
          showGetSuccessPopup: false,
        })
        break;
      case 'rules':
        this.setData({
          showRulePopup: false,
        })
        break;
      case 'exchangeSuccess':
        this.setData({
          showExchangeSuccess: false,
        })
        break;
      case 'newuser':
        this.setData({
          showNewUserPopup: false,
        })
        break;
    }
  },
  showRules(){
    this.setData({
      showRulePopup: true,
    })
  },
  goLink(e) {
    const { id } = e.currentTarget.dataset
    this.forward('detail2', { id })
  },
  // 获取首页广告模块数据
  getIndex() {
    // this.setData({})
    api.getZlV2Data({
      scope: this,
      weights: 1,
    }, (res) => {
      wx.hideLoading();
      const { info = {} } = res.data;
      const newModules = this.getModules(res);
      this.setData({
        modules: newModules,
      }, () => {
        //
      });
    }, (err) => {});
  },
  exchangeProduct(){
    api.doTaskConvert({
      skuId: this.data.baseInfo.taskSkuInfo && this.data.baseInfo.taskSkuInfo.skuId,
      zeroTaskId: this.data.baseInfo.zeroTaskId,
    }, res => {
      this.dontShowPopup = true;
      const { data = {} } = res.data;
      this.setData({
        showSuccessPopup: false,
        exchangeSuccessObj: {
          value: data.value,
          title: data.title,
          sub_title: data.sub_title,
          date: data.date,
          redirectUrl: data.redirectUrl,
        },
        showExchangeSuccess: true,
      })
      this.refresh()
    }, err => {

    })
  }
});
