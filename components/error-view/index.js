const mini = {
  handleErrorButtonTap(e) {
    const { href } = e.currentTarget.dataset;
    if (href) {
      wx.redirectTo({ url: href });
    } else {
      console.warn('no href specified');
    }
  },
};

module.exports = mini;
