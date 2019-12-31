
import api from '../../api/index'

import { storage } from '@xmini/x-mini/lib/index';
import { GD_MAP_AK } from '../../config/index';
// let userInfo = storage.get('userInfo') || {};
import { clone } from '../../utils/index';
// import user from './user'
import {
  xmini,
} from '../../config/xmini';

const defaultAddress = {
  "currentProvinceId": '857',
  "currentAddress": '上海 上海市',
  "addressId": null,
  "cityId": '857'
};
let addresses = [];
let zones = storage.get('zones') || [];

const defaultState = {

  addresses: addresses,           //收货地址
  zones: zones,                   //全国省份信息
  addressInfo: clone(defaultAddress),                    //当前地址信息
  fixedPosition: clone(defaultAddress),                 //需要的定位信息

  geoInfo: {}, // 定位信息
  locationState: {
    code: 1, // 1 定位中，2 定位成功， 3 定位失败
    text: '定位中...',
    time: 0,
  },
}
const mutations = {
  ['SET_LOCATION_INFO']: (state, address) => {
    console.log(address)
  },

  // 修改当前定位状态
  ['SET_LOCATED_STATE'](state, payload) {
    const { stateCode } = payload;
    let newState = '';
    let time = 0;
    switch (stateCode) {
      case 1: // 定位中...
        newState = '定位中...';
        time = 0;
        break;
      case 2: // 定位成功
        newState = '定位成功';
        time = new Date().getTime();
        break;
      case 3: // 定位失败
        newState = '定位失败';
        time = 0;
        break;
      default:
        newState = '定位中...';
        time = 0;
    }
    // state.locationStateCode = state
    const locationState = {
      code: stateCode,
      text: newState,
      time,
    };
    state.locationState = locationState;
  },
  // 修改定位信息
  ['SET_GEO_INFO'](state, payload) {
    const { geoInfo = {} } = payload;
    state.geoInfo = geoInfo;
    let currentAddress = geoInfo.province + ' ' + geoInfo.city
    state.fixedPosition = {
      currentProvinceId: geoInfo.provinceId,
      currentAddress: currentAddress,
      addressId: null,
      cityId: geoInfo.cityId ,
    }
  },
  ['SET_ADDRESSES'](state, address) {
    state.addresses = address;
  },
  ['SET_ZONES'](state, zones) {
    state.zones = zones;
  },
  ['SET_ADDRESS_INFO'](state, addressInfo) {
    api.setCommonParams({
      zoneId: addressInfo.currentProvinceId || '857',
      cityId: addressInfo.cityId || '857'
    })
    state.addressInfo = addressInfo;
  }
}

// let geoEvent;
// 定位请求队列
let geoEventList = [];
let isLocation;

