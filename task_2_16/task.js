/**
 * window.onload
 * 避免 init() 函数在 DOM 渲染好以前就执行而出错
 */ 
function addLoadEvent(func) {
    var oldLoad = window.onload;
    if (typeof window.onload != "function") {
        window.onload = func;
    } else {
        window.onload = function() {
            oldLoad();
            func();
        };
    }
}

/**
 * aqiData, 存储用户输入的空气指数数据
 * 示例格式：
 * aqiData = {
 *    "北京": 90,
 *    "上海": 40
 * };
 */
var aqiData = {};

/**
 * 从用户输入中获取数据，向aqiData中增加一条数据
 * 然后渲染aqi-list列表，增加新增的数据
 */
function addAqiData(name, value) {
    aqiData[name] = value;
}

function removeAllChildren(o) {
    var l = null;
    var c = null;
    while(1) {
        l = o.childNodes.length;
        c = o.childNodes[l - 1 > 0 ? l - 1 : 0];
        if (l) {
            c.parentNode.removeChild(c);
        } else {
            break;
        }
    }
}

/**
 * 渲染aqi-table表格
 */
function renderAqiList() {
    var table = document.getElementById("aqi-table");
    // 在渲染以前, 先清除所有已经存在的子节点
    removeAllChildren(table);
    table.appendChild(drawTr());

    var key = null;
    for (key in aqiData) {
        table.appendChild(drawTr(key, aqiData[key], true));
    }

    // 默认值的方式传参
    function drawTr() {
        var t0 = arguments[0] || "城市";
        var t1 = arguments[1] || "空气质量";
        var t2 = arguments[2] || "操作";

        var tr = document.createElement("tr");
        tr.appendChild(drawTd(t0));
        tr.appendChild(drawTd(t1));
        tr.appendChild(drawTd(t2));
        return tr;
    }


    function drawTd(o) {
        var td = document.createElement("td");
        var inner = null;
        var button = document.createElement("button");
        button.appendChild(document.createTextNode("删除"));
        button.onclick = delBtnHandle;
        var txt = {};
        if (typeof o === "boolean") {
            inner = button;
        } else {
            txt = document.createTextNode(o);
            inner = txt;
        }
        td.appendChild(inner);
        return td;
    }
}

/**
 * 点击add-btn时的处理逻辑
 * 获取用户输入，更新数据，并进行页面呈现的更新
 */
function addBtnHandle() {
    var aqiCity = document.getElementById("aqi-city-input");
    var aqiValue = document.getElementById("aqi-value-input");
    var name = aqiCity.value.trim();
    var value = aqiValue.value.trim();
    var condition = name.length
                    && value.length
                    && !name.match(/[^a-zA-Z ]/g)
                    && !value.match(/[^0-9]/g);
    // 检查输入
    if (condition) {
        addAqiData(name, value);
        aqiCity.value = null;
        aqiValue.value = null;
        renderAqiList();
    } else {
        alert("There's something wrong with the information you just input.");
    }
}

/**
 * 点击各个删除按钮的时候的处理逻辑
 * 获取哪个城市数据被删，删除数据，更新表格显示
 */
function delBtnHandle() {
  delete aqiData[this.parentNode.parentNode.childNodes[0].innerHTML];
  renderAqiList();
}

function init() {
    // 在这下面给add-btn绑定一个点击事件，点击时触发addBtnHandle函数
    var button = document.getElementById("button");
    button.onclick = addBtnHandle;
}

addLoadEvent(init);