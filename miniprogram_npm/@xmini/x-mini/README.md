# @xmini/x-mini

自 `@xmini/x-mini@2.1.3` 开始，支持 npm 外部包形式通过依赖项引入

FIXED: x-mini 在支付宝老版本（10.1.55）不能作为 npm 包使用（10.1.62 可以使用），问题排查中

 因为打包输出的代码包含了较多的 `ES6+` 代码，导致低版本运行有问题，添加 `.browserslistrc`并修改 `babel.config.js` 后正常（目前已兼容到 iphone 10.1.52,android 10.1.55 测试通过）

## 问题

引用路径不一致问题

- 发布后代码在 `lib` 下
- 微信小程序因为配置了 `"miniprogram": "lib"`，构建npm 后，代码改为 `@xmini/x-mini` 根目录下
- 支付宝小程序引用路径，还需要配置 lib，导致引用路径与微信小程序存在不一致

解决方案

- 使用配置 `"miniprogram": "./"`，全部引用路径同支付宝小程序
  - aliapp 不能使用 `@xmini/x-mini/index` 可使用 `@xmini/x-mini`
  - wxapp 不能使用 `@xmini/x-mini` 可使用 `@xmini/x-mini/index`
  - 统一使用 '@xmini/x-mini/lib/index';
- 此时 main 字段配置实质上被忽略了 `"main": "lib/index.js"`

最佳方案是，不要 lib 目录，直接使用根目录

## 适配及功能扩展

- core 核心
  - [x] xmini
  - [x] store 支持
  - [x] mixins 支持
    - 全局 mixins
    - 单文件 mixins
- adaptors 包含差异化封装以及功能扩展
  - 已改写，支持差异输出：生命周期差异，方法差异等
  - adaptor-wxapp
  - adaptor-aliapp
- plugins
  - [x] plugin-error-report 错误上报
  - [x] plugin-channel 渠道跟踪
  - [x] plugin-stat 数据收集（是否可以无埋点）
  - [x] plugin-piwik 统计数据上报到 piwik
  - [ ] TODO: plugin-route 支持
  - [ ] plugin-formid 解决方案
  - ~~[ ] 封装请求队列~~ 不用支持了，因为目前没有请求限制了

**注意**

- 此项目老版本 `1.x.x` 可用，结构比较乱
- 当前 `2.x.x` 正在构建中...

此项目研究如何更方便的开发使用小程序，`x-mini` 助力实现以下功能

支持在每个生命周期插入自定义的方法，这样便于处理需求，而不影响业务开发。

产出原由：

因为小程序要加不少公共逻辑，比如功能扩展，数据埋点统计，错误上报等，有些需要遍布所有页面，单独抽离后引用实在不美观。

大体思想是改写生命周期方法，把我们要做的事情放进去，可用后记为1.0.0，算是第一版。

为了同时支持微信小程序和支付宝小程序，各种联调后导致功能越发混乱，调试扩展不方便，于是决定重新设计下，就是这一版。

## 注意事项

经过测试，存在以下问题，

- aliapp 不能引入 npm模块的es6格式，需要编译成es5
- wxapp 不能引入node_modules路径下内容，而其他路径可以（目前最新版也不是 node_modules 文件夹）
- 综上，最好还是手动源码引入，将安装后的代码，拖入自定义文件夹中使用

**注意**：如果模块只有一个输出值，就使用export default，如果模块有多个输出值，
就不使用export default，export default与普通的export不要同时使用。(http://es6.ruanyifeng.com/#docs/style#%E6%A8%A1%E5%9D%97)

## 如何使用

- 新版本支持按需引入
- 以插件形式随意扩展功能，也可以自己实现功能后引入

使用过程如下：

新建 `/config/xmini.js` 文件如下

```js
// aliapp 不能使用 `@xmini/x-mini/index` 可使用 `@xmini/x-mini`
// wxapp 不能使用 `@xmini/x-mini` 可使用 `@xmini/x-mini/index`
// 暂统一使用 '@xmini/x-mini/lib/index';
import xm, { storage, Storage } from '@xmini/x-mini/lib/index';
// import { App, Page } from '@xmini/x-mini/lib/utils/mockMini';
import * as adaptor from '@xmini/x-mini/lib/adaptors/adaptor-wxapp';

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

import storeConfig from '../store/index';

console.log(storage);

// wxapp
const appConfig = __wxConfig;
// aliapp
// import appConfig from '../app.json';

// xm.init()
//   .use()
//   .use()
//   .use();

xm.init({
  adaptor,
  appId: 123,
  appName: 'test',

  store: new Store(storeConfig),

  mixins: {
    app: [],
    page: [
      {
        tt() {
          console.log('tt');
        },
      },
    ],
    component: [],
  },

  plugins: [
    new PluginStore(),
    new PluginErrorReport({
      reportURI: 'https://tongji.doweidu.com/log.php',
    }),
    new PluginChannel({
      spm: 'wxapp',
      channel: 'wxapp',
      channel_id: 'wxapp',
    }),
    new PluginStat({}),
    new PluginRoute({
      appConfig,
    }),
    new PluginPiwik({
      size: 10,
      // time: '', // 上报时间间隔
      siteId: 2, // 测试用 2，本站点使用 5
      reportURI: 'https://tongji.doweidu.com/piwik.php',
      authToken: '5db85cb262e7423aa6bdca05a0283643',
    }),
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
}
export const xmini = xm;
export const me = xm.me;
export const xApp = xm.xApp;
export const xPage = xm.xPage;
```

页面引用如下

```js
// app.js
import { xApp } from './config/xmini';

xApp({
  onError(err) {},
  onShow() {
    console.log('app onShow');
    // 模拟错误信息
    // xxx;
  },
});
```

```js
// page.js
import { xPage, xmini, mapState, mapActions } from '../../config/xmini';

xPage({
  data: {
    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
      status: state => state.user.status,
    }),
    test: '123',
  },
  ...mapActions([
    'Login',
    'FedLogout',
  ]),
  goNext(e) {
    const { link } = e.currentTarget.dataset;
    switch (link) {
      case 'search':
        xmini.piwikEvent('search');
        break;
      case 'login':
        // 已登录、未登录、正在登录
        this.Login().then(() => {
          console.log(this.data);
        });
        break;
      case 'logout':
        this.FedLogout();
        break;
      case 'search':
        xmini.piwikEvent('search');
        break;
      default: {
        this.$forward(link);
      }
    }
  },
});
```

## Testing

可以以微信小程序为例进行测试研究，相对来说调试更方便并且功能更齐全。

或使用 `mockMini` 来完成自动化测试

参考资料：

- https://github.com/Tencent/westore
