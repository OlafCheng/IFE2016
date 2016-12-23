let config = {
  timer: 1000,// 延迟 ms
  delay: 300
};
let players = [];

let player_config = {
  state: {
    "fly": "飞行中",
    "stop": "已停止"
  },
  cost: {
    5: "最慢(高空轨道)",
    7: "中等(中层轨道)",
    9: "最快(低空轨道)"
  },
  recover: {
    2: "原始(2%)",
    3: "增强(3%)",
    4: "极限(4%)"
  }
};

let renderScreen = () => {
  let data = DC.playerData;
  let rootDOM = document.getElementById("rootDOM");
  let frag = document.createDocumentFragment();
  while(rootDOM.firstChild) {
    rootDOM.removeChild(rootDOM.firstChild);
  }
  for(let key in data) {
    let single_player_data = data[key];
    let tr = document.createElement("tr");
    for (let item in single_player_data) {
      let td = document.createElement("td");
      let str;
      switch (item) {
        case "cost":
        case "recover":
        case "state":
          str = player_config[item][single_player_data[item]];
          break;
        case "duration":
          str = single_player_data[item] + "%";
          break;
        default:
          str = single_player_data[item] + "号";
      }
      let txt = document.createTextNode(str);
      td.appendChild(txt);
      tr.appendChild(td);
    }
    frag.appendChild(tr);
  }
  rootDOM.appendChild(frag);
};

let DC = (() => {
  let _players = {};// 用于保存飞船的 set get 劫持

  let checkEqual = ({id, state, duration, cost, recover}) => {
    if(
        _playersValue[id] &&
        _playersValue[id].state === state &&
        _playersValue[id].duration === duration &&
        _playersValue[id].cost === cost &&
        _playersValue[id].recover === recover
      ) {
        return false;
    } else {
      return true;
    }
  };

  let _playersValue = {};// 用于保存飞船的实际数据
  console.log(_playersValue);

  let _adapter = (str) => {// 适配器承担了原本不属于自己的工作

    let _playerID = str.substr(0, 4);
    let _playerState = str.substr(4, 4);
    let _playerDuration = str.substr(8, 8);
    let _playerCost = str.substr(16, 4);
    let _playerRecover = str.substr(20, 4);

    let playerID = parseInt(_playerID, 2);
    let playerState = {
      "0000": "fly",
      "0001": "stop",
      "0010": "died"
    }[_playerState];
    let playerDuration = parseInt(_playerDuration, 2);
    let playerCost = parseInt(_playerCost, 2);
    let playerRecover = parseInt(_playerRecover, 2);
    let ifRender = checkEqual({
      id: playerID,
      state: playerState,
      duration: playerDuration,
      cost: playerCost,
      recover: playerRecover
    });

    if (ifRender) {
      if (_players[playerID]) {
        // 如果这个对象已经存在于 DC 中, 则只根据状态, 进行 DC 中 _players 的更新
        if (playerState !== "died") {
          _players[playerID] = {
            id: playerID,
            state: playerState,
            duration: playerDuration,
            cost: playerCost,
            recover: playerRecover
          };
        } else {
          delete _players[playerID];
          delete _playersValue[playerID];
          renderScreen();
        }
      } else if (playerState !== "died") {
        // 这个对象不存在, 需要塞进去
        Object.defineProperty(_players, playerID, {
          configurable: true,
          enumerable: true,
          set: ({id, state, duration, cost, recover}) => {
            _playersValue[playerID].id = id;
            _playersValue[playerID].state = state;
            _playersValue[playerID].duration = duration;
            _playersValue[playerID].cost = cost;
            _playersValue[playerID].recover = recover;
            renderScreen();
          }, 
          get: () => {
            return _playersValue[playerID];
          }
        });
        _playersValue[playerID] = {
          id: playerID,
          state: playerState,
          duration: playerDuration,
          cost: playerCost,
          recover: playerRecover
        };
        renderScreen();
        console.log(_playersValue);
      }
    }

  };



  let _receiver = (msg) => {
    _adapter(msg);
  };

  return {
    receiver: _receiver,
    playerData: _playersValue
  };
})();

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
      mediator.commandCenter({args: obj, command: "addPlayer"});
    } else {
      return false;
    }
  };

  let sendCommand = ({args, command}) => {
    if(command === "remove") {
      leftToken.push(+args);
      console.log("left token = " + leftToken.join());
      mediator.commandCenter({args: args, command: "remove"});
    } else {
      mediator.commandCenter({args: args, command: command});
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
    if (_nameSpace[NS]) {
      _nameSpace[NS].push(fn);
    } else {
      _nameSpace[NS] = [fn];
    }
  };

  let _trigger = (...args) => {
    let NS = args.shift().NS;
    _nameSpace[NS].forEach(fn => fn());
  };

  // 因为 _broadcast 在每次运行的时候会产生新的作用域链, 
  // 所以删除 _nameSpace 不会影响到信号的失败重发
  let _broadcast = ({receiver, msg}) => {
    console.log("msg = " + msg);
    if (typeof msg === "function") {
      msg = msg();// 尽快的获取需要更新才能获得的最新的信息, 并且把这个值保存在一个作用域链上
    }
    setTimeout(() => {
      if (Math.random() > 0.1) {
        receiver.receiver(msg);
      } else {
        _broadcast({receiver: receiver, msg: msg});
      }
    }, config.delay);
  };

  let _remove = ({NS}) => {
    delete _nameSpace[NS];
  };

  return {
    listen: _listen,
    trigger: _trigger,
    remove: _remove,
    broadcast: _broadcast,
  };
})();

