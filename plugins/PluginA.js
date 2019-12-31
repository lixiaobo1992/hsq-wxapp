
// import xmini from '../lib/index';
import xmini from '@xmini/x-mini/lib/index';
import api from '../api/index'

export default class PluginA {
  // 监听生命周期事件 接收两个参数, (query?, context)
  events = {
    // 'app.onLaunch.before': 'preAppOnLaunch',
    // 'app.onShow.after': 'afterAppOnShow',
    'page.onShow.after': 'pageOnShow',
    'page.onHide.after': 'pageOnHide',
    'page.onUnload.after': 'pageOnUnload',
  };

  // 自定义暴露方法(挂载到 xmini 上)
  methods = {
    customMethod: 'customMethod',
  };
  constructor(config = {}) {
    this.config = config
  }
  pageOnShow(query = {}, ctx) {
    // 自定义
    if (ctx.pageQuery && ctx.pageQuery.carryTaskInfo) {
      console.log('开始任务 ------ ')
      api.doTaskStart({
        taskId: ctx.pageQuery.taskId,
        taskSign: ctx.pageQuery.taskSign,
        zeroTaskId: ctx.pageQuery.zeroTaskId,
      }, res => {

      }, err => {
        return true;
      })
    }
  }
  pageOnHide(query = {}, ctx) {
    if (ctx.pageQuery && ctx.pageQuery.carryTaskInfo) {
      api.doTaskFinish({
        sign: ctx.pageQuery.taskSign,
      }, res => {
      }, err => {
        return true;
      })
    }
  }
  pageOnUnload(query = {}, ctx){
    if (ctx.pageQuery && ctx.pageQuery.carryTaskInfo) {
      api.doTaskFinish({
        sign: ctx.pageQuery.taskSign,
      }, res => {

      }, err => {
        return true;
      })
    }
  }
  customMethod() {

  }
}
