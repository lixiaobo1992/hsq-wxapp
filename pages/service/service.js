import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
// import api from '../../api/index';
import mixins from '../../utils/mixins';


// var udeskData;
// var paramsData;
// var reTry = 3;
// var userInfo;

xPage({
  ...mixins,
  data: {
    showWebView: false,
    serviceUrl: '',
  },
  onLoad(query) {
    this.onPageInit(query);
    const url = decodeURIComponent(query.url || '');
    if (url) {
      this.setData({
        serviceUrl: url,
        showWebView: true,
      })
    }else {
      this.setData({
        showTip: true,
      })
    }
  },

  onShow() {

  },

  onUnload() {

  },
  makePhoneCall() {
    wx.makePhoneCall({ phoneNumber: '4001858058' });
  },
});
