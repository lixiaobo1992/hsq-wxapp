import {
  baseComponent
} from '@xmini/wxapp-component-base/index';
// import {
//   xmini,
//   me
// } from '../../config/xmini';
// import api from '../../api/index';
// import {
//   formatDate
// } from '../../utils/dateUtil';
baseComponent({
  props: {
    coupons:{
      type: Array,
    }
  },
  data: {
    sucToast: false,
    showCoupons: false,
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
    //关闭券弹窗
    onClose(){
      console.log('关闭弹层！data');
      this.$emit('onClose');
    },
    //领取券
    getCoupon(e){
      const {
        index
      } = e.currentTarget.dataset;
      console.log('领取券！data', index);
      this.$emit('getCoupon',{index});
    },
  },
})
