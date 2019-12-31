"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.basic = void 0;
const basic = Behavior({
  attached() {
    // 添加页面实例属性
    this.$page = this.getPage();
  },

  methods: {
    $emit() {
      this.triggerEvent.apply(this, arguments);
    },

    getPage() {
      const currentPages = getCurrentPages();

      if (!currentPages.length) {
        console.warn('未得到页面实例');
        return '';
      }

      return currentPages[currentPages.length - 1];
    },

    getRect(selector, all) {
      return new Promise(resolve => {
        wx.createSelectorQuery().in(this)[all ? 'selectAll' : 'select'](selector).boundingClientRect(rect => {
          if (all && Array.isArray(rect) && rect.length) {
            resolve(rect);
          }

          if (!all && rect) {
            resolve(rect);
          }
        }).exec();
      });
    }

  }
});
exports.basic = basic;