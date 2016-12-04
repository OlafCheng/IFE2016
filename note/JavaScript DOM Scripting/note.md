# JavaScript DOM 编程艺术
## 第七章 动态创建标记
------------
如何对节点进行操作?
------------
### 7.1 传统方法
1. **document.write()**
document 对象的 write 方法只能使用嵌入式, 同时 `document.write` 会清除在自己运行以前已经存在的 DOM 结构
所以, 不要使用比较好
2. **innerHTML()**
innerHTML 方法最开始是在 IE4 中出现的, 不是 W3C 标准, 后来才慢慢被接受
优点和缺点都在于 innerHTML 对 DOM 的处理方式太过于粗糙, 如下:
```
<div id = "test"><p>This is <em>content.</em></p></div>

console.log(document.getElementById("test").innerHTML());
// <p>This is <em>content.</em></p>
```

### 7.2 DOM 方法
1. **createElement()**
DOM 结构中, 节点都存在节点类型、节点名称等等属性
```
    var tmpNode = document.createElement("p");

    // 通过 nodeType 和 nodeName 可以获得节点属性
    tmpNode.nodeType;   // 1
    tmpNode.nodeName;   // "P", nodeName 是标签名的大写, 符合 XHML 标准
```
2. **appendChild()**
createElement 方法与 appendChild 方法结合, 就能创建并添加节点, 但是元素节点可能并不会显示在浏览器中
*注意: appendChild() 方法会把一个元素从之前的容器中移除, 再添加入新的容器* 
```
    var tmpDiv = document.createElement("div");
    var tmpP = document.createElement("p");
    tmpDiv.appendChild(tmpP);
```
3. **createTextNode()**
```
    var txt = document.createTextNode("Hello world!");

    // 在创建好文本节点后, 要加入元素节点, 并添加到整个 DOM 结构中, 才能显示出来

    tmpP.appendChild(txt);  // 接着上面的 appendChild 的代码

    document.body.appendChild(tmpDiv);
```

### 7.3 其他的一些 DOM 元素的方法
1. insertBefore()
这个方法的作用是把一个元素插入到指定元素之前
原理是这样的: `parentNode.insertBefore(`*newELement*`, `*targetElement*`)`
**但是**, 这样使用更简单: `targetElement.parentNode.insertBefore(`*newElement*`, `*targetElement*`)`
2. insertAfter()
**这不是 W3C 的标准**, 需要自己实现
```
    function insertAfter(newElement, targetElement) {
        var parent = targetElement.parentNode;
        if(parent.lastChild == targetElement) {
            parent.appendChild(newElement);
        } else {
            parent.insertBefore(newElement, targetElement.nextSibling);
        }
    }
```
* 注意不是原生方法, 所以使用方法和 `insertBefore` 不同


