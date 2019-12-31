import {
  xmini,
} from '../../config/xmini';
Component({
  properties: {
    didShowCitySelection: {
      type: Boolean,
      value: false
    },
    addresses: {
      type: Array,
    }
  },
  data: {
    isSelectProvince: true
    // 这里是一些组件内部数据
  },
  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached: function () {
    this.setDefaultAddr();
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
    //有默认收货地址时使用默认收货地址
    setDefaultAddr() {
      const appData = getApp().getData();
      const { addresses, addressInfo } = xmini.store.state.location;
      if (addresses.length) {
        let defaultAddr = addresses.find(addr => addr.isDefault);
        let oldCity = addressInfo;
        if (oldCity.currentAddress != defaultAddr.currentAddress) {
          xmini.store.dispatch('setAddressInfo', defaultAddr);
        }
      } else {        //没有默认收货地址时用定位地址
        const { fixedPosition } = xmini.store.state.location;
        xmini.store.dispatch('setAddressInfo', fixedPosition);
      }
    },
    //选择地址
    onSelectingNewCity(province) {
      this.triggerEvent("onSelectingNewCity");
      this.onCityView();
    },
    

    //关闭地址选择
    onCityView() {
      const { addressInfo } = xmini.store.state.location;
      if (this.data.didShowCitySelection) {
        this.setData({
          isSelectProvince: true,
          currentCity: addressInfo,
          didShowCitySelection: false,
          swipeIndex: 0,
        });
      }
      
    },

    //选择其它地址
    onChooseOthers(event) {
      this.setData({
        swipeIndex: 1,
      });
    },
    goBack() {
      const { swipeIndex, isSelectProvince } = this.data;
      if (swipeIndex && !isSelectProvince) {
        this.setData({
          isSelectProvince: true
        })
      } else {
        this.setData({
          swipeIndex: this.data.swipeIndex - 1,
          isSelectProvince: true
        });
      }
    },

    onChangeSwiperIndex(event) {
      if (event.detail.source == "touch") {
        this.setData({
          swipeIndex: event.detail.current,
        });
      }
    },
    selectProvince(event) {
      this.setData({
        isSelectProvince: event.detail
      })
    }

  }
})