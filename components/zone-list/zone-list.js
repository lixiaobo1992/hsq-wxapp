// components/zone-list.js
import {
  xmini,
} from '../../config/xmini';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    arrowHidden: {
      type: Boolean,
      value: false
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached: function () {
    const { zones } = xmini.store.state.location;
    this.setData({
      zones: zones,
    });
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //选择地址
    onSelecting(event) {
      const { addressInfo } = xmini.store.state.location;
      let oldCity = addressInfo;
      let city = event.currentTarget.dataset.city;
      if (oldCity.currentAddress != city.currentAddress) {
        xmini.store.dispatch('setAddressInfo', city);
        //this.triggerEvent("onSelectingNewCity");
      }
      this.triggerEvent("onSelectingNewCity");
    },
  }
})
