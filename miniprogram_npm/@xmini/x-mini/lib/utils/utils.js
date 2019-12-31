"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.random = random;
exports.randomRange = randomRange;
exports.uuid = uuid;
exports.cached = cached;
exports.sleep = sleep;
exports.throttle = throttle;
exports.debounce = debounce;
exports.getPlainNode = getPlainNode;
exports.merge = merge;
exports.versionCompare = versionCompare;
exports.toArray = toArray;
exports.each = each;
exports.camelCase = exports.kebabCase = exports.upperFirst = exports.hyphenate = exports.randomString = void 0;

var _is = require("./is");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

// const hasOwnProperty = Object.prototype.hasOwnProperty;
// export function hasOwn(obj, key) {
//   return hasOwnProperty.call(obj, key);
// }
// export function mixin(...objs) {
//   return objs.reduce((dest, src) => {
//     for (var key in src) {
//       dest[key] = src[key];
//     }
//     return dest;
//   });
// }
// '_~0123456789' +
// 'abcdefghijklmnopqrstuvwxyz' +
// 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var randomString = '_~getRandomVcryp0123456789bfhijklqsuvwxzABCDEFGHIJKLMNOPQSTUWXYZ'; // https://github.com/ai/nanoid/blob/master/non-secure.js
// 指定范围，生成随机数

exports.randomString = randomString;

function random(size) {
  var result = [];

  while (0 < size--) {
    result.push(Math.floor(Math.random() * 256));
  }

  return result;
}

function randomRange(under, over) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * under + 1);

    case 2:
      return parseInt(Math.random() * (over - under + 1) + under);

    default:
      return 0;
  }
}

function uuid() {
  var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 21;
  var url = randomString;
  var id = '';
  var bytes = [];

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    bytes = crypto.getRandomValues(new Uint8Array(size)); // console.warn(':::uuid crypto:', bytes.join(','));
  } else {
    bytes = random(size); // console.warn(':::uuid random:', bytes.join(','));
  }

  while (0 < size--) {
    id += url[bytes[size] & 63];
  }

  return id;
}
/**
 * Create a cached version of a pure function.
 *
 * @export
 * @param {*} fn 传入函数
 * @returns { function } 返回函数
 */


function cached(fn) {
  var cache = Object.create(null);
  return function cachedFn(str) {
    var hit = cache[str];
    /* eslint no-return-assign: 0 */

    return hit || (cache[str] = fn(str));
  };
}

function sleep(timeout) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(timeout);
    }, timeout);
  });
}

function throttle(func, wait, options) {
  var _this = this;

  var context;
  var args;
  var result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};

  var later = function later() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);

    if (!timeout) {
      context = args = null;
    }
  };

  return function () {
    var now = Date.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = _this;

    for (var _len = arguments.length, rest = new Array(_len), _key = 0; _key < _len; _key++) {
      rest[_key] = arguments[_key];
    }

    args = rest;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      previous = now;
      result = func.apply(context, args);

      if (!timeout) {
        context = args = null;
      }
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }

    return result;
  };
}

function debounce(func, wait, immediate) {
  var _this2 = this;

  var timeout;
  var args;
  var context;
  var timestamp;
  var result;

  var later = function later() {
    var last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;

      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function () {
    context = _this2;

    for (var _len2 = arguments.length, rest = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      rest[_key2] = arguments[_key2];
    }

    args = rest;
    timestamp = Date.now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);

    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

function getPlainNode(nodeList) {
  var parentPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var arr = [];
  nodeList.forEach(function (node) {
    var item = node;
    item.path = "".concat(parentPath, "/").concat(item.path || '').replace(/\/+/g, '/');
    item.exact = true;

    if (item.children && !item.component) {
      arr.push.apply(arr, _toConsumableArray(getPlainNode(item.children, item.path)));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }

      arr.push(item);
    }
  });
  return arr;
} // 以下简单转化命名格式

/**
 * Camelize a hyphen-delimited string.
 * camelCase 小驼峰命名
 */


var camelizeRE = /-(\w)/g;
var camelize = cached(function (str) {
  /* eslint func-names: 0 */
  return str.replace(camelizeRE, function (_, c) {
    return c ? c.toUpperCase() : '';
  });
});
/**
 * Converts the first character of string to upper case.
 * 首字母大写
 */

var capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
/**
 * Hyphenate a camelCase string.
 * kebabCase 连字符命名 eg: kebab-case
 */

var hyphenateRE = /\B([A-Z])/g;
var hyphenate = cached(function (str) {
  return str.replace(hyphenateRE, '-$1').toLowerCase();
});
exports.hyphenate = hyphenate;
var upperFirst = capitalize;
exports.upperFirst = upperFirst;
var kebabCase = hyphenate;
exports.kebabCase = kebabCase;
var camelCase = camelize;
exports.camelCase = camelCase;

function merge(target) {
  for (var i = 1, j = arguments.length; i < j; i++) {
    var source = arguments[i] || {};

    for (var prop in source) {
      if (source.hasOwnProperty(prop)) {
        var value = source[prop];

        if (value !== undefined) {
          target[prop] = value;
        }
      }
    }
  } // console.log(arguments)
  // console.log(target, '==== merge')


  return target;
}
/**
 * 新版本返回 true
 *
 * @export
 * @param {*} newVersion 新版本
 * @param {*} oldVersion 老版本
 * @returns {boolean} 布尔值
 */


function versionCompare(newVersion, oldVersion) {
  var newVersionArr = newVersion.split('.');
  var oldVersionArr = oldVersion.split('.');

  for (var i = 0; i < newVersionArr.length; i++) {
    if (newVersionArr[i] > oldVersionArr[i]) {
      return true;
    }
  }

  return false;
}
/**
 * Convert an Array-like object to a real Array.
 *
 * @export
 * @param {*} list 类数组
 * @param {*} start 索引
 * @returns {array} 返回数组
 */


function toArray(list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);

  while (i--) {
    ret[i] = list[i + start];
  }

  return ret;
}

function each(arr, callback) {
  if ((0, _is.isArray)(arr)) {
    for (var i = 0, len = arr.length; i < len; i++) {
      if (callback(arr[i], i, arr) === false) break;
    }
  } else {
    for (var key in arr) {
      if (arr.hasOwnProperty(key)) {
        if (callback(arr[key], key, arr) === false) break;
      }
    }
  }
}