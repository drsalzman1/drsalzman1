"use strict";

// document elements and element arrays
const square        = document.querySelectorAll("#puzzle div");
const note          = document.querySelectorAll("#notes div");
const mark          = document.querySelectorAll(".square div");
const text          = document.querySelectorAll("#text div");
const key           = document.querySelectorAll("#keypad div");
const mode          = document.querySelectorAll("#mode input");
const test          = document.getElementById("test");
const option        = document.querySelectorAll("#options input");
const restart       = document.getElementById("restart");
const save          = document.getElementById("save");
const recall        = document.getElementById("recall");
const finish        = document.getElementById("finish");

// entry modes
const introduction  = 0;
const copySquares   = 1;
const enterMarks    = 2;
const enterSquares  = 3;

// automation options
const autoMark      = 0;
const autoShade     = 1;
const autoEnter     = 2;

// initialize javascript after window loads
window.onload = function() {
    let cursor = 0;
    let borderColor = "black lightgray lightgray black";
    let entryMode = introduction;
    let checked = [true, false, false, false];
    for (let s = 0; s < square.length; s++) {
        square[s].onclick = function() {
            square[cursor].style.border = "1px solid"
            square[cursor].style.borderColor = borderColor;
            borderColor = getComputedStyle(square[s]).borderColor;
            square[s].style.border = "2px dashed black";
            cursor = s;
        }
    }
    for (let k = 0; k < key.length; k++) {
        key[k].onclick = function() {
            let value = k + 1 + "";
            switch (entryMode) {
            case copySquares:
            case enterSquares:
                for (let m = cursor * 9; m < cursor * 9 + 9; m++)
                    mark[m].innerText = "";
                if (square[cursor].innerText == value)
                    value = "";
                square[cursor].innerText = value;
                break;
            case enterMarks:
                square[cursor].innerText = "";
                let m = cursor * 9 + value.charCodeAt() - "1".charCodeAt();
                if (mark[m].innerText == value)
                    value = "";
                mark[m].innerText = value;
            }
        }
    }
    document.onkeydown = function(e) {
        let value = e.key;
        if (value < "1" || value > "9")
            return;
        switch (entryMode) {
        case copySquares:
        case enterSquares:
            for (let m = cursor * 9; m < cursor * 9 + 9; m++)
                mark[m].innerText = "";
            if (square[cursor].innerText == value)
                value = "";
            square[cursor].innerText = value;
            break;
        case enterMarks:
            square[cursor].innerText = "";
            let m = cursor * 9 + value.charCodeAt() - "1".charCodeAt();
            if (mark[m].innerText == value)
                value = "";
            mark[m].innerText = value;
        }
    }
    for (let m = 0; m < mode.length; m++) {
        mode[m].onclick = function() {
            entryMode = m;
            for (let t = 0; t < text.length; t++)
                text[t].style.display = "none";
            text[m].style.display = "inline";
        }
    }
    for (let o = 0; o < option.length; o++) {
        option[o].onclick = function() {
            checked[o] = option[o].checked;
        }
    }
    restart.onclick = function() {
        location.reload();
    }
    save.onclick = function() {
        test.innerText = "Save";
    }
    recall.onclick = function() {
        test.innerText = "Recall";
    }
    finish.onclick = function() {
        test.innerText = "Finish";
    }
}
