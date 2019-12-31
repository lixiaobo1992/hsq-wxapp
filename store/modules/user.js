import { storage } from '@xmini/x-mini/lib/index';
import api from '../../api/index';
// import { sa } from '../../utils/shence.js';

// console.warn('=======store user.js api', api)
let userInfo = storage.get('userInfo') || {};

console.log(userInfo);
function isLogin(data = {}) {
  return !!(data.token && data.user_id);
}

// wx.getSetting({
//   success(res) {
//     console.warn(res.authSetting)
//   }
// })

export default {
  state: {
    userInfo: userInfo,
    logged: isLogin(userInfo),

    isRefuseUserAuth: false, // 用户是否拒绝用户信息授权了
    isRefusePhoneAuth: false, // 用户是否拒绝手机号授权了
    // loginStatus: {
    //   status: 0, // 0未登录，1登录中...，2登录成功!，3登录失败!
    //   statusText: '未登录', // 未登录，登录中...，登录成功!，登录失败1
    // }
  },
  mutations: {
    ['SET_USER_INFO'](state, userData){
      console.log('::::::::::::::::::更新用户信息', userData);
      state.userInfo = userData
      state.logged = isLogin(userData);
      console.log(state.logged)
      api.setCommonParams({
        token: (userData && userData.token) || '',
        uid: (userData && userData.user_id) || '',
        uuid: (userData && userData.user_id) || '',
      })

      storage.set('userInfo', userData)
      // sa.login(userData.user_id);
    },
    ['SET_IS_USER_AUTH_STATUS'](state, flag){
      state.isRefuseUserAuth = flag;
    },
    ['SET_IS_PHONE_AUTH_STATUS'](state, flag) {
      state.isRefusePhoneAuth = flag;
    },
  },
  actions: {
    // 修改用户信息
    setUserInfo({ commit, state }, userData) {
      console.log('::::::::::::::::::修改用户信息', userData);
      commit('SET_USER_INFO', userData)
    },
    setIsRefuseUserAuth({ commit, state }, flag) {
      commit('SET_IS_USER_AUTH_STATUS', flag)
    },
    setIsRefusePhoneAuth({ commit, state }, flag) {
      commit('SET_IS_PHONE_AUTH_STATUS', flag)
    },
  },
};
