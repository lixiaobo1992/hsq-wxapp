
// 获取对象
export function getModel (obj, key) {
  if (obj && obj[key]) {
    if (obj[key] instanceof Object) {
      return obj[key];
    } else {
      return null;
    }
  } else {
    return null;
  }
}
// 获取数组
export function getArray (obj, key) {
  if (obj && obj[key]) {
    if (obj[key] instanceof Array) {
      return obj[key];
    } else {
      return new Array(obj[key]);
    }
  } else {
    return [];
  }
}
// 获取字符串直接用来页面展示
export function getString (obj, key) {
  if (obj && obj[key]) {
    if (typeof (obj[key]) === 'string') {
      return obj[key];
    } else {
      return obj[key] + '';
    }
  } else {
    return '';
  }
}
// 获取Int值进行数据判断
export function getInt (obj, key) {
  if (obj && obj[key]) {
    if (typeof (obj[key]) === 'number') {
      return obj[key];
    } else {
      const temp = parseInt(obj[key], 10);
      if (temp === 'NaN') {
        return 0;
      }
      return temp;
    }
  } else {
    return 0;
  }
}
// 获取Boolean值进行数据判断
export function getBoolean (obj, key) {
  if (obj && obj[key] && obj[key]!='0' ) {
    return true
  } else {
    return false;
  }
}

export function getNumber(obj, key){
  let returnValue = 0;
  if (obj && obj[key]) {
    if (typeof (obj[key]) === 'number') {
      returnValue = obj[key];
    } else {
      const temp = parseFloat(obj[key]);
      if (temp === 'NaN') {
        returnValue = 0;
      } else {
        returnValue = temp;
      }
    }
    return returnValue;
  } else {
    // return '0';
    return 0;
  }
}
// 获取价格进行直接显示
export function getPrice (obj, key) {
  const price = getNumber(obj, key)
  if (typeof price === 'string') {
    return price
  }
  return getPriceValue(price);
}
export function getPriceValue (value) {
  if (value) {
    value = value.toFixed(2) + '';

    let endStr = value.substr(value.length - 3, value.length);
    if (endStr === '.00') {
      value = value.substr(0, value.length - 3);
    }
    endStr = value.substr(value.length - 1, value.length);
    if (endStr === '0') {
      const pos = value.lastIndexOf('.');
      if (pos > 0 && pos + 3 === value.length) {
        value = value.substr(0, value.length - 1);
      }
    }
    return value;
  } else {
    return '0';
  }
}


// 获取周
export function getWeek (value) {
  const tt = new Date(value)
  const arr = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return arr[tt.getDay()]
}

export function getWeek1(value) {
  const tt = new Date(value)
  const arr = ['日', '一', '二', '三', '四', '五', '六']
  return arr[tt.getDay()]
}
