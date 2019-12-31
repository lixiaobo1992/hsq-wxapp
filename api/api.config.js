
import { clone } from '../utils/index';
/**
 * API 命名规则
 * - 使用 camelCase 命名格式（小驼峰命名）
 * - 命名尽量对应 RESTful 风格，`${动作}${资源}`
 * - 假数据增加 fake 前缀
 * - 便捷易用大于规则，程序是给人看的
 */
let params = {};
let reqHeaders = {};

// api 列表
// https://dapi.cloudai.net/swagger-ui.html
export const modelApis = {
  // 初始化配置
  test: '/test',
  getConfig: '/common/initconfig',
  getProductDetail: '/product/productdetail',

  // 普通商品
  getItemInfo: '/product/iteminfo',

  // formId
  formidSubmit: 'POST /market/formid/submit',
  // 主站专题
  getTopicInfo: '/product/topicskusinfo',
  getTopicList: '/product/topicskulist',
  // 个人中心
  getProfile: '/user/usercenter',
  //好会员信息
  getMemberInfo: '/member/hsgmembersaleguide', // 个人中心开卡导购
  getProductMemberInfo: '/member/hsqmemberproductsaleguide',//商详页开卡导购
  // 拼团相关
  getCoupleList: '/product/coupleskulist',
  getCoupleListV1: '/product/coupleskulist_v1',
  getCoupleDetail: '/product/coupleskudetail',
  getMerchantList: '/merchant/coupleskulist',      // 店铺列表页使用这个接口
  coupleOrderInit: 'POST /order/coupleorderinit',
  coupleOrderList: '/user/usercouplelist',
  coupleOrderDetail: '/user/usercoupleorderdetail',
  coupleUserList: '/market/pinactivitiesuserlist', // 分享页拼团头像列表
  coupleShareDetail: '/user/coupleactivitiedetail', // 分享详情
  coupleRecommend: '/user/recommendpinactivities', // 拼团推荐位
  coupleSearchlist: '/market/pinactivitiessearch', // 拼团搜索、分类结果页

  // getCategoryList:'/category/categoryList', //分类列表
  getCategoryList: '/category/categorylist_v1', //分类列表
  getCategoryAd: '/category/categoryadlist', // 获取分类下的banner
  //满减活动区域
  getCollectProductList: '/product/collectbillsfullreducelist', //凑单满减列表
  // 首页
  getIndex: '/common/index_v2',
  // 今日新品
  getNewSkuList: '/market/newskulist',

  // 主流程
  orderInit: 'POST /order/orderinit',
  orderSubmit: 'POST /order/submitorder',
  orderPay: 'POST /order/orderpay',
  orderPayConfirm: '/order/orderpayconfirm', // 确认支付状态
  getUserOrders: '/order/getuserorders', // 订单列表
  getNeedCommentOrders: '/order/waitcommentlist', // 待评论
  getUserRefundorders: '/order/userrefundorder', // 退款
  getUserServiceOrders: '/order/userserviceorders', // 售后
  orderCancel: 'POST /order/cancelorder', // 取消订单

  orderInit_v1: 'POST /order/orderinit_v1', // 单独够 订单初始化
  orderSubmit_v1: 'POST /order/submitorder_v1', // 提交订单
  orderCheck:'POST /order/ordersharediscountcheck', //订单检测

  orderDetail: '/order/orderdetail', // 订单详情
  subOrderInfo: '/tradecenter/suborderinfo', // 子订单详情
  confirmReceived: 'POST /order/userorderconfirm', // 确认收货
  orderComplaint: 'POST /refund/complaint', // 订单申诉
  removeLikeProduct: 'POST /user/unlikeproduct', // 取消收藏商品
  addLikeProduct: 'POST /user/likeproduct', // 收藏商品
  getFavoriteList: '/user/likeproductlist', // 收藏商品列表

  checkDelivery: '/product/checkdelivery', //查询运费信息

  // 优惠券
  checkPromotion: '/order/checkpromotion',   // 确认订单-选择优惠券
  getUserCouponList: '/user/couponlist',     // 我的优惠券列表
  getCouponInfo: '/user/getcouponinfo',     // 获取用户领用的优惠券
  addCoderedeem: 'POST /reward/coderedeem',  // 添加优惠券码
  getCouponSkuList: '/coupon/couponskulist', // 单品sku列表
  getHotSearch: '/common/hotsearchsug',      // 热门搜索
  getSearchSuggest: '/market/searchsuggest',  //搜索建议

  getMerchantCouponlist: '/reward/merchantcouponlist', //优惠券列表
  codeRedeem:'POST /reward/coderedeem', //券码核销

  //好会员
  bussinessOrderPay: 'POST /bussiness/bussinessorderpay',

  // 退款相关
  refundInit: '/refund/init',
  refundDetail: '/refund/detail',
  refundApply: 'POST /refund/apply',
  // 登录注销
  login: 'POST /user/login',
  logout: 'POST /user/logout',

  userAuthPrepose: '/user/userauthprepose',
  // 地址管理
  addressList: '/user/addresslist',
  addAddress: 'POST /user/addaddress',
  updateAddress: 'POST /user/updateaddress',
  setDefaultAddress: 'POST /user/setdefaultaddress',
  deleteAddress: 'POST /user/deleteaddress',
  provinceList: '/nation/provincelist',
  cityList: '/nation/citylist',
  districtList: '/nation/districtlist',
  getCityId: '/common/gpstogeo',
  // 查看物流
  getDelivery: '/order/deliverymessage',
  // 获取七牛 token
  getQiniuToken: '/common/qiniutoken',
  // udesk
  getUdesk: '/user/getudesk',

  // 抽奖团
  getLotteryList: '/market/lotteryactivitylist',
  getLotteryInfo: '/market/lotteryactivityinfo',
  getLotterySubScribe: 'POST /market/subscribelottery',
  getLotteryShareDetail: '/market/lotterysharedetail',
  getLotteryWinInfo: '/market/lotteryinfo', // 中奖详情

  getRecentpinevents: '/common/recentpinevents', // 首页顶部浮动轮播消息

  // 浏览记录
  getViewHistory: '/product/browseskulist',
  // 精选推荐
  getRecommendlist: '/product/selfrecommendlist',
  // 获取店铺信息
  getMerchantInfo: '/merchant/merchantinfo',
  // 收藏店铺
  userLikeMerchat:'POST /user/likemerchant',
  // 取消店铺收藏
  removeLikeMerchat: 'POST /user/unlikemerchant',
  // 获取公告
  getListMsgboard: '/msgboard/getlistmsgboard',
  // 获取首页自定义弹窗
  getServiceConfig: '/common/serviceconfig',
  // 添加优惠券
  couponRedeem: 'POST /coupon/couponredeem',
  // 获取udesk需要的参数
  getOpenIm: 'POST /udesk/openim',
  // 活动消息提醒
  setActivitySubscribe: 'POST /activity/subscribe',

  // 购物车相关接口

  addSkuToCart: 'POST /user/addskutocartv1',                 // 添加到购物车和购物车数量修改
  removeInvalidCartSku: 'POST /user/removeinvalidcartsku',   // 清空失效商品
  deleteCartSku: 'POST /user/deletecartskuv1',               // 删除购物车商品
  getUserCart: '/user/getusercartv1',                        // 获取购物车数据
  editCartSku: 'POST /user/editcartsku',                     // 修改购物车sku规格接口
  getCanChooseSku: '/user/getcanchoosesku',                  // 购物车获取sku可选规格
  getNewActivityStauts: '/activity/selectedskusfullreduce', // 获取最新的购物车活动状态
  getOrderResult: '/tradecenter/ordersuccess_v1',            // 普通订单完成回调

  // 边走边吃
  stepReport: 'POST /eatwalk/stepreport', // 发送任务完成

  getCollectProductList: '/product/collectbillsfullreducelist', //凑单列表

  // 助力免单
  getAcceleratorInfo: 'GET /activity/bbhhelpfreeaccelerator',// 进入助力页面初始弹窗信息（包括助力）
  getZeroBoostIndex: 'GET /activity/bbhhelpfreeindex',// 助力列表基本信息
  getZeroBoostTask: 'POST /activity/bbhgethelpfreetask', // 助力列表领取任务
  getHistoryTask: 'GET /activity/bbhuserhistorytask', // 助力列表好货晒单(分页)
  getUserHelpHistory: 'GET /activity/bbhuserhelphistory', // 助力列表好友助力记录（分页）
  getTaskSkuList: 'GET /activity/bbhhelpfreetaskskulist', // 助力列表获取任务列表（分页）
  doTaskConvert: 'POST /activity/bbhdotaskconvert', // 助力列表兑换接口
  doTaskStart: 'POST /activity/bbhdotask', // 进入页面开始做任务
  doTaskFinish: 'POST /activity/bbhaddzerotaskrate', // 离开页面结束做任务
  getZlV2Data: 'GET /activity/bbhhelpfreetemple', // 获取助力免单底部模块数据
};

export const commonParams = {
  init(data) {
    params = clone(data);
  },
  set(obj) {
    Object.assign(params, obj);
  },
  get(key) {
    return key ? clone(params[key]) : clone(params);
  },
};

export const headers = {
  init(data) {
    reqHeaders = clone(data);
  },
  set(obj) {
    Object.assign(reqHeaders, obj);
  },
  get(key) {
    return key ? clone(reqHeaders[key]) : clone(reqHeaders);
  },
};

const apiConfig = {
  modelApis,
  commonParams,
  headers,
};

export default apiConfig;
