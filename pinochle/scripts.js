"use strict";

// Document elements and element arrays
const square    = document.querySelectorAll("#puzzle div");
const mark      = document.querySelectorAll(".square div");
const leftSide  = document.getElementById("leftSide");
const leftText  = document.getElementById("leftText");
const rightSide = document.getElementById("rightSide");
const rightText = document.getElementById("rightText");
const section   = document.querySelectorAll("#center section");
const singles   = document.getElementById("singles");
const mode      = document.querySelectorAll("#entry input");
const controls  = document.getElementById("controls");
const key       = document.querySelectorAll("#keypad div");
const back      = document.getElementById("back");
const next      = document.getElementById("next");
const finish    = document.getElementById("finish");
const test      = document.getElementById("test");

// Phases
const intro     = 0;
const enter     = 1;
const solve     = 2;

// Phase is the puzzle state
let phase       = intro;

// Puzzle entry modes
const manual    = 0;
const easy      = 1;
const medium    = 2;
const hard      = 3;

// Value is an array of Sudoku puzzle values from left to right, top to bottom, where 0 represents a blank square
const value     = Array(81).fill(0);

// Stack records the value(s) tried and index of each square as it is entered
const stack     = [];

// topIndex and topTried are the most recent index and value(s) tried
let topIndex    = 0;
let topTried    = [];

// Cursor and borderColor record the most recently selected square
let cursor      = 0;
let oldCursor   = 0;
let oldBorder   = "black lightgray lightgray black";

// Returns true if number n doesn't appear in the row, column or box of value[x]
function isUnused(x, n) {
    let r = x - x % 9;
    let c = x % 9;
    let b = r - r % 27 + c - c % 3;
    return value[r+0]!=n & value[r+1]!=n & value[r+2] !=n & value[r+3] !=n & value[r+4] !=n & value[r+5] !=n & value[r+6] !=n & value[r+7] !=n & value[r+8] !=n &
           value[c+0]!=n & value[c+9]!=n & value[c+18]!=n & value[c+27]!=n & value[c+36]!=n & value[c+45]!=n & value[c+54]!=n & value[c+63]!=n & value[c+72]!=n &
           value[b+0]!=n & value[b+1]!=n & value[b+2] !=n & value[b+9] !=n & value[b+10]!=n & value[b+11]!=n & value[b+18]!=n & value[b+19]!=n & value[b+20]!=n;
}

// Returns the number of unused numbers in the row, column or box of value[x]
function numUnused(x) {
    let num = 0;
    for (let n = 1; n <= 9; n++)
        if (isUnused(x, n))
            num++;
    return num;
}

// Enter number n into value[cursor] and save entry in stack
function doDigit(n) {
    if (value[cursor] == 0 && phase != intro && isUnused(cursor, n)) {
        value[cursor] = n;
        if (cursor == topIndex)
            stack.push([...topTried, n]);
        else
            stack.push([n]);
        stack.push(cursor);
        back.disabled = false;
        cursor++;
        if (cursor == 81)
            cursor = 0;
    }
}

// If auto singles is enabled, update blanks with only a single mark
function autoSingles() {
    if (singles.checked && phase == solve) {
        let x = 0;
        while (x < 81) {
            if (value[x] == 0 && numUnused(x) == 1) {
                cursor = x;
                for (let n = 1; n <= 9; n++) {
                    if (isUnused(x, n)) {
                        doDigit(n);
                        break;
                    }
                }
                x = 0;
                continue;
            }
            x++;
        }
    }
}

// If auto select is enabled, move cursor to the first blank with the fewest marks
function autoSelect() {
    if (phase == solve) {
        let min = 10;
        for (let x = 0; x < 81; x++) {
            if (value[x] == 0 && numUnused(x) < min) {
                min = numUnused(x);
                cursor = x;
            }
        }
    }
}

