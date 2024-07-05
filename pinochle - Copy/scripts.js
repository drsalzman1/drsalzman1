"use strict";

// Players
const west     = 0;
const north    = 1;
const east     = 2;
const south    = 3;
const players  = 4;

// Suits
const diamonds = 0;
const clubs    = 5;
const hearts   = 10;
const spades   = 15;

// Ranks
const jack     = 0;
const queen    = 1;
const king     = 2;
const ten      = 3;
const ace      = 4;

// Cards
const jd = jack + diamonds, qd = queen + diamonds, kd = king + diamonds, td = ten + diamonds, ad = ace + diamonds;
const jc = jack + clubs,    qc = queen + clubs,    kc = king + clubs,    tc = ten + clubs,    ac = ace + clubs;
const jh = jack + hearts,   qh = queen + hearts,   kh = king + hearts,   th = ten + hearts,   ah = ace + hearts;
const js = jack + spades,   qs = queen + spades,   ks = king + spades,   ts = ten + spades,   as = ace + spades;
const xx = 20, cards = 20;

// cardSrc[v] = source file for card value v
const cardSrc = [
    "cards/jd.svg", "cards/qd.svg", "cards/kd.svg", "cards/td.svg", "cards/ad.svg", 
    "cards/jc.svg", "cards/qc.svg", "cards/kc.svg", "cards/tc.svg", "cards/ac.svg", 
    "cards/jh.svg", "cards/qh.svg", "cards/kh.svg", "cards/th.svg", "cards/ah.svg", 
    "cards/js.svg", "cards/qs.svg", "cards/ks.svg", "cards/ts.svg", "cards/as.svg" 
];

