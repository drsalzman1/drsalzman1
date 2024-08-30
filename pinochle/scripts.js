"use strict";

// Player values
const west     = 0;
const north    = 1;
const east     = 2;
const south    = 3;
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
const ranks    = 5;

// Card value = rank + suit (or none or grayBack)
const none     = -1;
const grayBack = 20;
const cards    = 20;

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

// hand[p][c] = player p's card c's card value
const hand = [Array(cards), Array(cards), Array(cards), Array(cards)];

// bid[p] = player p's bid (or none or pass)
const pass = 0;
const bid = [none, none, none, none];

// est[p] = player p's estimated meld based on jump bids
const typical = 14;
const est = [typical, typical, typical, typical];

// Position class
class P {
    constructor() {
        this.x = 0;                 // x at card center
        this.y = 0;                 // y at card center
        this.r = 0;                 // rotation (0=portrait, pi/2=landscape)
     }
}

// Animation class
class A {
    constructor() {
        this.x = 0;                 // x at card center
        this.y = 0;                 // y at card center
        this.r = 0;                 // rotation (0=portrait, pi/2=landscape)
        this.t = 0;                 // time to start or finish
     }
}

// Card groups
const stackd = 0;                   // stacked off table in front of dealer or player
const tabled = 1;                   // stacked on table in front of player
const normal = 2;                   // in player's normal hand position
const bumped = 3;                   // in player's bumped hand position
const center = 4;                   // in player's center position 

// Card class
class C {
    constructor() {
        this.i    = 0;              // deck index
        this.v    = 0;              // card value
        this.g    = 0;              // card group
        this.z    = 0;              // draw order
        this.stck = new P;          // stackd position
        this.norm = new P;          // normal position
        this.tabl = new P;          // tabled position
        this.bump = new P;          // bumped position
        this.cntr = new P;          // center position
        this.strt = new A;          // start animation
        this.fnsh = new A;          // finish animation
    }
}

// deck[i] = deck card index i
const indices = 80;
const deck = [
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C
];

// prob[p1][p2][v] = from p1's view, probability that p2 holds card value v (max 4.0) 
const prob = [
    [Array(cards), Array(cards), Array(cards), Array(cards)],
    [Array(cards), Array(cards), Array(cards), Array(cards)],
    [Array(cards), Array(cards), Array(cards), Array(cards)],
    [Array(cards), Array(cards), Array(cards), Array(cards)]
];

// played[v] = number of cards of value v played so far
const played = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

// Page elements
const body      = document.getElementById("body");
const canvas    = document.getElementById("canvas");
const context   = canvas.getContext("2d");
const bidText   = document.getElementById("bidText");
const meldSpan  = document.querySelectorAll("#meldColumn span");
const bidBox    = document.querySelectorAll("#bidBox div");
const bidBtn    = document.querySelectorAll("#bidText input");
const trumpText = document.getElementById("trumpText");
const trumpBtn  = document.querySelectorAll("#trumpText input");
const playText  = document.getElementById("playText");
const playPara  = document.querySelectorAll("#playText div");
const playBtn   = document.getElementById("playBtn");
const tossBtn   = document.getElementById("tossBtn");
const handText  = document.getElementById("handText");
const usOld     = document.getElementById("usOld");
const usMeld    = document.getElementById("usMeld");
const usTake    = document.getElementById("usTake");
const usNew     = document.getElementById("usNew");
const themOld   = document.getElementById("themOld");
const themMeld  = document.getElementById("themMeld");
const themTake  = document.getElementById("themTake");
const themNew   = document.getElementById("themNew");
const nextDiv   = document.getElementById("nextDiv");
const nextBtn   = document.getElementById("nextBtn");
const overDiv   = document.getElementById("overDiv");
const overText  = document.getElementById("overText");
const againBtn  = document.getElementById("againBtn");
const quitBtn   = document.getElementById("quitBtn");
const menu      = document.getElementById("menu");
const menuText  = document.getElementById("menuText");
const close     = document.getElementById("close");
const stats     = document.getElementById("stats");
const restart   = document.getElementById("restart");
const statsText = document.getElementById("statsText");
const diamondsT = document.getElementById("diamondsT");
const closeBtn  = document.getElementById("closeBtn");

// Animation constants
const dealTime  = 2000;             // milliseconds to deal all cards
const flyTime   = dealTime / 20;    // milliseconds to deal a card
const stackTime = dealTime / 10;    // milliseconds to stack cards
const sortTime  = dealTime / 4;     // milliseconds to sort cards
const fanTime   = dealTime / 10;    // milliseconds to stack cards
const bidTime   = dealTime / 4;     // milliseconds between bids
const bumpTime  = dealTime / 20;    // milliseconds to bump/umbump a card
const playTime  = dealTime / 10;    // milliseconds to play a card
const closeTime = dealTime / 10;    // milliseconds to close gaps in hand
const pullTime  = dealTime / 10;    // milliseconds to pull a trick

// Global variables
let ondone      = function () {};   // event to invoke after animation completes
let dealer      = south;            // the player who is dealing or last deckDealt
let bidder      = none;             // the player who is bidding or won the bid
let trump       = none;             // the bidder's trump suit
let firstPlayer = none;             // the player who plays first
let thisPlayer  = none;             // the player who is playing a card
let thisCard    = none;             // the card that is being center
let firstCard   = none;             // the card led in this hand
let highCard    = none;             // the high card in this hand (so far)
let highPlayer  = none;             // the player who center the high card
let ourBid      = none;             // our bid if we win the bid (or none)
let theirBid    = none;             // their bid if they win the bid (or none)
let ourMeld     = 0;                // total of north and south meld for this hand
let theirMeld   = 0;                // total of west and east meld for this hand
let ourTake     = 0;                // total of north and south points so far in hand
let theirTake   = 0;                // total of west and east points so far in hand
let ourScore    = 0;                // total of north and south points so far in game
let theirScore  = 0;                // total of west and east points so far in game
let openHand    = false;            // true if all hands show
let throwHand   = false;            // true if bidder decides to throw in the hand

// Dynamic sizes
let vw          = 0;                // view width
let vh          = 0;                // view height
let pad         = 0;                // padding derived from menu icon margin
let hpad        = 0;                // horizontal padding for east and west hands
let vpad        = 0;                // vertical padding for north and south hands 
let cardw       = 0;                // card width
let cardh       = 0;                // card height

