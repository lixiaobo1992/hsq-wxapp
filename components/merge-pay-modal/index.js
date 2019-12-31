import {
  baseComponent
} from '@xmini/wxapp-component-base/index';
baseComponent({
  props: {
    mergeInfo:{
      type: Object,
    },
    isMergePay:{
      type: Boolean,
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
    // 显示/关闭弹窗
    handlePayModal() {
      this.$emit('handlePayModal');
    },
    //付款
    checkOrder(e){
      const { id = '' } = e.currentTarget.dataset;
      this.$emit('checkOrder',{ id, type:'merge' });
    },
  },
})
