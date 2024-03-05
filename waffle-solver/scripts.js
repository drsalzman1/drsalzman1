"use strict";

// Color constants
const brn = 0xBF7F3F;
const tan = 0xE9D3BD;
const blk = 0x000000;
const red = 0x9E0000;
const gry = 0x606060;

// Row constants
const minR = 1;
const maxR = 8;

// Cell constants
const CC = 0;
const BP = 1;
const BK = 2;
const RP = 3;
const RK = 4;

// Cell images
const cellImg = [
    "images/cc.svg",
    "images/bp.svg",
    "images/bk.svg",
    "images/rp.svg",
    "images/rk.svg"
];

// newGame[p] = initial cell value for position p
const newGame = [0
    , BP, BP, BP, BP,
    BP, BP, BP, BP
    , BP, BP, BP, BP,
    CC, CC, CC, CC
    , CC, CC, CC, CC,
    RP, RP, RP, RP
    , RP, RP, RP, RP,
    RP, RP, RP, RP
];

// Move, Jump and Slide constants
const none = 0;
const minM = 1;
const minJ = 1;
const maxJ = 72;
const minS = 73;
const maxS = 170;
const maxM = 170;

// Position constants
const minP = 1;
const maxP = 32;

// row[p] = row # for position p
const row = [
    0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8
];

// col[p] = column # for position p
const col = [
    0, 2, 4, 6, 8, 1, 3, 5, 7, 2, 4, 6, 8, 1, 3, 5, 7, 2, 4, 6, 8, 1, 3, 5, 7, 2, 4, 6, 8, 1, 3, 5, 7
];

// pos[(r - 1) * 8 + (c - 1)) = postion # for row r, column c
const pos = [
    0,  1,  0,  2,  0,  3,  0,  4,
    5,  0,  6,  0,  7,  0,  8,  0,
    0,  9,  0, 10,  0, 11,  0, 12,
   13,  0, 14,  0, 15,  0, 16,  0,
    0, 17,  0, 18,  0, 19,  0, 20,
   21,  0, 22,  0, 23,  0, 24,  0,
    0, 25,  0, 26,  0, 27,  0, 28,
   29,  0, 30,  0, 31,  0, 32,  0
];

// src[m] = position # for source of potential move m
const src = [
    0,  1,  2,  2,  3,  3,  4,  5,  6,  6,  7,  7,  8,  9,  9, 10, 10, 10, 10, // Moves 0 to 18
   11, 11, 11, 11, 12, 12, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 16, 16, 17, // Moves 19 to 37
   17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 21, 21, 22, 22, 22, 22, 23, 23, // Moves 38 to 56
   23, 23, 24, 24, 25, 26, 26, 27, 27, 28, 29, 30, 30, 31, 31, 32,  1,  1,  2, // Moves 57 to 75
    2,  3,  3,  4,  5,  5,  6,  6,  6,  6,  7,  7,  7,  7,  8,  8,  8,  8,  9, // Moves 76 to 94
    9,  9,  9, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12, 13, 13, 14, 14, 14, 14, // Moves 95 to 113
   15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, // Moves 114 to 132
   19, 20, 20, 21, 21, 22, 22, 22, 22, 23, 23, 23, 23, 24, 24, 24, 24, 25, 25, // Moves 133 to 151
   25, 25, 26, 26, 26, 26, 27, 27, 27, 27, 28, 28, 29, 30, 30, 31, 31, 32, 32  // Moves 152 to 170
];

// mid[m] = position # for middle of potential move m
const mid =  [
    0,  6,  7,  6,  8,  7,  8,  9, 10,  9, 11, 10, 11, 14,  6, 15, 14,  6,  7, // Moves 0  to 18
   16, 15,  7,  8, 16,  8, 17,  9, 18, 17,  9, 10, 19, 18, 10, 11, 19, 11, 22, // Moves 19 to 37
   14, 23, 22, 14, 15, 24, 23, 15, 16, 24, 16, 25, 17, 26, 25, 17, 18, 27, 26, // Moves 38 to 56
   18, 19, 27, 19, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27,  6,  5,  7, // Moves 57 to 75
    6,  8,  7,  8,  9,  1, 10,  9,  1,  2, 11, 10,  2,  3, 12, 11,  3,  4, 14, // Moves 76 to 94
   13,  5,  6, 15, 14,  6,  7, 16, 15,  7,  8, 16,  8, 17,  9, 18, 17,  9, 10, // Moves 95 to 113
   19, 18, 10, 11, 20, 19, 11, 12, 22, 21, 13, 14, 23, 22, 14, 15, 24, 23, 15, // Moves 114 to 132
   16, 24, 16, 25, 17, 26, 25, 17, 18, 27, 26, 18, 19, 28, 27, 19, 20, 30, 29, // Moves 133 to 151
   21, 22, 31, 30, 22, 23, 32, 31, 23, 24, 32, 24, 25, 25, 26, 26, 27, 27, 28  // Moves 152 to 170
];

