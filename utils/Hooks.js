
/* eslint-disable */

function hook(realFunc, hookFunc, context, funcName) {
  var _context = null; //函数上下文
  var _funcName = null; //函数名

  _context = context || window;
  _funcName = funcName || getFuncName(this);
  _context[realFunc] = this;

  if (_context[_funcName].prototype && _context[_funcName].prototype.isHooked) {
    console.log("Already has been hooked,unhook first");
    return false;
  }
  function getFuncName (fn) {
    // 获取函数名
    var strFunc = fn.toString();
    var _regex = /function\s+(\w+)\s*\(/;
    var patten = strFunc.match(_regex);
    if (patten) {
        return patten[1];
    };
    return '';
  }
  try {
    eval('_context[_funcName] = function '+_funcName+'(){\n'+
        'var args = Array.prototype.slice.call(arguments,0);\n'+
        'var obj = this;\n'+
        'hookFunc.apply(obj,args)\n'+
        'return _context[realFunc].apply(obj,args);\n'+
        '};');
    _context[_funcName].prototype.isHooked = true;
    return true;
  } catch (e){
    console.log("Hook failed,check the params.");
    return false;
  }
}

function unhook(realFunc, funcName, context) {
  var _context = null;
  var _funcName = null;
  _context = context || window;
  _funcName = funcName;
  if (!_context[_funcName].prototype.isHooked) {
    console.log("No function is hooked on");
    return false;
  }
  _context[_funcName] = _context[realFunc];
  delete _context[realFunc];
  return true;
}

module.exports = class Hooks {
  constructor() {

  }

  initEnv() {
    Function.prototype.hook = hook;
    Function.prototype.unhook = unhook;
  }

  cleanEnv() {
    if(Function.prototype.hasOwnProperty("hook")){
        delete Function.prototype.hook;
    }
    if(Function.prototype.hasOwnProperty("unhook")){
        delete Function.prototype.unhook;
    }
    return true;
  }
}

/* test

var hook = Hooks();
hook.initEnv();

// 这个是要执行的正常的函数
function test(){
  alert('test');
}

// 这个是钩子函数。此钩子函数内心戏：
// 我只喜欢test函数，所以我必须出现在她前面（在她前面执行），这样她才能看到我。
function hookFunc(){
  alert('hookFunc');
}

// hookFunc钩住test
test.hook(test,hookFunc,window,"test");

window.onload = function(){
  // 由于钩子函数hookFunc钩住了test函数，所以test执行时，会先执行hookFunc。
  test();
}

*/
