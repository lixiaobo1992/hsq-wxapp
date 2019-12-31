import {
  baseComponent
} from '@xmini/wxapp-component-base/index';
baseComponent({
  props: {
    promotions:{
      type: Array,
    },
    promotionTitle:{
      type: String,
    },
    type:{
      type:String,
    },
  },
  data: {
  },
  watch: {
  },
  computed: {
  },
  created() {

  },
  mounted() {
  },
  methods: {
    // 显示/关闭券弹窗
    handlepromotion(e) {
      const { type } = e.currentTarget.dataset;
      this.$emit('handlepromotion', {type});
    },
    //去凑单
    onPinDetail(e){
      const { id} = e.currentTarget.dataset;
      if (id) {
        this.$emit('goFullList', {id})
      }
    }
  },
})
