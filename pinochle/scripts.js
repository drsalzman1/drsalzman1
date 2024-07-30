"use strict";

// Player values
const west     = 0;
const north    = 1;
const east     = 2;
const south    = 3;
const players  = 4;
const player$  = ["West", "North", "East", "South"];

// Suit values
const diamonds = 0;
const clubs    = 5;
const hearts   = 10;
const spades   = 15;
const suit$    = ["Diamonds", "?", "?", "?", "?", "Clubs", "?", "?", "?", "?", "Hearts", "?", "?", "?", "?", "Spades"];

// Rank values
const jack     = 0;
const queen    = 1;
const king     = 2;
const ten      = 3;
const ace      = 4;
const ranks    = 5;
const rank$    = ["Jack", "Queen", "King", "Ten", "Ace"];

// Card value = rank + suit
const grayBack = 20;
const maxHand  = 20;
const maxDeck  = 80;

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

// hand[p][c] = player p's card c's card value (or -1)
const hand = [Array(maxHand), Array(maxHand), Array(maxHand), Array(maxHand)];

// held[p] = number of cards remaining in player p's hand
const held = [20, 20, 20, 20];

// Position class
class P {
    constructor() {
        this.x = 0;                 // x at card center
        this.y = 0;                 // y at card center
     }
}

// Animation class
class A {
    constructor() {
        this.v = 0;                 // card value
        this.x = 0;                 // x at card center
        this.y = 0;                 // y at card center
        this.m = 0;                 // multiplier for card height (0 to 1)
        this.c = 0;                 // clock value
     }
}

// Card groups
const stackd = 0;                   // in dealer's stacked or player's stacked position
const normal = 1;                   // in player's normal hand position
const bumped = 2;                   // in player's bumped hand position
const played = 3;                   // in player's played position 

// Card class
class C {
    constructor() {
        this.i    = 0;              // deck index
        this.v    = 0;              // card value
        this.g    = 0;              // card group
        this.z    = 0;              // draw order
        this.stck = new P;          // stackd position
        this.norm = new P;          // normal position
        this.bump = new P;          // bumped position
        this.play = new P;          // played position
        this.strt = new A;          // start animation
        this.fnsh = new A;          // finish animation
    }
}

// deck[i] = deck card i
const deck = [
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C
];

// Page elements
const felt     = document.getElementById("felt");
const corner   = document.getElementById("corner");
const reload   = document.getElementById("reload");
const canvas   = document.getElementById("canvas");
const ctx      = canvas.getContext("2d");
const center   = document.getElementById("center");
const right    = document.getElementById("right");
const slider   = document.getElementById("slider");
const button   = document.getElementById("button");

// Animation constants
const dealTime  = 2000;             // milliseconds to deal all cards
const flyTime   = dealTime / 20;    // milliseconds to deal a card
const flipTime  = dealTime / 10;    // milliseconds to flip a card
const sortTime  = dealTime / 40;    // milliseconds to sort a card
const bumpTime  = dealTime / 20;    // milliseconds to bump/umbump a card
const playTime  = dealTime / 10;    // milliseconds to play a card
const closeTime = dealTime / 10;    // milliseconds to close gap in hand
const pullTime  = dealTime / 10;    // milliseconds to pull a trick

// Other constants
const version  = "v0.70";           // version number to display

// Global variables
let dealer  = 0;                    // the player who dealt
let bidder  = 0;                    // the next player to bid
let taker   = 0;                    // the player who won the bid
let turn    = 0;                    // the next player to play
let puller  = 0;                    // the player who won the play
let feltW   = 0;                    // felt width
let feltH   = 0;                    // felt height
let pad     = 0;                    // padding width and height
let cardW   = 0;                    // card width
let cardH   = 0;                    // card height
let onDrawn = function() {};        // function to invoke when all cards are drawn

