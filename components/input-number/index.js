import { baseComponent } from '@xmini/wxapp-component-base';
import { isFastClick } from '../../utils/is';
baseComponent({
  props: {
    value: {
      type: Number,
      value: 1,
    },
    min: {
      type: Number,
      value: 1
    },
    max: {
      type: Number,
      value: 0,
    },
    extra: {
      type: Object,
      value: {},
    },
    size: {
      type: String,
      value: 'normal' // normal、small
    },
    styleType: {
      type: String,
      value: 'not-border' //not-border || border
    },
    disabled: {
      type: Boolean,
      value: false
    },
  },
  data: {
    num: 1,
  },
  watch: {
    value(newVal, oldVal) {
      if (newVal != this.data.num) {
        this._onChange(newVal, false, true);
      }
    },
    max(newVal, oldVal) {
      if (newVal != oldVal) {
        let val = this.data.num;
        if (this.data.value != this.data.num) {
          val = this.data.value;
        }
        this._onChange(val, false, true);
      }
    }
  },
  computed: {
  },
  created() {
    const { value, max, min } = this.data;
    this._onChange(value, false, false);
  },
  mounted() {
    console.log('reday');
  },
  methods: {
    //
    _bindblur(e) {
      // console.log('_bindblur', e);
      const { value } = e.detail;
      let { min, max, num } = this.data;
      if (max > 0 && value >= max){
        wx.showToast(`最多只能买${max}件哦！`)
        this._onChange(+max, false, false);
        return;
      }else{
        this._onChange(+value, true, false);
      }
    },
    _onClick(e) {
      // console.log(e.currentTarget.dataset);
      if(!isFastClick()) return
      const { action } = e.currentTarget.dataset;
      let { min, max, num } = this.data;
      if (action == 'plus') {
        if (max > 0 && num >= max) {
          wx.showToast(`最多只能买${max}件哦！`)
          return;
        }
        num++;
      } else if (action == 'reduce') {
        if (min > 0 && num <= min) {
          if (num == 1) {
            wx.showToast('最少买1件哦！');
          }
          return;
        }
        num--;
      }
      this._onChange(num,true,false);
    },
    _onChange(val, isToast = true, propChange = false) {  // isToast是否需要弹Toast；propChange传入prop引发的change
      if (this.data.disabled) {
        return;
      }
      const { min, max, num, extra } = this.data;
      val = parseInt(val);
      if (isNaN(val)) {
        val = 0;
      }
      let value = val;
      if (max > 0 && val > max) { // 超出
        isToast && wx.showToast(`最多只能买${max}件哦！`);
        propChange = true;
      }
      if (min > 0 && val < min) {
        isToast && wx.showToast('最少买1件哦！');
        value = min;
        val = min;
      }
      if (val <= 0) {
        value = num;
      }
      this.setData({
        num: value
      });
      this.$emit('onChange', { value, oldVal: num, newVal: val, propChange: propChange, extra });
      // value：当前值，oldVal：上一个值，newVal输入值
    },
    _getFocus() {
      // 用做阻止事件冒泡 导致购物车页面直接跳转到商品详情页 的问题
    },
  },
})
