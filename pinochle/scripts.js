"use strict";

// Player values
const west    = 0;
const north   = 1;
const east    = 2;
const south   = 3;
const players = 4;

// Card values
const as = 0, ts = 1, ks = 2, qs = 3, js = 4;
const ah = 5, th = 6, kh = 7, qh = 8, jh = 9;
const ac = 10, tc = 11, kc = 12, qc = 13, jc = 14;
const ad = 15, td = 16, kd = 17, qd = 18, jd = 19;
const xx = 20, cards = 20;

// cardSrc[v] = source file for card value v
const cardSrc = [
    "cards/as.svg", "cards/ts.svg", "cards/ks.svg", "cards/qs.svg", "cards/js.svg", 
    "cards/ah.svg", "cards/th.svg", "cards/kh.svg", "cards/qh.svg", "cards/jh.svg", 
    "cards/ac.svg", "cards/tc.svg", "cards/kc.svg", "cards/qc.svg", "cards/jc.svg", 
    "cards/ad.svg", "cards/td.svg", "cards/kd.svg", "cards/qd.svg", "cards/jd.svg" 
];


// deck[c] = card value of double pinocle deck's card c
const deck = [
    as, as, as, as, ts, ts, ts, ts, ks, ks, ks, ks, qs, qs, qs, qs, js, js, js, js,
    ah, ah, ah, ah, th, th, th, th, kh, kh, kh, kh, qh, qh, qh, qh, jh, jh, jh, jh,
    ac, ac, ac, ac, tc, tc, tc, tc, kc, kc, kc, kc, qc, qc, qc, qc, jc, jc, jc, jc,
    ad, ad, ad, ad, td, td, td, td, kd, kd, kd, kd, qd, qd, qd, qd, jd, jd, jd, jd
];

// lay[p] = card value of player p's lay
const lay = [xx, xx, xx, xx];

// layLeft[p] = x coordinate of the left edge of player p's lay
const layLeft = [0,0,0,0];

// layTop[p] = y coordinate of the top edge of player p's lay
const layTop = [0,0,0,0];

// layImg[p] = card image element for player p's lay
const layImg = document.querySelectorAll("#lay img");

// hand[p][c] = card value of player p's card c; hand[p].length = number of cards in player p's hand
const hand = [[],[],[],[]];

// handLeft[p][c] = x coordinate of left edge of player p's card c
const handLeft = [[Array(cards)],[Array(cards)],[Array(cards)],[Array(cards)]];

// handRight[p][c] = x coordinate of right edge of player p's card c
const handRight = [[Array(cards)],[Array(cards)],[Array(cards)],[Array(cards)]];

// handTop[p][c] = y coordinate of top edge of player p's card c
const handTop = [[Array(cards)],[Array(cards)],[Array(cards)],[Array(cards)]];

// handBottom[p][c] = y coordinate of bottom edge of player p's card c
const handBottom = [[Array(cards)],[Array(cards)],[Array(cards)],[Array(cards)]];

// handImg[p][c] = card image element for player p's card c
const handImg = [
    document.querySelectorAll("#west img"),
    document.querySelectorAll("#north img"),
    document.querySelectorAll("#east img"),
    document.querySelectorAll("#south img")
];

// Other page elements
const root       = document.querySelector(":root");
const felt       = document.getElementById("felt");
const corner     = document.getElementById("corner");
const reload     = document.getElementById("reload");

// Other constants
const backSrc    = "cards/bb.svg";
const version    = "v0.20";

// Global variables
let dealer       = south;
let selectedImg  = null;
let selectedTop  = 0;
let selectedLeft = 0;
let bumpedLeft   = 0;
let bumpedRight  = 0;
let bumpedTop    = 0;
let bumpedBottom = 0;
let rendered     = true;
let feltWidth    = 0;
let feltHeight   = 0;
let feltPadding  = 0;
let cardWidth    = 0;
let cardHeight   = 0;