// dst[m] = position # for destination of potential move m
const dst = [
    0, 10, 11,  9, 12, 10, 11, 14, 15, 13, 16, 14, 15, 18,  2, 19, 17,  1,  3, // Moves 0 to 18
   20, 18,  2,  4, 19,  3, 22,  6, 23, 21,  5,  7, 24, 22,  6,  8, 23,  7, 26, // Moves 19 to 37
   10, 27, 25,  9, 11, 28, 26, 10, 12, 27, 11, 30, 14, 31, 29, 13, 15, 32, 30, // Moves 38 to 56
   14, 16, 31, 15, 18, 17, 19, 18, 20, 19, 22, 21, 23, 22, 24, 23,  6,  5,  7, // Moves 57 to 75
    6,  8,  7,  8,  9,  1, 10,  9,  1,  2, 11, 10,  2,  3, 12, 11,  3,  4, 14, // Moves 76 to 94
   13,  5,  6, 15, 14,  6,  7, 16, 15,  7,  8, 16,  8, 17,  9, 18, 17,  9, 10, // Moves 95 to 113
   19, 18, 10, 11, 20, 19, 11, 12, 22, 21, 13, 14, 23, 22, 14, 15, 24, 23, 15, // Moves 114 to 132
   16, 24, 16, 25, 17, 26, 25, 17, 18, 27, 26, 18, 19, 28, 27, 19, 20, 30, 29, // Moves 133 to 151
   21, 22, 31, 30, 22, 23, 32, 31, 23, 24, 32, 24, 25, 25, 26, 26, 27, 27, 28  // Moves 152 to 170
];

// Global state variables
let cell = [...newGame];            // cell[p] = current cell value for position p
let redTurn = false;                // redTurn is true when it's the red player's turn
let redComp = true;                 // redComp is true when the computer is playing red
let blkComp = false;                // blkComp is true when the computer is playing black
let maxDepth = 3;                   // Maximum look-ahead depth when looking for best move
let minDelay = 20;                  // minimum delay before computer makes move
let blacks = 12;                    // black checkers remaining on the board
let reds = 12;                      // red checkers remaining on the board
let checkers = 24;                  // checkers remaining on board
let noChange = 0;                   // runs with no change in checkers

// Global BestM variables
let saveN1 = new Array(maxM + 1);   // Best first-level net score for each possible move
let bestM1 = none;                  // Best first-level move

// Global drag and drop variables
let pickX = 0;                      // Pick point X coordinate
let pickY = 0;                      // Pick point Y coordinate
let pickedP = 0;                    // Picked cell's position
let pickedN = null;                 // Picked cell's DOM node
let pickedX = 0;                    // Picked cell's X coordinate
let pickedY = 0;                    // Picked cell's Y coordinate
let pickedL = "";                   // Picked cell's left style
let pickedT = "";                   // Picked cell's top style
let pickedD = 0;                    // Picked cell's drop position

// Return next move based on the previous move. Moves are ordered by jumps followed by slides.
// If the previous move is omitted, return the first jump. If there are no jumps, return the first slide. If there are no jumps or slides, return none.
// If the previous move was a jump, return the next jump. If there are no more jumps, return none.
// If the previous move was a slide, return the next slide. If there are no more slides, return none.
function nextM (prevM = none) {
    let srcP, midP, dstP, srcC, midC, dstC;
    if (prevM == maxJ) return none;
    let testM = prevM + 1;
    while (testM <= maxM) {
        srcP = src[testM]; midP = mid[testM]; dstP = dst[testM];
        srcC = cell[srcP]; midC = cell[midP]; dstC = cell[dstP];
        if (dstC == CC) {
            if (redTurn) {
                if (srcC == RP) {
                    if (dstP < srcP) {
                        if (testM > maxJ) return (testM);
                        else if (midC == BP || midC == BK) return testM;
                    };
                } else if (srcC == RK) {
                    if (testM > maxJ) return (testM);
                    else if (midC == BP || midC == BK) return testM;
                }
            } else {
                if (srcC == BP) {
                    if (dstP > srcP) {
                        if (testM > maxJ) return (testM);
                        else if (midC == RP || midC == RK) return testM;
                    }
                }
                else if (srcC == BK) {
                    if (testM > maxJ) return (testM);
                    else if (midC == RP || midC == RK) return testM;
                }
            };
        };
        if (prevM != none && testM == maxJ) return none;
        testM++;
    };
    return none;
};

