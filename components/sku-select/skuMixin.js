
// import { dealPrice } from '../../utils/index'
export default {
  // 提供给子组件 修改父组件data 的方法
  setCurrentData(e) {
    console.log('setCurrentData', e.detail);
    const { currentSkuData } = e.detail;
    // // const { data }
    // 对 currentSkuData 做特殊处理
    if (currentSkuData) {
      const { currentSkuData: oldCurrentSkuData } = this.data;
      if (oldCurrentSkuData.skuid && currentSkuData.skuid && currentSkuData.skuid !== oldCurrentSkuData.skuid) {
        this.skuDataOnChange && this.skuDataOnChange(currentSkuData);
      }
    }

    this.setData({
      ...e.detail
    })
  },

};
