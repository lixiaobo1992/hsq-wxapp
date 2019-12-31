import { baseComponent } from '@xmini/wxapp-component-base';

const defaultData = {
  width: 40,
  height: 40,
  icon: { image: { url: '', w: 0, h: 0 }, link: '' },
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
    isValid() {
      const { icon = {}, enable } = this.data['data'];
      return enable && icon.image && icon.image.url;
    },
    link() {
      const { icon = {} } = this.data['data'];
      return icon.link || '';
    },
    styles() {
      const { icon = {}, width = 40, height = 40, bottom = 0, right = 0 } = this.data['data'];
      let imageUrl = '';
      if (icon.image && icon.image.url) {
        imageUrl = icon.image.url;
      }
      const arr = [
        `width: ${width}px`,
        `height: ${height}px`,
        `bottom: ${bottom}px`,
        `right: ${right}px`,
        `background-image: url(${imageUrl})`
      ];
      return arr.join(';');
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