// Take move m by updating the board, adjusting scores, and often swapping the player turn
function takeM(m) {
    cell[dst[m]] = cell[src[m]];
    cell[src[m]] = CC;
    if (redTurn && row[dst[m]] == minR) cell[dst[m]] = RK;
    if (!redTurn && row[dst[m]] == maxR) cell[dst[m]] = BK;
    if (m >= minJ && m <= maxJ) {
        switch (cell[mid[m]]) {
            case RP: case RK: reds--; break;
            case BP: case BK: blacks--; break;
        };
        cell[mid[m]] = CC;
        let n = nextM();
        while (n >= minJ && n <= maxJ) {
            if (src[n] == dst[m]) return;
            n = nextM(n);
        };
    };
    redTurn = !redTurn;
};

// Calculate net score from red's perspective or black's perspective
function netScore(redView) {
    if (redView) return reds - blacks;
    else return blacks - reds;
};

// Recursively find the best next move (and the resulting scores if not the first level)
function bestM(depth = 1) {
    // save incoming state
    const cell0 = [...cell];
    const redTurn0 = redTurn;
    const blacks0 = blacks;
    const reds0 = reds;
    // initialize best net score, black score, red score, move, and turn
    let saveN = new Array(maxM + 1); saveN.fill(-999);
    let saveB = new Array(maxM + 1); saveB.fill(-999);
    let saveR = new Array(maxM + 1); saveR.fill(-999);
    let bestN = -999;
    let hitsN = 0;
    // Save the results of each possible move
    let m = nextM();
    while (m != none) {
        // Take this move and the best next move (recursively)
        takeM(m);
        if (depth < maxDepth) bestM(depth + 1);
        // Save the results, find the best net score, and count hits
        saveN[m] = netScore(redTurn0);
        saveB[m] = blacks;
        saveR[m] = reds;
        if (saveN[m] > bestN) { bestN = saveN[m]; hitsN = 1 }
        else if (saveN[m] == bestN) hitsN++;
        // Restore the incoming state
        cell = [...cell0];
        redTurn = redTurn0;
        blacks = blacks0;
        reds = reds0;
        // advance to the next move
        m = nextM(m);
    };
    // Pick move randomly from the moves with the most hits
    m = none;
    if (hitsN != 0) {
        let pick = Math.floor(Math.random() * hitsN); // random integer between 0 and hitsN - 1
        m = nextM();
        while (m != none) {
            if (saveN[m] == bestN) {
                if (pick == 0) break;
                pick--;
            };
            m = nextM(m);
        };
    };
    // Save best first-level move
    if (depth == 1) {
        bestM1 = m;
        saveN1 = [...saveN];
    };
    // Return best move (and the resulting scores if not the first level)
    if (depth != 1 && m != none) {
        blacks = saveB[m];
        reds = saveR[m];
    };
    return m;
};

function display() {
    const b = document.querySelectorAll("#board img");
    for (let p = minP; p <= maxP; p++) {
        b[p].src = cellImg[cell[p]];
    };
};

function doComputer(t = 0) {
    document.getElementById("prompt").innerHTML += ".";
    if (t == 0) takeM(bestM());
    if (t < minDelay) setTimeout(doComputer, 100, t + 1);
    else run();
};

