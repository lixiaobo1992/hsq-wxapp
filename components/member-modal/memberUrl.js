import { xmini } from '../../config/xmini';
import { urlfix } from '../../utils/index';
export default {
  //提供给好会员跳转h5Url => webview的方法 带url
  onUrlPage(e){
    const { piwik='', url='' } = e.currentTarget.dataset;
    xmini.piwikEvent(piwik);
    const { token = ''} = this.data.userInfo;
    if(!token){
      this.verifyAuth();
      return;
    }
    if(!url){
      wx.showToast('url不存在');
      return;
    };
    let jumpUrl = urlfix(url, 'token=' + token);
    console.log(jumpUrl,'jumpUrl');
    this.forward('web-view', { url: encodeURIComponent(jumpUrl) });
  },
};
