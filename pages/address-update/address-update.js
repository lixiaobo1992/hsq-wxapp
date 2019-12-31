// pages/address-update/address-update.js
import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import mixins from '../../utils/mixins';
import { isMobile } from '../../utils/is'
// const app = getApp();

const citys = {};
const districts = {};

xPage({
  ...mixins,
  data: {
    address: {
      addressId: null,
      contacter: '',
      mobile: '',
      province: '',
      provinceId: '',
      city: '',
      cityId: '',
      district: '',
      districtId: '',
      detailAddress: '',
    },
    oldMobile: '',
    addrIndex: [0, 0, 0],
    showAddrSelect: false,
    curtProvince: [],
    curtCity: [],
    curtDistrict: [],
    isFromOrder: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (query) {
    this.onPageInit(query);

    if (query.id) {
      const address = {
        addressId: query.id,
        provinceId: query.province_id,
        cityId: query.city_id,
        districtId: query.district_id,
        detailAddress: query.detail_address,
      };
      Object.assign(address, query);
      this.setData({
        address,
        oldMobile: address.mobile,
      });
      wx.setNavigationBarTitle({
        title: '修改地址'
      });
    } else {
      wx.setNavigationBarTitle({
        title: '添加地址'
      });
    }

    if (query.orderAddress) {
      this.setData({
        isFromOrder: true,
      });
    }

    if (this.data.curtProvince.length === 0) {
      this.ajaxProvinceList();
      this.ajaxCityList(2);
    }
  },

  onShow() {
  },

  onUnload() {
    xmini.store.dispatch('setAddresses');

  },

  /**
   * 刷新消息
   */
  sendRefreshMessage() {
    const { ref, needRefresh } = this.pageQuery;
    if (ref && needRefresh) {
      this.postMessage(ref, {
        needRefresh: true,
      });
    }
  },

  bindInput(e) { // 获取input值
    const name = e.currentTarget.id;
    const { value } = e.detail;
    const address = Object.assign({}, this.data.address, { [name]: value });
    this.setData({
      address,
    });
  },

  showAddrSelect() { // 地址选择框显示、影藏
    this.setData({
      showAddrSelect: !this.data.showAddrSelect,
    });
  },

  bindPickerChange(e) { // 滚动监听
    const addrIndex = e.detail.value;
    // console.log(addrIndex);
    if (addrIndex[0] !== this.data.addrIndex[0]) {
      this.provinceChange(addrIndex[0]);
    }

    if (addrIndex[1] !== this.data.addrIndex[1]) {
      this.cityChange(addrIndex[1]);
    }

    this.setData({
      addrIndex,
    });
  },

  provinceChange(index) { // 改变省
    const id = 'id';
    const provinceId = this.data.curtProvince[index][id];
    if (!citys[provinceId]) {
      this.ajaxCityList(provinceId);
    } else {
      const cityId = citys[provinceId][0][id];
      this.setData({
        curtCity: citys[provinceId],
        curtDistrict: districts[cityId],
      });
    }
  },

  cityChange(index) { // 改变城市
    const id = 'id';
    const cityId = this.data.curtCity[index][id];
    if (!districts[cityId]) {
      this.ajaxDistrictList(cityId);
    } else {
      this.setData({
        curtDistrict: districts[cityId],
      });
    }
  },

  ajaxProvinceList() { // 请求省列表
    api.provinceList({}, (res) => {
      // console.log(res.data);
      this.setData({
        curtProvince: res.data.list,
      });
    }, (err) => {
      // console.log(err);
    });
  },

  ajaxCityList: function (id) { // 请求城市列表
    api.cityList({ provinceId: id }, (res) => {
      // console.log(res.data);
      const cityListArr = res.data.list;
      citys[id] = cityListArr;
      const cityId = 'id';
      this.setData({
        curtCity: cityListArr,
      });
      this.ajaxDistrictList(cityListArr[0][cityId]);
    }, (err) => {
      // console.log(err);
    });
  },

  ajaxDistrictList(id) { // 请求区域列表
    api.districtList({ cityId: id }, (res) => {
      // console.log(res.data);
      districts[id] = res.data.list;
      this.setData({
        curtDistrict: res.data.list,
      });
    }, (err) => {
      // console.log(err);
    });
  },

  selectCommit() { // 确定修改城市
    const [addrIndex, curtProvince, curtCity, curtDistrict] =
      [this.data.addrIndex,
      this.data.curtProvince,
      this.data.curtCity,
      this.data.curtDistrict,
      ];

    const province = 'province';
    const id = 'id';
    const city = 'city';
    const district = 'district';
    const addr = {
      province: curtProvince[addrIndex[0]][province],
      provinceId: curtProvince[addrIndex[0]][id],
      city: curtCity[addrIndex[1]][city],
      cityId: curtCity[addrIndex[1]][id],
      district: curtDistrict[addrIndex[2]][district],
      districtId: curtDistrict[addrIndex[2]][id],
    };

    this.setData({
      address: Object.assign({}, this.data.address, addr),
    });
    this.showAddrSelect();
  },

  checkSubmitData() { // 检查提交数据
    const formData = Object.assign({}, this.data.address);
    if (!formData.contacter) {
      wx.showToast({
        title: '请填写姓名！'
      });
      return;
    }
    if (formData.addressId && this.data.oldMobile === formData.mobile) {
      delete formData.mobile;
    } else if (!formData.mobile || !isMobile(formData.mobile)) {
      wx.showToast({
        title: '请填写正确的手机号！'
      });
      return;
    }
    if (!formData.province) {
      wx.showToast({
        title: '请选择区域！'
      });
      return;
    }
    if (!formData.detailAddress) {
      wx.showToast({
        title: '请填写详细地址！'
      });
      return;
    }
    this.editAddress(formData);
  },

  editAddress(params) { // 提交数据
    // 有更新收获地址信息，回到上页刷新数据
    this.sendRefreshMessage();
    if (params.addressId) {
      api.updateAddress(params, (res) => {
        // console.log(res.data);
        if (res.errno === 0) {
          wx.showToast({
            title: '修改地址成功'
          });
          xmini.store.dispatch('setAddresses');
          setTimeout(()=>{
            wx.navigateBack();
          }, 1000);
        }
      }, (err) => {
        // console.log(err);
      });
    } else {
      api.addAddress(params, (res) => {
        // console.log(res.data);
        if (res.errno === 0) {
          if (this.data.isFromOrder) {
            xmini.store.dispatch('setOrderCommitAddress', res.data);
          }
          wx.showToast({
            title: '添加地址成功'
          });
          xmini.store.dispatch('setAddresses');
          setTimeout(() => {
            wx.navigateBack();
          }, 1000);
        }
      }, (err) => {
        // console.log(err);
      });
    }
  },

  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  }
});