function run() {
    const prompt = document.getElementById("prompt");
    display();
    if (checkers > blacks + reds) {
        checkers = blacks + reds;
        noChange = 0;
    } else {
        noChange++;
    }
    if (reds == 0) prompt.innerHTML = "Black wins: black jumped red's last checker.";
    else if (blacks == 0) prompt.innerHTML = "Red wins: red jumped black's last checker.";
    else if (noChange == 50) prompt.innerHTML = "Draw game: score unchanged for 50 moves.";
    else if (redTurn && nextM() == none) prompt.innerHTML = "Draw game: red has no moves.";
    else if (!redTurn && nextM() == none) prompt.innerHTML = "Draw game: black has no moves.";
    else if (!blkComp && !redTurn && nextM() > maxJ) prompt.innerHTML = "Black: Please slide a black checker.";
    else if (!blkComp && !redTurn && nextM() <= maxJ) prompt.innerHTML = "Black: Please jump a red checker.";
    else if (!redComp && redTurn && nextM() > maxJ) prompt.innerHTML = "Red: Please slide a red checker.";
    else if (!redComp && redTurn && nextM() <= maxJ) prompt.innerHTML = "Red: Please jump a black checker.";
    else {
        prompt.innerHTML = "Calculating.";
        setTimeout(doComputer, 0); // call doComputer after display() is complete
    };
};

document.getElementById("refresh").onclick = function() {
    cell = [...newGame];
    redTurn = false;
    blacks = 12;
    reds = 12;
    checkers = 24;
    noChange = 0;
    run();
};

document.getElementById("settings").onclick = function() {
    const f = document.getElementById("footer");
    if (f.style.display == "block") {
        f.style.display = "none";
    } else {
        f.style.display = "block";
    };
};

document.getElementById("none").onclick = function() {
    blkComp = false;
    redComp = false;
    run();
};

document.getElementById("black").onclick = function() {
    blkComp = true;
    redComp = false;
    run();
};

document.getElementById("red").onclick = function() {
    blkComp = false;
    redComp = true;
    run();
};

document.getElementById("both").onclick = function() {
    blkComp = true;
    redComp = true;
    run();
};

document.getElementById("difficulty").onchange = function() {
    maxDepth = document.getElementById("difficulty").value;
};

document.getElementById("delay").onchange = function() {
    minDelay = document.getElementById("delay").value;
};

function calcP (x, y) {
    const b = document.getElementById("board");
    const c = Math.trunc((x - b.offsetLeft) / (b.offsetWidth / 8));
    const r = Math.trunc((y - b.offsetTop) / (b.offsetHeight / 8));
    return pos[r * 8 + c];
};

function pick(event) {
    event.preventDefault();
    if (event.target.outerHTML == '<img src="images/board.svg">') return;
    if (event.clientX) {
        pickX = event.clientX;
        pickY = event.clientY;
    } else {
        pickX = event.changedTouches[0].clientX;
        pickY = event.changedTouches[0].clientY;
    }
    pickedP = calcP(pickX, pickY)
    pickedN = event.target;
    pickedN.style.zIndex = 1;
    pickedX = pickedN.offsetLeft;
    pickedY = pickedN.offsetTop;
    pickedL = pickedN.style.left;
    pickedT = pickedN.style.top;
};

function move(event) {
    let moveX, moveY;
    event.preventDefault();
    if (pickedN) {
        if (event.clientX) {
            moveX = event.clientX;
            moveY = event.clientY;
        } else {
            moveX = event.changedTouches[0].clientX;
            moveY = event.changedTouches[0].clientY;
        };
        pickedN.style.left = pickedX + moveX - pickX + "px";
        pickedN.style.top = pickedY + moveY - pickY + "px";
    };
};

function drop(event) {
    let dropX, dropY;
    event.preventDefault();
    if (pickedN) {
        if (event.clientX) {
            dropX = event.clientX;
            dropY = event.clientY;
        } else {
            dropX = event.changedTouches[0].clientX;
            dropY = event.changedTouches[0].clientY;
        }
        pickedD = calcP (dropX, dropY);
        pickedN.style.left = pickedL;
        pickedN.style.top = pickedT;
        pickedN.style.zIndex = 0;
        pickedN = null;
        let m = nextM();
        while (m != none) {
            if (src[m] == pickedP && dst[m] == pickedD) {
                takeM(m);
                run();
                break;
            };
            m = nextM(m);
        };
    };
};

window.onload = function() {
    const b = document.querySelectorAll("#board img");
    for (let i = 0; i < b.length; i++) {
        b[i].onmousedown = pick;
        b[i].ontouchstart = pick;
        b[i].onmousemove = move;
        b[i].ontouchmove = move;
        b[i].onmouseup = drop;
        b[i].ontouchend = drop;
    };
    run();
};