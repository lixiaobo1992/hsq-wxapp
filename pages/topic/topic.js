import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';

import api from '../../api/index';
import mixins from '../../utils/mixins.js';
import urlParse from '../../utils/url-parse/index';
import { stringify } from '../../utils/stringUtil.js';
const { qs } = urlParse;
let localToken = '';

xPage({
  ...mixins,
  data: {
    url: '',
    shareUrl: '',
    shareInfo: true,
  },
  onLoad(query) {
    const urlParams = qs.parse(decodeURIComponent(query.url || ''))
    query = Object.assign({}, urlParams, query)
    this.onPageInit(query);
    // console.log(query.url);
    const { token } = api.getCommonParams();
    localToken = token;
    let url = decodeURIComponent(query.url || '');
    const urlArr = url.split('?');
    let urlQuery = qs.parse(urlArr[1] || '');
    if (token) {
      urlQuery.token = token;
    }
    url = urlArr[0] + '?' + stringify(urlQuery);
    const prefix =url.indexOf('?') > -1 ? '&' : '?';
    this.setData({
      url: url + prefix + 'd_wxapp=1#wechat_redirect',
      shareUrl: query.url,
    });
  },
  onShow() {
    // console.log(this.pageQuery);
    const query = this.pageQuery;
    const { token } = api.getCommonParams();
    if (localToken != token) {
      this.forward('topic', { url: query.url, replace: true });
    }
  },
  getMsg(e) {
    // console.log(e);
    if (!e || !e.detail || !e.detail.data) {
      console.log('未获取H5页面消息');
      return;
    }
    const data = e.detail.data[0];
    if (data.type == 'url') { //跳转url,不能用!!!
      const result = { currentTarget: { dataset: data } };
      this.onUrlPage(result);
    } else if (data.type == 'share_info') { //设置分享信息
      const jumplink = 'topic?url=' + this.data.shareUrl;
      const path = 'pages/index/index?jumplink=' + encodeURIComponent(jumplink) + '&minishare=1';
      this.setData({
        shareInfo: {
          title: data.share_title,
          desc: data.share_desc,
          imageUrl: data.share_img,
          path: path,
        }
      })
      // console.log('设置分享信息', this.data.shareInfo);
    }
  }
});
