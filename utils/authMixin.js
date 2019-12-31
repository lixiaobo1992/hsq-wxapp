
import {
  me,
  xmini,
} from '../config/xmini';
import api from '../api/index';
import {
  clone
} from '../utils/index';
const app = getApp();

module.exports = {
  authCode: 0,
  // 登录的逻辑
  updatedAuthCode(callback) {
    const that = this
    wx.login({
      success(auth) {
        if (auth.code) {
          console.log('auth code :', auth);
          that.authCode = auth.code;
          callback && callback.call(that, auth.code)
        }
      }
    })
  },
  // 获取用户信息
  getUserInfo(res) {
    // 登录前，先清除下之前登录相关的缓存数据
    app.clearUserInfo();
    xmini.store.dispatch('setUserInfo', {})
    xmini.store.dispatch('setAddresses', []);
    console.log(res)

    const detail = res.detail;
    console.log(detail)
    if (detail.errMsg == 'getUserInfo:ok') {
      console.log('xxxx')
      // this.updatedAuthCode((code) => {

        wx.showLoading({
          title: '登录中...',
        })
        this.postLogin({
          data: {
            code: this.authCode,
            // userInfo: res.userInfo,
            encryptedData: encodeURIComponent(detail.encryptedData),
            iv: encodeURIComponent(detail.iv),
          },
          success: loginRes => {
            //更新code
            this.updatedAuthCode();

            wx.hideLoading();
          },
          fail: loginErr => {
            //
            wx.showToast(loginErr.errmsg)
          }
        });
      // })
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
    if (e.detail.errMsg == 'getPhoneNumber:ok') {
      // 更新code 解析手机号
      // this.updatedAuthCode((code) => {
        wx.showLoading();
        // console.log('authCode:', this.authCode)
        api.userAuthPrepose({
          type: 2,
          code: this.authCode,
          encryptedData: encodeURIComponent(e.detail.encryptedData),
          iv: encodeURIComponent(e.detail.iv),
        }, (res) => {
          //更新code
          this.updatedAuthCode();

          let userInfo = clone(xmini.store.state.user.userInfo)
          userInfo.authPhone = true;
          xmini.store.dispatch('setUserInfo', userInfo)
          xmini.store.dispatch('setAddresses');
        }, (err) => {
          //更新code
          this.updatedAuthCode();
          console.log(err);
        })
      // })
    } else {
      //
    }
    // if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {

    // }

  },

  postLogin({ data = {}, success, fail }){
    const that = this;
    api.login({
      isLoading: false,
      type: 2,
      ...data,
    }, (res) => {
      const { data } = res;
      const userId = data.user_id;

      // 更新code
      that.updatedAuthCode()
      // data.userId = userId;
      if (userId) {
        console.log('登录成功');
        xmini.piwikUpdate({
          isTrackWorking: true,
          userId: data.user_id || '',
          openId: data.wechat_open_id || '',
        });

        // data.authPhone=false; //!!test
        // 更新store
        xmini.store.dispatch('setUserInfo', data)
        success && success.call(that, res);
      } else {
        wx.showToast('用户登录信息有误，请重新登录');
        fail && fail.call(that, res);
      }
      //更新收货地址
      xmini.store.dispatch('setAddresses');
    }, (err) => {
      // 更新code
      that.updatedAuthCode()

      //更新收货地址
      xmini.store.dispatch('setAddresses');

      fail && fail.call(that, err);
      return true;
    });
  },
  // 更新登录
  updatedLogin({ success, fail}) {

    const that = this;
    // 获取 用户是否授过权
    wx.getSetting({
      success(res) {
        console.log(res.authSetting)
        // 判断权限
        if (res.authSetting['scope.userInfo']) {
          // 获取login code
          that.updatedAuthCode((code) => {
            console.log(code);
            // 获取用户信息
            wx.getUserInfo({
              success(res) {
                // console.log(res);
                // 登录
                that.postLogin({
                  data: {
                    code,
                    encryptedData: encodeURIComponent(res.encryptedData),
                    iv: encodeURIComponent(res.iv),
                  },
                  success: res => {
                    console.log(res);
                    success && success(res);
                  },
                  fail: err => {
                    // console.log(err);
                    fail && fail(err);
                  }
                })
              },
              fail(err) {
                fail && fail(err);
              }
            })
            // end
          })
          // end
        }
        // 判断权限 end
      }
    })
  },
};

