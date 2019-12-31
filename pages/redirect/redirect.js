import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import mixins from '../../utils/mixins.js'

xPage({
  ...mixins,
  data: {
  },
  onLoad(query) {
    // console.log(query);
    let url = decodeURIComponent(query.url);
    if (url.indexOf('?') >= 0) {
      url += '&replace=1';
    } else {
      url += '?replace=1';
    }
    const result = { currentTarget: { dataset: {url: url, index: query.index} } };
    this.onUrlPage(result);
  },
});
