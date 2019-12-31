"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.storage = exports.Storage = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// 小程序的 storage 方法使用方式不完全一致，统一处理
var _ref = typeof my !== 'undefined' ? my : typeof wx !== 'undefined' ? wx : {},
    setStorage = _ref.setStorage,
    getStorageSync = _ref.getStorageSync,
    removeStorage = _ref.removeStorage,
    clearStorage = _ref.clearStorage,
    _getStorageInfo = _ref.getStorageInfo; // const noop = () => {};
// let inited;
// 数据都存在这里


var storageData = {}; // let me = {};
// wxapp 本地数据存储的大小限制为 10MB
// 把业务数据和系统数据分离

var i = 1;

var Storage =
/*#__PURE__*/
function () {
  function Storage() {
    var store = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'x-mini';
    var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 600;

    _classCallCheck(this, Storage);

    this.store = store || "store-".concat(i++);
    this._time = Number.isInteger(time) && time > 0 ? time : 600;
    var data = {};

    if (typeof my !== 'undefined') {
      // aliapp
      data = getStorageSync({
        key: this.store
      }).data || {};
    } else if (typeof wx !== 'undefined') {
      // wxapp
      data = getStorageSync(this.store) || {};
    }

    storageData[this.store] = data;
  }

  _createClass(Storage, [{
    key: "set",
    value: function set(key, value) {
      var time = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      // 单位秒，默认 10 分钟，-1表示一年
      if (!time) time = this._time;
      var timeout = Date.now() - 1 + time * 1000;
      console.log(timeout);
      var data = {
        value: value,
        timeout: timeout
      };
      Object.assign(storageData[this.store], _defineProperty({}, "".concat(key), data)); // console.log(JSON.stringify(storageData[this.store]));

      setStorage({
        key: this.store,
        data: storageData[this.store],
        success: function success(res) {
          console.log('数据缓存成功');
          console.log(res);
        }
      });
    }
  }, {
    key: "get",
    value: function get(key) {
      if (!key) return;
      var temp = storageData[this.store][key] || {}; // 缓存不存在

      if (!temp.timeout || !temp.value) return null;
      var now = Date.now();

      if (temp.timeout && temp.timeout < now) {
        // 缓存过期
        this.remove(key);
        return '';
      }

      return temp.value;
    }
  }, {
    key: "remove",
    value: function remove(key) {
      if (!key) return;
      delete storageData[this.store][key];
      setStorage({
        key: this.store,
        data: storageData[this.store],
        success: function success(res) {}
      }); // removeStorage({
      //   key,
      // });
    }
  }, {
    key: "clear",
    value: function clear(bool) {
      if (!(bool === true)) {
        storageData[this.store] = {};
        return removeStorage({
          key: this.store
        });
      } else {
        storageData = {};
        clearStorage();
      }
    }
  }, {
    key: "getStorageInfo",
    value: function getStorageInfo() {
      return _getStorageInfo();
    }
  }]);

  return Storage;
}();

exports.Storage = Storage;
var storage = new Storage();
exports.storage = storage;