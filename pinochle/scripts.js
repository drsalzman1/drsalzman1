"use strict";

// Player values (or none)
const none     = -1;
const west     = 0;
const north    = 1;
const east     = 2;
const south    = 3;
const players  = 4;
const player$  = ["West", "North", "East", "South"];
const next     = [north,  east,    south,  west   ];
const us       = [false,  true,    false,  true   ];
const them     = [true,   false,   true,   false  ];


// Suit values (or none)
const diamonds = 0;
const clubs    = 5;
const hearts   = 10;
const spades   = 15;
const suits    = 4;
const suit$    = ["diamonds",,,,,"clubs",,,,,"hearts",,,,,"spades"];
const suitSrc  = ["suits/diamond.svg",,,,,"suits/club.svg",,,,,"suits/heart.svg",,,,,"suits/spade.svg"];

// Rank values (or none)
const jack     = 0;
const queen    = 1;
const king     = 2;
const ten      = 3;
const ace      = 4;
const ranks    = 5;
const rank$    = ["jack", "queen", "king", "ten", "ace"];
const rankSrc  = ["ranks/jack.svg", "ranks/queen.svg", "ranks/king.svg", "ranks/ten.svg", "suits/ace.svg"];

// Card values = rank + suit (or absent)
const values   = 20;
const absent   = 20;
const value$   = ["J♦","Q♦","K♦","T♦","A♦","J♣","Q♣","K♣","T♣","A♣","J♥","Q♥","K♥","T♥","A♥","J♠","Q♠","K♠","T♠","A♠","--"];

// suit[v] = suit of card value v
const suit     = [
    diamonds, diamonds, diamonds, diamonds, diamonds,
    clubs, clubs, clubs, clubs, clubs, 
    hearts, hearts, hearts, hearts, hearts, 
    spades, spades, spades, spades, spades,
    none
];

// rank[v] = rank of card value v
const rank    = [
    jack, queen, king, ten, ace, 
    jack, queen, king, ten, ace, 
    jack, queen, king, ten, ace, 
    jack, queen, king, ten, ace,
    none
];

// high[v] = card value v is a point card
const high    = [
    false, false, true, true, true, 
    false, false, true, true, true, 
    false, false, true, true, true, 
    false, false, true, true, true
];

// trmp[v] = card value v is a trump card
const trmp    = [
    false, false, false, false, false,
    false, false, false, false, false,
    false, false, false, false, false,
    false, false, false, false, false
];

// faceSrc[v] = face source file for card value v
const faceSrc = [
    "cards/jd.svg", "cards/qd.svg", "cards/kd.svg", "cards/td.svg", "cards/ad.svg", 
    "cards/jc.svg", "cards/qc.svg", "cards/kc.svg", "cards/tc.svg", "cards/ac.svg", 
    "cards/jh.svg", "cards/qh.svg", "cards/kh.svg", "cards/th.svg", "cards/ah.svg", 
    "cards/js.svg", "cards/qs.svg", "cards/ks.svg", "cards/ts.svg", "cards/as.svg"
];

// backSrc = back source file
const backSrc = "cards/gb.svg";

// faceImg[v] = face image structure for card value v
const faceImg = [
    new Image(), new Image(), new Image(), new Image(), new Image(), 
    new Image(), new Image(), new Image(), new Image(), new Image(), 
    new Image(), new Image(), new Image(), new Image(), new Image(), 
    new Image(), new Image(), new Image(), new Image(), new Image()
];

// backImg = back image structure
const backImg = new Image();

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
const gone = 0;                     // gone (not yet dealt, hidden from view, or pulled)
const heap = 1;                     // heap of dealt cards
const hand = 2;                     // normal hand position
const bump = 3;                     // bump hand position
const play = 4;                     // play position

// Card class
class C {
    constructor() {
        this.c    = 0;              // card number
        this.p    = 0;              // player value
        this.u    = false;          // player is us (north or south)
        this.v    = 0;              // card value
        this.s    = 0;              // card suit
        this.r    = 0;              // card rank
        this.t    = false;          // card take is one
        this.g    = 0;              // card group
        this.m    = false;          // card is in trump
        this.z    = 0;              // draw order
        this.f    = false;          // display face if true
        this.k    = false;          // card known to all players
        this.gone = new P;          // gone position
        this.heap = new P;          // heap position
        this.hand = new P;          // hand position
        this.bump = new P;          // bump position
        this.play = new P;          // play position
        this.strt = new A;          // start animation
        this.fnsh = new A;          // finish animation
    }
}

// card[c] = card c
const cards = 80;
const cardsPerPlayer = cards / players;
const card = [
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C
];

// plyr[c] = player assigned card c
const plyr = [
    west, west, west, west, west, west, west, west, west, west, west, west, west, west, west, west, west, west, west, west,
    north,north,north,north,north,north,north,north,north,north,north,north,north,north,north,north,north,north,north,north,
    east, east, east, east, east, east, east, east, east, east, east, east, east, east, east, east, east, east, east, east, 
    south,south,south,south,south,south,south,south,south,south,south,south,south,south,south,south,south,south,south,south,
];

// minC[p] = minimum card number assigned to player p
const minC = [0, 20, 40, 60];

// maxC[p] = maximum card number assigned to player p
const maxC = [19, 39, 59, 79];

// remaining[v] = remaining cards of value v to be played
const remaining = Array(values);

// maxCards[p][v] = most cards player p can hold of value v (revealed by meld and play)
const maxCards = [Array(values), Array(values), Array(values), Array(values)];

// minCards[p][v] = least cards player p can hold of value v (revealed by meld and play)
const minCards = [Array(values), Array(values), Array(values), Array(values)];

// barSrc[min][max] = bar image representing minCards[p][v] min and maxCards[p][v] max
const barSrc = [
    ["bars/0-0.svg", "bars/0-1.svg", "bars/0-2.svg", "bars/0-3.svg", "bars/0-4.svg"],
    ["",             "bars/1-1.svg", "bars/1-2.svg", "bars/1-3.svg", "bars/1-4.svg"],
    ["",             "",             "bars/2-2.svg", "bars/2-3.svg", "bars/2-4.svg"],
    ["",             "",             "",             "bars/3-3.svg", "bars/3-4.svg"],
    ["",             "",             "",             "",             "bars/4-4.svg"]
];

// Page elements
const docBody   = document.getElementById("docBody");
const docCanvas = document.getElementById("docCanvas");
const context   = docCanvas.getContext("2d");
const bidText   = document.getElementById("bidText");
const meldSpan  = document.querySelectorAll("#meldColumn span");
const bidBox    = document.querySelectorAll("#bidBox div");
const bidBtn    = document.querySelectorAll("#bidText input");
const trumpText = document.getElementById("trumpText");
const trumpBtn  = document.querySelectorAll("#trumpText input");
const playText  = document.getElementById("playText");
const playPara  = document.querySelectorAll("#playText div");
const showBtn   = document.getElementById("showBtn");
const playBtn   = document.getElementById("playBtn");
const tossBtn   = document.getElementById("tossBtn");
const handText  = document.getElementById("handText");
const usOld     = document.getElementById("usOld");
const usBid     = document.getElementById("usBid");
const usMeld    = document.getElementById("usMeld");
const usTake    = document.getElementById("usTake");
const usNew     = document.getElementById("usNew");
const themOld   = document.getElementById("themOld");
const themBid   = document.getElementById("themBid");
const themMeld  = document.getElementById("themMeld");
const themTake  = document.getElementById("themTake");
const themNew   = document.getElementById("themNew");
const nextDiv   = document.getElementById("nextDiv");
const overDiv   = document.getElementById("overDiv");
const overText  = document.getElementById("overText");
const menuIcon  = document.getElementById("menuIcon");
const trmpIcon  = document.getElementById("trmpIcon");
const menuText  = document.getElementById("menuText");
const revealTxt = document.getElementById("revealTxt");
const statsText = document.getElementById("statsText");
const spadesT   = document.getElementById("spadesT");
const heartsT   = document.getElementById("heartsT");
const clubsT    = document.getElementById("clubsT");
const diamondsT = document.getElementById("diamondsT");
const statField = document.querySelectorAll(".statColumn div");
const tutorText = document.getElementById("tutorText");
const tutorPage = document.querySelectorAll("#tutorText div");
const aboutText = document.getElementById("aboutText");
const vsText    = document.getElementById("vsText");
const iText     = document.getElementById("iText");
const iTrump    = document.getElementById("iTrump");
const iIcon     = document.getElementById("iIcon");
const iOutText  = document.getElementById("iOutText");
const iBar      = document.querySelectorAll(".bar");
const cardSize  = document.getElementById("cardSize");

// Communication channel with service worker
const channel = new BroadcastChannel("Pinochle");

// Animation constants
const fastDeal  = 2000;             // fast (2 second) deal
const slowDeal  = 20000;            // slow (10 second) deal
let dealTime    = fastDeal;         // milliseconds to deal all cards

