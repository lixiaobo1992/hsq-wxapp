
// 此页面作为一个权限检测页面
import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import mixins from '../../utils/mixins';

// import { limitUserInfo } from '../../utils/limitTip';

const app = getApp();

xPage({
  ...mixins,
  data: {
    // content: '正在登录中...',
    // cantry: false,
    authCode: 0
  },
  onLoad(query) {
    // wx.alert({
    //   title: JSON.stringify(query),
    // });
    this.onPageInit(query);
  },

  onShow() {

    const that = this
    wx.login({
      success(auth) {
        if (auth.code) {
          that.setData({
            authCode: auth.code
          })
        }
      }
    })
  },
  onUnload() {

    // 页面被关闭时
    // app.checkAuth();
  },
  sendRefreshMessage() {
    const { ref, needRefresh } = this.pageQuery;
    if (ref && needRefresh) {
      this.postMessage(ref, {
        needRefresh: true,
      });
    }
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
        code: this.data.authCode,
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

  login(data) {
    api.login({
      type: 2,
      ...data,
    }, (res) => {
      const { data } = res;
      const userId = data.user_id;
      // data.userId = userId;
      xmini.piwikUpdate({
        isTrackWorking: true,
        userId: data.user_id || '',
        openId: data.wechat_open_id || '',
      });
      if (userId) {
        this.sendRefreshMessage();
        // this.setData({
        //   content: '登录成功!',
        //   cantry: false,
        // });
        // 更新store
        xmini.store.dispatch('setUserInfo', data)
        console.log('登录成功');
      } else {
        wx.showToast('用户登录信息有误，请重新登录');
        // this.setData({
        //   content: '用户登录信息有误!',
        //   cantry: true,
        // });
      }
      this.loginBack();
      xmini.store.dispatch('setAddresses');
    }, (err) => {
      this.setData({
        content: `登录失败! ${err.errmsg}`,
        cantry: true,
      });
      // this.loginBack();
      return true;
      // console.log(err);
    });
  },
  loginBack() {
    setTimeout(() => {
      wx.navigateBack();
    }, 800);
  },
  goHome() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
  // goLogin() {
  //   // 登录前，先清除下之前登录相关的缓存数据
  //   app.clearUserInfo();
  //   this.getAuth((data) => {
  //     // res = {
  //     //   authErrorScopes: {},
  //     //   authSuccessScopes: [],
  //     //   authCode: '',
  //     // }
  //     this.login(data);
  //   }, (err) => {
  //     // console.log(err);
  //     const step = parseInt(this.data.step || 2, 10);
  //     this.back(step > 1 ? step : null);
  //   });
  // },
  // getAuth(resolve, reject) {
  //   const that = this;
  //   wx.login({
  //     success(auth) {
  //       if (auth.code) {
  //         wx.getUserInfo({
  //           withCredentials: true,
  //           lang: 'zh_CN',
  //           success(res) {
  //             console.info(res);
  //             resolve({
  //               code: auth.code,
  //               // userInfo: res.userInfo,
  //               encryptedData: encodeURIComponent(res.encryptedData),
  //               iv: encodeURIComponent(res.iv),
  //             });
  //             console.log(res);
  //           },
  //           fail(err = {}) {
  //             wx.hideLoading();
  //             // {errMsg: "getUserInfo:fail auth deny"}
  //             if (err.errMsg === 'getUserInfo:fail auth deny') {
  //               // 获取用户信息授权失败，展示引导
  //               wx.showModal({
  //                 ...limitUserInfo.warning,
  //                 confirmText: '开启',
  //                 cancelText: '取消',
  //                 success(res) {
  //                   if (res.confirm) {
  //                     wx.showErrPage({
  //                       ...limitUserInfo.tips,
  //                       type: 'limit',
  //                     });
  //                   } else if (res.cancel) {
  //                     console.log('用户点击取消');
  //                     that.back();
  //                   }
  //                 }
  //               });
  //               that.setData({
  //                 content: `${limitUserInfo.tips.title}，${limitUserInfo.tips.content}`,
  //                 cantry: false,
  //               });
  //             } else {
  //               wx.showToast(err.errMsg);
  //               that.loginBack();
  //             }
  //           },
  //         });
  //       } else {
  //         wx.hideLoading();
  //         wx.showToast('未获取到授权码');
  //       }
  //     },
  //     fail(err) {
  //       wx.hideLoading();
  //       // console.log(err);
  //       // wx.alert({
  //       //   title: 'err: ' + JSON.stringify(err),
  //       // });
  //       const message = '获取授权失败，请重新授权';
  //       wx.showToast(message);
  //       reject(message);
  //     },
  //   });
  // },
});