// Locate all card positions
function locate() {
    const p1 = Math.min((feltH - cardH * 2 - cardW - pad * 4) / 19, cardW / 8);
    const p2 = (feltW - cardW - pad * 2) / 19;
    let h = 0;
    for (let i = 0; i < maxDeck; i++) {
        const p = Math.floor(i / maxHand);
        const c = i % maxHand;
        if (c == 0)
            h = 0;
        deck[i].stck.x = [-cardH/2, feltW/2, feltW + cardH/2, feltW/2][p];
        deck[i].stck.y = [feltH/2, -cardH/2, feltH/2, feltH + cardH/2][p];
        deck[i].norm.x = [cardH/2+pad, feltW/2-p1*(h-(held[p]-1)/2), feltW-cardH/2-pad, feltW/2+p2*(h-(held[p]-1)/2)][p];
        deck[i].norm.y = [feltH/2+p1*(h-(held[p]-1)/2), cardH/2+pad, feltH/2-p1*(h-(held[p]-1)/2), feltH-cardH/2-pad][p];
        deck[i].bump.x = deck[i].norm.x + [cardH/2, 0, -cardH/2, 0][p];
        deck[i].bump.y = deck[i].norm.y + [0, cardH/2, 0, -cardH/2][p];
        deck[i].play.x = feltW/2 + [-cardH/2-pad/2, cardW/2+pad/2, cardH/2+pad/2, -cardW/2-pad/2][p];
        deck[i].play.y = feltH/2 + [-cardW/2-pad/2, -cardH/2-pad/2, cardW/2+pad/2, cardH/2+pad/2][p];
        deck[i].strt.x = [deck[i].stck.x, deck[i].norm.x, deck[i].bump.x, deck[i].play.x][deck[i].g];
        deck[i].strt.y = [deck[i].stck.y, deck[i].norm.y, deck[i].bump.y, deck[i].play.y][deck[i].g];
        deck[i].fnsh.x = [deck[i].stck.x, deck[i].norm.x, deck[i].bump.x, deck[i].play.x][deck[i].g];
        deck[i].fnsh.y = [deck[i].stck.y, deck[i].norm.y, deck[i].bump.y, deck[i].play.y][deck[i].g];
        if (hand[p][c] != -1)
            h++;
    }
}

// Draw cards in z order until each card is at its final state then reset its start state for the next operation
function draw() {
    let rendered = true;
    const now = performance.now();
    deck.sort((a,b)=>a.z-b.z);
    ctx.clearRect(0, 0, feltW, feltH);
    for (let i = 0; i < maxDeck; i++) {
        const p = Math.floor(deck[i].i / maxHand);
        const r = [Math.PI/2, 0, Math.PI/2, 0][p];
        if (now < deck[i].fnsh.c)
            rendered = false;
        if (now <= deck[i].strt.c) {
            ctx.translate(deck[i].strt.x, deck[i].strt.y);
            ctx.rotate(r);
            ctx.drawImage(img[deck[i].strt.v], -cardW/2, -cardH/2*deck[i].strt.m, cardW, cardH*deck[i].strt.m);
            ctx.resetTransform();
        }
        if (now >= deck[i].fnsh.c) {
            ctx.translate(deck[i].fnsh.x, deck[i].fnsh.y);
            ctx.rotate(r);
            ctx.drawImage(img[deck[i].fnsh.v], -cardW/2, -cardH/2*deck[i].fnsh.m, cardW, cardH*deck[i].fnsh.m);
            ctx.resetTransform();
            deck[i].strt.v = deck[i].fnsh.v;
            deck[i].strt.x = deck[i].fnsh.x;
            deck[i].strt.y = deck[i].fnsh.y;
            deck[i].strt.m = deck[i].fnsh.m;
        }
        if (now > deck[i].strt.c && now < deck[i].fnsh.c) {
            const ps = (deck[i].fnsh.c - now) / (deck[i].fnsh.c - deck[i].strt.c);
            const pf = (now - deck[i].strt.c) / (deck[i].fnsh.c - deck[i].strt.c);
            const x = deck[i].strt.x*ps + deck[i].fnsh.x*pf;
            const y = deck[i].strt.y*ps + deck[i].fnsh.y*pf;
            const m = deck[i].strt.m*ps + deck[i].fnsh.m*pf;
            ctx.translate(x, y);
            ctx.rotate(r);
            ctx.drawImage(img[deck[i].strt.v], -cardW/2, -cardH/2*m, cardW, cardH*m);
            ctx.resetTransform();
        }
    }
    deck.sort((a,b)=>a.i-b.i);
    if (rendered)
        onDrawn();
    else
        window.requestAnimationFrame(draw);
}

// Redraw all cards after a change in the felt size
function redraw() {
    const now = performance.now();
    locate();
    for (let i = 0; i < maxDeck; i++) {
        deck[i].strt.c = now;
        deck[i].fnsh.c = now;
    }
    window.requestAnimationFrame(draw);
}

// Pull play cards after all players have played
function pull() {
    const now = performance.now();
    for (let i = 0; i < maxDeck; i++) {
        if (deck[i].g == played) {
            deck[i].g = stackd;
            deck[i].strt.c = now;
            deck[i].fnsh.x = deck[puller*maxHand].stck.x;
            deck[i].fnsh.y = deck[puller*maxHand].stck.y;
            deck[i].fnsh.c = now + pullTime;
        }
    }
    onDrawn = function() {};
    window.requestAnimationFrame(draw);
}

