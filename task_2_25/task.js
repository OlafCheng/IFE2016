var $ = (selector) => {return document.querySelector(selector);};

// 注意 children 属性在不用的时候,要 delete, 保持对象属性会影响值的判断
// delete treeData;
// delete treeData[animals].children;
treeData = {
  "animals": {
    "children": {
      "monkey": {
      },
      "dog": {
      },
      "pig": {
      }
    }
  },
  "mobile phones": {
    "children": {
      "apple": {
        "children": {
          "iphone7": {
          },
          "iphone6s": {
          }
        }
      },
      "Samsung": {
        "children": {
          "note7": {
          },
          "note6": {
          }
        }
      }
    }
  }
};

// 用于渲染树
treeRender = (data) => {
  var leafs = document.createDocumentFragment();
  var topUl = document.createElement("ul");
  var tree = $("#tree");
  // 向 parent 中传入一个父节点, 将渲染的结果 appendChild 入更高一级节点
  /*
    期望输入 data 中的对象
    输出遍历输入后, 给出的 documentFragment
  */
  renderBranch = (parent, str) => {
    var key = null;
    var frag = null;
    var ul = null;
    var ul1 = null;
    var li = document.createElement("li");
    var txt = document.createTextNode(str);
    var span = null;
    if (parent.children) {
      // frag = document.createDocumentFragment();
      ul = document.createElement("ul");
      ul1 = document.createElement("ul");
      span = document.createElement("span");
      span.setAttribute("class", "branch-node");
      span.appendChild(document.createTextNode("+"));
      li.appendChild(span);
      span = document.createElement("span");
      span.setAttribute("class", "node");
      span.appendChild(txt);
      li.appendChild(span);
      for(key in parent.children) {
        (() => {
          var tmpLi = document.createElement("li");
          tmpLi.appendChild(renderBranch(parent.children[key], key));
          ul1.appendChild(tmpLi);
        })();
      }
      li.appendChild(ul1);
      ul.appendChild(li);
      return ul;
    } else {
      span = document.createElement("span");
      span.setAttribute("class", "node");
      span.appendChild(txt);
      return span;
    }
  };

  // 通过循环 嵌套调用 renderBranch
  var name = null;
  for(name in data) {
    topUl.appendChild(renderBranch(data[name], name));
  }
  tree.appendChild(topUl);
};

treeRender(treeData);

// 用于渲染右侧的列表
tableRender = (node) => {

};

var heightStorage = {};
toggleShrink = (target) => {
  var name = target.nextSibling.textContent;
  var ul = target.nextSibling.nextSibling;
  var height = null;
  var ulHeight = ul.style.height;
  if(heightStorage[name] === undefined) {
    heightStorage[name] = window.getComputedStyle(ul, null).getPropertyValue("height");
  }

  if(ulHeight === "0px") {
    ul.style.height = heightStorage[name];
  } else {
    ul.style.height = "0px";
  }
};

deleteNode = (target) => {
  var txt = target.textContent;
  delNode = (node) => {
    if(node === txt) {
      
    }
    var tmpNode;
    if(node.children) {

    }
  };
  
  var node;
  for (node in treeData) {
    delNode(node);
  }
};

// 事件代理
document.body.addEventListener("click", (e) => {
  var target = e.target;
  var className = target.className;
  switch(className) {
    case "branch-node":
      toggleShrink(target);
      break;
    case "update":
      break;
    case "delete":
      deleteNode(target);
      break;
    default:
      break;
  }
});
var nodes = document.getElementsByClassName("node");
[].map.call(nodes, (e) => {
  e.addEventListener("mouseenter", (e) => {
    var target = e.target;
    var className = target.className;
    var txt = document.createTextNode(" - Del");
    var span = document.createElement("span");
    span.setAttribute("class", "delete");
    span.appendChild(txt);
    if(className === "node") {
      target.appendChild(span);
    }
  });
});
[].map.call(nodes, (e) => {
  e.addEventListener("mouseleave", (e) => {
    var target = e.target;
    var className = target.className;
    if (className === "node") {
      target.removeChild(target.lastChild);
    }
  });
});

// 初始化
(() => {
  getHeight = (node) => {
    var ul = node.nextSibling.nextSibling;
    var height = window.getComputedStyle(ul, null).getPropertyValue("height");
    ul.style.height = height;
  };

  var ul = document.getElementsByClassName("branch-node");
  var i;
  for(i = 0; i < ul.length; i++) {
    getHeight(ul[i]);
  }
})();