// pages/zl-list/components/popup-rules/popup-rules.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    rules: {
      type: Array,
      value: [],
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
      this.triggerEvent('hidePopup', 'rules')
    }
  }
})