// Show player's hand
function show(player) {
    const westPitch  = Math.min((feltHeight - cardHeight * 3 - feltPadding * 4) / 19, cardWidth / 8);
    const northPitch = Math.min((feltWidth  - cardWidth  * 3 - feltPadding * 4) / 19, cardWidth / 8);
    const eastPitch  = Math.min((feltHeight - cardHeight * 3 - feltPadding * 4) / 19, cardWidth / 8);
    const southPitch = (feltWidth - cardWidth - feltPadding * 2) / 19;
    const covered = hand[player].length - 1;
    for (let c = 0; c < hand[player].length; c++) {
        switch (player) {
        case west:
            handLeft[player][c] = feltPadding;
            handTop [player][c] = (feltHeight - westPitch * covered - cardHeight) / 2 + westPitch * c;
            break;
        case north:
            handLeft[player][c] = (feltWidth - northPitch * covered - cardWidth) / 2 + northPitch * c;
            handTop [player][c] = feltPadding;
            break;
        case east:
            handLeft[player][c] = feltWidth - cardWidth - feltPadding;
            handTop [player][c] = (feltHeight - eastPitch * covered - cardHeight) / 2 + eastPitch * c;
            break;
        case south:
            handLeft[player][c] = (feltWidth - southPitch * covered - cardWidth) / 2 + southPitch * c;
            handTop [player][c] = feltHeight - cardHeight - feltPadding;
        }
        handImg   [player][c].style.left = handLeft[player][c] + "px";
        handImg   [player][c].style.top  = handTop [player][c] + "px";
        handRight [player][c]            = handLeft[player][c] + cardWidth;
        handBottom[player][c]            = handTop [player][c] + cardHeight;
    }
}

// Play pinochle after cards are dealt
function play() {
    for (let p = 0; p < players; p++) {
        hand[p].sort(function(a, b){return a-b});
        if (p == south) {
            for (let i = 0; i < hand[south].length; i++)
                handImg[south][i].src = cardSrc[hand[south][i]];
            show(south);
        }
    }
}

// Deal deck starting with deck[0] and the player clockwise from the dealer
function deal(card) {
    const player = (dealer + card + 1) % players;
    handImg[player][hand[player].length].src = backSrc;
    hand[player].push(deck[card]);
    show(player);
    if (card + 1 < deck.length)
        setTimeout(deal, 0, card + 1);
    else
        play();
}

// Shuffle an array in place
function shuffle(array) {
    let currentIndex = array.length, randomIndex, temp;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
    }
    return;
}

// Start pinochle game
function start() {
    dealer = Math.floor(Math.random() * players);
    shuffle(deck);
    setTimeout(deal, 0, 0);
}

// Convert x,y coordinates to that hand's player index (or undefined)
function xy2p(x, y) {
    for (let p = south; p >= west; p--) {
        for (let c = hand[p].length - 1; c >= 0; c--) {
            if (x > handLeft[p][c] && x < handRight[p][c] && y > handTop[p][c] && y < handBottom[p][c])
                return p;
            if (handImg[p][c] == selectedImg && x > bumpedLeft && x < bumpedRight && y > bumpedTop && y < bumpedBottom)
                return p;
        }
    }
}

// Convert x,y coordinates to that hand's card index (or undefined)
function xy2c(x, y) {
    for (let p = south; p >= west; p--) {
        for (let c = hand[p].length - 1; c >= 0; c--) {
            if (x > handLeft[p][c] && x < handRight[p][c] && y > handTop[p][c] && y < handBottom[p][c])
                return c;
            if (handImg[p][c] == selectedImg && x > bumpedLeft && x < bumpedRight && y > bumpedTop && y < bumpedBottom)
                return c;
        }
    }
}

