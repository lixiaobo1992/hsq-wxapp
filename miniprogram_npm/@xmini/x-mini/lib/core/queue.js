"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// https://github.com/zhengjunxin/wx-queue-request
// 使用队列实现控制并发数量
// 默认并发 10
// 目前小程序貌似没有并发限制，如果发现请求相关问题的话，使用此方案处理
var checkConcurrency = function checkConcurrency() {
  var concurrency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

  if (concurrency === null) {
    concurrency = 1;
  } else if (concurrency === 0) {
    throw new Error('Concurrency must not be zero');
  }

  return concurrency;
};

var onlyOnce = function onlyOnce(fn) {
  return function () {
    /* eslint eqeqeq: 0 */
    if (fn == null) {
      throw new Error('Callback was already called');
    }

    var callFn = fn;
    fn = null;
    return callFn.apply(void 0, arguments);
  };
};

function queue(callback, concurrency) {
  checkConcurrency(concurrency); // 待处理的队列

  var workers = []; // 正在处理的队列

  var workerList = [];
  return {
    concurrency: concurrency,
    push: function push(task, cb) {
      var _this = this;

      workers.push({
        task: task,
        cb: cb
      });
      setTimeout(function () {
        _this.process();
      }, 0);
    },
    process: function process() {
      var _this2 = this;

      var _loop = function _loop() {
        var worker = workers.shift();
        workerList.push(worker);
        callback(worker.task, onlyOnce(function () {
          _this2.pull(worker);

          if (typeof worker.callback === 'function') {
            worker.callback.apply(worker, arguments);
          }

          _this2.process();
        }));
      };

      while (this.concurrency > workerList.length && workers.length) {
        _loop();
      }
    },
    pull: function pull(worker) {
      var index = workerList.indexOf(worker);

      if (index !== -1) {
        workerList.splice(index, 1);
      }
    }
  };
}

function queueWorker(fn) {
  var concurrency = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

  if (typeof fn !== 'function') {
    throw Error('fn must be function');
  }

  var work = queue(function (task, callback) {
    return task(callback);
  }, concurrency);
  return function (obj) {
    work.push(function (callback) {
      var originComplete = obj.complete;

      obj.complete = function () {
        callback();

        if (typeof originComplete === 'function') {
          originComplete.apply(void 0, arguments);
        }
      };

      fn(obj);
    });
  };
} // function queueRequest(concurrency) {
//   const request = wx.request
//   Object.defineProperty(wx, 'request', {
//     get() {
//       return queueWorker(request, concurrency)
//     }
//   })
// }
// exports.queueWorker = queueWorker;
// exports.queueRequest = queueRequest;


var _default = queueWorker;
exports.default = _default;
module.exports = exports.default;