// 构造函数, 不返回值, 用于生成反向链表
function reverseLinkList () {
    this.head = new Node("head");
    this.tail = this.head;
    this.addNode = addNode;
    this.delNode = delNode;
    this.print = print;
}
// s : string
function Node (s) {
    this.data = s;
    this.previous = null;
    this.next = null;
}

// addNode(o, value)
// o : Object
// v : String
// excepted return: Blooean(判断插入是否成功)
function addNode(o, v) {
    // 对值进行检查
    // 如果有重复的值, 则不插入
    var c = o.head;
    while(c.next) {
        if(c.next.data == v) {
            console.log("有重复的值, 不插入新的值");
            return false;
        }
        c = c.next;
    }

    var n = new Node(v);
    n.next = o.head.next;
    o.head.next = n;
    return true;
}

// delNode(o, nodeValue)
// o : object
// v : string
// excepted return : Blooean
function delNode(o, v) {
    // 如果检测到相同的值, 删除这个节点
    var c = o.head;
    while(c.next) {
        if (c.next.data == v) {
            c.next.previous = c;
            c.next = c.next.next;
            return true;
            break;
        }
        c= c.next;
    }
    return false;
}

// print(object)
// o : Object
// return : Array
function print(o) {
    // 从 head 开始打印一个数组
    var r = [];
    var c = o.head;
    while(c.next) {
        r.push(c.next.data);
    }
    return r;
}

// f : function
function addLoadEvent(f) {
    var oldLoad = window.onload;
    if (typeof oldLoad !== "function") {
        window.onload = f;
    } else {
        window.onload = function() {
            oldLoad();
            f();
        }
    }
}

var tags = new reverseLinkList();

$ = function(selector) {
    return document.querySelectorAll(selector);
}

// o : HTMLCollection
function removeAllChildren(o) {
    while(o.firstChild) {
        o.removeChild(o.firstChild);
    }
}

function tagsInit() {
    var keyCodes = {
        13: "",
        32: "",
        188: "",
    };
    var input = $("#tags")[0];
    input.addEventListener("keyup", function(e){
        if (e.keyCode in keyCodes) {
            var v = input.value.trim();
            if (addNode(tags, v)) {
                tagsToRender();
                input.value = "";
                input.focus();
            } else {
                alert("有重复的值!");
                console.log("addNode failed!");
            }
        }
    });
}

function tagsToRender() {
    var count = 0;
    var c = tags.head;
    var p = $("#tags-container")[0];
    removeAllChildren(p);
    while(count < 10) {
        if (c.next) {
            addTag(p, c.next.data);
            c = c.next;
            count++;
        } else {
            console.log("print from head to tail");
            break;
        }
    }
}

// c : object, parent node of new div
// v : string
function addTag(c, v) {
    var btnTxt = document.createTextNode("删除标签");
    var btn = document.createElement("span");
    btn.addEventListener("click", function(e){
        delTag(e.target.nextSibling.textContent);
    });
    btn.appendChild(btnTxt);

    var txt = document.createTextNode(v);
    var div = document.createElement("div");
    div.addEventListener("mouseenter", function(){
        div.insertBefore(btn, div.lastChild);
    });
    div.addEventListener("mouseleave", function(){
        div.removeChild(div.firstChild);
    });
    div.appendChild(txt);

    if (!c.firstChild) {
        c.appendChild(div);
    } else {
        c.insertBefore(div, c.firstChild);
    }
}

// s : string
function delTag(s) {
    delNode(tags, s);
    tagsToRender();
}

var favorites = new reverseLinkList();

// 兴趣爱好这里也按照上面的来添加新的标签
var separator = /[\n、,， (\n\r)]/g;

function favBtnInit() {
    var button = $("#ensure-favorites")[0];
    button.addEventListener("click", function(){
        if (addFavorites()) {
        } else {
            alert("insert failed!");
        }
    });
}

function addFavorites() {
    var textArea = $("textarea")[0];
    var txt = textArea.value;
    var v = txt.split(separator).filter(function(e){return e.length});;
    if (v.join("")) {
        for (var i = 0; i < v.length; i++) {
            if (v[i].length) {
                addNode(favorites, v[i]);
            }
        }
        renderFav();
        return true;
    } else {
        console.log("Please input correct value.");
        return false;
    }
}

function renderFav() {
    var fav = $("#favorite")[0];
    removeAllChildren($("#favorite")[0]);

    var c = favorites.head;
    var count = 0;
    while(count < 10) {
        if (c.next) {
            renderFavTag(fav, c.next.data);
            c = c.next;
            count++;
        } else {
            break;
        }
    }
    if (count === 10) {
        c.next = null;
    }
}

function renderFavTag (o, s) {
    var txt = document.createTextNode(s);
    var div = document.createElement("div");
    div.appendChild(txt);

    if (!o.firstChild) {
        o.appendChild(div);
    } else {
        o.insertBefore(div, o.firstChild);
    }
}

addLoadEvent(tagsInit);
addLoadEvent(favBtnInit);