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
const xx = 20;

// cardSrc[c] = source file for card value c
const cardSrc = [
    "cards/as.svg", "cards/ts.svg", "cards/ks.svg", "cards/qs.svg", "cards/js.svg", 
    "cards/ah.svg", "cards/th.svg", "cards/kh.svg", "cards/qh.svg", "cards/jh.svg", 
    "cards/ac.svg", "cards/tc.svg", "cards/kc.svg", "cards/qc.svg", "cards/jc.svg", 
    "cards/ad.svg", "cards/td.svg", "cards/kd.svg", "cards/qd.svg", "cards/jd.svg" 
];
const backSrc = "cards/bb.svg";

// deck[c] = card c value in a double pinocle desk
const deck = [
    as, as, as, as, ts, ts, ts, ts, ks, ks, ks, ks, qs, qs, qs, qs, js, js, js, js,
    ah, ah, ah, ah, th, th, th, th, kh, kh, kh, kh, qh, qh, qh, qh, jh, jh, jh, jh,
    ac, ac, ac, ac, tc, tc, tc, tc, kc, kc, kc, kc, qc, qc, qc, qc, jc, jc, jc, jc,
    ad, ad, ad, ad, td, td, td, td, kd, kd, kd, kd, qd, qd, qd, qd, jd, jd, jd, jd
];

// lay[p] = lay card value for player p 
const lay = [xx, xx, xx, xx];

// layImg[p] = lay card image element for player p
const layImg = document.querySelectorAll("#lay img");

// hand[p][i] = hand card value for player p, card c
const hand = [[],[],[],[]];

// handImg[p][c] = hand card image element for player p, card c
const handImg = [
    document.querySelectorAll("#west img"),
    document.querySelectorAll("#north img"),
    document.querySelectorAll("#east img"),
    document.querySelectorAll("#south img")
];

// Other page elements
const root      = document.querySelector(":root");
const felt      = document.getElementById("felt");
const corner    = document.getElementById("corner");
const reload    = document.getElementById("reload");

// Other constants
const dealt     = 20;
const version   = "v0.14";

// Global variables
let dealer      = south;
let selected    = null;
let rendered    = true;
let feltWidth   = 0;
let feltHeight  = 0;
let feltPadding = 0;
let cardWidth   = 0;
let cardHeight  = 0;
let westPitch   = 0;
let northPitch  = 0;
let eastPitch   = 0;
let southPitch  = 0;

// Show player's hand
function show(player) {
    let left, top;
    const covered = hand[player].length - 1;
    for (let i = 0; i < hand[player].length; i++) {
        switch (player) {
        case west:
            left = feltPadding;
            top = (feltHeight - westPitch * covered - cardHeight) / 2 + westPitch * i;
            break;
        case north:
            left = (feltWidth - northPitch * covered - cardWidth) / 2 + northPitch * i;
            top = feltPadding;
            break;
        case east:
            left = feltWidth - cardWidth - feltPadding;
            top = (feltHeight - eastPitch * covered - cardHeight) / 2 + eastPitch * i;
            break;
        case south:
            left = (feltWidth - southPitch * covered - cardWidth) / 2 + southPitch * i;
            top = feltHeight - cardHeight - feltPadding;
        }
        handImg[player][i].style.left = left + "px";
        handImg[player][i].style.top  = top  + "px";
    }
    for (let i = hand[player].length; i < handImg[player].length; i++) {
        handImg[player][i].style.left = "0px";
        handImg[player][i].style.top  = "0px";
    }
}

