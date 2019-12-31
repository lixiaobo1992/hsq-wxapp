
import urlParse from './url-parse/index';

const { qs } = urlParse;

// // 测试URL
// const schemaUrl = 'haoshiqi://com.doweidu/home?position=topbar&spm=abc123/cxy';
// const h5Url = 'http://10.0.255.231:8000/t.html#ali_zt?channel_id=huabei&d_host=alipay&topic_code=74152227bc6c29ac14ce772abab6aeda&zt_active=20180201_ea0207&spm=huabei/hbcjy227&ref=profile%3Fchannel_id%3Dh5';

// // 解析以上H5, 没有query，格式上不规范，出现问题，需要支持与下面URL解析等效
// // 通过 tempHash 运算兼容处理
// const h5UrlOk = 'http://10.0.255.231:8000/t.html?channel_id=huabei&d_host=alipay&topic_code=74152227bc6c29ac14ce772abab6aeda&zt_active=20180201_ea0207&spm=huabei/hbcjy227&ref=profile%3Fchannel_id%3Dh5#ali_zt';

// // h5
// const test11 = 'https://m.haoshiqi.net/#zt_template?topic_code=86cdc05e3067cb7bafed2daf963a22ce'; // 专题
// const test12 = 'https://m.beta.haoshiqi.net/#couple_detail?pinactivitiesid=4765&sid=581&channel_id=h5&ref=portal%3F&spm=h5.10.109';
// const test13 = 'http://m.beta.haoshiqi.net/#detail?sid=113';
// const test14 = 'http://m.beta.haoshiqi.net/#merchant?merchantid=101';
// const test15 = 'http://m.beta.haoshiqi.net/#couple_share?pineventid=706705&showInvite=true';
// const test16 = 'https://m.haoshiqi.net/#couple_search_list?category=休闲零食'
// const test17 = 'https://m.haoshiqi.net/index.html#couple_search_list?category=休闲零食'

// // SCHEME
// const test21 = 'haoshiqi://com.doweidu/sku?skuId=581';
// const test22 = 'haoshiqi://com.doweidu/couplesbuydetail?pinActivityId=4751';
// const test23 = 'haoshiqi://com.doweidu/lotteryactivitylist';
// const test24 = 'haoshiqi://com.doweidu/lotteryactivitydetail?pinActivityId=9041';
// const test26 = 'haoshiqi://com.doweidu/merchant?merchantId=172';
// const test27 = 'haoshiqi://com.doweidu/couplessearch?searchTag=含乳饮品';
// const test28 = 'haoshiqi://com.doweidu/couplescategory?categoryName=饼干糕点';
// const test29 = 'haoshiqi://com.doweidu/activityshare?activityId=1';
// const test210 = 'haoshiqi://com.doweidu/couplessearch?searchTag=含乳饮品';

// urlParse(schemaUrl);
// urlParse(h5Url);

// console.log(urlParse(h5Url))

// url 映射规则
const h5toMiniRules = {
  portal: { target: 'index' },
  zl_list: { target: 'zl-list' },
  zt_template: { target: 'zt2' },
  couple_detail: { target: 'detail', params: { pinactivitiesid: 'id' } },
  detail: { target: 'detail2', params: { sid: 'id' } },
  profile: { target: 'profile' },
  search: { target: 'search' },
  sort_search: { target: 'category' },
  couple_search_list: { target: 'couple-search-list', params: { search: 'q' } },
  couple_share: { target: 'couple-share', params: { pineventid: 'id' } },
  pin_share: { target: 'pin-share', params: { pineventid: 'id' } },
  lottery_list: { target: 'lottery-list' },
  lottery_detail: { target: 'lottery-detail', params: { pinactivitiesid: 'id'} },
  coupon: {target: 'coupon-list'},
  service: { target: 'service' },
};
const newH5ToMiniRules = {
  'index': { target: 'index' },
  'couple-detail': { target: 'detail'},
  'detail': { target: 'detail2' },
  'couple-search-list': { target: 'couple-search-list' },
  search: { target: 'search' },
  zt: { target: 'zt' },
  zt2: { target: 'zt2' },
  category: { target: 'category' },
  'coupon-list': { target: 'coupon-list' },
  'lottery-list': { target: 'lottery-list' },
  'lottery-detail': { target: 'lottery-detail' },
  'couple-share': { target: 'couple-share' },
  profile: { target: 'profile' },
  merchant: { target: 'merchant'},
  'shopping-cart': { target: 'shopping-cart'},
  'order-result': { target: 'order-result' },
  'member-open': { target: 'member-open' },
  'member-center': { target: 'member-center' },
  'full-reduction': { target: 'full-reduction' },
  'phone-cost': { target: 'phone-cost' },
  'order-list': { target: 'order-list' },
  'zl-list': { target: 'zl-list' },
}
const schemaToMiniRules = {
  home: { target: 'index' },
  couplesbuydetail: { target: 'detail', params: { pinActivityId: 'id' } },
  // 拼团单品sku列表（优惠券）
  groupcouponskulist: { target: 'coupon-sku-list' },
  // 普通单品sku列表（优惠券）
  couponskulist: { target: 'couponskulist' },
  lotteryactivitydetail: { target: 'lottery-detail', params: { pinActivityId: 'id' } },
  // 小程序内不再支持新的 schema 跳转配置
  // merchant: { target: 'merchant', params: { merchantId: 'id' } },
  // 分类列表 & 搜索
  // couplessearch: { target: 'couple-search-list', params: { searchTag: 'q' } },
  // couplescategory: { target: 'couple-search-list', params: { categoryName: 'category' } },
  // activityshare: { target: 'couple-share', params: { activityId: 'id' } },
  // search: { target: 'search', params: { categoryName: 'category' } },
};

