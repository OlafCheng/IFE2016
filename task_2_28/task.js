let config = {
  timer: 1000,// 延迟 ms
  delay: 300
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
      let power = document.querySelector("input[name='ss-power']:checked").value;
      let orbit = document.querySelector("input[name='ss-engine']:checked").value;

      switch(command) {
        case "add":
          commander.deploy({args: {id: id, power: +power, orbit: +orbit}, command: command});
          console.log("orbit = " + orbit);
          console.log("power = " + power);
          break;
        case "remove":
        case "fly":
        case "stop":
          commander.deploy({args: id, command: command});
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

  let addNewSpaceShip = (...args) => {
    let token = leftToken.shift();
    if(typeof token === "number") {
      let obj = args.shift();
      obj.id = token;
      mediator.receiver({args: obj, command: "addPlayer"});
    } else {
      return false;
    }
  };

  let sendCommand = ({args, command}) => {
    if(command === "remove") {
      leftToken.push(+args);
      console.log("left token = " + leftToken.join());
      mediator.receiver({args: args, command: "remove"});
    } else {
      mediator.receiver({args: args, command: command});
    }
  };

  return {
    deploy: ({args = 0, command} = {}) => {
      switch(command) {
        case "add":
          addNewSpaceShip(args);
          break;
        case "remove":
        case "fly":
        case "stop":
          sendCommand({args: args, command: command});
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

let BUS = (() => {
  let _nameSpace = {};
  let _createNS = (name) => {
    if (!(nameSpace[name] || nameSpace[name].length)) {
      nameSpace[name] = [];
    }
    return nameSpace[name];
  };

  let _listen = ({NS, fn}) => {
    _nameSpace[NS].push(fn);
  };

  let _trigger = ({NS}) => {
    _nameSpace[NS].forEach(fn => fn());
  };

  let _broadcast = ({receiver, msg}) => {
    setTimeout(() => {
      if (Math.random() > 0.1) {
        receiver.receiver(msg);
      } else {
        _broadcast(args);
      }
    }, config.delay);
  };

  return {
    listen: _listen,
    trigger: _trigger,
    broadcast: _broadcast,
  };
})();

// mediator 负责管理飞船的实例, 包括对产生、销毁飞船，以及对飞船发出指令(存在延迟和丢包)
// 和要求的不一样, 这里把 mediator 改为了原本的用途 —— 中介者, 而介质的部分, 由 space 实现
let mediator = (() => {

  let addPlayer = (args) => {
    // 发射是在星球上有人工监督的, 所以不经过 BUS
    players.push(new Player(args));
  };

  let removePlayer = (token) => {
    players = players.filter(obj => obj._token !== token);
  };

  let _command = "";

  let receiver = ({args, command}) => {
    if (command === "addPlayer") {
      addPlayer(args);
    } else {
      let binaryCommand = {
        fly: "0000",
        stop: "0001",
        remove: "0010"
      }[command];
      let binaryId = {
        0: "0000",
        1: "0001",
        2: "0010",
        3: "0011"
      }[+args];
      let _command = binaryId + binaryCommand;
      // 触发函数
      BUS.trigger({NS: "mediator"});
    }
  };

  // 添加要监听到事件的时候要执行的函数
  BUS.listen({NS: "mediator", fn: () =>  {
    players.forEach(player => BUS.broadcast({receiver: player, msg: mediator.command}));
  }});


  return {
    receiver: receiver,
    command: _command
  };
})();

// player 是飞船的构造函数
class Player {
  constructor ({id, orbit, power}) {
    this.id = id;
    this._duration = 100;
    this._state = "stop";
    this._radius = 0;
    this._token = new Date().getTime() + "";
    this._cost = this.getCost(orbit);
    this._recover = this.getRecover(power);
    this._orbit = orbit;
    this._updateState();
  }
  
  _refreshPosition () {// 用于更新位置信息
    let that = this;
    if (this._state === "fly") {
      let timer = setTimeout(function() {
        clearTimeout(timer);
        that._radius += 0.010471975511965978 * (that._orbit + 1);
        that._refreshPosition();
      }, 1000/60);// setTimeout 被调用的间隙的最小值
    }
  }

  _updateState () {
    let that = this;
    let timer = setTimeout(() => {
      clearTimeout(timer);
      let _subtraction = that._duration - that._cost;// 用来判断有没有超过最小值 0
      let _addition = that._duration + that._recover;// 用来判断有没有超过最大值 100
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

  getCost(typeName) {
    let type = {
      0: 5,
      1: 7,
      2: 9
    };
    return type[typeName];
  }

  getRecover(typeName) {
    let type = {
      0: 2,
      1: 3,
      2: 4
    };
    return type[typeName];
  }

  adapter(commandBinary) {
    let id = parseInt(commandBinary.slice(0, 4), 2);
    let that = this;
    if (id === this.id) {
      let command = {
        0: that.fly,
        1: that.stop,
        2: that.die
      }[parseInt(commandBinary.slice(-4), 2)];
      command.call(that);
    }
  }

  receiver(command) {
    this.adapter(command);
    return true;// true === 成功的接收到 BUS 传送过来的命令
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
    let orbit = (5 - obj._orbit) * 50;
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