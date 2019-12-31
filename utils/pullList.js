import { getArray } from './modelUtil'
let requestIndex = 0; // 请求位置 防止同时请求返回数据相互覆盖问题
const pullList = {
  // 滚动记载常用配置
  pullParamsDefault: {
    pageNum: 1,
    pageLimit: 20,
    needPagination: 1,
  },
  pullParams: {},
  hasMore: true,
  pullModel: null,

  // 下拉刷新
  // 部分安卓有bug，下拉后刷新状态有可能点击到下一页面，返回则下拉刷新状态一直存在，于是死掉了
  onPullDownRefresh() {
    if (typeof this.refresh === 'function') {
      this.refresh();
    }
  },

  // 加载更多
  onScrollToLower() {
    console.log(1)
    console.log('触发滚动加载 当前第' + this.pullParams.pageNum + '页');
    console.log('this.hasMore:', this.hasMore);
    if (!this.hasMore) {
      wx.hideLoading();
      this.setData({
        pullLoading: false,
      });
      console.log('没有更多数据了');
      return;
    }

    // Object.assign(this.pullParams);

    const qIndex = requestIndex;
    requestIndex++;
    // this.pullModel = api.getPointList
    this.logTime && this.logTime('底部列表请求');
    // 判断页面是否存在接口赋值
    if (!this.pullModel || typeof this.pullModel != 'function') return
    this.pullModel({
      ...this.pullParamsDefault,
      ...this.pullParams,
      isLoading: false
    }, (res) => {
      // console.log(res,'pullModel res')
      this.logTimeEnd && this.logTimeEnd();
      this.stopPullDownRefresh();
      wx.hideLoading();
      if (requestIndex - 1 > qIndex) {
        return;
      }
      if (typeof this.afterPull === 'function') {
        this.afterPull(res);
      }
      // this.setData({
      //   totalCnt: res.data.totalCnt,
      //   timestamp: res.timestamp,
      //   diffTime: res.timestamp * 1000 - Date.now(),
      // });
      this.dealData(res);
      // this.bottomLoading = false;
      // this.setData({
      //   bottomLoading: this.bottomLoading,
      // });
    }, (err) => {
      this.stopPullDownRefresh();
      wx.hideLoading();

      console.log(err);
      if (err.errno === 510010) {
        this.forward('login');
        return true;
      }
    });
  },

  stopPullDownRefresh() {
    if (this.pullParams.pageNum === 1) {
      wx.stopPullDownRefresh();
    }
  },

  dealData(res = {}) {
    const allData = {
      totalCnt: res.data.totalCnt,
      timestamp: res.timestamp,
      diffTime: res.timestamp * 1000 - Date.now(),
    };
    const { data = {} } = res;
    const { pageNum } = this.pullParams;
    this.hasMore = data.totalPage > pageNum;
    if (pageNum === 1) {
      allData.list = [];
    }
    if (this.hasMore) {
      this.pullParams.pageNum += 1;
    }
    // this.setData({
    //   // bottomLoading: this.hasMore,
    //   showFooter: !this.hasMore,
    //   pullLoading: this.hasMore,
    // });
    allData.showFooter = !this.hasMore;
    allData.pullLoading = this.hasMore;
    if (typeof this.dealList === 'function') {
      const list = getArray(data, 'list') ;
      let temp = [];
      if (list.length) {
        temp = this.dealList(list) || [];
      } else {
        console.log('无数据');
        this.setData({
          ...allData,
          // list: [],
        });
        if (typeof this.afterPullData === 'function') {
          this.afterPullData([], res);
        }
        return;
      }
      /* eslint no-param-reassign: 0 */
      data.list = temp.filter(i => i);
    }
    const { list = [] } = this.data;
    if (pageNum === 1) {
      list.length = 0;
    }
    const tempList = [
      ...list,
      ...data.list,
    ]
    this.logTime && this.logTime('渲染列表' + pageNum);
    allData.list = tempList;
    this.setData({
      ...allData,
    }, () => {
      this.logTimeEnd && this.logTimeEnd();
    });

    if (typeof this.afterPullData === 'function') {
      this.afterPullData(tempList, res);
    }
  },
  initPullList() {
    this.pullParams.pageNum = 1;
    this.hasMore = true;
  },
};


module.exports = pullList;