// Mouse move event: 
//      if rendered and (off-hand or off-selected) and any card is selected: unselect card and ...
//      if rendered and on-hand and off-selected: select this card
function mouse(e) {
    const p = xy2p (e.clientX, e.clientY);
    const c = xy2c (e.clientX, e.clientY);
    if (rendered && (p == undefined || handImg[p][c] != selectedImg) && selectedImg != null) {
        selectedImg.style.left = selectedLeft + "px";
        selectedImg.style.top  = selectedTop  + "px";
        selectedImg = null;
    }
    if (rendered && p != undefined && handImg[p][c] != selectedImg) {
        selectedImg  = handImg [p][c];
        selectedLeft = handLeft[p][c];
        selectedTop  = handTop [p][c];
        bumpedLeft   = selectedLeft + cardWidth  * [+0.4, +0.0, -0.4, +0.0][p];
        bumpedRight  = bumpedLeft   + cardWidth;
        bumpedTop    = selectedTop  + cardHeight * [+0.0, +0.4, +0.0, -0.4][p];
        bumpedBottom = bumpedTop    + cardHeight;
        selectedImg.style.left = bumpedLeft + "px";
        selectedImg.style.top  = bumpedTop  + "px";
    }
}

// Mouse press event: 
//      if rendered and on-hand: transiton card to lay and remove card from hand
function press(e) {
    const p = xy2p (e.clientX, e.clientY);
    const c = xy2c (e.clientX, e.clientY);
    if (rendered && p != undefined) {
        rendered = false;
        const hi = handImg[p][c];
        const li = layImg[p];
        hi.style.transition = "left 0.5s, top 0.5s";
        hi.style.left = layLeft[p] + "px";
        hi.style.top  = layTop [p] + "px";
        selectedImg = null;
        li.src = "";
        hi.ontransitionend = function() {
            hi.ontransitionend = "";
            hi.style.transition = "none";
            hi.style.left = "0px";
            hi.style.top  = "0px";
            li.src = hi.src;
            if (p != south) {
                const src = cardSrc[hand[p][c]];
                li.style.transition = "transform 0.2s ease-in";
                li.style.transform = "rotateY(90deg)";
                li.ontransitionend = function() {
                    li.src = src;
                    li.style.transition = "transform 0.2s ease-out";
                    li.style.transform = "rotateY(0deg)";
                }
            }
            hand[p].splice(c, 1);
            for (let c = 0; c < hand[p].length; c++)
                if (p == south)
                    handImg[p][c].src = cardSrc[hand[p][c]];
                else
                    handImg[p][c].src = backSrc;
            handImg[p][hand[p].length].src = "";
            show(p);
            setTimeout(function(){rendered = true;}, 0);
        }
    }
}