// mediator 负责管理飞船的实例, 包括对产生、销毁飞船，以及对飞船发出指令(存在延迟和丢包)
// 和要求的不一样, 这里把 mediator 改为了原本的用途 —— 中介者, 而介质的部分, 由 space 实现
let mediator = (() => {

  let _addPlayer = (args) => {
    // 发射是在星球上有人工监督的, 所以不经过 BUS
    players.push(new Player(args));
  };

  let _removePlayer = (token) => {
    players = players.filter(obj => obj._token !== token);
  };

  // 用于存储每一次指挥官下达的命令的二进制格式的字符串
  let _command = "";

  let _commandCenter = ({args, command}) => {
    if (command === "addPlayer") {
      _addPlayer(args);
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
      _command = binaryId + binaryCommand;
      // mediator 的状态得到更新, 通知它的监听者 —— player
      BUS.trigger({NS: "mediator"});
    }
  };

  _receiver = (msg) => {
    // 对飞船发回的消息进行一次过滤
    // 如果飞船需要被删除掉, 就调用 _removePlayer
    let command = msg.substr(4, 4);
    if (command === "0010") {
      console.log("remove!!!");
      let id = parseInt(msg.substr(0, 4), 2);
      // command === "0010" -> 接受到的是飞船死亡的命令
      players.forEach((obj) => {
        if (obj.id === id) {
          _removePlayer(obj._token);
        }
      });
    }
    DC.receiver(msg);
  };

  // 添加要监听到事件的时候要执行的函数
  BUS.listen({NS: "mediator", fn: () =>  {
    players.forEach(player => BUS.broadcast({receiver: player, msg: mediator.command}));
  }});

  return {
    commandCenter: _commandCenter,
    command: () => {
      return _command;
    },
    receiver: _receiver
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
      that.feedback();
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
      console.log("spaceship " + that.id + " fly.");
    }
  }

  stop() {
    if (this._state !== "stop") {
      this._state = "stop";
      console.log("spaceship " + this.id + " stop.");
    }
  }

  die() {
    this._state = "died";
    this.feedback();
    this._updateState = null;
    console.log("spaceship " + this.id + " died!");
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

  feedback() {
    let getBinary = (num, l) => {
      return Array(l - (num).toString(2).length).fill(0).join("") + (num).toString(2);
    };
    let binaryId = getBinary(this.id, 4);
    let binaryCommand = {
      fly: "0000",
      stop: "0001",
      died: "0010"
    }[this._state];
    console.log("feed back");
    let binaryRecover = getBinary(this._recover, 4);
    let binaryCost = getBinary(this._cost, 4);
    let binaryDuration = getBinary(this._duration, 8);
    let newCommand = binaryId + binaryCommand + binaryDuration + binaryCost + binaryRecover;
    BUS.listen({NS: "player-send", fn: () => {
    // 通过 broadcast 将信息广播给 DC
      BUS.broadcast({receiver: mediator, msg: newCommand});
      console.log("send command = " + newCommand);
    }});
    BUS.trigger({NS: "player-send"});
    BUS.remove({NS: "player-send"});
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