// import { MY_APPID } from './index';
// import { version } from '../app.json';
// import {
//   me,
//   xmini,
// } from '../config/xmini';
// import { storage } from '@xmini/x-mini/lib/index';
import { stringify } from '../utils/stringUtil';

function noop() {
  console.error('异常流程，不应该进入这里');
}

// 跨域设置默认好像已经设定
const defaultOptions = {
  // silent
  method: 'GET',   // 使用的HTTP动词，GET, POST, PUT, DELETE, HEAD
  url: '',         // 请求地址，URL of the request
  header: {
    // Accept: 'application/json',
    // 'content-type': 'application/json' // 默认值
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  dataType: 'json',
  // data: '',
  mode: 'cors',           // 请求的模式，主要用于跨域设置，cors, no-cors, same-origin
  timeout: 30000,
  credentials: 'include', // 是否发送Cookie omit, same-origin
  // redirect // 收到重定向请求之后的操作，follow, error, manual
  // integrity // 完整性校验
  // cache: 'default', // 缓存模式(default, reload, no-cache)
};

function request({
  weights = 0,
  isLoading = true,

  url,
  method,
  header,
  options = {},
  success = noop,
  fail = noop,
}) {

  const scope = this;

  // 思考 这里会覆盖 header 需要修改 暂时不会有问题
  const newOptions = Object.assign({}, defaultOptions);
  newOptions.url = url;
  newOptions.header = {
    ...newOptions.header,
    ...header,
  };

  // 请求方式
  newOptions.method = (method || 'GET').toUpperCase();

  newOptions.data = options;
  if (newOptions.method === 'GET') {
    newOptions.header['Content-Type'] = 'application/json; charset=utf-8';
    newOptions.data = options;
  } else if(newOptions.method === 'POST') {
    // 我们的 post 请求，使用的这个，不是 application/json
    newOptions.header['Content-Type'] = 'application/x-www-form-urlencoded';
    newOptions.data = `${stringify(options)}`;
  }

  const resolve = (data) => {
    isLoading && wx.hideLoading();
    // 请求成功时 当前接口为关键接口，隐藏错误页
    if (weights) {
      if (scope && scope.pageName) {
        if (scope.dwdPageComponent && scope.dwdPageComponent.data.isShowError) {
          scope.dwdPageComponent.setData({
            isShowError: false,
          })
        }
      }
    }
    if (typeof success === 'function') {
      success(data);
    }
  };

  const reject = (err = {}) => {
    isLoading && wx.hideLoading();
    if (typeof fail === 'function' && fail(err)) {
      return;
    }
    const {
      errmsg = '抢购火爆，稍候片刻!',
      errno = 'err',
      type = '',
    } = err;
    if (errno === 510010) {
      const { pageName } = wx.$getPageInfo();
      wx.goPage('login', {
        ref: pageName,
        needRefresh: true,
      });
    } else if (weights) {
      scopeError({
        type,
        errorMessage: errmsg,
      });
    } else {
      // {errMsg: "request:fail timeout"}
      // {errMsg: "request:fail "}
      const message = `${errno}: ${errmsg}`;
      wx.showToast(errmsg);
      console.log('errmsg:', message);
    }
  };

  function scopeError(err = {}) {
    isLoading && wx.hideLoading();
    setTimeout(() => {
      // console.log('scope:', scope);
      if (scope && scope.pageName) {
        if (scope.dwdPageComponent) {
          scope.dwdPageComponent.setData({
            isShowError: true,
            type: err.type || '',
            title: '',
            content: err.errorMessage || '网络不给力，请检查你的网络设置~',
            btnText: '点我重试'
          }, () =>{
            scope.setData({
              isLoading: false,
            })
          })
        } else {
          scope.setData({
            isLoading: false,
          })
        }
      }
    }, 0)
  }

  if (isLoading) {
    wx.showLoading();
  }

  // console.log('newOptions:', newOptions)
  wx.request(Object.assign({}, newOptions, {
    // url, // 目标服务器 url
    success: (res = {}) => {
      // console.log('success:', res);
      res.status = res.statusCode;
      // console.timeEnd(url);
      // console.group('api:');
      // console.log(`请求 ${url} ${res.status}`);
      // console.info(res);
      // console.groupEnd('api');
      let { status, data = {} } = res;
      // status = 503
      if (status >= 200 && status < 399) {
        res.ok = true;
        if (data.errno === 0) {
          resolve(data);
        } else {
          // console.log('err:', data);
          reject(data);
        }
      }else if (status >= 400) {
        // my.showErrPage('抢购火爆,稍候片刻!');
        // if (weights) {
        //   scopeError({type: 'net'});
        // } else {
          reject({
            errmsg: '抢购火爆，稍候片刻！',
            errno: 'err',
          });
        // }
      } else {
        // 小程序未处理过的错误
        console.log('fetch 异常:', res);
        reject({
          errmsg: '抢购火爆，稍候片刻！',
          errno: 'err',
        });
      }
    },
    fail: (err = {}) => {
      // console.timeEnd(url);
      // 小程序处理过的错误
      console.log('fail:', err);
      // err: {
      //   error: 12,
      //   errorMessage: '',
      // }
      // wx.alert({
      //   title: 'err: ' + JSON.stringify(err),
      // });
      if (err.status >= 400) {
        // 这里会跳错误页
        // my.showErrPage('抢购火爆,稍候片刻!');
        // if (weights) {
        //   scopeError({type: 'net'});
        // } else {
          reject({
            errmsg: '抢购火爆，稍候片刻！',
            errno: 'err',
          });
        // }
        return;
      }
      reject({
        type: 'net',
        errno: err.error,
        errmsg: '网络不给力，请检查你的网络设置~'//err.errMsg,
      });
    },
    complete: () => {

    },
  }));

}

module.exports = request;

