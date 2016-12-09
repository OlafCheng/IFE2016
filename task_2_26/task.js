let config = {
  timer: 1000// 延迟 ms
};
let players = [];

// eventClear 是事件的中介者(用发布－订阅模式实现)
// 负责清洗 DOM 事件, 把 DOM 事件的命令发送给 commander,
// 然后 commander 负责对命令格式进行整理, 通过 mediator 管理 players
// mediator 类似命令模式, 而不是中介者模式
let eventClear = (() => {
  let listener = [];// 当事件发生时, 反过来通知订阅者重新渲染 DOM 节点
  return {
    listen: (fn) => {
      listener.push(fn);
    },
    execute: (ele) => {
      // 接收的参数为 DOM 节点的 button
      let command = ele.dataset.command;
      let id = +ele.dataset.ssid;

      switch(command) {
        case "add":
          commander.deploy({id: 0, command: command});
          break;
        case "remove":
        case "fly":
        case "stop":
          commander.deploy({id: id, command: command});
      }
      listener.map(fn => fn());
    }
  };
})();
let cmp = document.getElementById("commandPanel");
cmp.addEventListener("click", (e) => {
  eventClear.execute(e.target);
});
let btn = document.getElementById("button");
button.addEventListener("click", (e) => {
  eventClear.execute(e.target);
});

// 负责与 eventClear & mediator 进行通信, 接收来自 eventClear 的调用, 对 mediator 发出信号
var commander = (() => {  
  let leftToken = [0, 1, 2, 3];
  let listener = [];
  let usedToken = () => {
    let arr = Array(4).fill(" ").map((v, i) => {return i;});
    let result = [];
    arr.map((v) => {
      if (!leftToken.includes(v)) {
        result.push(v);
      }
    });
    return result;
  };

  let addNewSpaceShip = () => {
    let token = leftToken.shift();
    if(typeof token === "number") {
      mediator({id: token, command: "addPlayer"});
    } else {
      return false;
    }
  };

  let sendCommand = ({id, command}) => {
    if(command === "remove") {
      leftToken.push(+id);
      console.log("left token = " + leftToken.join());
      mediator({id: id, command: "removePlayer"});
    } else {
      mediator({id: id, command: command});
    }
  };

  return {
    deploy: ({id = 0, command} = {}) => {
      switch(command) {
        case "add":
          addNewSpaceShip();
          break;
        case "remove":
        case "fly":
        case "stop":
          sendCommand({id: id, command: command});
          listener.map(fn => fn());
      }
    },
    listen: fn => listener.push(fn),
    token: usedToken
  };
})();

let domRender = (() => {
  // 组件, 利用闭包隐藏这个类
  // 目的, new SpaceshipCMP() 一次, 产生一个完整的带有绑定信息的 DOM
  // 可以直接插入 cmp
  class SpaceshipCMP {
    constructor(id) {
      this.id = id;
      this.spanProperties = "对 " + id + " 号飞船下达命令：";
      this.buttonProperties = [{
          ssid: id,
          command: "fly",
          value: "飞行"
        }, {
          ssid: id,
          command: "stop",
          value: "停止"
        }, {
          ssid: id,
          command: "remove",
          value: "销毁"
        }
      ];

      let div = this.createDiv();
      let domList = [];
      domList.push(this.createSpan());
      let cache = this.buttonProperties.map(arg => this.createButton(arg));
      cache.map(ele => domList.push(ele));
      domList.map(node => div.appendChild(node));
      return div;
    }

    createSpan() {
      let span = document.createElement("span");
      let str = document.createTextNode(this.spanProperties);
      span.appendChild(str);
      return span;
    }

    createButton({ssid, command, value}) {
      let button = document.createElement("button");
      button.setAttribute("data-command", command);
      button.setAttribute("data-ssid", ssid);
      button.textContent = value;
      return button;
    }

    createDiv() {
      let div = document.createElement("div");
      div.setAttribute("data-ssid", this.id);
      return div;
    }

  }

  // DOM 节点缓存
  let cmp = document.getElementById("commandPanel");

  return () => {

    while(cmp.firstChild) {
      cmp.removeChild(cmp.firstChild);
    }
    commander.token().map(id => cmp.insertBefore(new SpaceshipCMP(id), cmp.lastChild));
  };

})();
eventClear.listen(domRender);
commander.listen(domRender);

