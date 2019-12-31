// import { storage } from '@xmini/x-mini/lib/core/storage';
// initial state
const defaultState = {
  address: {  // 地址ID 目前主要用于订单购买
    id: 0
  },
  currentCoupon: {}, //


  couponList: [], // 平台券

}

// mutations
const mutations = {
  ['SET_ORDER_COMMIT_ADDRESS'](state, address) {
    address.addressText = [address.province, address.city, address.district, address.detail_address].join('');
    state.address = address;
  },
  ['SET_COUPON_LIST'](state, couponList) {
    state.couponList = couponList;
  },
  ['SET_CURRENT_COUPON'](state, coupon) {
    state.currentCoupon = coupon;
  },
}

// actions
const actions = {
  setOrderCommitAddress({ commit }, address) {
    commit('SET_ORDER_COMMIT_ADDRESS', address);
  },
  setSelectCouponList({ commit }, couponList) {
    commit('SET_COUPON_LIST', couponList);
  },
  setCurrentCoupon({ commit }, coupon) {
    commit('SET_CURRENT_COUPON', coupon);
  },
}



export default {
  state: defaultState,
  actions,
  mutations
}