// Return suit of card value v (or none if v is none)
function suit(v) {
    if (v == none)
        return none;
    return Math.floor(v / ranks) * ranks;
}

// Return rank of card value v (or none if v is none)
function rank(v) {
    if (v == none)
        return none;
    return v % ranks;
}

// Return highest card for player p in suit s (or none)
function highest(p, s) {
    let h = none;
    for (let c = 0; c < cards; c++)
        if (suit(hand[p][c]) == s && hand[p][c] > h)
            h = hand[p][c];
    return h;
}

// True is card value v follows the lead
function follow(v) {
    return suit(v) == suit(firstCard);
}

// True is player p can't follow the lead
function cantFollow(p) {
    return highest(p, suit(firstCard)) == none;
}

// True is player p can't trump
function cantTrump(p) {
    return highest(p, trump) == none;
}

// Convert deck index i to player p
function i2p(i) {
    return Math.floor(i / cards);
}

// Convert deck index i to card c
function i2c(i) {
    return i % cards;
}

// Convert player p and card c to deck index i
function pc2i(p, c) {
    return p * cards + c;
}

// Convert x,y coordinates to index of top card in south's hand (or undefined) 
function xy2i(x, y) {
    let topI;
    deck.sort((a,b)=>a.z-b.z);
    for (let i = 0; i < indices; i++) {
        const i2 = deck[i].i;
        const p = i2p(i2);
        if (p == south) {
            const l = deck[i].norm.x - cardw/2;
            const r = deck[i].norm.x + cardw/2;
            const t = deck[i].norm.y - cardh/2;
            const b = deck[i].norm.y + cardh/2;
            if (deck[i].g==normal && x>=l && x<=r && y>=t-cardh*0.0 && y<=b)
                topI = i2;
            if (deck[i].g==bumped && x>=l && x<=r && y>=t-cardh*0.4 && y<=b)
                topI = i2;
        }
    }
    deck.sort((a,b)=>a.i-b.i);
    return topI;
}

// Count number of times value v occurs in array a
function count(a, v) {
    let n = 0;
    for (let i = 0; i < a.length; i++)
        if (a[i] == v)
            n++;
    return n;
}

// Returns number of rank arounds in player's hand
function arounds(player, rank) {
    let n = 4;
    for (let suit of [spades, hearts, clubs, diamonds])
        n = Math.min(n, count(hand[player], rank+suit));
    return n;
}

// Returns number of suit runs in the player's hand
function runs(player, suit) {
    let n = 4;
    for (let rank of [jack, queen, king, ten, ace])
        n = Math.min(n, count(hand[player], rank+suit));
    return n;
}

// Return true if the player's hand has at le min pinochles
function pinochles(player) {
    return Math.min(count(hand[player], queen+spades), count(hand[player], jack+diamonds));
}

// Returns number of suit marriage's in the player's hand
function marriages(player, suit) {
    return Math.min(count(hand[player], king+suit), count(hand[player], queen+suit));
}

// Count player's meld based on trump suit
function countMeld(player, trump) {
    let m = 0;
    m += [0,   10,   100,    500,    500][arounds  (player, ace  )];
    m += [0,    8,    80,    500,    500][arounds  (player, king )];
    m += [0,    6,    60,    500,    500][arounds  (player, queen)];
    m += [0,    4,    40,    500,    500][arounds  (player, jack )];
    m += [0, 16-4, 150-8, 500-12, 500-16][runs     (player, trump)];
    m += [0,    4,    30,     90,    500][pinochles(player       )];
    for (let suit of [diamonds, clubs, hearts, spades])
        if (suit == trump)
            m += marriages(player, suit) * 4;
        else
            m += marriages(player, suit) * 2;
    return m;
}

// Return minimum meld in bidder's hand
function minMeld() {
    let mm = 999;
    for (let suit of [spades, hearts, clubs, diamonds])
        if (countMeld(bidder, suit) < mm)
            mm = countMeld(bidder, suit);
    return mm;
}

// Return maximum meld in bidder's hand
function maxMeld() {
    let mm = 0;
    for (let suit of [spades, hearts, clubs, diamonds])
        if (countMeld(bidder, suit) > mm)
            mm = countMeld(bidder, suit);
    return mm;
}

// Return suit with maximum meld 
function maxSuit() {
    for (let suit of [spades, hearts, clubs, diamonds])
        if (countMeld(bidder, suit) == maxMeld())
            return suit;
}

// Restore n cards of value v for player p to needed array
function restore(needed, p, v, n) {
    for (let i = 0; n > 0 && i < indices; i++) {
        const c = i2c(i);
        if (i2p(i) == p && hand[p][c] == v) {
            needed[c] = v;
            n--;
        }
    }
}

// Return next player after current player (or none if current is none)
function nextPlayer(current) {
    if (current == none)
        return none;
    return (current + 1) % players;
}

// Return next bid based on high bid (or none or pass)
function nextBid() {
    const high = Math.max(49, ...bid);
    if (high < 60)
        return high + 1;
    else
        return high + 5;
}

// Return jump bid based on high bid and minimum meld
function jumpBid() {
    const high = Math.max(50, ...bid);
    const bump = Math.round(minMeld() / 10);
    return Math.min(high + bump, 59);
}

// Return number of cards of suit s in the bidder's hand
function nSuit(s) {
    return count(hand[bidder],ace+s) + count(hand[bidder],ten+s) + count(hand[bidder],king+s) +
        count(hand[bidder],queen+s) + count(hand[bidder],jack+s);
}

// Return number of cards of rank r in the bidder's hand
function nRank(r) {
    return count(hand[bidder],r+spades) + count(hand[bidder],r+hearts) +
        count(hand[bidder],r+clubs) + count(hand[bidder],r+diamonds);
}

// Return number of cards in bidder's short suit
function nShort() {
    return Math.min(nSuit(spades), nSuit(hearts), nSuit(clubs), nSuit(diamonds));
}

// Return quality = cards in best suit + aces - cards in bidder's short suit (7+4-3-8=0)
function quality() {
    return nSuit(maxSuit()) + nRank(ace) - nShort() - 8;
}

// Return true if bidder has no marriages
function noMarriages() {
    return marriages(bidder, spades) == 0 && marriages(bidder, hearts) == 0 && 
        marriages(bidder, clubs) == 0 && marriages(bidder, diamonds) == 0;
}

