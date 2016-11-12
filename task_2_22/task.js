var config = {
  timer: 500
};

function delay(fn, t) {
  var schQueue = [];
  var currentTask = null;

  function exeTask(options) {
    currentTask = setTimeout(function(){
      options.fn();
      clearTimeout(currentTask);
      currentTask = null;
      if (schQueue.length) {
        exeTask(schQueue.shift());
      }
    }, options.t);
  }

  self = {
    delay : function(fn, t) {
      if (currentTask || schQueue.length) {
        schQueue.push({fn: fn, t: t});
      } else {
        exeTask({fn: fn, t: t});
      }
      return self;
    }
  }

  return self.delay(fn, t)
}

var aniQueue = delay(function(){}, 0).delay;

function Node(data) {
  this.data = data;
  this.left = null;
  this.right = null;
}

Node.prototype.show = function() {

  var e = document.getElementById("e" + this.data);
  (function(e){
    aniQueue(function(){
      e.setAttribute("class", "fire");
    }, 0);
    aniQueue(function(){
      e.removeAttribute("class");
    }, config.timer);
  })(e);
  return this.data;
}

function BST() {
  this.root = null;
}

BST.prototype.insert = function(data) {
  var n = new Node(data);
  var current = this.root;
  var parent = null;
  if (current === null) {
    this.root = n;
  } else {
    while(true) {
      parent = current;
      if (data <= parent.data) {
        current = current.left;
        if (current === null) {
          parent.left = n;
          break;
        }
      } else {
        current = current.right;
        if (current === null) {
          parent.right = n;
          break;
        }
      }
    }
  }
}

BST.prototype.inOrder = function(){
  (function fn(node){
    if (node !== null) {
      fn(node.left);
      node.show();
      fn(node.right);
    }
  })(this.root);
};

BST.prototype.preOrder = function(){
  (function fn(node){
    if (node !== null) {
      node.show();
      fn(node.left);
      fn(node.right);
    }
  })(this.root);
}

BST.prototype.postOrder = function() {
  (function fn(node){
    if (node !== null) {
      fn(node.left);
      fn(node.right);
      node.show();
    }
  })(this.root);
}

var tree = new BST();

(function fn(node){
  tree.insert(~~(node.getAttribute("id").slice(1)));
  if (node.hasChildNodes()) {
    var current = node.firstChild;
    while(current) {
      if (current.nodeType === 1) {
        fn(current);
      }
      current = current.nextSibling;
    }
  }
})(document.getElementById("e0"));

var $ = function(selector){
  return document.querySelector(selector);
};
var btn0 = $("#inOrder");
var btn1 = $("#preOrder");
var btn2 = $("#postOrder");
btn0.addEventListener("click", function(){
  tree.inOrder();
});
btn1.addEventListener("click", function(){
  tree.preOrder();
});
btn2.addEventListener("click", function(){
  tree.postOrder();
});