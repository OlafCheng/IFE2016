**疑问用 "[Q]" 来标记, 方便搜索**

## 如何知道一个方法是不是原生 JavaScript 方法 [Q] 

## window.onload
```
function addLoadEvent(func) {
    var oldLoad = window.onload;
    if (typeof window.onload != "function") {
        window.onload = func;
    } else {
        window.onload = function() {
            oldonload();
            func();
        }
    }
}
```
*注意* 在调用 `addLoadEvent` 的时候, 传入的参数是函数名, **不能**加括号
```
    // 正确:
    addLoadEvent(func);

    // 错误:
    addLoadEvent(func());
```

## jQuery.element.on()
实现方法是什么?[Q]  用原生 JavaScript 重新实现一下, 方便自己使用。

## 数组释放空间
对数组用 delete 或者 a[n] = null 的方法, 都能释放空间, 但是不能改变索引, 如果想改变索引, 只能逐个前移, 然后 a.length - 1

## 对象释放空间 Object空间
delete 用来释放 Object 所占用的空间的时候, 记住, 索引值**不一定**是数字
```
// 错误示范
var a = {"a": "a", "b": "b", "c": "c"} // Object {a: "a", b: "b", c: "c"}
delete a[1] // true
a // Object {a: "a", b: "b", c: "c"}

// 正确操作
delete a["a"] // true
a // Object {b: "b", c: "c"}
```

## 函数默认值  function 默认值
好像只能用 arguments 函数, 和 SASS/SCSS 不一样
```
function test() {
  alert(arguments[0])
}

test("a", "b")  // "a"
```
如果某些场景需要设置默认值, 可以用如下的方法
```
function test() {
    var a = arguments[0] || "a";
    var b = arguments[1] || "b";
}
```
不知道有没有能指定实参名称的默认值使用方法

## 如何指定访问对象的最后一个属性
可以模拟 Python 中的 tuple, 把对象数组化
```
Object.prototype.toArray = function () {
    var a = [];
    var i = 0;
    for (key in this) {
        a[i++] = [key, this[key]]
    }
    return a;
}
```

## select 选择框脚本

## 删除节点 移除节点 移除元素 removeChild()
是原生的 DOM 方法, 用法如下
```
var selectBox = document.getElementById("select");
selectBox.removeChild(0);   // 移除第一个选项
selectBox.removeChild(selectBox.options[0]);    // 移除第一个选项
// 对于选择框, 移除 option 还有特别的办法
selectBox.options[0] = null;    // 移除第一个选项
```

## 进制转换
```
// 十进制转其他进制
// 标准形式为
Object.toString(n);

var a = 100;
a.toString(16); // 十进制转 16 进制, 或者下面的形式, 等效
100..toString(16);
typeof 100. // "number"
typeof 100 // "number"



// 其他进制转 10 进制
parseInt("11", 2);  // 2 进制转 10 进制
parseInt("8D", 16); // 16 进制转 10 进制

// JavaScript 支持的最大进制为 36
```

## 删除和替换节点
`removeChild()`
```
n.parentNode.removeChild(n);
```
`replaceChild()`
```
n.parentNode.replaceChild(someNode, n);
```
**删除子节点**时, 可能会遇到跳过某些节点, 再删除其中一半节点的问题, 因为 `o.parentNode.childNodes.length` 是在不断变化的, 每个节点的索引值也会因为前面的节点的删除而减小, 例如 4 -> 3, 5 -> 4, 结果在遍历的时候如果用递增的索引值, 就会跳过一半的节点

## 事件绑定 addEventListener 事件处理程序 DOM2
`EventTarget.addEventListener` 与 `EventTarget.removeEventListener` 都是 DOM2 级事件绑定方法(或者叫事件监听器), `EventTarget.onclick` 则是 DOM0 级事件绑定方法, 异同在于, DOM2 级可以指定事件触发的阶段(冒泡或者捕获阶段), 而 DOM0 级只能在冒泡阶段触发事件。
```
function f () {
    console.log("first!");
}

var e = document.createElement("div");
    e.addEventListener("click", f, false);
    // "click" 是在事件对象上绑定的事件
    // f 是绑定在事件对象的某个事件上的事件处理程序
    // false 是指在冒泡阶段触发, true 则是在捕获阶段触发, default: false

// 也可以用匿名函数来绑定, 同一个事件对象的同一个事件上, 新添加的事件处理程序会依次被触发
e.addEventListener("click", function(){
    console.log("second!");
}, false);

e.click(); // "first!"   "second!"

// 匿名函数无法移除
// 通过 EventTarget.addEventListener 添加的函数, 只能用 EventTarget.removeEventListener 移除
// 移除成功的条件是, 传入的参数与传入 addEventListener 中的参数完全相同, 包括第三个参数
e.removeEventListener("click", f, false);
e.click(); // "second!"
// EventTarget.click() 方法用于模拟点击事件, 如同用户手动点击某个元素
```
`EventTarget.onclick` 是事件处理程序, 和 `EventTarget.addEventListener` 中的 `click` 区别在于, 前者被赋值一个事件处理方法(因为自身已经是事件处理程序), 而 `click` 仅仅表示事件, 即 `event` 与 `onevent` 的区别

