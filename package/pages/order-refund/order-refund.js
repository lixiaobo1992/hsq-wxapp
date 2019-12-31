import {
  me,
  xmini,
  xPage,
} from '../../../config/xmini';
import api from '../../../api/index';
import {
  map,
} from '../../../utils/index';
import mixins from '../../../utils/mixins';

const qnInfo = {
  domain: 'https://img2.haoshiqi.net/',
};

xPage({

  /**
   * 页面的初始数据
   */
  ...mixins,
  data: {
    isLoading: true,

    imageList: [],
    imageMax: 3,
    showBigPic: false,
    imgUrl: '',
    product: {
      pay_price: 0,
    },

    comment: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onPageInit(options);
    if (options.refundPrice) { // 订单列表主订单退款金额
      this.setData({
        'product.pay_price': options.refundPrice,
      });
    }
    this.getRefundInit();

  },

  onShow() {

  },

  onUnload() {

  },

  getImageCount() {
    const count = this.data.imageMax - this.data.imageList.length;
    return count > 0 ? count : 0;
  },

  getSubOrderInfo() { // 获取子订单详情
    const subOrderId = this.pageQuery.subOrderId || '';
    if (!subOrderId) {
      return;
    }
    api.subOrderInfo({
      subOrderId
    }, (res) => {
      this.setData({
        product: {
          imgUrl: res.data.sku_thumbnail || res.data.skuThumbnail,
          skuName: res.data.sku_name,
          attrs: res.data.attrs_desc,
          pay_price: (res.data.pay_price / 100).toFixed(2),
        }
      });
    }, (err) => {
      // console.log(err);
    });
  },

  getRefundInit() {
    // const opt = {
    //     needRefresh: true,
    //   };
    // this.postMessage('order-list',opt);
    const orderId = this.pageQuery.orderId || '';
    const subOrderId = this.pageQuery.subOrderId || '';
    if (!orderId) {
      wx.showToast('参数order_id错误');
      return;
    }
    this.setData({
      isLoading: true,
    })
    api.refundInit({
      scope: this,
      weights: 1,

      orderId,
      subOrderId,
    }, (res) => {
      const { data } = res;
      // const data = { ...data2 };
      this.setData({
        isLoading: false,
        orderId,
        subOrderId,
        refundMethodName: data.refundMethodList[0].name,
        refundMethod: data.refundMethodList[0].id,
        refundReason: data.reasonList,
        salesRefundType: data.salesRefundType,
      });
      this.getSubOrderInfo();
    }, (err) => {
      // console.log(err);
    });
  },

  // //选择退款原因
  chooseReason() {
    const that = this;
    wx.showActionSheet({
      itemList: map(that.data.refundReason, 'name'), // 菜单按钮的文字数组
      success: (res) => {
        const index = res.tapIndex;
        if (index !== -1) {
          that.setData({
            reason: that.data.refundReason[index].name,
            reasonId: that.data.refundReason[index].id,
          });
        }
      },
    });
  },


  // //上传图片
  uploadImage() {
    const that = this;
    wx.chooseImage({
      count: this.getImageCount(),
      success: (res) => {
        that.setData({
          imageList: [
            ...that.data.imageList,
            ...res.tempFilePaths,
          ],
        });
      },
    });
  },

  // //预览图片
  previewImage(e) {
    const that = this;
    const { index } = e.currentTarget.dataset;
    wx.previewImage({
      current: index,
      urls: that.data.imageList, // 要预览的图片链接列表\
    });
  },

  // //删除图片
  clearImage(e) {
    const that = this;
    const { index } = e.currentTarget.dataset;
    const newImgList = [...that.data.imageList];
    newImgList.splice(index, 1);
    that.setData({
      imageList: newImgList,
    });
  },

  // //点击提交
  formSubmit(e) {
    const that = this;
    this.checkSubmitData();
    that.data.comment = (e.detail.value || e.detail.value.comment) || '';
    xmini.piwikEvent('c_submrefcomf', {
      orderid: this.pageQuery.orderId,
      suborderid: this.pageQuery.subOrderId,
    });
  },

  checkSubmitData() {
    const that = this;
    if (!that.data.reason) {
      wx.showToast('请选择退款原因！');
      return;
    }
    if (that.data.salesRefundType === 'AFTER_SALES' && that.data.imageList.length <= 0) {
      wx.showToast('请上传图片！');
      return;
    }
    wx.showModal({
      title: '提示', // confirm 框的标题
      content: '确认提交？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.upload();
        }
      },
    });
  },

  upload() {
    const that = this;
    if (qnInfo.token) {
      this.uploadQiniu();
    } else {
      api.getQiniuToken({}, (res) => {
        qnInfo.token = res.data.token;
        that.uploadQiniu();
      }, (err) => {
        wx.showToast('获取图片上传权限失败，请重新操作');
        // console.log(err);
      });
    }
  },


  uploadFile(file) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        // url: `http://upload.qiniu.com?token=${qnInfo.token}`,
        url: `https://up.qbox.me?token=${qnInfo.token}`,
        name: 'file',
        filePath: file,
        success: (res) => {
          const data = JSON.parse(res.data);
          const url = qnInfo.domain + data.hash + '?imageView2/0/q/70';
          // self.setData({
          //   qnImgList: [
          //     ...self.data.qnImgList,
          //     url,
          //   ],
          // });
          console.log(url);
          resolve(url);
        },
        fail(res) {
          console.log(res);
          // reject({
          //   title: '上传失败',
          // });
          reject(new Error('上传失败'));
          wx.showModal({
            title: '上传失败',
            content: '',
          });
        },
      });
    });
  },


  uploadQiniu() {
    const imgs = this.data.imageList;
    const uploadTasks = [];
    for (let i = 0; i < imgs.length; i++) {
      uploadTasks.push(this.uploadFile(imgs[i]));
    }

    // 这里有个问题，上传是异步操作，要全部执行完，再继续执行，需要封装下，等待执行完
    // 这里封装为 Promise，使用 Promise.all 执行

    Promise.all(uploadTasks).then((res) => {
      // 全部上传完成后，继续提交动作
      this.afterUploadedImg(res);
    }, (err) => {
      // console.log(err);
    });
  },
  afterUploadedImg(data) {
    const that = this;
    const imgs = data.length > 0 ? JSON.stringify(data) : '';
    const orderId = this.pageQuery.orderId || '';
    const subOrderId = this.pageQuery.subOrderId || '';
    console.log(data);
    console.log(that.data);
    api.refundApply({
      orderId,
      subOrderId,
      refundMethod: that.data.refundMethod,
      reasonId: that.data.reasonId,
      comment: that.data.comment,
      pics: imgs,
    }, (res) => {
      const { id } = res.data.refundInfo;
      this.goRefundDetail(id);
      const opt = {
        needRefresh: true,
      };
      this.postMessage('order-list', opt);
      this.postMessage('order-detail', opt);
      this.setData({
      });
    }, (err) => {
      // console.log(err);
    });
  },

  goRefundDetail(id) {
    // 需要跳转的应用内非 tabBar 的页面的路径，路径后可以带参数。参数与路径之间使用
    this.forward('order-refund-detail', {
      refundId: id,
      replace: true
    });
  },
});
