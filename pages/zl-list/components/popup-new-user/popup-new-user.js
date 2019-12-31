import mixins from '../../../../utils/mixins';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    url: {
      type: String,
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
    ...mixins,
    hidePopup() {
      this.triggerEvent('hidePopup', 'newuser')
    },
  }
})
