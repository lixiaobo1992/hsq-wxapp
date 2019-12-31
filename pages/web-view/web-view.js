import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import mixins from '../../utils/mixins';
import api from '../../api/index';
import { urlfix, stringify, getQueryString } from '../../utils/base/index';

xPage({
  ...mixins,

  _data: {
    isEditUrl: false,

    query: null
  },
  data: {
    url: '',
    // updataComponent: false,
    ...mapState({
      logged: state => state.user.logged,
    }),
  },
  onLoad(query) {
    this.onPageInit(query);
    const { url, title } = query;
    console.log('webview:', url);
    // this.checkLogged();
    if (title) {
      this.setPageTitle(title);
    }

    const app = getApp();
    // 订阅 提醒状态 改变
    const that = this;
    app.onSubscribeEvent(this, 'WEB_VIEW_CHANGE', (res) => {
      console.log('hahha web-view',res)
      const { change_type } = res;
      if (change_type) {
        if (change_type == 'open-member') {
          const { isPaySuccess, paymentId} = res;
          if (isPaySuccess) {
            that._data.query = {
              payment_id: paymentId
            }
          } else {
            that._data.query = null
          }
        }
      }
    });
  },
  onShow() {
    console.log('web-view onShow');
    const _this = this;
    const { need_login = 0 } = this.pageQuery;
    const { token } = api.getCommonParams();
    console.log(token, 'token res2');

    // 如果webview页面需要前置登录，则在url后拼接参数 need_login=1
    if (need_login == 1 && !this.data.logged && !token) {
      this.forward('login');
      return;
    }
    let { url = '' } = this.pageQuery;
    if (!url) return;
    url = decodeURIComponent(url);
    url = urlfix(url, 'd_wxapp=1');
    const hasToken = !!getQueryString(url, 'token');
    if (!hasToken) {
      url = urlfix(url, 'token=' + token);
    }
    if (this._data.query) {
      url = urlfix(url, stringify(this._data.query));
    }
    console.log(url);
    this.setData({
      url: url,
    });
  },
  getMsg(e) {
    console.log('web-view getMsg:', e);
  },
  urlLoadSuccess(e) {
    console.log('web-view urlLoadSuccess:', e);
  },
  urlLoadFail(e) {
    console.log('web-view urlLoadFail:', e);
  }
});
