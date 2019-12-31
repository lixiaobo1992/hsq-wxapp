"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isUndef = isUndef;
exports.isUnDef = isUnDef;
exports.isDef = isDef;
exports.isTrue = isTrue;
exports.isFalse = isFalse;
exports.isNumber = isNumber;
exports.isString = isString;
exports.isArray = isArray;
exports.isObject = isObject;
exports.isFunction = isFunction;
exports.hasOwn = hasOwn;
exports.isEmptyObject = isEmptyObject;
exports.looseEqual = looseEqual;
exports.isEqual = exports.isFn = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*!
 * 类型判断
 *
 * 整理参考
 * https://github.com/vuejs/vue/blob/dev/src/shared/util.js
 * https://github.com/enricomarino/is
 */

/**
 * 常用类型判断
 * 是否定义 字符串 数字 纯对象 空对象 数组 函数
 */
var objProto = Object.prototype;
var owns = objProto.hasOwnProperty;
var toString = objProto.toString; // 是否定义 value

function isUndef(v) {
  return v === undefined || v === null;
} // isUnDef(aa)


function isUnDef(v) {
  return v === 'undefined' || v === null;
}

function isDef(v) {
  return v !== 'undefined' && v !== null;
}

function isTrue(v) {
  return v === true;
}

function isFalse(v) {
  return v === false;
}

function isNumber(v) {
  return toString.call(v) === '[object Number]';
}

function isString(v) {
  return toString.call(v) === '[object String]';
}

function isArray(arr) {
  return Array.isArray(arr);
}

function isObject(v) {
  return v !== null && _typeof(v) === 'object' && Array.isArray(v) === false;
}

function isFunction(v) {
  var isAlert = typeof window !== 'undefined' && v === window.alert;

  if (isAlert) {
    return true;
  }

  var str = toString.call(v);
  return str === '[object Function]' || str === '[object GeneratorFunction]' || str === '[object AsyncFunction]';
}

var isFn = isFunction; // 对象自身属性中是否具有指定的属性

exports.isFn = isFn;

function hasOwn(obj, prop) {
  return owns.call(obj, prop);
}

function isEmptyObject(v) {
  return JSON.stringify(v) === '{}';
}
/**
 * looseEqual
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 *
 * @export
 * @param {*} a 比较值1
 * @param {*} b 比较值2
 * @returns {boolean} 布尔值
 */


function looseEqual(a, b) {
  if (a === b) return true;
  var isObjectA = isObject(a);
  var isObjectB = isObject(b);

  if (isObjectA && isObjectB) {
    try {
      var isArrayA = isArray(a);
      var isArrayB = isArray(b);

      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every(function (e, i) {
          return looseEqual(e, b[i]);
        });
      } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
      } else if (!isArrayA && !isArrayB) {
        var keysA = Object.keys(a);
        var keysB = Object.keys(b);
        return keysA.length === keysB.length && keysA.every(function (key) {
          return looseEqual(a[key], b[key]);
        });
      } else {
        /* istanbul ignore next */
        return false;
      }
    } catch (e) {
      /* istanbul ignore next */
      return false;
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b);
  } else {
    return false;
  }
}

var isEqual = looseEqual;
exports.isEqual = isEqual;