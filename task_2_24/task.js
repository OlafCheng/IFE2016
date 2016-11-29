var $ = (selector) => {return document.querySelector(selector);};

var config = {
  timer: 500,// 动画执行的间隔
  searching: false,// "search"的开关
  showing: true,// BFS 中动画的开关
  deleting: false,// EventProcess.deleteDiv 的开关, 下同
  updating: false
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

TreeWalker.prototype.show = function(str){
  (function(node, str){
    // animtation
    var content = node.firstChild || node[0] || node;
    var txt = "";
    var container = null;
    if (content.nodeType) {
      if (content.nodeType === 1) {
        txt = content.firstChild.textContent.trim();
        container = content;
      } else if (content.nodeType === 3) {
        txt = content.textContent.trim();
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
      if (config.searching && txt === str) {
        aniQueue(() => {
          container.style.backgroundColor = "yellow";
        }, 0);
      }
      console.log();
    }
  })(this, str);
};

TreeWalker.prototype.search = function (nodes, str) {
  (function(that, nodes, str){
    if(!str) {
      confirm("请输入要查询的内容！");
      return ;
    }
    config.searching = true;
    that.BFS.call(that, nodes, str);
  })(this, nodes, str);
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

TreeWalker.prototype.BFS = function(para, str) {
  (function (that) {
    var s;
    if(str !== undefined) {
       s = str.trim();
    }
    var stack = [];
    var current = para;

    if (current && current.nodeType === 1) {
      stack.push(current);
    }

    var tmpNode = stack.shift();
    while (tmpNode) {
      if(config.deleting) {
        if(tmpNode.dataset.checked === "yes") {
          while(tmpNode.firstChild) {
            tmpNode.removeChild(tmpNode.firstChild);
          }
          tmpNode.parentNode.removeChild(tmpNode);
          return ;
        }
      }
      if(config.updating) {
        if(tmpNode.dataset.checked === "yes") {
          (() => {
            var txt = document.createTextNode(str);
            var div = document.createElement("div");
            div.appendChild(txt);
            tmpNode.appendChild(div);
          })();
          return ;
        }
      }
      if(config.showing) {
        that.show.call(tmpNode, s);
      }
      if(!config.showing) {
        // 暂时没其他功能, 所以如果 config.showing = false, 就是简单遍历
        if(tmpNode.dataset.checked) {
          tmpNode.dataset.checked = "";
        }
      }
      if (tmpNode.childNodes) {
        stack = stack.concat(findChildNodes(tmpNode));
      }
      tmpNode = stack.shift();
    }
  })(this);
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

var walker = new TreeWalker();

var root = $("body > div");
EventProcess = {
  selectDiv: (target) => {
    config.showing = false;
    walker.BFS.call(walker, root);// 简单遍历, 清除 data-checked 属性
    config.showing = !config.showing;

    target.dataset.checked = "yes";
  },
  deleteDiv: () => {
    config.showing = false;
    config.deleting = true;
    walker.BFS.call(walker, root);
    config.deleting = !config.deleting;
    config.showing = !config.showing;
  },
  updateDiv: (str) => {
    config.showing = false;
    config.updating = true;
    walker.BFS.call(walker, root, str);
    config.showing = !config.showing;
    config.updating = !config.updating;
  }
};

// 初始化函数
(function () {
  var nodes = $("body > div");
  var input = $("input");
  var value = null;

  document.body.addEventListener("click", (e) => {
    config.searching = false;// 关闭查找功能
    var target = e.target;
    var ID = target.id;
    var tagName = target.tagName;
    value = input.value;
    switch(ID) {
      case "ensure":
        walker.search.call(walker, nodes, value);
        break;
      case "inOrder":
        walker.branchWalker.call(walker, nodes, 0);
        break;
      case "preOrder":
        walker.branchWalker.call(walker, nodes, -1);
        break;
      case "postOrder":
        walker.branchWalker.call(walker, nodes, 1);
        break;
      case "BFS":
        walker.BFS.call(walker, nodes);
        break;
      case "DFS":
        walker.DFS.call(walker, nodes);
        break;
      case "delete":
        EventProcess.deleteDiv(target);
        break;
      case "update":
        EventProcess.updateDiv(value);
      default:
        console.log(ID);
    }
    switch(tagName) {
      case "DIV":
        EventProcess.selectDiv(target);
        break;
      default:
    }
  });
})();