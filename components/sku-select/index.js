import { baseComponent } from '@xmini/wxapp-component-base';
// import { getObjKeys, combInArray } from './sku-util';
import { dealPrice, clone } from '../../utils/index'
import { isEmptyObject } from '../../utils/base/index';
// let SKUResult = {}; // 组合结果信息

// let SKUAttr = {}; // 处理后的attr // 全部的属性列表
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
    attrList: {
      type: Array,
      value: [],
    },
    // 规格对应sku信息
    skuStocksList: {
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
    smallCurrentSkuData: {
      type: Object,
      value: {
        priceText: '',
        stock: 0,
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
  },
  data: {

    currentSkuData: {},
    max_buy_sum: 100,
  },
  watch: {
    skuStocksList(newVal, oldVal) {
      // console.log(newVal);
      if (!isEmptyObject(newVal)) {
        return;
      }
      this.setData({}, () => {
        console.log('被调了')
        this.initSku();
        // this.setCurrentSkuData(this.data.selectedIds)
        // this.dealNewAttr(0, this.data.selectedIds)
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
        if(normSelectTag == 3) {
          classNameStr = 'cur'
        }
      }
      return classNameStr;
    }
  },
  created() {
    // 初始化 临时data
    this._data = {
      attrMap: {},
      cachedSkuList: {},
      selectdSkuAttrData: [],

      // 这两个值可以放在data 里
      notSelectedAttrName: '', // 未选择属性名
      selectedAttrName: [],
    };
  },
  mounted() {
    // console.log('reday');
  },
  methods: {
    onClose() {
      this.$emit('onSetParentData', {
        isShowPopup: false
      })
    },
    footerBtnClick(e) {
      const { type } = e.currentTarget.dataset;

      if (!this.data.skuBtnStatus.isBtnActive) return;
      if (this._data.notSelectedAttrName == '') {
        // type: 'buyBtn' 'confirmBtn' 'addShoppingCart',
        console.log('footerBtnClick - type:', type)
        this.$emit('onBtnClick', { type });
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

    attrSelect(e) {
      const { parentIndex, index, disabled = false } = e.currentTarget.dataset;
      const { attrData = [] } = this.data;
      // console.log(e);
      if (!disabled) {
        //
        const parentAttr = attrData[parentIndex] || {};
        const currentAttr = parentAttr.list && parentAttr.list[index] || '';

        if (!currentAttr) return;

        const isBeing = this.getIsSelectAttr(parentAttr.attr_id, currentAttr);

        // console.log('isBeing:', isBeing);

        if (isBeing) {
          delete this._data.selectdSkuAttrData[parentAttr.attr_id];
        } else {
          // 判断当前元素是否是同级
          if (this._data.selectdSkuAttrData[parentAttr.attr_id]) {
            delete this._data.selectdSkuAttrData[parentAttr.attr_id];
          }
          this._data.selectdSkuAttrData[parentAttr.attr_id] = {
            attr_id: parentAttr.attr_id,
            attr_name: parentAttr.attr_name,
            ids: currentAttr.ids,
            value: currentAttr.value
          };
        }

        this.dealNewAttr();
        this.getSelectdAttrSkuId();
        this.setNotOrSelectedAttrName();
      }
    },
    dealNewAttr() {
      // console.log('func dealNewAttr:: this._data == selectdSkuAttrData:', this._data.selectdSkuAttrData);
      // 根据已选属性 更新 attrList
      const { attrData = [] } = this.data;
      const { selectdSkuAttrData = {}, cachedSkuList = {} } = this._data;
      const selectdSkuAttrDataKeys = Object.keys(selectdSkuAttrData);
      // console.log('func dealNewAttr:: selectdSkuAttrDataKeys:', selectdSkuAttrDataKeys);
      const cachedSkuListKeys = Object.keys(cachedSkuList);
      for (let i = 0; i < attrData.length; i++) {
        let attrItem = attrData[i];
        if (!selectdSkuAttrData[attrItem.attr_id]) {
          delete attrItem.active;
        } else {
          attrItem.active = true;
        }

        // console.log('item:========', attrItem.attr_id);
        for(let s = 0; s < attrItem.list.length; s++) {
          let tempItem = attrItem.list[s];
          // 存在已选项
          if (selectdSkuAttrDataKeys.length) {
            // 是否存在
            let isBeing = this.getIsSelectAttr(attrItem.attr_id, tempItem)
            if (isBeing) {
              tempItem.active = true;
            } else {
              delete tempItem.active;

              let isDisabled = true;

              let tempSelectdSkuAttrData = clone(selectdSkuAttrData);
              tempSelectdSkuAttrData[attrData[i].attr_id] = {
                attr_id: attrItem.attr_id,
                attr_name: attrItem.attr_name,
                ids: tempItem.ids,
                value: tempItem.value
              }

              let currentSelectAttrValue = this.getSelectAttrValue(tempSelectdSkuAttrData);
              currentSelectAttrValue = currentSelectAttrValue.join(';');
              // console.log('====currentSelectAttrValue:', currentSelectAttrValue);
              // 判断 当前项是否可选
              // console.log(cachedSkuList[currentSelectAttrValue]);
              if (cachedSkuList[currentSelectAttrValue]) {
                isDisabled = false;
              }
              if (isDisabled) {
                tempItem.disabled = true;
              } else {
                delete tempItem.disabled;
              }
            }
          } else {
            delete tempItem.active;
            // 判断 当前项是否可选
            let isDisabled = true;
            for (let j = 0; j < cachedSkuListKeys.length; j++) {
              const tempKey = cachedSkuListKeys[j];
              if (tempKey.includes(tempItem.value)) {
                isDisabled = false;
                break;
              }
            }
            if (isDisabled) {
              tempItem.disabled = true;
            } else {
              delete tempItem.disabled;
            }
          }
        }

      }

      // console.log('func dealNewAttr:: new attrData:', attrData)
      this.setData({
        attrData,
      })
    },
    // 获取当前选择项的值
    getSelectAttrValue(selectdSkuAttrData) {
      // const { selectdSkuAttrData = {} } = this._data;
      const selectdSkuAttrDataKeys = Object.keys(selectdSkuAttrData);
      // 排序 这里注意 目前是根据 属性的顺序 index 作为id, 如果后面后台生成的id排序会有问题
      selectdSkuAttrDataKeys.sort((a, b) => {
        return parseInt(a)  - parseInt(b)
      })

      // console.log('func getSelectAttrValue:: selectdSkuAttrDataKeys: ', selectdSkuAttrDataKeys);

      let tempstr = [];
      for(let i = 0; i < selectdSkuAttrDataKeys.length; i++) {
        const key = selectdSkuAttrDataKeys[i];
        tempstr.push(selectdSkuAttrData[key].value);
      }

      return tempstr;
    },
    // 根据已选项获取当前sku
    getSelectdAttrSkuId() {
      const { selectdSkuAttrData = {} } = this._data;

      const { currentSkuData = {}, attrData = [] } = this.data;

      const selectdSkuAttrDataKeys = Object.keys(selectdSkuAttrData);
      if (!selectdSkuAttrDataKeys.length) return;
      if (selectdSkuAttrDataKeys.length !== attrData.length) return;

      let tempstr = this.getSelectAttrValue(this._data.selectdSkuAttrData);
      tempstr = tempstr.join(';')

      // console.log('func getSelectdAttrSkuId:: tempstr:', tempstr);
      const currentAttrIds = this._data.cachedSkuList[tempstr];
      const newCurrentSkuData = this.data.skuStocksList[currentAttrIds] || {};
      // console.log('func getSelectdAttrSkuId:: newCurrentSkuData:', newCurrentSkuData);

      if (newCurrentSkuData.skuid && currentSkuData && currentSkuData.skuid === newCurrentSkuData.skuid) {
        return;
      }

      this.setData({
        currentSkuData: newCurrentSkuData,
      })

      this.$emit('onSetParentData', { currentSkuData: newCurrentSkuData })
    },
    setNotOrSelectedAttrName() {
      const { selectdSkuAttrData = {} } = this._data;
      const { attrData = [] } = this.data;
      let notAttrName = '';
      let selectedAttrName = [];
      for (let i = 0; i < attrData.length; i++) {
        const attrItem = attrData[i];
        if (!selectdSkuAttrData[attrItem.attr_id]) {
          notAttrName+= ' ' + attrItem.attr_name;
        } else {
          selectedAttrName.push({
            type: attrItem.attr_name == '保质期' ? 2 : 1,
            attr_name: attrItem.attr_name,
            value: selectdSkuAttrData[attrItem.attr_id].value,
          })
        }
      }
      // console.log('func setNotOrSelectedAttrName:: notSelectedAttrName:', notAttrName);
      // console.log('func setNotOrSelectedAttrName:: selectedAttrName:', selectedAttrName);
      this._data.notSelectedAttrName = notAttrName;
      this._data.selectedAttrName = selectedAttrName;

      this.$emit('onSetParentData', {
        notSelectedAttrName: notAttrName,
        selectedAttrName,
      })
    },
    getIsSelectAttr(key_id, attr) {
      const { selectdSkuAttrData = {} } = this._data;
      const tempAttr = selectdSkuAttrData[key_id] || {};
      if (tempAttr.value == attr.value) {
        return true;
      }
      return false;
    },

    initSku() {
      // console.log(this.props);
      const { attrList = [], skuStocksList = {} } = this.data;
      // console.log('func initsku:: attrList:', attrList);
      // console.log('func initsku:: skuStocksList:', skuStocksList);
      let attrMap = {};
      let cachedSkuList = {};
      let selectdSkuAttrData = {};

      // 处理一个新的属性列表
      let newAttrList = [];
      for(let i = 0; i < attrList.length; i++) {
        const attr = attrList[i];
        if (!attr || !attr.list) {
          continue;
        }
        // 定义新的属性项
        let attrItem = {};
        attrItem['attr_id'] = i;
        attrItem['attr_name'] = attr.name;
        attrItem['list'] = [];

        let map = {};
        if (attr.name) {
          map['attr_id'] = attrItem['attr_id'];
          map['attr_name'] = attr.name;
          map['value'] = attr.defaultAttr || attr.default_attr;
          for(let s = 0; s < attr.list.length; s++) {
            let item = attr.list[s]
            for (let entry in item) {
              if (map['value'] == entry) {
                map['ids'] = item[entry];
              }
            }
          }
        }
        // 记录已选项
        selectdSkuAttrData[attrItem['attr_id']] = map;
        // 遍历每一个属性
        for(let s = 0; s < attr.list.length; s++) {
          const tempItem = attr.list[s];
          for(let key in tempItem) {
            attrItem['list'].push({
              ids: tempItem[key],
              value: key
            })
            // 将属性的key&value交换 同时转换为map
            attrMap[tempItem[key]] = key;
          }
        }

        newAttrList.push(attrItem);
      }

      for(let key in skuStocksList) {
        const tempArray = key.split(';');
        let nameList = [];
        for (let i = 0; i < tempArray.length; i++) {
          const attrName = getAttrNameByAttrId(tempArray[i]);
          if (attrName) {
            nameList.push(attrName + '')
          }
        }
        mapAttr('', 0, nameList, key, cachedSkuList)

      }

      this._data.attrMap = attrMap;
      this._data.selectdSkuAttrData = selectdSkuAttrData;
      this._data.cachedSkuList = cachedSkuList;


      // console.log('func initsku::cachedSkuList:', Object.keys(cachedSkuList).length, cachedSkuList);
      // console.log('func initsku::attrMap:', attrMap);
      // console.log('func initsku::selectdSkuAttrData:', selectdSkuAttrData)
      // console.log('func initsku::newAttrList:', newAttrList);

      this.setData({
        attrData: newAttrList
      }, () =>{

        this.getSelectdAttrSkuId();
        this.setNotOrSelectedAttrName();
        this.dealNewAttr();
      })


      function getAttrNameByAttrId(attrid) {
        for (let key in attrMap) {
          if (key.includes(attrid)) {
            return attrMap[key];
          }
        }
        return null;
      }

      function mapAttr(key, index, attrNames, skuKey, map) {
        if (index == attrNames.length){
          return;
        }

        for(let i = index; i < attrNames.length; i++) {
          if (key && !key.endsWith(';')) {
            key += ';';
          }
          let newkey = key + attrNames[i];
          map[newkey] = skuKey;
          index++;
          mapAttr(newkey, index, attrNames,skuKey, map)
        }
      }

    }


  }
})