// Global variables
let ondone      = "";               // event to invoke after animation completes
let dealer      = Math.floor(Math.random()*players); // the player who is dealing or last dealt
let bidder      = none;             // the player who is bidding or won the bid
let trump       = none;             // the bidder's trump suit
let mustToss    = false;            // true is bidder doesn't have a marriage in trump
let player      = none;             // the player who is choosing then playing a card
let chosen      = none;             // the card number that was chosen
let leadCard    = none;             // the card number that was lead
let highCard    = none;             // the card number of the highest card so far
let ourBid      = none;             // our bid if we win the bid (or none)
let theirBid    = none;             // their bid if they win the bid (or none)
let ourMeld     = 0;                // total of north and south meld for this hand
let theirMeld   = 0;                // total of west and east meld for this hand
let ourTake     = 0;                // total of north and south points so far in hand
let theirTake   = 0;                // total of west and east points so far in hand
let ourScore    = 0;                // total of north and south points so far in game
let theirScore  = 0;                // total of west and east points so far in game
let openHand    = false;            // true if faces for all hands are displayed
let tossHand    = false;            // true if bidder decides to toss in the hand
let tutorialPg  = none;             // tutorial page (or none)

// Dynamic sizes
let vw0         = 0;                // previous view width
let vh0         = 0;                // previous view height
let vw          = 0;                // view width
let vh          = 0;                // view height
let cardw       = 0;                // card width
let cardh       = 0;                // card height
let iconw       = 0;                // icon width
let iconh       = 0;                // icon height
let pad         = 0;                // padding around display elements
let hpad        = 0;                // horizontal padding for east and west hands
let vpad        = 0;                // vertical padding for north and south hands 

// Log debugText on console (comment out when done debugging)
function log(debugText = "") {
    console.log(debugText);
}

// Return number of cards of value v in player p's hand
function nValue(p, v) {
    let n = 0;
    for (let c = minC[p]; c <= maxC[p]; c++)
        if (card[c].g==hand && card[c].v==v)
            n++;
    return n;
}

// Return number of cards in group g
function nGroup(g) {
    let n = 0;
    for (let c = 0; c < cards; c++)
        if (card[c].g == g)
            n++;
    return n;
}

// Return number of cards of suit s in player p's hand
function nSuit(p, s) {
    let n = 0;
    for (let c = minC[p]; c <= maxC[p]; c++)
        if (card[c].g==hand && card[c].s==s)
            n++;
    return n;
}

// Return number of cards of rank r in player p's hand
function nRank(p, r) {
    let n = 0;
    for (let c = minC[p]; c <= maxC[p]; c++)
        if (card[c].g==hand && card[c].r==r)
            n++;
    return n;
}

// Return number of cards in player p's short suit
function nShort(p) {
    return Math.min(nSuit(p,spades), nSuit(p,hearts), nSuit(p,clubs), nSuit(p,diamonds));
}

// Return number of rank r arounds in player p's hand
function arounds(p, r) {
    let n = 4;
    for (let s of [spades, hearts, clubs, diamonds])
        n = Math.min(n, nValue(p, r+s));
    return n;
}

// Return number of suit s runs in the player p's hand
function runs(p, s) {
    let n = 4;
    for (let r of [jack, queen, king, ten, ace])
        n = Math.min(n, nValue(p, r+s));
    return n;
}

// Return number of pinochles in player p's hand
function pinochles(p) {
    return Math.min(nValue(p, queen+spades), nValue(p, jack+diamonds));
}

// Return number of suit s marriage's in the player p's hand
function marriages(p, s) {
    return Math.min(nValue(p, king+s), nValue(p, queen+s));
}

// Return player p's meld based on trump suit t
function meld(p, t) {
    let m = 0;
    m += [0,   10,   100,    500,    500][arounds  (p, ace  )];
    m += [0,    8,    80,    500,    500][arounds  (p, king )];
    m += [0,    6,    60,    500,    500][arounds  (p, queen)];
    m += [0,    4,    40,    500,    500][arounds  (p, jack )];
    m += [0, 16-4, 150-8, 500-12, 500-16][runs     (p, t    )];
    m += [0,    4,    30,     90,    500][pinochles(p       )];
    for (let s of [diamonds, clubs, hearts, spades])
        m += marriages(p,s) * (s==t?4:2);
    return m;
}

// Return minimum meld in player p's hand
function minMeld(p) {
    let min = 999;
    for (let s of [spades, hearts, clubs, diamonds])
        min = Math.min(meld(p, s), min);
    return min;
}

// Return maximum meld in bidder's hand
function maxMeld(p) {
    let max = 0;
    for (let s of [spades, hearts, clubs, diamonds])
        max = Math.max(meld(p, s), max);
    return max;
}

// Return suit with maximum meld in player p's hand
function maxSuit(p) {
    for (let s of [spades, hearts, clubs, diamonds])
        if (meld(p, s) == maxMeld(p))
            return s;
}

// Tag n cards of value v in player p's hand as known to all
function tagCards(p, v, n) {
    for (let c = minC[p]; n > 0 && c <= maxC[p]; c++)
        if (card[c].v==v) {
            card[c].k = true;
            n--;
        }
}

// Tag meld in each player's hand
function tagMeld() {
    for (let p of [west, north, east, south])
        if ((us[p] && ourMeld<20) || (them[p] && theirMeld<20)) {
            if (p == bidder)
                for (let r of [queen, king]) 
                    tagCards(p, r+trump, Math.min(marriages(p, trump)), 1);
            for (let s of [diamonds, clubs, hearts, spades])
                tagCards(p, ace+s, arounds(p, ace));
        } else {
            for (let r of [jack, queen, king, ace])
                for (let s of [diamonds, clubs, hearts, spades])
                    tagCards(p, r+s, arounds(p, r));
            for (let r of [jack, queen, king, ten, ace])
                tagCards(p, r+trump, runs(p, trump));
            tagCards(p, jack+diamonds, pinochles(p));
            tagCards(p, queen+spades, pinochles(p));
            for (let r of [queen, king]) 
                for (let s of [diamonds, clubs, hearts, spades])
                    tagCards(p, r+s, marriages(p, s));
        }
}

// Return next bid based on high bid (or none or pass)
function nextBid() {
    const high = Math.max(49, ...bid);
    if (high < 60)
        return high + 1;
    else
        return high + 5;
}

// Return quality = cards in player p's best suit + aces - cards short suit (7+4-3-8=0)
function quality(p) {
    return nSuit(p,maxSuit(p)) + nRank(p,ace) - nShort(p) - 8;
}

// Return true if player p has no marriages
function noMarriages(p) {
    return marriages(p,spades)==0 && marriages(p,hearts)==0 && marriages(p,clubs)==0 && marriages(p,diamonds)==0;
}

// Log bidder's bid (text or number), quality(bidder), minMeld(bidder), maxMeld(bidder), est[partner] and reason
function logBid(bid, reason) {
    const partner = next[next[bidder]];
    let t = "";
    t += `bid[${player$[bidder][0]}]:`.padEnd(7) + `${bid},`.padEnd(6);
    t += `quality(${player$[bidder][0]}):${(quality(bidder)>=0?"+":"")+quality(bidder)},`.padEnd(16);
    t += `minMeld(${player$[bidder][0]}):${minMeld(bidder)},`.padEnd(16);
    t += `maxMeld(${player$[bidder][0]}):${maxMeld(bidder)},`.padEnd(16);
    t += `est[${player$[partner][0]}]:${est[partner]},`.padEnd(12);
    t += `reason:${reason}`;
    log(t);
}

// Return number of players who passed
function nPass() {
    return (bid[west]==pass?1:0) + (bid[north]==pass?1:0) + (bid[east]==pass?1:0) + (bid[south]==pass?1:0);
}

// Return computer bidder's bid
function autoBid() {
    const left    = next[bidder];
    const partner = next[left];
    const right   = next[partner];
    const highBid = Math.max(...bid);
    const maxBid  = maxMeld(bidder) + est[partner] + 20 + quality(bidder);
    if (nPass() == 3) {
        logBid(Math.max(bid[bidder], 50), "Last bid");
        return Math.max(bid[bidder], 50);
    }
    if (noMarriages(bidder)) {
        logBid("Pass", "No marriage");
        return pass;
    }
    if (bid[left]==none && bid[right]!=pass && highBid<60 && quality(bidder)>0 && maxBid>=60) {
        logBid(60, "Block bid");
        return 60;
    }
    if (bid[bidder]==none && bid[partner]!=pass && highBid<58 && minMeld(bidder)>15) {
        const high = Math.max(50, ...bid);
        const jump = Math.min(high + Math.round(minMeld(bidder)/10), 59);
        est[bidder] = (jump - high) * 10;
        logBid(jump, "Jump bid");
        return jump;
    }
    if (highBid<60 && quality(bidder)>=0 && maxBid>=60 && maxBid<70) {
        logBid(60, "Worried");
        return 60;
    }
    if (quality(bidder)>=0 && nextBid() <= maxBid) {
        logBid(nextBid(), "Want bid");
        return nextBid();
    }
    if (highBid<50 && partner==dealer) {
        logBid(50, "Save");
        return 50;
    }
    if (quality(bidder) < 0)
        logBid("Pass", "Bad quality");
    else
        logBid("Pass", "Too high");
    return pass;
}

// Return true if player p has a run in his best suit
function run(p) {
    return runs(p, maxSuit(p)) > 0;
}

