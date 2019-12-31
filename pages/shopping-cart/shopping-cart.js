import {
  me,
  xmini,
  mapState,
  xPage
} from '../../config/xmini';
import api from '../../api/index';
import { isRedDot, dealPrice, clone } from '../../utils/index';
import mixins from '../../utils/mixins';

// import mockData from './mock.json';

import skuMixin from '../../components/sku-select/skuMixin';
import coupon from '../../components/coupon-list/coupon';

let newActivityRequestIndex = 0; // 请求位置 防止同时请求返回数据相互覆盖问题

xPage({
  ...mixins,
  ...skuMixin,
  ...coupon,
  _data: {
    selectedSkuArray: [], // 当前已选sku list
    selectedMerchantArray: [],

    tempSkuId: 0, // 临时skuid
  },
  data: {
    isLoading: false,

    currentEditStatus: 0, // 0 未编辑状态 1 编辑状态
    isAllSelect: false, // 是否全选

    shoppingCartList: [], // 购物车列表
    allMerchantStauts: {}, // 商家状态
    allSkuStauts: {}, // sku 状态
    allActivityStauts: {}, // 活动状态

    totalPrice: 0, // 合计
    totalPriceText: 0,

    selectCount: 0, // 当前选择的数量
    productCount: 0, // 商品数量

    loseGoodsList: [], // 失效商品列表

    // sku 滑动
    swipeIndex: null, //
    isSwitch: true, // 一个开关 当是编辑状态时禁止 滑动

    // sku
    isShowPopup: false, // v-model

    normSelectTag: 0,
    currentSum: 1,
    maxBuySum: 10,
    skuBtnStatus: {
      isBtnActive: true, // 按钮否可用
      buyBtnText: '确认',
      cartBtnText: '确认',
    },

    attrList: [],
    skuStocksList: {}, // 属性ID 对应 sku列表

    // defaultSelectedIds: [], // 默认已选择id
    // defaultSkuData: {}, // 默认skuData
    currentSkuData: {}, // 当前skuData

    selectedAttrName: [], // 已选择 attr
    notSelectedAttrName: '', // 未选择属性提示
    // sku end

    showCoupons:false,
    coupons: [],
    sucToast: false,
    promotions: [],
    onShowPromotionInfo: false,

    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    })
  },
  onLoad() {
    //
  },

  onShow() {
    this.updatadSpmPage(); // 新增更新spm 三段中的 page
    console.log('shopping-cart::', this)
    this.refresh();
    isRedDot(false);
  },
  refresh() {

    this.setData({
      isLoading: true,
      isAllSelect: false,
      // merchantList: [],
    });
    this.getShopCart()
  },
  onAuthSuccess() {
    this.getShopCart();
  },
  skuDataOnChange(skuData = {}) {
    console.log('=======来新的sku了', skuData);
    if (!skuData.skuid) return;
    // this.getItemInfo(skuData.skuid);
    this.getSkuAttr({
      currentTarget: {
        dataset: {
          skuid: skuData.skuid,
          change:1
        }
      }
    })
  },
  // 底部按钮
  footerBtnEvent() {
    if (this.data.currentEditStatus) {
      this.deleteSkuEvent();
    } else {
      // 提交订单
      this.submitOrder();
    }
  },
  // 去付款
  submitOrder() {
    if (!this._data.selectedSkuArray.length) {
      wx.showToast('请选择要购买的商品');
      return
    }

    let skus_info = [];
    for (let i = 0; i < this._data.selectedSkuArray.length; i++) {
      const skuid = this._data.selectedSkuArray[i];
      const currentSku = this.data.allSkuStauts[skuid];

      skus_info.push({
        s: currentSku.sku_id,
        c: currentSku.amount,
        p: currentSku.price
      })
    }

    xmini.piwikEvent('c_gopay',{
      skuids: this._data.selectedSkuArray.join(',')
    })

    this.forward('order-commit2',{
      skus_info: JSON.stringify(skus_info)
    })
  },
  // 编辑按钮事件
  onChengeEditStatus() {

    this.setData({
      currentEditStatus: this.data.currentEditStatus ? 0 : 1,
      isSwitch: this.data.currentEditStatus ? true : false,
    })
  },
  //!! 滑动右侧点击
  onRightItemClick(e) {
    console.log('onRightItemClick', e)
    const { type, skuid } = e.currentTarget.dataset;
    const currentSku = this.data.allSkuStauts[skuid];
    if (type == 'delete') {
      this.deleteSkuEvent({
        extra: currentSku.swiper_action.extra
      });
    } else if(type == 'edit') {
      this.collectionEvent({
        extra: currentSku.swiper_action.extra
      });
    }
  },
  // 全部选择 on && off
  allChooseEvent(){
    if (this.data.isAllSelect) {
      this._data.selectedSkuArray = [];
      this._data.selectedMerchantArray = [];
    } else {
      const allSkuStautsKey = Object.keys(this.data.allSkuStauts);
      const allMerchantStautsKey = Object.keys(this.data.allMerchantStauts);
      this._data.selectedSkuArray = allSkuStautsKey;
      this._data.selectedMerchantArray = allMerchantStautsKey;
    }

    // todo 更新价格及状态
    // 更新sku状态
    this.upDatedSkuSelectdStauts();
    // 更新店铺状态
    this.upDatedMerchantSelectdStauts();
    // 更新全选状态
    this.upDatedAllSelectStauts();
    // 计算当前合计&结算数量
    this.calculationTotal();

    // 获取最新活动状态
    this.getNewActivityStauts()
  },
  // 店铺全选on && off
  merchantAllChooseEvent(e) {
    //
    let { merchantid } = e.currentTarget.dataset;
    merchantid+=''; // 转字符串
    const currentMerchantStauts = this.data.allMerchantStauts[merchantid] || { sku_list: [] }
    const isBeing = this.merchantIdDoesItExist(merchantid); // 是否真的已选（存在与已选商家数组里）
    if (isBeing) {
      const index = this._data.selectedMerchantArray.indexOf(merchantid);
      if (index > -1) {
        this._data.selectedMerchantArray.splice(index, 1);
      }
      // 便利 当前店铺下sku 是否存在已选sku数组里的 有就删除
      for (let i = 0; i < currentMerchantStauts.sku_list.length; i++) {
        const skuid = currentMerchantStauts.sku_list[i];
        if (this.skuIdDoesItExist(skuid)) {
          let tempIndex = this._data.selectedSkuArray.indexOf(skuid);
          if (tempIndex > -1) {
            this._data.selectedSkuArray.splice(tempIndex, 1);
          }
        }
      }
    } else {
      this._data.selectedMerchantArray.push(merchantid);
      // 便利 当前店铺下sku 是否存在已选sku数组里的 没有就添加
      for (let i = 0; i < currentMerchantStauts.sku_list.length; i++) {
        const skuid = currentMerchantStauts.sku_list[i];
        if (!this.skuIdDoesItExist(skuid)) {
          this._data.selectedSkuArray.push(skuid);
        }
      }
    }

    // todo 更新价格及状态
    // 更新sku状态
    this.upDatedSkuSelectdStauts();
    // 更新店铺状态
    this.upDatedMerchantSelectdStauts();
    // 更新全选状态
    this.upDatedAllSelectStauts();
    // 计算当前合计&结算数量
    this.calculationTotal();

    // 获取最新活动状态
    this.getNewActivityStauts()

  },
  // sku选择 on && off
  skuChooseEvent(e) {
    let { skuid, merchantid } = e.currentTarget.dataset;
    skuid+=''; // 转字符串
    merchantid+=''; // 转字符串
    // const isSelect = false; // 这里需要从已选sku 列表里捞出当前sku的状态 是否已选
    const isBeing = this.skuIdDoesItExist(skuid); // 是否真的已选（存在与已选sku数组里）
    // console.log(isBeing)
    if (isBeing) {
      // 真的存在与已选sku数组里
      // 从数组中删除
      const index = this._data.selectedSkuArray.indexOf(skuid);
      if (index > -1) {
        this._data.selectedSkuArray.splice(index, 1);
      }
    } else {
      // 将当前sku 添加到已选sku数组里
      this._data.selectedSkuArray.push(skuid);
    }

    const merchant_index = this._data.selectedMerchantArray.indexOf(merchantid);
    if (this.isMerchantAllCheck(merchantid)) {
      if (merchant_index < 0) {
        this._data.selectedMerchantArray.push(merchantid)
      }
    } else {
      if (merchant_index > -1) {
        this._data.selectedMerchantArray.splice(merchant_index, 1);
      }
    }

    // todo 更新价格及状态
    // 更新sku状态
    this.upDatedSkuSelectdStauts();
    // 更新店铺状态
    this.upDatedMerchantSelectdStauts();
    // 更新全选状态
    this.upDatedAllSelectStauts();
    // 计算当前合计&结算数量
    this.calculationTotal();

    this.getNewActivityStauts()
  },
  // 判断当前skuid 是否已选
  skuIdDoesItExist(skuid) {
    if (!this._data.selectedSkuArray.length) {
      return false;
    }
    if (this._data.selectedSkuArray.indexOf(skuid) >= 0) {
      return true;
    }
    return false;
  },
  // 判断当前merchant_id 是否已选
  merchantIdDoesItExist(merchant_id) {
    if (!this._data.selectedMerchantArray.length) {
      return false;
    }
    if (this._data.selectedMerchantArray.indexOf(merchant_id) >= 0) {
      return true;
    }
    return false;
  },
  // 判断是否全选
  isAllCheck() {
    const allSkuStautsKey = Object.keys(this.data.allSkuStauts);
    if (this._data.selectedSkuArray.length == allSkuStautsKey.length) {
      return true;
    }
    return false;
  },
  // 店铺是否全选
  isMerchantAllCheck (merchant_id) {
    if (!merchant_id) return;
    // const this.data.shoppingCartList
    const currentMerchantStauts = this.data.allMerchantStauts[merchant_id] || { sku_list: [] };
    let count = 0;
    for(let i = 0; i < currentMerchantStauts.sku_list.length; i++) {
      const sku_id = currentMerchantStauts.sku_list[i];
      if (this.skuIdDoesItExist(sku_id)) {
        count++;
      }
    }
    return currentMerchantStauts.sku_list.length == count;
  },

  // 更新sku状态
  upDatedSkuSelectdStauts() {
    const selectedSkuArray = this._data.selectedSkuArray;
    const allSkuStautsKey = Object.keys(this.data.allSkuStauts);
    const allSkuStauts = this.data.allSkuStauts;
    for (let i = 0; i < allSkuStautsKey.length; i ++) {
      const skuid = allSkuStautsKey[i];
      let isSelect = true;
      if (!selectedSkuArray.includes(skuid)) {
        isSelect = false
      }
      allSkuStauts[skuid].isSelect = isSelect
    }

    this.setData({
      allSkuStauts: allSkuStauts
    })
  },
  // 更新店铺状态
  upDatedMerchantSelectdStauts() {
    const selectedMerchantArray = this._data.selectedMerchantArray;
    const allMerchantStautsKey = Object.keys(this.data.allMerchantStauts);
    const allMerchantStauts = this.data.allMerchantStauts;
    for (let i = 0; i < allMerchantStautsKey.length; i ++) {
      const merchantid = allMerchantStautsKey[i];
      let isSelect = true;
      if (!selectedMerchantArray.includes(merchantid)) {
        isSelect = false
      }
      allMerchantStauts[merchantid].isSelect = isSelect
    }

    this.setData({
      allMerchantStauts: allMerchantStauts
    })
  },
  // 更新全选状态
  upDatedAllSelectStauts() {
    let isAllSelect = false;
    if (this.isAllCheck()) isAllSelect = true;
    this.setData({
      isAllSelect: isAllSelect,
    })
  },

  // 主要根据已选skuid 计算合计
  calculationTotal() {
    const selectedSkuArray = this._data.selectedSkuArray;
    const allSkuStauts = this.data.allSkuStauts;

    let totalPrice = 0;
    if (selectedSkuArray.length) {
      for (let i = 0; i < selectedSkuArray.length; i++) {
        let skuid = selectedSkuArray[i];
        const currentSkuStauts = allSkuStauts[skuid];
        totalPrice = totalPrice + (currentSkuStauts.price * currentSkuStauts.amount);
      }
    }

    this.setData({
      totalPrice,
      totalPriceText: dealPrice(totalPrice),
      selectCount: selectedSkuArray.length || 0, // 选择的数量
    })
  },
  // 更新活动状态
  upDatedActivityStauts(newActivityList = []) {
    const allActivityStauts = clone(this.data.allActivityStauts);
    for (let i = 0; i < newActivityList.length; i++) {
      const newCurrentActivity = newActivityList[i];
      const currentActivity = allActivityStauts[newCurrentActivity.activity_id];
      if (currentActivity) {
        // 记录活动信息
        let link_desc = '去凑单';
        if (newCurrentActivity.link_type == 2) {
          link_desc = '再逛逛'
        }
        allActivityStauts[newCurrentActivity.activity_id] = {
          ...currentActivity,
          ...newCurrentActivity,
          link_desc
        };
      }
    }

    this.setData({
      allActivityStauts,
    })
  },
  // 获取最新活动状态
  getNewActivityStauts() {

    this.setData({}, () => {

      const selectedSkuArray = this._data.selectedSkuArray;
      const allSkuStauts = this.data.allSkuStauts;
      // 组装数据
      // if (!selectedSkuArray.length) return

      let selectedParams = [];
      let merchantArray = {};

      for (let i = 0; i < selectedSkuArray.length; i++) {
        const skuid = selectedSkuArray[i];
        const currentSku = allSkuStauts[skuid];
        const tempObj = {
          skuId: skuid,
          price: currentSku.price,
          amount: currentSku.amount
        }
        if (!merchantArray[currentSku.merchant_id]) {
          merchantArray[currentSku.merchant_id] = [tempObj];
        } else {
          merchantArray[currentSku.merchant_id].push(tempObj);
        }
      }
      for (let key in merchantArray) {
        selectedParams.push({
          merchantId: key,
          skuInfos: merchantArray[key]
        })
      }

      console.log('selectedParams',selectedParams);

      // !!防止快速点击时多个请求返回不同步问题
      const qIndex = newActivityRequestIndex;
      newActivityRequestIndex++;

      api.getNewActivityStauts({
        selectedParams: JSON.stringify(selectedParams),
        skuIds: Object.keys(allSkuStauts).toString()
      }, (res) => {
        //
        if (newActivityRequestIndex - 1 > qIndex) {
          return;
        }
        const { list = [] } = res.data;
        this.upDatedActivityStauts(list);

      }, () => {
        return true;
      })
    })
  },
  getShopCart() {

    api.getUserCart({
      scope: this,
      weights: 1,
    }, (res) => {
      console.log(res,'getShopCart-----resdata');

      const dealData = this.dealShoppingCardData(res);

      this.setData({
        isLoading: false,
        ...dealData,
      }, () =>{

        this.calculationTotal();
      })

    }, err => {
      if (err.errno == 510010) {
        this.setData({
          isLoading: false,
        })
        return true;
      }
    })
  },

  dealShoppingCardData(res) {

    const { list = [], invalid_sku_list = [], single_sku_cnt = 0, cart_jump_url = '' } = res.data;
    let selectedSkuArray = [], selectedMerchantArray = [], allMerchantStauts = {}, allActivityStauts = {}, allSkuStauts = {};

    const tempList = list.map((merchantItem, index) => {
      // 默认全选商家
      // selectedMerchantArray.push(merchantItem.merchant_id + '');

      // 记录商家信息
      allMerchantStauts[merchantItem.merchant_id] = {
        ...merchantItem,
        isSelect: false
      };
      delete allMerchantStauts[merchantItem.merchant_id].activity_list; // 删除activity_list

      const tempActivityList = merchantItem.activity_list.map((activityItem, activityIndex) => {
        // 记录活动信息
        let link_desc = '去凑单';
        if (activityItem.link_type == 2) {
          link_desc = '再逛逛'
        }
        allActivityStauts[activityItem.activity_id] = {
          ...activityItem,
          link_desc
        }
        delete allActivityStauts[activityItem.activity_id].sku_list;

        const tmepSkuList = activityItem.sku_list.map((skuItem, skuIndex) => {
          // 这里把当前门店下面的sku 存起来
          if (!allMerchantStauts[merchantItem.merchant_id].sku_list) {
            allMerchantStauts[merchantItem.merchant_id].sku_list = [skuItem.sku_id+''];
          } else {
            allMerchantStauts[merchantItem.merchant_id].sku_list.push(skuItem.sku_id+'');
          }

          let attrs = skuItem.attrs.join(',');
          //
          // selectedSkuArray.push(skuItem.sku_id + ''); // 转成字符串

          allSkuStauts[skuItem.sku_id] = {
            ...skuItem,

            attrsText: attrs,
            priceText: dealPrice(skuItem.price),
            merchant_id: merchantItem.merchant_id,

            isSelect: false,
            swiper_action: {
              right: [
                {
                  type: 'edit',
                  text: skuItem.is_like == 1 ? '移出收藏夹' : '加入收藏夹',
                  bgColor: '#FEA40D',
                  fColor: '#ffffff'
                },
                {
                  type: 'delete',
                  text: '删除',
                  bgColor: '#F21833',
                  fColor: '#ffffff',
                }
              ],
              extra: {
                sku_id: skuItem.sku_id + '',
                sku_index: skuIndex,
                merchant_id: merchantItem.merchant_id,
                merchant_index: index,
              }
            },
          }

          return skuItem.sku_id + '';
        })

        return {
          activity_id: activityItem.activity_id,
          sku_list: tmepSkuList,
          'piwikEvent': 'coudanentry',
          'piwikData':{
            index,
            activityid:activityItem.activity_id,
            merchantid:activityItem.merchant_id,
          }
        };
      })

      return {
        merchant_id: merchantItem.merchant_id,
        activity_list: tempActivityList,

      };
    })

    this._data.selectedSkuArray = selectedSkuArray;
    this._data.selectedMerchantArray = selectedMerchantArray;

    return {
      isLoading: false,

      allMerchantStauts,
      allActivityStauts,
      allSkuStauts,
      shoppingCartList: tempList,
      productCount: single_sku_cnt,

      loseGoodsList: invalid_sku_list || [],
      cartJumpUrl: cart_jump_url || '',
    }
  },


  // 删除sku
  deleteSkuEvent (e) {
    const _this = this;
    if (this.data.currentEditStatus) {
      const selectedSkuArray = this._data.selectedSkuArray;
      // 走选择删除
      if(selectedSkuArray.length > 0){
        wx.showModal({
          content: `确认将这${selectedSkuArray.length}个商品删除？`,
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          success: (result) => {
            if(result.confirm) {     // result.confirm  true是代表点击删除   false是取消
              _this.deletApi(selectedSkuArray)
            }
          },
        });
      }else {
        wx.showToast('请选择要删除的商品');
      }
    } else {
      const { sku_id } = e.extra;
      // 走单个点击删除
      xmini.piwikEvent('c_cartcancelsing', {
        skuid: sku_id,
      });
      // !!通过  this.selectComponent('#swiper-cell')  获取子组件的实例，可以拿到子组件的方法和数据；
      const showTwo = this.selectComponent(`#swiper-action-${sku_id}`);
      showTwo && showTwo.close();
      wx.showModal({
        content: `确认将这个商品删除？`,
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        success: (result) => {
          if(result.confirm) {     // result.confirm  true是代表点击删除   false是取消
            // this.deleteCartGoods(data);
            _this.deletApi([sku_id])
          }
        },
      });
    }

  },

  deletApi(sku_ids = []) {
    const skuids = (sku_ids || []).toString();
    console.log(skuids)
    api.deleteCartSku({
      skuIds: skuids
    },(res) => {
      this.deleteSku(sku_ids);
    },(err) => {

    })
  },

  deleteSku(sku_ids = []) {
    const { shoppingCartList = [], allMerchantStauts = {}, allActivityStauts = {}, allSkuStauts = {}} = this.data;
    const { selectedMerchantArray = [], selectedSkuArray = []} = this._data;
    const allSkuStautsKey = Object.keys(allSkuStauts);
    let tempShoppingCartList = [];
    let tempAllMerchantStauts = clone(allMerchantStauts);
    let tempAllActivityStauts = clone(allActivityStauts);
    let tempAllSkuStauts = clone(allSkuStauts);

    // 全部删除
    if (sku_ids.length == allSkuStautsKey.length) {
      tempShoppingCartList = [];
      tempAllMerchantStauts = {};
      tempAllSkuStauts = {}

      this._data.selectedMerchantArray = [];
      this._data.selectedSkuArray = [];
    } else {

      for (let j = 0; j < shoppingCartList.length; j++) {
        const merchantItem = shoppingCartList[j];
        let activity_list = [];
        for (let s = 0; s < merchantItem.activity_list.length; s++ ) {
          const activityItem = merchantItem.activity_list[s];
          let sku_list = []
          for (let t = 0; t < activityItem.sku_list.length; t++) {
            const sku_id = activityItem.sku_list[t];
            if (!sku_ids.includes(sku_id+'')) {
              sku_list.push(sku_id);
            } else {
              // 删除 sku 数据
              delete tempAllSkuStauts[sku_id];
              // 查询删除已选sku
              let tempIndex = selectedSkuArray.indexOf(sku_id);
              console.log(tempIndex, sku_id);
              if (tempIndex > -1) {
                selectedSkuArray.splice(tempIndex, 1)
              }
            }
          }
          if (sku_list.length) {
            activity_list.push({
              ...activityItem,
              sku_list: sku_list
            })
          } else {
            // 删除 活动 数据
            delete tempAllActivityStauts[activityItem.activity_id];
          }
        }

        if (activity_list.length) {
          tempShoppingCartList.push({
            ...merchantItem,
            activity_list: activity_list
          });
        } else {
          // 删除门店数据
          delete tempAllMerchantStauts[merchantItem.merchant_id];
          // 查询删除 已选门店
          let tempIndex = selectedMerchantArray.indexOf(merchantItem.merchant_id);
          if (tempIndex > -1) {
            selectedMerchantArray.splice(tempIndex, 1)
          }
        }
      }

      this._data.selectedMerchantArray = selectedMerchantArray;
      this._data.selectedSkuArray = selectedSkuArray;
    }

    console.log('this._data.selectedMerchantArray', this._data.selectedMerchantArray);
    console.log('this._data.selectedSkuArray', this._data.selectedSkuArray);

    console.log('tempShoppingCartList', tempShoppingCartList);
    console.log('tempAllMerchantStauts', tempAllMerchantStauts);
    console.log('tempAllActivityStauts', tempAllActivityStauts);
    console.log('tempAllSkuStauts', tempAllSkuStauts);

    this.setData({
      shoppingCartList: tempShoppingCartList,
      allMerchantStauts: tempAllMerchantStauts,
      allActivityStauts: tempAllActivityStauts,
      allSkuStauts: tempAllSkuStauts
    }, () =>{

      // todo 更新价格及状态
      // 更新sku状态
      this.upDatedSkuSelectdStauts();
      // 更新店铺状态
      this.upDatedMerchantSelectdStauts();
      // 更新全选状态
      this.upDatedAllSelectStauts();
      // 计算当前合计&结算数量
      this.calculationTotal();

      // 获取最新活动状态
      this.getNewActivityStauts()
    })

  },

  // 收藏
  collectionEvent(e) {

    const { extra = {} } = e;
    const { sku_id } = extra;
    const currentSkuStauts = this.data.allSkuStauts[sku_id] || {};
    const is_like = currentSkuStauts.is_like || 0;

    // !!通过  this.selectComponent('#swiper-cell')  获取子组件的实例，可以拿到子组件的方法和数据；
    const showTwo = this.selectComponent(`#swiper-action-${sku_id}`);

    const tempTip = ['收藏成功', '移出成功']
    let tempApiName = 'addLikeProduct';
    if (is_like) {
      // 取消收藏
      tempApiName = 'removeLikeProduct'
    }
    api[tempApiName](
      {
        skuIds: sku_id,
      },
      res => {
        xmini.piwikEvent('c_like', {
          index: is_like,
          skuid: sku_id,
        });
        wx.showToast({
          title: tempTip[is_like],
          type: 'success',
        });

        this.setData({
          [`allSkuStauts.${sku_id}.is_like`]: is_like ? 0 : 1,
          [`allSkuStauts.${sku_id}.swiper_action.right[0].text`]: is_like ? '加入收藏夹' : '移出收藏夹'
        })

        // 关掉右侧按钮
        showTwo && showTwo.close();
      },
      err => {}
    );
  },

  getSkuAttr(e) {
    let { skuid, change } = e.currentTarget.dataset;
    skuid+='';
    api.getCanChooseSku({
      skuId: skuid
    }, (res) => {
      // const data = res.data;
      const { attr_keys = [], attr_data = {}, price = 0, left_stock = 0, max_cart_nums = 0 } = res.data;

      function mapObj(obj, cb) {
        const result = {};
        for (const key in obj) {
          result[key] = cb(obj[key], key);
        }
        return result;
      }

      const stocksList = mapObj((attr_data || {}), item => {
        return {
          id: item.id,
          name: item.name,
          thumbnail: item.thumbnail,
          price: item.price,
          priceText: dealPrice(item.price),
          market_price: item.market_price,
          left_stock: item.left_stock,
          skuid: item.id,
          max_buy_num: item.left_stock,
        };
      });

      const currentSku = this.data.allSkuStauts[skuid];
      let currentSum = 1;
      if (currentSku && currentSku.amount) {
        currentSum = currentSku.amount;

        this._data.tempSkuId = skuid; // !!记录临时skuid
      } else {
        currentSum = this.data.currentSum;
        if (left_stock < currentSum) {
          currentSum = left_stock;
        }
      }

      const smallCurrentSkuData = {
        priceText: '￥' + dealPrice(price),
      }

      let tempData = {
        isShowPopup: true,
        currentSum: currentSum,
        maxBuySum: max_cart_nums,
        normSelectTag: 2,
        smallCurrentSkuData,
      }

      // 主要是方式重复替换规格
      if (!this.data.attrList.length || !change) {
        tempData.attrList = attr_keys;
        tempData.skuStocksList = stocksList; // 属性ID 对应 sku列表
      }

      this.setData(tempData)
    })

  },
  setSkuAttr() {
    api.editCartSku({
      skuId: this._data.tempSkuId,
      newSkuId: this.data.currentSkuData.skuid,
      amount: this.data.currentSum
    }, (res) => {
      // const { item, type } = res.data;

      // console.log(res)
      // !!如果传入的 新老sku 一致 type = delet
      // if (type == 'change') {

      // }
      this.getShopCart(); // 刷新购物车

      this.setData({
        isShowPopup: false
      })
    }, err => {

    })
  },
  onBtnClick(data) {
    const { type } = data.detail;
    const currentSku = this.data.allSkuStauts[this._data.tempSkuId];
    switch(type) {
      case 'buyBtn':
        if (this._data.tempSkuId !== (this.data.currentSkuData.skuid+'')) {
          this.setSkuAttr()
        } else {
          if (currentSku.amount !== this.data.currentSum) {
            // 修改数量
            this.countChangeVal({
              detail: {
                value: this.data.currentSum,
                extra: {
                  sku_id: this._data.tempSkuId
                }
              }
            })
          }
          this.setData({
            isShowPopup: false
          })
        }

        break;
      case 'addShoppingCart':
        //
        break;
    }
  },
  //!!
  onSwipeStart(e){
    console.log('onSwipeStart',e)
    this.setData({
      swipeIndex: e.index,
    });
  },
  //!!! 数量加减
  countChangeVal(data) {
    //
    // console.log(data);
    const { value, extra } = data.detail;
    const currentSku = this.data.allSkuStauts[extra.sku_id];

    if (value != currentSku.amount) {
      api.addSkuToCart(
        {
          skuId: extra.sku_id,
          amount: value,
          type: 2, //  type 1 为增量修改 2 为 全量修改
        },
        res => {
          console.log('修改数量', res);
          this.setData({
            [`allSkuStauts.${extra.sku_id}.amount`]: value
          }, () => {
            // 计算当前合计&结算数量
            this.calculationTotal();

            // 获取最新活动状态
            this.getNewActivityStauts()
          })
        },
        err => {}
      );

    }
  },

  //弹出优惠券的弹层
  showCoupon(e){
    const { merchantid } = e.currentTarget.dataset;
    // const currentMerchant = allMerchantStauts[merchantid]
    merchantid && this.setData({
      showCoupons: true,
    },()=>{
      this.couponParams.merchantId = merchantid;
      this.getCouponList()
    });
  },
  //关闭优惠券弹层
  onHandleItem() {
    this.setData({
      showCoupons: false,
    });
  },
  //显示优惠弹层
  onShowPromotion(e){
    const { skuid } = e.currentTarget.dataset;
    const currentSku = this.data.allSkuStauts[skuid];
    const promotions = currentSku.shop_discount || [];
    this.setData({
      onShowPromotionInfo: true,
      promotions,
    });
  },
  // 关闭多件优惠弹窗
  handlePromotion(data){
    // console.log(data,'dataee');
    if (data.detail.type == 'close') {
      this.setData({
        onShowPromotionInfo: false,
      })
    }
  },
  // 清空失效商品
  clearGoods() {
    this.setData({
      loseGoodsList: []
    })
  },
  gotoNext(e) {
    const { type, id } = e.currentTarget.dataset;

    switch(type) {
      case 'detail':
        this.forward('detail2', { id })
      break;
      case 'merchant':
        this.forward('merchant', { id });
      break;
      case 'go':

      break;
    }
  },
  verifyAuth() {
    const { logged, userInfo } = this.data;
    const pageComponent = this.selectComponent('#dwd-page-shopping-cart');
    if (!logged) {
      // 显示登录弹窗
      pageComponent.setData({
        isShowLoginPopup: true
      });
      return false
    }
    return true;
  },
})
