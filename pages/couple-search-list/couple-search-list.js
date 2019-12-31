// pages/couple-search-list/couple-search-list.js
import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import {
  mapTo,
  pullList,
} from '../../utils/index';
import mixins from '../../utils/mixins';
import { clone } from '../../utils/index'

const sortIcons = {
  normal: 'https://img1.haoshiqi.net/miniapp/couple-search-list/category_normal_edc58e8934.png',
  select: 'https://img1.haoshiqi.net/miniapp/couple-search-list/icon_selected_f4e98109b4.png',
  active: 'https://img1.haoshiqi.net/miniapp/couple-search-list/category_down_60852c36b2.png',
};

let tabSelected;     // 综合排序显示样式（向上、向下）
let paramers;        // 参数

xPage({
  ...mixins,
  ...pullList,
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    list: [],
    showFooter: false,
    listMode: 'card',
    lowerThreshold: 300,
    pullLoading: false,
    tab: [
      {
        text:"综合",
      },
      {
        text:"价格",
        topImg: sortIcons.normal,
        botImg: sortIcons.active,
      },
      {
        text:'折扣',
        topImg: sortIcons.normal,
        botImg: sortIcons.active,
      }
    ],
    lastTab: {
      text: '效期',
      botImg: sortIcons.normal,
      topImg: sortIcons.active,
    },
    sort: ["全部", "1个月效期", "2~3个月效期", "4~5个月效期", "6个月及以上效期"],
    icons: sortIcons.normal,
    showSort: false,    // 是否显示综合排序选择项页面
    clickIndex: 0,      // 综合排序、销量选中index
    sortClickIndex: 0,  // 综合排序选择项选中index
    noResult: false,    // 暂无结果
    expiryIndex: 0,
    categoryIndex: -1,
    iconSelected: sortIcons.select,
    recommendList: [],                       //推荐商品列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(query) {

    tabSelected = true;
    paramers = {...query};

    this.onPageInit(paramers);
    this.setNavigationBarTitle(query.category || query.q || '好食期');

    this.setData({
      lowerThreshold: wx.getSystemInfoSync().screenHeight / 2,
    });
    this.refresh();
  },

  onShow() {

  },

  onUnload() {

  },

  // set navigation title
  setNavigationBarTitle(title) {
    wx.setNavigationBarTitle({
      title,
    });
  },

  // 综合排序、销量
  onClickTab: function (e) {
    const { index,piwikEvent } = e.currentTarget.dataset;
    // const piwik = {
    //   'piwikName':
    // };
    console.log(e,'onClickTab');
    if (index == this.data.clickIndex && index == 0) {
      return;
    } else if (index == this.data.clickIndex) {
      const bottomImg = this.data.tab[index].botImg == sortIcons.normal ? sortIcons.active : sortIcons.normal
      const topImg = this.data.tab[index].topImg == sortIcons.normal ? sortIcons.active : sortIcons.normal
      this.setData({
        clickIndex: index,
        [`tab[${index}].botImg`]: bottomImg,
        [`tab[${index}].topImg`]: topImg,
      });

      let sortPriceType = paramers.sortPriceType;
      let sortDiscountType = paramers.sortDiscountType;
      if(index == 1) {
        paramers.sortPriceType = sortPriceType == '0' ? '1' : '0'
        paramers.sort = 'price';
        paramers.sortType = paramers.sortPriceType;
        this.refresh()
      } else if (index == 2 ){
        paramers.sortDiscountType = sortDiscountType == '0' ? '1' : '0'
        paramers.sort = 'discount';
        paramers.sortType = paramers.sortDiscountType;
        this.refresh()
      }
    } else {
      paramers.sortPriceType = paramers.sortPriceType || '1';
      paramers.sortDiscountType = paramers.sortDiscountType || '1';
      this.setData({
        clickIndex: index,
      });
      switch (index){
        case 0:
          paramers.sort = '';
          paramers.sortType = '';
          paramers.piwikData = {
            name:'综合',
          };
          break;
        case 1:
          paramers.sort = 'price';
          paramers.sortType = paramers.sortPriceType;
          console.log(paramers.sortType, 'piwik');
          paramers.piwikData = {
            name:'价格',
            index:paramers.sortType?paramers.sortType:1,
          };
          break;
        case 2:
          paramers.sort = 'discount';
          paramers.sortType = paramers.sortDiscountType;
          paramers.piwikData = {
            name:'折扣',
            index: paramers.sortType?paramers.sortType:1,
          };
          break;
      }
      console.log(piwikEvent,paramers.piwikData, 'piwik');
      xmini.piwikEvent(piwikEvent,paramers.piwikData);
      this.refresh();
    }
  },
  toggleViewSort() {
    console.log(this.data.searchHasExpiryDate)
    if (this.data.searchHasExpiryDate == 1) {
      return;
    }
    this.setData({
      showSort: this.data.showSort ? false : true
    })
  },

  // 综合排序、价格从低到高、价格从高到低
  onClickSort(e) {
    const { index } = e.currentTarget.dataset;
    // this.setData({


    //   icons: sortIcons.down,
    //   selectedTitle: this.data.sort[index],
    // });

    // tab 重置
    tabSelected = true;
    let botImg = this.data.lastTab.botImg
    if (index == 0) {
      botImg = sortIcons.normal
    } else {
      botImg = sortIcons.active
    }
    switch (index) {
      case 0:
        // 全部
        paramers.expiryDate = '';
        break;
      case 1:
        // 1个月效期
        paramers.expiryDate = 1;
        break;
      case 2:
        // 2-3个月效期
        paramers.expiryDate = 2;
        break;
      case 3:
        // 4-5个月效期,
        paramers.expiryDate = 3;
        break;
      case 4:
        // 6个月及以上效期
        paramers.expiryDate = 4;
        break;
    }
    this.setData({
      sortClickIndex: index,
      showSort: false,
      expiryIndex: index,
      [`lastTab.botImg`]: botImg
    })
    this.refresh();
  },

  // pull refresh
  refresh() {
    console.log(paramers)
    this.setData({
      isLoading: true,
      // hasRecommendProduct: false
    })
    this.initPullList();
    this.pullParams.scope = this;
    this.pullParams.weights = 1;

    this.pullParams.q = paramers.q && decodeURIComponent(paramers.q),
    this.pullParams.category = paramers.category && decodeURIComponent(paramers.category),
    this.pullParams.sort = paramers.sort,
    this.pullParams.sortType = paramers.sortType,
    this.pullParams.expiryDate = paramers.expiryDate,
    //
    this.pullParams.frontCategoryId = paramers.categoryid,

    this.pullModel = api.coupleSearchlist;
    // 主动触发加载事件
    this.onScrollToLower();
  },

  // dealwith data
  dealList(list) {
    return mapTo(list, (item,index) => {
      const isShowLootAll = !item.onLine || !item.inStock;
      return {
        id: item.pinActivitiesId,
        title: item.coupleTitle,
        image: item.skuPic,
        priceObj: {
          rmb: 1,
          price: item.couplePrice,
          marketPrice: item.marketPrice,
          memberPrice:item.member_price,
        },
        isShowLootAll,
        tags: item.tags.splice(0,2) || [],
        inStock: item.inStock,
        onLine: item.onLine,
        endTime: item.endTime,
        showCountDownLimit: item.showCountDownLimit,
        remainTime: item.remainTime || '',
        merchantType: item.merchant_type,
        expired_date_text: item.expired_date_text_two,
        piwikName:'c-pdr2',
        link:item.link,
        piwikData:{
          index,
          pinActivitiesId: item.pinActivitiesId,
        },
      };
    });
  },
  dealRecList(list) {
    return mapTo(list, (item, index) => {
      const isShowLootAll = !item.onLine || !item.inStock;
      return {
        ...item,
        id: item.pinActivitiesId,
        image: item.skuPic,
        thumbnail: item.thumbnail,
        market_price: (item.market_price / 100).toFixed(2),
        price: this.productPrice(((item.price || item.couplePrice) / 100).toFixed(2)),
        isShowLootAll,
        // link: `https://m.haoshiqi.net/v2/couple-detail?id=${item.biz_id}`,
        link:item.link,
        tags: item.tags.splice(0,2) || [],
        inStock: item.inStock,
        onLine: item.onLine,
        endTime: item.endTime,
        showCountDownLimit: item.showCountDownLimit,
        remainTime: item.remainTime || '',
        merchant_type: item.merchant_type,
        expired_date_text: item.expired_date_text_two,
        piwikName: 'c-pdr2',
        piwikData: {
          index,
          pinActivitiesId: item.pinActivitiesId,
        },
      };
    });
  },
  productPrice(price) {
    let priceArray = price.split('.');
    return {
      price_yuan: priceArray[0],
      price_fen: priceArray[1],
    };
  },

  afterPull(res) {
    const { data } = res;
    const { list } = data;
    this.setData({
      isLoading: false
    })
    if (!list || list.length <= 0) {
      this.setData({
        noResult: true,
      });
    }
    this.setData({
      isLoading:false,
    });
    if (this.pullParams.pageNum > 1) {
      return;
    }
    delete this.pullParams.scope;
    delete this.pullParams.weights;
    if (data.category) {
      const { banner = {}, category = [], searchHasExpiryDate } = data;
      const swiperList = mapTo(banner.list || [], (item, index) => {
        return {
          image: item.image.url,
          url: item.link,
          piwikName: 'c_banner',
          piwikData: {
            index,
            link: item.link,
          },
        };
      });
      const paddingTop = (banner.height / banner.width).toFixed(2) * 100;
      const height = banner.height;
      const swiperInfo = {
        list: swiperList, // 如果数据不符合格式，可以使用 mapTo 方法
        paddingTop,
        goUrlPage: 'goUrlPage',
        height: height,
      }

      let lastTab = this.data.lastTab
      lastTab.botImg = searchHasExpiryDate != 1 ? lastTab.botImg : 'https://img1.haoshiqi.net/miniapp/couple-search-list/category_disabled_533c061ded.png'

      this.setData({
        lastTab,
        searchHasExpiryDate,
        category,
        swiperInfo,
      })
    }
  },

  // click event
  onTapNext(e) {
    const {
      id,
      index,
      online,
      instock,
      url = '',
    } = e.currentTarget.dataset;
    if (online && instock) {
      xmini.piwikEvent('c_pdr2', {
        'pinActivitiesId': id,
        'index': index,
      });
      console.log('piwik');
      if(url){
        this.onUrlPage(e);
      }
    }
  },
  goSearchText(e) {
    const { text, index } = e.currentTarget.dataset;
    // const piwikData = {
    //   index,
    //   name: text,
    // };
    // console.log(piwikData,'piwik');
    xmini.piwikEvent('c_lb',{index,name:text});
    console.log(text)
    this.setData({
      categoryIndex: index
    })
    paramers.category = text;
    this.refresh()
  },
  //数据处理完成后判断是否需要请求推荐商品
  afterPullData(list) {
    if (this.data.totalCnt <= 20) {
      this.getRecommendProduct();
    }
  },
  getRecommendProduct() {
    api.getCoupleListV1({
      personalization: true,
      pageNum: 1,
      pageLimit: 20,
      needPagination: 1
    }, res => {
      const { data } = res;
      const { list } = data;
      let recommendList = this.dealRecList(list);
      this.setData({
        recommendList
      })
    }, err => {
      console.log(err);
    })
  }
});
