const mini = {
  // 滚动时触发
  onScroll(e) {
    // console.log(e.detail.scrollTop);
    let scrollTop = e.detail.scrollTop;
    if (scrollTop > 200 && !this.data.showBackTop) {
      this.setData({
        showBackTop: true
      });
    } else if (scrollTop < 200 && this.data.showBackTop) {
      this.setData({
        showBackTop: false,
        viewId: '',
      });
    }
  },
  onBackTop() {  // 返回到顶部
    this.setData({
      viewId: 'scrollTop',
    });
  },
}

module.exports = mini;
