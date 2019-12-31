// 神策数据统计
import {
  xmini,
} from '../config/xmini';

let sa = null;
export function scStats() {
  sa = require('./sensorsdata.min.js');
  sa.setPara({
    name: 'sc_stats',
    server_url: 'https://haoshiqipoc.datasink.sensorsdata.cn/sa?project=default&token=6d101b2f378e51c0',
    // 是否开启自动采集
    autoTrack: {
      appLaunch: true,
      appShow: true,
      appHide: true,
      pageShow: true,
      pageShare: true
    }
  });
  // const { userInfo } = xmini.store.state.user;
  // if (userInfo && userInfo.user_id) {
  //   sa.login(userInfo.user_id);
  // }
  sa.init();
}

module.exports = {
  sa,
  scStats,
};