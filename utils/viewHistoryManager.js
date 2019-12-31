

const _kViewHistoryKey = "com.haoshiqi.viewHistory";
const _kTimeout = Number.MAX_VALUE;
const _kThreshold = 30;

// 浏览记录管理
class _ViewHistoryManager  {

  constructor() {
    this._viewHistory = [];
    this._hasReadData = false;
  };
  
  // 获取浏览历史记录 
  viewHistory() {
    this._readViewHistoryFormStorage();
    // 处理过期数据
    this._dealTimeoutData();
    return this._viewHistory;
  };

  // 添加浏览历史
  addViewHistory(obj) {
    
    this._readViewHistoryFormStorage();
    // 添加到缓存中

    // 1. 查找缓存目标
    let {target, index} = {};
    
    for (var i = this._viewHistory.length - 1; i >= 0; i--) {
      const item = this._viewHistory[i];
      if (item.pinActivityId === obj.pinActivityId && item.productId === obj.productId) {
        target = item;
        index = i;
        break;
      }
    }
    if (!target) {
      target = obj;
    } else {
      this._viewHistory.splice(index, 1);
    }
    target.timeout = new Date() + _kTimeout * 1000;
    this._viewHistory.unshift(target);

    // 2.储存本地
    this._synchronize();
  };

  // 删除浏览历史
  deleteViewHistory(obj) {
    let index = null;
    for (var i = this._viewHistory.length - 1; i >= 0; i--) {
      const item = this._viewHistory[i];
      if (item.pinActivityId === obj.pinActivityId && item.productId === obj.productId) {
        index = i;
        break;
      }
    }
    this._viewHistory.splice(index, 1);

    this._synchronize();
  };

  // 从本地读取数据
  // 每次运行指挥执行一次
  _readViewHistoryFormStorage() {
    if (this._hasReadData) return;
    this._hasReadData = true;
    try {
      var data = wx.getStorageSync(_kViewHistoryKey);
      if (data) {
        console.log(data);
        // TODO
        this._viewHistory = data;
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 同步缓存数据到本地
  _synchronize() {
    wx.setStorage({
      key: _kViewHistoryKey,
      data: this._viewHistory,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  };

  _dealTimeoutData() {
    if (!this._viewHistory.length) return;

    // 阈值处理
    if (this._viewHistory.length > _kThreshold) {
      this._viewHistory = this._viewHistory.slice(0, _kThreshold);
    }

    // 过期处理
    for (var i = this._viewHistory.length - 1; i >= 0; i--) {
      const obj = this._viewHistory[i];
      const now = new Date();
      if (obj.timeout && obj.timeout < now) {
        this._viewHistory.pop();
        continue;
      }
      break;
    }
    this._synchronize();
  };
}

const _manager = new _ViewHistoryManager();

// const manager = {
//   viewHistory: _manager.viewHistory,
//   addHistory: _manager.addViewHistory,
// }

module.exports = _manager;