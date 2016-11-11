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

// 给所有按钮添加点击事件
function buttonInit() {
    var btns = document.getElementsByTagName("button");
    var li = btns[0];
    var ri = btns[1];
    var lo = btns[2];
    var ro = btns[3];

    li.addEventListener("click", frontAdd(q, getNode));
    li.addEventListener("click", render(q));
    ri.addEventListener("click", backAdd(q, getNode));
    ri.addEventListener("click", render(q));
    lo.addEventListener("click", frontDel(q));
    lo.addEventListener("click", render(q));
    ro.addEventListener("click", backDel(q));
    ro.addEventListener("click", render(q));
}

var q = new LinkList();

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
}

function frontAdd (o, f) {
    return function () {
        var n = f();
        n.next = o.head.next;
        o.head.next = n;
        try {
            n.next.previous = n;
        } catch (e) {
        }
        n.previous = o.head;
    }
}

function updateTail(o) {
    while(o.tail.next) {
        o.tail = o.tail.next;
    }
}

function backAdd (o, f) {
    return function () {
        var n = f();
        updateTail(q);
        o.tail.next = n;
        n.previous = o.tail;
        o.tail = n;
    }
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

function getValue () {
    var input = document.getElementsByTagName("input")[0];
    var value = input.value.trim();
    input.value = null;
    input.focus();
    return value;
}

function getNode () {
    var v = getValue();
    if (!!v) {
        return new Node(v)
    } else {
        alert("You haven't input anything!");
        return new Node("[ ]");
    }
}

function print() {
    var a = [];
    var head = this.head;
    while (head) {
        a.push(this.tail === head ? head.data + " (tail)" : head.data);
        head = head.next;
    }
}

addLoadEvent(buttonInit);