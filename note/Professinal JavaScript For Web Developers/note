# JavaScript 高级程序设计
## 第五章 引用类型
### 5.2 Array 类型

### 5.5 Function 类型
call 函数
apply 函数
作用都是改变函数执行的变量环境, 不同的地方在于, apply 能传入数组, 而 call 不能传入数组
```
    # 例如
    var numbers = [1, 2, 3];
    Math.max.apply(Math, numbers);

    # call 则是
    Math.max.call(Math, 1, 2, 3);
```
** call 与 apply 真正的威力**
```
    var o = {
        color: "red"
    };
    var color = "blue";

    function sayColor () {
        alert(this.color);
    }

    sayColor.apply(this);   // blue
    sayColor.apply(o);      // red
    sayColor.apply(window); // blue

    # 扩充了函数赖以运行的作用域
```

## 第六章 面向对象的程序设计
### 6.1 理解对象
1. 属性类型
1.1 数据类型
可以配置的属性有
    [[Configurable]]: 表示能否 delete, 或者改为访问器属性, default: true;
    [[Enumerable]]: 表示能否被 for-in 枚举, default: ture;
    [[Writable]]: default: true;
    [[Value]]: default: undefined;
**注意**: 要修改默认的属性, 只能用 `Object.defineProperty()`
```
var person = {};
Object.defineProperty(person, "name", {
    writable: false,
    value: "Olaf"
});

console.log(person.name);   // "Olaf"
person.name = "Zixiao";
console.log(person.name);   // "Olaf"
```
**注意**: 非法操作, 在 'use strict' 下, 会报错

1.2 访问器类型
[[Configurable]]: 可否 delete 以及修改为数据属性, default: true;
[[Enumerable]]: default: true;
[[Get]]: 在属性被读取时, 调用的函数, default: undefined;
[[Set]]: 在属性被写入时, 调用的函数, default: undefined;
访问器属性**只能通过 `Object.defineProperty()`**定义如下
```
var book = {
    _year: 2015,
    edition: 1
}

Object.defineProperty(book, "year", {
    get: function() {
        return this._year;  // _year 下划线开头表示, 属性只能在内部调用
    },
    set: function(newValue) {
        if (newValue > 2015) {
            this._year = newValue;
            this.edition += newValue - 2015;
        }
    }
});

book.year = 2016;
```
2. 一次定义多个属性
`Object.defineProperties()`
```
var book = {};
Object.defineProperties(book, {
    _year: {
        writable: true,
        value: 2015
    },
    edition: {
        writable: true,
        value: 1
    },

    year: {
        get: function() {
            return this._year;
        },
        set: function(newValue) {
            if (newValue > this._year) {
                this.edition += this.newValue - this._year;
                this._year = newValue;
            }
        }
    }
})
```
3. 旧版本的替代方法(IE8 及以前):
```
var book = {
    _year: 2015,
    edition: 1
}

book.__defineGetter__("year", function(){
    return this._year;
})

book.__defineSetter__("year", function(newValue){
    if (newValue > 2015) {
        this.edition += newValue - this._year;
        this._year = newValue;
    }
})

book.year = 2016;
```
4. 读取属性的特性
`Object.getOwnPropertyDescriptor()`
```
// 接上面的代码
var descriptor = Object.getOwnPropertyDescriptor(book, "_year");
console.log(descriptor.value);          // 2015
console.log(descriptor.configurable);   // false

var newDesc = Object.getOwnPropertyDescriptor(book, "year");
console.log(newDesc);               // undefined
console.log(newDesc.enumerable);    // false
console.log(typeof newDesc.get)     // "function"
```
### 6.2 创建对象
1. 工厂模式
优点:
    节约命名空间, 将相关的方法及属性进行封装
缺点:
    1. 实例中的方法, 是相同的函数的多次备份;
    2. 无法识别为对象, 因为自身是由 `Object` 生成空对象的基础上增强而来, 所以 `prototype` 属性为 undefined;
    3. 由于第 2 点, 使得继承时, 也会存在问题
```
function createPerson (argu0, argu1) {
    var o = {}
    o.value = argu0;
    o.f = function () {
        console.log(argu0 + argu1);
    }
    return o; 
}
var p1 = createPerson("a", 1);
p1.f(); // "a1"
var p2 = createPerson("b", 2);
p2.f(); // "b2"

p1.prototype;  // undefined
p1.prototype === p2.prototype;  // true, 因为 undefined 等于 undefined
```
2. 构造函数模式
缺点:
    1. 同一 function 多次备份

