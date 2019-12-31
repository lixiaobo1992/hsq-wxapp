// pages/zl-list/components/popup-start/popup-start.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showPrizeInfo: {
      type: Object,
      value: {
        helpSuccess: false,
        avatar: '',
        speed: 3,
        startBoostPercent: 90,
      }
    }
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
      this.triggerEvent('hidePopup', 'start')
    }
  }
})
