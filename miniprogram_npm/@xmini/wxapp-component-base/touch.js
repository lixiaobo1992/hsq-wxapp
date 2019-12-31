"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.touch = void 0;
const touch = Behavior({
  methods: {
    touchStart(event) {
      this.direction = '';
      this.deltaX = 0;
      this.deltaY = 0;
      this.offsetX = 0;
      this.offsetY = 0;
      this.startX = event.touches[0].clientX;
      this.startY = event.touches[0].clientY;
    },

    touchMove(event) {
      /* eslint no-shadow: 0 */
      const touch = event.touches[0];
      this.deltaX = touch.clientX - this.startX;
      this.deltaY = touch.clientY - this.startY;
      this.offsetX = Math.abs(this.deltaX);
      this.offsetY = Math.abs(this.deltaY);
      /* eslint indent: 0 */

      this.direction = this.offsetX > this.offsetY ? 'horizontal' : this.offsetX < this.offsetY ? 'vertical' : '';
    }

  }
});
exports.touch = touch;