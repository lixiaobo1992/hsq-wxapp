
import mixins from '../../../../utils/mixins';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    exchangeSuccessObj: {
      type: Object,
      value: {
        price: 30,
        title: '牛奶专区尊享券',
        lowstMoney: 200,
        dateTime: '19.09.20 - 19.12.31',
      },
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
    hidePopup(){
      this.triggerEvent('hidePopup', 'exchangeSuccess')
    }
  }
})
