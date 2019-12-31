/**
 * 使用方法：
 * wxss样式已在全局app.wxss中引入, 不用管
 * 在需要使用的wxml引入
 * <import src="/wxparse/wxParse.wxml" />
 * <template is="wxParse" data="{{wxParseData:article.nodes}}"/>  //article可变，为js中data.article，可能是别的属性
 * 在需要使用的js引入
 * const WxParse = require('../../wxparse/wxParse.js')
 * let that = this;
 * WxParse.wxParse('article', 'html', data, that);  //article为需要绑定的data.article, 'html'不要改！, data为富文本字符串, that就是this
 **/

import HtmlToJson from './html2json.js';
/**
 * 配置及公有属性
 **/
var realWindowWidth = 0;
var realWindowHeight = 0;
var pageStatus = '';
wx.getSystemInfo({
  success: function (res) {
    realWindowWidth = res.windowWidth
    realWindowHeight = res.windowHeight
  }
})
/**
 * 主函数入口区
 **/
function wxParse(bindName = 'wxParseData', type='html', data='<div class="color:red;">数据不能为空</div>', target,imagePadding, pageType = 'zt2') {
  var that = target;
  var transData = {};//存放转化后的数据
  pageStatus = pageType;
  if (type == 'html') {
    transData = HtmlToJson.html2json(data, bindName);
    // console.log(JSON.stringify(transData, ' ', ' '));
  }
  transData.view = {};
  transData.view.imagePadding = 0;
  if(typeof(imagePadding) != 'undefined'){
    transData.view.imagePadding = imagePadding
  }
  var bindData = {};
  bindData[bindName] = transData;
  that.setData(bindData)
  that.wxParseImgLoad = wxParseImgLoad;
  that.wxParseImgTap = wxParseImgTap;
}
// 图片点击事件
function wxParseImgTap(e) {
  return; //原本点击图片预览，现关闭
  var that = this;
  var nowImgUrl = e.target.dataset.src;
  var tagFrom = e.target.dataset.from;
  if (typeof (tagFrom) != 'undefined' && tagFrom.length > 0) {
    wx.previewImage({
      current: nowImgUrl, // 当前显示图片的http链接
      urls: that.data[tagFrom].imageUrls // 需要预览的图片http链接列表
    })
  }
}

/**
 * 图片视觉宽高计算函数区
 **/
function wxParseImgLoad(e) {
  var that = this;
  var tagFrom = e.target.dataset.from;
  var idx = e.target.dataset.idx;
  if (typeof (tagFrom) != 'undefined' && tagFrom.length > 0) {
    calMoreImageInfo(e, idx, that, tagFrom)
  }
}
// 假循环获取计算图片视觉最佳宽高
function calMoreImageInfo(e, idx, that, bindName) {
  var temData = that.data[bindName];
  if (!temData || temData.images.length == 0) {
    return;
  }
  var temImages = temData.images;
  //因为无法获取view宽度 需要自定义padding进行计算，稍后处理
  var recal = wxAutoImageCal(e.detail.width, e.detail.height,that,bindName);
  // temImages[idx].width = recal.imageWidth;
  // temImages[idx].height = recal.imageheight;
  // temData.images = temImages;
  // var bindData = {};
  // bindData[bindName] = temData;
  // that.setData(bindData);
  var index = temImages[idx].index
  var key = `${bindName}`
  for (var i of index.split('.')) key+=`.nodes[${i}]`
  var keyW = key + '.width'
  var keyH = key + '.height'
  that.setData({
    [keyW]: recal.imageWidth,
    [keyH]: recal.imageheight,
  })
}

// 计算视觉优先的图片宽高
function wxAutoImageCal(originalWidth, originalHeight,that,bindName) {
  //获取图片的原始长宽
  var windowWidth = 0, windowHeight = 0;
  var autoWidth = 0, autoHeight = 0;
  var results = {};
  var padding = that.data[bindName].view.imagePadding;
  windowWidth = realWindowWidth-2*padding;
  windowHeight = realWindowHeight;
  //判断按照那种方式进行缩放
  // console.log("windowWidth" + windowWidth);
  if(pageStatus != 'detail'){
    if (originalWidth > windowWidth) {//在图片width大于手机屏幕width时候
      autoWidth = windowWidth;
      // console.log("autoWidth" + autoWidth);
      autoHeight = (autoWidth * originalHeight) / originalWidth;
      // console.log("autoHeight" + autoHeight);
      results.imageWidth = autoWidth;
      results.imageheight = autoHeight;
    } else {//否则展示原来的数据
      results.imageWidth = originalWidth;
      results.imageheight = originalHeight;
    }
  }else{
    if (originalWidth > windowWidth) {//在图片width大于手机屏幕width时候
      autoWidth = windowWidth;
      autoHeight = (autoWidth * originalHeight) / originalWidth;
      results.imageWidth = '100%';
      results.imageheight = autoHeight;
    } else {//否则展示原来的数据
      autoWidth = windowWidth;
      results.imageWidth = '100%';
      results.imageheight = (autoWidth * originalHeight) / originalWidth;
    }
  }
  return results;
}

function wxParseTemArray(temArrayName,bindNameReg,total,that){
  var array = [];
  var temData = that.data;
  var obj = null;
  for(var i = 0; i < total; i++){
    var simArr = temData[bindNameReg+i].nodes;
    array.push(simArr);
  }

  temArrayName = temArrayName || 'wxParseTemArray';
  obj = JSON.parse('{"'+ temArrayName +'":""}');
  obj[temArrayName] = array;
  that.setData(obj);
}

module.exports = {
  wxParse: wxParse,
  wxParseTemArray:wxParseTemArray
}