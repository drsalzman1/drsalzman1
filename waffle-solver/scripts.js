"use strict";

// Page values
let page = 0;
const pageTag = [
    "Reset",
    "Entry",
    "Swap 1",
    "Swap 2",
    "Swap 3",
    "Swap 4",
    "Swap 5",
    "Swap 6",
    "Swap 7",
    "Swap 8",
    "Swap 9",
    "Swap 10",
    "Final"
];

// Color constants
const gry = "#EDEFF1";
const gld = "#E9BA3A";
const grn = "#6FB05C";
const blk = "#000000";
const wht = "#FFFFFF";

// Tile colors
const tileColor = [
    grn, gry, gry, gry, grn,
    gry,      gry,      gry,
    gry, gry, grn, gry, gry,
    gry,      gry,      gry,
    grn, gry, gry, gry, grn
];

// Tile values
const tiles = 21;
const tileValue = [
    "", "", "", "", "",
    "",     "",     "",
    "", "", "", "", "",
    "",     "",     "",
    "", "", "", "", ""
];

// Text entry values
const keys = 27;
const backSpace = 26;
let cursor = 0;

document.getElementById("leftButton").onclick = function() {
    location.reload();
};

document.getElementById("rightButton").onclick = function() {
    document.getElementById("prompt").innerHTML = "Right";
};

window.onload = function() {
    const tileElement = document.querySelectorAll("#puzzle button");
    for (let tile = 0; tile < tiles; tile++) {
        tileElement[tile].onclick = function() {
            document.getElementById("left").style.visibility = "visible";
            switch (tileColor[tile]) {
                case gry:
                    tileElement[tile].style.backgroundColor = gld;
                    tileElement[tile].style.borderColor = gld;
                    tileElement[tile].style.color = wht;
                    tileColor[tile] = gld;
                    break;
                case gld:
                    tileElement[tile].style.backgroundColor = grn;
                    tileElement[tile].style.borderColor = grn;
                    tileElement[tile].style.color = wht;
                    tileColor[tile] = grn;
                    break;
                case grn:
                    tileElement[tile].style.backgroundColor = gry;
                    tileElement[tile].style.borderColor = gry;
                    tileElement[tile].style.color = blk;
                    tileColor[tile] = gry;
            }
        };
    };
    const keyElement = document.querySelectorAll("#keyboard button");
    for (let key = 0; key < keys; key++) {
        keyElement[key].onclick = function() {
            if (key == backSpace && cursor > 0) {
                cursor -= 1;
                tileValue[cursor] = "";
                tileElement[cursor].innerHTML = "";
                document.getElementById("right").style.visibility = "hidden";
            } else if (key < backSpace && cursor < tiles) {
                tileValue[cursor] = keyElement[key].innerHTML;
                tileElement[cursor].innerHTML = keyElement[key].innerHTML;
                cursor += 1;
                document.getElementById("left").style.visibility = "visible";
                if (cursor == tiles) document.getElementById("right").style.visibility = "visible";
            };
        };
    };
    document.onkeydown = function(e) {
        if (e.key == "Backspace" && cursor > 0) {
            cursor -= 1;
            tileValue[cursor] = "";
            tileElement[cursor].innerHTML = "";
            document.getElementById("right").style.visibility = "hidden";
        } else if (e.key.length == 1 && e.key.toUpperCase() >= "A" && e.key.toUpperCase() <= "Z" && cursor < tiles) {
            tileValue[cursor] = e.key.toUpperCase();
            tileElement[cursor].innerHTML = e.key.toUpperCase();
            cursor += 1;
            document.getElementById("left").style.visibility = "visible";
            if (cursor == tiles) document.getElementById("right").style.visibility = "visible";
        };
    };    
};