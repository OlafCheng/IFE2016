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
        _schTask(fn, t);
      }

      return privilegeMethod;
    }
  };
  return privilegeMethod.delay(fn, t);
}

//  childNodes.nodeType === 1
function findChildNodes(node) {
  return !node.childNodes ?
          null :
          [].filter.call(node.childNodes, (e) => {return e.nodeType && e.nodeType === 1;});
}


var taskQueue = delay(function(){}, 0);
var aniQueue = taskQueue.delay;

TreeWalker = function () {};

TreeWalker.prototype.show = function(){
  (function(node){
    // animtation
    var content = node.firstChild || node[0] || node;
    var txt = "";
    var container = null;
    if (content.nodeType) {
      if (content.nodeType === 1) {
        txt = content.firstChild.textContent;
        container = content;
      } else if (content.nodeType === 3) {
        txt = content.textContent;
        container = content.parentNode;
      } else {
        throw("something wrong with txt process");
      }
      aniQueue(()=>{
        container.style.backgroundColor = "red";
        container.style.color = "white";
      }, 0);
      aniQueue(()=>{
        container.removeAttribute("style");
      }, config.timer);
      console.log(" "[0].match.call(txt, /\w+/)[0]);
    }
  })(this);
};

TreeWalker.prototype.branchWalker = function(para, direction){
  (function fn(that, node, d){
    var childs = findChildNodes(node);
    var left = childs.shift();
    var right = childs.pop();

    _searchLeft = (that, left) => {
      if (left) {
        fn(that, left, d);
      }
    };

    _searchRight = (that, right) => {
      if (right) {
        fn(that, right, d);
      }
    };

    _showSelf = (node) => {
      that.show.call(node);
    };

    switch(d) {
      case -1:// preOrder
        _showSelf(node);
        _searchLeft(that, left);
        _searchRight(that, right);
        break;
      case 0:
        _searchLeft(that, left);
        _showSelf(node);
        _searchRight(that, right);
        break;
      case 1:
        _searchLeft(that, left);
        _searchRight(that, right);
        _showSelf(node);
        break;
      default:
        break;
    }
  })(this, para, direction);
};

TreeWalker.prototype.BFS = function(para) {
  (function fn(that, node) {
    var stack = [];
    var current = para;

    if (current && current.nodeType === 1) {
      stack.push(current);
    }

    var tmpNode = stack.shift();
    while (tmpNode) {
      that.show.call(tmpNode);
      if (tmpNode.childNodes) {
        stack = stack.concat(findChildNodes(tmpNode));
      }

      tmpNode = stack.shift();
    }
  })(this, para);
};

TreeWalker.prototype.DFS = function(para){
  (function (that, para) {
    //  用 new 关键字实现的
    //  walker 的 prototype 指向构造函数的 prototype 属性
    //  TreeWalker.prototype 
    that.show.call(para.firstChild);
    var current = findChildNodes(para);
    var stack = [];
    if(current && current.length) {
      stack = stack.concat(current);
    }

    var tmpNode = stack.shift();
    while(tmpNode) {
      that.show.call(tmpNode);
      if(tmpNode.childNodes) {
        stack = findChildNodes(tmpNode).concat(stack);
      }
      tmpNode = stack.shift();
    }
  })(this, para);
};

var $ = function(selector){
  return document.querySelector(selector);
};

// 初始化函数
(function () {
  var nodes = $("body > div");
  var search = $("#ensure");
  var inOrder = $("#inOrder");
  var preOrder = $("#preOrder");
  var postOrder = $("#postOrder");
  var BFS = $("#BFS");
  var DFS = $("#DFS");

  var walker = new TreeWalker();

  search.addEventListener("click", function(){
    walker.search.call(walker, nodes);
  });

  inOrder.addEventListener("click", function(){
    walker.branchWalker.call(walker, nodes, 0);
  });

  preOrder.addEventListener("click", function(){
    walker.branchWalker.call(walker, nodes, -1);
  });

  postOrder.addEventListener("click", function(){
    walker.branchWalker.call(walker, nodes, 1);
  });

  BFS.addEventListener("click", function(){
    walker.BFS.call(walker, nodes);
  });

  DFS.addEventListener("click", function(){
    walker.DFS.call(walker, nodes);
  });
})();