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

// v = card value; x,y = card center; t = time
class Card {
    constructor() {
        this.v = gb;
        this.x = 0;
        this.y = 0;
        this.t = 0;
    }
}

// stck[p] = player p's off-felt card stack
const stck = [new Card, new Card, new Card, new Card, new Card];

// cntr[p] = player p's center card; card value is gb if no center card
const cntr = [new Card, new Card, new Card, new Card, new Card];

// hand[p][c] = player p's card c's normal; hand[p].length = number of cards in player p's hand
const hand = [
    [new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card],
    [new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card],
    [new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card],
    [new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card]
];

// bump[p][c] = player p's card c's bumped; bump[p].length = number of cards in player p's hand
const bump = [
    [new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card],
    [new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card],
    [new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card],
    [new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card]
];

// strt[p][c] = player p's card c's start;  strt[p].length = number of cards in player p's hand
const strt = [
    [new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card],
    [new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card],
    [new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card],
    [new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card, new Card]
];

// fnsh[p][c] = player p's card c's finish; fnsh[p].length = number of cards in player p's hand
const fnsh = [
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
const sortTime   = dealTime / 20;
const selectTime = dealTime / 40;
const playTime    = dealTime / 10;

// Other constants
const version    = "v0.40";

// Global variables
let dealer       = s;
let bumpedP      = null;
let bumpedC      = null;
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

// Locate each player's hand cards and lay card
function locate() {
    let pitch = Math.min((feltHigh - cardHigh * 2 - cardWide - padding * 4) / 19, cardWide / 8);
    stck[w].x = -cardHigh/2;
    stck[w].y = feltHigh/2;
    cntr[w].x = feltWide/2 - cardHigh/2 - padding/2;
    cntr[w].y = feltHigh/2 - cardWide/2 - padding/2;
    for (let c = 0; c < hand[w].length; c++) {
        hand[w][c].x = cardHigh/2 + padding;
        hand[w][c].y = feltHigh/2 + pitch*(c-(hand[w].length-1)/2);
        bump[w][c].x = cardHigh/2 + padding + cardHigh/2;
        bump[w][c].y = feltHigh/2 + pitch*(c-(hand[w].length-1)/2);
    }
    pitch = Math.min((feltWide - cardWide * 2 - cardWide - padding * 4) / 19, cardWide / 8);
    stck[n].x = feltWide/2;
    stck[n].y = -cardHigh/2;
    cntr[n].x = feltWide/2 + cardWide/2 + padding/2;
    cntr[n].y = feltHigh/2 - cardHigh/2 - padding/2;
    for (let c = 0; c < hand[n].length; c++) {
        hand[n][c].x = feltWide/2 - pitch*(c-(hand[n].length-1)/2);
        hand[n][c].y = cardHigh/2 + padding;
        bump[n][c].x = feltWide/2 - pitch*(c-(hand[n].length-1)/2);
        bump[n][c].y = cardHigh/2 + padding + cardHigh/2;
    }
    pitch = Math.min((feltHigh - cardHigh * 2 - cardWide - padding * 4) / 19, cardWide / 8);
    stck[e].x = feltWide + cardHigh/2;
    stck[e].y = feltHigh/2;
    cntr[e].x = feltWide/2 + cardHigh/2 + padding/2;
    cntr[e].y = feltHigh/2 + cardWide/2 + padding/2;
    for (let c = 0; c < hand[e].length; c++) {
        hand[e][c].x = feltWide - cardHigh/2 - padding;
        hand[e][c].y = feltHigh/2 - pitch*(c-(hand[w].length-1)/2);
        bump[e][c].x = feltWide - cardHigh/2 - padding - cardHigh/2;
        bump[e][c].y = feltHigh/2 - pitch*(c-(hand[w].length-1)/2);
    }
    pitch = (feltWide - cardWide - padding * 2) / 19;
    stck[s].x = feltWide/2;
    stck[s].y = feltHigh + cardHigh/2;
    cntr[s].x = feltWide/2 - cardWide/2 - padding/2;
    cntr[s].y = feltHigh/2 + cardHigh/2 + padding/2;
    for (let c = 0; c < hand[s].length; c++) {
        hand[s][c].x = feltWide/2 + pitch*(c-(hand[n].length-1)/2);
        hand[s][c].y = feltHigh - cardHigh/2 - padding;
        bump[s][c].x = feltWide/2 + pitch*(c-(hand[n].length-1)/2);
        bump[s][c].y = feltHigh - cardHigh/2 - padding - cardHigh/2;
    }
}

// Draw cards until each card is at its final position then reset its start position for the next operation
// Cards with high indices cover ones with low indices; cards in motion cover static cards
function draw() {
    const now = performance.now();
    ctx.clearRect(0, 0, feltWide, feltHigh);
    rendered = true;
    for (let p = w; p <= s; p++) {
        let r = [Math.PI/2, 0, Math.PI/2, 0][p];
        for (let c = 0; c < hand[p].length; c++) {
            if (now < fnsh[p][c].t)
                rendered = false;
            if (now <= strt[p][c].t) {
                ctx.translate(strt[p][c].x, strt[p][c].y);
                ctx.rotate(r);
                ctx.drawImage(img[strt[p][c].v], -cardWide/2, -cardHigh/2, cardWide, cardHigh);
                ctx.resetTransform();
            }
            if (now >= fnsh[p][c].t) {
                ctx.translate(fnsh[p][c].x, fnsh[p][c].y);
                ctx.rotate(r);
                ctx.drawImage(img[fnsh[p][c].v], -cardWide/2, -cardHigh/2, cardWide, cardHigh);
                ctx.resetTransform();
                strt[p][c].v = fnsh[p][c].v;
                strt[p][c].x = fnsh[p][c].x;
                strt[p][c].y = fnsh[p][c].y;
                strt[p][c].t = fnsh[p][c].t;
            }
        }
    }
    for (let p = w; p <= s; p++) {
        for (let c = 0; c < hand[p].length; c++) {
            let r = [Math.PI/2, 0, Math.PI/2, 0][p];
            if (now > strt[p][c].t && now < fnsh[p][c].t) {
                let s = (fnsh[p][c].t - now) / (fnsh[p][c].t - strt[p][c].t);
                let f = (now - strt[p][c].t) / (fnsh[p][c].t - strt[p][c].t);
                let x = strt[p][c].x*s + fnsh[p][c].x*f;
                let y = strt[p][c].y*s + fnsh[p][c].y*f;
                let e = 1;
                if (strt[p][c].v == gb && fnsh[p][c].v != gb)
                    e = Math.abs(s * 2 - 1);
                ctx.translate(x, y);
                ctx.rotate(r);
                if (s > 0.5)
                    ctx.drawImage(img[strt[p][c].v], -cardWide/2, -cardHigh/2*e, cardWide, cardHigh*e);
                else
                    ctx.drawImage(img[fnsh[p][c].v], -cardWide/2, -cardHigh/2*e, cardWide, cardHigh*e);
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
            fnsh[p][c].x = hand[p][c].x;
            fnsh[p][c].y = hand[p][c].y;
        }
    }
    if (bumpedP != null) {
        fnsh[bumpedP][bumpedC].x = bump[bumpedP][bumpedC].x;
        fnsh[bumpedP][bumpedC].y = bump[bumpedP][bumpedC].y;
    }
    onDrawn = function() {};
    window.requestAnimationFrame(draw);
}

// Play player p's card c
function play(p, c) {
    const now = performance.now();
    hand[p][c].x = cntr[p].x;
    hand[p][c].y = cntr[p].y;
    strt[p][c].t = now;
    fnsh[p][c].v = hand[p][c].v;
    fnsh[p][c].x = hand[p][c].x;
    fnsh[p][c].y = hand[p][c].y;
    fnsh[p][c].t = now + playTime;
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
            if (p == s) {
                fnsh[p][c].v = hand[p][c].v;
                fnsh[p][c].t = now + sortTime * c;
            }
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
            strt[p][c].t = now;
            if (p == s)
                fnsh[p][c].v = hand[p][c].v;
            fnsh[p][c].t = now + flipTime;
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
            strt[p][c].v = gb;
            strt[p][c].x = stck[dealer].x;
            strt[p][c].y = stck[dealer].y;
            strt[p][c].t = now + d * (dealTime - flyTime) / maxDeck;
            fnsh[p][c].v = gb;
            fnsh[p][c].x = hand[p][c].x;
            fnsh[p][c].y = hand[p][c].y;
            fnsh[p][c].t = strt[p][c].t + flyTime;
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
            l = bump[p][c].x - [0, cardWide/2, cardHigh/2, cardWide/2][p];
            r = bump[p][c].x + [cardHigh/2, cardWide/2, 0, cardWide/2][p];
            t = bump[p][c].y - [cardWide/2, 0, cardWide/2, cardHigh/2][p];
            b = bump[p][c].y + [cardWide/2, cardHigh/2, cardWide/2, 0][p];
            if (p == bumpedP && c == bumpedC && x > l && x < r && y > t && y < b)
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
            l = bump[p][c].x - [0, cardWide/2, cardHigh/2, cardWide/2][p];
            r = bump[p][c].x + [cardHigh/2, cardWide/2, 0, cardWide/2][p];
            t = bump[p][c].y - [cardWide/2, 0, cardWide/2, cardHigh/2][p];
            b = bump[p][c].y + [cardWide/2, cardHigh/2, cardWide/2, 0][p];
            if (p == bumpedP && c == bumpedC && x > l && x < r && y > t && y < b)
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
    if (rendered && (p == undefined || p != bumpedP || c != bumpedC) && bumpedP != null) {
        fnsh[bumpedP][bumpedC].x = hand[bumpedP][bumpedC].x;
        fnsh[bumpedP][bumpedC].y = hand[bumpedP][bumpedC].y;
        fnsh[bumpedP][bumpedC].t = now;
        bumpedP = null;
        bumpedC = null;
        onDrawn = function() {};
        window.requestAnimationFrame(draw);
    }
    if (rendered && p != undefined && (p != bumpedP || c != bumpedC)) {
        bumpedP = p;
        bumpedC = c;
        fnsh[bumpedP][bumpedC].x = bump[bumpedP][bumpedC].x;
        fnsh[bumpedP][bumpedC].y = bump[bumpedP][bumpedC].y;
        fnsh[bumpedP][bumpedC].t = now;
        onDrawn = function() {};
        window.requestAnimationFrame(draw);
    }
}

// Mouse press event: 
//      if rendered and on-hand: transiton card to lay and remove card from hand
function press(e) {
    const p = xy2p (e.clientX, e.clientY);
    const c = xy2c (e.clientX, e.clientY);
    if (rendered && p != undefined) {
        play(p,c);
        bumpedP = null;
        bumpedC = null;
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
    if (rendered && (p == undefined || p != bumpedP || c != bumpedC) && bumpedP != null) {
        fnsh[bumpedP][bumpedC].x = hand[bumpedP][bumpedC].x;
        fnsh[bumpedP][bumpedC].y = hand[bumpedP][bumpedC].y;
        fnsh[bumpedP][bumpedC].t = now;
        bumpedP = null;
        bumpedC = null;
        onDrawn = function() {};
        window.requestAnimationFrame(draw);
    }
    if (rendered && p != undefined && (p != bumpedP || c != bumpedC)) {
        bumpedP = p;
        bumpedC = c;
        fnsh[bumpedP][bumpedC].x = bump[bumpedP][bumpedC].x;
        fnsh[bumpedP][bumpedC].y = bump[bumpedP][bumpedC].y;
        fnsh[bumpedP][bumpedC].t = now;
        onDrawn = function() {};
        window.requestAnimationFrame(draw);
        return;
    }
    if (rendered && p != undefined && p == bumpedP && c == bumpedC) {
        play(p,c);
        bumpedP = null;
        bumpedC = null;
    }
}

// Touch slide event: 
//      if rendered and (off-hand or off-selected) and any card is selected: unselect card and ...
//      if rendered and on-hand and off-selected: select this card
function slide(e) {
    const now = performance.now();
    const p = xy2p (e.touches[0].clientX, e.touches[0].clientY);
    const c = xy2c (e.touches[0].clientX, e.touches[0].clientY);
    if (rendered && (p == undefined || p != bumpedP || c != bumpedC) && bumpedP != null) {
        fnsh[bumpedP][bumpedC].x = hand[bumpedP][bumpedC].x;
        fnsh[bumpedP][bumpedC].y = hand[bumpedP][bumpedC].y;
        fnsh[bumpedP][bumpedC].t = now;
        bumpedP = null;
        bumpedC = null;
        onDrawn = function() {};
        window.requestAnimationFrame(draw);
    }
    if (rendered && p != undefined && (p != bumpedP || c != bumpedC)) {
        bumpedP = p;
        bumpedC = c;
        fnsh[bumpedP][bumpedC].x = bump[bumpedP][bumpedC].x;
        fnsh[bumpedP][bumpedC].y = bump[bumpedP][bumpedC].y;
        fnsh[bumpedP][bumpedC].t = now;
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
    redraw();
}

// Initialize javascript and start game after window loads
window.onload = function() {
    for (let v = 0; v < src.length; v++)
        img[v].src = src[v];
    resize();
    window.onresize   = resize;
    corner.innerText  = version;
    reload.draggable  = false;
    felt.onmousemove  = mouse;
    felt.onmousedown  = press;
    felt.ontouchstart = touch;
    felt.ontouchmove  = slide;
    deal();
}
