import { baseComponent } from '@xmini/wxapp-component-base/index';

let tempIndex = -1;

baseComponent({
  props: {
    msgData: {
      type: Object,
      value: []
    }
  },
  data:{
    activeIndex: -1,
    duration: 6000,
    animationInfo: {},
  },

  watch: {
    msgData(newVal, oldVal) {
      // console.log('来新数据了', newVal);
      this.startCarousel();
    },
  },
  // 计算属性
  computed: {

  },
  created() {
    
    this.animation = wx.createAnimation({
      duration: 1000,
      timeFunction: 'ease-in-out',
    });

    this.startCarousel();

  },
  // 事件
  methods: {
    onDetailPage(e) {
      let item = e.currentTarget.dataset.item;
      this.$page.forward('detail',{
        id: item.pin_activities_id
      })
    },
    testFn(data){
      console.log(data)
    },
    startCarousel() {
      if (this.data.msgData.length) {
        this.start();
      } else {
        this.stop();
      }
    },
    start() {
      this.stop();
      tempIndex = -1;
      this.change();
      this.interTime = setInterval(() => {
        this.change();
      }, this.data.duration + 1000);
    },
    stop() {
      clearInterval(this.interTime);
    },
    change() {
      if (tempIndex == this.data.msgData.length - 1) {
        tempIndex = -1;
        this.stop();
        return;
      } else {
        tempIndex++;
      }
      this.animation.opacity(1).translateY(0).step();
      this.setData({
        activeIndex: tempIndex,
        animationInfo: this.animation.export()
      });
      setTimeout(() => {
        this.animation.opacity(0).translateY(20).step();
        this.setData({
          animationInfo: this.animation.export()
        });
      }, this.data.duration)
    },
  },
})