"use strict";
import { baseComponent, touch } from '@xmini/wxapp-component-base';

Object.defineProperty(exports, "__esModule", { value: true });

var THRESHOLD = 0.3;
var ARRAY = [];
baseComponent({
  // classes: ['className'],
  props: {
    disabled: Boolean,
    leftWidth: {
      type: Number,
      value: 0
    },
    rightWidth: {
      type: Number,
      value: 0
    },
    asyncClose: Boolean,
    name: {
      type: [Number, String],
      value: ''
    }
  },
  mixins: [touch],
  data: {
    catchMove: false
  },
  created: function () {
    this.offset = 0;
    ARRAY.push(this);
  },
  destroyed: function () {
    var _this = this;
    ARRAY = ARRAY.filter(function (item) { return item !== _this; });
  },
  methods: {
    open: function (position) {
      var _a = this.data, leftWidth = _a.leftWidth, rightWidth = _a.rightWidth;
      var offset = position === 'left' ? leftWidth : -rightWidth;
      this.swipeMove(offset);
    },
    close: function () {
      this.swipeMove(0);
    },
    swipeMove: function (offset) {
      if (offset === void 0) { offset = 0; }
      this.offset = offset;
      var transform = "translate3d(" + offset + "px, 0, 0)";
      var transition = this.draging
        ? 'none'
        : 'transform .6s cubic-bezier(0.18, 0.89, 0.32, 1)';
      this.setData({
        wrapperStyle: "\n        -webkit-transform: " + transform + ";\n        -webkit-transition: " + transition + ";\n        transform: " + transform + ";\n        transition: " + transition + ";\n      "
      });
    },
    swipeLeaveTransition: function () {
      var _a = this.data, leftWidth = _a.leftWidth, rightWidth = _a.rightWidth;
      var offset = this.offset;
      if (rightWidth > 0 && -offset > rightWidth * THRESHOLD) {
        this.open('right');
      }
      else if (leftWidth > 0 && offset > leftWidth * THRESHOLD) {
        this.open('left');
      }
      else {
        this.swipeMove(0);
      }
      this.setData({ catchMove: false });
    },
    startDrag: function (event) {
      var _this = this;
      if (this.data.disabled) {
        return;
      }
      ARRAY.forEach(function (item) {
        if (item !== _this) {
          item.close();
        }
      });
      this.draging = true;
      this.startOffset = this.offset;
      this.firstDirection = '';
      this.touchStart(event);
    },
    noop: function () { },
    onDrag: function (event) {
      if (this.data.disabled) {
        return;
      }
      this.touchMove(event);
      if (!this.firstDirection) {
        this.firstDirection = this.direction;
        this.setData({ catchMove: this.firstDirection === 'horizontal' });
      }
      if (this.firstDirection === 'vertical') {
        return;
      }
      var _a = this.data, leftWidth = _a.leftWidth, rightWidth = _a.rightWidth;
      var offset = this.startOffset + this.deltaX;
      if ((rightWidth > 0 && -offset > rightWidth) ||
          (leftWidth > 0 && offset > leftWidth)) {
        return;
      }
      this.swipeMove(offset);
    },
    endDrag: function () {
      if (this.data.disabled) {
        return;
      }
      this.draging = false;
      this.swipeLeaveTransition();
    },
    onClick: function (event) {
      var _a = event.currentTarget.dataset.key, position = _a === void 0 ? 'outside' : _a;
      this.$emit('click', position);
      if (!this.offset) {
        return;
      }
      if (this.data.asyncClose) {
        this.$emit('close', { position: position, instance: this, name: this.data.name });
      }
      else {
        this.swipeMove(0);
      }
    }
  }
});