*惯例, 构造函数命名, 以大写字母开头*
```
function Person (name, age) {
    this.name = name;
    this.age = age;
    this.sayName = function () {
        console.log(this.name);
    }
}

var myself = new Person("Olaf", 22);
var him = new Person("Zixiao", 22);
myself.sayName();   // "Olaf"
console.log(myself.sayName == him.sayName);  // false
```
从构造函数开始, 因为实例的确是其构造函数的对象的实例, 因此可以开始用 `instanceof` 了
```
console.log(myself instanceof Person);   // true
```
别的使用方法
```
var o = new Object ();
Person.call(o, "Zheng", 22);
o.sayName();    // "Zheng", 原型模式因为方法是在原型上, 就不能使用这种方法了
```
3. 原型模式
优点:
    - 方法来自原型, 避免多次备份;
缺点:
    - 属性共享
```
function Person () {
    Person.prototype.name = "Olaf";
    Person.prototype.age = 22;
    Person.prototype.sayName = function () {
        console.log(this.name);
    }
}

var myself = new Person();
var another = new Person();
myself.sayName();   // "Olaf"
another.sayName();  // "Olaf"
console.log(myself.sayName === another.sayName);    // true
```
与原型模式有关的方法
```
console.log(Person.prototype.isPrototypeOf(myself));  // true
console.log(Person.isPrototypeOf(myself));  // false, 注意与上一条语句的区别
console.log(Person.prototype.constructor === Person); // true
console.log(Object.getPrototypeOf(myself) === Person.prototype);    // true
console.log("name" in myself);  // true, in 操作符检测的是整个原型链
console.log(myself.hasOwnProperty("name")); // false, hasOwnProperty 只检查依赖的对象本身

/* for in 会检测整个原型链, 如果实例上有属性,
  屏蔽了原型上的属性, 则这个属性, 会被枚举出来,
  即便将 [[Enumerable]] 属性设置为 false 也不行
  因为规定, 开发人员定义的属性, 必须会被枚举出来
    
    但是 IE8- 存在 bug, 没有遵守这个规定,
    屏蔽了原型中不可枚举属性的实例属性, 不会被枚举出来

    如下
*/
var o = {
    toString: function () {
        return "new Object";
    }
};

for (var prop in o) {
    if (prop === "toString") {
        console.log("Found toString");  // 在 IE8- 中, 不会显示
    }
}

//  [Q], 既然在原型上的不可枚举属被实例属性屏蔽时, 
//  会发生上面的情况, 那么, 如果原型上的属性是可枚举的呢?
//  还没想到哪种原型属性可以枚举 
```
4. 组合使用构造函数模式和原型模式
优点:
    在原型模式的基础上, 解决了属性共享的问题
```
function Person (name, age) {
    this.name = name;
    this.age = age;
}
Person.prototype.sayName = function () {
    console.log(this.name);
}

var myself = new Person("Olaf", 22);
var another = new Person("Zixiao", 22);
myself.sayName();   // "Olaf", 继承的时候, 没有用 new 关键字, 那样才会得到 "Zixiao"
myself.sayName == another.sayName;  // true
```
5. 动态原型模式
优点:
    解决 OO 中, 部分原型属性或者原型方法初始化的问题
**注意**: 因为初始化是作用在原型上的, 所以, 会响应在所有的实例中
```
function Person (name, age) {
    this.name = name;
    this.age = age;
    if (typeof this.sayName !== "function") {
        Person.prototype.sayName = function () {
            console.log(this.name);
        }
    }
}
// 可以使用 instanceof 来检测某个对象是否是某个原型的实例
```
6. 寄生构造函数模式
和工厂模式只差一个 `new` 关键字
如果在调用的时候, 写成 `myself = Person("Olaf", 22);`, 那就是工厂模式了
优点:
    当不能修改原型时, 可以利用这个办法来增强对象, 例如想要在 Array 的原型上添加一个方法, 但是公司又禁止修改原型的时候
缺点:
    和工厂模式一样
```
function Person (name, age) {
    var o = {};
    o.name = name;
    o.age = age;
    o.sayName = function () {
        console.log(this.name);
        //  this 依赖于执行环境
        //  这个函数的执行环境(execution context)为 o
        //  又因为是引用类型的值(o 是对象)
        //  所以这里用 o.name, 应该也没问题
    };

    return o;
}

var myself = new Person("Olaf", 22);
myself.sayName();   // "Olaf"
```
构造函数在没有返回值的时候, 会返回一个新对象实例, 在构造函数末尾添加一个 `return` 语句, 能够重写调用构造函数时, 返回的值
7. 稳妥构造函数模式
与寄生构造函数模式类似, 但是内部没有使用 `this`, 在创建实例时, 没有使用 `new`
优点:
    用以满足某些项目的特殊需求, 比如, 某些安全的环境中禁止使用 `this` 和 `new`
```
function Person (name, age) {
    var o = new Object();
    //  可以定义私有变量和函数, 即只能通过特权方法访问的值

    //  添加方法
    o.sayName = function () {
        console.log(name);  // 注意没有 this, name 在这里只是私有变量, 
        //  从外部无法访问, 而通过这样的方法来访问私有变量, 已经是闭包了
    }
    return o;
}
```

