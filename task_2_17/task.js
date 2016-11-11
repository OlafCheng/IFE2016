/* 数据格式演示
var aqiSourceData = {
  "北京": {
    "2016-01-01": 10,
    "2016-01-02": 10,
    "2016-01-03": 10,
    "2016-01-04": 10
  }
};
*/

// 用于对 DOM 结构完整性的等待
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

// 以下两个函数用于随机模拟生成测试数据
function getDateStr(dat) {
  var y = dat.getFullYear();
  var m = dat.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = dat.getDate();
  d = d < 10 ? '0' + d : d;
  return y + '-' + m + '-' + d;
}
function randomBuildData(seed) {
  var returnData = {};
  var dat = new Date("2016-01-01");
  var datStr = ''
  for (var i = 1; i < 92; i++) {
    datStr = getDateStr(dat);
    returnData[datStr] = Math.ceil(Math.random() * seed);
    dat.setDate(dat.getDate() + 1);
  }
  return returnData;
}

var aqiSourceData = {
  "北京": randomBuildData(500),
  "上海": randomBuildData(300),
  "广州": randomBuildData(200),
  "深圳": randomBuildData(100),
  "成都": randomBuildData(300),
  "西安": randomBuildData(500),
  "福州": randomBuildData(100),
  "厦门": randomBuildData(100),
  "沈阳": randomBuildData(500)
};

// 用于渲染图表的数据
var chartData = {};
Object.defineProperty(chartData,
  "length", {
    enumerable: false,
    get: function() {
      var len = 0;
      for (key in this){
        len++;
      }
      return len;
    }
})
/*
var chartData = {
  "title(Date)": value
}
*/

// 记录当前页面的表单选项
var pageState = {
  nowSelectCity: 0,
  nowGraTime: "day"
}

/**
 * 渲染图表
 */
function renderChart() {
  (function(){
    var r = document.getElementById("rectangle");
    while(true) {
      if (r.childNodes.length) {
        (function(){
          var o = r.childNodes[r.childNodes.length - 1];
          o.parentNode.removeChild(o);
        })();
      } else {
        break;
      }
    }
  })();
  var c = {};
  var a = [];
  initAqiChartData();
  var values = [];
  for (date in chartData) {
    c[date] = chartData[date];
    a.push(c[date]);
  }

  var max = Math.max.apply(Math, a);
  var maxHeight = 400;
  var unitWidth = 1;
  var standardWidth = unitWidth;
  var seperateWidth = 0.2 * unitWidth;
  switch (pageState.nowGraTime) {
    case "day":
      standardWidth = 0.8 * unitWidth;
      seperateWidth = 0.1 * unitWidth;
      break;
    case "week":
      standardWidth = 1.5 * unitWidth;
      break;
    default:
      standardWidth = 2 * unitWidth;
      seperateWidth = 0.4 * unitWidth;
      break;
  }
  var rec = document.getElementById("rectangle");

  for(key in c) {
    (function(){
      var d = drawRec(key, c[key])
      rec.appendChild(d);
    })()
  }

  function drawRec() {
    // 用匿名传参的方式, argu[0] == > time(title), argu[1] ==> value
    var t = arguments[0];
    var v = arguments[1];
    var p = v / max;
    var ov = undefined;
    var hl = 350;
    var ll = 50;
    if (v >= hl) {
      ov = 1;
    } else if (v <= ll) {
      ov = 0;
    } else {
      ov = (v - 50) / (hl - ll);
    }
    var rec = document.createElement("div");
    var r = ~~(255 * ov);
    var g = ~~(255 * (1 - ov));
    // 对 r 和 g 值的处理函数, 当位数少于两位时, 补齐
    function wrap(num) {
      var ox = num.toString(16)
      return num < 16 ? "0" + ox : ox;
    }

    var b = "#" + wrap(r) + wrap(g) +"00";
    if (v > hl) {
      b = "#000000";
    }
    var h = p * maxHeight;
    rec.style.height = h + "px";
    rec.style.width = standardWidth + "em";
    rec.style.marginRight = seperateWidth + "em";
    rec.style.backgroundColor = b;
    rec.setAttribute("title", (t + ": " + v));
    rec.style.top = maxHeight - h + "px";
    return rec;
  }
}

