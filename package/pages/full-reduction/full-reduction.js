import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../../config/xmini';
import mixins from '../../../utils/mixins';
import api from '../../../api/index';
import {
  dealPrice,
  mapTo,
  pullList,
} from '../../../utils/index';

xPage({
  ...mixins,
  ...pullList,
  data:{
    activity_detail:'',
    list: [],
    text:'已到底，没有更多商品啦~',
  },
  onLoad(query){
    this.onPageInit(query);
    this.refresh(query.id, query.merchantId );
    this.setData({
      id: query.id,
      merchantId: query.merchantId,

    });
  },
  onShow(){
    // this.getProductList();
  },
  refresh(id, merchantId){
    this.initPullList();
    wx.showLoading();
    this.pullParams.activityId = id;
    this.pullParams.merchantId = merchantId;
    this.pullParams.scope = this;
    this.pullParams.weights = 1;

    this.pullModel = api.getCollectProductList;
    this.setData({
      isLoading: true,
    })
    // 主动触发加载事件
    this.onScrollToLower();
  },
  onUnload(){},
  dealList(list=[]){
    return mapTo(list, (item,index) => {
      return {
        ...this.dealItem(item),
        tags:this.dealTags(item.tags || []),
        market_price: dealPrice(item.market_price),
        price: dealPrice(item.price),
        member_price:dealPrice(item.member_price),
        expired_date_text: item.expired_date_text_one,
        'piwikName':'c_pinpro',//暂无
        'piwikData':{
          index,
          pinActivitiesId:item.biz_id,
        },
      };
    });
  },
  //处理逻辑标签
  dealTags(tags){
    return tags;
  },
  //收缩/展开逻辑
  onShowAll(e){
    const { index } = e.currentTarget.dataset;
    const status = this.data.list[index].showupArrow;
    this.setData ({
      [`list[${index}].showupArrow`]: !status
    })
  },
  //处理item
  dealItem(item){
      return Object.assign(item, {showupArrow:true},{ arrowClick: item.tags.toString().length > 42});
  },
  afterPull(res) {
    console.log(res,'res');
      const { activity_detail = ''} = res.data;
      this.setData({
        activity_detail,
      });
    this.setData({
      isLoading: false
    })
    if (this.pullParams.pageNum != 1) return
      delete this.pullParams.scope;
      delete this.pullParams.weights;
  },
  afterPullData(res){
    console.log(res,'res');
  },
  goDetail(e){
    console.log('去商详页',this.data);
    const { index } = e.currentTarget.dataset;
      const currentItem = this.data.list[index] || {};
      const { can_bought, link } = currentItem;
      console.log(currentItem,'currentItem');
      if (link) {
        this.onUrlPage(e);
      };
  },
  addCart(e){
    const { skuid = "" } = e.currentTarget.dataset;
    xmini.piwikEvent('coudanaddbtn',{
      activityid:this.data.activityid,
      merchantid:this.data.merchantid,
    });
    api.addSkuToCart(
      {
        type: 1,
        skuId: skuid,
        amount: 1,
      },
      res => {
        this.updateUserCart();
        wx.showToast('添加购物车成功');
      }
    )
  },
  updateUserCart(){
    api.getUserCart(
      {
        isLoading: false,
      },
      res => {
        // this.setData({
        //   cartNumber: res.data.total_sku_cnt,
        // });
      },
      err =>{
        return true;
      }
    );
  }
});
