// 直接对 DOM 结构进行遍历
// 而不是建立一个数据结构，对数据结构在内部进行遍历的同时
// 再在外面进行遍历

// 动画执行的间隔
var config = {
  timer: 500,
  filter: function(node) {
    return node.tagName.toLowerCase() === "div" ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
  }
};

function delay(fn, t) {
  var _queue = [];
  var _task = null;

  // javascript 的设计错误让函数没法在私有作用域内
  function _schTask(fn, t) {
    _task = setTimeout(function(){
      fn();
      clearTimeout(_task);
      _task = null;
      if (_queue.length) {
        var next = _queue.shift();
        _schTask(next.fn, next.t);
      }
    }, t);
  }

  // 通过给全局变量 taskQueue 赋值一个函数内部的对象的属性
  // 来形成一个闭包
  // 起到类似于特权方法的作用
  // 避免使用 Self
  var privilegeMethod = {
    delay: function(fn, t) {
      if (_task || _queue.length) {
        _queue.push({fn: fn, t: t});
      } else {
        _schTask(fn, t)
      }

      return privilegeMethod;
    }
  }
  return privilegeMethod.delay(fn, t);
}

var taskQueue = delay(function(){}, 0);
var aniQueue = taskQueue.delay;

TreeWalker = {};

TreeWalker.prototype.show = function(){
  (function(node){
    // animtation
    var content = node.firstChild;
    if (content.nodeType === 3) {
      console.log(content.match(/\w+/)[0]);
    }
  })(this);
}

TreeWalker.prototype.inOrder = function(){
  (function fn(node){
    if (node && node.nodeType === 1) {
      if (node.firstChild.nodeType === 3) {
        fn(node.firstChild.nextSibling);
      } else {
        fn(node.firstChild);
      }
      TreeWalker.show.call(node);
      fn(node.lastChild);
    }
  })(this);
}

TreeWalker.prototype.preOrder = function() {
  (function fn(node){
    if (node && node.nodeType === 1) {
      TreeWalker.show.call(node);
      if (node.firstChild.nodeType === 3) {
        fn(node.firstChild.nextSibling);
      } else {
        fn(node.firstChild);
      }
      fn(node.lastChild);
    }
  })(this);
}

TreeWalker.prototype.postOrder = function() {
  (function fn(node){
    if (node && node.nodeType === 1) {
      if (node.firstChild.nodeType === 3) {
        fn(node.firstChild.nextSibling);
      } else {
        fn(node.firstChild);
      }
      fn(node.lastChild);
      TreeWalker.show.call(node);
    }
  })(this);
}

TreeWalker.prototype.BFS = function(){
  (function fn(node){
    if (node && node.nodeType === 1) {
      var current = node.firstChild;
      while (current) {
        if (current.nodeType === 1) {
          TreeWalker.show.call(e);
        }
        if (current.childNodes) {
          fn(current);
        }
        current = current.nextSibling;
      }
    }
  })(this);
}

TreeWalker.prototype.DFS = function(){
  (function fn(node){
    var current = node.firstChild;
    
  })(this);
}

var $ = function(selector){
  return document.querySelector(selector);
}

var e = $("body > div");
var search = $("#ensure");
var inOrder = $("#inOrder");
var preOrder = $("#preOrder");
var postOrder = $("#postOrder");
var BFS = $("#BFS");
var DFS = $("DFS");

search.addEventListener("click", function(){
  TreeWalker.search.call(e);
});

inOrder.addEventListener("click", function(){
  TreeWalker.inOrder.call(e);
});

preOrder.addEventListener("click", function(){
  TreeWalker.preOrder.call(e);
});

postOrder.addEventListener("click", function(){
  TreeWalker.postOrder.call(e);
});

BFS.addEventListener("click", function(){
  TreeWalker.BFS.call(e);
});

DFS.addEventListener("click", function(){
  TreeWalker.DFS.call(e);
});