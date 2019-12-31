import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import mixins from '../../utils/mixins';

const app = getApp();

xPage({
  ...mixins,
  /**
   * 页面的初始数据
   */
  _data: {
    tempList: [],
  },
  data: {
    isLoading: true,

    leftClassList: [],
    leftClassAd: {},

    listData: [],

    currentIndex: 0,
    hotSearch: {},   // 推荐热词
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(query) {
    this.onPageInit(query);

    const { hotSearch } = app.getData();
    this.setData({
      hotSearch: hotSearch || {},
    });

    this.refresh();
  },

  onShow() {
    this.updatadSpmPage(); // 新增更新spm 三段中的 page
  },

  refresh() {
    this.getCategoryList()
  },


  sideItemTap(e) { // 选择分类
    const { index = 0 } = e.currentTarget.dataset;

    const { currentIndex, leftClassList } = this.data;
    if (currentIndex == index) return;

    const tempItem = this._data.tempList[index] || [];
    xmini.piwikEvent('c_catalogue', { name: leftClassList[index].name })

    this.setData({
      currentIndex: index,
      listData: tempItem.subCategories || []
    }, () => {
      this.getCategoryAd();
    })
  },

  // 获取分类数据
  getCategoryList() {
    this.setData({
      isLoading: true,
    })
    api.getCategoryList({
      scope: this,
      weights: 1,
    }, (res) => {
      this.dealCategoryList(res);
    }, (err) => {
      console.log(err);
    });
  },

  dealCategoryList(res) {
    console.log(res);
    const { list = [] } = res.data;
    this._data.tempList = list;
    let listData = []
    const leftClassList = (list || []).map((item, index) => {
      if (index == 0) {
        listData = item.subCategories || []
      }
      return {
        id: item.id,
        name: item.name,
        parent_id: item.parent_id,
      }
    })

    this.setData({
      isLoading: false,
      leftClassList,
      listData
    }, () => {
      this.getCategoryAd();
    })
  },

  getCategoryAd() {
    const { leftClassList, currentIndex } = this.data;
    const item = leftClassList[currentIndex]
    api.getCategoryAd(
      {
        categoryId: item.id,
      },
      res => {
        const { list = [] } = res.data;
        if (list && list.length) {
          const ad = list[0] || {};
          this.setData({
            [`leftClassAd[${item.id}]`]: {
              ...ad,
              piwikData: {
                name: item.name,
                link: ad.redirect_url
              }
            }
          })
        }
      },
      err => {
        return true;
      }
    );

  },
  // 点击分类，跳转到分类搜索页
  onCategoryTap(event) {
    const { category, index, subindex, id } = event.currentTarget.dataset;

    xmini.piwikEvent('c_category1', {
      index,
      subindex,
      name:category,
    });

    this.forward('couple-search-list', {
      category,
      categoryid: id,
    });
  },

  // 搜索
  onSearch(e) {
    xmini.piwikEvent('c_schbox');
    this.forward('search');
  },
});
