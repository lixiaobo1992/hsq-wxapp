"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.App = App;
exports.Page = Page;

function App(opts) {
  var err = {
    err: 'xxx',
    message: '错误消息'
  };
  opts.onError(err);
  opts.onLaunch(); // opts.data;

  opts.onShow();
}

function Page(opts) {
  opts.onLoad({}); // opts.data;

  opts.onShow();
}