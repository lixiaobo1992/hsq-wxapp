// pages/zl-list/components/popup-success/popup-success.js
import api from '../../../../api/index';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    baseInfo: {
      type: Object,
      default: {},
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    hidePopup() {
      this.triggerEvent('hidePopup', 'success')
    },
    exchangeTask(){
      console.log('兑换商品')   
      this.triggerEvent('exchange')      
    }
  }
})
