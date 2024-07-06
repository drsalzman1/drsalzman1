"use strict";

// Player values
const w        = 0;
const n        = 1;
const e        = 2;
const s        = 3;
const players  = 4;

// Suit values
const diamonds = 0;
const clubs    = 5;
const hearts   = 10;
const spades   = 15;

// Rank values
const jack     = 0;
const queen    = 1;
const king     = 2;
const ten      = 3;
const ace      = 4;

// Card values
const jd = jack + diamonds, qd = queen + diamonds, kd = king + diamonds, td = ten + diamonds, ad = ace + diamonds;
const jc = jack + clubs,    qc = queen + clubs,    kc = king + clubs,    tc = ten + clubs,    ac = ace + clubs;
const jh = jack + hearts,   qh = queen + hearts,   kh = king + hearts,   th = ten + hearts,   ah = ace + hearts;
const js = jack + spades,   qs = queen + spades,   ks = king + spades,   ts = ten + spades,   as = ace + spades;
const gb = 20
const maxHand = 20;
const maxDeck = 80;

// src[v] = source file for card value v
const src = [
    "cards/jd.svg", "cards/qd.svg", "cards/kd.svg", "cards/td.svg", "cards/ad.svg", 
    "cards/jc.svg", "cards/qc.svg", "cards/kc.svg", "cards/tc.svg", "cards/ac.svg", 
    "cards/jh.svg", "cards/qh.svg", "cards/kh.svg", "cards/th.svg", "cards/ah.svg", 
    "cards/js.svg", "cards/qs.svg", "cards/ks.svg", "cards/ts.svg", "cards/as.svg",
    "cards/gb.svg" 
];

// img[v] = image file for card value v
const img = [
    new Image(), new Image(), new Image(), new Image(), new Image(), 
    new Image(), new Image(), new Image(), new Image(), new Image(), 
    new Image(), new Image(), new Image(), new Image(), new Image(), 
    new Image(), new Image(), new Image(), new Image(), new Image(), 
    new Image()
];

// v = value; x,y = center; t = t; ?0 = before anaimation; ?1 = after animation
class Card {
    constructor() {
        this.v = 0;
        this.x = 0;
        this.y = 0;
        this.v0 = 0; 
        this.x0 = 0;
        this.y0 = 0;
        this.t0 = 0;
        this.v1 = 0;
        this.x1 = 0;
        this.y1 = 0;
        this.t1 = 0;
    }
}

// hand[p][c] = player p's card c; hand[p].length = number of cards in player p's hand
const hand = [
    [new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card],
    [new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card],
    [new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card],
    [new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card]
];

// Page elements
const felt       = document.getElementById("felt");
const corner     = document.getElementById("corner");
const reload     = document.getElementById("reload");
const canvas     = document.getElementById("canvas");
const ctx        = canvas.getContext("2d");

// Animation constants
const dealTime   = 2000;
const flyTime    = dealTime / 20;
const flipTime   = dealTime / 10;
const sortTime   = dealTime / 2;
const selectTime = dealTime / 40;

// Other constants
const version    = "v0.40";

// Global variables
let dealer       = s;
let selectedP    = null;
let selectedC    = null;
let rendered     = true;
let feltWide     = 0;
let feltHigh     = 0;
let padding      = 0;
let cardWide     = 0;
let cardHigh     = 0;
let onDrawn      = function() {}

// Returns number of rank arounds in player's hand
function arounds(player, rank) {
    let count = Array(maxHand).fill(0);
    for (let suit of [spades, hearts, clubs, diamonds]) {
        for (let card = 0; card < maxHand; card++)
            if (hand[player][card] == suit + rank)
                count[suit + rank]++;
    }
    return Math.min(count[spades + rank], count[hearts + rank], count[clubs + rank], count[diamonds + rank])
}