## 事件处理程序 参数
当事件处理程序需要参数时, 可以用在事件处理程序内部嵌套一层 `function` 的方式, 形成一个闭包, 来达到传递参数的目的, 此时, 事件实际上与事件处理程序内部的匿名函数绑定在了一起
```
var e = document.createElement("div");
e.addEventListener("click", eventProcessFunction(n));

function eventProcessFunction (n) {
    return function() {
        console.log(n);
    }
}
```

## 链表
```
function Node (data) {
    this.data = data;
    this.next = null;
}

function LinkList () {
    this.head = new Node("head");
    this.someMethod = someMethod;
    this.eventProcessFunction = eventProcessFunction;
}

function someMethod() {
    console.log("Do something.");
}

// 如果由于事件处理程序的原因, 需要对链表的某些方法进行传值
// 可以实用闭包来实现, 如下

function eventProcessFunction (object, func) {
    // 由于闭包的特性, 会导致传参保持旧的, 而不是新的
    // 如果想要解决这个问题, 则可以用传参也是函数的方式来解决
    // 在函数被调用时, 依然形成一个闭包
    return function () {
        var value = func(); // 通过调用一个函数, 获得最新的参数
        console.log(object);
        console.log(value);
    }
}

function returnValue () {
    return "this is value";
}

var linkList = new LinkList();
var ele = document.createElement("div");
// 通过传递函数名称, 在链表的方法中, 使用传递的函数名称, 实现用闭包的同时, 得到想要的参数值
ele.addEventListener("click", eventProcessFunction(linkList, returnValue));
```

## 删除一个节点的所有子节点  删除节点  删除子节点  子节点
来自 stackoverflow
避免了访问 length 属性、childNode 属性
即节约出多次 NodeList 实时更新的时间
```
function removeAllChildren (o) {
    while(o.firstChild) {
        o.removeChild(o.firstChild);
    }
}
```

## 递归 函数调用自身 callee
```
arguments.callee // 可以在非严格模式下使用

// 如果是严格模式, 则可以通过像下面这样的函数表达式的方式, 来实现递归
var recursion = (f(num){
    if (num < 1) {
        return 0;
    } else {
        return f(num - 1)
    }
});
```

## [Q] 在生成新的对象时, `new` 关键字做了什么?

> Description
> Creating a user-defined object requires two steps:
> 
> Define the object type by writing a function.
> Create an instance of the object with new.
> To define an object type, create a function for the object type that specifies its name and properties. An object can have a property that is itself another object. See the examples below.
> 
> When the code new Foo(...) is executed, the following things happen:
> 
> A new object is created, inheriting from Foo.prototype.
> The constructor function Foo is called with the specified arguments, and with this bound to the newly created object. new Foo is equivalent to new Foo(), i.e. if no argument list is specified, Foo is called without arguments.
> The object returned by the constructor function becomes the result of the whole new expression. If the constructor function doesn't explicitly return an object, the object created in step 1 is used instead. (Normally constructors don't return a value, but they can choose to do so if they want to override the normal object creation process.)
翻译:
> 描述
> 用户自定义一个类，需要经过以下两步:
> 1. 通过编写一个函数, 来定义一个对象类 (Object type).
> 2. 用 `new` 关键字来创建一个之前建立的对象的实例.
> 为了定义一个对象类, 你需要明确用来创建这个对象类的函数的名字和属性. 对象的属性, 还可以是其他的对象. 看下面的栗子.
> 当 `new Foo(...)` 被执行的时候, 会执行如下步骤:
> 1. 一个新的对象被创建了, 继承自 `Foo.prototype`.
> 2. 函数 `Foo` 的构造函数会被传参(如果有的话)并调用, 它的 `this` 会被绑定在刚刚建立的新的对象上. `new Foo` 等价于 `new Foo()`, 也就是说, 如果参数列表没有被用户明确的定义, `Foo` 会直接被调用而不进行传参.
> 3. `new` 表达式会返回由构造函数返回的对象(`object`). 如果构造函数没有明确的返回一个对象, 那么 `new` 表达式将会返回在步骤 1 中创建的那个对象.(一般来说, 构造器并不返回一个值, 但是如果构造器愿意的话, 是可以通过覆盖返回步骤 1 中创建的对象来达到这个效果的, 改写 `return` 的值即可)

