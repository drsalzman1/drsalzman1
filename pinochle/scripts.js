"use strict";

const west      = document.querySelectorAll("#west img");
const north     = document.querySelectorAll("#north img");
const east      = document.querySelectorAll("#east img");
const south     = document.querySelectorAll("#south img");
const play      = document.querySelectorAll("#play img");

const felt      = document.getElementById("felt");
const corner    = document.getElementById("corner");
const reload    = document.getElementById("reload");

const playWest  = play[3];
const playNorth = play[0];
const playEast  = play[1];
const playSouth = play[2];

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

function touchCard(e, s, t, d) {
    const cardT = getComputedStyle(s).translate;
    for (let i = 0; i < west.length; i++)
        bumpCard(e, west[i], "0% 0%");
    for (let i = 0; i < north.length; i++)
        bumpCard(e, north[i], "0% 0%");
    for (let i = 0; i < east.length; i++)
        bumpCard(e, east[i], "0% 0%");
    for (let i = 0; i < south.length; i++)
        bumpCard(e, south[i], "0% 0%");
    if (cardT == "none" || cardT == "0% 0%")
        bumpCard(e, s, t);
    else
        playCard(e, s, d);
}

function moveCard(e, side, t) {
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
}

// initialize javascript after window loads
window.onload = function() {
    reload.onclick = function() {
        location.reload();
    }
    for (let i = 0; i < south.length; i++) {
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
        west[i].ontouchstart  = function(e) {touchCard(e, west[i],  "20% 0%",  playWest );}
        north[i].ontouchstart = function(e) {touchCard(e, north[i], "0% 20%",  playNorth);}
        east[i].ontouchstart  = function(e) {touchCard(e, east[i],  "-20% 0%", playEast );}
        south[i].ontouchstart = function(e) {touchCard(e, south[i], "0% -20%", playSouth);}
        /*west[i].ontouchmove   = function(e) {moveCard(e,  west,     "20% 0%" );}
        north[i].ontouchmove  = function(e) {moveCard(e,  north,    "0% 20%" );}
        east[i].ontouchmove   = function(e) {moveCard(e,  east,     "-20% 0%");}
        south[i].ontouchmove  = function(e) {moveCard(e,  south,    "0% -20%");}*/
    }
}
