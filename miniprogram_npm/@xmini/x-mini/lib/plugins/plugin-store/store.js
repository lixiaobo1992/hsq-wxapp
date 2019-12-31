"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Store = void 0;

var _moduleCollection = _interopRequireDefault(require("./module/module-collection"));

var _util = require("./util");

var _helpers = require("./helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// - 不支持 computed 即 getter
// - 不支持 namespace
// - 不支持 plugin
//   - logger
//   - devtool
// - 不支持 严格模式警告
var Store =
/*#__PURE__*/
function () {
  function Store() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Store);

    // store internal state
    this._committing = false;
    this._actions = Object.create(null); // {}

    this._actionSubscribers = [];
    this._mutations = Object.create(null);
    this._modules = new _moduleCollection.default(options);
    this._subscribers = []; // bind commit and dispatch to self

    var store = this;
    var dispatch = this.dispatch,
        commit = this.commit;

    this.dispatch = function boundDispatch(type, payload) {
      return dispatch.call(store, type, payload);
    };

    this.commit = function boundCommit(type, payload, options) {
      return commit.call(store, type, payload, options);
    };

    var state = this._modules.root.state; // 安装根模块

    installModule(this, state, [], this._modules.root);
    resetStoreVM(this, state);
  }

  _createClass(Store, [{
    key: "commit",
    // 触发对应 type 的 mutation
    value: function commit(_type, _payload, _options) {
      var _this = this;

      // check object-style commit

      /* eslint no-unused-vars: 0 */
      var _unifyObjectStyle = unifyObjectStyle(_type, _payload, _options),
          type = _unifyObjectStyle.type,
          payload = _unifyObjectStyle.payload,
          options = _unifyObjectStyle.options;

      var mutation = {
        type: type,
        payload: payload
      };
      var entry = this._mutations[type];

      if (!entry) {
        return;
      }

      this._withCommit(function () {
        // 遍历触发事件队列
        entry.forEach(function commitIterator(handler) {
          handler(payload);
        });
      });

      this._subscribers.forEach(function (sub) {
        return sub(mutation, _this.state);
      });
    }
  }, {
    key: "dispatch",
    value: function dispatch(_type, _payload) {
      var _this2 = this;

      // check object-style dispatch
      var _unifyObjectStyle2 = unifyObjectStyle(_type, _payload),
          type = _unifyObjectStyle2.type,
          payload = _unifyObjectStyle2.payload;

      var action = {
        type: type,
        payload: payload
      };
      var entry = this._actions[type];

      if (!entry) {
        return;
      }

      try {
        this._actionSubscribers.filter(function (sub) {
          return sub.before;
        }).forEach(function (sub) {
          return sub.before(action, _this2.state);
        });
      } catch (e) {}

      var result = entry.length > 1 ? Promise.all(entry.map(function (handler) {
        return handler(payload);
      })) : entry[0](payload);
      return result.then(function (res) {
        try {
          _this2._actionSubscribers.filter(function (sub) {
            return sub.after;
          }).forEach(function (sub) {
            return sub.after(action, _this2.state);
          });
        } catch (e) {}

        return res;
      });
    }
  }, {
    key: "subscribe",
    value: function subscribe(fn) {
      return genericSubscribe(fn, this._subscribers);
    }
  }, {
    key: "subscribeAction",
    value: function subscribeAction(fn) {
      var subs = typeof fn === 'function' ? {
        before: fn
      } : fn;
      return genericSubscribe(subs, this._actionSubscribers);
    }
  }, {
    key: "replaceState",
    value: function replaceState(state) {
      var _this3 = this;

      this._withCommit(function () {
        _this3._vm.$$state = state;
      });
    }
  }, {
    key: "registerModule",
    value: function registerModule(path, rawModule) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      if (typeof path === 'string') path = [path];

      this._modules.register(path, rawModule);

      installModule(this, this.state, path, this._modules.get(path), options.preserveState); // reset store

      resetStoreVM(this, this.state);
    }
  }, {
    key: "unregisterModule",
    value: function unregisterModule(path) {
      var _this4 = this;

      if (typeof path === 'string') path = [path];

      this._modules.unregister(path);

      this._withCommit(function () {
        var parentState = getNestedState(_this4.state, path.slice(0, -1));
        delete parentState[path[path.length - 1]]; // Vue.delete(parentState, path[path.length - 1])
      });

      resetStore(this);
    }
  }, {
    key: "hotUpdate",
    value: function hotUpdate(newOptions) {
      this._modules.update(newOptions);

      resetStore(this, true);
    }
  }, {
    key: "_withCommit",
    value: function _withCommit(fn) {
      var committing = this._committing;
      this._committing = true;
      fn();
      this._committing = committing;
    }
  }, {
    key: "state",
    get: function get() {
      return this._vm.$$state;
    },
    set: function set(v) {} // console.warn(`use store.replaceState() to explicit replace store state.`);

  }]);

  return Store;
}();

