function addLoadEvent(f) {
    var oldLoad = window.onload;
    if (typeof window.onload !== "function") {
        window.onload = f;
    } else {
        window.onload = function() {
            oldLoad();
            f();
        }
    }
}
var q = new LinkList();

// 构造双向链表
// 构造函数式 —— 节点的原型
function Node(data) {
    this.data = data;
    this.next = null;
    this.previous = null;
}

// 双向链表的原型
function LinkList() {
    this.head = new Node("head");
    this.tail = this.head;
    this.frontDel = frontDel;
    this.backDel = backDel;
    this.frontAdd = frontAdd;
    this.backAdd = backAdd;
    this.print = print;
    this.length = length;
    this.insertInOrder = insertInOrder;
}

function frontAdd (o, f) {
    var n = f();
    try {
        n.next = o.head.next;
        o.head.next = n;
        n.next.previous = n;
        n.previous = o.head;
    } catch (e) {
    }
}

function updateTail(o) {
    while(o.tail.next) {
        o.tail = o.tail.next;
    }
}

function backAdd (o, f) {
    try {
        var n = f();
        updateTail(q);
        o.tail.next = n;
        n.previous = o.tail;
        o.tail = n;
    } catch (e) {}
}

function frontDel (o) {
    return function () {
        try {
            o.head.next = o.head.next.next;
            o.head.next.previous = o.head;
        } catch(e) {
            // 异常情况, 即除了 head 以外只有一个节点, 则释放这个节点
            o.head.next = null;
            o.tail = o.head;
        }
    }
}

function backDel (o) {
    return function () {
        updateTail(q);
        q.print()
        if (o.tail === o.head) {
            // 如果链表中只剩下了 head , 则什么都不做
        } else if (o.tail.previous === o.head) {
            // 如果链表除了 head 以外, 只有一个节点, 则释放这个节点
            o.head.next = null;
            o.tail = o.head;
        } else {
            // 一般情况, 移动链表的 tail, 并且释放旧的 tail 的空间
            o.tail = o.tail.previous;
            o.tail.next = null;
        }
    }
}

function getNode () {
    var input = document.getElementsByTagName("input")[0];
    var value = input.value.trim();
    input.value = null;
    input.focus();
    if (!!value) {
        return new Node(value)
    } else {
        // alert("You haven't input anything!");
        console.log("Nothing!");
    }
}

function print() {
    var a = [];
    var c = this.head.next;
    while (c) {
        a.push(c.data);
        c = c.next;
    }
    return a;
}

function length() {
    return this.print().length;
}

function insertInOrder(data) {
    var current = this.head;
    while(current.next) {
        current = current.next;
    }
    current.next = new Node(data);
    current.next.previous = current;
}

// 给所有按钮添加点击事件
function buttonInit() {
    var btns = document.getElementsByTagName("button");
    var li = btns[0];
    var ri = btns[1];
    var lo = btns[2];
    var ro = btns[3];

    li.addEventListener("click", function(){
        if (q.length() < 61) {
            frontAdd(q, getNode);
        } else {
            alert("Elements mustn't more than 60!");
        }
    });
    li.addEventListener("click", render(q));
    ri.addEventListener("click", function() {
        if (q.length() < 61) {
            backAdd(q, getNode)
        } else {
            alert("Elements mustn't more than 60!");
        }
    });
    ri.addEventListener("click", render(q));
    lo.addEventListener("click", frontDel(q));
    lo.addEventListener("click", render(q));
    ro.addEventListener("click", backDel(q));
    ro.addEventListener("click", render(q));

    var gg = document.getElementById("generate-graph");
    gg.addEventListener("click", function(){
        generateGraph(q);
    });
}


// 渲染队列(双向链表)
function render(o) {
    return function () {
        q.print();

        var d = document.getElementById("link-list");
        removeAllChildren(d);
        var currentNode = o.head;
        while(currentNode.next) {
            (function () {
                var p = document.createElement("p");
                var t = document.createTextNode(currentNode.next.data);
                p.appendChild(t);
                d.appendChild(p);
            })();
            currentNode = currentNode.next;
        }
    }
}

function removeAllChildren (o) {
    while (o.childNodes.length) {
        (function () {
            var i = o.childNodes.length - 1;
            var c = o.childNodes[i];
            c.parentNode.removeChild(c);
        })();
    }
}

function generateGraph(o) {
    var arr = o.print();
    var MAX_HEIGHT = 20;
    var MAX_WIDTH = 1;
    var MARGIN = 0.2;
    var max = Math.max.apply(Math, arr);
    var df = document.createDocumentFragment();
    var s = document.getElementById("sheet");
    removeAllChildren(s);
    var i = 0;
    for (i; i < arr.length; i++) {
        (function() {
            var d = document.createElement("div");
            d.style.height = (arr[i] / max * MAX_HEIGHT) + "rem";
            d.style.width = MAX_WIDTH + "rem";
            d.style.marginRight = MARGIN + "rem";
            d.setAttribute("title", arr[i]);
            df.appendChild(d);
        })();
    }
    s.appendChild(df);
}

var taskQueue = delay(function(){}, 0);
var aniQueue = taskQueue.delay;
var timer = 100;


