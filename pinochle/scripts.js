"use strict";

// Players
const west      = 0;
const north     = 1;
const east      = 2;
const south     = 3;

// Card image for each player's lay
const layImage  = document.querySelectorAll("#lay img");

// Card images for each player's hand
const handImage = [
    document.querySelectorAll("#west img"),
    document.querySelectorAll("#north img"),
    document.querySelectorAll("#east img"),
    document.querySelectorAll("#south img")
];

// Other page elements
const felt      = document.getElementById("felt");
const corner    = document.getElementById("corner");
const reload    = document.getElementById("reload");

// Other constants
const dealt     = 20;

// Global variables
let picked      = null;
let handPicked  = -1;
let cardPicked  = -1;

function bumpCard (e, s, t) {
    e.preventDefault();
    s.style.translate = t;
}

function playCard (e, s, d) {
    bumpCard(e, s, "0% 0%");
    const sx = s.offsetLeft;
    const sy = s.offsetTop;
    const dx = d.offsetLeft;
    const dy = d.offsetTop;
    s.style.transition = "transform 1s";
    s.style.transform = "translate(" + (dx-sx) + "px, " + (dy-sy) + "px)";
    s.ontransitionend = function() {
        s.style.transition = "transform 0s";
        s.style.transform = "none";
        d.src = s.src;
        s.src = "";
    }
}

function touch(event, player, index) {
    const h = handImage[player][index];
    const l = layImage[player];
    const hx = Number.parseFloat(getComputedStyle(h).left);
    const hy = Number.parseFloat(getComputedStyle(h).top);
    const lx = Number.parseFloat(getComputedStyle(l).left);
    const ly = Number.parseFloat(getComputedStyle(l).top);
    const translate = ["20% 0%", "0% 20%", "-20% 0%", "0% -20%"];
    event.preventDefault();
    if (getComputedStyle(h).translate == translate[player]) {
        h.style.transition = "translate 1s";
        h.style.translate = (lx-hx) + "px " + (ly-hy) + "px";
        h.ontransitionend = function() {
            h.style.transition = "translate 0s";
            h.style.translate = "0px 0px";
            l.src = h.src;
            h.src = "";
        }
    } else {
        for (let p = west; p <= south; p++)
            for (let i = 0; i < dealt; i++)
                if (p == player && i == index)
                    handImage[p][i].style.translate = translate[p];
                else
                    handImage[p][i].style.translate = "0% 0%";
    }
}

function slide(event, player, index) {
    const cardL = [], cardR = [], cardT = [], cardB = [];
    const h = handImage[player];
    const touchX = event.changedTouches[0].clientX;
    const touchY = event.changedTouches[0].clientY;
    const translate = ["20% 0%", "0% 20%", "-20% 0%", "0% -20%"];
    event.preventDefault();
    for (let i = 0; i < dealt; i++) {
        h[i].style.translate = "0% 0%";
        cardL[i] = h[i].offsetLeft;
        cardR[i] = h[i].offsetLeft + h[i].offsetWidth;
        cardT[i] = h[i].offsetTop;
        cardB[i] = h[i].offsetTop + h[i].offsetHeight;
    }
    if (touchX >= cardL[0] && touchX < cardR.at(-1) && touchY >= cardT[0] && touchY < cardB.at(-1)) {
        for (let i = 0; i < dealt; i++) {
            if (touchX >= cardL[i] && touchX < cardR[i] && touchY >= cardT[i] && touchY < cardB[i]) {
                if (i + 1 < dealt && (player == south || player == north) && touchX >= cardL[i + 1])
                    continue;
                if (i + 1 < dealt && (player == west || player == east) && touchY >= cardT[i + 1])
                    continue;
                h[i].style.translate = translate[player];
                break;
            }
        }
    }
}

/*function moveCard(e, side, t) {
    const cardL = [], cardR = [], cardT = [], cardB = [];
    const touchX = e.changedTouches[0].clientX;
    const touchY = e.changedTouches[0].clientY;
    for (let i = 0; i < side.length; i++) {
        bumpCard(e, side[i], "0% 0%");
        cardL[i] = side[i].offsetLeft;
        cardR[i] = side[i].offsetLeft + side[i].offsetWidth;
        cardT[i] = side[i].offsetTop;
        cardB[i] = side[i].offsetTop + side[i].offsetHeight;
    }
    if (touchX < cardL[0] || touchX >= cardR.at(-1) || touchY < cardT[0] || touchY >= cardB.at(-1)) {
        return;
    }
    for (let i = 0; i < side.length; i++) {
        if (touchX >= cardL[i] && touchX < cardR[i] && touchY >= cardT[i] && touchY < cardB[i]) {
            if (i + 1 < side.length && (side == south || side == north) && touchX >= cardL[i + 1])
                continue;
            if (i + 1 < side.length && (side == west || side == east) && touchY >= cardT[i + 1])
                continue;
            bumpCard(e, side[i], t);
            break;
        }
    }
}*/

// initialize javascript after window loads
window.onload = function() {
    reload.onclick = function() {
        location.reload();
    }
    for (let p = west; p <= south; p++) {
        for (let i = 0; i < dealt; i++) {
            /*west[i].onmouseenter  = function(e) {bumpCard(e,  west[i],  "20% 0%" );}
            north[i].onmouseenter = function(e) {bumpCard(e,  north[i], "0% 20%" );}
            east[i].onmouseenter  = function(e) {bumpCard(e,  east[i],  "-20% 0%");}
            south[i].onmouseenter = function(e) {bumpCard(e,  south[i], "0% -20%");}
            west[i].onmouseleave  = function(e) {bumpCard(e,  west[i],  "0% 0%"  );}
            north[i].onmouseleave = function(e) {bumpCard(e,  north[i], "0% 0%"  );}
            east[i].onmouseleave  = function(e) {bumpCard(e,  east[i],  "0% 0%"  );}
            south[i].onmouseleave = function(e) {bumpCard(e,  south[i], "0% 0%"  );}
            west[i].onmousedown   = function(e) {playCard(e,  west[i],  playWest );}
            north[i].onmousedown  = function(e) {playCard(e,  north[i], playNorth);}
            east[i].onmousedown   = function(e) {playCard(e,  east[i],  playEast );}
            south[i].onmousedown  = function(e) {playCard(e,  south[i], playSouth);}*/
            handImage[p][i].ontouchstart = function(e) {touch(e, p, i);}
            handImage[p][i].ontouchmove  = function(e) {slide(e, p, i);}
        }
    }
}
