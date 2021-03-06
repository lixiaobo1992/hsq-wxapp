/**
 * object 操作
 *
 * @export
 * @param {*} obj
 * @returns
 */

import { isObject } from './is';

/**
 * 获取对象值
 *
 * @export
 * @param {*} obj = []
 * @returns Array
 */
export function values(obj = []) {
  let tempArray = [];
  if (isObject(obj)) {
    for (let key in obj) {
      tempArray.push(obj[key]);
    }
  }
  return tempArray;
}

export function compact(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'undefined') delete obj[key];
  }
  return obj;
}

const objectUtil = {
  values,
  compact,
};

export default objectUtil;
