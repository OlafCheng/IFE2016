let target = {
  x: 6,
  y: 6,
  deg: 0,
  dir: "up",
  ele: null
};

let square = {
  width: 10,
  children: null
};

let parseCommand = () => {
  let inputValue = document.getElementById("command").value;
  let command = inputValue.toLowerCase();
  switch (command) {
    case "go":
      break;
    case "tun lef":
      target.deg -= 90;
      break;
    case "tun rig":
      target.deg += 90;
      break;
    case "tun bac":
      target.deg += 180;
  }
};

let goTo = () => {

};

let getOrder = ({x, y, n}) => {
  return x + n * y;
};

let init = (() => {
  // 完成目标对象的初始化、DOM 的添加
  // 以及 square 对象中 children 的 DOM 缓存
  target.ele = document.createElement("div");
  target.ele.setAttribute("id", "target");
  square.children = document.getElementById("square").children;
  let order = getOrder({ x: target.x, y: target.y, n: squre.width });
  square.children[order].appendChild(target.ele);

  let btn = document.getElementsByTagName("input")[0];
  btn.addEventListener("click", parseCommand);
})();