// Return computer bidder's trump selection
function autoPick() {
    const partner = next[next[bidder]];
    let n = 0, t;
    if (nRank(bidder,king) + nRank(bidder,queen) == 0)          // no kings or queens
        for (let s of [spades, hearts, clubs, diamonds]) {
            if (nValue(bidder, ace+s) > n) {
                n = nValue(bidder, ace+s);
                t = s;
            }
            if (nValue(bidder, ten+s) > n) {
                n = nValue(bidder, ten+s);
                t = s;
            }
            if (nValue(bidder, jack+s) > n) {
                n = nValue(bidder, jack+s);
                t = s;
            }
        }
    else if (noMarriages(bidder))                               // no marriages
        for (let s of [spades, hearts, clubs, diamonds]) {
            if (nValue(bidder, king+s) > n) {
                n = nValue(bidder, king+s);
                t = s;
            }
            if (nValue(bidder, queen+s) > n) {
                n = nValue(bidder, queen+s);
                t = s;
            }
        }
    else if (bid[bidder]>maxMeld(bidder)+est[partner]+20 && run(bidder))    // stretching w/ run
        t = maxSuit(bidder);
    else                                                        // all other cases
        for (let s of [spades, hearts, clubs, diamonds]) {
            if (marriages(bidder,s)>0 && nSuit(bidder,s)+nValue(bidder,ace+s)>n) {
                n = nSuit(bidder,s) + nValue(bidder, ace+s);
                t = s;
            }
        }
    return t;
}

// Return true if card c can be chosen based on lead card l, high card h, and trump (disturbing nothing)
function legal(c, l, h) {
    if (card[c].g!=hand && card[c].g!=bump)                     // c's not in hand or bumped, c's illegal
        return false;
    if (l == none)                                              // If no lead card (and no high card), c's legal
        return true;
    if (!card[l].m && card[h].m) {                              // If non-trump lead was trumped, 
        if (card[c].s == card[l].s)                                 // if c follows the lead, c's legal
            return true;
        for (let i = minC[card[c].p]; i <= maxC[card[c].p]; i++)    // if player can follow but doesn't, c's illegal
            if (card[i].g==hand && card[i].s==card[l].s)
                return false;
        if (card[c].m && card[c].r>card[h].r)                       // if player overtrumps, c's legal
            return true;
        for (let i = minC[card[c].p]; i <= maxC[card[c].p]; i++)    // if player can overtrump but doesn't, c's illegal
            if (card[i].g==hand && card[i].m && card[i].r>card[h].r)
                return false;
        if (card[c].m)                                              // if c's trump, c's legal
            return true;
        for (let i = minC[card[c].p]; i <= maxC[card[c].p]; i++)    // if player can trump but doesn't, c's illegal
            if (card[i].g==hand && card[i].m)
                return false;
    } else {                                                    // If trump was lead or high card isn't trump,
        if (card[c].s==card[l].s && card[c].r>card[h].r)            // if c follows lead and beats high, c's legal
            return true;
        for (let i = minC[card[c].p]; i <= maxC[card[c].p]; i++)    // if player can follow lead & beat high but doesn't, c's illegal
            if (card[i].g==hand && card[i].s==card[l].s && card[i].r>card[h].r)
                return false;
        if (card[c].s == card[l].s)                                 // if c follows lead, c's legal
            return true;
        for (let i = minC[card[c].p]; i <= maxC[card[c].p]; i++)    // if player can follow lead but doesn't, c's illegal
            if (card[i].g==hand && card[i].s==card[l].s)
                return false;
        if (card[c].m)                                              // if card is (first) trump, c's legal
            return true;
        for (let i = minC[card[c].p]; i <= maxC[card[c].p]; i++)    // if player can trump but doesn't, c's illegal
            if (card[i].g==hand && card[i].m)
                return false;
        }
    return true;                                                // All other c's are legal
}

// Shuffle first n elements of array a in place
function shuffleArray(a, n) {
    let x = 0, temp = 0;
    while (n > 0) {
        x = Math.floor(Math.random() * n--);
        temp = a[n];
        a[n] = a[x];
        a[x] = temp;
    }
    return;
}

// Log hands on console
function logHands() {
    let t = "";
    for (let p of [west, north, east, south]) {
        t = `${player$[p][0]}:`;
        for (let c = minC[p]; c <= maxC[p]; c++)
            t += card[c].g==hand? ` ${value$[card[c].v]}` : ` --`;
        log(t);
    }
}

// log stats on console
function logStats() {
    let t = "";
    log("   J♦ Q♦ K♦ T♦ A♦ J♣ Q♣ K♣ T♣ A♣ J♥ Q♥ K♥ T♥ A♥ J♠ Q♠ K♠ T♠ A♠");
    for (let p of [west, north, east, south]) {
        t = `${player$[p][0]}:`;
        for (let v = 0; v < values; v++)
            t += ` ${minCards[p][v]}${maxCards[p][v]}`;
        log(t);
    }
}

// Get plausible card values cardV given other players' unknown cards
function getPlausible(cardV) {

    // Make list of unknown cards in other players' hands
    const unknown = Array(cards).fill(0);
    let u = 0;
    for (let c = 0; c < cards; c++)
        if (card[c].g==hand && card[c].p!=player && !card[c].k)
            unknown[u++] = card[c].v;

    // Until compliant: shuffle list, fill in cardV, and test for compliance
    nextTry: do {
        shuffleArray(unknown, u);
        u = 0;
        for (let c = 0; c < cards; c++)
            if (card[c].g==hand && card[c].p!=player && !card[c].k)
                cardV[c] = unknown[u++];
            else
                cardV[c] = card[c].g==gone? absent : card[c].v;
        for (let p of [west, north, east, south])
            for (let v = 0; v < values; v++) {
                let nV = 0;
                for (let c = minC[p]; c <= maxC[p]; c++)
                    if (card[c].g==hand && cardV[c]==v)
                        nV++;
                let loose = remaining[v] - nValue(player,v);
                for (let p = next[player]; p != player; p = next[p])
                    loose -= minCards[p][v];
                if (nV > Math.min(maxCards[p][v], minCards[p][v] + loose))
                    continue nextTry;
            }
    } while (false);
}

const trckMerit = 10;   // Merit(demerit) for winning(losing) the trick
const highMerit = 10;   // Merit(demerit) for each point card won(lost)
const rankMerit = 1;    // Merit(demerit) for each card  foe(ally) uses
const trmpMerit = 1;    // Merit(demerit) for each trump foe(ally) uses

function bestMerit(v, bestC, playC, p, leadCard0, highCard0, nPlayed) {
    let l = leadCard0;
    let h = highCard0;
    let merit = 0;
    let bestM = -100;
    nextC: for (let c = minC[p]; c <= maxC[p]; c++) {       // For all of player p's cards,
        if (v[c] != absent) {                                   // if card is in hand,
            if (l == none)                                          // if no lead card,
                l = h = c;                                              // lead and high cards are now this card
            else {                                                  // otherwise,
                const vc=v[c],     vl=v[l],     vh=v[h];
                const sc=suit[vc], sl=suit[vl], sh=suit[vh];
                const rc=rank[vc], rl=rank[vl], rh=rank[vh];
                const tc=trmp[vc], tl=trmp[vl], th=trmp[vh];
                if (!tl && th) {                                        // if lead suit isn't trump and high suit is trump, 
                    if (sc != sl) {                                         // if c doesn't follow the lead,
                        for (let c = minC[p]; c <= maxC[p]; c++)                // if p can follow the lead, c's no good
                            if (suit[v[c]] == sl)
                                continue nextC;
                        if (!tc || rc<=rh) {                                    // if c doesn't overtrump,
                            for (let c = minC[p]; c <= maxC[p]; c++)                // if p can overtrump, c's no good
                                if (trmp[v[c]] && v[c]>vh)
                                    continue nextC;
                            if (!tc)                                                // if c's not trump,
                                for (let c = minC[p]; c <= maxC[p]; c++)                // if p can trump, c's no good
                                    if (trmp[v[c]])
                                        continue nextC;
                        }
                    }
                } else {                                                // if lead suit is trump or high suit isn't trump,
                    if (sc!=sl || rc<=rh) {                                 // if c doesn't follow lead or doesn't beats high,
                        for (let c = minC[p]; c <= maxC[p]; c++)                // if p can follow lead & beat high, c's no good
                            if (suit[v[c]]==sl && v[c]>vh)
                                continue nextC;
                        if (sc != sl) {                                         // if c doesn't follow lead,
                            for (let c = minC[p]; c <= maxC[p]; c++)                // if p can follow lead, c's no good
                                if (suit[v[c]] == sl)
                                    continue nextC;
                            if (!tc)                                                // if c's not trump,
                                for (let c = minC[p]; c <= maxC[p]; c++)                 // if p cam trump, c's no good
                                    if (trmp[v[c]])
                                        continue nextC;
                        }
                    }
                }
                if (sc==sh && rc>rh || tc&&!th)                         // if c beats h or c's trump and h's not,
                    h = c;                                                  // new high card.
            }
            // Legal card: play it
            playC[p] = c;
            if (nPlayed+1 < players) {
                // Play incomplete: recurse to next player
                merit = -bestMerit(v, bestC, playC, next[p], l, h, nPlayed+1);
            } else {
                // Play complete: calculate merit
                const w=v[playC[west]], n=v[playC[north]], e=v[playC[east]], s=v[playC[south]];
                if (us[p] && us[plyr[h]]) {
                    // NS is last player and NS won
                    merit =  +trckMerit;
                    merit += (+high[w] + high[n] + high[e] + high[s]) * highMerit;
                    merit += (+rank[w] - rank[n] + rank[e] - rank[s]) * rankMerit;
                    merit += (+trmp[w] - trmp[n] + trmp[e] - trmp[s]) * trmpMerit;
                } else if (!us[p] && !us[plyr[h]]) {
                    // EW is last player and EW won
                    merit =  +trckMerit;
                    merit += (+high[w] + high[n] + high[e] + high[s]) * highMerit;
                    merit += (-rank[w] + rank[n] - rank[e] + rank[s]) * rankMerit;
                    merit += (-trmp[w] + trmp[n] - trmp[e] + trmp[s]) * trmpMerit;
                } else if (us[p] && !us[plyr[h]]) {
                    // NS is last player and NS lost
                    merit =  -trckMerit;
                    merit += (-high[w] - high[n] - high[e] - high[s]) * highMerit;
                    merit += (+rank[w] - rank[n] + rank[e] - rank[s]) * rankMerit;
                    merit += (+trmp[w] - trmp[n] + trmp[e] - trmp[s]) * trmpMerit;
                } else if (!us[p] && us[plyr[h]]) {
                    // EW is last player and EW lost
                    merit =  -trckMerit;
                    merit += (-high[w] - high[n] - high[e] - high[s]) * highMerit;
                    merit += (-rank[w] + rank[n] - rank[e] + rank[s]) * rankMerit;
                    merit += (-trmp[w] + trmp[n] - trmp[e] + trmp[s]) * trmpMerit;
                }
            }
            if (merit > bestM) {
                bestM = merit;
                bestC[p] = c;
            }
            l = leadCard0;
            h = highCard0;
        }
    }
    return bestM;
}

