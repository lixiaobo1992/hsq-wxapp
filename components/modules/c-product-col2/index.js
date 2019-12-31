import { baseComponent } from '@xmini/wxapp-component-base/index';

baseComponent({
  props: {
    data: {
      type: Object,
      value: {
        list: []
      }
    }, // 默认值
  },
  // 计算属性
  computed: {

  },
  created() {
    // console.log(this.data);
  },
  // 事件
  methods: {
    onDetailPage(e) {
      const { index } = e.currentTarget.dataset;
      const currentItem = this.data['data'].list[index] || {};
      const { can_bought, left_stock, link } = currentItem;
      if (link) {
        this.$page.onUrlPage(e);
      };
    },
  },
})