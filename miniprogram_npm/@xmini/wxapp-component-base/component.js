"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.baseComponent = baseComponent;

var _basic = require("./basic");

var _index = require("./observer/index");

function mapKeys(source, target, map) {
  Object.keys(map).forEach(key => {
    if (source[key]) {
      target[map[key]] = source[key];
    }
  });
}

function baseComponent(opts = {}) {
  const options = {};
  mapKeys(opts, options, {
    data: 'data',
    props: 'properties',
    mixins: 'behaviors',
    methods: 'methods',
    beforeCreate: 'created',
    // 在组件实例刚刚被创建时执行
    created: 'attached',
    // 在组件实例进入页面节点树时执行
    mounted: 'ready',
    // 在组件在视图层布局完成后执行
    // updated: 'moved', // 在组件实例被移动到节点树另一个位置时执行
    relations: 'relations',
    destroyed: 'detached',
    // 在组件实例被从页面节点树移除时执行
    classes: 'externalClasses' // error: 'error', // 每当组件方法抛出错误时执行

  });
  const {
    relation
  } = opts;

  if (relation) {} // options.relations = Object.assign(options.relations || {}, {
  //   [`@xmini/${relation.name}/index`]: relation,
  // });
  // add default externalClasses


  options.externalClasses = options.externalClasses || [];
  options.externalClasses.push('custom-class'); // add default behaviors

  options.behaviors = options.behaviors || [];
  options.behaviors.push(_basic.basic); // map field to form-field behavior

  if (opts.field) {
    options.behaviors.push('wx://form-field');
  } // add default options


  options.options = {
    multipleSlots: true,
    addGlobalClass: true
  };
  (0, _index.observe)(opts, options);
  Component(options);
}