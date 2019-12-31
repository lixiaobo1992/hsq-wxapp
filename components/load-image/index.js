// components/image/index.js
import { baseComponent } from '@xmini/wxapp-component-base/index';
// Component({
//   properties:{
//     //默认图片
//     defaultImage: String,
//     //原始图片
//     src: String,
//     width: String,
//     height: String,
//     //图片剪裁mode，同Image组件的mode
//     mode: {
//       type: String,
//       value: 'aspectFill'
//     }
//   },
//   data: {
//     loadFlag: false
//   },
//   attached() {
//     console.log(this.data)
//   },
//   methods: {
//     imgLoad(e) {
//       console.log(e)
//       this.setData({
//         loadFlag: true
//       })
//     },
//     imgErr(e) {
//       console.log('error',e)
//     },
//   }
// })
baseComponent({
  props: {
    //默认图片
    defaultImage: String,
    //原始图片
    src: String,
    width: String,
    height: String,
    lazyLoad: {
      type: Boolean,
      value: false
    },
    //图片剪裁mode，同Image组件的mode
    mode: {
      type: String,
      value: 'aspectFill'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    loadFlag: false
  },
  // watch: {
  //   src(newUrl, oldUrl) {
  //     console.warn('======', newUrl, '==', oldUrl)
  //   }
  // },
  created() {
    // console.log('1created this.data', this.data)
  },
  mounted() {
    // console.log('2created this.mounted',this.data)
  },
  /**
   * 组件的方法列表
   */
  methods: {
    imgLoad: function (e) {
      // console.log('3image load', e)
      this.setData({
        loadFlag: true
      })
    },
    imgErr: function (e) {
      // console.log('4image error',e)
    },
  }
})