const actions = {

  getGeo({ commit, state }, payload = {}) {
    console.log('location.js getGeo 进来了。。。')

    // 赋值 回调方法
    // geoEvent = payload;
    let index = -1;
    // 检查是否存在重复添加
    for (let i = 0; i < geoEventList.length; i++) {
      if (geoEventList[i]['name'] === payload.name) {
        index = i;
        break;
      }
    }
    // 删除重复订阅
    if (index !== -1) {
      geoEventList.splice(index, 1);
    }
    geoEventList.push(payload);
    // 如果有收货地址
    if(state.addresses.length) {
      if (geoEventList.length) {
        for (let i = 0; i < geoEventList.length; i++) {
          geoEventList[i]['hasLocation'].call(this);
        }
        geoEventList = [];
      }
      return;
    }

    // 判断 在此之前是否有定位
    if (!isLocation) {
      isLocation = true;
      commit({ type: 'SET_LOCATED_STATE', stateCode: 1 });

      getLocation({
        success: res => {
          // console.log('location.js',res)
          gdMapGeoInfo(res).then(res => {
            commit({ type: 'SET_LOCATED_STATE', stateCode: 2 });
            // console.log('逆地理编码 成功:', res);
            commit({ type: 'SET_GEO_INFO', geoInfo: res });

            if (geoEventList.length) {
              for (let i = 0; i < geoEventList.length; i++) {
                geoEventList[i]['success'].call(this, res);
              }
              geoEventList = [];
            }

          }, (err) => {
            console.log('解析失败', err);
            commit({ type: 'SET_LOCATED_STATE', stateCode: 3 });
            if (geoEventList.length) {
              for (let i = 0; i < geoEventList.length; i++) {
                geoEventList[i]['fail'].call(this, err);
              }
              geoEventList = [];
            }
          });
        },
        fail: err => {
          console.log('获取定位信息 失败:', err)
          commit({ type: 'SET_LOCATED_STATE', stateCode: 3 });
          if (geoEventList.length) {
            for (let i = 0; i < geoEventList.length; i++) {
              geoEventList[i]['fail'].call(this, err);
            }
            geoEventList = [];
          }

        },
      })

    } else {
      if (geoEventList.length) {
        for (let i = 0; i < geoEventList.length; i++) {
          geoEventList[i]['hasLocation'].call(this);
        }
        geoEventList = [];
      }
    }

  },
  // 修改用户地址
  setAddresses({ commit, state }, address) {
    if (address) {
      commit('SET_ADDRESSES', address);
      return;
    }
    if (!xmini.store.state.user.logged) {
      commit('SET_ADDRESSES', []);
    } else {
      prepareAddressList().then(res => {
        commit('SET_ADDRESSES', res);
      }).catch(err => {
        commit('SET_ADDRESSES', []);
      })
    }
  },
  getZones({ commit, state }) {
    if(state.zones.length) {
      return
    }
    api.provinceList({
      isLoading: false,
    }, (res) => {
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
      commit('SET_ZONES', resultsNew)
    }, (err) => {
      return true;
    });
  },
  setAddressInfo({ commit, state }, addressInfo) {
    commit('SET_ADDRESS_INFO', addressInfo);
  },
}

// 获取定位信息
function getLocation({ success, fail, complete }) {
  wx.getLocation({
    cacheTimeout: 300,
    success: (res) => {
      success && success(res)
    },
    fail: (err) => {
      fail && fail(err)
    },
    complete: (res) => {
      complete && complete(res);
    }
  });
}




// 根据高德地图定位的城市名，获取在本地缓存的城市列表中匹配，
// 将高德地图的cityCode转换为爱抢购cityId
//http://lbsyun.baidu.com/index.php?title=webapi/guide/webservice-geocoding-abroad
function gdMapGeoInfo(pos) {

  return new Promise(function(resolve, reject) {
    console.log('逆地址解析');
    wx.request({
      url: 'https://restapi.amap.com/v3/geocode/regeo',
      data: {
        key: GD_MAP_AK,
        location: pos.longitude + ',' + pos.latitude,
        output: 'json',
      },
      success: function (res) {
        const { regeocode } = res.data;
        console.log('逆地理编码数据:', res.data);
        const { addressComponent = {} } = regeocode;
        // console.log(addressComponent);
        // const { aMapId = '' } = geoInfo;
        let geoInfo = {}
        api.getCityId({
          aMapId: addressComponent.citycode,
          isLoading: false
        }, res => {
          geoInfo = res.data;
          resolve(geoInfo);
        }, err => {
          console.log(err);
          resolve(err);
        })

        // getCityList(result.cityCode, geoInfo, success, fail);
      },
      fail: function (res) {
        reject(res);
      },
    })

  });
}
function prepareAddressList() {
  return new Promise(function (resolve, reject) {
    api.addressList({
      isLoading: false
    }, (res) => {
      const results = res.data.list.slice(0, 10);
      let resultsNew = [];
      results.map(result => {
        let resultNew = {}
        let address = result.province + result.city + result.district + result.detail_address
        if (result.province == result.city) {
          address = result.city + result.district + result.detail_address
        }
        resultNew.currentProvinceId = result.province_id
        resultNew.currentAddress = address
        resultNew.addressId = result.id
        resultNew.cityId = result.city_id
        resultNew.isDefault = result.is_default
        resultsNew.push(resultNew)
      })
      resolve(resultsNew);
    }, (err) => {
      reject(err);
      return;
    });
  })
}






export default {
  state: defaultState,
  mutations,
  actions,
}
