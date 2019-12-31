

// 将正则提取出来，可以缓存编译，优化速度
const objRegExp = {
  email: /^(?:\w+\.?)*\w+@(?:\w+\.?)*\w+$/,
  passward: /^[a-zA-Z0-9]{6,20}$/,
  // mobile: /^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(17([0-1]|[6-8]))|(18([0-9])))\d{8}$/,
  mobile: /^(1[3-9][0-9])\d{8}$/,
  mobileCode: /^(\d{6}|\d{4})$/,
  passward1: /(.+){6,}/,
  chinese: /^[\u4e00-\u9fff]{0,}$/,
  english: /^[A-Za-z]+$/,
  zip: /^[1-9]\d{5}$/,
  num: /^\d+$/,
  cellPhone: /(^0{0,1}1[3|4|5|6|7|8][0-9]{9}$)/,
  IDCardNo: /^[A-Za-z0-9]+$/,
  englishAndSpace: /^([a-zA-Z ]+|[\u4e00-\u9fa5]+)$/,
  verifycode: /^[a-z0-9]{4,30}$/,
  // URL的一般格式为： scheme://host:port/path?query#fragment
  httpUrl: /^https+:\/\//,
};

export function isDef(value) {
  return value !== undefined && value !== null
}


export function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

export function isEmptyObject(obj) {
  if (isObject(obj)) {
    if (JSON.stringify(obj) === '{}') {
      return false
    }
  }
  return true
}

export function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

//
export function isMobile(text, reg) {
  /*
    130~139
    145、147
    15*（没有154）
    170、171、176、177、178
    180-189
  */
  // var reg = /^(1[3-8][0-9])\d{8}$/;
  const tempReg = reg || objRegExp.mobile;
  return tempReg.test(text);
}
export function isMobileCode (text, reg) {
  const tempReg = reg || objRegExp.mobileCode;
  return tempReg.test(text);
}


let lastClickTime = 0;

// 防止快速点击
export function isFastClick(){
  const time = new Date().getTime();
  if (time - lastClickTime < 1000) {
    return false;
  }
  lastClickTime = time;
  return true;
}
