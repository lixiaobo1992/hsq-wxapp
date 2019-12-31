import {
  me,
  xmini,
} from '../config/xmini';
import { allPages, defaultPage, tabPages } from './pages';
import { urlMap, getUrlType } from './urlMap';
import { stringify } from './stringUtil';
import urlParse from './url-parse/index';
import api from '../api/index';
import { storage } from '../utils/storage';
import { urlfix, clone } from '../utils/index';
const { qs } = urlParse;
let pageUUID = 1;
const messages = {};
let msgPages = {};
let dontQuick;
let udeskData;
let reTry = 3;
import { env } from '../config/env'
import { MY_APPID } from '../config/index'

// console.warn('=========mixins.js api', api);
// mixin 方法，提供混入
// 绑定事件或触发类事件 全用 on 开头
// 自调用事件，不用 on 开头
const mixins = {
  // onLog() {
  //   // 日志方法
  //   console.log('log');
  // },
  setPageTitle(title = '', callback) {
    wx.setNavigationBarTitle({
      title,
      success() {
        callback && callback();
      },
    });
  },
  setHeaderTitle(title) {
    wx.setNavigationBarTitle({
      title,
    });
  },
  formidSubmit(e) {
    // 有效期7天，一天提交一次即可
    // 必须登录状态
    const pageName = this.getPageName();
    const pageFormId = `formid-${pageName}`;
    // const cacheFormId = storage.get(pageFormId);
    const { formId } = e.detail;
    // if (cacheFormId) {
    //   console.log(`已存在 ${cacheFormId}`);
    //   // console.timeEnd('formId');
    //   this.afterFormIdSubmit && this.afterFormIdSubmit();  //确保afterFormIdSubmit执行
    //   return cacheFormId;
    // }
    console.log('api.formidSubmit', api);
    if (!formId || typeof formId === 'number' || formId.indexOf('formId') > -1) {
      console.log('这是IDE，formId是假的');
      this.afterFormIdSubmit && this.afterFormIdSubmit();
      return;
    }
    api.formidSubmit({
      formId: formId,
      page: pageName,
      isLoading: false,
    }, (res) => {
      console.log('上传formId success: ',formId);
      // console.log(res.data);
      // storage.set(pageFormId, formId, 86400);
      // console.timeEnd('formId');
      // wx.showToast('上传formId success')
    }, (err) => {
      console.log('上传formId fail: ');
      console.log(err);
      storage.set(pageFormId, 'api 401 stop', 10);
      // wx.showToast('上传formId fail')
      // console.timeEnd('formId');
      return true;
    });
    this.afterFormIdSubmit && this.afterFormIdSubmit();
    // wx.showToast(e.detail.formId)
    // console.log(Date.now())
    // console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },
  onShareAppMessage() {
    return this.getShareInfo();
  },
  /**
   * onLoad 内调用，会检测 pageName 以及 query
   *
   * - 保存 query 数据(数据全保存在 this.data 下)
   * - 初始化分享信息
   *   - 先设置 shareInfo 为 true; 启用分享
   *   - 随后可以更新分享信息保存在 this.shareInfo
   *
   * @param {any} query
   */
  onPageInit(query = {}) {
    const params = xmini.getChannel();

    query = Object.assign({
      // spm: params.spm,
      channel_id: params.channel,
    }, query);

    // if (!this._data) this._data = {};
    this.setQuery(query);

    // 判断当前query 上有没有spm
    // 判断当前query 上有没有spm
    if (query.spm) {
      console.log(app);
      const app = getApp();
      const newSpm = app.parsingSpm(query.spm);
      app.updatedSpm(newSpm)
    }

    // 是否要所有页面全开启分享信息
    // if (this.data.shareInfo) {
    //   this.onShareAppMessage = () => {
    //     console.log('设置分享信息');
    //     console.log(this.getShareInfo());
    //     return this.getShareInfo();
    //   };
    // } else {
    //   delete this.onShareAppMessage;
    // }
    // wx.on('')
    // wx.onUserCaptureScreen(() => {
    //   wx.showToast('收到用户截屏事件');
    // });
    // {
    //   isConnected: false,
    //   networkType: none, // wiki 4g
    // }
    // wx.onNetworkStatusChange((res) => {
    //   console.log(res);
    //   if (res.isConnected) {
    //     wx.showToast('呀，网络丢了~~');
    //   }
    // });

    // 这里有问题
    const pagesArr = getCurrentPages() || [];
    msgPages = {};
    pagesArr.forEach((pageItem, index) => {
      const { pageName, pageId, route } = pageItem;
      // 修改支持多个页面
      const msgKey = `${pageName}:${pageId}`;
      if (!msgPages[pageName]) {
        msgPages[pageName] = [msgKey]
        // msgPages[pageName] = msgKey;
        // const message = messages[msgKey];
        // if (message && message.needRefresh) {
        //   pageItem.refresh();
        //   delete messages[msgKey];
        // }
      } else {
        msgPages[pageName].push(msgKey);
      }
    });
    console.log(msgPages);

    // console.log($global);
    // wx.alert({
    //   title: `${$global.appImpl.$launchTime}`,
    // });
    // api.getProfile({}, (res) => {
    //   console.log('userInfo');
    //   console.log(res.data);
    // }, (err) => {
    //   console.log(err);
    // });
  },


  setQuery(query = {}) {
    const pageName = this.getPageName();
    if (query.scene) {
      query = Object.assign({}, query, this.dealSceneQuery(query.scene))
    }
    Object.assign(this, {
      pageName,
      pageId: pageUUID++,
      pageQuery: query,
      pagePath: 'pages/' + pageName + '/' + pageName,
    });
    console.log('query === ', this.pageQuery)
    this.setData({
      pageName,
    });
    if (!pageName) {
      console.error('页面不存在');
    }
  },
  dealSceneQuery(scene = '') {
    const sceneQuery = {}
    scene = decodeURIComponent(scene)
    let queryList = scene.split('&')
    for (let i = 0; i < queryList.length; i++) {
      const item = queryList[i].split('=')
      sceneQuery[item[0]] = item[1] || ''
    }
    return sceneQuery;
  },
  updatadSpmPage(){
    // 判断当前页是否是 tab 页
    const tabPagesKeys = Object.keys(tabPages);
    const pageName = this.pageName;
    // console.log(pageName, tabPagesKeys);
    if (tabPagesKeys.includes(pageName)) {
      const app = getApp();
      app.updatedSpm({
        page: pageName
      })
    }
  },
  // page.json 支持 optionMenu 配置导航图标，点击后触发 onOptionMenuClick
  onOptionMenuClick(e) {
    console.log('optionMenu', e);
  },

  getPageName() {
    const { pageName } = wx.$getPageInfo();
    return pageName;
    // const { pageName, route = '' } = this;
    // return pageName || route.split('/').reverse()[0] || defaultPage[0];
  },

  getShareInfo() {
    let { shareInfo } = this.data;
    let tempQuery = {...this.pageQuery};

    if (shareInfo.path) {
      const pathParams = shareInfo.path.split('?');
      tempQuery = Object.assign({}, tempQuery, pathParams[1] ? qs.parse(pathParams[1]) : {})
    }

    const { spm, channel_id } = tempQuery

    delete tempQuery.spm
    delete tempQuery.channel_id

    let currentQuery = {
      spm,
      channel_id,
      minishare: 1,
    };

    const currentPageName = this.getPageName();

    // 排除首页
    if (currentPageName !== 'index' && shareInfo) {
      // 首页通过 分享页 区分跳转位置
      currentQuery.jumplink = encodeURIComponent(`${currentPageName}?${stringify(tempQuery)}`)
    }
    // 统一分享首页 页面query不变
    let { pageUrl } = wx.getCurPageUrl('index', currentQuery);
    // if (!shareInfo || shareInfo === false) {
    //   pageUrl = defaultPage;
    // }
    console.log('分享连接：', pageUrl);

    shareInfo = shareInfo ? shareInfo : {}; // 设置默认值
    console.log(shareInfo.piwikAction,'sharepiwik');
    if (shareInfo.piwikAction) {
      xmini.piwikEvent(shareInfo.piwikAction, shareInfo.piwikData || '');
    }
    return Object.assign({
      title: '好食期',
      desc: '专注食品特卖平台，品牌食品2折起~',
      // imageUrl: 'https://static.doweidu.com/static/hsq/images/logo_fdfe8f30f2.png', // 默认可以设置 logo
      path: pageUrl,
      success() {
        // wx.showToast('分享成功');
      },
      fail() {
        // wx.showToast('分享失败');
      },
    }, shareInfo);
  },
  // 统一分享跳转
  shareJump(){
    // 区分分享链接，确定分享位置跳转
    let { jumplink , minishare } = this.pageQuery;
    jumplink = decodeURIComponent(jumplink);
    if (jumplink && minishare) {
      delete this.pageQuery.jumplink
      const temp = jumplink.split('?');
      let tempQuery = temp[1] ? qs.parse(temp[1]) : {};
      tempQuery.minishare = 1;
      const typeH5 = /^(https|http):\/\//i;
      for (let key in tempQuery) { // qs.parse会将url解析出来，这里检测value是h5链接重新encode
        if (typeH5.test(tempQuery[key])) {
          tempQuery[key] = encodeURIComponent(tempQuery[key]);
        }
      }
      delete tempQuery.replace; //删除分享中replace
      this.forward(temp[0], { ...tempQuery, isNotClick: true })
    }
  },

  // 绑定跳转
  onUrlPage(e) {
    let { url, moduleId, index, piwikEvent, piwikData = {}, tiptype } = e.currentTarget.dataset;

    if (piwikEvent) {
      xmini.piwikEvent(piwikEvent, piwikData);
    }

    if (!url) return;
    if (piwikEvent && JSON.stringify(piwikData) !== '{}' && piwikData.moduleName) {
      this.reportData(piwikData.moduleName, {
        id: piwikData.id,
        mkt_name: piwikData.comment,
        index: piwikData.index,
        mkt_page: this.route,
        url: piwikData.url || piwikData.link,
        mkt_type: piwikData.type,
      });
    }
    console.log(`${(url || '无需跳转')}, ${index}`);
    const type = getUrlType(url);
    let map = urlMap(url);

    let isSetSpm = false; // !!标识这个流程中是否已经修改过了spm
    console.log(map,'map')
    //'type = h5Hsq'
    if(type == 'topic') {
      const { pageQuery } = this;
      let urlInfo = url.split('?');
      // 需要跳的topic 链接上有spm

      let tempQuery = this.setSpm(map.query, moduleId);

      if (!tempQuery.channel_id && pageQuery && pageQuery.channel_id) {
        tempQuery.channel_id = pageQuery.channel_id;
      }

      url = `${urlInfo[0]}?${stringify(tempQuery)}`

      wx.goPage('topic', {url: encodeURIComponent(url), replace: map.query && map.query.replace});
      return;
    }
    if (type == 'miniapp') {

      let urlInfo = url.split('?');
      let tempQuery = urlInfo[1]
      tempQuery = qs.parse(tempQuery)

      if (!tempQuery.appid) {
        // !!url 上没有 appid 时 定义为小程序内部跳转 添加appid
        tempQuery.appid = MY_APPID;
      }
      // 当前小程序
      if (tempQuery.appid === MY_APPID) {
        tempQuery.miniAppType = 1; // 当前小程序
        const localUrl = urlParse(url);
        if (localUrl.pathname !== '' ) {
          let tempPage = localUrl.pathname.split('/')
          tempPage = tempPage[tempPage.length - 1]
          url = `/${tempPage}?${stringify(tempQuery)}`
        } else {
          return;
        }
      } else {
        tempQuery.miniAppType = 2; // 其它小程序
        url = `${urlInfo[0]}?${stringify(tempQuery)}`;
      }

      // const jumpAppId = map.query && map.query.appid || '';
      // if (!jumpAppId) {
      //   console.log('缺少appid,无法跳转~')
      //   return;
      // }
      // delete map.query.appid
      // if (jumpAppId === MY_APPID) {
      //   console.log('当前小程序不能使用mini链接跳转到当前小程序')
      //   return;
      // }
      // const jumpMiniParams = {
      //   appId: jumpAppId,
      //   path: `${url.split('//')[1]}`,
      //   envVersion: env !== 'prod' ? 'develop' : '',
      // }
      // wx.navigateToMiniProgram(jumpMiniParams);
      // return;

      map = urlMap(url); // !! 从新获取
    }
    if (type == 'render') {
      map.page = 'web-view';
      map.query.url = encodeURIComponent(url);
    }
    const currentPage = this.pageName;
    // if(!map.page && currentPage !== pages.defaultPage) {
    //   map.page = pages.defaultPage;
    // }
    console.log(map.page,'map.page')
    if (map.page === 'couponskulist') {
      wx.showToast('亲，此优惠券小程序暂不支持哦，请到公众号中使用~');
      return;
    }

    // h5跳转客服页面
    if (map.page === 'service' && type === 'h5') {
      this.goService(map.query.replace);
      return;
    }
    console.log(`jump: ${map.page} <- ${url}`)
    if (!map.page) {
      console.log('暂不支持跳转当前页面');
      return;
    };
    if (map.page === currentPage) {
      Object.assign(map.query, {replace: true});
      if (map.page == 'index') {
        console.log('首页跳转首页无需跳转');
        if (tiptype == 'active') {
          this.setData({
            activeShow: false,
          })
        } else {
          this.setData({
            couponShow: false,
          })
        }
        return;
      }
    }

    // 有些h5新的页面，小程序并没有，这个时候需要打开webview
    if (type == 'h5Hsq') {
      const { pagePath } = wx.getCurPageUrl(map.page, map.query) || {};
      // 不存在
      if (!pagePath) {
        const localUrl = urlParse(url);
        const { token = '' } = api.getCommonParams();
        console.log('token:', token);
        let tempUrl = localUrl.origin + localUrl.pathname;

        let tempQuery = this.setSpm(map.query, moduleId);
        isSetSpm = true; // !!标识这个流程中是否已经修改过了spm
        tempQuery = stringify(Object.assign({}, tempQuery, { token: token }));
        tempUrl = `${tempUrl}?${tempQuery}`;
        console.log('tempUrl:',tempUrl);
        map.page = 'web-view';
        map.query.url = encodeURIComponent(tempUrl);
      }
    }

    // const tempTypeArray = ['topic', 'render', 'h5Hsq']
    if (!isSetSpm) {
      map.query = this.setSpm(map.query, moduleId);
    }

    // wx.goPage(map.page, map.query);
    this.realGoPage(map.page, map.query);
  },

  // 页面跳转
  forward(page, query = {}) {
    console.log('forward: ', page);
    if (page === 'login' || query.refresh) {
      Object.assign(query, {
        ref: this.getPageName(),
        needRefresh: true,
      });
    }
    if (!dontQuick) {
      dontQuick = true;
      // wx.goPage(page, query);
      this.realGoPage(page, query);
      dontQuick = false;
    } else {
      wx.showToast('您点击太快了');
    }
  },
  // 统一添加spm
  setSpm(query, moduleId) {

    const app = getApp();
    let tempTag = false;
    let newSpm = {}
    if (query.spm) {
      tempTag = true;
      // 更新spm
      newSpm = app.parsingSpm(query.spm);
    }
    // 更新spm 第三段
    if (moduleId) {
      tempTag = true;
      newSpm.block = moduleId
    }
    // 这里主要 需要一起更新
    if (tempTag) {
      app.updatedSpm(newSpm)
    }

    let tempQuery = clone(query);
    const { currentSpm, pre_spm } = xmini.store.state.spm;
    tempQuery.spm = currentSpm;
    tempQuery.pre_spm = pre_spm;

    return tempQuery
  },
  back(step, query = {}) {
    let opts;
    if (typeof step === 'number' || typeof step === 'undefined') {
      opts = {
        delta: step || 1,
      };
    } else if (typeof step === 'string') {
      opts = {
        url: `${step}?${stringify(query)}`,
      };
    }
    wx.navigateBack(opts);
  },

  realGoPage(page, query) {
    // piwik统计数据, 如果当前URL没有携带统计数据则使用上页数据
    const { pageQuery } = this;
    // if (!query.spm) {
    //   query.spm = (pageQuery && pageQuery.spm);
    // }

    if (!query.channel_id) {
      query.channel_id = (pageQuery && pageQuery.channel_id);
    }
    const pageName = this.getPageName();
    query.refer = 'pages/' + pageName + '/' + pageName;

    console.log('====page:' + page + ', query:' + JSON.stringify(query));

    wx.goPage(page, query);
  },

  refresh() {
    console.info('need refresh => do onLoad();');
    // 不要直接使用onLoad，会丢失query参数以及导致页面初始化重置onPageInit
    // this.onLoad();
  },

  postMessage(page, opts = {}) {
    if (!allPages[page] && !msgPages[page] || page === this.getPageName() ) {
      console.error(`无法给 ${page} 页面发消息`);
      return;
    }
    const msgKeys = msgPages[page] || [];
    msgKeys.forEach((msgKey, index) => {
      if (!messages[msgKey]) messages[msgKey] = {};
      Object.assign(messages[msgKey], opts);
    });
  },

  onMessage() {
    const page = this.getPageName();
    const msgKey = `${page}:${this.pageId}`;
    let message;
    if (allPages[page] || messages[msgKey]) {
      message = messages[msgKey] || {};
      delete messages[msgKey];
      if (message.needRefresh) {
        // wx.showToast('触发刷新');
        // delete messages[msgKey];
        this.refresh();
        // wx.trigger({
        //   hsq: 'refresh',
        // });
      }
    }
    return message || {};
  },
  initUdesk(cb) {
    reTry = 3;
    udeskData = storage.get("UDESK_DATA") || {};
    if (udeskData && udeskData.uuid) {
      wx.hideLoading();
      cb && cb();
      return;
    }
    api.getUdesk({},
      res => {
        udeskData = res.data;
        storage.set("UDESK_DATA", udeskData, 86400);
        cb && cb();
      },
      err => {
        udeskData = {};
        // wx.showToast('udesk 初始化失败');
      }
    );
  },
  goService(isReplace = 0) {
    // data
    const nowPageName = this.getPageName();
    xmini.piwikEvent('客服', nowPageName || '');
    if (udeskData && udeskData.uuid) {
      let udeskParams = this.getUdeskParams();
      // let productParams = {};
      const { logged, userInfo } = xmini.store.state.user
      console.log('用户信息:');
      console.log(userInfo);
      if (!logged) {
        wx.goPage('login');
        return;
      }
      // udeskParams.c_name = udeskParams.customer_name + '--' + userInfo.user_id;
      udeskParams.c_name = userInfo.user_id;
      this.getOpenIm(udeskParams, isReplace);
    } else {
      // 简单的重试
      console.log(reTry);
      if (reTry-- > 0) {
        setTimeout(() => {
          this.initUdesk(() => this.goService(isReplace));
        }, 100);
      } else {
        // this.showToast('初始化客服数据失败');
        wx.showToast('初始化客服数据失败')
      }
    }
  },
  getOpenIm(imParams, isReplace, pluginId = '40456') {
    wx.showLoading();
    api.getOpenIm({},
      res => {
        wx.hideLoading()
        const { data = {} } = res;
        imParams = Object.assign({}, imParams, data);

        let udeskParams = stringify(imParams) + `&web_plugin_id=${pluginId}`;
        console.log('https://doweidu.udesk.cn/im_client/?' + udeskParams);
        this.forward('service', { url: encodeURIComponent(`https://doweidu.udesk.cn/im_client/?${udeskParams}`), replace: isReplace })
      },
      err => {
        console.log(err);
      }
    )
  },
  getUdeskParams() {
    return {
      tenant_id: udeskData.uuid, // 租户ID，是平台的ID
      merchant_euid: udeskData.merchant_id, // 商户euid，是要链接的商户的id，这个是商户的唯一标识，平台在创建商户的时候指定的这个id
      customer_euid: udeskData.euid, // userId
      customer_name: udeskData.name, // userName
    };
  },
  // 处理对象
  // _compact(obj){
  //   for (var item in obj){
  //     obj[item] = decodeURIComponent(obj[item]);
  //     if(!obj[item]){
  //       delete obj[item];
  //     }
  //   }
  //   return obj;
  // },
  dealParams(params) {
    var str = ''
    for (var item in params) {
      str += encodeURIComponent(item) + '=' + encodeURIComponent(params[item]) + '&'
    }
    return str
  },

  // 上报神策数据
  reportData(eventName, data) {
    const app = getApp();
    eventName = eventName.replace(/-/g, '_');
    data.pageName = this.route;
    app.sc_stats.track(eventName, {
      ...data
    });
  },
};

module.exports = mixins;
