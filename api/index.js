
import {
  xmini,
} from '../config/xmini';
import env from '../config/env';
import { MY_APPID } from '../config/index';
import { modelApis, commonParams, headers } from './api.config';
import request from './request';
import { compact } from '../utils/base/object';
import { storage } from '@xmini/x-mini/lib/index';

// console.log('============== api index.js:');
const version = '4.0.0';

let userInfo = storage.get('userInfo') || {};
// let uuid = storage.get('uuid') || '';
// console.log('userInfo:', userInfo);
// 公共参数
headers.init({
  // token: getToken(),
  // userId: userInfo.userId || '', // 用户唯一标志
});
// 9779dabbec4c9f30ee2f34e4e07b30cf 10860912
// 41f83388e388218fa1afe1ce5d841b4b 10742171
commonParams.init({
  token: userInfo.token,
  uid: userInfo.user_id,
  zoneId: '857',  // 当前收货省份
  uuid: userInfo.user_id,       // 用户唯一标志
  udid: '',       // 设备唯一标志
  timestamp: '',  // 时间
  channel: 'wxapp', // 渠道
  // cpsName: '',    // 废弃
  spm: 'hsq_wxapp',
  v: version,  // 系统版本，用于获取最新版数据
  terminal: 'wxapp',// 系统版本，用于获取最新版数据
  device: '',     // 设备
  swidth: '',     // 屏幕宽度
  sheight: '',    // 屏幕高度
  /* eslint appx/no-appx-globals: 0 */
  location: '',   // 地理位置
  net: '',        // 网络
  appid: MY_APPID,
  appId: MY_APPID,
});

const regHttp = /^https?/i;
const apiList = Object.keys(modelApis).reduce((api, key) => {
  const val = modelApis[key];
  const [url, methodType = 'GET'] = val.split(/\s+/).reverse();
  const method = methodType.toUpperCase();
  api[key] = function postRequest(params, success, fail) {
    // url
    const originUrl = regHttp.test(url)
      ? url
      : `${env.apiBaseUrl}${url}`;

    // weights 接口权重 0没有 1
    const { isLoading = true, weights = 0, scope } = params;
    delete params.isLoading;
    delete params.weights;
    delete params.scope;

    const temp = compact(Object.assign({}, commonParams.get(), xmini.getChannel(), params));
    // console.log(JSON.stringify(temp));
    const header = headers.get();
    return request.call((scope || null), {
      weights,
      isLoading,

      url: originUrl,
      method,
      header,
      options: temp,
      success,
      fail,
    })

  };
  return api;
}, {});

apiList.setCommonParams = commonParams.set;
apiList.getCommonParams = commonParams.get;
apiList.setHeader = headers.set;
apiList.getHeader = headers.get;

console.log(apiList)

module.exports = apiList;

