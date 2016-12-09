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

// utli 提供 DOM 组件
let util = {
  get: (str) => {
    let args = str.split(":");
    return [].map.call(args, _createElement);
  },
  _createElement: () => {
    let args = arguments.split("-");
    let txt;
    if (args.length > 1) {
      txt = document.createTextNode(args.splice(-1, 1));
    }
    let ele = document.createElement(args[0]);
    return txt ? ele.appendChild(txt) : ele;
  },
  _getpop: () => {

  }
};


// singleProxy 提供单个 DOM 组件的代理及惰性加载 

// render 负责渲染、初始化树的 DOM 信息

// events 负责存储所有事件, 以便 binder 调用

// binder 负责给所有节点绑定、广播事件

// updateData 负责删除数据节点、增加数据节点，并重新调用 render