// Close hand after card i is played
function close(i) {
    const now = performance.now();
    const p = Math.floor(i / maxHand);
    const c = i % maxHand;
    hand[p][c] = -1;
    held[p]--;
    locate();
    for (let i = 0; i < maxDeck; i++) {
        deck[i].strt.c = now;
        deck[i].fnsh.c = now + closeTime;
    }
    if (turn == (taker + players - 0) % players) 
        onDrawn = pull;
    else
        onDrawn = function() {};
    window.requestAnimationFrame(draw);
}

// Play deck card i (part 2)
function play2(i) {
    const now = performance.now();
    deck[i].g = played;
    deck[i].z = -1;
    deck[i].strt.v = deck[i].v;
    deck[i].strt.c = now;
    deck[i].fnsh.v = deck[i].v;
    deck[i].fnsh.x = deck[i].play.x;
    deck[i].fnsh.y = deck[i].play.y;
    deck[i].fnsh.m = 1;
    deck[i].fnsh.c = now + playTime / 2;
    onDrawn = function() {close(i)};
    window.requestAnimationFrame(draw);
    turn = (turn + 1) % players;
}

// Play deck card i (part 1)
function play1(i) {
    const now = performance.now();
    const p = Math.floor(i / maxHand);
    deck[i].strt.c = now;
    deck[i].fnsh.x = (deck[i].fnsh.x + deck[i].play.x) / 2;
    deck[i].fnsh.y = (deck[i].fnsh.y + deck[i].play.y) / 2;
    if (p != s) 
        deck[i].fnsh.m = 0;
    deck[i].fnsh.c = now + playTime / 2;
    onDrawn = function() {play2(i);};
    window.requestAnimationFrame(draw);
}

// Returns number of rank arounds in player's hand
function arounds(player, rank) {
    let count = Array(maxHand).fill(0);
    for (let suit of [spades, hearts, clubs, diamonds]) {
        for (let card = 0; card < maxHand; card++)
            if (hand[player][card] == rank + suit)
                count[rank + suit]++;
    }
    return Math.min(count[rank + spades], count[rank + hearts], count[rank + clubs], count[rank + diamonds])
}

// Returns number of suit runs in the player's hand
function runs(player, suit) {
    let count = Array(maxHand).fill(0);
    for (let rank of [jack, queen, king, ten, ace]) {
        for (let card = 0; card < maxHand; card++)
            if (hand[player][card] == rank + suit)
                count[rank + suit]++;
    }
    return Math.min(count[ace + suit], count[ten + suit], count[king + suit], count[queen + suit], count[jack + suit])
}

// Return true if the player's hand has at le min pinochles
function pinochles(player) {
    let q = 0, j = 0;
    for (let card = 0; card < maxHand; card++) {
        if (hand[player][card] == queen + spades)
            q++;
        if (hand[player][card] == jack + diamonds)
            j++;
    }
    return Math.min(q, j);
}

