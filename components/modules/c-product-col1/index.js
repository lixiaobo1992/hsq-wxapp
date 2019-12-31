import { baseComponent } from '@xmini/wxapp-component-base/index';

baseComponent({
  props: {
    data: {
      type: Object,
      value: {
        list: []
      },
      onShowAll:( data ) => {return data},
    }, // 默认值
  },
  data:{
    initDom: {},
    tagH:false,
  },
  // 计算属性
  computed: {

  },
  created() {},
  mounted () {
      // this.getDomRectWidth()
      this.setData({
        tagH:true,
      })
  },
  // 事件
  methods: {
    onDetailPage(e) {
      const { index, type, id} = e.currentTarget.dataset;
      const currentItem = this.data['data'].list[index] || {};
      const { can_bought, left_stock, link } = currentItem;
      console.log(type, id, 'dataxxx');
      switch (type) {
        case 'arrow':
          this.onShowAll(index, id);
        break;
        default:
          if(link){
            this.$page.onUrlPage(e);
          };
        break;
      };
    },
    onShowAll(index, id){
      console.log(this.data.data.list[index].showupArrow,'dataxxxx1x',index,this);
      const downStatus = this.data.data.list[index].showupArrow;
      this.$page.onShowAll({index, id, status:downStatus});
    },
  },
})