// Results class
class R {
    constructor(c) {
        this.c = c;                 // card number
        this.n = 0;                 // number of times this card had the best merit
     }
}

// Return computer player's best legal card number based on plausible hands (or none)
function autoSelect() {
    const cardV = Array(cards).fill(0);
    const nPlayed = nGroup(play);
    const results = [
        new R(0),  new R(1),  new R(2),  new R(3),  new R(4),  new R(5),  new R(6),  new R(7),  new R(8),  new R(9),
        new R(10), new R(11), new R(12), new R(13), new R(14), new R(15), new R(16), new R(17), new R(18), new R(19),
        new R(20), new R(21), new R(22), new R(23), new R(24), new R(25), new R(26), new R(27), new R(28), new R(29),
        new R(30), new R(31), new R(32), new R(33), new R(34), new R(35), new R(36), new R(37), new R(38), new R(39),
        new R(40), new R(41), new R(42), new R(43), new R(44), new R(45), new R(46), new R(47), new R(48), new R(49),
        new R(50), new R(51), new R(52), new R(53), new R(54), new R(55), new R(56), new R(57), new R(58), new R(59),
        new R(60), new R(61), new R(62), new R(63), new R(64), new R(65), new R(66), new R(67), new R(68), new R(69),
        new R(70), new R(71), new R(72), new R(73), new R(74), new R(75), new R(76), new R(77), new R(78), new R(79)
    ];
    const a0 = performance.now();
    let cycles = 0;
    while (performance.now() - a0 < dealTime/4) {
        const bestC = [none, none, none, none];
        const playC = [none, none, none, none];
        for (let c = 0; c < cards; c++)
            if (card[c].g == play) {
                bestC[card[c].p] = c;
                playC[card[c].p] = c;
            }
        getPlausible(cardV);
        bestMerit(cardV, bestC, playC, player, leadCard, highCard, nPlayed);
        results[bestC[player]].n++;
        cycles++;
    }
    results.sort((a,b)=>b.n-a.n);
    let s = `${cycles.toLocaleString().padStart(7)} cycles`;
    for (let i = 0; i < cards; i++)
        if (results[i].n / cycles >= 0.01)
            s += `,` + `${(results[i].n/cycles).toLocaleString("en-US",{style:"percent"})}`.padStart(5) + ` ${value$[card[results[i].c].v]}`;
    log(s);
    return results[0].c;
}

// Return number of cards in player p's hand
function nCards(p) {
    let n = 0;
    for (let c = minC[p]; c <= maxC[p]; c++)
        if (card[c].g == hand)
            n++;
    return n;
}

// Locate all card positions (n = number of semi-exposed cards; v = visible card number)
function locateCards() {
    const rWest  = [+Math.PI/2, +Math.PI/2, -Math.PI/2, -Math.PI/2][dealer];
    const rNorth = [0,          0,          0,          0         ][dealer];
    const rEast  = [+Math.PI/2, -Math.PI/2, -Math.PI/2, +Math.PI/2][dealer];
    const rSouth = [+Math.PI,   0,          -Math.PI,   0         ][dealer];
    let n, v;
    for (let c = 0; c < cards; c++) {
        const p = card[c].p;
        if (c == minC[p]) {
            n = nCards(p)-1;
            v = 0;
        }
        card[c].gone.x = [-cardh/2, vw/2, vw+cardh/2, vw/2][p];
        card[c].gone.y = [vh/2, -cardh/2, vh/2, vh+cardh/2][p];
        card[c].gone.r = [rWest, rNorth, rEast, rSouth][p];
        card[c].heap.x = [cardw+hpad, vw/2, vw-cardw-hpad, vw/2][p] + (Math.random()-0.5)*cardw/2;
        card[c].heap.y = [vh/2, cardw+vpad, vh/2, vh-cardw-vpad][p] + (Math.random()-0.5)*cardw/2;
        card[c].heap.r = [Math.PI/2, 0, -Math.PI/2, 0][dealer] + (Math.random()-0.5)*Math.PI/4;
        card[c].hand.x = [cardh/2+hpad, vw/2-cardw/4*(v-n/2), vw-cardh/2-hpad, vw/2+cardw/4*(v-n/2)][p];
        card[c].hand.y = [vh/2+cardw/4*(v-n/2), cardh/2+vpad, vh/2-cardw/4*(v-n/2), vh-cardh/2-vpad][p];
        card[c].hand.r = [rWest, rNorth, rEast, rSouth][p];
        card[c].bump.x = card[c].hand.x + [cardh*0.4, 0, -cardh*0.4, 0][p];
        card[c].bump.y = card[c].hand.y + [0, cardh*0.4, 0, -cardh*0.4][p];
        card[c].bump.r = [rWest, rNorth, rEast, rSouth][p];
        card[c].play.x = vw/2 + [-cardh/2, +cardw/2, +cardh/2, -cardw/2][p];
        card[c].play.y = vh/2 + [-cardw/2, -cardh/2, +cardw/2, +cardh/2][p];
        card[c].play.r = [rWest, rNorth, rEast, rSouth][p];
        card[c].strt.x = [card[c].gone.x, card[c].heap.x, card[c].hand.x, card[c].bump.x, card[c].play.x][card[c].g];
        card[c].strt.y = [card[c].gone.y, card[c].heap.y, card[c].hand.y, card[c].bump.y, card[c].play.y][card[c].g];
        card[c].strt.r = [rWest, rNorth, rEast, rSouth][p];
        card[c].fnsh.x = [card[c].gone.x, card[c].heap.x, card[c].hand.x, card[c].bump.x, card[c].play.x][card[c].g];
        card[c].fnsh.y = [card[c].gone.y, card[c].heap.y, card[c].hand.y, card[c].bump.y, card[c].play.y][card[c].g];
        card[c].fnsh.r = [rWest, rNorth, rEast, rSouth][p];
        if (card[c].g==hand)
            v++;
    }
}

// Move card c from c0(?), group g0 at time t0 to c1(?), group g1, zIndex z1, face f1 over time t1
function moveCard(c, g0, t0, g1, z1, f1, t1, c0, c1) {
    c0 = c0 ?? c;
    c1 = c1 ?? c;
    card[c].g = g1;
    card[c].z = z1;
    card[c].f = f1;
    card[c].strt.x = [card[c0].gone.x, card[c0].heap.x, card[c0].hand.x, card[c0].bump.x, card[c0].play.x][g0];
    card[c].strt.y = [card[c0].gone.y, card[c0].heap.y, card[c0].hand.y, card[c0].bump.y, card[c0].play.y][g0];
    card[c].strt.r = [card[c0].gone.r, card[c0].heap.r, card[c0].hand.r, card[c0].bump.r, card[c0].play.r][g0];
    card[c].strt.t = t0;
    card[c].fnsh.x = [card[c1].gone.x, card[c1].heap.x, card[c1].hand.x, card[c1].bump.x, card[c1].play.x][g1];
    card[c].fnsh.y = [card[c1].gone.y, card[c1].heap.y, card[c1].hand.y, card[c1].bump.y, card[c1].play.y][g1];
    card[c].fnsh.r = [card[c1].gone.r, card[c1].heap.r, card[c1].hand.r, card[c1].bump.r, card[c1].play.r][g1];
    card[c].fnsh.t = t0 + t1;
}