// Returns number of suit marriage's in the player's hand
function marraiges(player, suit) {
    let k = 0, q = 0;
    for (let card = 0; card < maxHand; card++) {
        if (hand[player][card] == king + suit)
            k++;
        if (hand[player][card] == queen + suit)
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
    for (let suit of [diamonds, clubs, hearts, spades])
        if (suit == trump)
            m += marraiges(player, suit) * 4;
        else
            m += marraiges(player, suit) * 2;
    return m;
}

// Bid 
function bid() {
    onDrawn = function() {};
    center.style.display = "flex";
    right.innerHTML = `<u>My Meld</u><br>${meld(south,spades)}<br>${meld(south,hearts)}<br>${meld(south,clubs)}<br>${meld(south,diamonds)}`;
}

// Sort all hands and display south's hand
function sort() {
    const now = performance.now();
    for (let d = 0; d < maxDeck; d++) {
        const p = Math.floor(d / maxHand);
        const c = d % maxHand;
        let v = deck[p*maxHand+c].v;
        let j = c;
        for (let i = c + 1; i < maxHand; i++) {
            if (deck[p*maxHand+i].v > v) {
                v = deck[p*maxHand+i].v;
                j = i;
            }
        }
        deck[p*maxHand+j].v = deck[p*maxHand+c].v;
        deck[p*maxHand+c].v = v;
        hand[p][c] = v;
        if (p == south) {
            deck[p*maxHand+c].strt.c = now;
            deck[p*maxHand+c].fnsh.v = deck[p*maxHand+c].v;
            deck[p*maxHand+c].fnsh.c = now + sortTime * c;
        }
    }
    onDrawn = bid;
    window.requestAnimationFrame(draw);
}

// Flip south's hand (part 2)
function flip2() {
    const now = performance.now();
    for (let i = 0; i < maxDeck; i++) {
        const p = Math.floor(i / maxHand);
        if (p == south) {
            deck[i].z = i % maxHand;
            deck[i].strt.v = deck[i].v;
            deck[i].strt.m = 0;
            deck[i].strt.c = now;
            deck[i].fnsh.v = deck[i].v;
            deck[i].fnsh.m = 1;
            deck[i].fnsh.c = now + flipTime / 2;
        }
    }
    onDrawn = sort;
    window.requestAnimationFrame(draw);
}

// Flip south's hand (part 1)
function flip1() {
    const now = performance.now();
    for (let i = 0; i < maxDeck; i++) {
        const p = Math.floor(i / maxHand);
        if (p == south) {
            deck[i].strt.m = 1;
            deck[i].strt.c = now;
            deck[i].fnsh.m = 0;
            deck[i].fnsh.c = now + flipTime / 2;
        }
    }
    onDrawn = flip2;
    window.requestAnimationFrame(draw);
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

// Deal shuffled deck starting with the first bidder
function deal() {
    const now = performance.now();
    const seq = Array.from(new Array(maxDeck), (v, k) => k % maxHand);
    dealer = Math.floor(Math.random() * players);
    bidder = taker = turn = puller = (dealer + 1) % players;
    shuffle(seq);
    locate();
    for (let s = 0; s < maxDeck; s++) {
        const p = (bidder + s) % players;
        const c = Math.floor(s / 4);
        const i = p * maxHand + c;
        const d = dealer * maxHand + c;
        deck[i].i = i;
        deck[i].v = seq[s];
        deck[i].g = normal;
        deck[i].z = maxHand - c - 1;
        deck[i].strt.v = grayBack;
        deck[i].strt.x = deck[d].stck.x;
        deck[i].strt.y = deck[d].stck.y;
        deck[i].strt.m = 1;
        deck[i].strt.c = now + s * (dealTime - flyTime) / maxDeck;
        deck[i].fnsh.v = grayBack;
        deck[i].fnsh.x = deck[i].norm.x;
        deck[i].fnsh.y = deck[i].norm.y;
        deck[i].fnsh.m = 1;
        deck[i].fnsh.c = deck[i].strt.c + flyTime;
    }
    onDrawn = flip1;
    window.requestAnimationFrame(draw);
}

// Convert x,y coordinates to index of top card (or undefined)
function xy2i(x, y) {
    let topI, l, r, t, b;
    deck.sort((a,b)=>a.z-b.z);
    for (let d = 0; d < maxDeck; d++) {
        const i = deck[d].i;
        const p = Math.floor(i / maxHand);
        switch(deck[d].g) {
        case normal:
            l = deck[d].norm.x - [cardH/2, cardW/2, cardH/2, cardW/2][p];
            r = deck[d].norm.x + [cardH/2, cardW/2, cardH/2, cardW/2][p];
            t = deck[d].norm.y - [cardW/2, cardH/2, cardW/2, cardH/2][p];
            b = deck[d].norm.y + [cardW/2, cardH/2, cardW/2, cardH/2][p];
            if (x >= l && x <= r && y >= t && y <= b)
                topI = i;
            break;
        case bumped:
            l = deck[d].norm.x - [cardH/2, cardW/2, cardH/1, cardW/2][p];
            r = deck[d].norm.x + [cardH/1, cardW/2, cardH/2, cardW/2][p];
            t = deck[d].norm.y - [cardW/2, cardH/2, cardW/2, cardH/1][p];
            b = deck[d].norm.y + [cardW/2, cardH/1, cardW/2, cardH/2][p];
            if (x >= l && x <= r && y >= t && y <= b)
                topI = i;
        }
    }
    deck.sort((a,b)=>a.i-b.i);
    return topI;
}

// If mouse points off a bumped card, unbump all cards, and if mouse points to a normal card, bump it
function mouse(e) {
    const now = performance.now();
    const i = xy2i (e.clientX, e.clientY);
    if (i == undefined || deck[i].g != bumped) {
        for (let d = 0; d < maxDeck; d++) {
            if (deck[d].g == bumped) {
                deck[d].g = normal;
                deck[d].strt.c = now;
                deck[d].fnsh.x = deck[d].norm.x;
                deck[d].fnsh.y = deck[d].norm.y;
                deck[d].fnsh.c = now + bumpTime;
                window.requestAnimationFrame(draw);
            }
        }
    }
    if (i != undefined && deck[i].g == normal) {
        deck[i].g = bumped;
        deck[i].strt.c = now;
        deck[i].fnsh.x = deck[i].bump.x;
        deck[i].fnsh.y = deck[i].bump.y;
        deck[i].fnsh.c = now + bumpTime;
        window.requestAnimationFrame(draw);
    }
}

// If mouse pressed normal/bumped card, unbump cards; if normal card, bump it; if it's its turn, play it
function press(e) {
    const now = performance.now();
    const i = xy2i (e.clientX, e.clientY);
    if (i != undefined) {
        for (let d = 0; d < maxDeck; d++) {
            if (d != i && deck[d].g == bumped) {
                deck[d].g = normal;
                deck[d].strt.c = now;
                deck[d].fnsh.x = deck[d].norm.x;
                deck[d].fnsh.y = deck[d].norm.y;
                deck[d].fnsh.c = now + bumpTime;
                window.requestAnimationFrame(draw);
            }
        }
        if (deck[i].g == normal) {
            deck[i].g = bumped;
            deck[i].strt.c = now;
            deck[i].fnsh.x = deck[i].bump.x;
            deck[i].fnsh.y = deck[i].bump.y;
            deck[i].fnsh.c = now + bumpTime;
            window.requestAnimationFrame(draw);
        }
        if (Math.floor(i / maxHand) == turn)
            play1(i);
    }
}

// If bumped card touched and it's its turn, play it; if touch isn't bumped card, unbump cards; if normal touched, bump it 
function touch(e) {
    felt.onmousedown = function() {};
    felt.onmousemove = function() {};
    const now = performance.now();
    const i = xy2i (e.touches[0].clientX, e.touches[0].clientY);
    if (i != undefined && deck[i].g == bumped && Math.floor(i / maxHand) == turn)
            play1(i);
    if (i == undefined || deck[i].g != bumped) {
        for (let d = 0; d < maxDeck; d++) {
            if (deck[d].g == bumped) {
                deck[d].g = normal;
                deck[d].strt.c = now;
                deck[d].fnsh.x = deck[d].norm.x;
                deck[d].fnsh.y = deck[d].norm.y;
                deck[d].fnsh.c = now + bumpTime;
                window.requestAnimationFrame(draw);
            }
        }
    }
    if (i != undefined && deck[i].g == normal) {
        deck[i].g = bumped;
        deck[i].strt.c = now;
        deck[i].fnsh.x = deck[i].bump.x;
        deck[i].fnsh.y = deck[i].bump.y;
        deck[i].fnsh.c = now + bumpTime;
        window.requestAnimationFrame(draw);
    }
}

// If touch slides off a bumped card, unbump all cards, and if touch slides on a normal card, bump it
function slide(e) {
    const now = performance.now();
    const i = xy2i (e.touches[0].clientX, e.touches[0].clientY);
    if (i == undefined || deck[i].g != bumped) {
        for (let d = 0; d < maxDeck; d++) {
            if (deck[d].g == bumped) {
                deck[d].g = normal;
                deck[d].strt.c = now;
                deck[d].fnsh.x = deck[d].norm.x;
                deck[d].fnsh.y = deck[d].norm.y;
                deck[d].fnsh.c = now + bumpTime;
                window.requestAnimationFrame(draw);
            }
        }
    }
    if (i != undefined && deck[i].g == normal) {
        deck[i].g = bumped;
        deck[i].strt.c = now;
        deck[i].fnsh.x = deck[i].bump.x;
        deck[i].fnsh.y = deck[i].bump.y;
        deck[i].fnsh.c = now + bumpTime;
        window.requestAnimationFrame(draw);
    }
}

// Initialize the global variables that rely on the window size
function resize () {
    feltW = Number.parseFloat(getComputedStyle(felt).width);
    feltH = Number.parseFloat(getComputedStyle(felt).height);
    pad   = Number.parseFloat(getComputedStyle(corner).top);
    cardW = Number.parseFloat(getComputedStyle(corner).width);
    cardH = Number.parseFloat(getComputedStyle(corner).height);
    canvas.width  = feltW;
    canvas.height = feltH;
    redraw();
}

function bidChange() {
    button.value = "Bid: " + ["Pass", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "65"][slider.value];
}

function bidSubmit() {
    center.style.display = "none";
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
    slider.oninput    = bidChange;
    button.onclick    = bidSubmit;
    deal();
}
