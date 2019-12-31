"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.link = void 0;
const link = Behavior({
  properties: {
    url: String,
    linkType: {
      type: String,
      value: 'navigateTo'
    }
  },
  methods: {
    jumpLink(urlKey = 'url') {
      const url = this.data[urlKey];

      if (url) {
        wx[this.data.linkType]({
          url
        });
      }
    }

  }
});
exports.link = link;