// 逆向转换映射规则
// function reverseRules(rules) {
//   const miniRules = {};
//   for (let key in rules) {
//     let item = rules[key];
//     miniRules[item.target] = {
//       na: key,
//       params: {}
//     }

//     for(let key in item.params) {
//       const param = item.params[key];
//       miniRules[item.target].params[param] = key;
//     }
//   }

//   return miniRules;
// }

// const miniToH5Rules = reverseRules(h5toMiniRules);
// const miniToSchemaRules = reverseRules(schemaToMiniRules);


/**
 * 获取url类型
 * 暂时不支持跳转 schema 链接
 *
 * @param {any} url [schema, h5, mini, other]
 */
const types = {
  miniUrlType: /^miniapp:\/\//i, // 小程序跳转
  schemaType: /^haoshiqi:\/\//i,
  h5Hsq: /(m(\.dev|\.beta)?\.haoshiqi\.net\/v2)/i,
  h5: /^(https|http):\/\//i,
  h5Render: /(render(\.dev|\.beta)?\.doweidu\.com)/i, //静态文件
  topicType: /(topic(\.dev|\.beta)?\.doweidu\.com)/i, //活动专题
    // 手机号，h5用a标签写，不走事件，小程序走事件
  tel: /^tel:/i,
    // 领优惠券
  jsCoupon: /javascript\:tpBridge.getCoupon\(\'(.*?)\'\)/,
};

export function getUrlType(url) {
  if (types['miniUrlType'].test(url)) return 'miniapp';
  if (types['schemaType'].test(url)) return 'schema';
  if (types['h5Hsq'].test(url)) return 'h5Hsq';
  if (types['topicType'].test(url)) return 'topic';
  if (types['h5Render'].test(url)) return 'render';
  if (types['h5'].test(url)) return 'h5';  // 暂时笼统判断都是hsq Url
  if (types['tel'].test(url)) return 'tel';
  if (types['jsCoupon'].test(url)) return 'jsCoupon';
  return 'other';
}

function queryMap(params = {}, target = {}) {
  for (let key in params) {
    if (target[key]) {
      params[target[key]] = params[key];
      delete params[key];
    }
  }
  // 暂时不要 ref，这个需要两次 encode，否则其中的?会打断参数
  delete params.ref;
  return params;
}

function getMiniUrl(url = '') {
  // url = test11;
  // url = test12;
  // url = test22;
  // url = test28;
  // url = test17;
  // url = test32;

  // 获取小程序url，直接拼好参数
  const urlType = getUrlType(url);
  const localUrl = urlParse(url);
  let {
    host = '',
    hash = '',
    pathname = '/',
    query = '',
  } = localUrl;

  pathname = pathname.substr(1);
  pathname = pathname.replace(/^v2(\/)?/i, '');
  if (pathname == '') pathname = 'index';

  // 兼容 query 前的 hash
  const tempHash = hash.split('?');
  hash = tempHash[0].replace('#', '');
  const tempQuery = tempHash[1] || '';
  console.log(query);
  query = Object.assign({}, qs.parse(tempQuery), qs.parse(query));
  let path;
  let pageMap = {};
  let target;
  switch (urlType) {
    case 'schema':
      path = pathname || 'home';
      pageMap = schemaToMiniRules[path] || {};
      query = queryMap(query, pageMap.params)
      break;
    case 'h5Hsq':
      path = pathname || 'index';
      pageMap = newH5ToMiniRules[path] || {};
      query = queryMap(query, pageMap.params)
      break;
    case 'h5':
      path = hash || 'portal';
      pageMap = h5toMiniRules[path] || {};
      query = queryMap(query, pageMap.params)
      break;
    case 'miniapp':
      pageMap = {
        target: `${host}/${pathname}` || '' // pages/comment-list/comment-list
      };
      query = queryMap(query)
      break;
    default:
      // do nothing...
  }
  return {
    query,
    page: pageMap.target,
  };
}

// export default getMiniUrl;
module.exports = {
  urlMap: getMiniUrl,
  getUrlType: getUrlType,
}
