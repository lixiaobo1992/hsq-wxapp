import api from '../api/index.js';

module.exports = {
  taskTimer: null,
  startTimer(sign = '', taskTime = 60) {
    this.taskTimer = setTimeout(() => {
      api.stepReport({
        sign,
      }, res => {
        this.clearTimer();
      }, err => {
        this.clearTimer();
        return true;
      });
    }, taskTime * 1000);
  },
  clearTimer() {
    this.taskTimer && clearTimeout(this.taskTimer);
    this.taskTimer = null;
  },
};