// Initialize the global variables based on the size of docBody
function setSizes() {
    vw = Number.parseFloat(getComputedStyle(docBody).width);
    vh = Number.parseFloat(getComputedStyle(docBody).height);
    cardw = Number.parseFloat(getComputedStyle(cardSize).width);
    cardh = Number.parseFloat(getComputedStyle(cardSize).height);
    iconw = Number.parseFloat(getComputedStyle(menuIcon).width);
    iconh = Number.parseFloat(getComputedStyle(menuIcon).height);
    pad   = Number.parseFloat(getComputedStyle(menuIcon).marginLeft);
    if (vw < vh) {
        hpad = vw/2 - cardw*(1+19/4)/2;
        vpad = iconh + 2*pad;
    } else {
        hpad = iconw + 2*pad;
        vpad = vh/2 - cardw*(1+19/4)/2;
    }
    docCanvas.width  = vw;
    docCanvas.height = vh;
}

// Return card number of top south card (or undefined) at x,y coordinates 
function xy2c(x, y) {
    let topC;
    card.sort((a,b)=>a.z-b.z);
    for (let c = 0; c < cards; c++) {
        if (card[c].p == south) {
            const l = card[c].hand.x - cardw/2;
            const r = card[c].hand.x + cardw/2;
            const t = card[c].hand.y - cardh/2;
            const b = card[c].hand.y + cardh/2;
            if (card[c].g==hand && x>=l && x<=r && y>=t-cardh*0.0 && y<=b)
                topC = card[c].c;
            if (card[c].g==bump && x>=l && x<=r && y>=t-cardh*0.4 && y<=b)
                topC = card[c].c;
        }
    }
    card.sort((a,b)=>a.c-b.c);
    return topC;
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
    card.sort((a,b)=>a.z-b.z);
    context.clearRect(0, 0, vw, vh);
    for (let c = 0; c < cards; c++) {
        if (now < card[c].fnsh.t)
            done = false;
        if (now <= card[c].strt.t) {
            context.translate(card[c].strt.x, card[c].strt.y);
            context.rotate(card[c].strt.r);
            context.drawImage(card[c].f?faceImg[card[c].v]:backImg, -cardw/2, -cardh/2, cardw, cardh);
            context.resetTransform();
        }
        if (now >= card[c].fnsh.t) {
            context.translate(card[c].fnsh.x, card[c].fnsh.y);
            context.rotate(card[c].fnsh.r);
            context.drawImage(card[c].f?faceImg[card[c].v]:backImg, -cardw/2, -cardh/2, cardw, cardh);
            context.resetTransform();
            card[c].strt.x = card[c].fnsh.x;
            card[c].strt.y = card[c].fnsh.y;
            card[c].strt.r = card[c].fnsh.r;
        }
        if (now > card[c].strt.t && now < card[c].fnsh.t) {
            const ps = (card[c].fnsh.t - now) / (card[c].fnsh.t - card[c].strt.t);
            const pf = (now - card[c].strt.t) / (card[c].fnsh.t - card[c].strt.t);
            const x = card[c].strt.x*ps + card[c].fnsh.x*pf;
            const y = card[c].strt.y*ps + card[c].fnsh.y*pf;
            const r = card[c].strt.r*ps + card[c].fnsh.r*pf;
            context.translate(x, y);
            context.rotate(r);
            context.drawImage(card[c].f?faceImg[card[c].v]:backImg, -cardw/2, -cardh/2, cardw, cardh);
            context.resetTransform();
        }
    }
    card.sort((a,b)=>a.c-b.c);
    if (!done)
        requestAnimationFrame(frameEvent);
    else {
        setTimeout(ondone);
        ondone = "";
    }
}

// Next button clicked: deal the next hand, then trigger onload
function nextClicked() {
    log("--> nextClicked");
    handText.style.display = "none";
    setTimeout(loaded);
}

// Again button clicked: reload app
function againClicked() {
    log("--> againClicked");
    window.location.reload();
}

// Quit button clicked: close app
function quitClicked() {
    log("--> quitClicked");
    window.close();
}

// Hand ended: display stats and await nextClicked, againClicked or quitClicked
function handEnded() {
    log("--> handEnded");
    trmpIcon.style.display = "none";
    usOld.textContent = ourScore;
    themOld.textContent = theirScore;
    log(`bidder:${bidder}, us[bidder]:${us[bidder]}, tossHand:${tossHand}, ourMeld:${ourMeld}, theirMeld:${theirMeld}, ourTake:${ourTake}, theirTake:${theirTake}`)
    if (us[bidder]) {
        usBid.innerHTML = ourBid;
        themBid.innerHTML = "Pass";
        if (tossHand) {
            usMeld.innerHTML = "<s>&nbsp"+ourMeld+"&nbsp</s>";
            themMeld.innerHTML = theirMeld<20 ? "<s>&nbsp"+theirMeld+"&nbsp</s>" : theirMeld;
            usTake.innerHTML = "<s>&nbsp"+ourTake+"&nbsp</s>";
            themTake.innerHTML = "<s>&nbsp"+theirTake+"&nbsp</s>";
            ourScore = ourScore - ourBid;
            theirScore = theirScore + (theirMeld<20?0:theirMeld);
        } else if (ourMeld<20 || ourTake<20 || ourMeld+ourTake<ourBid) {
            usMeld.innerHTML = "<s>&nbsp"+ourMeld+"&nbsp</s>";
            themMeld.innerHTML = (theirMeld<20||theirTake<20) ? "<s>&nbsp"+theirMeld+"&nbsp</s>" : theirMeld;
            usTake.innerHTML = "<s>&nbsp"+ourTake+"&nbsp</s>";
            themTake.innerHTML = theirTake<20 ? "<s>&nbsp"+theirTake+"&nbsp</s>" : theirTake;
            ourScore = ourScore - ourBid;
            theirScore = theirScore + (theirTake<20 ? 0 : (theirTake + (theirMeld<20?0:theirMeld)));
        } else {
            usMeld.innerHTML = ourMeld;
            themMeld.innerHTML = (theirMeld<20||theirTake<20) ? "<s>&nbsp"+theirMeld+"&nbsp</s>" : theirMeld;
            usTake.innerHTML = ourTake;
            themTake.innerHTML = theirTake<20 ? "<s>&nbsp"+theirTake+"&nbsp</s>" : theirTake;
            ourScore = ourScore + ourMeld + ourTake;
            theirScore = theirScore + (theirTake<20 ? 0 : (theirTake + (theirMeld<20?0:theirMeld)));
        }
    } else {
        usBid.innerHTML = "Pass";
        themBid.innerHTML = theirBid;
        if (tossHand) {
            usMeld.innerHTML = ourMeld<20 ? "<s>&nbsp"+ourMeld+"&nbsp</s>" : ourMeld;
            themMeld.innerHTML = "<s>&nbsp"+theirMeld+"&nbsp</s>";
            usTake.innerHTML = "<s>&nbsp"+ourTake+"&nbsp</s>";
            themTake.innerHTML = "<s>&nbsp"+theirTake+"&nbsp</s>";
            ourScore = ourScore + (ourMeld<20?0:ourMeld);
            theirScore = theirScore - theirBid;
        } else if (theirMeld<20 || theirTake<20 || theirMeld+theirTake<theirBid) {
            usMeld.innerHTML = (ourMeld<20||ourTake<20) ? "<s>&nbsp"+ourMeld+"&nbsp</s>" : ourMeld;
            themMeld.innerHTML = "<s>&nbsp"+theirMeld+"&nbsp</s>";
            usTake.innerHTML = ourTake<20 ? "<s>&nbsp"+ourTake+"&nbsp</s>" : ourTake;
            themTake.innerHTML = "<s>&nbsp"+theirTake+"&nbsp</s>";
            ourScore = ourScore + (ourTake<20 ? 0 : (ourTake + (ourMeld<20?0:ourMeld)));
            theirScore = theirScore - theirBid;
        } else {
            usMeld.innerHTML = (ourMeld<20||ourTake<20) ? "<s>&nbsp"+ourMeld+"&nbsp</s>" : ourMeld;
            themMeld.innerHTML = theirMeld;
            usTake.innerHTML = ourTake<20 ? "<s>&nbsp"+ourTake+"&nbsp</s>" : ourTake;
            themTake.innerHTML = theirTake;
            ourScore = ourScore + (ourTake<20 ? 0 : (ourTake + (ourMeld<20?0:ourMeld)));
            theirScore = theirScore + theirMeld + theirTake;
        }
    }
    usNew.textContent = ourScore;
    themNew.textContent = theirScore;
    if (ourTake<50 && theirTake<50 && ourScore<500 && theirScore<500) {
        nextDiv.style.display = "block";
        overDiv.style.display = "none";
        handText.style.display = "block";
    } else {
        nextDiv.style.display = "none";
        overDiv.style.display = "block";
        if (ourTake==50 || ourScore>=500)
            overText.textContent = "We win!";
        else
            overText.textContent = "We lose!";
        handText.style.display = "block";
    }
}

// Trick viewed: pull trick, then retrigger handsRefanned or trigger handEnded
function trickViewed() {
    log("--> trickViewed");
    const now = performance.now();
    for (let c = 0; c < cards; c++)
        if (card[c].g == play)
            moveCard(c, play, now, gone, 100, false, dealTime/10, c, minC[card[highCard].p]);
    if (nGroup(hand) > 0) {
        player = card[highCard].p;
        chosen = leadCard = highCard = none;
        animate(handsRefanned);
    } else {
        if (card[highCard].u)
            ourTake += 2;
        else
            theirTake += 2;
        animate(handEnded);
    }
}

