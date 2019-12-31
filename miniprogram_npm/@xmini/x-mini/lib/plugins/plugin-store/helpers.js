"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapActions = exports.mapMutations = exports.mapState = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var mapState = normalizeNamespace(function (states) {
  var res = {};
  normalizeMap(states).forEach(function (_ref) {
    var key = _ref.key,
        val = _ref.val;

    res[key] = function mappedState() {
      var state = this.$store.state; // 3 处理 data 到这里使用页面的 $store

      this.$storeKey = Object.assign({}, this.$storeKey, _defineProperty({}, key, val));
      return typeof val === 'function' ? val.call(this, state) : state[val];
    };
  });
  return res;
});
exports.mapState = mapState;
var mapMutations = normalizeNamespace(function (mutations) {
  var res = {};
  normalizeMap(mutations).forEach(function (_ref2) {
    var key = _ref2.key,
        val = _ref2.val;

    res[key] = function mappedMutation() {
      // Get the commit method from store
      var commit = this.$store.commit;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return typeof val === 'function' ? val.apply(this, [commit].concat(args)) : commit.apply(this.$store, [val].concat(args));
    };
  });
  return res;
});
exports.mapMutations = mapMutations;
var mapActions = normalizeNamespace(function (actions) {
  var res = {};
  normalizeMap(actions).forEach(function (_ref3) {
    var key = _ref3.key,
        val = _ref3.val;

    res[key] = function mappedAction() {
      // get dispatch function from store
      var dispatch = this.$store.dispatch;

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return typeof val === 'function' ? val.apply(this, [dispatch].concat(args)) : dispatch.apply(this.$store, [val].concat(args));
    };
  });
  return res;
});
exports.mapActions = mapActions;

function normalizeNamespace(fn) {
  return function (map) {
    return fn(map);
  };
}
/**
 * Normalize the map
 * normalizeMap([1, 2, 3]) => [ { key: 1, val: 1 }, { key: 2, val: 2 }, { key: 3, val: 3 } ]
 * normalizeMap({a: 1, b: 2, c: 3}) => [ { key: 'a', val: 1 }, { key: 'b', val: 2 }, { key: 'c', val: 3 } ]
 * @param {Array|Object} map
 * @return {Object}
 */


function normalizeMap(map) {
  return Array.isArray(map) ? map.map(function (key) {
    return {
      key: key,
      val: key
    };
  }) : Object.keys(map).map(function (key) {
    return {
      key: key,
      val: map[key]
    };
  });
}