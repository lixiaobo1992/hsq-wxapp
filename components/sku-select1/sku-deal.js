// const stocksList = {
//   '539206;539204;539205': {
//     name: '海太蜂蜜黄油薯片',
//     // 缩略图
//     thumbnail: 'http://img2.haoshiqi.net/mabe517dfd1b05e93478d8a12203bf6d49.jpg?imageView2/0/q/70',
//     left_stock: 111, // 库存
//     price: 1111, //sku价格（当前售价）
//     market_price: 111, // 原价（删除价）
//     id: 1112,
//     skuid: 1112, // skuid
//     max_buy_num: 10, // 当前sku限购数
//   },
// };

// const attrList = [
//   {
//     attrId: 4,
//     attrName: '保质期',
//     attrValues: [
//       {
//         id: 539206,
//         value: '2020/03/01',
//       },
//       {
//         id: 333,
//         value: '2020/03/02',
//       },
//     ],
//   },
//   {
//     attrId: 2,
//     attrName: '规格',
//     attrValues: [
//       {
//         id: 539204,
//         value: '120g*2支',
//       },
//       {
//         id: 5153861,
//         value: '120g*2支',
//       },
//     ],
//   },
//   {
//     attrId: 3,
//     attrName: '口味',
//     attrValues: [
//       {
//         id: 539205,
//         value: '臭味',
//       },
//       {
//         id: 515386,
//         value: '煤气味',
//       },
//     ],
//   },
// ];
import { dealPrice } from '../../utils/index'
export default {
  // 提供给子组件 修改父组件data 的方法
  setCurrentData(e) {
    console.log('setCurrentData', e.detail);
    const { currentSkuData } = e.detail;
    // // const { data }
    // 对 currentSkuData 做特殊处理
    if (currentSkuData) {
      const { currentSkuData: oldCurrentSkuData } = this.data;
      if (
        (currentSkuData.skuid && currentSkuData.skuid !== oldCurrentSkuData.skuid) &&
        currentSkuData.skuids.length == 1
      ) {
        this.skuDataOnChenge && this.skuDataOnChenge(currentSkuData);
      }
    }

    this.setData({
      ...e.detail
    })
  },
  dealSKUData({
    defaultSkuData: enterDefaultSkuData,
    currentSkuData: enterCurrentSkuData,
    stocksList = {},
    attrList = [],
  }) {
    // 传入数据
    // stocksList: [], 所有可选库存
    // attrList: [], 所有属性、规格列表
    // defaultSkuData: {}, 默认选中数据
    // currentSkuData: {}, 当前选中数据
    //
    // {
    //   stocksList: [],
    //   attrList: [],
    //   defaultSkuData: {
    //     name: '',
    //     thumbnail: '',
    //     max_buy_num: 10,
    //   },
    //   currentSkuData: {
    //     name: '海太蜂蜜黄油薯片', // 缩略图
    //     thumbnail:
    //       'http://img2.haoshiqi.net/mabe517dfd1b05e93478d8a12203bf6d49.jpg?imageView2/0/q/70',
    //     stock: 111, // 库存
    //     price: 1111, //sku价格（当前售价）
    //     market_price: 111, // 原价（删除价）
    //     skuid: 111, // skuid
    //     max_buy_num: 10, // 当前sku限购数
    //   },
    // }
    let newSkuStocksList = {};
    let defaultSelectedIds = [];
    let defaultSkuData = {
      name: enterDefaultSkuData.name,
      // 缩略图
      thumbnail: enterDefaultSkuData.thumbnail,
      stock: 0, // 库存
      price: 0, //sku价格（当前售价）
      market_price: 0, // 原价（删除价）
      // skuid: 111, // skuid 默认是没有选中的sku
      max_buy_num: 100, // 当前sku限购数

      skuids: [], // skuid 列表
      prices: [], // 价格列表
    };

    // 当前接口返回的默认sku 信息
    let currentSkuData = {
      name: enterCurrentSkuData.name,
      // 缩略图
      thumbnail: enterCurrentSkuData.thumbnail,
      stock: enterCurrentSkuData.stock, // 库存
      price: enterCurrentSkuData.price, //sku价格（当前售价）
      market_price: enterCurrentSkuData.market_price, // 原价（删除价）
      skuid: enterCurrentSkuData.skuid, // skuid
      max_buy_num: enterCurrentSkuData.max_buy_num, // 当前sku限购数
    };

    let currentSmallSkuData = {
      stock: enterCurrentSkuData.stock, // 库存
      price: enterCurrentSkuData.price, //sku价格（当前售价）
      priceText: dealPrice(enterCurrentSkuData.price), //sku价格（当前售价）
      skuid: enterCurrentSkuData.skuid, // skuid
    }


    // !!目前的规格选择规则
    // 当只有一个sku 时默认选中
    // 当有多个sku 日期规格默认选中日期价格低的sku
    // 当有多个sku 有多个规格时默认都不选中

    const stocksListKeys = Object.keys(stocksList);
    let currentStockKey = stocksListKeys[0]; // 默认选中当前sku属性
    // 遍历
    for (let key in stocksList) {
      let tempStock = stocksList[key];

      if (tempStock.id == enterCurrentSkuData.skuid) {
        currentStockKey = key;
      }

      newSkuStocksList[key] = {
        name: tempStock.name,
        // 缩略图
        thumbnail: tempStock.thumbnail,
        stock: tempStock.left_stock, // 库存
        price: tempStock.price, //sku价格（当前售价）
        market_price: tempStock.market_price, // 原价（删除价）
        skuid: tempStock.id, // skuid
        max_buy_num: tempStock.restriction_amount, // 当前sku限购数
      };
      // ==================
      // 获取总库存 最大单价等信息
      if (defaultSkuData.price < tempStock.price) {
        defaultSkuData.price = tempStock.price;
        defaultSkuData.market_price = tempStock.market_price;
      }
      defaultSkuData.prices.push(tempStock.price); // 价格列表
      defaultSkuData.skuids.push(tempStock.id); // skuid 列表
      defaultSkuData.stock = defaultSkuData.stock + tempStock.left_stock; // 总库存
    }

    console.log('defaultSkuData:', defaultSkuData);
    console.log('currentSkuData:', currentSkuData)

    // !!好食期建品逻辑缺陷，导致除日期属性外，其他属性值一直，属性id不一致
    // !!后台目前建品的逻辑有问题:
    // 1、新建spu 添加属性key (如：日期，规格，口味等)
    // 2、spu 下新建 sku 添加属性值 (如：日期 = 2019/08/14，规格 = 600g)
    // 3、按照以上建法 如果添加的属性的值一样 (如在次新建一个sku 日期 = 2019/11/03，规格 = 600g),同样的规格 = 600g 就会多生成一个属性id
    // 4、生成数据如下：
    // [
    //   {
    //     attrId: 1,
    //     attrName: '保质期',
    //     attrValues: [
    //       {
    //         id: 66044,
    //         value: '2019/08/14'
    //       },
    //       {
    //         id: 66042,
    //         value: '2019/11/03'
    //       }
    //     ]
    //   },
    //   {
    //     attrId: 2,
    //     attrName: '规格',
    //     attrValues: [
    //       {
    //         id: 66039,
    //         value: '600g'
    //       },
    //       {
    //         id: 66043,
    //         value: '600g'
    //       }
    //     ]
    //   }
    // ]

    // 基于现有问题做相应处理
    // 1、转换 attrList
    // console.log([1,2].toString())
    const newAttrList = this.transformAttrList(attrList);
    console.log('newAttrList',newAttrList);

    // 当只有一个sku 时默认选中
    if (!defaultSelectedIds.length && currentStockKey) {
      // !!这里之前有bug
      // 默认选中 为 ['539206','539204','539205']
      // 但是因为 处理过属性，遇到 属性名相同 属性id 不同的时应为 ['539206','539204,5153861','539205']
      defaultSelectedIds = currentStockKey.split(';').map(i => {
        for(let s = 0; s < newAttrList.length; s ++){
          let attr = newAttrList[s];
          for(let key in attr.attrValues) {
            if (attr.attrValues[key].idsStr.indexOf(i) > -1) {
              return String(attr.attrValues[key].idsStr);
            }
          }
        }
      });
    }
    console.log('defaultSelectedIds:', defaultSelectedIds);

    this.setData({
      attrData: newAttrList,
      skuStocksList: newSkuStocksList,
      defaultSelectedIds,
      defaultSkuData,
      currentSkuData,
      currentSmallSkuData
    });
  },
  // 转换 attrList
  transformAttrList(attr = []) {
    let newAttr = [];
    for (let i = 0; i < attr.length; i++) {
      let attrValues = {};
      for (let s = 0; s < attr[i].attrValues.length; s++) {
        let tempVal = attr[i].attrValues[s];
        // 以值为key
        if (attrValues[tempVal.value]) {
          attrValues[tempVal.value]['ids'].push(tempVal.id);
          attrValues[tempVal.value]['idsStr'] = attrValues[tempVal.value]['ids'].toString();
        } else {
          attrValues[tempVal.value] = {
            active: false,
            disabled: false,
            value: tempVal.value,
            ids: [tempVal.id],
            idsStr: String(tempVal.id),
          };
        }
      }
      newAttr.push({
        ...attr[i],
        active: false,
        attrValues,
      });
    }
    // return
    // [
    //   {
    //     attrValues: [
    //       '香味': {
    //         ids: [1, 2],
    //         idsStr: '1,2',
    //       }
    //     ]
    //   }
    // ]
    // console.log('transformAttrList', newAttr)
    return newAttr;
  },
};
