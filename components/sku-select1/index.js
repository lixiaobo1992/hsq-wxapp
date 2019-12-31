import { baseComponent } from '@xmini/wxapp-component-base';
import { getObjKeys, combInArray } from './sku-util';
import { dealPrice, clone } from '../../utils/index'
import { isEmptyObject } from '../../utils/base/index';
let SKUResult = {}; // 组合结果信息

let SKUAttr = {}; // 处理后的attr // 全部的属性列表
baseComponent({
  props: {
    // 控制窗口显示隐藏
    isPopupShow: {
      type: Boolean,
      value: false
    }, // 默认值
    // 0 显示两个按钮 1 添加购物车 2 立即购买
    normSelectTag: {
      type: Number,
      value: 0
    },
    // 当前 已选产品数量
    currentSum: {
      type: Number,
      value: 1
    },
    // 规格信息
    attrData: {
      type: Array,
      value: [],
    },
    // 规格对应sku信息
    skuStocksList: {
      type: Object,
      value: {},
    },
    // 默认选择 id
    defaultSelectedIds: {
      type: Array,
      value: [],
    },
    defaultSkuData: {
      type: Object,
      value: {},
    },
    skuBtnStatus: {
      type: Object,
      value: {
        isBtnActive: true, // 按钮否可用
        buyBtnText: '确认',
        cartBtnText: '确认',
      },
    },
    maxBuySum: {
      type: Number,
      value: 100,
      observer: function (newVal, oldVal, changedPath) {
        // console.log('isBtnActive',newVal)
        this.setData({
          max_buy_sum: newVal
        })
      }
    },
    currentSmallSkuData: {
      type: Object,
      value: {
        priceText: '¥0',
        stock: 0,
      },
    }
  },
  data: {
    selectedIds: [],
    notSelectedAttrName: '', // 未选择属性名
    selectedAttrName: [],
    currentSkuData: {},
    max_buy_sum: 100,
  },
  watch: {
    defaultSelectedIds(newVal, oldVal) {
      // console.log(newVal);
      this.setData({
        selectedIds: newVal
      })
    },
    skuStocksList(newVal, oldVal) {
      // console.log(newVal);
      if (!isEmptyObject(newVal)) {
        return;
      }
      this.setData({}, () => {
        console.log('被调了', this.data.selectedIds)
        this.initSKU();
        this.setCurrentSkuData(this.data.selectedIds)
        this.dealNewAttr(0, this.data.selectedIds)
      })
    },
  },
  computed: {
    cartBtnStatus() {
      const { skuBtnStatus, normSelectTag } = this.data;
      let classNameStr = '';
      if (skuBtnStatus.isBtnActive) {
        if (normSelectTag == 0) {
          classNameStr = 'active'
        }
        if (normSelectTag == 1) {
          classNameStr = 'cur'
        }
      }
      return classNameStr;
    },
    buyBtnStatus() {
      const { skuBtnStatus, normSelectTag } = this.data;
      let classNameStr = '';
      if (skuBtnStatus.isBtnActive) {
        if (normSelectTag == 0) {
          classNameStr = 'active'
        }
        if (normSelectTag == 2) {
          classNameStr = 'cur'
        }
      }
      return classNameStr;
    }
  },
  created() {

  },
  mounted() {
    console.log('reday');
  },
  methods: {
    // 规格选择
    attrSelect(e) {
      let { idsStr, val, attrid, disabled = false } = e.currentTarget.dataset;
      console.log(e.currentTarget.dataset);
      // 排除被禁掉不可选的
      if (!disabled) {
        let { selectedIds } = this.data;
        selectedIds = clone(selectedIds);
        const currentAttr = SKUAttr[attrid];

        const index = selectedIds.indexOf(idsStr);
        // 如果当前ID 存在于已选 移除
        if (index > -1) {
          selectedIds.splice(index, 1);
        } else if (selectedIds.length) {
          for (let key in currentAttr) {
            const tempIdsStr = currentAttr[key].ids.toString()
            let tempIndex = selectedIds.indexOf(tempIdsStr)
            if (tempIndex > -1) {
              selectedIds.splice(tempIndex, 1);
            }
          }
          selectedIds.push(idsStr);
        } else {
          selectedIds.push(idsStr);
        }
        // console.log('selectedIds:',selectedIds)
        // !!selectedIds = ['1,2','3']
        // if (selectedIds.length) {
        //   selectedIds.sort(function (value1, value2) {
        //     return parseInt(value1) - parseInt(value2);
        //   });
        // }

        // console.log(SKUResult);
        this.setData({
          selectedIds
        })

        this.setCurrentSkuData(selectedIds)

        // 更新 attr
        this.dealNewAttr(idsStr, selectedIds);
      }
    },
    // 核心方法
    dealNewAttr(idsStr = '', selectedIds = []) {
      // console.log('selectedIds', selectedIds)
      const attrData = clone(this.data.attrData);
      let SKUResultKeys = Object.keys(SKUResult);
      // console.log('SKUResultKeys',SKUResultKeys)
      for (let i = 0; i < attrData.length; i++) {
        let tempItem = attrData[i];
        for (let attrKey in tempItem.attrValues) {

          let tempAttr = tempItem.attrValues[attrKey];
          // for start
          if (selectedIds.length) {
            //---------
            let index = selectedIds.indexOf(tempAttr.idsStr);
            if (index > -1) {
              attrData[i].attrValues[attrKey].active = true;
              // 添加 当前请选择提示
              attrData[i].active = true;
            } else {
              delete attrData[i].attrValues[attrKey].active;
            }

            // 排除 已选项和当前点击项
            // 当前选择项不在已选数组内，且不等于当前循环项
            if (index == -1 && tempAttr.idsStr !== idsStr) {

              let testAttrIds = []; // 从选中节点中去掉选中的兄弟节点
              let aid = 0
              // 查询当前  同级属性有没有已选项 有就记录下来
              for (let iiKey in tempItem.attrValues) {
                if (selectedIds.indexOf(tempItem.attrValues[iiKey].idsStr) > -1) {
                  aid = tempItem.attrValues[iiKey].idsStr;
                  break;
                }
              }
              // 如果同级属性存在 已选项
              if (aid) {
                for (var s of selectedIds) {
                  (s != aid) && testAttrIds.push(s);
                }
              } else {
                // 清除 当前请选择提示
                delete attrData[i].active;

                testAttrIds = selectedIds.concat();
              }

              // 这个判断必然为真
              if (tempAttr.idsStr !== idsStr) {
                testAttrIds.push(tempAttr.idsStr)
              }
              // testAttrIds.sort(function (value1, value2) {
              //   return parseInt(value1) - parseInt(value2);
              // });

              const tempSelectedId = testAttrIds.map(item => {
                return String(item).split(',');
              })
              // console.log('=========',tempAttr.idsStr, tempSelectedId);
              // 获取属性值的排列组合
              const results = this.getAttrCombination(tempSelectedId)
              // console.log('results',results)
              let isDisabled = true;

              for (let val of results) {
                if (SKUResultKeys.includes(val)) {
                  // console.log('results key', val)
                  isDisabled = false
                }
              }

              if (isDisabled) {
                attrData[i].attrValues[attrKey].disabled = true;
              } else {
                delete attrData[i].attrValues[attrKey].disabled;
              }

            }
          } else {
            delete attrData[i].attrValues[attrKey].active;
            delete attrData[i].active;

            let isDisabled = true
            // typeof tempAttr.ids == 'array'
            for (let id of tempAttr.ids) {
              if (SKUResultKeys.includes(String(id))) {
                isDisabled = false;
              }
            }
            if (isDisabled) {
              attrData[i].attrValues[attrKey].disabled = true;
            } else {
              delete attrData[i].attrValues[attrKey].disabled;
            }

          }
          // for end
        }

      }
      // 更新页面 attrData
      this.$emit('onSetParentData', { attrData })

    },
    onClose() {
      this.$emit('onSetParentData', {
        isShowPopup: false
      })
    },
    // 加入购物车
    addShoppingClick() {
      // console.log(this.data.selectedIds)
      //
      if (!this.data.skuBtnStatus.isBtnActive) return;
      if (this.data.notSelectedAttrName == '') {
        this.$emit('onBtnClick', { type: 'addShoppingCart' })
      } else {
        wx.showToast('请选择规格');
      }
    },
    // 立即购买
    buyClick() {
      //
      if (!this.data.skuBtnStatus.isBtnActive) return;
      if (this.data.notSelectedAttrName == '') {
        this.$emit('onBtnClick', { type: 'buyBtn' });
      } else {
        wx.showToast('请选择规格');
      }
    },
    // 数量改变
    countChangeVal(e) {
      this.$emit('onSetParentData', {
        currentSum: e.detail.value
      })
    },

    // 根据已选择点id 更新当前页面数据
    setCurrentSkuData(selectedIds = []) {
      // debugger
      // console.log(selectedIds);
      // 排序
      // selectedIds.sort(function (value1, value2) {
      //   return parseInt(value1) - parseInt(value2);
      // });
      let tempSelectedId = clone(selectedIds);

      tempSelectedId = tempSelectedId.map(item => {
        return String(item).split(',');
      })
      // console.log('tempSelectedId', tempSelectedId)

      let currentSkuData;
      // 如果 已选择 为空 设置默认
      if (!tempSelectedId.length) {
        currentSkuData = clone(this.data.defaultSkuData);
      } else {

        // 获取属性值的排列组合
        const results = this.getAttrCombination(tempSelectedId)

        let tempCurrentSkuDatas = [];
        for (let val of results) {
          const tempData = SKUResult[val]
          if (tempData) tempCurrentSkuDatas.push(tempData)
        }

        // console.log('tempCurrentSkuDatas:', tempCurrentSkuDatas)
        if (tempCurrentSkuDatas.length > 1) {
          currentSkuData = clone(this.data.defaultSkuData);
          // 这里需要做合并
        } else {
          currentSkuData = clone(tempCurrentSkuDatas[0]);
        }

      }
      // 修改获取 未选择属性的名称
      this.setNotOrSelectedAttrName(tempSelectedId)

      console.log(currentSkuData);
      if (currentSkuData) {

        let minPrice = 0, maxPrice = 0;
        if (currentSkuData.prices.length == 1) {
          minPrice = currentSkuData.prices[0]
        } else {
          minPrice = Math.min(...currentSkuData.prices);
          maxPrice = Math.max(...currentSkuData.prices);
        }

        let priceText = `¥${dealPrice(minPrice)}`;
        if (maxPrice) {
          priceText += ' ~ ' + dealPrice(maxPrice)
        }

        currentSkuData.priceText = priceText;

        // 处理限购数
        let maxBuySum = [this.data.maxBuySum];
        // 商品限购数 restriction_amount
        if (currentSkuData.max_buy_num) {
          maxBuySum.push(currentSkuData.max_buy_num)
        }
        // 新人限购数
        // if (this.data.isNewUser) {
        //   maxBuySum.push(10)
        // }
        // 当前sku 库存
        maxBuySum.push(currentSkuData.stock);

        const maxSum = Math.min(...maxBuySum)

        // console.log('maxBuySum: ', maxSum)
        this.setData({
          max_buy_sum: maxSum,
          currentSkuData
        })
        this.$emit('onSetParentData', { currentSkuData });
      }

    },

    getAttrCombination(tempSelectedId = []) {
      if (!tempSelectedId.length) return [];
      let results = [];
      let result = [];
      doExchange(tempSelectedId, 0);
      function doExchange(arr, index) {
        for (var i = 0; i < arr[index].length; i++) {
          result[index] = arr[index][i];
          if (index != arr.length - 1) {
            doExchange(arr, index + 1)
          } else {
            results.push(result.join(';'))
          }
        }
      }
      // console.log('results',results)

      results = results.map(item => {
        let tempArray = item.split(';')
        tempArray.sort(function (value1, value2) {
          return parseInt(value1) - parseInt(value2);
        });
        return tempArray.join(';')
      })

      return results;
    },

    // 修改获取 未选择属性的名称
    setNotOrSelectedAttrName(selectedIds = []) {
      // 根据 已选属性id 遍历出未选择 属性名
      const attrData = this.data.attrData;
      let notAttrName = '';
      let selectedAttrName = [];
      for (let i = 0; i < attrData.length; i++) {
        let attr = attrData[i]
        let isBeing = false;

        for (let attrKey in attr.attrValues) {
          const attrVal = attr.attrValues[attrKey];

          selectedIds.forEach((arr) => {
            let idsStr = arr.toString();
            // console.log('=======attr.attrName',attr.attrName, attrVal.idsStr,'=====', idsStr)

            if (attrVal.idsStr.includes(idsStr)) {
              isBeing = true;
              selectedAttrName.push({
                type: attr.attrName == '保质期' ? 2 : 1,
                attrName: attr.attrName,
                attrValue: attrKey
              })
            }

          })

        }

        // 拼接未选中的属性
        if (!isBeing) {
          notAttrName += ' ' + attr.attrName;
        }
      }

      // console.log('selectedAttrName', selectedAttrName)
      // console.log('notAttrName:', notAttrName)
      this.setData({
        selectedAttrName,
        notSelectedAttrName: notAttrName
      })
      // 更新页面数据
      this.$emit('onSetParentData', {
        selectedAttrName,
        notSelectedAttrName: notAttrName
      });
    },
    // 初始化sku
    initSKU() {
      const { skuStocksList, attrData } = this.data;
      var i, j, skuKeys = getObjKeys(skuStocksList);

      SKUResult = {};
      SKUAttr = {}; // 规格属性原数据

      for (i = 0; i < skuKeys.length; i++) {
        var skuKey = skuKeys[i];//一条SKU信息key
        var sku = skuStocksList[skuKey];	//一条SKU信息value
        var skuKeyAttrs = skuKey.split(";"); //SKU信息key属性值数组
        skuKeyAttrs.sort(function (value1, value2) {
          return parseInt(value1) - parseInt(value2);
        });

        //对每个SKU信息key属性值进行拆分组合
        var combArr = combInArray(skuKeyAttrs);
        for (j = 0; j < combArr.length; j++) {
          this.add2SKUResult(combArr[j], sku);
        }

        //结果集接放入SKUResult
        SKUResult[skuKeyAttrs.join(";")] = {
          ...sku,
          skuids: [sku.skuid],
          stock: sku.stock,
          prices: [sku.price],
          // expiredDate: [sku.expired_date]
        }

      }
      for (let item of attrData) {
        SKUAttr[item.attrId] = item.attrValues;
      }

      // console.log('SKUAttr:', SKUAttr);
      console.log('SKUResult:', SKUResult);
    },
    // 把组合的key放入结果集SKUResult
    add2SKUResult(combArrItem, sku) {
      var key = combArrItem.join(";");
      if (SKUResult[key]) { // SKU信息key属性·
        SKUResult[key].stock += sku.stock;
        SKUResult[key].prices.push(sku.price);
        SKUResult[key].skuids.push(sku.skuid);
        // SKUResult[key].expiredDate.push(sku.expired_date); // 日期
      } else {
        SKUResult[key] = {
          ...sku,
          skuids: [sku.skuid],
          stock: sku.stock,
          prices: [sku.price],
          // expiredDate: [sku.expired_date]
        };
      }
    },
  }
})
