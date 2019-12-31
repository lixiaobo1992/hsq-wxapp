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
      const { width, height = 0, layout } = this.data['data']

      let padding_top = (+height / +width) * 100
      if (layout == 1) {
        const swiperWidth = wx.$getSystemInfo().windowWidth - 34
        const percent = swiperWidth / wx.$getSystemInfo().windowWidth
        padding_top = (+height / +width) * percent * 100
      }
      return `padding-top: ${padding_top}%`;
    },
  },
  methods: {
    onUrlPage(e) {
      // console.log(e);
      // console.log(this.$page)
      // const { index, url} = e.currentTarget.dataset;
      console.log(e,'piwik');
      this.$page.onUrlPage(e);
    }
  }
})