// deck[d] = card value of double pinocle deck's card d
const deck = [
    jd, jd, jd, jd, qd, qd, qd, qd, kd, kd, kd, kd, td, td, td, td, ad, ad, ad, ad,
    jc, jc, jc, jc, qc, qc, qc, qc, kc, kc, kc, kc, tc, tc, tc, tc, ac, ac, ac, ac,
    jh, jh, jh, jh, qh, qh, qh, qh, kh, kh, kh, kh, th, th, th, th, ah, ah, ah, ah,
    js, js, js, js, qs, qs, qs, qs, ks, ks, ks, ks, ts, ts, ts, ts, as, as, as, as
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
const canvas     = document.getElementById("canvas");
const ctx        = canvas.getContext("2d");

// Deal constants
const dealTime   = 2000;
const set        = 4;
const sets       = deck.length / set;
const setTime    = dealTime / sets;

// Other constants
const backSrc    = "cards/gb.svg";
const version    = "v0.26";
const back       = new Image();

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
let startTime    = 0;

// Returns number of rank arounds in player's hand
function arounds(player, rank) {
    let count = Array(cards).fill(0);
    for (let suit of [spades, hearts, clubs, diamonds]) {
        for (let card = 0; card < cards; card++)
            if (hand[player][card] == suit + rank)
                count[suit + rank]++;
    }
    return Math.min(count[spades + rank], count[hearts + rank], count[clubs + rank], count[diamonds + rank])
}

// Returns number of suit runs in the player's hand
function runs(player, suit) {
    let count = Array(cards).fill(0);
    for (let rank of [jack, queen, king, ten, ace]) {
        for (let card = 0; card < cards; card++)
            if (hand[player][card] == suit + rank)
                count[suit + rank]++;
    }
    return Math.min(count[suit + ace], count[suit + ten], count[suit + king], count[suit + queen], count[suit + jack])
}

// Return true if the player's hand has at least min pinochles
function pinochles(player) {
    let q = 0, j = 0;
    for (let card = 0; card < cards; card++) {
        if (hand[player][card] == qs)
            q++;
        if (hand[player][card] == jd)
            j++;
    }
    return Math.min(q, j);
}

// Returns number of suit marriage's in the player's hand
function marraiges(player, suit) {
    let k = 0, q = 0;
    for (let card = 0; card < cards; card++) {
        if (hand[player][card] == suit + king)
            k++;
        if (hand[player][card] == suit + queen)
            q++;
    }
    return Math.min(k, q);
}

// Count player's meld based on trump suit
function meld(player, trump) {
    let m = 0;
    m += [0,   10,   100,    500,    500][arounds  (player, ace  )];
    m += [0,    8,    80,    500,    500][arounds  (player, king )];
    m += [0,    6,    60,    500,    500][arounds  (player, queen)];
    m += [0,    4,    40,    500,    500][arounds  (player, jack )];
    m += [0, 16-4, 150-8, 500-12, 500-16][runs     (player, trump)];
    m += [0,    4,    30,     90,    500][pinochles(player       )];
    for (let suit of [spades, hearts, clubs, diamonds])
        if (suit == trump)
            m += marraiges(player, suit) * 4;
        else
            m += marraiges(player, suit) * 2;
    return m;
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

// Locate the edges of each player's hand cards
function edges() {
    const westPitch  = Math.min((feltHeight - cardHeight * 3 - feltPadding * 4) / 19, cardWidth / 8);
    const northPitch = Math.min((feltWidth  - cardWidth  * 3 - feltPadding * 4) / 19, cardWidth / 8);
    const eastPitch  = Math.min((feltHeight - cardHeight * 3 - feltPadding * 4) / 19, cardWidth / 8);
    const southPitch = (feltWidth - cardWidth - feltPadding * 2) / 19;
    for (let p = west; p <= south; p++) {
        for (let c = 0; c < hand[p].length; c++) {
            switch (p) {
            case west:
                handLeft[p][c] = feltPadding;
                handTop [p][c] = (feltHeight - westPitch * (hand[p].length - 1) - cardHeight) / 2 + westPitch * c;
                break;
            case north:
                handLeft[p][c] = (feltWidth - northPitch * (hand[p].length - 1) - cardWidth) / 2 + northPitch * c;
                handTop [p][c] = feltPadding;
                break;
            case east:
                handLeft[p][c] = feltWidth - cardWidth - feltPadding;
                handTop [p][c] = (feltHeight - eastPitch * (hand[p].length - 1) - cardHeight) / 2 + eastPitch * c;
                break;
            case south:
                handLeft[p][c] = (feltWidth - southPitch * (hand[p].length - 1) - cardWidth) / 2 + southPitch * c;
                handTop [p][c] = feltHeight - cardHeight - feltPadding;
            }
            handRight [p][c] = handLeft[p][c] + cardWidth;
            handBottom[p][c] = handTop [p][c] + cardHeight;
        }
    }
}

// Redraw each player's hand
function redraw() {
    edges();
    for (let p = west; p <= south; p++) {
        hand[p].sort(function(a, b){return b-a});
        for (let c = 0; c < hand[p].length; c++) {
            if (p == south)
                handImg[p][c].src = cardSrc[hand[p][c]];
            else
                handImg[p][c].src = backSrc;
            handImg [p][c].style.left = handLeft[p][c] + "px";
            handImg [p][c].style.top  = handTop [p][c] + "px";
        }       
    }
}

// Draw sets of cards flying from dealer's deck until deck is depleted
function draw() {
    let p, c, r, l, t;
    const elapsed = performance.now() - startTime;
    ctx.clearRect(0, 0, feltWidth, feltHeight);
    if (elapsed > dealTime) {
        redraw();
        //bid();
        return;
    }
    if (elapsed <= dealTime - setTime)
        ctx.drawImage(back, layLeft[dealer], layTop[dealer], cardWidth, cardHeight);
    for (let s = 0; s < sets; s++) {
        r = Math.min((elapsed - s * setTime) / setTime, 1);
        if (r > 0) {
            p = (dealer + s + 1) % players;
            c = Math.floor(s / players) * set;
            for (let i = 0; i < set; i++) {
                l = handLeft[p][c + i] * r + layLeft[dealer] * (1 - r);
                t = handTop [p][c + i] * r + layTop [dealer] * (1 - r);
                ctx.drawImage(back, l, t, cardWidth, cardHeight);
            }
        }
    }
    window.requestAnimationFrame(draw);
}

// Deal deck starting with deck[0] and the player clockwise from the dealer
function deal() {
    dealer = Math.floor(Math.random() * players);
    shuffle(deck);
    for (let d = 0, p; d < deck.length; d++) {
        p = (dealer + d + 1) % players;
        hand[p].push(deck[d]);
    }
    edges();
    back.src  = backSrc;
    startTime = performance.now();
    window.requestAnimationFrame(draw);
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
            redraw();
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
            redraw();
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
    }
    canvas.width = feltWidth;
    canvas.height = feltHeight;
    redraw();
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
    deal();
}
