"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isDef = isDef;
exports.isObj = isObj;
exports.isNumber = isNumber;
exports.range = range;
exports.bem = bem;

function isDef(value) {
  return value !== undefined && value !== null;
}

function isObj(x) {
  const type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isNumber(value) {
  return /^\d+$/.test(value);
}

function range(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

const PREFIX = 'dwd-';

function join(name, mods) {
  name = PREFIX + name;
  mods = mods.map(function (mod) {
    return name + '--' + mod;
  });
  mods.unshift(name);
  return mods.join(' ');
}

function traversing(mods, conf) {
  if (!conf) {
    return;
  }

  if (typeof conf === 'string' || typeof conf === 'number') {
    mods.push(conf);
  } else if (Array.isArray(conf)) {
    conf.forEach(function (item) {
      traversing(mods, item);
    });
  } else if (typeof conf === 'object') {
    Object.keys(conf).forEach(function (key) {
      conf[key] && mods.push(key);
    });
  }
}

function bem(name, conf) {
  const mods = [];
  traversing(mods, conf);
  return join(name, mods);
} // const size = '12';
// const required = false;
// const border = false;
// const isLink = true;
// const clickable = true;
// const center = true;
// const res = bem('cell', [size, { center, required, borderless: !border, clickable: isLink || clickable }])
// console.log(res);