function sort(o) {
    var tmpLinkList = new LinkList();
    var delayTime = 100;
    var sortGraph = document.getElementById("sort-animation");
    var d = document.getElementById("sheet");
    timer = document.getElementById("delay").value;
    removeAllChildren(sortGraph);

    // 用于为正在比较的数值所在的 div 进行高亮显示
    function highLight(e) {
        if (!e.hasAttribute("class")) {
            e.setAttribute("class", "black");
            // console.log("compare with " + e.title);
        } else {
            e.removeAttribute("class");
        }
    }

    function renderDiv(options) {
        var offset = options.offset;
        var data = options.data;
        var div = document.createElement("div");
        var MAX_HEIGHT = 20;
        var height = (data / 100) * MAX_HEIGHT;
        div.style.height = height + "rem";
        div.setAttribute("title", data);

        if (sortGraph.firstChild) {
            sortGraph.insertBefore(div, sortGraph.childNodes[offset]);
        } else {
            sortGraph.appendChild(div);
        }
    }

    function insert(node) {

        // 重写 insert 函数, 通过扫描 linkList 来决定在 sortGraph 中的行为
        // 表现为将 sortGraph 的渲染动画添加到渲染队列中
        // 原本 sort 中的 insert 函数需要用 while 语句遍历 DOM 结构来执行
        // 现在改为遍历 linkList => 更新渲染队列来执行
        var tmpHead = tmpLinkList.head.next;
        var offset = 0;
        if (tmpHead) {
            if (~~node.data < ~~tmpHead.data) {
                tmpHead.previous.next = new Node(node.data);
                tmpHead.previous.next.previous = tmpHead.previous;
                tmpHead.previous.next.next = tmpHead;
                aniQueue(function(){
                    (function(offset){
                        highLight(sortGraph.childNodes[offset]);
                    })(offset);
                }, 0);
                aniQueue(function(){}, timer);
                aniQueue(function(){
                    renderDiv({"offset": offset, "data": node.data});
                }, 0);
                aniQueue(function(){
                    (function(offset){
                        highLight(sortGraph.childNodes[offset].nextSibling);
                    })(offset);
                }, timer);
            } else {
                while(tmpHead.next && ~~tmpHead.next.data < ~~node.data) {
                    // 如果元素相等, 就不移动了
                    (function(offset){    // 为了形成一个有效的闭包, 保持 offset 的传参
                        aniQueue(function(){
                            highLight(sortGraph.childNodes[offset]);
                        }, 0);
                        aniQueue(function(){
                            highLight(sortGraph.childNodes[offset]);
                        }, timer);
                    })(offset);
                    offset += 1;
                    tmpHead = tmpHead.next;
                }
                if (tmpHead.next) {
                    tmpHead.next.previous = new Node(node.data);
                    tmpHead.next.previous.previous = tmpHead;
                    tmpHead.next.previous.next = tmpHead.next;
                    tmpHead.next = tmpHead.next.previous;
                    aniQueue(function(){
                        (function(offset){
                            highLight(sortGraph.childNodes[offset]);
                        })(offset);
                    }, 0);
                    aniQueue(function(){
                        renderDiv({"offset": offset + 1, "data": node.data})
                    }, 0);
                    aniQueue(function(){
                        (function(offset){
                            highLight(sortGraph.childNodes[offset]);
                        })(offset);
                    }, 0);
                } else {
                    aniQueue(function(){
                        (function(offset){
                            highLight(sortGraph.childNodes[offset]);
                        })(offset);
                    }, 0);
                    aniQueue(function(){
                        renderDiv({"offset": offset + 1, "data": node.data})
                    }, 0);
                    aniQueue(function(){
                        (function(offset){
                            highLight(sortGraph.childNodes[offset]);
                        })(offset);
                    }, 0);
                    tmpHead.next = new Node(node.data);
                    tmpHead.next.previous = tmpHead;
                }
            }
        } else {
            tmpLinkList.insertInOrder(node.data);
            aniQueue(function(){
                renderDiv({"offset": offset, "data": node.data})
            }, 0);
            aniQueue(function(){}, timer);
        }
    }

    var current = q.head.next;
    while(current) {
        insert(current);
        current = current.next;
    }
    console.log(tmpLinkList.print());
}

function sortBtnInit() {
    var btn = document.getElementById("sort");
    // 下面用闭包来便于传递参数
    btn.addEventListener("click", sort);
}

function test() {
    q.head.next = null;
    var input = document.getElementsByTagName("input")[0];
    var btn = document.getElementById("left-in");
    var sheet = document.getElementById("sheet");
    var CONSTANT = 60;
    var ll = document.getElementById("link-list");
    var i = 0;

    // removeAllChildren(sheet);

    for (i; i < CONSTANT; i++) {
        (function(){
            input.value = (Math.random() * 99 + 1) >> 0;
            btn.click();
        })();
    }
}

function testData() {
    var btn = document.getElementById("generate-new-data");
    document.getElementById("delay").value = timer;
    btn.addEventListener("click", test);
}

// 参照“五个非洲人”的队列实现办法
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

addLoadEvent(sortBtnInit);
addLoadEvent(buttonInit);
addLoadEvent(testData);
addLoadEvent(test);