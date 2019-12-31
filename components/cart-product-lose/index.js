import { baseComponent } from '@xmini/wxapp-component-base/index';
import { xmini } from '../../config/xmini';
import api from '../../api/index';

baseComponent( {
  props: {
    data: {
      type: Object,
      value: {
        list: []
      }
    },
  },
  data: {

  },
  created() {
    console.log(this, 'created loseGoodsList')
  },
  methods: {
    // 找相似
    findAlikeGoods(e) {
      const { name } = e.currentTarget.dataset;
      this.$page.forward('couple-search-list',{
        q: name
      })

    },

    // 清空失效商品
    clearLoseGoods() {
      wx.showModal({
        content: '是否删除所有失效商品',
        confirmText: '删除',
        cancelText: '取消',
        success: (result) => {
          let loseGoodsList = this.data.data.list;
          let loseSkuIds = [];
          for(let i = 0; i < loseGoodsList.length ; i++ ){
            loseSkuIds.push(loseGoodsList[i].sku_id);
          }
          let loseSkuIdString = loseSkuIds.join(',');
          if(result.confirm) {     // result.confirm  true是代表点击删除   false是取消
            // 调用删除失效商品接口
            api.removeInvalidCartSku({}, (res) => {
              this.$page.clearGoods();
              xmini.piwikEvent('c_loseeffect',{
                skuid: loseSkuIdString
              })
            }, (err) => {

            })
          }
        },
      });
    },

  }
})
