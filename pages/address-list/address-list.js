// pages/address-list/address-list.js
import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '../../api/index';
import mixins from '../../utils/mixins';

// const app = getApp();

xPage({
  ...mixins,

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    address: [],
    isFromOrder: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (query) {
    this.onPageInit(query);

    if (query.orderAddress) {
      this.setData({
        isFromOrder: true,
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // this.getAddressList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.refresh();
    this.onMessage();
  },


  /**
   * 刷新消息
   */
  sendRefreshMessage() {
    const { ref, needRefresh } = this.pageQuery;
    if (ref && needRefresh) {
      this.postMessage(ref, {
        needRefresh: true,
      });
    }
  },

  refresh() {
    this.getAddressList();
    // 有更新收获地址信息，回到上页刷新数据
    this.sendRefreshMessage();
  },

  /**
   * 获取地址列表
   */
  getAddressList: function () {
    this.setData({
      isLoading: true,
    })
    api.addressList({
      scope: this,
      weights: 1,
    }, (res) => {
      console.log(res.data);
      this.setData({
        isLoading: false,
        address: res.data.list,
      });
    }, (err) => {
      if (err.errno === 510010) {
        this.forward('login', { refresh: true });
        return true;
      }
    });
  },

  setDefault(e) { // 设置默认地址
    const id = parseInt(e.currentTarget.dataset.id, 10);
    api.setDefaultAddress({ addressId: id }, (res) => {
      // console.log(res.data);
      if (res.data.res) {
        const addresses = [...this.data.address];
        for (const item of addresses) {
          if (item.id === id) {
            item.is_default = 1;
          } else {
            item.is_default = 0;
          }
        }
        addresses.sort((x) => {
          return x.is_default ? -1 : 1;
        });
        this.setData({
          address: addresses,
        });
        xmini.store.dispatch('setAddresses');
      }
    }, (err) => {
      // console.log(err);
    });
  },

  edit(e) { // 编辑地址
    const { id, index } = e.currentTarget.dataset;
    this.forward('address-update', {
      refresh: true,
      id,
      index,
      ...this.data.address[index],
    });
  },

  delete(e) { // 删除地址
    const { id, index } = e.currentTarget.dataset;
    wx.showModal({
      title: '确定删除该地址？',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (result) => {
        if (result.confirm) {
          this.deleteConfirm(id, index);
        }
      },
    });
  },

  deleteConfirm(id, index) {
    api.deleteAddress({ addressId: id }, (res) => {
      // console.log(res.data);
      if (res.data.res) {
        const addresses = [...this.data.address];
        addresses.splice(index, 1);
        this.setData({
          address: addresses,
        });
        // if (addresses.length <= 0) {
        this.sendRefreshMessage();
        // }
        xmini.store.dispatch('setAddresses');

      }
    }, (err) => {
      // console.log(err);
    });
  },

  addAddress() {
    this.forward('address-update', {
      refresh: true,
    });
  },

  selectOrderAddr(e) { // 跳回订单页面
    const { index } = e.currentTarget.dataset;
    const currentAddress = this.data.address[index];
    console.log(currentAddress);
    if (this.data.isFromOrder) {
      // app.updateData({ addressId: id });
      xmini.store.dispatch('setOrderCommitAddress', currentAddress);
      this.back();
    }
  },

});