分析下面的栗子:
```
// 来自 《JavaScript 语言精粹》第三章
// 假设 Object.create 方法还没有被纳入 ECMAScript 规范(ES5)

Object.create = function(o) {
    var F = function() {};
    // 通过这一句, 创建了一个空函数
    // F 现在是一个对象类
    // F.prototype = Object
    // F.prototype.constructor = function() {}
    // 如果现在直接返回 F, this 将会被绑定到 window

    F.prototype = o;
    // 覆盖 F 的 prototype 属性, 实现继承

    return new F();
    // 根据 F.prototype.constructor 的返回值, 构造了一个对象类
    // 但是由于 F.prototype.constructor = function() {}, 没有返回值
    // 所以返回的是默认的, 即表达式
    // var F = function() {} 
    // 构造的对象类本身
    // this 也被绑定在这个对象类上
    // 根据传参, 可以知道, 实现了继承, 通过原型链的访问
    // new F() 返回的对象类, 可以访问到 o 上的属性
    // 并且可以覆盖, 但是不能修改和删除 o 上的属性
    // 并且 new F() 返回的对象类
    // 在调用 this 时, 会指向本身环境中的属性
    // 而不是全局属性(JavaScript 里, 函数中定义函数时, this 的绑定存在错误)
}
```


## javascript 原生 filter
`Array.prototype.filter(callback[, thisArg])`,
callback 的传参:
```
element // 正在处理的数组中的元素
index // 正在处理的元素的索引值
array // 正在处理的元素所在的数组
```
```
function isBigEnough(value) {
  return value >= 10;
}
var filtered = [12, 5, 8, 130, 44].filter(isBigEnough);
// filtered is [12, 130, 44]
```

## `document.createDocumentFragment()`
是一个直接可以使用的方法

## setTimeout & setTimeInterval
```
// 利用赋值, 可以实现清除计时器符号, 但是不卸载已经加入队列的任务
var timer = setTimeout(function(){
    console.log("Timer!")
}, 1000);
timer = null;
//  1s 后显示出 "Timer!"

// 如果直接用 clearTimeout() 函数, 则会将已经加入到队列中的任务卸载
```

## 数组 方法

```
concat()    // 连接两个或更多的数组，并返回结果。
join()  // 把数组的所有元素放入一个字符串。元素通过指定的分隔符进行分隔。
pop()   // 删除并返回数组的最后一个元素
push()  // 向数组的末尾添加一个或更多元素，并返回新的长度。
reverse()   // 颠倒数组中元素的顺序。
shift() // 删除并返回数组的第一个元素
slice() // 从某个已有的数组返回选定的元素
sort()  // 对数组的元素进行排序
splice()    // 删除元素，并向数组添加新元素。
toSource()  // 返回该对象的源代码。
toString()  // 把数组转换为字符串，并返回结果。
toLocaleString()    // 把数组转换为本地数组，并返回结果。
unshift()   // 向数组的开头添加一个或更多元素，并返回新的长度。
valueOf()   // 返回数组对象的原始值
```

## 队列延迟函数的实现
```
function delay(fn, t) {
    var queue = [];
    var schTask = null;

    function schedule (fn, t) {
        schTask = setTimeout(function(){
            schTask = undefined;
            fn();
            if (queue.length) {
                var next = queue.shift();
                schedule(next.fn, next.t)
            }
        }, t);
    }

    self = {
        delay: function(fn ,t) {
            if (queue.length || schTask) {
                queue.push({fn: fn, t: t});
            } else {
                schedule(fn, t);
            }
            return self;
        }
    }
    return self.delay(fn, t);
}
```

