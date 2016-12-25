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

## 任务 27 中需要改变的地方
1. 改变 `Class Player {}` 的构造函数的传参数结构, 改 `...args` 为解构赋值; ✅
2. 改变指挥官在发出增加飞船时传递的参数, 由原本只传递一个 `token` 改为传递 id + orbit + power ✅
3. 改变飞船类内部更新状态的参数, 改为由 `orbit` 和 `power` 决定参数更新的方式 ✅ 
4. 改变 `mediator` 内部的 `addPlayer` 的参数接收和传出方式 ✅
5. 改 `space` 为 `BUS`; ✅
6. 在 `mediator` 内部增加一个 `Adapter`, 将指挥官传进来的参数进行映射, 然后再经由 `BUS` 传给 `Player` 的实例; ✅
7. 实例增加一个原型方法, 即解调器(适配器) `Adapter`, 这个方法将传进来的参数进行映射, 映射为自己可以接收的命令, 包括生成自己时所需要的参数 ✅
8. 需要检查绘图部分的函数, 会不会受到上面这些内容的改变的影响 ✅
9. 绘图的函数内部, 增加计算线速度的部分, 因为飞船最多 4 条, 所以参数写死成 5 正确
> 一共 4 条轨道, 最高轨道的角速度为最低轨道的速度的 40%
> speed = (5 - this.orbit) * 20%;
10. 改变 eventClear 传递给指挥官的参数的形式, 在需要起飞新的飞船时, 增加参数的数量 ✅
11. 改变 mediator 给飞船传递参数的方式, 由指定飞船编号、发送命令, 改为广播 正确
mediator 内部的对 `players` 的管理方式怎么改变? ✅

不需要添加 `listener`, 因为 `players` 本身就是需要被监听的对象的集合。
every time when mediator received any command, it will be execute on every element in `players` with `BUS` to be called. 

## 任务 28 中需要改变的地方
1. 改变 BUS， 将 BUS 变为一个全局的函数
2. 改变 BUS 函数的功能, 改为传参 {fn: fn, argus: argus}
3. 改变飞船的 Adapter, 变为可以对信号进行 encode/decode
4. mediator 增加一个接收器功能, 用于接受来自 BUS 的数据
5. 增加一个 DC 对象, 功能是存储每一艘飞船返回来的状态信息
> DC 本身是一个观察者, 提供监听功能, 一旦数据得到更新, 就调用第 6 点的 DOM 渲染函数, 对 DOM 节点进行重新渲染
为了避免 repainting 整个页面, 将大屏幕固定在右侧, 不参与整个页面的布局
6. 基于装饰者模式实现一个 DOM 渲染函数, 负责渲染大屏幕(数据源来自 DC)

`Player` 的 `feedback()` 方法:
1. 当 `_updateState()` 方法被调用时, 这个方法也被调用, 用于给 `DC` (数据中心) 传递最新的自己的状态信息, 便于数据中心更新大屏幕上显示的信息
2. 当 `_die()` 方法被调用时, 这个方法也被调用, 给 `DC` 传递销毁这个飞船在数据中心的数据(对象)

`DC` 的 ｀playerData｀ 属性:
用于给大屏幕提供用于显示飞船状态的信息
`DC` 的 `receiver()` 方法:
用于接收来自 `mediator` 的信息(源自每一个 `player`), 根据数据来决定对对象的处理方式

通过 `checkEqual()` 在 `DC` 中, 检查飞船的状态是否发生改变, 如果没有发生改变, 就不重新渲染 DOM 了
通过 `renderScreen()` 渲染大屏幕

## 非常明显可以进行优化的地方：
1. 适配器, 进行功能的分离和抽取
2. 适配器中的编码转换, 在全局定义一个通用的变量, 或者挂在 `Player` 上, 从原型中提取编码
3. 随着任务 26-28 的进行, 代码的耦合度变得很大, 有些地方可以重新编写, 降低耦合度
4. 可以用精灵兔代替实时绘制出来的飞船形状，能够提升性能