### 6.3 继承
### 1. 原型链
### 2. 借用构造函数
### 3. 组合继承
### 4. 原型式继承
### 5. 寄生式继承
### 6. 寄生组合式继承

## 第七章 函数表达式
### 7.1 递归
#### 1.
```
arguments.callee // 可以在非严格模式下使用,避免函数名称发生改变带来的影响

// 如果是严格模式, 则可以通过像下面这样的函数表达式的方式, 来实现递归
var recursion = (f(num){
    if (num < 1) {
        return 0;
    } else {
        return f(num - 1)
    }
});
```

### 7.2 闭包
#### 1. 闭包与变量
#### 2. 关于 `this` 对象
```
var name = "The Window";

var object = {
    name : "My Object",

    getNameFunc : function () {
        return function () {
            return this.name;
        };
    }
};

console.log(object.getNameFunc()());    //  "The Window"(在非严格模式下, 严格模式下, 
                                        //  当 execution context 为 global 时, 使用 this 关键字会报错)
```
*为什么是 "The Window", 而不是 "My Object" 呢? 如下*
```
var a = "global variable"
function outer () {
  var a = "inner variable"; 
  return (function inner () {
    return this.a;
  });
}

outer()();  //  "global variable"
```
那么, 如何获得内部的变量?
两种办法:
1. 通过函数传参, 利用闭包的特性, 保持内部的 `a`;
2. 通过人为的保持 `this` 的值(仍然是利用了闭包的特性), 内部不再用 `this`, 而是另外一个指针, 但是这个办法只能用在一定的栗子上, 比如上面的那中, 函数是对象的方法的栗子上, 一般的函数, 是不适用的, 因为函数的 `this` 本身并不指向对象本身(虽然函数也是对象), 而是 execution context
```
var a = "global variable"
function outer () {
  var a = "inner variable"; 
  return (function inner (a) {
    // 通过函数传参, 利用闭包的特性, 保持 a 的值
    return function () {
        return a;
    }
  })(a);
}

outer()();  //  "inner variable"
```
特殊示例
```
var name = "The Window";

var o = {
    name : "Inner",

    getName : function () {
        return this.name;
    }
}

o.getName();                    //  "Inner"
(o.getName)();                  //  "Inner"
(o.getName = o.getName)();      //  "The Window"
// 前两条语句, o.getName 等价于 (o.getName)
/*
    第三条, 是一条赋值语句, 赋值语句的值, 等于左边的值
    而 o.getName = function(){return this.name}, 注意右边没有链式调用
    即相当于, 将 function(){return this.name} 单独抽离出来了
    即, 第三条语句等价于 (function(){return this.name})();
    而前两条语句, 是通过 JavaScript 的链式语法, 将
    (function(){return this.name})() 的执行环境绑定在了对象 o 上
    所以前两条语句的值, 与第三条不同
    this 对象绑定在函数运行时的环境,
    即函数运行时的 execution context, 
    所以, this = window, 所以第三条语句, 得到 "The Window"

    其实, 第三条语句的左边带有迷惑性, 无论左边是什么变量
    第三条语句的返回值都不会变, 如下
*/

var a = null;
(a = o.getName)();  //  "The Window"
```

### 7.3 模仿块级作用域
### 7.4 私有变量
#### 1. 特权方法
缺点:
    每个实例, 都需要创建一组新方法, 用静态私有变量的方法, 可以改善这个问题
#### 2. 静态私有变量
静态私有变量, 通过在原型上增加方法而增进代码的复用, 也可以通过指定静态私有变量, 来实现变量的共享, 当实例需要自己的私有变量的时候, 可以增加实例属性, 为实例提供实例变量, 可以解决这个问题
```
(function () {
    var name = "";

    //  注意, 对象的声明, 没有使用 var 关键字
    //  所以是全局变量, 但是又因为作用域链(活动空间、闭包)的原因
    //  可以通过访问这个全局变量, 来获得静态私有变量
    Person = function (value) {
        name = value;
        //  如果有需要, 可以为其添加实例变量
        //  可以用到继承的概念, 也可以直接在 Person 对象中添加
    };

    Person.prototype.getName = function () {
        return name;    // 注意这里是一个闭包
    };

    Person.prototype.setName = function (value) {
        name = value;
    };
})();

var myself = new Person("Olaf");
console.log(myself.getName());  // "Olaf"
myself.setName("Cheng");
console.log(myself.getName());  // "Cheng"

var another = new Person("Zixiao");
console.log(another.getName()); //  "Zixiao"
console.log(myself.getName());  //  "Zixiao"

```
#### 3. 模块模式
模块模式是在单例的基础上增强出来的
单例是指那些只实例化一次的对象
```
//  一个简单的单例的模型
var singleton = {
    name : value,
    method: function () {
        //   单例方法的代码
    }
};
```
在单例的基础上, 延伸出模块模式的概念
```
//  相较于单例, 模块模式改变了创建单例的方式
//  由字面量赋值, 改为类似工厂模式
//  但是组合了私有变量、特权方法的特点

var singleton = function () {
    //  私有变量和私有函数
    var privateVariable = 1;

    function privateFunction () {
        return false;
    }

    return {
        publicVariable : true,
        publicFunction : function () {
            privateVariable++;
            return privateFunction();
        };
    }
}();    // 注意结尾的一对圆括号, 改变了右边的表达式的值
//  没有圆括号结尾的情况下, 这段代码就成了函数定义式
//  有了圆括号, 就是将函数声明出的函数, 的运行出的返回值
//  赋值给了 singleton
```
[Q] 为什么在上面, 函数声明语句后面可以直接加括号, 来获得返回值?

