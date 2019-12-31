"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("../utils/index");

var _core = _interopRequireDefault(require("./core"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var uniqueId = 1;
var commonArgs = ['success', 'fail', 'cancel', 'complete', 'trigger'];

function getMapNames(methodName) {
  var pluginMethodName = methodName;

  if ((0, _index.isArray)(methodName)) {
    pluginMethodName = methodName[1];
    methodName = methodName[0];
  }

  return {
    callName: methodName,
    realName: pluginMethodName
  };
} // 处理参数，参数为对象格式


function dealArgs(args) {
  var data = {};
  (0, _index.each)(args, function (arg, key) {
    // 不是 commonArgs 中列出的方法，是要给 Native 传递的 message
    // 先将其转存到 data 上
    if (commonArgs.indexOf(key) === -1) {
      data[key] = args[key];
      delete args[key];
    }
  }); // 最后将 data 对象挂载到参数的 data，用于传递 message

  args.data = data;
  return args;
}

var Bridge =
/*#__PURE__*/
function (_Core) {
  _inherits(Bridge, _Core);

  function Bridge() {
    var _this;

    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Bridge);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Bridge).call(this, config));
    var _sendMessageQueue = [];
    _this._sendMessageQueue = _sendMessageQueue;
    _this._messageHandlers = {};
    _this._responseCallbacks = {};
    _this._uniqueId = 1; // this._doSend = (message, responseCallback) => {
    //   if (responseCallback) {
    //     const callbackId =
    //       'cb_' + this._uniqueId++ + '_' + new Date().getTime();
    //     this._responseCallbacks[callbackId] = responseCallback;
    //     message.callbackId = callbackId;
    //   }
    //   _sendMessageQueue.push(message);
    // };

    return _this;
  } // 注册方法，通过此方法注册公开方法，提供给外部(native/other)来使用


  _createClass(Bridge, [{
    key: "registerHandler",
    value: function registerHandler(handlerName, handler) {
      var _messageHandlers = this._messageHandlers;

      if (_messageHandlers[handlerName]) {
        console.error("".concat(handlerName, " \u5DF2\u7ECF\u88AB\u6CE8\u518C\uFF0C\u8BF7\u6539\u7528\u5176\u4ED6\u540D\u79F0\u6CE8\u518C"));
      } else {
        _messageHandlers[handlerName] = handler;
      }

      return this;
    } // 调度中心，所有公开的功能方法，通过此方法来调用
    // 传入 `handlerName`和`data`，bridge 记录 `responseCallback`
    // 在 bridge 上，可以有多个 handler，所以 `callHandler` 需要一个key来寻找指定方法

  }, {
    key: "callHandler",
    value: function callHandler(handlerName, data, responseCallback) {
      // if (arguments.length == 2 && isFunction(data)) {
      //   responseCallback = data;
      //   data = null;
      // }
      this._doSend({
        handlerName: handlerName,
        data: data
      }, responseCallback);
    }
  }, {
    key: "_doSend",
    value: function _doSend(message, responseCallback) {
      var _sendMessageQueue = this._sendMessageQueue;

      if (responseCallback) {
        var callbackId = 'cb_' + uniqueId++ + '_' + new Date().getTime();
        this._responseCallbacks[callbackId] = responseCallback;
        message.callbackId = callbackId;
      }

      _sendMessageQueue.push(message);

      this.postMessage(_sendMessageQueue);
      this._sendMessageQueue = [];
    }
  }, {
    key: "postMessage",
    value: function postMessage(messageQueue) {
      var _this2 = this;

      // 可自定义实现消息传递
      // 默认为直接调用
      var message = JSON.parse(JSON.stringify(messageQueue));
      message.forEach(function (item) {
        var handlerName = item.handlerName,
            data = item.data,
            callbackId = item.callbackId;
        var _messageHandlers = _this2._messageHandlers,
            _responseCallbacks = _this2._responseCallbacks;

        if (!_messageHandlers[handlerName] && !(0, _index.isFunction)(_messageHandlers[handlerName])) {
          console.error("".concat(handlerName, " \u65B9\u6CD5\u4E0D\u5B58\u5728"));
        } else {
          var result = _messageHandlers[handlerName](data);

          if (callbackId && _responseCallbacks[callbackId]) {
            _responseCallbacks[callbackId](result);
          }
        }
      });
    } // 向外暴露的工具方法，批量注册方法以及事件

  }, {
    key: "addMethods",
    value: function addMethods(pluginMethods, plugin) {
      var _this3 = this;

      if ((0, _index.isString)(pluginMethods)) pluginMethods = [pluginMethods];
      (0, _index.each)(pluginMethods, function (methodName) {
        var names = getMapNames(methodName);

        _this3._generateMethod(names.callName, names.realName, plugin);
      });
    } // addEvents(pluginEvents) {
    //   if (isString(pluginEvents)) pluginEvents = [pluginEvents];
    //   each(pluginEvents, function(methodName) {
    //     const names = getMapNames(methodName);
    //     generateEvent(names.callName, names.realName);
    //   });
    // }

  }, {
    key: "_generateMethod",
    value: function _generateMethod(callName, realName, plugin) {
      var _this4 = this;

      this.registerHandler(callName, function () {
        return plugin[realName].apply(plugin, arguments);
      });

      this[callName] = function (args) {
        console.log("called ".concat(realName), args);
        args = dealArgs(args || {});

        _this4.callHandler(realName, args.data, function (responseData) {
          if ((0, _index.isString)(responseData)) {
            responseData = JSON.parse(responseData);
          }

          var status = responseData.status;

          if (status === 'success') {
            args.success && args.success(responseData);
          } else if (status === 'fail') {
            args.fail && args.fail(responseData);
          } else if (status === 'cancel') {
            args.cancel && args.cancel(responseData);
          }

          args.complete && args.complete(responseData);
        });
      };
    }
  }]);

  return Bridge;
}(_core.default);

var _default = Bridge;
exports.default = _default;
module.exports = exports.default;