// Touch start event:
//      if rendered and (off-hand or off-selected) and any card is selected: unselect card and ...
//      if rendered and on-hand and off-selected: select this card and return;
//      if rendered and on-hand and on-selected: transiton card to lay and remove card from hand
function touch(e) {
    felt.onmousedown = "";
    felt.onmousemove = "";
    const p = xy2p (e.touches[0].clientX, e.touches[0].clientY);
    const c = xy2c (e.touches[0].clientX, e.touches[0].clientY);
    if (rendered && (p == undefined || handImg[p][c] != selectedImg) && selectedImg != null) {
        selectedImg.style.left = selectedLeft + "px";
        selectedImg.style.top  = selectedTop  + "px";
        selectedImg = null;
    }
    if (rendered && p != undefined && handImg[p][c] != selectedImg) {
        selectedImg  = handImg [p][c];
        selectedLeft = handLeft[p][c];
        selectedTop  = handTop [p][c];
        bumpedLeft   = selectedLeft + cardWidth  * [+0.4, +0.0, -0.4, +0.0][p];
        bumpedRight  = bumpedLeft   + cardWidth;
        bumpedTop    = selectedTop  + cardHeight * [+0.0, +0.4, +0.0, -0.4][p];
        bumpedBottom = bumpedTop    + cardHeight;
        selectedImg.style.left = bumpedLeft + "px";
        selectedImg.style.top  = bumpedTop  + "px";
        return;
    }
    if (rendered && p != undefined && handImg[p][c] == selectedImg) {
        rendered = false;
        const hi = handImg[p][c];
        const li = layImg[p];
        hi.style.transition = "left 0.5s, top 0.5s";
        hi.style.left = layLeft[p] + "px";
        hi.style.top  = layTop [p] + "px";
        selectedImg = null;
        li.src = "";
        hi.ontransitionend = function() {
            hi.ontransitionend = "";
            hi.style.transition = "none";
            hi.style.left = "0px";
            hi.style.top  = "0px";
            li.src = hi.src;
            if (p != south) {
                const src = cardSrc[hand[p][c]];
                li.style.transition = "transform 0.2s ease-in";
                li.style.transform = "rotateY(90deg)";
                li.ontransitionend = function() {
                    li.src = src;
                    li.style.transition = "transform 0.2s ease-out";
                    li.style.transform = "rotateY(0deg)";
                }
            }
            hand[p].splice(c, 1);
            for (let c = 0; c < hand[p].length; c++)
                if (p == south)
                    handImg[p][c].src = cardSrc[hand[p][c]];
                else
                    handImg[p][c].src = backSrc;
            handImg[p][hand[p].length].src = "";
            show(p);
            setTimeout(function(){rendered = true;}, 0);
        }
    }
}

// Touch slide event: 
//      if rendered and (off-hand or off-selected) and any card is selected: unselect card and ...
//      if rendered and on-hand and off-selected: select this card
function slide(e) {
    const p = xy2p (e.touches[0].clientX, e.touches[0].clientY);
    const c = xy2c (e.touches[0].clientX, e.touches[0].clientY);
    if (rendered && (p == undefined || handImg[p][c] != selectedImg) && selectedImg != null) {
        selectedImg.style.left = selectedLeft + "px";
        selectedImg.style.top  = selectedTop  + "px";
        selectedImg = null;
    }
    if (rendered && p != undefined && handImg[p][c] != selectedImg) {
        selectedImg  = handImg [p][c];
        selectedLeft = handLeft[p][c];
        selectedTop  = handTop [p][c];
        bumpedLeft   = selectedLeft + cardWidth  * [+0.4, +0.0, -0.4, +0.0][p];
        bumpedRight  = bumpedLeft   + cardWidth;
        bumpedTop    = selectedTop  + cardHeight * [+0.0, +0.4, +0.0, -0.4][p];
        bumpedBottom = bumpedTop    + cardHeight;
        selectedImg.style.left = bumpedLeft + "px";
        selectedImg.style.top  = bumpedTop  + "px";
    }
}

// Initialize the global variables that rely on the window size
function resize () {
    feltWidth   = Number.parseFloat(getComputedStyle(felt).width);
    feltHeight  = Number.parseFloat(getComputedStyle(felt).height);
    feltPadding = Number.parseFloat(getComputedStyle(corner).top);
    cardWidth   = Number.parseFloat(getComputedStyle(corner).width);
    cardHeight  = Number.parseFloat(getComputedStyle(corner).height);
    for (let p = west; p <= south; p++) {
        layLeft[p] = Number.parseFloat(getComputedStyle(layImg[p]).left);
        layTop [p] = Number.parseFloat(getComputedStyle(layImg[p]).top);
        show(p);
    }
}

// Initialize javascript and start game after window loads
window.onload = function() {
    resize();
    window.onresize   = resize;
    corner.innerText  = version;
    reload.draggable  = false;
    felt.onmousemove  = mouse;
    felt.onmousedown  = press;
    felt.ontouchstart = touch;
    felt.ontouchmove  = slide;
    for (let p = west; p <= south; p++) {
        layImg[p].draggable = false;
        for (let c = 0; c < cards; c++)
            handImg[p][c].draggable = false;
    }
    start();
}
