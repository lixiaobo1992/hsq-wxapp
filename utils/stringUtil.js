
function stringify(params = {}) {
  const temp = params;
  const arr = [];
  for (const key in params) {
    if (!temp[key]) {
      delete temp[key];
    } else {
      arr.push(`${key}=${temp[key]}`);
    }
  }
  return arr.join('&');
}

function Trim(str, is_global) {
  var result;
  result = str.replace(/(^\s+)|(\s+$)/g, '');
  if (is_global && is_global.toLowerCase() == 'g') {
    result = result.replace(/\s/g, '');
  }
  return result;
}

function getQueryString(url, name) { // 获取URL参数
  if (!url) {
    return null;
  }
  const reg = new RegExp('(^|)' + name + '=([^&]*)');
  const r = url.match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

// 字符串截取
function addPoint(value, length) {
  if (value.length > length) {
    return value.substr(0, length - 1) + '...'
  } else {
    return value
  }
}

const mini = {
  Trim,
  addPoint,
  stringify,
  getQueryString,
};

module.exports = mini;