// Return computer bidder's bid
function autoBid() {
    const left = (bidder + 1) % players;
    const right = (bidder - 1) % players;
    const partner = (bidder + 2) % players;
    const highBid = Math.max(...bid);
    const maxBid = maxMeld() + est[partner] + 20 + quality();
    let t = "Autobid:" + bidder + ", minMeld:" + minMeld() + ", maxBid:" + maxBid + " (" + maxMeld() + "+" + est[partner] + "+20+" + quality() + "), ";
    if (count(bid, pass) == 3) {
        console.log(t + "last bidder");
        return Math.max(bid[bidder], 50);
    }
    if (noMarriages()) {
        console.log(t + "no marriages");
        return pass;
    }
    if (bid[left]==none && bid[right]!=pass && highBid<60 && quality()>0 && maxBid>=60) {
        console.log(t + "block jump");
        return 60;
    }
    if (bid[bidder]==none && bid[partner]!=pass && highBid<58 && minMeld()>15) {
        const high = Math.max(50, ...bid);
        const bump = Math.round(minMeld() / 10);
        const jump = Math.min(high + bump, 59);
        est[bidder] = (jump - high) * 10;
        console.log(t + "jumpable");
        return jump;
    }
    if (highBid<60 && quality()>0 && maxBid>=60 && maxBid<70) {
        console.log(t + "worried");
        return 60;
    }
    if (quality()>0 && nextBid() <= maxBid) {
        console.log(t + "want bid");
        return nextBid();
    }
    if (highBid<50 && partner==dealer) {
        console.log(t + "save partner");
        return nextBid();
    }
    console.log(t + "meh");
    return pass;
}

// Return true if bidder has run in best suit
function run() {
    return runs(bidder, maxSuit()) > 0;
}

// Return computer bidder's trump selection
function autoPick() {
    const partner = (bidder + 2) % players;
    let n = 0, t;
    if (nRank(king) + nRank(queen) == 0)                        // no kings or queens
        for (let s of [spades, hearts, clubs, diamonds]) {
            if (count(hand[bidder], ace+s) > n) {
                n = count(hand[bidder], ace+s);
                t = s;
            }
            if (count(hand[bidder], ten+s) > n) {
                n = count(hand[bidder], ten+s);
                t = s;
            }
            if (count(hand[bidder], jack+s) > n) {
                n = count(hand[bidder], jack+s);
                t = s;
            }
        }
    else if (noMarriages())                                     // no marriages
        for (let s of [spades, hearts, clubs, diamonds]) {
            if (count(hand[bidder], king+s) > n) {
                n = count(hand[bidder], king+s);
                t = s;
            }
            if (count(hand[bidder], queen+s) > n) {
                n = count(hand[bidder], queen+s);
                t = s;
            }
        }
    else if (bid[bidder]>maxMeld()+est[partner]+20 && run())    // stretching w/ run
        t = maxSuit();
    else                                                        // all other cases
        for (let s of [spades, hearts, clubs, diamonds]) {
            if (marriages(bidder,s)>0 && nSuit(s)+count(bidder,ace+s)>n) {
                n = nSuit(s) + count(bidder, ace+s);
                t = s;
            }
        }
    return t;
}

// Return true is computer bidder tosses hand
function autoToss() {
    if (noMarriages())
        return true;
    return bid[bidder] > [theirMeld, ourMeld, theirMeld][bidder] + 40;
}

// Return true if deck card index i can be center
function legal(i) {
    const p = i2p(i);
    const c = i2c(i);
    const v = hand[p][c];
    if (v == none || p != thisPlayer)
        return false;
    if (suit(firstCard) == none)
        return true;
    if (suit(firstCard)!=trump && suit(highCard)==trump) {
        if (follow(v))
            return true;
        if (cantFollow(p) && suit(v)==trump && v>highCard)
            return true;
        if (cantFollow(p) && highest(p,trump)<=highCard && suit(v)==trump)
            return true;
        if (cantFollow(p) && cantTrump(p))
            return true;
    } else {
        if (follow(v) && v>highCard)
            return true;
        if (follow(v) && highest(p,suit(firstCard))<=highCard)
            return true;
        if (cantFollow(p) && suit(v)==trump)
            return true;
        if (cantFollow(p) && cantTrump(p))
            return true;
        }
    return false;
}

/*
Lead:
    Play non-trump ace if no one is trumping that suit
    If partner has all remaining aces in a suit:
        Play king in that suit
        Play ten in that suit
        Play queen in that suit
        Play jack in that suit
    If partner alone is trumping a suit, or is over-trumping a suit:
        Play king in that suit
        Play ten in that suit
        Play queen in that suit
        Play jack in that suit

*/

// Return computer player p's card index
function autoSelect(p) {
    for (let c = 0; c < cards; c++) {
        const i = pc2i(p, c);
        if (legal(i))
            return c;
    }
}

