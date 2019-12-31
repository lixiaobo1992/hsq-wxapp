import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import mixins from '../../utils/mixins';

import ErrorView from '../../components/error-view/index';

const errImgs = {
  empty: 'https://img1.haoshiqi.net/wxapp/img/error-view/empty_2392f51e6c.png',
  error: 'https://img1.haoshiqi.net/wxapp/img/error-view/error_f3d927278e.png',
  limit: 'https://img1.haoshiqi.net/wxapp/img/error-view/limit_1cb081303e.png',
};

xPage({
  ...mixins,
  ...ErrorView,
  data: {
    errorData: {
      errorImg: '',
      title: '什么都没有了',
      content: '',
      button: '返回',
      onButtonTap: 'handleBack',
      // href: '/pages/list/index'
    },
  },
  onLoad(query) {
    this.onPageInit(query);

    this.setData({
      [`errorData.title`]: query.title || '稍等一下，页面一会儿就回来~',
      [`errorData.content`]: query.content || '',
      [`errorData.errorImg`]: errImgs[query.type || 'error'],
    });
  },
  handleBack() {
    this.back();
  },

  onShow() {

  },

  onUnload() {

  }
});