**增强的模块模式**
有时候, 应用程序对模块模式的实现要求, 需要单例为某个类型的实例, 那么就可以直接在模块模式内部进行类型的实例化从而创建单例, 如下
```
var singleton = function () {

    // 私有变量和私有函数
    var privateVariable = 1;

    function privateFunction () {
        return false;
    }

    // 创建对象, 通过实例化某个类型, 得到增强
    var o = new CustomType ();

    // 添加特权/公有属性和方法
}
```
增强的模块模式的简单模型
```
var singleton = function () {

    // 私有变量和函数
    var privateVariable = 1;

    function privateFunction() {
        return false;
    }

    // 创建对象, 某个类型的实例
    var o = new CustomType ();

    // 添加特权/公有属性和方法
    o.publicProperty = true;
    o.publicMethod = function () {
        privateVariable++;  // (privateVariable++) = (privateVariable ++)
        return privateFunction();
    };

    // 返回这个对象
    return o;
}();
```
有关增强的模块模式的例程
假设例子中, 模块 `application` 对象必须是 `BaseComponent` 的实例
```
var application = function () {
    // 私有变量和函数
    var components = [];

    // 初始化
    components.push(new BaseComponent());

    // 创建 application 的一个局部副本
    var app = new BaseComponent();

    // 公共接口(特权方法 <-- 闭包)
    app.getComponent = function () {
        return components.length;
    };

    app.registerComponent = function (component) {
        if (typeof component === "object") {
            components.push(component);
        }
    };

    //  返回这个副本
    return app;
}();    // 结尾依然是一对圆括号
```

## 第十四章 表单脚本
### 14.2 文本框脚本
1. `select()` 方法, 是用在 text 上的, 不是 <select\> 标签

### 14.3 选择框脚本

1. select box 的 select 对象所拥有的方法:
```
add(newOption, relOption):  向控件中插入新的 <option> 元素, 位置在 relOption 之前
multiple: 布尔值, 是否允许多选
options: select box 中 <option> 的 HTMLCollection
remove(index): 移除给定位置的 option
selectedIndex: 当前选中的 Option 在 Select Box 中的索引值, 没有选中, 则为 -1
size: 选择框中可见的行数
value: {
    "没有选中" : "",
    "选中且 HTML 中已有 value 值" : value,
    "选中但没有 value 值" : <option> 中的文本节点,
    "选中多个选项" : 根据前述规则, 取索引值靠前的 option 值(? 未验证)
}
```

option 对象的方法
```
index
label
selected: boolean
text
value
```

对于已经被选中的选项, 可以用 selecBox 的 selectedIndex 属性来获得其索引, 如 `selectBox.selectedIndex`, 可以像这样赋值 `var selectedIndex = selectBox.selectedIndex`, 修改 `selectedIndex` 会导致其他被选中的 option 失效, 但是修改 option 的 selected 属性就不会, 例如 `selectBox.options[0].selected = true`

2. 增加 <option> 的最佳方案:
```
var newOption = new Option("Option text", "Option Value");
selectBox.add(newOption, undefined);    
/*
第二个参数, 是指定在哪个 option 之前,
如果想插入在 selectBox 的结尾, 就传入 undefined 或者 null,
如果编写的是跨浏览器的代码, 就传入 undefined, 而且如果第二个不传入, 某些浏览器下会出错
*/
```

3. 移除选项 删除 option 删除option
 - DOM 的 removeChild() 方法可以使用, `selectBox.removeChild(selectBox.options[0]);`
 - 还可用 select 特有的 `remove()` 方法, `selectBox.remove(0)`, 如果想移除所有的 <option>, 就迭代移除吧

 4. `insertBefore()` 和 `appendChild()` 都可以用来重排 <option>, 但是前者的工作量显然更小

 5. 表单序列化, 与  Ajax 有关, 用到了再看 