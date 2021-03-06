import { baseComponent } from '@xmini/wxapp-component-base/index';

const defaultData = {
  width: 5,
  height: 3,
  list: [{ image: { url: '', w: 0, h: 0 }, link: '' }],
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
  methods: {
    onUrlPage(e) {
      // console.log(e);
      // console.log(this.$page)
      this.$page.onUrlPage(e);
    }
  }
})