// Shuffle an array in place
function shuffleArray(array) {
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

// Locate all card positions (n = number of semi-exposed cards; v = visible card number)
function locateCards() {
    for (let p of [west, north, east, south]) {
        const n = cards - count(hand[p], none) - 1;
        let v = 0;
        for (let c = 0; c < cards; c++) {
            const i = pc2i(p, c);
            deck[i].stck.x = [-cardh/2, vw/2, vw+cardh/2, vw/2][p];
            deck[i].stck.y = [vh/2, -cardh/2, vh/2, vh+cardh/2][p];
            deck[i].stck.r = [Math.PI/2, 0, Math.PI/2, 0][p];
            deck[i].tabl.x = [cardw+hpad, vw/2, vw-cardw-hpad, vw/2][p];
            deck[i].tabl.y = [vh/2, cardw+vpad, vh/2, vh-cardw-vpad][p];
            deck[i].tabl.r = [Math.PI/2, 0, Math.PI/2, 0][p];
            deck[i].norm.x = [cardh/2+hpad, vw/2-cardw/4*(v-n/2), vw-cardh/2-hpad, vw/2+cardw/4*(v-n/2)][p];
            deck[i].norm.y = [vh/2+cardw/4*(v-n/2), cardh/2+vpad, vh/2-cardw/4*(v-n/2), vh-cardh/2-vpad][p];
            deck[i].norm.r = [Math.PI/2, 0, Math.PI/2, 0][p];
            deck[i].bump.x = deck[i].norm.x + [cardh*0.4, 0, -cardh*0.4, 0][p];
            deck[i].bump.y = deck[i].norm.y + [0, cardh*0.4, 0, -cardh*0.4][p];
            deck[i].bump.r = [Math.PI/2, 0, Math.PI/2, 0][p];
            deck[i].cntr.x = vw/2 + [-cardh/2-pad/2, cardw/2+pad/2, cardh/2+pad/2, -cardw/2-pad/2][p];
            deck[i].cntr.y = vh/2 + [-cardw/2-pad/2, -cardh/2-pad/2, cardw/2+pad/2, cardh/2+pad/2][p];
            deck[i].cntr.r = [Math.PI/2, 0, Math.PI/2, 0][p];
            deck[i].strt.x = [deck[i].stck.x, deck[i].tabl.x, deck[i].norm.x, deck[i].bump.x, deck[i].cntr.x][deck[i].g];
            deck[i].strt.y = [deck[i].stck.y, deck[i].tabl.y, deck[i].norm.y, deck[i].bump.y, deck[i].cntr.y][deck[i].g];
            deck[i].strt.r = [Math.PI/2, 0, Math.PI/2, 0][p];
            deck[i].fnsh.x = [deck[i].stck.x, deck[i].tabl.x, deck[i].norm.x, deck[i].bump.x, deck[i].cntr.x][deck[i].g];
            deck[i].fnsh.y = [deck[i].stck.y, deck[i].tabl.y, deck[i].norm.y, deck[i].bump.y, deck[i].cntr.y][deck[i].g];
            deck[i].fnsh.r = [Math.PI/2, 0, Math.PI/2, 0][p];
            if (hand[p][c] != none)
                v++;
        }
    }
}

// Deal shuffled deck array starting with the player next to the dealer
function prepareDeal() {
    const array = Array.from(new Array(indices), (v, k) => k % cards);
    const set = Array(cards).fill(0);
    let t = performance.now();
    for (let p1 of [west, north, east, west])
        for (let p2 of [west, north, east, west])
            for (let v = 0; v < indices; v++)
                prob[p1][p2][v] = 0.25;
    shuffleArray(array);
    for (let i = 0; i < indices; i++)
        hand[i2p(i)][i2c(i)] = array[i];
    for (let c = 0; c < cards; c++) {
        const v = hand[south][c] + set[c];
        prob[south][south][v] = 1.00;
        prob[south][west][v] = prob[south][north][v] = prob[south][east][v] = 0.00;
        set[c]++;
    }
    locateCards();
    for (let c = cards-1; c >= 0; c--) {
        for (let p of [(dealer+1)%players, (dealer+2)%players, (dealer+3)%players, dealer]) {
            const i = pc2i(p, c);            
            deck[i].i = i;
            deck[i].v = grayBack;
            deck[i].g = tabled;
            deck[i].z = cards - c - 1;
            deck[i].strt.x = deck[dealer*cards].stck.x;
            deck[i].strt.y = deck[dealer*cards].stck.y;
            deck[i].strt.r = deck[dealer*cards].stck.r;
            deck[i].strt.t = t;
            deck[i].fnsh.x = deck[i].tabl.x + (Math.random()-0.5)*cardw/2;
            deck[i].fnsh.y = deck[i].tabl.y + (Math.random()-0.5)*cardw/2;
            if (p == (dealer+1)%players)
                deck[i].stck.r = deck[i].strt.r - Math.PI/2;
            else if (p == (dealer+2)%players)
                deck[i].stck.r = deck[i].strt.r;
            else if (p == (dealer+3)%players)
                deck[i].stck.r = deck[i].strt.r + Math.PI/2;
            else
                deck[i].stck.r = deck[i].strt.r;
            deck[i].fnsh.r = deck[i].stck.r + (Math.random()-0.5)*Math.PI/4;
            deck[i].fnsh.t = t + flyTime;
            t = t + (dealTime - flyTime) / indices;
        }
    }
}

// Initialize the global variables based on the size of body
function setSizes() {
    vw = Number.parseFloat(getComputedStyle(body).width);
    vh = Number.parseFloat(getComputedStyle(body).height);
    if (vw < vh) {
        cardw = Math.min(vw/(1+19/4+2/10), vh/(1+19/4+2*3.5/2.5+2/3+6/10));
        hpad = vw/2 - cardw*(1+19/4)/2;
        vpad = cardw/3 + 2*cardw/10;
    } else {
        cardw = Math.min(vh/(1+19/4+2/10), vw/(1+19/4+2*3.5/2.5+2/3+6/10));
        hpad = cardw/3 + 2*cardw/10;
        vpad = vh/2 - cardw*(1+19/4)/2;
    }
    cardh = cardw / 2.5 * 3.5;
    pad = cardw/10;
    canvas.width  = vw;
    canvas.height = vh;
}

// Request first animation frame and save animation complete event handler
function animate(nextEventHandler) {
    requestAnimationFrame(frameEvent);
    ondone = nextEventHandler;
}

/////////////////////////////////////////////////////////////
//                     EVENT HANDLERS                      //
/////////////////////////////////////////////////////////////

// Animation frame event: draw next frame, then retrigger frameEvent or trigger ondrawn
function frameEvent() {
    let done = true;
    const now = performance.now();
    deck.sort((a,b)=>a.z-b.z);
    context.clearRect(0, 0, vw, vh);
    for (let i = 0; i < indices; i++) {
        if (now < deck[i].fnsh.t)
            done = false;
        if (now <= deck[i].strt.t) {
            context.translate(deck[i].strt.x, deck[i].strt.y);
            context.rotate(deck[i].strt.r);
            context.drawImage(img[deck[i].v], -cardw/2, -cardh/2, cardw, cardh);
            context.resetTransform();
        }
        if (now >= deck[i].fnsh.t) {
            context.translate(deck[i].fnsh.x, deck[i].fnsh.y);
            context.rotate(deck[i].fnsh.r);
            context.drawImage(img[deck[i].v], -cardw/2, -cardh/2, cardw, cardh);
            context.resetTransform();
            deck[i].strt.x = deck[i].fnsh.x;
            deck[i].strt.y = deck[i].fnsh.y;
            deck[i].strt.r = deck[i].fnsh.r;
        }
        if (now > deck[i].strt.t && now < deck[i].fnsh.t) {
            const ps = (deck[i].fnsh.t - now) / (deck[i].fnsh.t - deck[i].strt.t);
            const pf = (now - deck[i].strt.t) / (deck[i].fnsh.t - deck[i].strt.t);
            const x = deck[i].strt.x*ps + deck[i].fnsh.x*pf;
            const y = deck[i].strt.y*ps + deck[i].fnsh.y*pf;
            const r = deck[i].strt.r*ps + deck[i].fnsh.r*pf;
            context.translate(x, y);
            context.rotate(r);
            context.drawImage(img[deck[i].v], -cardw/2, -cardh/2, cardw, cardh);
            context.resetTransform();
        }
    }
    deck.sort((a,b)=>a.i-b.i);
    if (!done)
        requestAnimationFrame(frameEvent);
    else {
        setTimeout(ondone);
        ondone = function () {};
    }
}

// Next button clicked: deal the next hand, then trigger deckDealt
function nextClicked() {
    nextBtn.onclick = "";
    handText.style.display = "none";
    prepareDeal();
    animate(deckDealt);
}

// Again button clicked: reload app
function againClicked() {
    againBtn.onclick = "";
    quitBtn.onclick = "";
    location.reload();
}

// Quit button clicked: close app
function quitClicked() {
    againBtn.onclick = "";
    quitBtn.onclick = "";
    close();
}

// Hand ended: display stats and await contClicked, againClicked or quitClicked
function handEnded() {
    usOld.textContent = ourScore;
    themOld.textContent = theirScore;
    usMeld.textContent = ourMeld;
    themMeld.textContent = theirMeld;
    usTake.textContent = ourTake;
    themTake.textContent = theirTake;
    if (ourMeld < 20)
        ourMeld = 0;
    if (theirMeld < 20)
        theirMeld = 0;
    if (throwHand)
        if (bidder==north || bidder==south) {
            ourScore -= ourBid;
            theirScore += theirMeld;
        } else {
            theirScore -= theirBid;
            ourScore += ourMeld;
        }
    else {
        if (ourTake < 20)
            ourMeld = ourTake = 0;
        if (theirTake < 20)
            theirMeld = theirTake = 0;
        if (ourMeld + ourTake >= ourBid)
            ourScore += ourMeld + ourTake;
        else
            ourScore -= ourBid;        
        if (theirMeld + theirTake >= theirBid)
            theirScore += theirMeld + theirTake;
        else
            theirScore -= theirBid;
    }
    usNew.textContent = ourScore;
    themNew.textContent = theirScore;
    if (ourScore < 500 && theirScore < 500) {
        nextDiv.style.display = "block";
        overDiv.style.display = "none";
        handText.style.display = "block";
        dealer = nextPlayer(dealer);
        nextBtn.onclick = nextClicked;
    } else {
        nextDiv.style.display = "none";
        overDiv.style.display = "block";
        if (ourScore >= 500)
            overText.textContent = "We win!";
        else
            overText.textContent = "We lose!";
        handText.style.display = "block";
        againBtn.onclick = againClicked;
        quitBtn.onclick = quitClicked;
    }
}

// Trick center: pull trick, then retrigger handsRefanned or trigger handEnded
function trickPlayed() {
    const now = performance.now();
    for (let i = 0; i < indices; i++)
        if (deck[i].g == center) {
            deck[i].g = stackd;
            deck[i].z = 100;
            deck[i].strt.t = now;
            deck[i].fnsh.x = deck[highPlayer*cards].stck.x;
            deck[i].fnsh.y = deck[highPlayer*cards].stck.y;
            deck[i].fnsh.t = now + pullTime;
            if (rank(deck[i].v)==ace || rank(deck[i].v)==ten || rank(deck[i].v)==king)
                if (highPlayer == north || highPlayer == south)
                    ourTake += 1;
                else
                    theirTake += 1;
        }
    if (count(hand[west], none) < cards) {
        thisPlayer = highPlayer;
        thisCard = none;
        highPlayer = none;
        highCard = none;
        firstCard = none;
        animate(handsRefanned);
    } else {
        if (highPlayer == north || highPlayer == south)
            ourTake += 2;
        else
            theirTake += 2;
        animate(handEnded);
    }
}

// Card fully center: close hand, then trigger trickPlayed or handsRefanned  
function cardPlayed() {
    const now = performance.now();
    for (let i = 0; i < indices; i++)
        if (i2p(i) == thisPlayer)
            deck[i].z -= 20;
    deck[pc2i(thisPlayer, thisCard)].z = 0;
    hand[thisPlayer][thisCard] = none;
    locateCards();
    for (let i = 0; i < indices; i++) {
        deck[i].strt.t = now;
        deck[i].fnsh.t = now + closeTime;
    }
    thisPlayer = nextPlayer(thisPlayer);
    if (thisPlayer == firstPlayer)
        animate(trickPlayed);
    else
        animate(handsRefanned);
}

// Card pulled: play the card face up, then trigger cardPlayed
function cardPulled() {
    const now = performance.now();
    const p = thisPlayer;
    const c = thisCard;
    const i = pc2i(p, c);
    deck[i].v = hand[p][c];
    deck[i].g = center;
    deck[i].z = 40;
    deck[i].strt.t = now;
    deck[i].fnsh.x = deck[i].cntr.x;
    deck[i].fnsh.y = deck[i].cntr.y;
    deck[i].fnsh.t = now + playTime;
    animate(cardPlayed);
}

// Card selected: pull back, then trigger cardPulled -or- play face, then trigger cardPlayed
function cardSelected() {
    const now = performance.now();
    const p = thisPlayer;
    const c = thisCard;
    const i = pc2i(p, c);
    const v = hand[p][c];
    const h = highCard;
    if (firstCard == none) {
        firstCard = v;
        firstPlayer = p;
    }
    if (h==none || suit(v)==suit(h)&&rank(v)>rank(h) || suit(v)==trump&&suit(h)!=trump) {
        highCard = v;
        highPlayer = p;
    }
    deck[i].strt.t = now;
    if (deck[i].v == grayBack) {
        deck[i].g = stackd;
        deck[i].fnsh.x = deck[i].stck.x;
        deck[i].fnsh.y = deck[i].stck.y;
        deck[i].fnsh.t = now + stackTime;
        animate(cardPulled);
    } else {
        deck[i].g = center;
        deck[i].fnsh.x = deck[i].cntr.x;
        deck[i].fnsh.y = deck[i].cntr.y;
        deck[i].fnsh.t = now + playTime;
        animate(cardPlayed);
    }
}

// Mouse moved: if off bumped card, unbump cards; if moved to normal legal card, bump it
function mouseMoved(e) {
    const now = performance.now();
    const i = xy2i (e.clientX, e.clientY);
    if (i == undefined || deck[i].g != bumped) {
        for (let i2 = 0; i2 < indices; i2++) {
            if (deck[i2].g == bumped) {
                deck[i2].g = normal;
                deck[i2].strt.t = now;
                deck[i2].fnsh.x = deck[i2].norm.x;
                deck[i2].fnsh.y = deck[i2].norm.y;
                deck[i2].fnsh.t = now + bumpTime;
                requestAnimationFrame(frameEvent);
            }
        }
    }
    if (i != undefined && deck[i].g == normal && legal(i)) {
        deck[i].g = bumped;
        deck[i].strt.t = now;
        deck[i].fnsh.x = deck[i].bump.x;
        deck[i].fnsh.y = deck[i].bump.y;
        deck[i].fnsh.t = now + bumpTime;
        requestAnimationFrame(frameEvent);
    }
}

// Mouse pressed: if normal/bumped southern card, unbump cards; if normal legal card, bump it; if legal, play it
function mousePressed(e) {
    const now = performance.now();
    const i = xy2i (e.clientX, e.clientY);
    if (i != undefined) {
        for (let i2 = 0; i2 < indices; i2++) {
            if (i2 != i && deck[i2].g == bumped) {
                deck[i2].g = normal;
                deck[i2].strt.t = now;
                deck[i2].fnsh.x = deck[i2].norm.x;
                deck[i2].fnsh.y = deck[i2].norm.y;
                deck[i2].fnsh.t = now + bumpTime;
                requestAnimationFrame(frameEvent);
            }
        }
        if (deck[i].g == normal && legal(i)) {
            deck[i].g = bumped;
            deck[i].strt.t = now;
            deck[i].fnsh.x = deck[i].bump.x;
            deck[i].fnsh.y = deck[i].bump.y;
            deck[i].fnsh.t = now + bumpTime;
            requestAnimationFrame(frameEvent);
        }
        if (legal(i)) {
            thisCard = i2c(i); 
            body.onmousemove = "";
            body.onmousedown = "";
            body.ontouchstart = "";
            body.ontouchmove = "";
            setTimeout(cardSelected);
        }
    }
}

// Touch started: if legal bumped card, play it; if isn't bumped card, unbump cards; if normal legal, bump it 
function touchStarted(e) {
    body.onmousedown = "";
    body.onmousemove = "";
    const now = performance.now();
    const i = xy2i (e.touches[0].clientX, e.touches[0].clientY);
    if (i != undefined && deck[i].g == bumped && legal(i)) {
        thisCard = i2c(i); 
        body.ontouchstart = "";
        body.ontouchmove = "";
        setTimeout(cardSelected);
        return;
    }
    if (i == undefined || deck[i].g != bumped) {
        for (let i2 = 0; i2 < indices; i2++) {
            if (deck[i2].g == bumped) {
                deck[i2].g = normal;
                deck[i2].strt.t = now;
                deck[i2].fnsh.x = deck[i2].norm.x;
                deck[i2].fnsh.y = deck[i2].norm.y;
                deck[i2].fnsh.t = now + bumpTime;
                requestAnimationFrame(frameEvent);
            }
        }
    }
    if (i != undefined && deck[i].g == normal && legal(i)) {
        deck[i].g = bumped;
        deck[i].strt.t = now;
        deck[i].fnsh.x = deck[i].bump.x;
        deck[i].fnsh.y = deck[i].bump.y;
        deck[i].fnsh.t = now + bumpTime;
        requestAnimationFrame(frameEvent);
    }
}

// Touch moved: if off bumped card, unbump cards; if normal legal card, bump it
function touchMoved(e) {
    const now = performance.now();
    const i = xy2i (e.touches[0].clientX, e.touches[0].clientY);
    if (i == undefined || deck[i].g != bumped) {
        for (let i2 = 0; i2 < indices; i2++) {
            if (deck[i2].g == bumped) {
                deck[i2].g = normal;
                deck[i2].strt.t = now;
                deck[i2].fnsh.x = deck[i2].norm.x;
                deck[i2].fnsh.y = deck[i2].norm.y;
                deck[i2].fnsh.t = now + bumpTime;
                requestAnimationFrame(frameEvent);
            }
        }
    }
    if (i != undefined && deck[i].g == normal && legal(i)) {
        deck[i].g = bumped;
        deck[i].strt.t = now;
        deck[i].fnsh.x = deck[i].bump.x;
        deck[i].fnsh.y = deck[i].bump.y;
        deck[i].fnsh.t = now + bumpTime;
        requestAnimationFrame(frameEvent);
    }
}

// Hands re-fanned: now select a card to play, then trigger cardSelected
function handsRefanned() {
    for (let i = 0; i < indices; i++)
        if (i2p(i) == thisPlayer)
            deck[i].z += 20;
    if (thisPlayer == south) {
        body.onmousemove = mouseMoved;
        body.onmousedown = mousePressed;
        body.ontouchstart = touchStarted;
        body.ontouchmove = touchMoved;
    } else {
        thisCard = autoSelect(thisPlayer);
        setTimeout (cardSelected, playTime);
    }
}

// Meld gathered: re-fan hands, then trigger handsRefanned
function meldGathered() {
    const now = performance.now();
    locateCards();
    for (let i = 0; i < indices; i++) {
        const p = i2p(i);
        const c = i2c(i);
        if (openHand || p == south) {
            deck[i].v = hand[p][c];
            deck[i].z = c;
        } else {
            deck[i].v = grayBack;
            deck[i].z = cards - c - 1;
        }
        deck[i].g = normal;
        deck[i].strt.t = now;
        deck[i].fnsh.x = deck[i].norm.x;
        deck[i].fnsh.y = deck[i].norm.y;
        deck[i].fnsh.t = now + stackTime;
    }
    firstPlayer = bidder;
    firstCard = none;
    thisPlayer = bidder;
    thisCard = none;
    ourTake = 0;
    theirTake = 0;
    animate(handsRefanned);
}

// Play button clicked: gather the meld, then trigger meldGathered
function playClicked() {
    const now = performance.now();
    playBtn.onclick = "";
    tossBtn.onclick = "";
    playText.style.display = "none";
    for (let i = 0; i < indices; i++) {
        deck[i].g = stackd;
        deck[i].strt.t = now;
        deck[i].fnsh.x = deck[i].stck.x;
        deck[i].fnsh.y = deck[i].stck.y;
        deck[i].fnsh.t = now + stackTime;
    }
    animate(meldGathered);
}

// Toss button clicked: gather the meld, then trigger handEnded
function tossClicked() {
    const now = performance.now();
    playBtn.onclick = "";
    tossBtn.onclick = "";
    playText.style.display = "none";
    for (let i = 0; i < indices; i++) {
        deck[i].g = stackd;
        deck[i].strt.t = now;
        deck[i].fnsh.x = deck[i].stck.x;
        deck[i].fnsh.y = deck[i].stck.y;
        deck[i].fnsh.t = now + stackTime;
    }
    animate(handEnded);
}

// Meld fanned: display situation, then await playClicked or tossClicked 
function meldFanned() {
    let weNeed = 20, theyNeed = 20;
    ourBid = [none, bid[north], none, bid[south]][bidder];
    theirBid = [bid[west], none, bid[east], none][bidder];
    ourMeld = countMeld(north, trump) + countMeld(south, trump);
    theirMeld = countMeld(west, trump) + countMeld(east, trump);
    if (bidder == north || bidder == south)
        if (ourMeld < 20)
            weNeed = bid[bidder];
        else
            weNeed = Math.max(20, bid[bidder] - ourMeld);
    else
        if (theirMeld < 20)
            theyNeed = bid[bidder];
        else
            theyNeed = Math.max(20, bid[bidder] - theirMeld);
    playPara[0].textContent = ["Your left opponent", "Your partner", "Your right opponent", "You"][bidder] +
        " won the bid at " + bid[bidder] + " and picked " +
        ["diamonds",,,,,"clubs",,,,,"hearts",,,,,"spades"][trump] + ".";
    playPara[1].textContent = "Our meld is " + ourMeld + "; their meld is " + theirMeld + ".";
    if (marriages(bidder, trump) == 0) {
        playPara[2].textContent = ["Your left opponent", "Your partner", "Your right opponent", "You"][bidder] +
            " must toss this hand due to no marriage in trump.";
        playBtn.style.display = "none";
        tossBtn.style.display = "inline";
    } else if (bidder!= south && autoToss()) {
        playPara[2].textContent = ["Your left opponent", "Your partner", "Your right opponent", "You"][bidder] +
            " decided to toss this hand.";
        playBtn.style.display = "none";
        tossBtn.style.display = "inline";
    } else {
        playPara[2].textContent = "We need to pull " + weNeed + "; they need to pull " + theyNeed + ".";
        playBtn.style.display = "inline";
        tossBtn.style.display = ["none", "none", "none", "inline"][bidder];
    }
    playBtn.onclick = playClicked;
    tossBtn.onclick = tossClicked;
    playText.style.display = "flex";
}

// Hands regathered: fan out meld, then trigger meldFanned
function handsRegathered() {
    const now = performance.now();
    const save = [Array(cards), Array(cards), Array(cards), Array(cards)];
    const need = Array(cards);
    for (let player of [west, north, east, south]) {
        save[player] = [...hand[player]];
        need.fill(none);
        for (let rank of [jack, queen, king, ace])
            for (let suit of [diamonds, clubs, hearts, spades])
                restore(need, player, rank+suit, arounds(player, rank));
        for (let rank of [jack, queen, king, ten, ace])
            restore(need, player, rank+trump, runs(player, trump));
        restore(need, player, jack+diamonds, pinochles(player));
        restore(need, player, queen+spades, pinochles(player));
        for (let rank of [queen, king]) 
            for (let suit of [diamonds, clubs, hearts, spades])
                restore(need, player, rank+suit, marriages(player, suit));
        hand[player] = [...need];
    }
    locateCards();
    for (let p of [west, north, east, south]) {
        for (let c = 0; c < cards; c++) {
            const i = pc2i(p, c);
            if (hand[p][c] != none) {
                deck[i].v = hand[p][c];
                deck[i].g = normal;
                deck[i].z = c;
                deck[i].strt.t = now;
                deck[i].fnsh.x = deck[i].norm.x;
                deck[i].fnsh.y = deck[i].norm.y;
                deck[i].fnsh.t = now + fanTime;
            }
        }
        hand[p] = [...save[p]];
    }
    animate(meldFanned);
}

// Trunp picked: regather hands, then trigger handsRegathered
function trumpPicked() {
    const now = performance.now();
    for (let i = 0; i < indices; i++) {
        deck[i].strt.t = now;
        deck[i].g = stackd;
        deck[i].fnsh.x = deck[i].stck.x;
        deck[i].fnsh.y = deck[i].stck.y;
        deck[i].fnsh.t = now + stackTime;
    }
    animate(handsRegathered);
}

// Trump button clicked: pick a trump suit, then trigger trumpPicked
function trumpClicked(e) {
    for (let t = 0; t < trumpBtn.length; t++)
        trumpBtn[t].onclick = "";
    switch (e.target.value) {
    case "Spades":
        trump = spades;
        break;
    case "Hearts":
        trump = hearts;
        break;
    case "Clubs":
        trump = clubs;
        break;
    case "Diamonds":
        trump = diamonds;
    }
    trumpText.style.display = "none";
    setTimeout(trumpPicked);
}

// Bid won: await trumpClicked or pick trump and trigger trumpPicked
function biddingDone() {
    for (bidder of [west, north, east, south])
        if (bid[bidder] > pass)
            break;
    if (bidder == south) {
        trumpBtn[0].disabled = marriages(south, spades) == 0;
        trumpBtn[1].disabled = marriages(south, hearts) == 0;
        trumpBtn[2].disabled = marriages(south, clubs) == 0;
        trumpBtn[3].disabled = marriages(south, diamonds) == 0;
        if (noMarriages())
            trumpBtn[0].disabled = trumpBtn[1].disabled = trumpBtn[2].disabled = trumpBtn[3].disabled = false;
        trumpText.style.display = "flex";
        for (let t = 0; t < trumpBtn.length; t++)
            trumpBtn[t].onclick = trumpClicked;
    } else {
        trump = autoPick();
        trumpText.style.display = "none";
        setTimeout(trumpPicked);
    }
}

// Bid button clicked: handle button and retrigger handsFanned or trigger biddingDone
function bidClicked(e) {
    const value = e.target.value;
    const highBid = Math.max(...bid);
    if (value == ">") {
        if (highBid < 60)
            bidBtn[1].value = Number(bidBtn[1].value) + 1;
        else
            bidBtn[1].value = Number(bidBtn[1].value) + 5;
        bidBtn[0].value = "<";
        return;
    }
    if (value == "<") {
        if (highBid < 60)
            bidBtn[1].value = Number(bidBtn[1].value) - 1;
        else
            bidBtn[1].value = Number(bidBtn[1].value) - 5;
        if (bidBtn[1].value == nextBid(highBid))
            bidBtn[0].value = "Pass";
        return;
    }
    bidBox[south].style.display = "block";
    bidBox[south].textContent = value;
    if (value == "Pass")
        bid[south] = pass;
    else {
        if (bid[south]==none && Number(value)>51 && Number(value)<60)
            est[south] = (Number(value) - Math.max(50, ...bid)) * 10;
        bid[south] = Number(value);
    }
    for (let b = 0; b < bidBtn.length; b++) {
        bidBtn[b].disabled = true;
        bidBtn[b].onclick = "";
    }
    bidder = nextPlayer(bidder);
    if (count(bid, pass) < 3) 
        setTimeout(handsFanned, bidTime);
    else {
        for (let p of [west, north, east, south])
            bidBox[p].style.display = "none";
        bidText.style.display = "none";
        setTimeout(biddingDone, bidTime);
    }
}

// Hands fanned: await bidClicked or autoBid and retrigger handsFanned or trigger biddingDone
function handsFanned() {
    while (bid[bidder] == pass) 
        bidder = nextPlayer(bidder);
    if (bid[bidder] == none) {
        bidBox[bidder].style.display = "block";
        if (bidder == south) {
            meldSpan[0].textContent = countMeld(south, spades);
            meldSpan[1].textContent = countMeld(south, hearts);
            meldSpan[2].textContent = countMeld(south, clubs);
            meldSpan[3].textContent = countMeld(south, diamonds);
            bidText.style.display = "flex";
        }
    }
    if (bidder == south) {
        bidBox[south].textContent = "";
        bidBtn[0].value = "Pass";
        bidBtn[1].value = nextBid(Math.max(...bid));
        bidBtn[2].value = ">";
        for (let b = 0; b < bidBtn.length; b++) {
            bidBtn[b].disabled = false;
            bidBtn[b].onclick = bidClicked;
        }
    } else {
        bid[bidder] = autoBid();
        if (bid[bidder] == pass)
            bidBox[bidder].textContent = "Pass";
        else
            bidBox[bidder].textContent = bid[bidder];
        bidder = nextPlayer(bidder);
        if (count(bid, pass) < 3) 
            setTimeout(handsFanned, bidTime);
        else {
            for (let p of [west, north, east, south])
                bidBox[p].style.display = "none";
            bidText.style.display = "none";
            setTimeout(biddingDone, bidTime);
        }
    }
}

// Hands gathered: sort and fan hands, then trigger handsFanned
function handsGathered() {
    const now = performance.now();
    for (let p of [west, north, east, south])
        hand[p].sort((a,b)=>b-a);
    for (let i = 0; i < indices; i++) {
        const p = i2p(i);
        const c = i2c(i);
        if (openHand || p == south) {
            deck[i].v = hand[p][c];
            deck[i].z = i;
        }
        deck[i].g = normal;
        deck[i].strt.t = now;
        deck[i].fnsh.x = deck[i].norm.x;
        deck[i].fnsh.y = deck[i].norm.y;
        deck[i].fnsh.t = now + fanTime;
    }
    bidder = nextPlayer(dealer);
    bid[west] = bid[north] = bid[east] = bid[south] = none;
    est[west] = est[north] = est[east] = est[south] = typical;
    animate(handsFanned);
}

// Deck dealt: gather hands, then trigger handsGathered
function deckDealt() {
    const now = performance.now();
    for (let i = 0; i < indices; i++) {
        deck[i].g = stackd;
        deck[i].strt.t = now;
        deck[i].fnsh.x = deck[i].stck.x;
        deck[i].fnsh.y = deck[i].stck.y;
        deck[i].fnsh.r = deck[i].stck.r;
        deck[i].fnsh.t = now + stackTime;
    }
    animate(handsGathered);
}

// Resize event: adjust dynamic sizes, then trigger deck redraw
function resized () {
    const now = performance.now();
    setSizes();
    locateCards();
    for (let i = 0; i < indices; i++) {
        deck[i].strt.t = now;
        deck[i].fnsh.t = now;
    }
    requestAnimationFrame(frameEvent);
}

// Menu close icon clicked: close the menu, then await nothing
function closeClicked() {
    menuText.style.display = "none";
    close.onclick = "";
}

// Menu icon clicked: display the menu
function menuClicked() {
    menuText.style.display = "block";
    close.onclick = closeClicked;
}

// Stats close button clicked: close the stats and menu displays, then await nothing
function statsCloseClicked() {
    statsText.style.display = "none";
    closeBtn.onclick = "";
}

// Stats menu item clicked: close menu and display stats, then await statsCloseClicked
function statsClicked() {
    menuText.style.display = "none";
    statsText.style.display = "block";
    closeBtn.onclick = statsCloseClicked;
}

// Restart menu item clicked: restart the app
function restartClicked() {
     location.reload();
}

// Calculate average short suit and average long suit by simulation
function test() {
    const array = Array.from(new Array(indices), (v, k) => k % cards);
    const start = performance.now();
    let n = 0, s = 0, l = 0, m = 0;
    while (performance.now() < start + 1000) {
        shuffleArray(array);
        for (let i = 0; i < indices; i++)
            hand[i2p(i)][i2c(i)] = array[i];
        for (bidder of [west, north, east, south]) {
            s += Math.min(nSuit(spades), nSuit(hearts), nSuit(clubs), nSuit(diamonds));
            l += Math.max(nSuit(spades), nSuit(hearts), nSuit(clubs), nSuit(diamonds));
            m += minMeld();
        }
        n += 4;
    }
    console.log("n:" + n + "\naverage short suit:" + s/n + "\naverage long suit" + l/n + "\naverage minMeld:" + m/n);
}

// Load event: initialize app and deal cards, then trigger deckDealt
function loaded() {
    console.clear();
    for (let i = 0; i < src.length; i++)
        img[i].src = src[i];
    onresize = resized;
    menu.draggable = false;
    menu.onclick = menuClicked;
    stats.onclick = statsClicked;
    restart.onclick = restartClicked;
    setSizes();
    prepareDeal();
    animate(deckDealt);
}

// Set function to be invoked after app is loaded and rendered
onload = loaded;