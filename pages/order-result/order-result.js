import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import mixins from '../../utils/mixins';


xPage({
  ...mixins,
  data: {
    isLoading: true,
    payPrice: '',
    higePage: true,
  },
  onLoad(query) {
    this.onPageInit(query);
  },
  onShow() {
    const { id = '' } = this.pageQuery;
    if (!id) {
      setTimeout(() => {
        // 这里竟然不能直接调用展示
        wx.showToast({
          content: '参数错误, 返回首页', // 文字内容
        });
      }, 300);
      setTimeout(() => {
        this.forward('index');
      }, 2000);
      return;
    }
    this.refresh();
  },
  refresh() {
    this.getOrderResult()
  },
  getOrderResult() {
    this.setData({
      isLoading: true,
    })
    const { id = '' } = this.pageQuery;
    // 这里最后调用一个接口获得
    api.getOrderResult(
      {
        scope: this,
        weights: 1,

        orderIds: id,
      },
      res => {
        // const payPrice = Number(pay_price).toFixed(2);
        const totalPrice = res.data.totalPrice ? res.data.totalPrice : 0
        this.setData({
          isLoading: false,
          payPrice: (totalPrice / 100).toFixed(2),
          higePage: false,
        });
      },
      err => {

      },
    );
  },
  goOrderDetail() {
    xmini.piwikEvent('c_orderlist');
    this.forward('order-list');
  },
  goContinue() {
    xmini.piwikEvent('c_backhp');
    this.forward('index');
  },
});

