# 编写 JavaScript 的 68 个有效方法
---- 笔记
## 1. 清楚的知道自己要写的是哪个版本的 JavaScript

比如在 ES3 中, `const` 关键字也可以使用, 但是浏览器会将 `const` 当作 `var` 进行解析, 而不是所期望的那样——声明一个变量为常量，并且不能被改变。

在 `ES5` 中出现了严格模式, 可能会出现下面的情况:
```
<script src="script1.js" />
<script src="script2.js" />
```
如果 `script1.js` 使用了严格模式, 而 `script2` 没有使用, 会导致 JS 引擎可能会在解析 `script2.js` 时抛出异常。

以递归函数的实现为例：
```
// script1.js
// 下面是递归函数在严格模式下实现的办法
'use strict';
var recursion_0 = (function () {
  return function fn(args) {
    // some code
    return fn(args);
  }
})();

// script2.js
// 在非严格模式下实现的办法
var recursion_1 = function (args) {
  // some code
  return arguments.callee(args);
}
```
当这两个脚本结合在一起时, 会导致 `script2.js` 出错, 因为 `script1.js` 中启用的严格模式而受影响。

解决办法是, 用 IIFE(Immediately Invoked Function Expression), 如下:
```
// script1.js
(function() {
  'use strict';
  // some code
})();

// script2.js
// 不受影响
```
如果后面的脚本需要用到 `script1.js` 中的脚本, 可以用类似外观模式(Facade)来实现。类似于 `jQuery` 的 `Sizzle` 选择器。

## 2. JavaScript 中的数字运算
1. JavaScript 中的数字都是按照 64 位的双精度浮点数进行保存的
2. 进行位运算时, 会将 64 位浮点数转换为 32 位的整数, 然后再进行运算, 所以才会出现一种取整的办法 `0.1 >>> 0//0`
3. 所有值比较有意义的运算, 都应该用整数进行运算, 因为双精度浮点书的小数运算不可靠
4. 64 位双精度可以保存的有效数字范围为 -9千万亿~+9千万亿 (负的2的53次方到正的2的53次方)
5. 32 位有符号整数只能保证 5 位数的计算的准确性

## 3. 隐式的强制转换
