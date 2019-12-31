"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compactObject = compactObject;
exports.filterObj = filterObj;
exports.stringify = stringify;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * 清除无效数据
 *
 * @param { Object } [object={}] 对象
 * @param { Array } [invalid=['', undefined, null]] 指定过滤数据
 * @returns { Object } Returns the new object of filtered values.
 */
// invalid = ['', undefined, null，0, false, NaN]
function compactObject() {
  var object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var invalid = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['', undefined, null];
  var result = {};

  for (var key in object) {
    if (!invalid.includes(object[key])) {
      result[key] = object[key];
    }
  }

  return result;
} // 过滤值，以及无效值


function filterObj(params, filters) {
  return Object.keys(params).reduce(function (obj, key) {
    if (filters[key] && ![undefined, null, ''].includes(params[key])) {
      obj[key] = params[key];
    }

    return obj;
  }, {});
}
/**
 * 处理参数
 *
 * @export
 * @param {any} params
 * @returns  { string }
 */


var defaults = {
  delimiter: '&',
  invalid: ['', undefined, null] // encode: true,
  // encoder: utils.encode,
  // encodeValuesOnly: false,
  // serializeDate: function serializeDate(date) {
  //   return toISO.call(date);
  // },
  // skipNulls: false,
  // strictNullHandling: false,

};

function stringify(params) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var opts = _objectSpread({}, defaults, options);

  var _opts$delimiter = opts.delimiter,
      delimiter = _opts$delimiter === void 0 ? defaults.delimiter : _opts$delimiter,
      _opts$invalid = opts.invalid,
      invalid = _opts$invalid === void 0 ? defaults.invalid : _opts$invalid;
  var result = [];
  params = compactObject(params, invalid);

  for (var key in params) {
    if ({}.hasOwnProperty.call(params, key)) {
      result.push("".concat(key, "=").concat(encodeURIComponent(params[key])));
    }
  }

  return result.join(delimiter);
}