## 如何避免访问未定义的属性的值时, 抛出 "TypeError" 错误  undefined error TypeError
为什么能这样做呢? 因为 `&&` 是从左向右结合的短路运算符, 当访问到一个 `undefined` 时, 
就不再继续向右访问, 因此避免了 `TypeError` 错误。
```
// 先来看一个栗子
var a = "abc";
var b = "d";
var c = a && b;

console.log(c); // "d"


// 因此可以像下面这样做
var o = {};
console.log(o.a);    // undefined
try {
    console.log(o.a.a);
} catch (e) {
    console.log(e); // TypeError
}

var a = o.a && o.a.a;
console.log(a);      // undefined
```

## 连等
[Q]: 有关连等, 有一个大坑, 但是想不起来了, 可能是 C 语言中的
```
var a = b = c = "a" && "b"
console.log(a); // "b"
console.log(b); // "b"
console.log(c); // "b"

// 由栗子可以想到, 等号是从右向左结合的, 优先级最低的运算符
// 因此, 每一个运算符的左侧的变量的值, 就等于右侧的表达式的值
```

## delete 删除属性
`delete` 会删除一个对象中存在的属性, 不会删除原型链中的属性, 如果一个对象的属性覆盖了原型链中的属性, 这个对象上的属性被 `delete` 被覆盖后, 原型链中的这个属性将变得可以访问。
`delete` 只能作用于对象的属性, 而不能作用于其他变量符号(删除失败会返回 `false`), `delete` 的返回值是操作成功与否的一个布尔值
```
var a = {};
delete a.a; // true

delete a; // false

var b;
delete b; // false
```

## this 作用域 函数调用 怎么证明 JavaScript 在 `this` 的值的绑定上存在错误?
```
var v = 2;

var o = {
    v: 1,
    f: function() {

        var innerFunc = function() {
            this.v += this.v;
        }

        innerFunc();
    }
}

// 如果设计的正确, 执行过 o.f() 后, o.v 应该等于 2
o.f();
console.log("o.v = " + o.v);

// 但是实际上, 是全局作用域中的 v 变成了 4
console.log("v = " + window.v);  // 故意写个 window.v, 强调下 v 是全局变量

// 栗子也可以改写成下面这样
var v = 2;
var a = function() {
    var v = 1;

    var double = function() {
        console.log("this.v = " + this.v); // 注意这里输出的是 window.v 的值
        this.v += this.v;
    }

    double();

    console.log("inner v = " + v); // 如果设计正确, 这里应该输出 2, 实际上输出 1
}
a();

console.log("outter v = " + v); // 实际上这里会输出 4

// 但是作用域链并没有设计错误, 只是 this 的绑定有错误
// 所以仍然可以使用作用域链来得到正确的变量值
```

## 级联调用
级联调用的根本在于一元操作符作用于的 `.` 是个对象, 而通过改写一个函数的返回值, 可以实现这一点。 
```
// TODO
// 编写一个能够实现级联调用的函数
```

## 如何分辨一个对象是不是数组
```
var is_array = function(value) {
    return Object.prototype.toString.apply(value) === "[object Array]";
}
```

## 浮点数计算
用 `|` 比 `Math.floor()` 更快

## EventUntil
```
var EventUntil = {
    addHandler: function(element, type, handler) {

    },

    getEvent: function(event) {
        return event ? event : window.event;
    },

    getTarget: function(event) {
        return event.target || event.srcElement;
    },

    preventDefault: function(event) {
        if (event.preventDefault) {
            
        }
    }
}
```

## 怎么在对象原型的内部，获得调用其的继承元素的指针?
不知道。
现在想要获取继承元素的指针的原因是，想要使用原型上的某个方法, 而且这个原型的方法需要使用到某些传参，所以既要能调用原型链上的方法，又要能给方法传递参数。
这两者结合起来就会比较复杂, 所以这样办：
```
var Tree = () => {};
Tree.prototype.someMethod = (argu) => {
    !function fn(that) {
        that.someMethod.call(argu);// 实现了调用自身, 并且传参
    }(this, para);
};
var tree = new Tree();

tree.someMethod.call(tree, para);
```

## setAttribute addClass removeAttribute removeClass
原生 js 里没有直接针对 class 属性的操作方法, addClass 与 removeClass 均来自 jQuery
可以自己实现 `addClass` 与 `removeClass`

## 函数执行时, 内部的变量如何变化
看下面的代码:
```
function a () {
    var a;
    if(a === undefined) {
        console.log("a is not defined!");
        a = 1;
    }
};
a();
a();
```