

//获得对象的key
export function getObjKeys(obj) {
  if (obj !== Object(obj)) throw new TypeError('Invalid object');
  var keys = [];
  for (var key in obj)
    if (Object.prototype.hasOwnProperty.call(obj, key))
      keys[keys.length] = key;
  return keys;
}

/**
 * 从数组中生成指定长度的组合
 * 方法: 先生成[0,1...]形式的数组, 然后根据0,1从原数组取元素，得到组合数组
 */
export function combInArray(aData) {
  if (!aData || !aData.length) {
    return [];
  }

  var len = aData.length;
  var aResult = [];

  for (var n = 1; n < len; n++) {
    var aaFlags = getCombFlags(len, n);
    while (aaFlags.length) {
      var aFlag = aaFlags.shift();
      var aComb = [];
      for (var i = 0; i < len; i++) {
        aFlag[i] && aComb.push(aData[i]);
      }
      aResult.push(aComb);
    }
  }

  return aResult;
}


/**
 * 得到从 m 元素中取 n 元素的所有组合
 * 结果为[0,1...]形式的数组, 1表示选中，0表示不选
 */
export function getCombFlags(m, n) {
  if (!n || n < 1) {
    return [];
  }

  var aResult = [];
  var aFlag = [];
  var bNext = true;
  var i, j, iCnt1;

  for (i = 0; i < m; i++) {
    aFlag[i] = i < n ? 1 : 0;
  }

  aResult.push(aFlag.concat());

  while (bNext) {
    iCnt1 = 0;
    for (i = 0; i < m - 1; i++) {
      if (aFlag[i] == 1 && aFlag[i + 1] == 0) {
        for (j = 0; j < i; j++) {
          aFlag[j] = j < iCnt1 ? 1 : 0;
        }
        aFlag[i] = 0;
        aFlag[i + 1] = 1;
        var aTmp = aFlag.concat();
        aResult.push(aTmp);
        if (aTmp.slice(-n).join("").indexOf('0') == -1) {
          bNext = false;
        }
        break;
      }
      aFlag[i] == 1 && iCnt1++;
    }
  }
  return aResult;
}


