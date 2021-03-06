事件通过设计模式和 `commander` 绑定(松耦合)
因为 `commander` 用来直接与 dom 进行绑定会导致核心部分——这个游戏的逻辑，变得难以维护，所以把这部分进行解耦合，分为 `commander` 与 eventClear

## eventClear
eventClear 对事件进行处理, 每一个 button 事件的点击, 都把自身传给 eventClear
	eventClear 根据传进来的 button 的 data-ssid-num 以及这个 button 的 value 进行命令的整合, 整合好后发送给 `commander`
	eventClear() 只接收一个参数, 即这个按钮本身
	如果命令类似 {id: num, command: str} 就直接发送给 `commander`(不能直接发给 `mediator` ，因为 `commander` 还要负责记录令牌情况)
	如果命令是让新的飞船起飞, 就 command.addNewSpaceship();


## commander
`commander` 接受这个命令 `{id: num, command: str}`;
如果再用模块模式调用 commander
	有 `_leftToken` 属性，用来存储飞船的编号以及是否可用的状态
	`[{id: 1, space: 1}, {id: 2, space: 0}]`
	每次按照顺序从中取牌发放给新的飞船
	`commander` 本身接收到的数据也是 
	`commander` 只负责给 `mediator` 发信
	`commander` 根据接受到的命令进行令牌的更新，然后对 `mediator` 发出新的信号

## mediator
`mediator` 读取全局变量 `players`(用于保存飞船的实例) , GUI 命令块通过这个变量进行宇宙的渲染
	`behaviors = {}`,
	`addPlayer()` 时根据接受到的命令，初始化新的飞船(`id` 已经加进去), 再将 `this` 加到 `players` 中
	`players` 数组中有可能超过 4 个元素，并且其中 `id` 可能有重复的
	`removePlayer()` 根据接受的命令来对玩家进行移除, 命令格式 `id`。要注意的是, 命令的发送的成功与失败是对每一艘飞船而言的, 所以对 `id` 相同的飞船来说, 对指挥官发出的命令的回应情况可能会不同。
`commandReceiver({id: num, command: "addPlayer"})`;

## Player
飞船用构造函数、原型模式的组合来实现，属性私有, 方法从原型链上继承
	属性包括：`id`、`_duration`、`_radius`、`_token`
	其中, `id` 表示一个飞船从指挥官那里得到的令牌, 飞船也是通过这个令牌来判断信号发射塔发送过来的信号是不是自己的, `_duration` 表示一个飞船的耐久, `_radius` 表示这个飞船在轨道上的位置, `_token` 表示这个飞船的唯一编号, 用于区分 `id` 相同的飞船(即令牌回收了, 但是飞船没有接收到销毁命令的情况下, 会导致 `id` 重复)
	方法包括： `fly`、`stop`
		`fly` 时, `_duration` 每秒自减 5%, 最低为 0, 成为 0 时 `stop`, 直到再次接受到命令
		`stop`, `_duration` 每秒自加 2%, 最高为 100%, 成为 100% 消除自加定时器
		`_updateState` 方法, 根据 `this._state` 的值不断刷新 `this._duration`

## _refreshPosition 函数的编写
通过检查 `this.state` 来决定自己是否需要被调用, 只不过最开始的调用由 `fly()` 函数完成, 一旦 `this.state` 的值变为 `stop`, 就清除对自己的调用(也清除定时器)。等到下一次 `fly()` 被调用时, `_refreshPosition` 函数将再次被调用。
默认 10s 转一圈, 所以每一次位置刷新, 弧度增加 `1/600 * 2 * Math.PI`(0.010471975511965978)

## spaceship 函数的实现
首先, 通过扫描 `players` 中的飞船的数据来实时生成最新的飞船外观(`facade`), 然后再依次对已有的飞船进行分别的绘制, 最后绘制星球, 然后等待下一次渲染。
其中, 外观信息包括飞船编号、根据飞船耐久度显示出来的文字、根据飞船耐久度显示的遮罩、飞船的外壳, 这里可以通过使用图片来当飞船的外壳的方式来提升性能, 但是因为是练习项目, 要练习 canvas 的 API 的使用, 就直接实时绘出来了。