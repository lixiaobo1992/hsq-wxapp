import {
  xmini,
} from '../../config/xmini';
Component({
  properties: {
    didShowCitySelection: {
      type: Boolean,
      value: false
    }
  },
  data: {
    // 这里是一些组件内部数据
  },
  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached: function () {
    const { addresses, zones, addressInfo } = xmini.store.state.location;
    this.setData({
      addresses: addresses,
      zones: zones,
      currentCity: addressInfo,
      swipeIndex: 0
    });
  },
  moved: function () {

  },
  detached: function () {

  },
  methods: {
    //选择地址
    onSelectingNewCity() {
      this.onCityView();
      this.triggerEvent("onSelectingNewCity");
    },

    //关闭地址选择
    onCityView() {
      const { addressInfo } = xmini.store.state.user;
      if (this.data.didShowCitySelection) {
        this.setData({
          currentCity: addressInfo,
          didShowCitySelection: false,
          swipeIndex: 0,
        });
      }
    },

    //选择其它地址
    onChooseOthers(event) {
      this.setData({
        swipeIndex: 1 - this.data.swipeIndex,
      });
    },

    onChangeSwiperIndex(event) {
      if (event.detail.source == "touch") {
        this.setData({
          swipeIndex: event.detail.current,
        });
      }
    },

  }
})