// Trick played: pause a moment to view trick, then trigger trickViewed
function trickPlayed() {
    log("--> trickPlayed");
    const now = performance.now();
    for (let c = 0; c < cards; c++)
        if (card[c].g == play) {
            if (card[c].r==ace || card[c].r==ten || card[c].r==king)
                if (card[highCard].u)
                    ourTake += 1;
                else
                    theirTake += 1;
            moveCard(c, play, now, play, -100, true, dealTime/4);
        }
    animate(trickViewed);
}

// Card played: close hand, then trigger trickPlayed or handsRefanned  
function cardPlayed() {
    log("--> cardPlayed");
    const now = performance.now();
    locateCards();
    moveCard(chosen, play, now, play, -100, true, 0);
    player = next[player];
    if (nGroup(play) == players)
        animate(trickPlayed);
    else
        animate(handsRefanned);
}

// Card chosen: update stats, play face, then trigger cardPlayed
function cardChosen() {
    log("--> cardChosen");
    const now = performance.now();
    let msg = "Best follow";

    // Choose player's last known card with chosen's value (if any)
    const oldChosen = chosen;
    for (let c = minC[player]; c <= maxC[player]; c++)
        if (card[c].g==hand && card[c].v==card[chosen].v && card[c].k)
            chosen = c;

    // if chosen card is in high suit and doesn't beat non-ace high card, player must not have any cards that can beat the high card 
    if (highCard!=none && card[chosen].s==card[highCard].s && card[highCard].r!=ace && card[chosen].r<=card[highCard].r) {
        msg = `Can't beat ${value$[card[highCard].v]}`;
        for (let v=card[highCard].v+1; v<=ace+card[highCard].s; v++)
            maxCards[player][v] = 0;
    }
    // if no lead card, chosen card must be the lead card and the high card
    if (leadCard == none) {
        msg = "Best lead";
        leadCard = highCard = chosen;
    }
    // if chosen card is in trump and trump wasn't led, player must be out of the first suit
    if (card[chosen].m && !card[leadCard].m) {
        msg = `Out of ${suit$[card[leadCard].s]}.`;
        for (let v = jack+card[leadCard].s; v <= ace+card[leadCard].s; v++)
            maxCards[player][v] = 0;
    }
    // if chosen card is in high suit and beats high card, we have a new high card
    if (card[chosen].s==card[highCard].s && card[chosen].r>card[highCard].r) {
        msg = "Beats high card"
        highCard = chosen;
    }
    // if chosen card is in trump and the high suit isn't trump, we have a new high card
    if (card[chosen].m && !card[highCard].m) {
        msg = "Must trump"
        highCard = chosen;
    }
    // Update stats based on chosen card
    remaining[card[chosen].v]--;
    minCards[player][card[chosen].v] = Math.max(minCards[player][card[chosen].v] - 1, 0);
    let loose = remaining[card[chosen].v]
    for (let p of [west, north, east, south])
        loose -= minCards[p][card[chosen].v];
    for (let p of [west, north, east, south])
        maxCards[p][card[chosen].v] = Math.min(maxCards[p][card[chosen].v], minCards[p][card[chosen].v] + loose);

    // log this play
    log(`${player$[player]} chose ${value$[card[chosen].v]}, msg:${msg}`);

    // animate card play
    moveCard(chosen, card[chosen].g, now, play, card[chosen].z, true, dealTime/10);
    animate(cardPlayed);
}

// Mouse moved: if off bump card, unbump cards; if moved to hand legal card, bump it
function mouseMoved(e) {
    //log("--> mouseMoved");
    const now = performance.now();
    const c = xy2c(e.clientX, e.clientY);
    if (c == undefined || card[c].g != bump)
        for (let c2 = 0; c2 < cards; c2++)
            if (card[c2].g == bump) {
                moveCard(c2, bump, now, hand, c2, true, dealTime/20);
                requestAnimationFrame(frameEvent);
            }
    if (c!=undefined && card[c].g==hand && card[c].p==player && legal(c, leadCard, highCard)) {
        moveCard(c, hand, now, bump, c, true, dealTime/20);
        requestAnimationFrame(frameEvent);
    }
}

// Mouse pressed: if hand/bump southern card, unbump cards; if hand legal card, bump it; if legal, choose it
function mousePressed(e) {
    log("--> mousePressed");
    const now = performance.now();
    const c = xy2c(e.clientX, e.clientY);
    if (c != undefined) {
        for (let c2 = 0; c2 < cards; c2++) {
            if (c2!=c && card[c2].g==bump) {
                moveCard(c2, bump, now, hand, c2, true, dealTime/20);
                requestAnimationFrame(frameEvent);
            }
        }
        if (card[c].g==hand && card[c].p==player && legal(c, leadCard, highCard)) {
            moveCard(c, hand, now, bump, c, true, dealTime/20);
            requestAnimationFrame(frameEvent);
        }
        if (card[c].g==bump && card[c].p==player && legal(c, leadCard, highCard)) {
            chosen = c; 
            docBody.onmousemove = "";
            docBody.onmousedown = "";
            docBody.ontouchstart = "";
            docBody.ontouchmove = "";
            setTimeout(cardChosen);
        }
    }
}

// Touch started: if legal bump card, choose it; if isn't bump card, unbump cards; if hand legal, bump it 
function touchStarted(e) {
    log("--> touchStarted");
    docBody.onmousedown = "";
    docBody.onmousemove = "";
    const now = performance.now();
    const c = xy2c(e.touches[0].clientX, e.touches[0].clientY);
    if (c!=undefined && card[c].g==bump && card[c].p==player && legal(c, leadCard, highCard)) {
        chosen = c; 
        docBody.ontouchstart = "";
        docBody.ontouchmove = "";
        setTimeout(cardChosen);
        return;
    }
    if (c==undefined || card[c].g!=bump) {
        for (let c2 = 0; c2 < cards; c2++) {
            if (card[c2].g == bump) {
                moveCard(c2, bump, now, hand, c2, true, dealTime/20);
                requestAnimationFrame(frameEvent);
            }
        }
    }
    if (c!=undefined && card[c].g==hand && card[c].p==player && legal(c, leadCard, highCard)) {
        moveCard(c, hand, now, bump, c, true, dealTime/20);
        requestAnimationFrame(frameEvent);
    }
}

// Touch moved: if off bump card, unbump cards; if hand legal card, bump it
function touchMoved(e) {
    //log("--> touchMoved");
    const now = performance.now();
    const c = xy2c(e.touches[0].clientX, e.touches[0].clientY);
    if (c==undefined || card[c].g!=bump) {
        for (let c2 = 0; c2 < cards; c2++) {
            if (card[c2].g == bump) {
                moveCard(c2, bump, now, hand, c2, true, dealTime/20);
                requestAnimationFrame(frameEvent);
            }
        }
    }
    if (c!=undefined && card[c].g==hand && card[c].p==player && legal(c, leadCard, highCard)) {
        moveCard(c, hand, now, bump, c, true, dealTime/20);
        requestAnimationFrame(frameEvent);
    }
}

// Hands re-fanned: now choose a card to play, then trigger cardChosen
function handsRefanned() {
    log("--> handsRefanned");
    trmpIcon.src = suitSrc[trump];
    trmpIcon.style.display = "block";
    if (player == south) {
        docBody.onmousemove = mouseMoved;
        docBody.onmousedown = mousePressed;
        docBody.ontouchstart = touchStarted;
        docBody.ontouchmove = touchMoved;
    } else {
        chosen = autoSelect();
        setTimeout (cardChosen, 0);
    }
}

// Meld gathered: re-fan hands, then trigger handsRefanned
function meldGathered() {
    log("--> meldGathered");
    const now = performance.now();
    for (let c = 0; c < cards; c++)
        card[c].g = hand;
    locateCards();
    for (let c = 0; c < cards; c++)
        if (openHand || card[c].p==south)
            moveCard(c, gone, now, hand, c, true, dealTime/10);
        else
            moveCard(c, gone, now, hand, -c, false, dealTime/10);
    player = bidder;
    chosen = leadCard = highCard = none;
    ourTake = theirTake = 0;
    tossHand = false;
    animate(handsRefanned);
}

// Show button clicked: show entire south hand, then trigger meldFanned
function showClicked() {
    log("--> showClicked");
    const now = performance.now();
    if (showBtn.value == "Show") {
        for (let c = minC[south]; c <= maxC[south]; c++)
            card[c].g = hand;
        locateCards();
        for (let c = minC[south]; c <= maxC[south]; c++)
            moveCard(c, gone, now, hand, c, true, dealTime/10);
        showBtn.value = "Hide";
    } else {
        for (let c = minC[south]; c <= maxC[south]; c++)
            card[c].g = card[c].k ? hand : gone;
        locateCards();
        for (let c = minC[south]; c <= maxC[south]; c++)
            if (card[c].g == hand)
                moveCard(c, gone, now, hand, c, true, dealTime/10);
        showBtn.value = "Show";
    }
    animate(meldFanned);
}

// Play button clicked: gather the meld, then trigger meldGathered
function playClicked() {
    log("--> playClicked");
    const now = performance.now();
    showBtn.value = "Show";
    playText.style.display = "none";
    for (let c = 0; c < cards; c++)
        moveCard(c, hand, now, gone, -c, false, dealTime/10);
    animate(meldGathered);
}

