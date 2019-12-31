import {
  dealPrice,
} from '../utils/index';
const dealData = {
  getModules(res) {
    const { data, timestamp } = res;
    const types = [
      'c-img',
      'c-img-hor',
      'c-swiper',
      'c-category',
      'c-tofu',
      'c-product-col1',
      'c-product-col2',
      'c-product-col3',
      'c-product-slider',
      'c-product-seckill'
    ]
    const tempList = (data.list || []).filter(item => {
      return types.includes(item.type);
    })
    // 添加 模块 id
    // console.log(list, 'list1112');
    let tempObj = {};
    // 添加模块标记，统计使用
    let tagObj = {};
    // console.log(curtime,'timestamp moduleItem');
    tempList.forEach((item) => {
      if (!tempObj[item.type]) {
        tempObj[item.type] = 1;
      } else {
        tempObj[item.type] = tempObj[item.type] + 1
      }
      item.id = item.id || item.type + '_' + tempObj[item.type];
      item.moduleName = item.type + '_' + tempObj[item.type];
      // if (!item.id) {

      // }

    });
    // 遍历 list
    let Modules = tempList.map((item, index) => {

      let moduleItem = {
        ...item,
      }
      // console.log(moduleItem, 'moduleItem')
      switch (item.type) {
        case 'c-swiper':
          return Object.assign(moduleItem, this.dealCSwiper(item));
        case 'c-img':
          return Object.assign(moduleItem, this.dealCImg(item));
        case 'c-img-hor':
          return Object.assign(moduleItem, this.dealCImg(item));
        case 'c-category':
          return Object.assign(moduleItem, this.dealCImg(item));
        case 'c-tofu':
          return Object.assign(moduleItem, this.dealCImg(item));
        case 'c-product-col1':
          return Object.assign(moduleItem, this.dealCProduct(item));
        case 'c-product-col2':
          return Object.assign(moduleItem, this.dealCProduct(item));
        case 'c-product-col3':
          return Object.assign(moduleItem, this.dealCProduct(item));
        case 'c-product-slider':
          return Object.assign(moduleItem, this.dealCProduct(item));
        case 'c-product-seckill':
          return Object.assign(moduleItem, { timestamp: timestamp }, this.dealCProduct(item));
        default:
          return moduleItem;
      }
      return {
        ...item,
      }
    });
    return Modules
  },
  dealCSwiper(item) {
    const list = this.dealImgs(item.list, item.id, item);
    return {
      activeColor: '#f00',
      circular: true, // 是否是无限滑动
      list: list,
      // height: this.calculateModuleHeight(+item.width || 0, +item.height || 0),
      padding_top: (+item.height / +item.width) * 100,
    }
  },
  dealCImg(item) {
    return {
      list: this.dealImgs(item.list, item.id, item)
    }
  },
  // 处理商品数据
  dealCProduct(item) {
    // console.log(moduleItem.start_time,'moduleItem.start_time');
    return {
      list: this.dealProductList(item),
      // start_time:data.start_time,
      // end_time:data.end_time,
    };
  },
  dealImgs(list = [], piwikName, moduleItem) {
    // console.log(moduleItem,'item1112');
    return list.map((item, index) => {
      return {
        ...item,
        'piwikEvent': moduleItem.type,
        'piwikData': {
          id: moduleItem.id,
          comment: moduleItem.comment,
          type: moduleItem.type,
          moduleName: moduleItem.moduleName,
          index,
          // comment: moduleItem.comment,
          // moduleId: moduleItem.id,
          url: item.link,
          group: moduleItem.flow ? moduleItem.flow : 0,
        }
      }
    })
  },
  // 处理商品列表数据
  dealProductList(moduleItem) {
    const list = moduleItem.list || []
    // console.log(list, '1112');
    return list.map((item, index) => {
      let retaData = parseInt(((item.all_stock - item.left_stock) / item.all_stock) * 100);
      return {
        ...this.dealItem(item, moduleItem.type),
        tags: this.dealTags(item.tags || [], moduleItem.type),
        // tags:(item.tags || []).splice(0, 2),
        market_price: dealPrice(item.market_price),
        price: this.productPrice((item.price / 100).toFixed(2)),
        member_price: dealPrice(item.member_price),
        rate_percent: retaData,
        expired_date_text: this.dealDateText(item, moduleItem.type),
        //添加埋点信息
        'piwikEvent': moduleItem.type,
        'piwikData': {
          id: moduleItem.id,
          comment: moduleItem.comment,
          type: moduleItem.type,
          moduleName: moduleItem.moduleName,
          index,
          link: item.link,
          grounp: moduleItem.flow ? moduleItem.flow : 0,
        }
      };
    });
  },
  //处理item
  dealItem(item, type) {
    switch (type) {
      case 'c-product-col1':
        return Object.assign(item, { showupArrow: true }, { arrowClick: item.tags.toString().length > 48 });
      default:
        return item;
    }
  },
  //处理标签
  dealTags(tags, type) {
    switch (type) {
      case 'c-product-col1':
        return tags;
      default:
        return tags.splice(0, 2);
    }
  },
  productPrice(price) {
    let priceArray = price.split('.');
    return {
      price_yuan: priceArray[0],
      price_fen: priceArray[1],
    };
  },
  //处理效期
  dealDateText(item, type) {
    switch (type) {
      case 'c-product-col1':
        return item.expired_date_text_one;
      case 'c-product-col2':
        return item.expired_date_text_two;
      default:
        return item;
    }
  },
};


module.exports = dealData;
