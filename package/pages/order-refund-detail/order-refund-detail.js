import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../../config/xmini';
import api from '../../../api/index';
import mixins from '../../../utils/mixins';

const app = getApp();

xPage({
  ...mixins,

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,

    showBigPic: false,
    imgUrl: '',
    userAvatar: 'https://img1.haoshiqi.net/wxapp/img/mine_a10ca780ae.png',
    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onPageInit(options);

    this.refresh()
  },

  onShow() {
  },


  refresh() {
    const { pageQuery = {} } = this;
    const refundOrderId = pageQuery.refundId;
    // const refundOrderId = "11049";
    this.getRefundDetail(refundOrderId);
  },

  getImageCount() {
    const count = this.data.imageMax - this.data.imageList.length;
    return count > 0 ? count : 0;
  },

  getRefundDetail(id) {
    const refundOrderId = id;
    this.setData({
      isLoading: true,
    })
    api.refundDetail({
      scope: this,
      weights: 1,

      refundOrderId,
    }, (res) => {
      this.setPageData(res);
    }, (err) => {
      // console.log(err);
    });
  },

  formatDate(date) {
    const timesTamp = date * 1000;
    const nDate = new Date(timesTamp);
    const y = nDate.getFullYear();
    const m = nDate.getMonth() + 1;
    const d = nDate.getDate();
    const h = nDate.getHours();
    const mu = nDate.getMinutes();
    const s = nDate.getSeconds();

    return y + '-' + this.formatNum(m) + '-' + this.formatNum(d) + ' ' + this.formatNum(h) + ':' + this.formatNum(mu) + ':' + this.formatNum(s);
  },

  formatNum(num) {
    const number = num;
    if (number < 10) {
      return '0' + number;
    } else {
      return number;
    }
  },

  setPageData(res) {
    const that = this;
    const { data } = res;
    const applyTime = this.formatDate(data.refundInfo.applyTime);
    // const imgList = JSON.parse(data.refundInfo.pics);
    if (data.auditList.length > 0) {
      for (let index = 0; index < data.auditList.length; index++) {
        const auditTime = this.formatDate(data.auditList[index].time);
        data.auditList[index] = Object.assign({ ...data.auditList[index] }, { auditTime });
      }
    }
    that.setData({
      isLoading: false,

      title: data.title,
      content: data.content,
      applyTime,
      reason: data.refundInfo.reason,
      method: data.refundInfo.method,
      amountDesc: data.refundInfo.amountDesc,
      refundImg: data.refundInfo.pics,
      note: data.refundInfo.note,
      refundOrderId: data.refundInfo.id,
      canComplaint: data.refundInfo.canComplaint,
      auditList: data.auditList,
    });
  },
  // //预览图片
  previewImage(e) {
    const that = this;
    const { index } = e.currentTarget.dataset;
    wx.previewImage({
      current: index,
      urls: that.data.refundImg, // 要预览的图片链接列表\
    });
  },

  // //申诉
  getCanComplaint(e) {
    const refundId = e.currentTarget.dataset.refundid;
    wx.showModal({
      title: '提示', // confirm 框的标题
      content: '确认申诉?',
      success: (res) => {
        if (res.confirm) {
          api.orderComplaint({
            refundOrderId: refundId,
          }, (res) => {
            this.setPageData(res);
          }, (err) => {
            // console.log(err);
          });
        }
      },
    });
    xmini.piwikEvent('c_platformhelp', {
      refundid: refundId
    });
  },
});