// Toss button clicked: gather the meld, then trigger handEnded
function tossClicked() {
    log("--> tossClicked");
    const now = performance.now();
    showBtn.value = "Show";
    playText.style.display = "none";
    tossHand = true;
    ourTake = theirTake = 0;
    for (let c = 0; c < cards; c++)
        moveCard(c, hand, now, gone, -c, false, dealTime/10);
    animate(handEnded);
}

// Meld fanned: display situation, then await showClicked, playClicked or tossClicked 
function meldFanned() {
    log("--> meldFanned");
    let weNeed = 20, theyNeed = 20;
    if (us[bidder])
        if (ourMeld < 20)
            weNeed = bid[bidder];
        else
            weNeed = Math.max(20, bid[bidder] - ourMeld);
    else
        if (theirMeld < 20)
            theyNeed = bid[bidder];
        else
            theyNeed = Math.max(20, bid[bidder] - theirMeld);
    ourBid = bid[north] > bid[south] ? bid[north] : bid[south];
    theirBid = bid[west] > bid[east] ? bid[west] : bid[east];
    playPara[0].textContent = `${player$[bidder]} won the bid at ${bid[bidder]} with ${suit$[trump]}.`;
    playPara[1].textContent = `Our meld is ${ourMeld < 20 ? "< 20" : ourMeld} and their meld is ${theirMeld < 20 ? "< 20" : theirMeld}.`;
    if (mustToss) {
        playPara[2].textContent = `${player$[bidder]} must toss this hand.`;
        showBtn.style.display = "none";
        playBtn.style.display = "none";
        tossBtn.style.display = "inline";
    } else if (them[bidder]&&theyNeed>30 || bidder==north&&weNeed>30) {
        tossHand = true;
        ourTake = theirTake = 0;
        playPara[2].textContent = `${player$[bidder]} decided to toss this hand.`;
        showBtn.style.display = "none";
        playBtn.style.display = "none";
        tossBtn.style.display = "inline";
    } else {
        playPara[2].textContent = `We need to pull ${weNeed} and they need to pull ${theyNeed}.`;
        showBtn.style.display = ["none", "none", "none", "inline"][bidder];
        playBtn.style.display = "inline";
        tossBtn.style.display = ["none", "none", "none", "inline"][bidder];
    }
    playText.style.display = "flex";
}

// Hands regathered: fan out meld, then trigger meldFanned
function handsRegathered() {
    log("--> handsRegathered");
    const now = performance.now();

    // move known (meld) cards into hands
    for (let c = 0; c < cards; c++)
        if (card[c].k)
            card[c].g = hand;
    logHands();

    // Adjust minCards and maxCards based on meld cards
    for (let p of [west, north, east, south]) {
        // Adjust minCards based on revealed cards
        for (let v = 0; v < values; v++)
            minCards[p][v] = nValue(p, v);
        // if #A/K/Q/J in other suits > #A/K/Q/J in this suit, max = #A/K/Q/J in this suit
        for (let r of [ace, king, queen, jack]) {
            let minCount = 5;
            let minSuit = none;
            let minHits = 0;
            for (let s of [diamonds, clubs, hearts, spades])
                if (nValue(p,r+s) < minCount) {
                    minCount = nValue(p,r+s);
                    minSuit = s;
                    minHits = 1;
                } else if (nValue(p,r+s) == minCount)
                    minHits++;
            if (minHits == 1)
                maxCards[p][r+minSuit] = minCount;
        }
        // if #Q/K < #K/Q in suit, max = #Q/K in suit
        for (let s of [diamonds, clubs, hearts, spades])
            if (nValue(p,queen+s) < nValue(p,king+s))
                maxCards[p][queen+s] = nValue(p,queen+s);
            else if (nValue(p,king+s) < nValue(p,queen+s))
                maxCards[p][king+s] = nValue(p,king+s);
        // if #JD/QS < #QS/JD, max = #JD/QS
        if (nValue(p,jack+diamonds) < nValue(p,queen+spades))
            maxCards[p][jack+diamonds] = nValue(p,jack+diamonds);
        else if (nValue(p,queen+spades) < nValue(p,jack+diamonds))
            maxCards[p][queen+spades] = nValue(p,queen+spades);
        // if #T < min(#A,#K,#Q,#J) in trump, max = #T
        let minOther = 5;
        for (let r of [ace, king, queen, jack])
            if (nValue(p,r+trump) < minOther)
                minOther = nValue(p,r+trump);
        if (nValue(p,ten+trump) < minOther)
            maxCards[p][ten+trump] = nValue(p,ten+trump);
    }
    // reduce maxCards based on minCards
    for (let p of [west, north, east, south])
        for (let v = 0; v < values; v++) {
            const loose = 4 - minCards[west][v] - minCards[north][v] - minCards[east][v] - minCards[south][v];
            maxCards[p][v] = Math.min(maxCards[p][v], minCards[p][v] + loose);
        }
    logStats();

    // animate movement of meld cards to hand
    locateCards();
    for (let c = 0; c < cards; c++)
        if (card[c].g == hand)
            moveCard(c, gone, now, hand, c, true, dealTime/10);
    animate(meldFanned);
}

// Trump picked: regather hands, then trigger handsRegathered
function trumpPicked() {
    log("--> trumpPicked");
    const now = performance.now();
    ourMeld = meld(north, trump) + meld(south, trump);
    theirMeld = meld(west, trump) + meld(east, trump);
    mustToss = marriages(bidder, trump) == 0;
    tagMeld();
    log(`${player$[bidder]} picks ${suit$[trump]}`);
    for (let c = 0; c < cards; c++) {
        card[c].m = card[c].s==trump;
        moveCard(c, hand, now, gone, -c, false, dealTime/10);
    }
    for (let v = 0; v < values; v++)
        trmp[v] = suit[v]==trump;
    animate(handsRegathered);
}

// Trump button clicked: pick a trump suit s where 0=spades, 1=hearts, 2=clubs, 3=diamonds, then trigger trumpPicked
function trumpClicked(s) {
    log("--> trumpClicked");
    trump = [spades, hearts, clubs, diamonds][s];
    trumpText.style.display = "none";
    setTimeout(trumpPicked);
}

// Spades button clicked: set trump, then trigger trumpPicked
function spadesClicked(s) {
    log("--> spadesClicked");
    trump = spades;
    trumpText.style.display = "none";
    setTimeout(trumpPicked);
}

// Hearts button clicked: set trump, then trigger trumpPicked
function heartsClicked(s) {
    log("--> heartsClicked");
    trump = hearts;
    trumpText.style.display = "none";
    setTimeout(trumpPicked);
}

// Clubs button clicked: set trump, then trigger trumpPicked
function clubsClicked(s) {
    log("--> clubsClicked");
    trump = clubs;
    trumpText.style.display = "none";
    setTimeout(trumpPicked);
}

// Diamonds button clicked: set trump, then trigger trumpPicked
function diamondsClicked(s) {
    log("--> diamondsClicked");
    trump = diamonds;
    trumpText.style.display = "none";
    setTimeout(trumpPicked);
}

// Bid won: if south bid, await spadesClicked,heartsClicked,clubsClicked,heartsClicked; else, pick trump & trigger trumpPicked
function biddingDone() {
    log("--> biddingDone");
    bidBox[west].textContent = bidBox[north].textContent = bidBox[east].textContent ="";
    for (bidder of [west, north, east, south])
        if (bid[bidder] > pass)
            break;
    if (bidder == south) {
        trumpBtn[0].disabled = marriages(south, spades) == 0;
        trumpBtn[1].disabled = marriages(south, hearts) == 0;
        trumpBtn[2].disabled = marriages(south, clubs) == 0;
        trumpBtn[3].disabled = marriages(south, diamonds) == 0;
        if (noMarriages(bidder))
            trumpBtn[0].disabled = trumpBtn[1].disabled = trumpBtn[2].disabled = trumpBtn[3].disabled = false;
        trumpText.style.display = "flex";
    } else {
        trump = autoPick();
        trumpText.style.display = "none";
        setTimeout(trumpPicked);
    }
}

// Bid button clicked: handle button and retrigger handsFanned or trigger biddingDone
function bidClicked(e) {
    log("--> bidClicked");
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
        if (bidBtn[1].value == nextBid())
            bidBtn[0].value = "Pass";
        return;
    }
    logBid(value, "No reason");
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
    bidder = next[bidder];
    if (nPass() == 3) {
        if (bid[bidder] == none) {
            logBid(50, "Dropped");
            bid[bidder] = 50;
        }
        bidText.style.display = "none";
        setTimeout(biddingDone, dealTime / 4);
    } else
        setTimeout(handsFanned, dealTime / 4);
}

// Hands fanned: await bidClicked or autoBid and retrigger handsFanned or trigger biddingDone
function handsFanned() {
    log("--> handsFanned");
    while (bid[bidder] == pass) 
        bidder = next[bidder];
    if (bidder == south && bid[bidder] == none) {
        meldSpan[0].textContent = meld(south, spades);
        meldSpan[1].textContent = meld(south, hearts);
        meldSpan[2].textContent = meld(south, clubs);
        meldSpan[3].textContent = meld(south, diamonds);
        bidText.style.display = "flex";
    }
    if (bidder == south) {
        bidBtn[0].value = "Pass";
        bidBtn[1].value = nextBid();
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
        bidder = next[bidder];
        if (nPass()==3) {
            if (bid[bidder] == none) {
                logBid(50, "Dropped");
                bid[bidder] = 50;
            }
            bidText.style.display = "none";
            setTimeout(biddingDone, dealTime / 4);
        }
        else 
            setTimeout(handsFanned, dealTime / 4);
    }
}

