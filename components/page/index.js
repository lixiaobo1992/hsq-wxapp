import { baseComponent } from '@xmini/wxapp-component-base';
// content-class 内容的样式 custom-class 外框的样式
import {
  me,
  xmini,
} from '../../config/xmini';
import api from '../../api/index.js';
import authMixin from '../../utils/authMixin';
import {
  clone
} from '../../utils/index';
const app = getApp();
baseComponent({
  classes: ['content-class'],
  props: {
    isLoading: {
      type: Boolean,
      value: true,
    },
    isForceAuth: { // 是否是强制授权
      type: Boolean,
      value: false,
    },
    isShowLogin: {
      type: Boolean,
      value: true,
    },
    isShowPhone: {
      type: Boolean,
      value: true,
    },
  },
  data: {
    isShowLoginPopup: false,
    isShowPhonePopup: false,

    isShowError: false,

    type: '',
    title: '',
    content: '页面出现了一点小问题，重新加载看看~',
    btnText: '点我重试'
  },
  watch: {
    isShowLogin(newVal, oldVal) {
      let isShowLoginPopup = false
      if (newVal && !oldVal) {
        isShowLoginPopup = true;
      }
      if (!newVal && oldVal) {
        isShowLoginPopup = false;
      }
      this.setData({
        isShowLoginPopup
      })
    }
  },
  computed: {

  },
  beforeCreate() {
    console.log('beforeCreate', this);
    // console.log('beforeCreate', this.getPage());
    // this.$tmepPage = this.getPage();
    // console.log('this.$tmepPage:', this.$tmepPage)
    // this.$tmepPage.dwdPageComponent = this;
  },
  created() {
    // console.log('created');
    // console.log(this.$page);
    this.$page.dwdPageComponent = this;

    const { isForceAuth = false } = this.data;
    const { logged, userInfo, isRefuseUserAuth, isRefusePhoneAuth } = xmini.store.state.user
    const that = this;
    // !!! 这里是自动登录的逻辑
    // 未登录
    if (!logged) {
      // 判断当前用户有没有拒绝过用户授权(拒绝状态只用于保活内)
      if (!isRefuseUserAuth || isForceAuth) {
        // 获取用户有没有受过权
        wx.getSetting({
          success(res) {
            console.log('wx.getSetting:',res.authSetting)
            // 判断权限
            if (res.authSetting['scope.userInfo']) {
              // 获取用户信息
              that.updatedAuthCode((code) => {
                wx.getUserInfo({
                  withCredentials: true, //
                  success(res1) {
                    console.log('wx.getUserInfo:', res1)
                    that.popupLogin(2, res1);
                  },
                  fail(err) {
                    // 显示登录弹窗
                    that.setData({
                      isShowLoginPopup: true,
                    })
                  }
                })
              })
            } else {
              // 更新code
              that.updatedAuthCode()
              // 显示登录弹窗
              if (!isForceAuth) return
              that.setData({
                isShowLoginPopup: true,
              })
            }
          }
        })
      } else {

      }
    } else {
      // 已登录，没有授权过手机号
      // if ((logged && !userInfo.authPhone && !isRefusePhoneAuth) || (isForceAuth && !userInfo.authPhone && !isRefusePhoneAuth)) {
      //   this.setData({
      //     isShowPhonePopup: true,
      //   })
      // }
    }

  },
  mounted() {
    console.log('reday');
  },
  methods: {
    ...authMixin, // 很重要
    getUserInfo(res) {
      // 登录前，先清除下之前登录相关的缓存数据
      app.clearUserInfo();
      xmini.store.dispatch('setUserInfo', {})

      const detail = res.detail;
      console.log(detail)
      if (detail.errMsg == 'getUserInfo:ok') {
        console.log('xxxx')
        // 用户同意了授权
        xmini.store.dispatch('setIsRefuseUserAuth', false)
        // 登录
        wx.showLoading({
          title: '登录中...',
        })
        this.popupLogin(1, detail);
      } else {
        // 失败！
        if (detail.errMsg === 'getUserInfo:fail auth deny' || detail.errMsg === 'getUserInfo:fail:auth deny') {
          // 获取用户信息授权失败，展示引导
          // 用户拒绝了授权
          xmini.store.dispatch('setIsRefuseUserAuth', true)
          if (this.data.isForceAuth) return;
          this.setData({
            isShowLoginPopup: false
          })
        }
      }
    },

    popupLogin(tag, detail) {
      // 更新code 并登录
      // this.updatedAuthCode((code) => {
        this.postLogin({
          data: {
            code: this.authCode,
            encryptedData: encodeURIComponent(detail.encryptedData),
            iv: encodeURIComponent(detail.iv),
          },
          success: loginRes => {
            //
            console.log(loginRes);
            // 登录成功回调 调用页面事件
            this.$emit('onAuthSuccess', loginRes)
            // const { authPhone = false } = loginRes.data;
            // let isShowPhonePopup = false;
            // if (!authPhone) {
            //   isShowPhonePopup = true;
            // }
            this.setData({
              // isShowPhonePopup,
              isShowLoginPopup: false
            })
          },
          fail: loginErr => {
            wx.hideLoading();
            const { isForceAuth = false } = this.data;
            if (tag == 1 || isForceAuth) {
              wx.showToast(loginErr.errmsg);
            }
            if (isForceAuth) {

              this.setData({
                // isShowPhonePopup,
                isShowLoginPopup: true
              })
            }
          }
        });
      // });
    },

    getPhoneNumber(e) {
      console.log('getPhoneNumber:', e)
      if (e.detail.errMsg == 'getPhoneNumber:ok') {
        // 更新code 解析手机号
        this.updatedAuthCode((code) => {
          wx.showLoading();
          api.userAuthPrepose({
            type: 2,
            code: this.authCode,
            encryptedData: encodeURIComponent(e.detail.encryptedData),
            iv: encodeURIComponent(e.detail.iv),
          }, (res) => {
            this.setData({
              isShowPhonePopup: false
            })
            let userInfo = clone(xmini.store.state.user.userInfo)
            userInfo.authPhone = true;
            xmini.store.dispatch('setUserInfo', userInfo)
            xmini.store.dispatch('setIsRefusePhoneAuth', false)
          }, (err) => {
            console.log(err);
          })
        })
      } else {
        // 判断是否 未强制授权页
        if (this.data.isForceAuth) return;
        xmini.store.dispatch('setIsRefusePhoneAuth', true)
        this.setData({
          isShowPhonePopup: false
        })
      }
      // if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {

      // }

    },
    closePopup(e) {
      let popupType;
      if(e){
        popupType = e.currentTarget.dataset.popupType;
      }
      // console.log(popupType);
      // 判断是否 未强制授权页
      if (this.data.isForceAuth && popupType !='phone') return;
      // 用户拒绝了授权
      // 手动关掉的
      if (e) {
        let actionName = 'setIsRefuseUserAuth'
        if (popupType == 'phone') {
          actionName = 'setIsRefusePhoneAuth'
        }
        xmini.store.dispatch(actionName, true)
      }

      this.setData({
        isShowPhonePopup: false,
        isShowLoginPopup: false,
      })
    },

    // 按钮事件
    errorBtnEvent() {
      // if (this.data.isShowError) {

      // }
      // this.setData({
      //   isShowError: false,
      // })
      this.$emit('onRefresh')
    }
  },
})
