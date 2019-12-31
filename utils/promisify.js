
/**
 * 包装为 Promise 接口
 *
 * 注意：最后一个参数传入一个回调函数，当出现异常时，将错误信息作为第一个参数传给回调函数，如果正常，第一个参数为 null，后面的参数为对应其他的值。
 *
 * @param {any} fn 要包装的函数
 * @param {any} receiver 挂载
 */
function promisify(fn, receiver) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn.apply(receiver, [...args, (err, res) => {
        return err ? reject(err) : resolve(res)
      }])
    })
  }
}

// `delay`毫秒后执行resolve
export function delayTimer(delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(delay);
    }, delay);
  });
}

module.exports = promisify


/**
示例

var startDate = Date.now();
// 所有promise变为resolve后程序退出
Promise.all([
  delayTimer(1),
  delayTimer(32),
  delayTimer(64),
  delayTimer(128)
]).then((values) => {
  console.log(Date.now() - startDate + 'ms');
  // 約128ms
  console.log(values);    // [1,32,64,128]
});


var fs = require("fs");
var readFilePromise = promisify(fs.readFile, fs); //包装为 Promise 接口
readFilePromise("foo.json", "utf8").then((content) => {
  //正常情况
}).catch((err) => {
  //异常情况
})

*/
