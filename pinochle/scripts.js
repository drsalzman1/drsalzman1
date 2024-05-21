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

function enter (event, player, index) {
    const h = handImage[player][index];
    const translate = ["20% 0%", "0% 20%", "-20% 0%", "0% -20%"];
    event.preventDefault();
    h.style.translate = translate[player];
}

function leave (event, player, index) {
    const h = handImage[player][index];
    event.preventDefault();
    h.style.translate = "0% 0%";
}

function press (event, player, index) {
    const h = handImage[player][index];
    const l = layImage[player];
    const hx = Number.parseFloat(getComputedStyle(h).left);
    const hy = Number.parseFloat(getComputedStyle(h).top);
    const lx = Number.parseFloat(getComputedStyle(l).left);
    const ly = Number.parseFloat(getComputedStyle(l).top);
    event.preventDefault();
    h.style.transition = "translate 1s";
    h.style.translate = (lx-hx) + "px " + (ly-hy) + "px";
    h.ontransitionend = function() {
        h.style.transition = "translate 0s";
        h.style.translate = "0px 0px";
        l.src = h.src;
        h.src = "";
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
        corner.innerText = "Play ";
        corner.innerText += (lx-hx) + "px " + (ly-hy) + "px" ;
        h.ontransitionend = function() {
            h.style.transition = "translate 0s";
            h.style.translate = "0px 0px";
            l.src = h.src;
            h.src = "";
        }
    } else {
        corner.innerText = "Select ";
        corner.innerText += translate[player];
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

// initialize javascript after window loads
window.onload = function() {
    reload.onclick = function() {
        location.reload();
        corner.innerText = "Reload";
    }
    for (let p = west; p <= south; p++) {
        for (let i = 0; i < dealt; i++) {
            //handImage[p][i].onmouseenter = function(e) {enter(e, p, i);}
            //handImage[p][i].onmouseleave = function(e) {leave(e, p, i);}
            //handImage[p][i].onmousedown  = function(e) {press(e, p, i);}
            handImage[p][i].ontouchstart = function(e) {touch(e, p, i);}
            //handImage[p][i].ontouchmove  = function(e) {slide(e, p, i);}
        }
    }
}
