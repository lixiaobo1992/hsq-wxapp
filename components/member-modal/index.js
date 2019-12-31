import {
  baseComponent
} from '@xmini/wxapp-component-base/index';
baseComponent({
  props: {
    goodMemberInfo:{
      type: Object,
    },
    // isShowMemberModel:{
    //   type: Boolean,
    // },
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
    ModalClick() {
      this.$emit('ModalClick');
    },
  },
})
