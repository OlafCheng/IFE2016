function addLoadEvent(f) {
    var oldLoad = window.onload;
    if (typeof window.onload !== "function") {
        window.onload = f;
    } else {
        window.onload = function() {
            oldLoad();
            f();
        };
    }
}

$ = function(e) {
    return document.querySelectorAll(e);
}

function highLight() {
    var txt = $("textarea")[0].value;
    var input = $("input")[0];
    var v = input.value;
    var p = $("p")[0];
    var s = new RegExp(v, "gi");
    if (!v.trim().length) {
        p.innerHTML = "";
        return false;
    }
    p.innerHTML = txt.split(/\b/g).map(function(v) {return s.test(v) ? "<span class = 'red'>" + v + "</span>" : v;}).join("");
    input.focus();

}

function addButtonEvent() {
    var btn = $("button")[0];
    btn.addEventListener("click", highLight);
}

function initTextarea() {
    var defaulText = $("p")[1].innerHTML;
    var textarea = $("textarea")[0];
    var defaultColor = "#999";
    var input = $("input")[0];
    textarea.style.color = defaultColor;
    textarea.value = defaulText;
    textarea.addEventListener("focus", function() {
        if (textareaState.init) {
            textarea.value = "";
            textarea.style.color = "black";
            textareaState.init = false;
        }
    });
    textarea.addEventListener("blur", function(){
        if (!textareaState.init && !textarea.value) {
            textarea.value = defaulText;
            textarea.style.color = defaultColor;
            textareaState.init = true;
        }
    });
    input.addEventListener("keyup", function(e){
        if (e.keyCode === 13) {
            highLight();
        }
    });
}

var textareaState = {
    init: true
};

addLoadEvent(addButtonEvent);
addLoadEvent(initTextarea);