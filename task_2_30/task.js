// 1. 事件监听
let bindStrategies = (root, stras) => {
  // 先不考虑那么多情况, 只假设有复数个 input 和单个 button
  let inputs = root.querySelectorAll("input");
  let button = root.querySelector("button");

  let getType = (dom) => {
    return dom.id.split("task-30-");
  };

  inputs.map((input) => {
    // 遍历绑定跟 focus 有关的事件
    input.addEventListener("focus", (e) => {
      let value = e.target.value;
      let type = e.target.dataset || e.target.dataset.type;
      if(type) {
        
      }
    });

    // 遍历绑定跟 blur 有关的事件
    input.addEventListener("blur", (e) => {

    });
  });

  button.addEventListener("click", (e) => {

  });
};

// 2. 策略组
let strategies = {
  name: {
    hint: "规则提示",
    focus: "提示信息",
    right: "正确",
    wrong: "错误",
    rules: (string) => {

    }
  },
  password: {

  },
  email: {

  },
  mobilephone: {

  }
};

// 使用方法:
//  bindStrategies(rootEle, strategies)
//  bindStrategies 根据标签中的 dataset 的信息, 来判断当前标签所需要使用的策略
//  button 不考虑那么多, 直接写成符合要求的那种行为, 绑定死在 function 里
const lists = document.getElementById("lists");
bindStrategies(lists, strategies);