// Start pinochle game
function start() {
    dealer = Math.floor(Math.random() * players);
    shuffle(deck);
    deal(0);
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

// Deal deck starting with deck[0] and the player clockwise from the dealer
function deal(card) {
    const player = (dealer + card + 1) % players;
    if (player == south)
        handImg[player][hand[player].length].src = cardSrc[deck[card]];
    else
        handImg[player][hand[player].length].src = backSrc;
    hand[player].push(deck[card]);
    show(player);
    if (card + 1 < deck.length)
        setTimeout(deal, 10, card + 1);
    else
        play();
}

// Play pinochle after cards are dealt
function play() {
    for (let p = 0; p < players; p++) {
        hand[p].sort(function(a, b){return a-b});
        if (p == south)
            for (let i = 0; i < hand[south].length; i++)
                handImg[south][i].src = cardSrc[hand[south][i]];
        show(south);
    }
}

// Mouse enter: if play is rendered and this card isn't already selected, select this card
function enter (event, player, index) {
    const hi = handImg[player][index];
    const hs = getComputedStyle(hi);
    const hl = Number.parseFloat(hs.left);
    const ht = Number.parseFloat(hs.top);
    const hw = Number.parseFloat(hs.width);
    const hh = Number.parseFloat(hs.height);
    const dl = [+0.2, +0.0, -0.2, +0.0];
    const dt = [+0.0, +0.2, +0.0, -0.2];
    if (rendered && hi != selected) {
        selected = hi;
        hi.style.left = (hl + hw * dl[player]) + "px";
        hi.style.top  = (ht + hh * dt[player]) + "px";
    }
}

// Mouse leave: if play is rendered and this card is already selected, unselect this card
function leave (event, player, index) {
    const hi = handImg[player][index];
    const hs = getComputedStyle(hi);
    const hl = Number.parseFloat(hs.left);
    const ht = Number.parseFloat(hs.top);
    const hw = Number.parseFloat(hs.width);
    const hh = Number.parseFloat(hs.height);
    const dl = [+0.2, +0.0, -0.2, +0.0];
    const dt = [+0.0, +0.2, +0.0, -0.2];
    if (rendered && hi == selected) {
        selected = null;
        hi.style.left = (hl - hw * dl[player]) + "px";
        hi.style.top  = (ht - hh * dt[player]) + "px";
    }
}

// Mouse press: if previous play is rendered, play this card
function press (event, player, index) {
    const hi = handImg[player][index];
    const li = layImg[player];
    const ls = getComputedStyle(li);
    const ll = Number.parseFloat(ls.left);
    const lt = Number.parseFloat(ls.top);
    if (rendered) {
        rendered = false;
        hi.style.transition = "left 1s, top 1s";
        hi.style.left = ll + "px";
        hi.style.top  = lt + "px";
        selected = null;
        hi.ontransitionend = function() {
            hi.ontransitionend = function(){};
            hi.style.transition = "none";
            hi.style.left = "0px";
            hi.style.top  = "0px";
            li.src = hi.src;
            hand[player].splice(index, 1);
            for (let i = 0; i < hand[player].length; i++)
                if (player == south)
                    handImg[player][i].src = cardSrc[hand[player][i]];
                else
                    handImg[player][i].src = backSrc;
            handImg[player][hand[player].length].src = "";
            show(player);
            setTimeout(function(){rendered = true;}, 0);
        }
    }
}

// Handle touch event
function touch(event, player, index) {
    const h = handImg[player][index];
    const l = layImg[player];
    const hx = Number.parseFloat(getComputedStyle(h).left);
    const hy = Number.parseFloat(getComputedStyle(h).top);
    const lx = Number.parseFloat(getComputedStyle(l).left);
    const ly = Number.parseFloat(getComputedStyle(l).top);
    const translate = ["20% 0%", "0% 20%", "-20% 0%", "0% -20%"];
    event.preventDefault();
    if (getComputedStyle(h).translate == translate[player]) {
        h.style.transition = "translate 1s";
        h.style.translate = (lx-hx) + "px " + (ly-hy) + "px";
        corner.innerText = "Play " + index;
        h.ontransitionend = function() {
            h.style.transition = "none";
            h.style.translate = "0% 0%";
            l.src = h.src;
            h.src = "";
        }
    } else {
        corner.innerText = "Select " + index;
        for (let p = west; p <= south; p++)
            for (let i = 0; i < dealt; i++)
                if (p == player && i == index)
                    handImg[p][i].style.translate = translate[p];
                else
                    handImg[p][i].style.translate = "none";
    }
}

// Handle slide event
function slide(event, player, index) {
    const cardL = [], cardR = [], cardT = [], cardB = [];
    const h = handImg[player];
    const touchX = event.changedTouches[0].clientX;
    const touchY = event.changedTouches[0].clientY;
    const translate = ["20% 0%", "0% 20%", "-20% 0%", "0% -20%"];
    event.preventDefault();
    for (let i = 0; i < dealt; i++) {
        h[i].style.translate = "none";
        cardL[i] = h[i].offsetLeft;
        cardR[i] = h[i].offsetLeft + corner.offsetWidth;
        cardT[i] = h[i].offsetTop;
        cardB[i] = h[i].offsetTop + corner.offsetHeight;
    }
    corner.innerText = Math.floor(touchY) + "," + Math.floor(cardB.at(-1));
    if (touchX >= cardL[0] && touchX < cardR.at(-1) && touchY >= cardT[0] && touchY < cardB.at(-1)) {
        for (let i = 0; i < dealt; i++) {
            if (touchX >= cardL[i] && touchX < cardR[i] && touchY >= cardT[i] && touchY < cardB[i]) {
                if (i + 1 < dealt && (player == south || player == north) && touchX >= cardL[i + 1])
                    continue;
                if (i + 1 < dealt && (player == west || player == east) && touchY >= cardT[i + 1])
                    continue;
                h[i].style.translate = translate[player];
                // corner.innerText = "Slide " + i;
                break;
            }
        }
    }
}

// Initialize javascript and start game after window loads
window.onload = function() {
    feltWidth   = Number.parseFloat(getComputedStyle(felt).width);
    feltHeight  = Number.parseFloat(getComputedStyle(felt).height);
    feltPadding = Number.parseFloat(getComputedStyle(corner).top);
    cardWidth   = Number.parseFloat(getComputedStyle(corner).width);
    cardHeight  = Number.parseFloat(getComputedStyle(corner).height);
    westPitch   = Math.min((feltHeight - cardHeight * 3 - feltPadding * 4) / 19, cardWidth / 8);
    northPitch  = Math.min((feltWidth - cardWidth * 3 - feltPadding * 4) / 19, cardWidth / 8);
    eastPitch   = westPitch;
    southPitch  = (feltWidth - cardWidth - feltPadding * 2) / 19;
    corner.innerText = version;
    reload.draggable = false;
    reload.onclick = function() {
        location.reload();
    }
    for (let p = west; p <= south; p++) {
        layImg[p].draggable = false;       
        for (let i = 0; i < dealt; i++) {
            handImg[p][i].draggable    = false;
            handImg[p][i].onmouseenter = function(e) {enter(e, p, i);}
            handImg[p][i].onmouseleave = function(e) {leave(e, p, i);}
            handImg[p][i].onmousedown  = function(e) {press(e, p, i);}
            handImg[p][i].ontouchstart = function(e) {touch(e, p, i);}
            handImg[p][i].ontouchmove  = function(e) {slide(e, p, i);}
        }
    }
    start();
}

// Update hands when window is resized
window.onresize = function() {
    feltWidth   = Number.parseFloat(getComputedStyle(felt).width);
    feltHeight  = Number.parseFloat(getComputedStyle(felt).height);
    feltPadding = Number.parseFloat(getComputedStyle(corner).top);
    cardWidth   = Number.parseFloat(getComputedStyle(corner).width);
    cardHeight  = Number.parseFloat(getComputedStyle(corner).height);
    westPitch   = Math.min((feltHeight - cardHeight * 3 - feltPadding * 4) / 19, cardWidth / 8);
    northPitch  = Math.min((feltWidth - cardWidth * 3 - feltPadding * 4) / 19, cardWidth / 8);
    eastPitch   = westPitch;
    southPitch  = (feltWidth - cardWidth - feltPadding * 2) / 19;
    for (let p = west; p <= south; p++)
        show(p);
}