/**
 * 日、周、月的radio事件点击时的处理函数
 */
function graTimeChange() {
  // 确定是否选项发生了变化 
  var radios = document.getElementsByName("gra-time");
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked && radios[i].value !== pageState.nowGraTime) {
      pageState.nowGraTime = radios[i].value;
      renderChart();
      return;
    }
  }
}

/**
 * select发生变化时的处理函数
 */
pageState.nowSelectCity = document.getElementById("city-select").value;
 function citySelectChange() {
  // 确定是否选项发生了变化 
  // 设置对应数据
  var selectTable = document.getElementById("city-select");
  pageState.nowSelectCity = selectTable.value;
  // 调用图表渲染函数
  renderChart();
}

/**
 * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
 */
function initGraTimeForm() {
  var timeRadio = document.getElementsByName("gra-time");
  for (var i = 0; i < timeRadio.length; i++) {
    timeRadio[i].onclick = graTimeChange;
  }
}

/**
 * 初始化城市Select下拉选择框中的选项
 */
function initCitySelector() {
  // 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
  var selectTable = document.getElementById("city-select");
  for(id in aqiSourceData) {
    (function() {
      var option = document.createElement("option");
      var txt = document.createTextNode(id);
      option.appendChild(txt);
      selectTable.appendChild(option);
    })()
  }
  // 给select设置事件，当选项发生变化时调用函数citySelectChange
  selectTable.onchange = function(e) {
    citySelectChange();
  };
}

/**
 * 初始化图表需要的数据格式
 */
function initAqiChartData() {
  // 将原始的源数据处理成图表需要的数据格式
  var selectTable = document.getElementById("city-select");
  var maxHeight = 50;
  var maxWidth = 10;
  var city = selectTable.value;
  var time = pageState.nowGraTime;
  var result = null;
  switch (pageState.nowGraTime) {
    case "day":
      sortByDay();
      break;
    case "week":
      sortByWeek();
      break;
    case "month":
      sortByMonth();
      break;
    default:
      alert("Error: function initAqiChartData runs not correct.");
      break;
  }

  // 当 radio 选中的是 day 时, 调用这个函数
  function sortByDay(){
    result = aqiSourceData[city];
  }

  // 类比同上
  function sortByWeek(){
    var arr = aqiSourceData[city];
    var tmpObject = {};
    var successive = true;
    var value = 0;
    var length = 0;
    var time = "";
    for (date in arr) {
      (function(){
        if (successive) {
          successive = !successive;
          time = date;
          value = 0;
          length = 0;
        }
        value += arr[date];
        length++;
        tmpObject[time] = ~~(value / length);
        var t = new Date(date);
        if (t.getDay() == 0) {
          successive = !successive;
        }
      })();
    }
    result = tmpObject;
  }

  function sortByMonth(){
    var a = aqiSourceData[city];
    var o = {};
    var s = true;
    var length = 0;
    var value = 0;
    var t = "";
    var m = "";
    var currentMonth = "";
    for (date in a) {
      (function(){
        if (s) {
          s = !s;
          value = 0;
          length = 0;
          m = new Date(date);
          currentMonth = m.getMonth();
        }
        value += a[date];
        length++;
        var t = new Date(date);
        var seccedTime = new Date("2016-" + (t.getMonth() + 1)+ "-" + (t.getDate() + 1));
        if (seccedTime.getMonth() !== currentMonth) {
          s = !s;
          var month = currentMonth > 8 ? currentMonth + 1 : "0" + (currentMonth + 1);
          o[m.getFullYear() + "-" + month] = ~~(value / length);
        }
      })();
    }
    result = o;
  }

  // 处理好的数据存到 chartData 中
  chartData = result;
}

/**
 * 初始化函数
 */
function init() {
  initGraTimeForm()
  initCitySelector();
  initAqiChartData();
  // sampleAnimation();
}

addLoadEvent(init);