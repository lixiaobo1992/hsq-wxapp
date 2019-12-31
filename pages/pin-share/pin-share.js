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

import CountManger from '../../utils/CountManger';
import formatNum from '../../utils/formatNum';
import { formatCountDown } from '../../utils/dateUtil';
import backHome from '../../components/back-home/index';

let nowUserPage;
let coupleCountLimit;
let coupleJoinCount;
let nowShowList; // 当前展示的头像
let nowResList; // 一共存在的头像列表
let params;

xPage({
  ...mixins,
  ...pullList,
  ...backHome,
  data: {

    isLoading: true,

    isShowGoHome: false,
    shareInfo: true,
    isJoin: 1,
    status: 1,
    countLimit: 2,
    joinCount: 1,
    listMode: 'card',
    list: [],
    lowerThreshold: 300,
    showSelect: false,
    amountNum: 1,
    joinEventId: '',
    jumpAppData: '',
    sceneData: 1001,

    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    })
  },
  onLoad(query) {
    this.onPageInit(query);

    params = {
      pinEventId: query.id || '1423',
      // pinEventId: id,
    };
    let storageObj = wx.getStorageSync('globalData');
    // 看到这样的代码，没时间优化
    this.setData({
      pageParams: params,
      jumpAppData: `haoshiqi://com.doweidu/couplesinvite?pinEventId=${params.pinEventId}`,
      sceneData: storageObj.sceneData || 1001
    });

    this.postMessage('order-list', {
      needRefresh: true,
    });
  },

  onShow() {
    this.refresh();
  },
  refresh() {
    this.updateGoHomeStatus();
    coupleCountLimit = 2;
    coupleJoinCount = 1;
    nowShowList = [];
    nowResList = [];

    this.getCoupleShareDetail();
    params.pageNum = 1;
    nowUserPage = 1;

    if (this.data.leftTime > 0 && this.data.status === 1) {
      this.countDown();
    }
  },
  onAuthSuccess() {
    this.refresh();
  },
  getCoupleShareDetail() {
    wx.showLoading();
    const tempParams = Object.assign({}, this.data.pageParams, { scope: this, weights: 1 })
    api.coupleShareDetail(tempParams, (res) => {
      console.log(res,"detail-------detail------detail");
      const { data } = res;
      const skuInfo = data.skuInfo || {};
      const selectItem = {
        thumbnail: skuInfo.thumbnail,
        price: skuInfo.groupPrice,
        id: data.skuId,
        left: skuInfo.left_stock,
        list: skuInfo.attrKeys,
        pinId: data.pinActivitiesId,
      }

      let leftTime = 1;
      let stateUrl = '';
      if (data.status !== 1) {
        if (data.status === 2) {
          stateUrl = 'https://img1.haoshiqi.net/miniapp/group_sc_1a1ed234f9.png';
        } else {
          stateUrl = 'https://img1.haoshiqi.net/miniapp/group_fl_12af7b3a48.png';
        }
      }
      if (data.endTime <= res.timestamp) {
        leftTime = 0;
      }
      this.setData({

        isLoading: false,

        selectData: selectItem,
        status: data.status, // 1:拼团中，2：拼团成功，3：拼团失败，
        isJoin: data.isJoin,
        isOwner: data.isOwner,
        countLimit: data.countLimit,
        joinCount: data.joinCount,
        stateUrl,
        title: data.title,
        endTime: data.endTime,
        timestamp: res.timestamp,
        leftTime,
        params: {
          pinEventId: params.pinEventId,
          pinActivitiesId: data.pinActivitiesId,
          skuId: data.skuId,
        },
        pinId: data.pinActivitiesId,
        shareInfo: {
          title: data.shareInfo.wechat.title,
          desc: data.shareInfo.wechat.content,
          imageUrl: data.shareInfo.wechat.thumbnail,
          piwikAction: 'c_share',
          piwikData:{
            link:data.stateUrl,
          }
        },
        btnState: this.dealBtnState(data.isOwner, data.isJoin, data.status, skuInfo.left_stock, skuInfo.enabled),
        fastJoinInfo: data.fastJoinList || {},
        orderId: data.order_id || ''
      });
      if (skuInfo && skuInfo.pinActivitiesTitle) {
        this.setData({
          // isJoin: true,//0：加入别人的团,1：自己开的团
          picList: skuInfo.skuPics,
          pThumbnail: skuInfo.thumbnail,
          pTit: skuInfo.pinActivitiesTitle,
          pPrice: (skuInfo.groupPrice * 0.01).toFixed(2),
          pAmount: skuInfo.restrictionAmount || 0,
          pMarketPrice: (skuInfo.marketPrice * 0.01).toFixed(2),
          pSinglePrice: (skuInfo.single_price * 0.01).toFixed(2),
          // pBatchTit: skuInfo.batch && skuInfo.batch.name,
          // pBatch: skuInfo.batch && skuInfo.batch.batch,
          pId: skuInfo.skuId,
          pDescription: skuInfo.description,
          leftStock: skuInfo.left_stock,
          online: skuInfo.enabled,
        });
      }
      if (leftTime > 0 && data.status === 1 && !this.countDownManger) {
        this.countDown();
      }
      if (data.fastJoinList && data.fastJoinList.totalCnt) {
        this.fastJoinCountDown(data.fastJoinList.list, res.timestamp);
      }

      this.getCoupleRecommend();
      this.getUserList(params);
    }, (err) => {
      // console.log(err);
    });
  },
  // 处理按钮文案、事件、下边距
  dealBtnState(owner, join, status, stock, online) {
    let paddingBottom; // 下边距
    let btnEvent; // 事件
    let desc; // 文案
    if (owner == 1 || join == 1) { // 团员进入拼团中页面
      if (status == 1) {
        // paddingBottom = '40';
        // btnEvent = 'onShareAppMessage';
        // desc='邀请好友拼团';
      } else if (status == 2) {
        paddingBottom = '20';
        btnEvent = 'goIndex';
        desc = '去首页查看更多好货';
      } else {
        if (stock > 0 && online) {
          paddingBottom = '30';
          btnEvent = 'creatNow';
          desc = '再次发起拼团';
        } else {
          paddingBottom = '30';
          btnEvent = 'goIndex';
          desc = '去首页查看更多好货';
        }
      }
    } else {
      if (status == 1) {
        paddingBottom = '30';
        btnEvent = 'joinNow';
        desc = '立即参团';
        xmini.piwikEvent('c_joinbtn2',{
          pinEventid:this.data.joinEventId,
        });
      } else if (status == 2) {
        if (stock > 0 && online) {
          paddingBottom = '30';
          btnEvent = 'creatNow';
          desc = '我也要开团';
        } else {
          paddingBottom = '30';
          btnEvent = 'goIndex';
          desc = '去首页查看更多好货';
        }
      } else {
        if (stock > 0 && online) {
          paddingBottom = '30';
          btnEvent = 'creatNow';
          desc = '我来当团长';
        } else {
          paddingBottom = '30';
          btnEvent = 'goIndex';
          desc = '去首页查看更多好货';
        }
      }
    }
    return {
      paddingBottom,
      btnEvent,
      desc
    }
  },
  getCoupleRecommend() {
    wx.showLoading();
    api.getCoupleList({
      needPagination: 0,
      pageNum: 1,
      pageLimit: 6,
    }, (res) => {
      // wx.hideLoading();
      const { data } = res;
      const pinList = this.dealList(data.list);
      this.setData({
        list: pinList,
      });
    }, (err) => {
      return true;
    });
  },
  dealList: function (list) {
    return mapTo(list, (item,index) => {
      return {
        id: item.pinActivitiesId,
        title: item.coupleTitle,
        image: item.skuPic,
        priceObj: {
          rmb: 1,
          price: item.couplePrice,
          marketPrice: item.marketPrice,
        },
        tags: item.tags.splice(0,2) || [],
        inStock: item.inStock,
        onLine: item.onLine,
        merchantType: item.merchant_type,
        expired_date_text: item.expired_date_text_two,
        piwikName:'c_pdr2',
        piwikData:{
          index,
          pinActivitiesId:item.pinActivitiesId,
        },
      };
    });
  },
  // 获取头像列表
  getUserList(params1) {
    api.coupleUserList(params1, (res) => {
      coupleCountLimit = res.data.countLimit; // 拼团总人数
      coupleJoinCount = res.data.joinCount; // 当前参团人数
      nowResList = [...nowResList, ...res.data.list]; // 当前加载过的头像
      nowShowList = [...nowResList]; // 当前展示的列表
      if (res.data.list.length < 10 && nowShowList.length < coupleCountLimit) {
        let length;
        if ((coupleCountLimit - nowShowList.length) > 10) {
          length = 10 - res.data.list.length;
        } else {
          length = coupleCountLimit - nowShowList.length;
        }
        const addRobotLength = new Array(length);
        nowResList = [...nowResList, ...addRobotLength];
        nowShowList = [...nowResList];
      }
      this.setData({
        showUserList: [...nowShowList],
      });
      this.showMoreAndLess();
    }, (err) => {
      // console.log(err);
    });
  },
  // 控制显示和隐藏的按钮
  showMoreAndLess() {
    let showMore;
    let showLess;
    if (nowShowList.length >= coupleCountLimit) {
      showMore = false;
    } else {
      showMore = true;
    }
    if (nowShowList.length > 10) {
      showLess = true;
    } else {
      showLess = false;
    }
    this.setData({
      showMore,
      showLess,
    });
  },
  // 加载更多
  showMoreUser() {
    let length;
    const flag = nowShowList.length < nowResList.length;
    // 拼团人数大于现在展示的人数
    if (nowShowList.length < coupleJoinCount) {
      // 展示的人数小于加载过的人数，这时不用请求
      if (flag) {
        if ((nowResList.length - nowShowList.length) > 10) {
          length = 10;
        } else {
          length = nowResList.length - nowShowList.length;
        }
        nowShowList = nowResList.slice(0, nowShowList.length + length);
      } else {
        // 展示人数 >= 加载的人数 这时要加载
        params.pageNum = nowUserPage + 1;
        nowUserPage += 1;
        this.getUserList(params);
      }
    } else if (flag) {
      if (nowResList.length - nowShowList.length) {
        length = 10;
      } else {
        length = nowResList.length - nowShowList.length;
      }
      nowShowList = nowResList.slice(0, nowShowList.length + length);
    } else {
      if (coupleCountLimit - nowShowList.length) {
        length = 10;
      } else {
        length = coupleCountLimit - nowShowList.length;
      }
      const addRobotLength = new Array(length);
      nowResList = [...nowResList, ...addRobotLength];
      nowShowList = [...nowResList];
    }
    this.showMoreAndLess();
    this.setData({
      showUserList: [...nowShowList],
    });
  },
  // 隐藏
  showLessUser() {
    const { length } = nowShowList;
    if (length <= 10) {
      return;
    } else {
      nowShowList = nowShowList.slice(0, length - 10);
    }
    this.showMoreAndLess();
    this.setData({
      showUserList: [...nowShowList],
    });
  },
  // 快速参团倒计时
  fastJoinCountDown(list = [], timestamp) {
    const that = this;
    const diffTime = Date.now() - timestamp * 1000;
    this.fastJoinCountManger = new CountManger({
      times: 1000,
      dataList: list,
      set() {
        const localEndTime = this.data.endTime * 1000 + diffTime;
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
            [`fastJoinInfo.list[${this.index}].countDown`]: `剩 ${formatCountDown(leftTimes)} 结束`,
          });
        } else {
          this.clear();
          that.setData({
            [`fastJoinInfo.list[${this.index}].disabled`]: true,
          });
        }
      },
    })
  },
  countDown() {
    const that = this;
    const diffTime = (this.data.timestamp * 1000) - (+new Date());
    const localEndTime = (this.data.endTime * 1000) + diffTime;

    this.countDownManger = new CountManger({
      times: 1000,
      dataList: [{}], // this.data.leftTime,
      set() {
        if (localEndTime - new Date() > 0) {
          this.start();
        } else {
          that.setData({
            leftTime: 0,
          });
        }
      },
      callback() {
        const leftTime = localEndTime - new Date();
        if (leftTime > 0) {
          const countDownInfo = formatNum(leftTime, true);
          countDownInfo.mark = ':';
          that.setData({
            countDownInfo,
          });
        } else {
          const countDownInfo = formatNum(0, true);
          countDownInfo.mark = ':';
          that.setData({
            countDownInfo,
          });
          this.clear();
        }
        console.log();
      },
    });
  },
  goDetail() {
    xmini.piwikEvent('c_pdddetail');
    this.forward('detail', {
      id: this.data.pinId,
    });
  },
  goIndex() {
    xmini.piwikEvent('c_morepd');
    // wx.addSPM(wx.getSPM());
    wx.switchTab({
      url: '../index/index',
    });
  },
  // 参团
  joinNow(e) {
    xmini.piwikEvent('c_joinicon');
    const fastJoinStatus = e.currentTarget.dataset.status || '';
    const fastJoinId = e.currentTarget.dataset.id || '';
    const { status, params } = this.data;
    if (fastJoinId && fastJoinStatus) {
      if (fastJoinStatus != 1) {
        return;
      }
      this.showSelect(fastJoinId);
      // this.forward('order-commit', {
      //   skuId: params.skuId,
      //   pinActivitiesId: params.pinActivitiesId,
      //   pinEventId: fastJoinId,
      // });
    } else {
      if (status !== 1 || this.data.isJoin === 1) {
        return;
      }
      this.showSelect(params.pinEventId);
      // this.forward('order-commit', {
      //   skuId: params.skuId,
      //   pinActivitiesId: params.pinActivitiesId,
      //   pinEventId: params.pinEventId,
      // });
    }
  },
  // 当团长
  creatNow() {
    const { status } = this.data;
    if (status === 2) {
      xmini.piwikEvent('拼团分享点击我也要开团');
    } else if (status === 3) {
      xmini.piwikEvent('拼团分享点击我来当团长');
    }
    this.showSelect();
    // this.forward('order-commit', {
    //   skuId: params.skuId,
    //   pinActivitiesId: params.pinActivitiesId,
    // });
  },
  onHide() {
    coupleCountLimit = 2;
    coupleJoinCount = 1;
    nowShowList = [];
    nowResList = [];
    this.clearPageData();
  },
  onUnload() {
    this.clearPageData();

  },
  clearPageData() {
    if (this.fastJoinCountManger) {
      this.fastJoinCountManger.clear();
    }
    if (this.countDownManger) {
      this.countDownManger.clear();
    }
  },
  goRule() {
    xmini.piwikEvent('c_rule');
    this.forward('rule');
  },
  goOrderDetail(e) {
    const orderId = e.currentTarget.dataset.orderid;
    xmini.piwikEvent('c_pdd',{
      pinActivitiesId:orderId,
    });

    if (!this.verifyAuth()) return

    this.forward('order-detail', { id: orderId, });
  },

  verifyAuth() {
    const { logged, userInfo } = this.data;
    const pageComponent = this.selectComponent('#dwd-page-pin-share');
    if (!logged) {
      // 显示登录弹窗
      pageComponent.setData({
        isShowLoginPopup: true
      });
      return false
    }
    return true;
  },
  onTapNext(e) {
    const {
      id,
      online,
      instock
    } = e.currentTarget.dataset;

    this.forward('detail', {
      id,
    });
  },
  toOrderCommit() {
    const selectData = this.data.selectData;
    xmini.piwikEvent('c_invitebtn',{
      pinActivitiesId:selectData.pinId,
    });
    if (!this.verifyAuth()) return
    this.forward('order-commit', {
      skuId: selectData.id,
      pinActivitiesId: selectData.pinId,
      pinEventId: this.data.joinEventId,
      amount: this.data.amountNum,
      orderType: 3,
    });
  },
  showSelect(id) {
    this.numInput(this.data.amountNum)
    this.setData({
      joinEventId: id,
      showSelect: true
    })
  },
  closeSelect() {
    this.setData({
      showSelect: false
    })
  },
  goNext(e) {
    const { id, type, index } = e.currentTarget.dataset;
    const left = this.data.selectData.left
    const amountNum = this.data.amountNum

    switch (type) {
      case 'reduce':
        if (amountNum > 1) {
          this.numInput(amountNum - 1)
        } else {
          wx.showToast("亲，至少买1件吧！")
        }
        break;
      case 'increase':
        if (amountNum < 100) {
          if (amountNum <= left - 1) {
            this.numInput(amountNum + 1)
          }
        }
        break;
      default:
        // do nothing...
        break;
    }
  },
  numInput(e) {
    let num
    if (typeof (e) == "number") {
      num = e
    } else {
      num = e.detail.value
    }
    let left = this.data.selectData.left
    num = parseInt(num)

    if (num > 100) {
      num = 100
    } else if (num == 0) {
      if (left > 1) {
        this.setData({
          amountNum: 1
        })
        wx.showToast('亲，至少买1件吧！')
        return
      }  else if (left < 1) {
        this.setData({
          amountNum: 0
        })
        return
      }
    } else if (num > left) {
      num = left;
    }
    if (left < 1) {
      num = 0
      wx.showToast("没库存了")
    } else if (left > 0 && left < num) {
      num = left
    } else if (num == 0) {
      num = 1
      wx.showToast('亲，至少买1件吧！')
    }
    if (this.data.amountNum == num) {
      this.setData({
        amountNum: 0
      })
      this.setData({
        amountNum: num
      })
    } else {
      this.setData({
        amountNum: num
      })
    }
  },
  launchAppError(e){
    console.log(e.detail,"监听App唤起错误")
  }
});
