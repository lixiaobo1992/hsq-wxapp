import { baseComponent } from '@xmini/wxapp-component-base';

const defaultData = {
  width: 5,
  height: 3,
  list: [],
};
baseComponent({
  props: {
    data: {
      type: Object,
      value: defaultData
    }, // 默认值
  },
  data: {
    // syy: { borderTop: '1px solid #0f0'}
  },
  computed: {
    innerStyles() {
      const { width, height = 0, list = [] } = this.data['data'];
      const ratio = width ? height / width : 0;
      return ratio ? `padding-top: ${(ratio * 100) / list.length}%` : '';
    },
  },
  methods: {
    onUrlPage(e) {
      // console.log(e);
      // console.log(this.$page)
      this.$page.onUrlPage(e);
    }
  }
})