// Do backspace: pop stack; set cursor; erase value; repeat for singles if enabled
function doBack() {
    if (stack.length > 0 ) {
        topIndex = stack.pop();
        topTried = stack.pop();
        cursor = topIndex;
        value[cursor] = 0;
        while (singles.checked && stack.length > 0 && numUnused(cursor) == 1) {
            topIndex = stack.pop();
            topTried = stack.pop();
            cursor = topIndex;
            value[cursor] = 0;
        }
        if (stack.length == 0)
            back.disabled = true;
    }
}

// Do next: if blank with no marks (pink), go back; otherwise enter first (or last) untried mark; if none, go back;
function doNext(from = 1, to = 9, step = 1) {
    if (value[cursor] != 0 || phase != solve)
        return;
    if (numUnused(cursor) == 0) {
        doBack();
        return;
    }
    for (let n = from; n != to + step; n += step) {
        if (isUnused(cursor, n)) {
            if (topTried.includes(n))
                continue;
            doDigit(n);
            autoSingles();
            autoSelect();
            return;
        }
    }
    doBack();
}

// Do puzzle: call doNext until puzzle is solved
function doFinish(from = 1, to = 9, step = 1) {
    const oldSingles = singles.checked;
    singles.checked = true;
    phase = solve;
    autoSelect();
    while (value[cursor] == 0)
        doNext(from, to, step);
    singles.checked = oldSingles;
}

// Shuffle an array in place and returns a reference to that array
function shuffle(array) {
    let currentIndex = array.length, randomIndex, temp;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
    }
    return array;
}

// Copy src array to dst array of equal length
function copy(dst, src) {
    for (let x = 0; x < src.length; x++)
        dst[x] = src[x];
}

// Returns true if src array differs from dst array of equal length
function differs(dst, src) {
    for (let x = 0; x < dst.length; x++)
        if (src[x] != dst[x])
            return true;
    return false;
}

// Generate a random 27-digit puzzle, solve it, then blank up to count random squares that won't change the solution
function generate(count) {
    const final = Array(81);
    const saved = Array(81);
    let offset;
    value.fill(0);
    for (let box of [0,30,60]) {
        offset = shuffle([0,1,2,9,10,11,18,19,20]);
        for (let n = 0; n < offset.length; n++)
            value[box + offset[n]] = n + 1;
    }
    doFinish();
    copy(final, value);
    offset = shuffle(Array.from(Array(81).keys()));
    for (let x = 0; x < 81; x++) {
        copy(saved, value);
        value[offset[x]] = 0;
        doFinish(1, 9, 1);
        if (differs(final, value)) {
            copy(value, saved);
            continue;
        }
        copy(value, saved);
        value[offset[x]] = 0;
        doFinish(9, 1, -1);
        if (differs(final, value)) {
            copy(value, saved);
            continue;
        }
        copy(value, saved);
        value[offset[x]] = 0;
        count--;
        if (count == 0)
            break;
    }
}

// Update squares based on values
function updateSquares() {
    let n;
    for (let x = 0; x < 81; x++) {
        square[x].style.backgroundColor = "transparent";        
        n = value[x];
        if (n == 0) {
            square[x].innerText = "";
            if (numUnused(x) == 0)
                square[x].style.backgroundColor = "pink";
        } else {
            square[x].innerText = n;
        }
    }
}

// Reset puzzle marks then, if solving, update them based on the puzzle values
function updateMarks() {
    let m;
    for (let x = 0; x < 81; x++) {
        for (let n = 1; n <= 9; n++) {
            m = x * 9 + n - 1;
            mark[m].innerText = "";
            mark[m].style.backgroundColor = "transparent";        
        }
        if (value[x] == 0 && phase == solve) {
            for (let n = 1; n <= 9; n++) {
                if (isUnused(x, n)) {
                    m = x * 9 + n - 1;
                    mark[m].innerText = n;
                    switch (numUnused(x)) {
                    case 1:
                        mark[m].style.backgroundColor = "lightgreen";
                        break;
                    case 2:
                        mark[m].style.backgroundColor = "yellow";
                    }
                }
            }
            if (x == topIndex) {
                for (let n of topTried) {
                    m = x * 9 + n - 1;
                    mark[m].innerText = "X";
                }
            }
        }
    }
}