// Hands gathered: fan hands, enable resize events, then trigger handsFanned
function handsGathered() {
    log("--> handsGathered");
    const now = performance.now();
    for (let c = 0; c < cards; c++)
        card[c].g = hand;
    locateCards();
    for (let c = 0; c < cards; c++)
        if (openHand || card[c].p==south)
            moveCard(c, gone, now, hand, c, true, dealTime/10);
        else
            moveCard(c, gone, now, hand, -c, false, dealTime/10);
    bidder = next[dealer];
    bid[west] = bid[north] = bid[east] = bid[south] = none;
    est[west] = est[north] = est[east] = est[south] = typical;
    logHands();
    animate(handsFanned);
}

// Deck dealt: gather hands, then trigger handsGathered
function deckDealt() {
    log("--> deckDealt");
    const now = performance.now();
    for (let c = 0; c < cards; c++)
        moveCard(c, heap, now, gone, -c, false, dealTime/20);
    animate(handsGathered);
}

// Resize event: adjust dynamic sizes, then trigger immediate deck redraw
function resized() {
    log("--> resized");
    const now = performance.now();
    setSizes();
    if (vh!=vh0 || vw!=vw0) {
        vh0 = vh;
        vw0 = vw;
        locateCards();
        for (let c = 0; c < cards; c++) {
            card[c].strt.t = now;
            card[c].fnsh.t = now;
        }
        requestAnimationFrame(frameEvent);
    }
}

// Menu icon clicked: display the menu
function menuIconClicked() {
    log("--> menuIconClicked");
    menuText.style.display = "block";
}

// Menu close icon clicked: close the menu, then await menuClicked
function menuCloseClicked() {
    log("--> menuCloseClicked");
    menuText.style.display = "none";
}

// Statistics menu item clicked: close menu and display stats
function statsClicked() {
    log("--> statsClicked");
    menuText.style.display = "none";
    for (let s = 0; s < statField.length; s++) {
        const row = s % 5;
        const col = Math.floor((s % 25) / 5);
        const grp = Math.floor(s / 25);
        const v = (4 - row) + [spades, hearts, clubs, diamonds][grp];
        const unknown = remaining[v] - nValue(south,v) - minCards[west][v] - minCards[north][v] - minCards[east][v];
        switch (col) {
        case 0:
            statField[s].textContent = minCards[west][v]+"-"+Math.min(maxCards[west][v],minCards[west][v]+unknown);
            break;
        case 1:
            statField[s].textContent = minCards[north][v]+"-"+Math.min(maxCards[north][v],minCards[north][v]+unknown);
            break;
        case 2:
            statField[s].textContent = minCards[east][v]+"-"+Math.min(maxCards[east][v],minCards[east][v]+unknown);
            break;
        case 3:
            statField[s].textContent = nValue(south,v);
            break;
        case 4:
            statField[s].textContent = unknown;
        }
    }
    for (let s of [spades, hearts, clubs, diamonds]) {
        const element = [diamondsT,,,,,clubsT,,,,,heartsT,,,,,spadesT][s];
        if (trump == s)
            element.style.backgroundColor = "#D0FFD0";
        else
            element.style.backgroundColor = "white";
    }
    statsText.style.display = "block";
}

// Stats close button clicked: close the stats and menu displays, then await menuClicked
function statsCloseClicked() {
    log("--> statsCloseClicked");
    statsText.style.display = "none";
}

// Reveal/Hide cards menu item clicked: close menu, invert openHand and revealTxt, then immediately redraw hands
function revealClicked() {
    log("--> revealClicked");
    menuText.style.display = "none";
    const now = performance.now();
    openHand = !openHand;
    revealTxt.textContent = openHand ? "Hide cards" : "Reveal cards";
    for (let c = 0; c < cards; c++)
        if (card[c].p!=south && card[c].g==hand) {
            card[c].f = openHand;
            card[c].z = openHand ? c : -c;
            card[c].strt.t = now;
            card[c].fnsh.t = now;
        }
    requestAnimationFrame(frameEvent);
}

// Reload app menu item clicked: restart the app
function reloadClicked() {
    log("--> reloadClicked");
    window.location.reload();
}

// Tutor menu item clicked: close menu and display first page of tutorial
function tutorClicked() {
    log("--> tutorClicked");
    menuText.style.display = "none";
    tutorText.style.display = "block";
    tutorialPg = 0;
    tutorPage[tutorialPg].style.display = "block";
}

// Tutor back icon clicked: close current page and display previous page
function tutorBackClicked() {
    log("--> tutorBackClicked");
    tutorPage[tutorialPg].style.display = "none";
    tutorialPg--;
    tutorPage[tutorialPg].style.display = "block";
}

// Tutor next icon clicked: close current page and display next page
function tutorNextClicked() {
    log("--> tutorNextClicked");
    tutorPage[tutorialPg].style.display = "none";
    tutorialPg++;
    tutorPage[tutorialPg].style.display = "block";
}

// Tutor close icon clicked: close the tutor display
function tutorCloseClicked() {
    log("--> tutorCloseClicked");
    tutorialPg = none;
    tutorText.style.display = "none";
}

// About app menu item clicked: close the app
function aboutClicked() {
    log("--> aboutClicked");
    channel.postMessage("get version");
    menuText.style.display = "none";
    aboutText.style.display = "block"
}

// Tutor close icon clicked: close the tutor display
function aboutCloseClicked() {
    log("--> aboutCloseClicked");
    aboutText.style.display = "none";
}

// Exit app menu item clicked: close the app
function exitClicked() {
    log("--> exitClicked");
    window.close();
}

// Update iItem grid based on suit s
function updateGrid(s) {
    let i = 0;
    let q = 0;
    for (let r of [ace, ten, king, queen, jack]) {
        const v = r + s;
        const n = remaining[v] - nValue(south, v);
        iBar[i++].src = barSrc[n][n];
        q += n;
    }
    iOutText.innerText = `${q} out`;
    iIcon.src = suitSrc[s];
    for (let p of [west, north, east])
        for (let r of [ace, ten, king, queen, jack]) {
            const v = r + s;
            const unk = remaining[v] - nValue(south,v) - minCards[west][v] - minCards[north][v] - minCards[east][v];
            const min = minCards[p][v];
            const max = Math.min(maxCards[p][v], min + unk);
            iBar[i++].src = barSrc[min][max];
        }
}

// Trmp icon clicked: display the info
function trmpIconClicked() {
    log("--> trmpIconClicked");
    iTrump.innerText = suit$[trump];
    updateGrid(trump);
    iText.style.display = "flex";
}

// iNav s icon clicked
function iNavClicked(s) {
    log(`--> iNavClicked(${s})`);
    updateGrid(s);
}

// iClose icon clicked: close the info
function iCloseClicked() {
    log("--> iCloseClicked");
    iText.style.display = "none";
}

// Load event: initialize app, deal cards, sort cards, disable resize events, then trigger deckDealt
function loaded() {
    log("_".repeat(80));
    log("--> loaded ");
    const deck = Array.from(new Array(cards), (v, k) => k % cardsPerPlayer);
    let sort = [];
    for (let v = 0; v < values; v++)
        faceImg[v].src = faceSrc[v];
    backImg.src = backSrc;
    menuIcon.draggable = false;
    shuffleArray(deck, cards);
    for (let p of [west, north, east, south]) {
        sort = sort.concat(deck.slice(minC[p],maxC[p]+1).sort((a,b)=>b-a));
        minCards[p].fill(0);
        maxCards[p].fill(4);
    }
    for (let c = 0; c < cards; c++) {
        card[c].c = c; 
        card[c].p = plyr[c];
        card[c].u = us[card[c].p];
        card[c].v = sort[c];
        card[c].s = suit[card[c].v];
        card[c].r = rank[card[c].v];
        card[c].t = high[card[c].v];
        card[c].g = gone;
        card[c].m = false;
        card[c].z = 0;
        card[c].f = false;
        card[c].k = false;
    }
    remaining.fill(4);
    trump = none;
    trmp.fill(false);
    setSizes();
    vh0 = vh;
    vw0 = vw;
    dealer = next[dealer];
    locateCards();
    let t0 = performance.now();
    let p = next[dealer];
    for (let z = 0; z < cards; z++) {
        const c = minC[p] + Math.floor(z/players);
        moveCard(c, gone, t0, heap, z, false, dealTime/20, minC[dealer], c);
        t0 = t0 + (dealTime - dealTime / 20) / cards;
        p = next[p];
    }
    onresize = resized;
    animate(deckDealt);
}

// Set function to be invoked after app is loaded and rendered
onload = loaded;

// Message received from service worker: note service worker version message
function messageRxed(e) {
    log("--> messageRxed by scripts.js");
    log(`e.data:"${e.data}"`)
    vsText.textContent = e.data;
}

// Implement proxy server for web fetches when app is offline
if ("serviceWorker" in navigator && window.location.origin != "file://") {
    navigator.serviceWorker.register("service-worker.js", {updateViaCache: "none"});
    channel.onmessage = messageRxed;
}