exports.Store = Store;

function genericSubscribe(fn, subs) {
  if (subs.indexOf(fn) < 0) {
    subs.push(fn);
  }

  return function () {
    var i = subs.indexOf(fn);

    if (i > -1) {
      subs.splice(i, 1);
    }
  };
}

function resetStore(store, hot) {
  store._actions = Object.create(null);
  store._mutations = Object.create(null);
  var state = store.state; // init all modules

  installModule(store, state, [], store._modules.root, true); // reset vm

  resetStoreVM(store, state, hot);
}

function resetStoreVM(store, state, hot) {
  store._vm = {
    $$state: state // computed, // computed 利用 Vue 响应式特性才支持，否则需要另行处理

  };
}

function installModule(store, rootState, path, module, hot) {
  var isRoot = !path.length; // set state

  if (!isRoot && !hot) {
    var parentState = getNestedState(rootState, path.slice(0, -1));
    var moduleName = path[path.length - 1];

    store._withCommit(function () {
      parentState[moduleName] = module.state; // Vue.set(parentState, moduleName, module.state)
    });
  } // ['account'] -> account/


  var local = module.context = makeLocalContext(store, path); // 注册mutation事件队列

  module.forEachMutation(function (mutation, key) {
    registerMutation(store, key, mutation, local);
  });
  module.forEachAction(function (action, key) {
    var type = key;
    var handler = action.handler || action;
    registerAction(store, type, handler, local);
  });
  module.forEachChild(function (child, key) {
    installModule(store, rootState, path.concat(key), child, hot);
  });
}
/**
 * make localized dispatch, commit, and state
 */


function makeLocalContext(store, path) {
  var local = {
    dispatch: store.dispatch,
    commit: store.commit
  };
  Object.defineProperties(local, {
    // getters: {
    //   get() {return store.getters}
    // },
    state: {
      get: function get() {
        return getNestedState(store.state, path);
      }
    }
  });
  return local;
}

function registerMutation(store, type, handler, local) {
  var entry = store._mutations[type] || (store._mutations[type] = []);
  entry.push(function wrappedMutationHandler(payload) {
    handler.call(store, local.state, payload); // 这里修改数据时，回调 setData，改变页面数据

    if (typeof store.$callback === 'function') {
      store.$callback(JSON.parse(JSON.stringify(local.state || null)));
    }
  });
}

function registerAction(store, type, handler, local) {
  var entry = store._actions[type] || (store._actions[type] = []);
  entry.push(function wrappedActionHandler(payload, cb) {
    var res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      state: local.state,
      rootState: store.state
    }, payload, cb);

    if (!(0, _util.isPromise)(res)) {
      res = Promise.resolve(res);
    }

    return res;
  });
}

function getNestedState(state, path) {
  return path.length ? path.reduce(function (state, key) {
    return state[key];
  }, state) : state;
}

function unifyObjectStyle(type, payload, options) {
  if ((0, _util.isObject)(type) && type.type) {
    options = payload;
    payload = type;
    type = type.type;
  }

  return {
    type: type,
    payload: payload,
    options: options
  };
}