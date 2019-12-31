import xm, { storage, Storage } from '@xmini/x-mini/lib/index';
// import { App, Page } from '@xmini/x-mini/lib/utils/mockMini';
// import * as adaptor from '@xmini/x-mini/lib/adaptors/adaptor-aliapp';
import * as adaptor from './adaptor';
import { appConfig } from './adaptor';

import PluginErrorReport from '@xmini/x-mini/lib/plugins/plugin-error-report';
import PluginChannel from '@xmini/x-mini/lib/plugins/plugin-channel';
import PluginStore, {
  Store,
  mapState,
  mapMutations,
  mapActions,
} from '@xmini/x-mini/lib/plugins/plugin-store/index';

import PluginStat from '@xmini/x-mini/lib/plugins/plugin-stat/index';
import PluginPiwik from '@xmini/x-mini/lib/plugins/plugin-piwik/index';
import PluginRoute from '@xmini/x-mini/lib/plugins/plugin-route';

import PluginA from '../plugins/PluginA';

import storeConfig from '../store/index';

console.log(storage,'storage');

// xm.init()
//   .use()
//   .use()
//   .use();

xm.init({
  adaptor,
  appId: 'wxa090d3923fde0d4b',
  appName: 'hsq-wxapp',

  store: new Store(storeConfig),

  // mixins: {
  //   app: [],
  //   page: [
  //     {
  //       tt() {
  //         console.log('tt');
  //       },
  //     },
  //   ],
  //   component: [],
  // },

  plugins: [
    new PluginStore(),
    new PluginErrorReport({
      reportURI: 'https://tongji.doweidu.com/log.php',
    }),
    new PluginChannel({
      // spm: 'hsq_wxapp',
      channel: 'hsq_wxapp',
      channel_id: 'hsq_wxapp',
    }),
    new PluginStat({}),
    new PluginRoute({
      appConfig,
    }),
    new PluginPiwik({
      size: 10,
      category: 'hsq_wxapp',
      // time: '', // 上报时间间隔
      siteId: 7, // 测试用 2，本站点使用 7
      reportURI: 'https://tongji.doweidu.com/piwik.php',
      authToken: '5db85cb262e7423aa6bdca05a0283643',
    }),
    new PluginA(),
  ],
});

export {
  // xmini: xm,
  // xApp: xm.xApp,
  // xPage: xm.xPage,
  // xComponent: xm.xComponent,
  mapState,
  mapMutations,
  mapActions,
  storage,
  Storage,
};

export const xmini = xm;
export const me = xm.me;
export const xApp = xm.xApp;
export const xPage = xm.xPage;
