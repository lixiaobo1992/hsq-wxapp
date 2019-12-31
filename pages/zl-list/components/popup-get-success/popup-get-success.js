// pages/zl-list/components/popup-get-success/popup-get-success.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    startHasBoostPercent: {
      type: Number,
      optionalTypes: [String],
      value: 90,
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
    hidePopup(){
      this.triggerEvent('hidePopup', 'get-success')
    }
  }
})
