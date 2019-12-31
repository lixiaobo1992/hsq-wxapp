import { baseComponent } from '@xmini/wxapp-component-base/index';
import { formatCountDown, formatDate, formatNum } from '../../../utils/dateUtil';
baseComponent({
  props: {
    data: {
      type: Object,
      value: {
        list: []
      }
    }, // 默认值
  },
  data:{
    flag:'',
    countDown: '',
    kill_house: '',
    isShowTime: true,
  },
  // 计算属性
  computed: {

  },
  created() {
    this.dealCountDown();
    this.dealTimeOpt();
  },
  destroyed(){
    clearInterval(this.seckillTime);
  },
  // 事件
  methods: {
    seckillTime: null,
    onDetailPage(e) {
      const { index } = e.currentTarget.dataset;
      const currentItem = this.data['data'].list[index] || {};
      const { can_bought, left_stock, link } = currentItem;
      if (link) {
        this.$page.onUrlPage(e);
        console.log(e,'eitem')
      };
    },
    onUrlPage(e){
      console.log(e);
      this.$page.onUrlPage(e);
    },
    dealCountDown(){
      const that = this;
      const {
        timestamp = 0,
        seckill_start_time = 0,
        seckill_end_time = 0,
      } = this.data.data;
      // console.log(this.props.data, 'data item');
      let curretTime = parseInt(new Date().getTime() / 1000)
      const diffTime = timestamp - curretTime;
      curretTime = curretTime - diffTime;
      let localEndTime = 0;
      // console.log(diffTime, localEndTime, seckill_start_time, 'item time');
      clearInterval(this.seckillTime);

      if (seckill_end_time < timestamp) {
        that.setData({
          isShowTime: false,
        });
        clearInterval(that.seckillTime);
        return;
      }
      // 未开始
      if (seckill_start_time < curretTime) {
        localEndTime = curretTime - seckill_start_time;
        timing();
        that.seckillTime = setInterval(timing, 1000)
      } else if (curretTime < seckill_end_time) {
        // 进行中
        localEndTime = seckill_end_time - curretTime;
        timing();
        that.seckillTime = setInterval(timing, 1000)
      } else {
        clearInterval(this.seckillTime);
        that.setData({
          isShowTime: false,
        });
      }

      function timing() {
        let format = localEndTime > 86400 ? 'd天 H:F:S' : 'H:F:S';
        // console.log(localEndTime)
        if (localEndTime > 0) {
          let countDown = formatCountDown(localEndTime * 1000, format);
          // console.log(countDown);
          that.setData({
            countDown,
          });
          localEndTime = localEndTime - 1;
        } else {
          clearInterval(that.seckillTime);
        }
      }

    },
    //处理秒杀场次
    dealTimeOpt() {

      const {
        seckill_start_time: startTime,
        seckill_end_time: endTime,
        timestamp: serveTime
      } = this.data.data;

      let tempSession = ''

      // console.log(startTime, 'deal moduleItem');
      let remainTime = endTime - serveTime;
      let mStatus = formatDate(startTime, 'YM') == formatDate(serveTime, 'YM');//是否跨月
      if (!mStatus) {
        tempSession = formatDate(startTime, 'm月d日')
      }
      if (remainTime > 0) {
        let day = Math.abs(formatNum((serveTime - startTime) * 1000).day);
        // console.log(day,'day item');
        switch (day) {
          case 0:
            tempSession = formatDate(startTime, 'h') + `点场`;
          case 1:
            tempSession = `明天` + formatDate(startTime, 'h') + `点`;
          // case 2:
          //   return formatDate(startTime,'M日H点');
          default:
            tempSession = formatDate(startTime, 'd日h点');
        }
      } else {
        // remainTime = (serveTime - startTime) * 1000;
        // console.log(formatNum(remainTime),'moduleItem day');
        tempSession = 'end';
      }


      this.setData({
        kill_house: tempSession
      })
    },
  },
})
