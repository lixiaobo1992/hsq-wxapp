import { baseComponent } from '@xmini/wxapp-component-base';

baseComponent({
  props: {
    data: {
      type: Object,
      value: {
        list: [],
        row: ''
      }
    }, // 默认值
  },
  data: {
    // 滚动条样式
    scheduleSpan: {
      width: '50%',
      left: 0,
    },
    categoryData: []
  },
  computed: {
    boxClassName() {
      const { row = '' } = this.data['data'];
      return row == 1 ? 'row1' : 'row2';
    },
    listClassName() {
      const { col } = this.data['data'];
      return col == 4 ? 'col4' : '';
    },
    categoryData() {
      // 这里行数写死了，1 or 2
      // console.log('c-category categoryData:', JSON.parse(JSON.stringify(this.data)))
      const { list = [], row = 1 } = this.data['data'];
      let categoryData = [];
      if (row == 1) {
        categoryData.push(list);
      } else {
        // let sum = Math.ceil(list.length / 2);
        // sum = sum < col ? col : sum;
        // const firstRow = list.slice(0, sum);
        // const lastRow = list.slice(sum, list.length);
        const firstRow = [],
          lastRow = [];
        list.forEach((it, i) => {
          if (i % 2 == 0) {
            firstRow.push(it);
          } else {
            lastRow.push(it);
          }
        });
        categoryData = [firstRow, lastRow];
      }
      // console.warn('categoryData', categoryData);
      return categoryData;
    },
    isShowSchedule() {
      const { list = [], col = 5, row = 1 } = this.data['data'];
      if ((col == 4 || col == 5) && ((row == 1 || row == 2) && list.length > col * row)) {
        return true;
      }
      return false;
    },
    scheduleSpanStyle() {
      const scheduleSpan = this.data.scheduleSpan;
      let tempArray = [];
      for (let key in scheduleSpan) {
        tempArray.push(`${key}: ${scheduleSpan[key]}`);
      }
      // console.log('tempArray', tempArray);
      return tempArray.join(';');
    },
  },
  // watch: {
  //   data(numberA, numberB) {
  //     console.log(numberA, numberB)
  //   }
  // },
  created() {
    // console.log('c-category created:', JSON.parse(JSON.stringify(this.data)))
    // 添加 临时数据
    // this.setData({}, () =>{
    //   // console.warn('created data',this.data)
    // })
    this._data = {
      windowWidth: 375,
      conentWidth: 375,
      scheduleBarWidth: 40,
      scheduleBarThumbWidth: 20,
    };
    const systemInfo = wx.$getSystemInfo();
    this._data.windowWidth = systemInfo.windowWidth || 375;
    const { col = 5, row = 1 } = this.data['data'];
    let itemWidth = parseInt(this._data.windowWidth / col);
    // console.log('itemWidth', itemWidth);
    // console.log('this.data.categoryData', this.data.categoryData);
    this.setData({}, () =>{
      // console.warn('this.data.categoryData', this.data.categoryData);
      let len = this.data.categoryData && this.data.categoryData[0].length || 5
      this._data.conentWidth = itemWidth * len;
      // console.log(this._data.conentWidth)
      if (len > col) {
        this.updatedScheduleBar();
      }
    })
  },
  mounted() {
    // console.log('reday', this.data);
  },
  methods: {
    imagload(e) {
      // console.log('imagload',e);
    },
    onUrlPage(e) {
      // console.log(e);
      console.log(this.$page, 'this.$page')
      this.$page.onUrlPage(e);
    },
    onScheduleScroll(e) {
      // console.log(e.detail);
      let scrollLeft = e.detail.scrollLeft;
      // console.log('scrollLeft', scrollLeft);
      scrollLeft = parseInt((scrollLeft / this._data.conentWidth) * this._data.scheduleBarWidth);
      // console.log('scrollLeft', scrollLeft);
      this.setData({
        'scheduleSpan.left': `${scrollLeft}px`,
      }, () => {
        this.set();
      })
    },
    updatedScheduleBar() {

      // console.log('this._data', this._data);
      this._data.scheduleBarThumbWidth = parseInt(this._data.windowWidth / this._data.conentWidth * this._data.scheduleBarWidth);
      // console.log('scheduleBarThumbWidth', this._data.scheduleBarThumbWidth);
      this.setData({
        'scheduleSpan.width': `${this._data.scheduleBarThumbWidth}px`,
      }, ()=>{
        // 计算属性 不能自动被更新，必须手动调用更新
        this.set();
      })
    },
  }
})