// Update the prompt text based on the mode
function updateText() {
    switch (phase) {
    case intro:
        section[intro].style.display = "block";
        section[enter].style.display = "none";
        section[solve].style.display = "none";
        controls.style.display = "none";
        leftText.innerText = "Reload";
        rightText.innerText = "Start";
        rightSide.style.visibility = "visible";
        break;
    case enter:
        section[intro].style.display = "none";
        section[enter].style.display = "block";
        section[solve].style.display = "none";
        controls.style.display = "block";
        leftText.innerText = "Intro";
        rightText.innerText = "Solve";
        rightSide.style.visibility = "visible";
        break;
    case solve:
        section[intro].style.display = "none";
        section[enter].style.display = "none";
        section[solve].style.display = "block";
        controls.style.display = "block";
        leftText.innerText = "Enter";
        rightText.innerText = "";
        rightSide.style.visibility = "hidden";
        break;
    }
}

// Update the keys based on unused digits at value[cursor]
function updateKeys() {
    for (let n = 1; n <= 9; n++) {
        key[n-1].innerText = n;
        if (isUnused(cursor, n))
            key[n-1].style.color = "black";
        else
            key[n-1].style.color = "white";
        if (value[cursor] == 0 && numUnused(cursor) == 0)
            key[n-1].style.color = "pink";
    }
    if (cursor == topIndex) {
        for (let n of topTried)
            key[n-1].innerText = "X";
    }
}

// Reset the border at the old cursor, then set the cursor at square[x]
function updateBorders() {
    square[oldCursor].style.border = "1px solid"
    square[oldCursor].style.borderColor = oldBorder;
    oldBorder = getComputedStyle(square[cursor]).borderColor;
    oldCursor = cursor;
    square[cursor].style.border = "3px dashed black";
}

// Update the page display
function updatePage() {
    updateSquares();
    updateMarks();
    updateBorders();
    updateText();
    updateKeys();
}

// initialize javascript after window loads
window.onload = function() {
    for (let x = 0; x < 81; x++) {
        square[x].onclick = function() {
            cursor = x;
            updatePage();
        }
    }
    for (let k = 0; k < key.length; k++) {
        key[k].onclick = function() {
            doDigit(k + 1);
            autoSingles();
            autoSelect();
            updatePage();
        }
    }
    document.onkeydown = function(e) {
        switch (e.key) {
        case "Backspace":
        case "b":
        case "B":
            doBack();
            updatePage();
            break;
        case "n":
        case "N":
            doNext();
            updatePage();
            break;
        case "f":
        case "F":
            doFinish();
            updatePage();
            break;
        default:
            if (e.key >= "1" && e.key <= "9") {
                doDigit(e.key.charCodeAt() - "0".charCodeAt());
                autoSingles();
                autoSelect();
                updatePage();
            }
        }
    }
    leftSide.onclick = function() {
        switch (phase) {
        case intro:
            location.reload();
            break;
        case enter:
            phase = intro;
            updatePage();
            break;
        case solve:
            phase = enter;
            updatePage();
        }
    }
    rightSide.onclick = function() {
        let maxBlanks;
        switch (phase) {
        case intro:
            if (mode[manual].checked) {
                phase = enter;
                updatePage();
                break;
            }
            if (mode[easy].checked)
                maxBlanks = 20;
            if (mode[medium].checked)
                maxBlanks = 40;
            if (mode[hard].checked)
                maxBlanks = 81;
            generate(maxBlanks);
            phase = solve;
            stack.length = 0;
            topTried.length = 0;
            back.disabled = true;
            autoSingles();
            autoSelect();
            updatePage();
            break;
        case enter:
            phase = solve;
            updatePage();
        }
    }
    back.onclick = function() {
        doBack();
        updatePage();
    }
    next.onclick = function() {
        phase = solve;
        doNext();
        updatePage();
    }
    finish.onclick = function() {
        phase = solve;
        doFinish();
        updatePage();
    }
}
