import api from '../../api/index';
import {
  xmini,
  storage
} from '../../config/xmini';
let citys = {};                         //城市对象

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    arrowHidden: {
      type: Boolean,
      value: false
    },
    isSelectProvince: {
      type: Boolean,
      value: true
    },
    didShowCitySelection: {                 //是否显示选择地址弹窗
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentProvince: {},
    cityList: {},
    selectCity: {}
  },
  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached: function () {
    const { zones } = xmini.store.state.location;
    if(!zones.length) {
      this.getZones();
    } else {
      this.setData({
        zones: zones,
      });
    }
  },
  observers: {
    didShowCitySelection(nv) {
      if (!nv) {
        this.setData({
          currentProvince: {}
        })
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getZones() {
      api.provinceList({}, (res) => {
        const results = res.data.list;
        let resultsNew = [];
        results.map(result => {
          let resultNew = {}
          resultNew.currentProvinceId = result.id
          resultNew.currentAddress = result.province
          resultNew.addressId = null
          resultsNew.push(resultNew)
        })
        storage.set('zones', resultsNew, 86400 * 30)
        xmini.store.commit('SET_ZONES', resultsNew)
        this.setData({
          zones: zones,
        });
      }, (err) => {
        return true;
      });
    },
    //选择地址
    selectProvince(event) {
      // let oldCity = getApp().getData().addressInfo;
      let province = event.currentTarget.dataset.province;
      this.setData({
        currentProvince: province
      });
      this.triggerEvent('selectProvince', false);
      let provinceId = province.currentProvinceId + '';
      if (!citys[provinceId]) {
        this.getCityList(provinceId);
        return;
      }
      
      let cityList = citys[provinceId]
      this.setData({
        cityList
      });
    },
    // 获取当前省份城市列表
    getCityList(provinceId) {
      api.cityList({ provinceId }, (res) => {
        // console.log(res.data);
        const cityListArr = res.data.list;
        citys[provinceId] = cityListArr;
        this.setData({
          cityList: cityListArr,
        });
      }, (err) => {
        // console.log(err);
      });
    },
    cancelSelect() {
      if (this.data.currentProvince.currentAddress) {
        this.triggerEvent('selectProvince', true);
      }
    },
    selectCity(event) {
      let city = event.currentTarget.dataset.city;
      this.setData({
        selectCity: city
      })
      xmini.store.dispatch('setAddressInfo', { 
        "currentProvinceId": this.data.currentProvince.currentProvinceId, 
        "currentAddress": this.data.currentProvince.currentAddress + ' ' + city.city, 
        "addressId": null, 
        "cityId": city.id 
      });
      this.triggerEvent('selectCity');
    }
  }
})
