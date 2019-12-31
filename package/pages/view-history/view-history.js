// pages/view-history/view-history.js
import {
  me,
  xmini,
  xPage,
} from '../../../config/xmini';

import api from '../../../api/index';
import {
  mapTo,
  pullList,
} from '../../../utils/index';
import mixins from '../../../utils/mixins';
import ViewHistoryManager from '../../../utils/viewHistoryManager';

xPage({

  ...mixins,
  ...pullList,
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,

    isHaveViewHistory: true,
    showFooter: false,
    lowerThreshold: 300,
  },

  deleteItems: new Set(),

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.onPageInit(options);

    this.setData({
      lowerThreshold: wx.getSystemInfoSync().screenHeight / 2,
    });
    this.refresh();

  },

  refresh() {
    this.loadData();
    this.initPullList();
    this.pullParams.showType = 2;
    this.pullModel = api.getRecommendlist;

    // 主动触发加载事件
    this.onScrollToLower();
  },

  loadData() {
    // console.log(1);
    let arr = ViewHistoryManager.viewHistory();
    if (arr.length == 0) {
      this.setData({
        isLoading: false,
        isHaveViewHistory : false,
      })
      return;
    }
    let paramter = arr.map(item => {
      return item.productId + ':' + item.pinActivityId;
    }).join(',');
    this.setData({
      isLoading: true,
    })
    api.getViewHistory({
      scope: this,
      weights: 1,

      browseRecords: paramter
    },(res) => {
      if (res.errmsg != "success") return;
      const list = res.data.list || [];
      list.forEach((item) => {
        item.yuan = parseInt(item.group_price / 100);
        const str = item.group_price && item.group_price.toString() || "0000";
        item.fen = str.substring(str.length - 2, str.length)
        item.selected = false;
      })

      const isHaveViewHistory = !!list.length;

      this.setData({
        isLoading: false,
        isHaveViewHistory,
        editing: false,
        viewHistoryList: list,
      })

    });
  },

  dealList(list) {
    console.log('=========',list);
    return mapTo(list, (item) => {
      const isShowLootAll = !item.onLine || !item.inStock;
      return {
        id: item.pinActivitiesId,
        title: item.coupleTitle,
        image: item.skuPic,
        priceObj: {
          rmb: 1,
          price: item.couplePrice,
          marketPrice: item.marketPrice,
        },
        member_price:(item.member_price  / 100).toFixed(2),
        isShowLootAll,
        tags: item.tags.splice(0,2) || [],
        inStock: item.inStock,
        onLine: item.onLine,
        endTime: item.endTime,
        showCountDownLimit: item.showCountDownLimit,
        merchantType: item.merchant_type,
        expired_date_text: item.expired_date_text_two,
      };
    });
  },

  // 精选推荐cell点击
  onTapNext(e) { //暂停使用，走afterFormIdSubmit
    const {
          id,
      online,
      instock
        } = e.currentTarget.dataset;
    xmini.piwikEvent('我的浏览推荐', {
      'id': id,
    });
    if (online && instock) {
      this.forward('detail', {
        id,
      });
    }
  },

  // 立刻去逛逛点击事件
  onShopping(sender) {
    this.forward("index");
  },

  // 管理点击事件
  onManager(sender) {
    this.setData ({
      editing: !this.data.editing,
    });
  },

  onFindSimilar(sender) {
    console.log(sender);
    const { categoryId, categoryName} = sender.currentTarget.dataset;
    xmini.piwikEvent('c_findsim',{
      pinActivitiesId:categoryId,
    });
    this.forward('couple-search-list', {
      category: categoryName,
    });
  },

  // cell点击事件
  onClickCell(sender) {
    console.log(sender);
    const index = sender.currentTarget.dataset.index;
    const isEditting = this.data.editing;
    const item = this.data.viewHistoryList[index];
    console.log(item);
    if (isEditting) {
      // 正在编辑
      const selected = !this.data.viewHistoryList[index].selected;
      this.setData({
        [`viewHistoryList[${index}].selected`] : selected,
      });
      if (selected) {
        this.deleteItems.add(index);
      } else {
        this.deleteItems.delete(index);
      }
      this._checkIsSelectAll();
    } else {
      // 普通状态
      // 去详情页
      xmini.piwikEvent('c_msbuy', {
        'id': item.pin_activities_id,
      });
      this.forward('detail', {
        id: item.pin_activities_id,
      });
    }
  },

  // 全选
  onSelectAll(sender) {
    console.log(sender)
    const selectAll = !this.data.selectAll
    for (var i = 0; i < this.data.viewHistoryList.length; i++) {
      let item = this.data.viewHistoryList[i];
      if (this.deleteItems.has(i)) {
        if (selectAll) continue;
        item.selected = false;
        this.deleteItems.delete(i);
      } else {
        if (!selectAll) continue;
        item.selected = true;
        this.deleteItems.add(i);
      }
    }

    this.setData({
      selectAll,
      viewHistoryList: this.data.viewHistoryList,
    })
  },

  // 删除
  onDelete(sender) {
    console.log(sender, 'sender');
    if (this.deleteItems.size == 0) {
      wx.showToast('请选择商品');
      return;
    }

    console.log(this.deleteItems.keys());
    var arr = new Array();
    for (var i = 0; i < this.data.viewHistoryList.length; i++) {
      let item = this.data.viewHistoryList[i];
      if (!this.deleteItems.has(i)) {
        arr.push(item);
      } else {
        //删除本地记录
        ViewHistoryManager.deleteViewHistory({
          pinActivityId: item.pin_activities_id,
          productId: item.product_id,
        })
      }
    }
    console.log(this.deleteItems, 'senderarr');
    console.log('arr===', arr);
    this.deleteItems.clear();
    this.setData({
      viewHistoryList: arr,
      editing: false,
      isHaveViewHistory: arr.length > 0,
    });
    wx.showToast({
      title: '删除成功！',
    })

  },

  // 检查是否被全选
  _checkIsSelectAll() {
    let selectAll = false
    if (this.deleteItems.size == this.data.viewHistoryList.length) {
        selectAll = true
    }
    this.setData({
      selectAll,
    });
  },

  // 检查对象元素是否在集合中
  _checkObjIsInSet(obj) {
    for (let e of this.deleteItems) {
      if (e.pin_activities_id == obj.pin_activities_id && e.product_id == obj.product_id) {
        return true
      }
    }
    return false
  }
});