// mediator 负责管理飞船的实例, 包括对产生、销毁飞船，以及对飞船发出指令(存在延迟和丢包)
// 和要求的不一样, 这里把 mediator 改为了原本的用途 —— 中介者, 而介质的部分, 由 space 实现
var mediator = (() => {

  // space 用于模拟真空, 提供参数传递时的丢包、延迟效果
  let space = (...args) => {
    setTimeout(() => {
      console.log("singal received!");
      if(Math.random() > 0.3) {
        switch(args.length) {
          case 1:
            args.shift()();
            break;
          case 2:
            let obj = args.shift();
            let fn = args.shift();
            fn.call(obj);
        }
      }
    }, 1000);
  };

  let addPlayer = (id) => {
    players.push(new Player(id));
    console.log("spaceship " + id + " added.");
    console.log("Left spaceship(token): " + players.map(obj => obj.id).join(", "));
  };

  let removePlayer = (id) => {
    players.filter((player) => {
      if (player.id === +id) {
        let token = player._token;
        space(() => {// 因为操作的时候实际上是对每个飞船分别发送信号, 所以丢包是独立的
          if (player._token === token) {
            player.die();
            players = players.filter(obj => obj._token !== token);
          }
        });
      }
    });
    console.log("removed " + id);
  };

  let fly = (id) => {
    let tmp = players.filter(obj => obj.id === +id);
    tmp.map(obj => space(obj, obj.fly));
  };

  let stop = (id) => {
    let tmp = players.filter(obj => obj.id === +id);
    tmp.map(obj => space(obj, obj.stop));
  };

  let receiver = ({id, command}) => {
    switch (command) {
      case "addPlayer":
        addPlayer(id);// 发射不会失败, 所以不经过 space
        break;
      case "removePlayer":
        removePlayer(id);
        break;
      case "fly":
        fly(id);
        break;
      case "stop":
        stop(id);
    }
  };

  return receiver;
})();

// player 是飞船的构造函数
class Player {
  constructor (...args) {
    this.id = args.shift();
    this._duration = 100;
    this._state = "stop";
    this._radius = 0;
    this._token = new Date().getTime() + "";
    console.log(this._token);
    this._updateState();
  }
  
  _refreshPosition () {// 用于更新位置信息
    let that = this;
    if (this._state === "fly") {
      let timer = setTimeout(function() {
        clearTimeout(timer);
        that._radius += 0.010471975511965978;
        that._refreshPosition();
      }, 1000/60);// setTimeout 被调用的间隙的最小值
    }
  }

  _updateState () {
    let that = this;
    let timer = setTimeout(() => {
      clearTimeout(timer);
      let _subtraction = that._duration - 5;// 用来判断有没有超过最小值 0
      let _addition = that._duration + 2;// 用来判断有没有超过最大值 100
      switch(that._state) {
        case "stop":
          that._duration = _addition > 100 ? 100 : _addition;
          break;
        case "fly":
          that._duration = _subtraction < 0 ? 0 : _subtraction;
          if (that._duration === 0) {
            that._state = "stop";
          }
      }
      // console.log("spaceship id = " + that.id + " with duration " + that._duration);
      try {
        that._updateState();
      } catch (e) {
        console.log(e);
        console.log("Space ship[" + that.id + "] removed.");
      }
    }, config.timer);
  }

  fly() {
    let that = this;
    if (that._state !== "fly") {
      that._state = "fly";
      that._refreshPosition();
      // console.log("spaceship " + that.id + " fly.");
    }
  }

  stop() {
    if (this._state !== "stop") {
      this._state = "stop";
      console.log("spaceship " + this.id + " stop.");
    }
  }

  die() {
    if (typeof this._duration === "function") {
      this._updateState = null;
      console.log("spaceship " + this.id + " died!");
    }
  }
}

const PI = Math.PI;

let newSS = (obj) => {
  let duration = obj._duration;
  let percentage = duration / 100;
  let id = obj.id;
  let offCanvas = document.createElement("canvas");
  let offContext = offCanvas.getContext("2d");
  offCanvas.width = 100;
  offCanvas.height = 40;
  let gradient = offContext.createLinearGradient(0, 0, offCanvas.width, 0);
  offContext.fillStyle = gradient;
  gradient.addColorStop(0, "blue");
  gradient.addColorStop(percentage, "blue");
  gradient.addColorStop(percentage, "gray");
  gradient.addColorStop(1, "gray");
  offContext.beginPath();
  offContext.moveTo(20, 0);
  offContext.lineTo(80, 0);
  offContext.arc(80, 20, 20 , PI * 3 / 2, PI / 2, false);
  offContext.moveTo(80, 40);
  offContext.lineTo(20, 40);
  offContext.arc(20, 20, 20, PI / 2, PI * 3 / 2, false);
  offContext.fill();
  let txt = id + "号: " + duration + "%";
  offContext.fillStyle = "white";
  offContext.moveTo(50, 20);
  offContext.font = "16px STHeiti";
  offContext.textAlign = "center";
  offContext.textBaseline = "middle";
  offContext.fillText(txt, 50, 20);
  return offCanvas;
};

let spaceship = () => {
  let canvas = document.getElementById("cosmos");
  let context = canvas.getContext("2d");
  let spaceships = [];
  context.clearRect(0, 0, 500, 500);
  context.fillStyle = "black";
  context.fillRect(0, 0, 500, 500);
  context.beginPath();
  context.arc(250, 250, 50, 0, 2 * PI);
  context.fillStyle = "white";
  context.fill();

  players.map((obj) => {
    let id = obj.id;
    let duration = obj._duration;
    let orbit = (id + 2) * 50;
    let position = obj._radius;

    context.save();
    context.translate(250, 250);
    context.rotate(position);
    context.drawImage(newSS(obj), 0, 0, 100, 40, -50, -orbit, 100, 40);
    context.restore();
  });

  requestAnimationFrame(spaceship);
};

let init = (() => {
  window.requestAnimationFrame(spaceship);
})();