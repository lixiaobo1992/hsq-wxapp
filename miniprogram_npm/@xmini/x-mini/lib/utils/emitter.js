"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Emitter = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// https://github.com/scottcorgan/tiny-emitter
// Keep this empty so it's easier to inherit from
// (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
// subscribers
// subscribe()
// unsubscribe()：取消订阅。从 subscribers 数组中删除订阅者；
// publish()
// usage example
// import Emitter from '@xmini/shard-utils';
// const emitter = new Emitter();
//
// emitter.on('some-event', function(arg1, arg2, arg3) {
//    //
// });
//
// emitter.emit('some-event', 'arg1 value', 'arg2 value', 'arg3 value');
var Emitter =
/*#__PURE__*/
function () {
  function Emitter() {
    _classCallCheck(this, Emitter);
  }

  _createClass(Emitter, [{
    key: "on",
    value: function on(name, callback, context) {
      var self = this;

      if (Array.isArray(name)) {
        for (var i = 0, l = name.length; i < l; i++) {
          self.on(name[i], callback, context);
        }
      } else {
        var e = this._events || (this._events = {});
        (e[name] || (e[name] = [])).push({
          fn: callback,
          context: context
        });
      }

      return this;
    }
  }, {
    key: "once",
    value: function once(name, callback, context) {
      var self = this;

      function on() {
        self.off(name, on);
        callback.apply(context, arguments);
      }

      on._ = callback;
      return this.on(name, on, context);
    } // name, value, context

  }, {
    key: "emit",
    value: function emit(name) {
      var data = [].slice.call(arguments, 1);
      var evtArr = ((this._events || (this._events = {}))[name] || []).slice();
      var i = 0;
      var len = evtArr.length;

      for (i; i < len; i++) {
        evtArr[i].fn.apply(evtArr[i].context, data);
      }

      return this;
    }
  }, {
    key: "off",
    value: function off(name, callback) {
      var self = this;
      var e = this._events || (this._events = {}); // all

      if (!arguments.length) {
        self._events = Object.create(null);
        return self;
      } // array of events


      if (Array.isArray(name)) {
        for (var _i = 0, l = name.length; _i < l; _i++) {
          self.off(e[_i], callback);
        }

        return self;
      } // specific event


      var cbs = e[name];
      if (!cbs) return self;

      if (!callback) {
        e[name] = null; // delete e[name];

        return self;
      } // specific handler


      var cb;
      var i = cbs.length;

      while (i--) {
        cb = cbs[i];

        if (cb === callback || cb._ === callback) {
          cbs.splice(i, 1);
          break;
        }
      }

      return self;
    }
  }]);

  return Emitter;
}(); // off(name, callback) {
//   const e = this.e || (this.e = {});
//   const evts = e[name];
//   const liveEvents = [];
//   if (evts && callback) {
//     for (let i = 0, len = evts.length; i < len; i++) {
//       if (evts[i].fn !== callback && evts[i].fn._ !== callback) {
//         liveEvents.push(evts[i]);
//       }
//     }
//   }
// 对这个问题有疑问，会导致内存泄漏？
//   // Remove event from queue to prevent memory leak
//   // Suggested by https://github.com/lazd
//   // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910
//   liveEvents.length ? (e[name] = liveEvents) : delete e[name];
//   return this;
// }


exports.Emitter = Emitter;