// Returns number of suit runs in the player's hand
function runs(player, suit) {
    let count = Array(maxHand).fill(0);
    for (let rank of [jack, queen, king, ten, ace]) {
        for (let card = 0; card < maxHand; card++)
            if (hand[player][card] == suit + rank)
                count[suit + rank]++;
    }
    return Math.min(count[suit + ace], count[suit + ten], count[suit + king], count[suit + queen], count[suit + jack])
}

// Return true if the player's hand has at le min pinochles
function pinochles(player) {
    let q = 0, j = 0;
    for (let card = 0; card < maxHand; card++) {
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
    for (let card = 0; card < maxHand; card++) {
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
    let currentIndex = array.length;
    while (currentIndex > 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        let temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
    }
    return;
}

// Locate each player's hand cards
function locate() {
    let pitch = Math.min((feltHigh - cardHigh * 2 - cardWide - padding * 4) / 19, cardWide / 8);
    for (let c = 0; c < hand[w].length; c++) {
        hand[w][c].x = cardHigh/2 + padding;
        hand[w][c].y = feltHigh/2 + pitch*(c-(hand[w].length-1)/2);
    }
    pitch = Math.min((feltWide - cardWide * 2 - cardWide - padding * 4) / 19, cardWide / 8);
    for (let c = 0; c < hand[n].length; c++) {
        hand[n][c].x = feltWide/2 - pitch*(c-(hand[n].length-1)/2);
        hand[n][c].y = cardHigh/2 + padding;
    }
    pitch = Math.min((feltHigh - cardHigh * 2 - cardWide - padding * 4) / 19, cardWide / 8);
    for (let c = 0; c < hand[e].length; c++) {
        hand[e][c].x = feltWide - cardHigh/2 - padding;
        hand[e][c].y = feltHigh/2 - pitch*(c-(hand[w].length-1)/2);
    }
    pitch = (feltWide - cardWide - padding * 2) / 19;
    for (let c = 0; c < hand[s].length; c++) {
        hand[s][c].x = feltWide/2 + pitch*(c-(hand[n].length-1)/2);
        hand[s][c].y = feltHigh - cardHigh/2 - padding
    }
}

// Draw cards until each card is at its final position then reset its start position for the next operation
// Cards with high indices cover ones with low indices; cards in motion cover static cards
function draw() {
    const now = performance.now();
    ctx.clearRect(0, 0, feltWide, feltHigh);
    rendered = true;
    for (let p = w; p <= s; p++) {
        for (let c = 0; c < hand[p].length; c++) {
            let r = [Math.PI/2, 0, Math.PI/2, 0][p];
            if (now < hand[p][c].t1)
                rendered = false;
            if (now <= hand[p][c].t0) {
                ctx.translate(hand[p][c].x0, hand[p][c].y0);
                ctx.rotate(r);
                ctx.drawImage(img[hand[p][c].v0], -cardWide/2, -cardHigh/2, cardWide, cardHigh);
                ctx.resetTransform();
            }
            if (now >= hand[p][c].t1) {
                ctx.translate(hand[p][c].x1, hand[p][c].y1);
                ctx.rotate(r);
                ctx.drawImage(img[hand[p][c].v1], -cardWide/2, -cardHigh/2, cardWide, cardHigh);
                ctx.resetTransform();
                hand[p][c].v0 = hand[p][c].v1;
                hand[p][c].x0 = hand[p][c].x1;
                hand[p][c].y0 = hand[p][c].y1;
                hand[p][c].t0 = hand[p][c].t1;
            }
        }
    }
    for (let p = w; p <= s; p++) {
        for (let c = 0; c < hand[p].length; c++) {
            if (now > hand[p][c].t0 && now < hand[p][c].t1) {
                let s = (hand[p][c].t1 - now) / (hand[p][c].t1 - hand[p][c].t0);
                let f = (now - hand[p][c].t0) / (hand[p][c].t1 - hand[p][c].t0);
                let r = [Math.PI/2, 0, Math.PI/2, 0][p];
                let x = hand[p][c].x0*s + hand[p][c].x1*f;
                let y = hand[p][c].y0*s + hand[p][c].y1*f;
                let e = 1;
                if (hand[p][c].v0 == gb && hand[p][c].v1 != gb)
                    e = Math.abs(s * 2 - 1);
                ctx.translate(x, y);
                ctx.rotate(r);
                if (s > 0.5)
                    ctx.drawImage(img[hand[p][c].v0], -cardWide/2, -cardHigh/2*e, cardWide, cardHigh*e);
                else
                    ctx.drawImage(img[hand[p][c].v1], -cardWide/2, -cardHigh/2*e, cardWide, cardHigh*e);
                ctx.resetTransform();
            }
        }
    }
    if (rendered)
        window.requestAnimationFrame(onDrawn);
    else
        window.requestAnimationFrame(draw);
}

// Redraw all hands after a change in the felt size
function redraw() {
    locate();
    for (let p = w; p <= s; p++) {
        for (let c = 0; c < hand[p].length; c++) {
            hand[p][c].x0 = hand[p][c].x;
            hand[p][c].y0 = hand[p][c].y;
            hand[p][c].x1 = hand[p][c].x;
            hand[p][c].y1 = hand[p][c].y;
        }
    }
    onDrawn = function() {};
    window.requestAnimationFrame(draw);
}

// Sort all hands and display south's hand
function sort() {
    const now = performance.now();
    for (let p = w; p <= s; p++) {
        for (let c = 0; c < maxHand; c++) {
            let v = hand[p][c].v;
            let j = c;
            for (let i = c + 1; i < maxHand; i++) {
                if (hand[p][i].v > v) {
                    v = hand[p][i].v;
                    j = i;
                }
            }
            hand[p][j].v = hand[p][c].v;
            hand[p][c].v = v;
        }
    }
    for (let p = w; p <= s; p++) {
        for (let c = 0; c < maxHand; c++) {
            hand[p][c].t0 = now;
            if (p == s)
                hand[p][c].v1 = hand[p][c].v;
            hand[p][c].t1 = now + sortTime;
        }
    }
    onDrawn = function() {};
    window.requestAnimationFrame(draw);
}

// Flip south's hand
function flip() {
    const now = performance.now();
    for (let p = w; p <= s; p++) {
        for (let c = 0; c < maxHand; c++) {
            hand[p][c].t0 = now;
            if (p == s)
                hand[p][c].v1 = hand[p][c].v;
            hand[p][c].t1 = now + flipTime;
        }
    }
    onDrawn = sort;
    window.requestAnimationFrame(draw);
}

// Deal shuffled deck starting with the player clockwise from the dealer
function deal() {
    const now = performance.now();
    const deck = Array.from(new Array(maxDeck), (v, k) => k % maxHand);
    dealer = Math.floor(Math.random() * players);
    shuffle(deck);
    locate();
    let d = 0;
    for (let c = 0; c < maxHand; c++) {
        for (let i = 0; i < players; i++) {
            let p = (dealer + i + 1) % players;
            hand[p][c].v = deck[d];
            hand[p][c].v0 = gb;
            hand[p][c].x0 = [-cardHigh, feltWide/2, feltWide+cardHigh, feltWide/2][dealer];
            hand[p][c].y0 = [feltHigh/2, -cardHigh, feltHigh/2, feltHigh+cardHigh][dealer];
            hand[p][c].t0 = now + d * (dealTime - flyTime) / maxDeck;
            hand[p][c].v1 = gb;
            hand[p][c].x1 = hand[p][c].x;
            hand[p][c].y1 = hand[p][c].y;
            hand[p][c].t1 = hand[p][c].t0 + flyTime;
            d++;
        }
    }
    onDrawn = flip;
    window.requestAnimationFrame(draw);
}

// Convert x,y coordinates to that hand's player index (or undefined)
function xy2p(x, y) {
    for (let p = s; p >= w; p--) {
        for (let c = hand[p].length - 1; c >= 0; c--) {
            let l = hand[p][c].x - [cardHigh/2, cardWide/2, cardHigh/2, cardWide/2][p];
            let r = hand[p][c].x + [cardHigh/2, cardWide/2, cardHigh/2, cardWide/2][p];
            let t = hand[p][c].y - [cardWide/2, cardHigh/2, cardWide/2, cardHigh/2][p];
            let b = hand[p][c].y + [cardWide/2, cardHigh/2, cardWide/2, cardHigh/2][p];
            if (x > l && x < r && y > t && y < b)
                return p;
            l = hand[p][c].x1 - [0, cardWide/2, cardHigh/2, cardWide/2][p];
            r = hand[p][c].x1 + [cardHigh/2, cardWide/2, 0, cardWide/2][p];
            t = hand[p][c].y1 - [cardWide/2, 0, cardWide/2, cardHigh/2][p];
            b = hand[p][c].y1 + [cardWide/2, cardHigh/2, cardWide/2, 0][p];
            if (p == selectedP && c == selectedC && x > l && x < r && y > t && y < b)
                return p;
        }
    }
}

// Convert x,y coordinates to that hand's card index (or undefined)
function xy2c(x, y) {
    for (let p = s; p >= w; p--) {
        for (let c = hand[p].length - 1; c >= 0; c--) {
            let l = hand[p][c].x - [cardHigh/2, cardWide/2, cardHigh/2, cardWide/2][p];
            let r = hand[p][c].x + [cardHigh/2, cardWide/2, cardHigh/2, cardWide/2][p];
            let t = hand[p][c].y - [cardWide/2, cardHigh/2, cardWide/2, cardHigh/2][p];
            let b = hand[p][c].y + [cardWide/2, cardHigh/2, cardWide/2, cardHigh/2][p];
            if (x > l && x < r && y > t && y < b)
                return c;
            l = hand[p][c].x1 - [0, cardWide/2, cardHigh/2, cardWide/2][p];
            r = hand[p][c].x1 + [cardHigh/2, cardWide/2, 0, cardWide/2][p];
            t = hand[p][c].y1 - [cardWide/2, 0, cardWide/2, cardHigh/2][p];
            b = hand[p][c].y1 + [cardWide/2, cardHigh/2, cardWide/2, 0][p];
            if (p == selectedP && c == selectedC && x > l && x < r && y > t && y < b)
                return c;
        }
    }
}

// Mouse move event: 
//      if rendered and (off-hand or off-selected) and any card is selected: unselect card that and ...
//      if rendered and on-hand and off-selected: select this card
function mouse(e) {
    const now = performance.now();
    const p = xy2p (e.clientX, e.clientY);
    const c = xy2c (e.clientX, e.clientY);
    if (rendered && (p == undefined || p != selectedP || c != selectedC) && selectedP != null) {
        hand[selectedP][selectedC].x1 = hand[selectedP][selectedC].x;
        hand[selectedP][selectedC].y1 = hand[selectedP][selectedC].y;
        hand[selectedP][selectedC].t1 = now;
        selectedP = null;
        selectedC = null;
        onDrawn = function() {};
        window.requestAnimationFrame(draw);
    }
    if (rendered && p != undefined && (p != selectedP || c != selectedC)) {
        selectedP = p;
        selectedC = c;
        hand[selectedP][selectedC].x1 = hand[selectedP][selectedC].x + [cardHigh/2, 0, -cardHigh/2, 0][selectedP];
        hand[selectedP][selectedC].y1 = hand[selectedP][selectedC].y + [0, cardHigh/2, 0, -cardHigh/2][selectedP];
        hand[selectedP][selectedC].t1 = now;
        onDrawn = function() {};
        window.requestAnimationFrame(draw);
    }
}

// Mouse press event: 
//      if rendered and on-hand: transiton card to lay and remove card from hand
function press(e) {
    const now = performance.now();
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
            if (p != s) {
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
                if (p == s)
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
    const now = performance.now();
    const p = xy2p (e.touches[0].clientX, e.touches[0].clientY);
    const c = xy2c (e.touches[0].clientX, e.touches[0].clientY);
    if (rendered && (p == undefined || p != selectedP || c != selectedC) && selectedP != null) {
        hand[selectedP][selectedC].x1 = hand[selectedP][selectedC].x;
        hand[selectedP][selectedC].y1 = hand[selectedP][selectedC].y;
        hand[selectedP][selectedC].t1 = now;
        selectedP = null;
        selectedC = null;
        onDrawn = function() {};
        window.requestAnimationFrame(draw);
    }
    if (rendered && p != undefined && (p != selectedP || c != selectedC)) {
        selectedP = p;
        selectedC = c;
        hand[selectedP][selectedC].x1 = hand[selectedP][selectedC].x + [cardHigh/2, 0, -cardHigh/2, 0][selectedP];
        hand[selectedP][selectedC].y1 = hand[selectedP][selectedC].y + [0, cardHigh/2, 0, -cardHigh/2][selectedP];
        hand[selectedP][selectedC].t1 = now;
        onDrawn = function() {};
        window.requestAnimationFrame(draw);
        return;
    }
    /*
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
            if (p != s) {
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
                if (p == s)
                    handImg[p][c].src = cardSrc[hand[p][c]];
                else
                    handImg[p][c].src = backSrc;
            handImg[p][hand[p].length].src = "";
            redraw();
            setTimeout(function(){rendered = true;}, 0);
        }
    }
    */
}

// Touch slide event: 
//      if rendered and (off-hand or off-selected) and any card is selected: unselect card and ...
//      if rendered and on-hand and off-selected: select this card
function slide(e) {
    const now = performance.now();
    const p = xy2p (e.touches[0].clientX, e.touches[0].clientY);
    const c = xy2c (e.touches[0].clientX, e.touches[0].clientY);
    if (rendered && (p == undefined || p != selectedP || c != selectedC) && selectedP != null) {
        hand[selectedP][selectedC].x1 = hand[selectedP][selectedC].x;
        hand[selectedP][selectedC].y1 = hand[selectedP][selectedC].y;
        hand[selectedP][selectedC].t1 = now;
        selectedP = null;
        selectedC = null;
        onDrawn = function() {};
        window.requestAnimationFrame(draw);
    }
    if (rendered && p != undefined && (p != selectedP || c != selectedC)) {
        selectedP = p;
        selectedC = c;
        hand[selectedP][selectedC].x1 = hand[selectedP][selectedC].x + [cardHigh/2, 0, -cardHigh/2, 0][selectedP];
        hand[selectedP][selectedC].y1 = hand[selectedP][selectedC].y + [0, cardHigh/2, 0, -cardHigh/2][selectedP];
        hand[selectedP][selectedC].t1 = now;
        onDrawn = function() {};
        window.requestAnimationFrame(draw);
    }
}

// Initialize the global variables that rely on the window size
function resize () {
    feltWide = Number.parseFloat(getComputedStyle(felt).width);
    feltHigh = Number.parseFloat(getComputedStyle(felt).height);
    padding  = Number.parseFloat(getComputedStyle(corner).top);
    cardWide = Number.parseFloat(getComputedStyle(corner).width);
    cardHigh = Number.parseFloat(getComputedStyle(corner).height);
    canvas.width  = feltWide;
    canvas.height = feltHigh;
    for (let v = 0; v < src.length; v++)
        img[v].src = src[v];
    redraw();
}

// Initialize javascript and start game after window loads
window.onload = function() {
    resize();
    window.onresize   = resize;
    corner.innerText  = version;
    reload.draggable  = false;
    felt.onmousemove  = mouse;
    //felt.onmousedown  = press;
    felt.ontouchstart = touch;
    felt.ontouchmove  = slide;
    deal();
}
