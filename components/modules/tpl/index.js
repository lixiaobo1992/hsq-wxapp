import { baseComponent } from '@xmini/wxapp-component-base/index';
import { isObject, isArray, isEmptyObject } from '../../../utils/base/index'
let windowWidth = 375;
// components/modules/c-img/index.js
baseComponent({
  /**
   * 组件的属性列表
   */
  props: {
    data: {
      type: Object,
      value: {
        list: []
      },
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  computed: {
    isValid() {
      if (!this.data['data']) {
        return false;
      }
      const { list = [] } = this.data['data'];
      return list && list.length;
    },
    styles() {
      if (!this.data['data']) {
        return '';
      }
      let { bg, bg_color, margin_bottom, margin_top, margin_lr } = this.data['data'];
      let { style = {} } = this.data; // 等下处理
      margin_top = this.calculateModuleMargin(margin_top) || 0;
      margin_bottom = this.calculateModuleMargin(margin_bottom) || 0;
      margin_lr = this.calculateModuleMargin(margin_lr);
      // paddingTop = (item.height / item.width) * 100;
      // height = this.calculateModuleHeight(item.width, item.height);
      // console.log(this.props)
      let tempStyle = [
        bg ? { backgroundImage: `url(${bg.url})` } : {},
        bg_color ? { backgroundColor: bg_color } : {},
        margin_top ? { marginTop: `${margin_top}px` } : {},
        margin_bottom ? { marginBottom: `${margin_bottom}px` } : {},
        margin_lr ? { marginLeft: `${margin_lr}px` } : {},
        margin_lr ? { marginRight: `${margin_lr}px` } : {},
      ];
      // 筛选数组中的空对象
      tempStyle = tempStyle.filter(i => {
        if (!isEmptyObject(i)) return false
        return true;
      })
      if (isObject(style)) {
        tempStyle.push(style);
      } else if (isArray(style)) {
        tempStyle = tempStyle.concat(style);
      }
      // 合并样式
      const newStyel = mergeStyle(tempStyle);
      // console.log(newStyel);
      let tempArray = [];
      for (let key in newStyel) {
        tempArray.push(`${key}: ${newStyel[key]}`);
      }
      // console.log(tempStyle);
      return tempArray.join(';');
    },
  },
  created() {
    const systemInfo = wx.$getSystemInfo();
    windowWidth = systemInfo.windowWidth;
  },
  /**
   * 组件的方法列表
   */
  methods: {
    calculateModuleMargin(margin = 0) {
      return Math.round((windowWidth / 375) * margin);
    },
  }
})




function mergeStyle(styleObj) {
  let tempObj = {};
  if (Array.isArray(styleObj)) {
    for (let i = 0; i < styleObj.length; i++) {
      let item = styleObj[i];
      if (isObject(item)) {
        let tempItem = dealKey(item);
        Object.assign(tempObj, tempItem);
      } else if (Array.isArray(item)) {
        merge(item)
      }
    }
  } else if (isObject(styleObj)) {
    let tempItem = dealKey(styleObj);
    Object.assign(tempObj, tempItem);
  }
  return tempObj
}

function dealKey(item = {}) {
  let newObj = {};
  Object.keys(item).forEach(key => {
    let newKey = key.replace(/[A-Z]/g, function (e) {
      // console.log(e)
      return '-' + e.toLowerCase();
    })
    newObj[newKey] = item[key]
  });
  return newObj;
}
