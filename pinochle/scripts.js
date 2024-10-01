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
const suits    = 4;
const suit$    = ["diamonds",,,,,"clubs",,,,,"hearts",,,,,"spades"];

// Rank values
const jack     = 0;
const queen    = 1;
const king     = 2;
const ten      = 3;
const ace      = 4;
const ranks    = 5;
const rank$    = ["jack", "queen", "king", "ten", "ace"];

// Card value = rank + suit
const cards    = 20;
const values   = 20;
const value$   = ["J♦","Q♦","K♦","T♦","A♦","J♣","Q♣","K♣","T♣","A♣","J♥","Q♥","K♥","T♥","A♥","J♠","Q♠","K♠","T♠","A♠"];

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
const none = -1;
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
const gone = 0;                     // gone (not yet dealt, hidden from view or pulled)
const heap = 1;                     // heap of dealt cards
const hand = 2;                     // normal hand position
const bump = 3;                     // bump hand position
const play = 4;                     // play position 

// Card class
class C {
    constructor() {
        this.i    = 0;              // deck index
        this.v    = 0;              // card value
        this.g    = 0;              // card group
        this.z    = 0;              // draw order
        this.f    = false;          // display face if true; back if false
        this.gone = new P;          // stacked position
        this.heap = new P;          // heap position
        this.hand = new P;          // normal hand position
        this.bump = new P;          // bump hand position
        this.play = new P;          // play position
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

// remaining[v] = remaining cards of value v to be play
const remaining = Array(values);

// maxCards[p][v] = most cards player p can hold of value v (revealed by meld and play)
const maxCards  = [Array(values), Array(values), Array(values), Array(values)];

// minCards[p][v] = least cards player p can hold of value v (revealed by meld and play)
const minCards  = [Array(values), Array(values), Array(values), Array(values)];

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
const nextBtn   = document.getElementById("nextBtn");
const overDiv   = document.getElementById("overDiv");
const overText  = document.getElementById("overText");
const againBtn  = document.getElementById("againBtn");
const quitBtn   = document.getElementById("quitBtn");
const menuIcon  = document.getElementById("menuIcon");
const menuText  = document.getElementById("menuText");
const menuX     = document.getElementById("menuX");
const statsItem = document.getElementById("statsItem");
const optnsItem = document.getElementById("optnsItem");
const rstrtItem = document.getElementById("rstrtItem");
const tutorItem = document.getElementById("tutorItem");
const aboutItem = document.getElementById("aboutItem");
const exitItem  = document.getElementById("exitItem");
const statsText = document.getElementById("statsText");
const statsX    = document.getElementById("statsX");
const spadesT   = document.getElementById("spadesT");
const heartsT   = document.getElementById("heartsT");
const clubsT    = document.getElementById("clubsT");
const diamondsT = document.getElementById("diamondsT");
const statField = document.querySelectorAll(".statColumn div");
const optnsText = document.getElementById("optnsText");
const optnsX    = document.getElementById("optnsX");
const openChk   = document.getElementById("openChk");
const slowChk   = document.getElementById("slowChk");

// Animation constants
const fastDeal  = 2000;             // fast (2 second) deal
const slowDeal  = 10000;            // slow (10 second) deal
let dealTime    = fastDeal;         // milliseconds to deal all cards

// Global variables
let ondone      = function(){};     // event to invoke after animation completes
let dealer      = south;            // the player who is dealing or last deckDealt
let bidder      = none;             // the player who is bidding or won the bid
let trump       = none;             // the bidder's trump suit
let firstPlayer = none;             // the player who plays first
let thisPlayer  = none;             // the player who is playing a card
let thisCard    = none;             // the card that is being play
let firstCard   = none;             // the card led in this hand
let firstSuit   = none;             // the suit led in this hand
let highCard    = none;             // the high card in this hand (so far)
let highSuit    = none;             // the suit of the high card in this hand (so far)
let highPlayer  = none;             // the player who play the high card
let ourBid      = none;             // our bid if we win the bid (or none)
let theirBid    = none;             // their bid if they win the bid (or none)
let ourMeld     = 0;                // total of north and south meld for this hand
let theirMeld   = 0;                // total of west and east meld for this hand
let ourTake     = 0;                // total of north and south points so far in hand
let theirTake   = 0;                // total of west and east points so far in hand
let ourScore    = 0;                // total of north and south points so far in game
let theirScore  = 0;                // total of west and east points so far in game
let openHand    = false;            // true if all hands show
let tossHand    = false;            // true if bidder decides to toss in the hand

// Dynamic sizes
let vw          = 0;                // view width
let vh          = 0;                // view height
let pad         = 0;                // padding around display elements
let hpad        = 0;                // horizontal padding for east and west hands
let vpad        = 0;                // vertical padding for north and south hands 
let cardw       = 0;                // card width
let cardh       = 0;                // card height

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
            const l = deck[i].hand.x - cardw/2;
            const r = deck[i].hand.x + cardw/2;
            const t = deck[i].hand.y - cardh/2;
            const b = deck[i].hand.y + cardh/2;
            if (deck[i].g==hand && x>=l && x<=r && y>=t-cardh*0.0 && y<=b)
                topI = i2;
            if (deck[i].g==bump && x>=l && x<=r && y>=t-cardh*0.4 && y<=b)
                topI = i2;
        }
    }
    deck.sort((a,b)=>a.i-b.i);
    return topI;
}

// Return suit of card value v
function suit(v) {
    return Math.floor(v / ranks) * ranks;
}

// Return rank of card value v
function rank(v) {
    return v % ranks;
}

// Return highest card for player p in suit s (or none)
function highest(p, s) {
    let h = none;
    for (let c = 0; c < cards; c++) {
        const i = pc2i(p,c);
        const v = deck[i].v;
        if (suit(v)==s && v>h)
            h = v;
    }
    return h;
}

// Return true if card value v follows the lead
function follow(v) {
    return suit(v) == firstSuit;
}

// Return true if player p can't follow the lead
function cantFollow(p) {
    return highest(p, firstSuit) == none;
}

// True is player p can't trump
function cantTrump(p) {
    return highest(p, trump) == none;
}

// Return number of player p's cards with card value v
function nValue(p, v) {
    let n = 0;
    for (let c = 0; c < cards; c++) {
        let i = p * cards + c;
        if (deck[i].v == v)
            n++;
    }
    return n;
}

// Return number of player p's face up cards with card value v
function nValueUp(p, v) {
    let n = 0;
    for (let c = 0; c < cards; c++) {
        let i = p * cards + c;
        if (deck[i].f && deck[i].v==v)
            n++;
    }
    return n;
}

// Return number of rank arounds in player's hand
function arounds(player, rank) {
    let n = 4;
    for (let suit of [spades, hearts, clubs, diamonds])
        n = Math.min(n, nValue(player, rank+suit));
    return n;
}

// Return number of suit runs in the player's hand
function runs(player, suit) {
    let n = 4;
    for (let rank of [jack, queen, king, ten, ace])
        n = Math.min(n, nValue(player, rank+suit));
    return n;
}

// Return number of pinochles in player's hand
function pinochles(player) {
    return Math.min(nValue(player, queen+spades), nValue(player, jack+diamonds));
}

// Return number of suit marriage's in the player's hand
function marriages(player, suit) {
    return Math.min(nValue(player, king+suit), nValue(player, queen+suit));
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
    let min = 999;
    for (let suit of [spades, hearts, clubs, diamonds])
        min = Math.min(countMeld(bidder, suit), min);
    return min;
}

// Return maximum meld in bidder's hand
function maxMeld() {
    let max = 0;
    for (let suit of [spades, hearts, clubs, diamonds])
        max = Math.max(countMeld(bidder, suit), max);
    return max;
}

// Return suit with maximum meld 
function maxSuit() {
    for (let suit of [spades, hearts, clubs, diamonds])
        if (countMeld(bidder, suit) == maxMeld())
            return suit;
}

// Recall n cards of value v for into player p's hand 
function recall(p, v, n) {
    for (let i = 0; n > 0 && i < indices; i++) {
        const c = i2c(i);
        if (i2p(i) == p && deck[pc2i(p,c)].v == v) {
            deck[i].g = hand;
            deck[i].f = true;
            n--;
        }
    }
}

// Recall meld into player's hands
function recallMeld() {
    for (let p of [west, north, east, south])
        if (((p==north || p==south) && ourMeld<20) || ((p==west || p==east) && theirMeld<20)) {
            if (p == bidder)
                for (let rank of [queen, king]) 
                    recall(p, rank+trump, Math.min(marriages(p, trump)), 1);
            for (let suit of [diamonds, clubs, hearts, spades])
                recall(p, ace+suit, arounds(p, ace));
        } else {
            for (let rank of [jack, queen, king, ace])
                for (let suit of [diamonds, clubs, hearts, spades])
                    recall(p, rank+suit, arounds(p, rank));
            for (let rank of [jack, queen, king, ten, ace])
                recall(p, rank+trump, runs(p, trump));
            recall(p, jack+diamonds, pinochles(p));
            recall(p, queen+spades, pinochles(p));
            for (let rank of [queen, king]) 
                for (let suit of [diamonds, clubs, hearts, spades])
                    recall(p, rank+suit, marriages(p, suit));
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
    return nValue(bidder,ace+s) + nValue(bidder,ten+s) + nValue(bidder,king+s) + nValue(bidder,queen+s) + nValue(bidder,jack+s);
}

// Return number of cards of rank r in the bidder's hand
function nRank(r) {
    return nValue(bidder,r+spades) + nValue(bidder,r+hearts) + nValue(bidder,r+clubs) + nValue(bidder,r+diamonds);
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

// Log bid
function logBid(n, msg) {
    const partner = (bidder + 2) % players;
    if (bid[west]==none && bid[north]==none && bid[east]==none && bid[south]==none) {
        console.log("\nBid          Message      Quality  MinMeld  MaxMeld  Partner");
        console.log  ("===========  ===========  =======  =======  =======  =======");
    }
    console.log((((((`${player$[bidder]}:`.padEnd(7)+n).padEnd(13)+msg).padEnd(28)+(quality()>=0?"+":"")+quality()).padEnd(37)+minMeld()).padEnd(46)+maxMeld()).padEnd(55)+est[partner]);
}

// Return number of players who passed
function nPass() {
    return (bid[west]==pass?1:0) + (bid[north]==pass?1:0) + (bid[east]==pass?1:0) + (bid[south]==pass?1:0);
}

// Return computer bidder's bid
function autoBid() {
    const left    = (bidder + 1) % players;
    const partner = (bidder + 2) % players;
    const right   = (bidder + 3) % players;
    const highBid = Math.max(...bid);
    const maxBid  = maxMeld() + est[partner] + 20 + quality();
    if (nPass() == 3) {
        logBid(Math.max(bid[bidder], 50), "Last bid");
        return Math.max(bid[bidder], 50);
    }
    if (noMarriages()) {
        logBid("Pass", "No marriage");
        return pass;
    }
    if (bid[left]==none && bid[right]!=pass && highBid<60 && quality()>0 && maxBid>=60) {
        logBid(60, "Block bid");
        return 60;
    }
    if (bid[bidder]==none && bid[partner]!=pass && highBid<58 && minMeld()>15) {
        const high = Math.max(50, ...bid);
        const bump = Math.round(minMeld() / 10);
        const jump = Math.min(high + bump, 59);
        est[bidder] = (jump - high) * 10;
        logBid(jump, "Jump bid");
        return jump;
    }
    if (highBid<60 && quality()>=0 && maxBid>=60 && maxBid<70) {
        logBid(60, "Worried");
        return 60;
    }
    if (quality()>=0 && nextBid() <= maxBid) {
        logBid(nextBid(), "Want bid");
        return nextBid();
    }
    if (highBid<50 && partner==dealer) {
        logBid(50, "Save");
        return 50;
    }
    if (quality() < 0)
        logBid("Pass", "Bad quality");
    else
        logBid("Pass", "Too high");
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
    else if (noMarriages())                                     // no marriages
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
    else if (bid[bidder]>maxMeld()+est[partner]+20 && run())    // stretching w/ run
        t = maxSuit();
    else                                                        // all other cases
        for (let s of [spades, hearts, clubs, diamonds]) {
            if (marriages(bidder,s)>0 && nSuit(s)+nValue(bidder,ace+s)>n) {
                n = nSuit(s) + nValue(bidder, ace+s);
                t = s;
            }
        }
    return t;
}

// Return true if deck card index i can be selected
function legal(i) {
    const p = i2p(i);
    const c = i2c(i);
    const v = deck[pc2i(p,c)].v;
    if (v == none || p != thisPlayer)
        return false;
    if (firstSuit == none)
        return true;
    if (firstSuit!=trump && highSuit==trump) {
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
        if (follow(v) && highest(p,firstSuit)<=highCard)
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

// Locate all card positions (full if full hands, n = number of semi-exposed cards; v = visible card number)
function locateCards(full = false) {
    const rWest  = [+Math.PI/2, +Math.PI/2, -Math.PI/2, -Math.PI/2][dealer];
    const rNorth = [0,          0,          0,          0         ][dealer];
    const rEast  = [+Math.PI/2, -Math.PI/2, -Math.PI/2, +Math.PI/2][dealer];
    const rSouth = [+Math.PI,   0,          -Math.PI,   0         ][dealer];
    for (let p of [west, north, east, south]) {
        let n = -1, v = 0;
        if (full)
            n = 19;
        else
            for (let c = 0; c < cards; c++)
                if (deck[pc2i(p,c)].g == hand)
                    n++;
        for (let c = 0; c < cards; c++) {
            const i = pc2i(p, c);
            deck[i].gone.x = [-cardh/2, vw/2, vw+cardh/2, vw/2][p];
            deck[i].gone.y = [vh/2, -cardh/2, vh/2, vh+cardh/2][p];
            deck[i].gone.r = [rWest, rNorth, rEast, rSouth][p];
            deck[i].heap.x = [cardw+hpad, vw/2, vw-cardw-hpad, vw/2][p];
            deck[i].heap.y = [vh/2, cardw+vpad, vh/2, vh-cardw-vpad][p];
            deck[i].heap.r = [rWest, rNorth, rEast, rSouth][p];
            deck[i].hand.x = [cardh/2+hpad, vw/2-cardw/4*(v-n/2), vw-cardh/2-hpad, vw/2+cardw/4*(v-n/2)][p];
            deck[i].hand.y = [vh/2+cardw/4*(v-n/2), cardh/2+vpad, vh/2-cardw/4*(v-n/2), vh-cardh/2-vpad][p];
            deck[i].hand.r = [rWest, rNorth, rEast, rSouth][p];
            deck[i].bump.x = deck[i].hand.x + [cardh*0.4, 0, -cardh*0.4, 0][p];
            deck[i].bump.y = deck[i].hand.y + [0, cardh*0.4, 0, -cardh*0.4][p];
            deck[i].bump.r = [rWest, rNorth, rEast, rSouth][p];
            deck[i].play.x = vw/2 + [-cardh/2-pad/4, cardw/2+pad/4, cardh/2+pad/4, -cardw/2-pad/4][p];
            deck[i].play.y = vh/2 + [-cardw/2-pad/4, -cardh/2-pad/4, cardw/2+pad/4, cardh/2+pad/4][p];
            deck[i].play.r = [rWest, rNorth, rEast, rSouth][p];
            deck[i].strt.x = [deck[i].gone.x, deck[i].heap.x, deck[i].hand.x, deck[i].bump.x, deck[i].play.x][deck[i].g];
            deck[i].strt.y = [deck[i].gone.y, deck[i].heap.y, deck[i].hand.y, deck[i].bump.y, deck[i].play.y][deck[i].g];
            deck[i].strt.r = [rWest, rNorth, rEast, rSouth][p];
            deck[i].fnsh.x = [deck[i].gone.x, deck[i].heap.x, deck[i].hand.x, deck[i].bump.x, deck[i].play.x][deck[i].g];
            deck[i].fnsh.y = [deck[i].gone.y, deck[i].heap.y, deck[i].hand.y, deck[i].bump.y, deck[i].play.y][deck[i].g];
            deck[i].fnsh.r = [rWest, rNorth, rEast, rSouth][p];
            if (full || deck[i].g==hand)
                v++;
        }
    }
}

// Move index i from i0(?), group g0 at time t0 to i1(?), group g1, zIndex z1, face f1 over time t1
function moveCard(i, g0, t0, g1, z1, f1, t1, i0, i1) {
    i0 = i0 ?? i;
    i1 = i1 ?? i;
    deck[i].i = i;
    deck[i].g = g1;
    deck[i].z = z1;
    deck[i].f = f1;
    deck[i].strt.x = [deck[i0].gone.x, deck[i0].heap.x, deck[i0].hand.x, deck[i0].bump.x, deck[i0].play.x][g0];
    deck[i].strt.y = [deck[i0].gone.y, deck[i0].heap.y, deck[i0].hand.y, deck[i0].bump.y, deck[i0].play.y][g0];
    deck[i].strt.r = [deck[i0].gone.r, deck[i0].heap.r, deck[i0].hand.r, deck[i0].bump.r, deck[i0].play.r][g0];
    deck[i].strt.t = t0;
    deck[i].fnsh.x = [deck[i1].gone.x, deck[i1].heap.x, deck[i1].hand.x, deck[i1].bump.x, deck[i1].play.x][g1];
    deck[i].fnsh.y = [deck[i1].gone.y, deck[i1].heap.y, deck[i1].hand.y, deck[i1].bump.y, deck[i1].play.y][g1];
    deck[i].fnsh.r = [deck[i1].gone.r, deck[i1].heap.r, deck[i1].hand.r, deck[i1].bump.r, deck[i1].play.r][g1];
    deck[i].fnsh.t = t0 + t1;
}

// Initialize the global variables based on the size of docBody
function setSizes() {
    vw = Number.parseFloat(getComputedStyle(docBody).width);
    vh = Number.parseFloat(getComputedStyle(docBody).height);
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
    docCanvas.width  = vw;
    docCanvas.height = vh;
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
            context.drawImage(deck[i].f?faceImg[deck[i].v]:backImg, -cardw/2, -cardh/2, cardw, cardh);
            context.resetTransform();
        }
        if (now >= deck[i].fnsh.t) {
            context.translate(deck[i].fnsh.x, deck[i].fnsh.y);
            context.rotate(deck[i].fnsh.r);
            context.drawImage(deck[i].f?faceImg[deck[i].v]:backImg, -cardw/2, -cardh/2, cardw, cardh);
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
            context.drawImage(deck[i].f?faceImg[deck[i].v]:backImg, -cardw/2, -cardh/2, cardw, cardh);
            context.resetTransform();
        }
    }
    deck.sort((a,b)=>a.i-b.i);
    if (!done)
        requestAnimationFrame(frameEvent);
    else {
        setTimeout(ondone);
        ondone = function(){};
    }
}

// Next button clicked: deal the next hand, then trigger onload
function nextClicked() {
    nextBtn.onclick = "";
    handText.style.display = "none";
    setTimeout(onload);
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
    window.close();
}

// Hand ended: display stats and await contClicked, againClicked or quitClicked
function handEnded() {
    usOld.textContent = ourScore;
    themOld.textContent = theirScore;
    usBid.textContent = ourBid;
    themBid.textContent = theirBid;
    usMeld.textContent = ourMeld = ourMeld < 20 ? 0 : ourMeld;
    themMeld.textContent = theirMeld = theirMeld < 20 ? 0 : theirMeld;
    usTake.textContent = ourTake = ourTake < 20 ? 0 : ourTake;
    themTake.textContent = theirTake = theirTake < 20 ? 0 : theirTake;
    if (tossHand)
        if (bidder==north || bidder==south) {
            ourScore -= ourBid;
            theirScore += theirMeld;
        } else {
            theirScore -= theirBid;
            ourScore += ourMeld;
        }
    else {
        ourScore = ourMeld + ourTake < ourBid ? ourScore - ourBid : ourScore + ourMeld + ourTake;
        theirScore = theirMeld + theirTake < theirBid ? theirScore - theirBid : theirScore + theirMeld + theirTake;
    }
    usNew.textContent = ourScore;
    themNew.textContent = theirScore;
    if (ourTake<50 && theirTake<50 && ourScore<500 && theirScore<500) {
        nextDiv.style.display = "block";
        overDiv.style.display = "none";
        handText.style.display = "block";
        dealer = nextPlayer(dealer);
        nextBtn.onclick = nextClicked;
    } else {
        nextDiv.style.display = "none";
        overDiv.style.display = "block";
        if (ourTake==50 || ourScore>=500)
            overText.textContent = "We win!";
        else
            overText.textContent = "We lose!";
        handText.style.display = "block";
        againBtn.onclick = againClicked;
        quitBtn.onclick = quitClicked;
    }
}

// Trick viewed: pull trick, then retrigger handsRefanned or trigger handEnded
function trickViewed() {
    const now = performance.now();
    for (let i = 0; i < indices; i++)
        if (deck[i].g == play) {
            deck[i].v = none;
            moveCard(i, play, now, gone, 100, false, dealTime/10, i, pc2i(highPlayer,0));
        }
    if (nValue(west, none) < cards) {
        thisPlayer = highPlayer;
        thisCard = none;
        highCard = highSuit = highPlayer = none;
        firstCard = firstSuit = firstPlayer = none;
        animate(handsRefanned);
    } else {
        if (highPlayer == north || highPlayer == south)
            ourTake += 2;
        else
            theirTake += 2;
        animate(handEnded);
    }
}

// Trick play: pause a moment to view trick, then trigger trickViewed
function trickPlayed() {
    const now = performance.now();
    for (let i = 0; i < indices; i++)
        if (deck[i].g == play) {
            if (rank(deck[i].v)==ace || rank(deck[i].v)==ten || rank(deck[i].v)==king)
                if (highPlayer == north || highPlayer == south)
                    ourTake += 1;
                else
                    theirTake += 1;
            moveCard(i, play, now, play, -1, true, dealTime/4);
        }
    animate(trickViewed);
}

// Card play: close hand, then trigger trickPlayed or handsRefanned  
function cardPlayed() {
    const now = performance.now();
    const i = pc2i(thisPlayer, thisCard);
    locateCards();
    moveCard(i, play, now, play, -100, true, 0);
    thisPlayer = nextPlayer(thisPlayer);
    if (thisPlayer == firstPlayer)
        animate(trickPlayed);
    else
        animate(handsRefanned);
}

// Card selected: update stats, play face, then trigger cardPlayed
function cardSelected() {
    const now = performance.now();
    const p = thisPlayer;
    const c = thisCard;
    const i = pc2i(p, c);
    const v = deck[pc2i(p,c)].v;
    let msg = "";

    // if card is in high suit and doesn't beat non-ace high card, player must not have any cards that can beat the high card 
    if (suit(v)==highSuit && highCard!=ace+highSuit && v<=highCard) {
        msg = `Can't beat ${value$[highCard]}`;
        for (let v=highCard+1; v<=ace+highSuit; v++)
            maxCards[p][v] = 0;
    }
    // if no first card, this must be the first card/suit/player and the high card/suit/player
    if (firstCard == none) {
        console.log(`\nPlay       Remain  West   North  East   South  Message`);
        console.log  (`=========  ======  =====  =====  =====  =====  =======`);
        firstCard = highCard = v;
        firstSuit = highSuit = suit(v);
        firstPlayer = highPlayer = p;
    }
    // if card is in trump and trump wasn't led, player must be out of the first suit
    if (suit(v)==trump && firstSuit!=trump) {
        msg = `Out of ${suit$[firstSuit]}.`;
        for (let v = jack+firstSuit; v <= ace+firstSuit; v++)
            maxCards[p][v] = 0;
    }
    // if card is in high suit and beats high card, we have a new high card/suit/player
    if (suit(v)==highSuit && v>highCard) {
        highCard = v;
        highSuit = suit(v);
        highPlayer = p;
    }
    // if card is in trump and the high suit isn't trump, we have a new high card/suit/player
    if (suit(v)==trump && highSuit!=trump) {
        highCard = v;
        highSuit = suit(v);
        highPlayer = p;
    }
    // Update stats based on revealed card
    remaining[v]--;
    minCards[p][v] = Math.max(minCards[p][v] - 1, 0);
    const loose = remaining[v] - minCards[west][v] - minCards[north][v] - minCards[east][v] - minCards[south][v];
    for (let p of [west, north, east, south])
        maxCards[p][v] = Math.min(maxCards[p][v], minCards[p][v] + loose);

    // log this play
    let t = `${player$[p]}:`.padEnd(7) + `${value$[v]}    ${remaining[v]}     `;
    for (let p of [west, north, east, south])
        t += `${minCards[p][v]}...${maxCards[p][v]}  `;
    console.log(t + msg);

    // animate card play
    moveCard(i, deck[i].g, now, play, deck[i].z, true, dealTime/10);
    animate(cardPlayed);
}

// Mouse moved: if off bump card, unbump cards; if moved to hand legal card, bump it
function mouseMoved(e) {
    const now = performance.now();
    const i = xy2i (e.clientX, e.clientY);
    if (i == undefined || deck[i].g != bump)
        for (let i2 = 0; i2 < indices; i2++)
            if (deck[i2].g == bump) {
                moveCard(i2, bump, now, hand, i2, true, dealTime/20);
                requestAnimationFrame(frameEvent);
            }
    if (i != undefined && deck[i].g == hand && legal(i)) {
        moveCard(i, hand, now, bump, i, true, dealTime/20);
        requestAnimationFrame(frameEvent);
    }
}

// Mouse pressed: if hand/bump southern card, unbump cards; if hand legal card, bump it; if legal, play it
function mousePressed(e) {
    const now = performance.now();
    const i = xy2i (e.clientX, e.clientY);
    if (i != undefined) {
        for (let i2 = 0; i2 < indices; i2++) {
            if (i2 != i && deck[i2].g == bump) {
                moveCard(i2, bump, now, hand, i2, true, dealTime/20);
                requestAnimationFrame(frameEvent);
            }
        }
        if (deck[i].g == hand && legal(i)) {
            moveCard(i, hand, now, bump, i, true, dealTime/20);
            requestAnimationFrame(frameEvent);
        }
        if (legal(i)) {
            thisCard = i2c(i); 
            docBody.onmousemove = "";
            docBody.onmousedown = "";
            docBody.ontouchstart = "";
            docBody.ontouchmove = "";
            setTimeout(cardSelected);
        }
    }
}

// Touch started: if legal bump card, play it; if isn't bump card, unbump cards; if hand legal, bump it 
function touchStarted(e) {
    docBody.onmousedown = "";
    docBody.onmousemove = "";
    const now = performance.now();
    const i = xy2i (e.touches[0].clientX, e.touches[0].clientY);
    if (i != undefined && deck[i].g == bump && legal(i)) {
        thisCard = i2c(i); 
        docBody.ontouchstart = "";
        docBody.ontouchmove = "";
        setTimeout(cardSelected);
        return;
    }
    if (i == undefined || deck[i].g != bump) {
        for (let i2 = 0; i2 < indices; i2++) {
            if (deck[i2].g == bump) {
                moveCard(i2, bump, now, hand, i2, true, dealTime/20);
                requestAnimationFrame(frameEvent);
            }
        }
    }
    if (i != undefined && deck[i].g == hand && legal(i)) {
        moveCard(i, hand, now, bump, i, true, dealTime/20);
        requestAnimationFrame(frameEvent);
    }
}

// Touch moved: if off bump card, unbump cards; if hand legal card, bump it
function touchMoved(e) {
    const now = performance.now();
    const i = xy2i (e.touches[0].clientX, e.touches[0].clientY);
    if (i == undefined || deck[i].g != bump) {
        for (let i2 = 0; i2 < indices; i2++) {
            if (deck[i2].g == bump) {
                moveCard(i2, bump, now, hand, i2, true, dealTime/20);
                requestAnimationFrame(frameEvent);
            }
        }
    }
    if (i != undefined && deck[i].g == hand && legal(i)) {
        moveCard(i, hand, now, bump, i, true, dealTime/20);
        requestAnimationFrame(frameEvent);
    }
}

// Hands re-fanned: now select a card to play, then trigger cardSelected
function handsRefanned() {
    if (thisPlayer == south) {
        docBody.onmousemove = mouseMoved;
        docBody.onmousedown = mousePressed;
        docBody.ontouchstart = touchStarted;
        docBody.ontouchmove = touchMoved;
    } else {
        thisCard = autoSelect(thisPlayer);
        setTimeout (cardSelected, dealTime / 10);
    }
}

// Meld gathered: re-fan hands, then trigger handsRefanned
function meldGathered() {
    const now = performance.now();
    locateCards(true);
    for (let i = 0; i < indices; i++)
        if (openHand || i2p(i)==south)
            moveCard(i, gone, now, hand, i, true, dealTime/10);
        else
            moveCard(i, gone, now, hand, -i, false, dealTime/10);
    thisPlayer = firstPlayer = bidder;
    thisCard = firstCard = firstSuit = highCard = highSuit = highPlayer = none;
    ourTake = theirTake = 0;
    tossHand = false;
    animate(handsRefanned);
}

// Show button clicked: show entire south hand, then trigger meldFanned
function showClicked() {
    const now = performance.now();
    if (showBtn.value == "Show") {
        for (let c = 0; c < cards; c++)
            deck[pc2i(south,c)].g = hand;
        locateCards();
        for (let c = 0; c < cards; c++)
            moveCard(pc2i(south,c), gone, now, hand, pc2i(south,c), true, dealTime/10);
        showBtn.value = "Hide";
    } else {
        for (let c = 0; c < cards; c++)
            deck[pc2i(south,c)].g = gone;
        recallMeld();
        locateCards();
        for (let c = 0; c < cards; c++)
            if (deck[pc2i(south,c)].g == hand)
                moveCard(pc2i(south,c), gone, now, hand, pc2i(south,c), true, dealTime/10);
        showBtn.value = "Show";
    }
    animate(meldFanned);
}

// Play button clicked: gather the meld, then trigger meldGathered
function playClicked() {
    const now = performance.now();
    showBtn.value = "Show";
    showBtn.onclick = "";
    playBtn.onclick = "";
    tossBtn.onclick = "";
    playText.style.display = "none";
    for (let i = 0; i < indices; i++)
        moveCard(i, hand, now, gone, -i, false, dealTime/10);
    animate(meldGathered);
}

// Toss button clicked: gather the meld, then trigger handEnded
function tossClicked() {
    const now = performance.now();
    showBtn.value = "Show";
    showBtn.onclick = "";
    playBtn.onclick = "";
    tossBtn.onclick = "";
    playText.style.display = "none";
    tossHand = true;
    for (let i = 0; i < indices; i++)
        moveCard(i, hand, now, gone, -i, false, dealTime/10);
    animate(handEnded);
}

// Meld fanned: display situation, then await showClicked, playClicked or tossClicked 
function meldFanned() {
    let weNeed = 20, theyNeed = 20;
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
    ourBid = [pass, bid[north], pass, bid[south]][bidder];
    theirBid = [bid[west], pass, bid[east], pass][bidder];
    playPara[0].textContent = `${player$[bidder]} won the bid at ${bid[bidder]} with ${suit$[trump]}.`;
    playPara[1].textContent = `Our meld is ${ourMeld < 20 ? "< 20" : ourMeld} and their meld is ${theirMeld < 20 ? "< 20" : theirMeld}.`;
    if (marriages(bidder,trump) == 0) {
        playPara[2].textContent = `${player$[bidder]} must toss this hand.`;
        showBtn.style.display = "none";
        playBtn.style.display = "none";
        tossBtn.style.display = "inline";
    } else if (bidder==west&&theyNeed>30 || bidder==north&&weNeed>30 || bidder==east&&theyNeed>30) {
        tossHand = true;
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
    showBtn.onclick = showClicked;
    playBtn.onclick = playClicked;
    tossBtn.onclick = tossClicked;
    playText.style.display = "flex";
}

// Hands regathered: fan out meld, then trigger meldFanned
function handsRegathered() {
    const now = performance.now();
    ourMeld = countMeld(north, trump) + countMeld(south, trump);
    theirMeld = countMeld(west, trump) + countMeld(east, trump);

    // show meld cards (move meld from stack to face-up hand)
    recallMeld();

    // Adjust minCards and maxCards based on face up meld cards
    for (let p of [west, north, east, south]) {
        // Adjust minCards based on revealed cards
        for (let v = 0; v < values; v++)
            minCards[p][v] = nValueUp(p, v);
        // if #A/K/Q/J in other suits > #A/K/Q/J in this suit, max = #A/K/Q/J in this suit
        for (let rank of [ace, king, queen, jack]) {
            let minCount = 5;
            let minSuit = none;
            let minHits = 0;
            for (let suit of [diamonds, clubs, hearts, spades])
                if (nValueUp(p,rank+suit) < minCount) {
                    minCount = nValueUp(p,rank+suit);
                    minSuit = suit;
                    minHits = 1;
                } else if (nValueUp(p,rank+suit) == minCount)
                    minHits++;
            if (minHits == 1)
                maxCards[p][rank+minSuit] = minCount;
        }
        // if #Q/K < #K/Q in suit, max = #Q/K in suit
        for (let suit of [diamonds, clubs, hearts, spades])
            if (nValueUp(p,queen+suit) < nValueUp(p,king+suit))
                maxCards[p][queen+suit] = nValueUp(p,queen+suit);
            else if (nValueUp(p,king+suit) < nValueUp(p,queen+suit))
                maxCards[p][king+suit] = nValueUp(p,king+suit);
        // if #JD/QS < #QS/JD, max = #JD/QS
        if (nValueUp(p,jack+diamonds) < nValueUp(p,queen+spades))
            maxCards[p][jack+diamonds] = nValueUp(p,jack+diamonds);
        else if (nValueUp(p,queen+spades) < nValueUp(p,jack+diamonds))
            maxCards[p][queen+spades] = nValueUp(p,queen+spades);
        // if #T < min(#A,#K,#Q,#J) in trump, max = #T
        let minOther = 5;
        for (let rank of [ace, king, queen, jack])
            if (nValueUp(p,rank+trump) < minOther)
                minOther = nValueUp(p,rank+trump);
        if (nValueUp(p,ten+trump) < minOther)
            maxCards[p][ten+trump] = nValueUp(p,ten+trump);
    }
    // reduce maxCards based on minCards
    for (let p of [west, north, east, south])
        for (let v = 0; v < values; v++) {
            const loose = 4 - minCards[west][v] - minCards[north][v] - minCards[east][v] - minCards[south][v];
            maxCards[p][v] = Math.min(maxCards[p][v], minCards[p][v] + loose);
        }
    // log stats
    let t = "";
    console.log("\nLimits  J♦ Q♦ K♦ T♦ A♦ J♣ Q♣ K♣ T♣ A♣ J♥ Q♥ K♥ T♥ A♥ J♠ Q♠ K♠ T♠ A♠");
    console.log  ("======  == == == == == == == == == == == == == == == == == == == ==");
    for (let p of [west, north, east, south]) {
        t = `${player$[p]}:`;
        t = t.padEnd(7);
        for (let v = 0; v < values; v++)
            t += ` ${minCards[p][v]}${maxCards[p][v]}`;
        console.log(t);
    }
    // animate movement of meld cards to hand
    locateCards();
    for (let i = 0; i < indices; i++)
        if (deck[i].g == hand)
            moveCard(i, gone, now, hand, i, true, dealTime/10);
    animate(meldFanned);
}

// Trump picked: regather hands, then trigger handsRegathered
function trumpPicked() {
    const now = performance.now();
    console.log(`\n${player$[bidder]} picks ${suit$[trump]}.`)
    for (let i = 0; i < indices; i++)
        moveCard(i, hand, now, gone, -i, false, dealTime/10);
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
    bidBox[west].textContent = bidBox[north].textContent = bidBox[east].textContent ="";
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
    bidder = nextPlayer(bidder);
    if (nPass() == 3) {
        bidText.style.display = "none";
        setTimeout(biddingDone, dealTime / 4);
    } else
        setTimeout(handsFanned, dealTime / 4);
}

// Hands fanned: await bidClicked or autoBid and retrigger handsFanned or trigger biddingDone
function handsFanned() {
    while (bid[bidder] == pass) 
        bidder = nextPlayer(bidder);
    if (bidder == south && bid[bidder] == none) {
        meldSpan[0].textContent = countMeld(south, spades);
        meldSpan[1].textContent = countMeld(south, hearts);
        meldSpan[2].textContent = countMeld(south, clubs);
        meldSpan[3].textContent = countMeld(south, diamonds);
        bidText.style.display = "flex";
    }
    if (bidder == south) {
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

// Hands gathered: fan hands, then trigger handsFanned
function handsGathered() {
    const now = performance.now();
    for (let i = 0; i < indices; i++)
        if (openHand || i2p(i)==south)
            moveCard(i, gone, now, hand, i, true, dealTime/10);
        else
            moveCard(i, gone, now, hand, -i, false, dealTime/10);
    bidder = nextPlayer(dealer);
    bid[west] = bid[north] = bid[east] = bid[south] = none;
    est[west] = est[north] = est[east] = est[south] = typical;
    animate(handsFanned);
}

// Deck dealt: gather hands, then trigger handsGathered
function deckDealt() {
    const now = performance.now();
    for (let i = 0; i < indices; i++)
        moveCard(i, heap, now, gone, -i, false, dealTime/20);
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

// Menu close icon clicked: close the menu, then await menuClicked
function menuXClicked() {
    menuText.style.display = "none";
    menuX.onclick = "";
    menuIcon.onclick = menuClicked;
}

// Stats close button clicked: close the stats and menu displays, then await menuClicked
function statsXClicked() {
    statsText.style.display = "none";
    statsX.onclick = "";
    menuIcon.onclick = menuClicked;
}

// Statistics menu item clicked: close menu and display stats, then await statsCloseClicked
function statsClicked() {
    for (let s = 0; s < statField.length; s++) {
        const row = s % 5;
        const col = Math.floor((s % 25) / 5);
        const grp = Math.floor(s / 25);
        const v = (4 - row) + [spades, hearts, clubs, diamonds][grp];
        const p = col;
        const unknown = remaining[v] - nValue(south,v) - minCards[west][v] - minCards[north][v] - minCards[east][v];
        if (col == 3)
            statField[s].textContent = nValue(south,v) + "-" + nValue(south,v);
        else if (col == 4)
            statField[s].textContent = unknown;
        else
            statField[s].textContent = minCards[p][v] + "-" + Math.min(maxCards[p][v], minCards[p][v] + unknown);
    }
    for (let s of [spades, hearts, clubs, diamonds]) {
        const element = [diamondsT,,,,,clubsT,,,,,heartsT,,,,,spadesT][s];
        if (trump == s)
            element.style.backgroundColor = "#D0FFD0";
        else
            element.style.backgroundColor = "white";
    }
    menuText.style.display = "none";
    statsText.style.display = "block";
    statsItem.onclick = "";
    optnsItem.onclick = "";
    rstrtItem.onclick = "";
    statsX.onclick = statsXClicked;
}

// Options done button clicked: close the options display, then await menuClicked
function optnsXClicked() {
    const now = performance.now();
    optnsText.style.display = "none";
    optnsXClicked.onclick = "";
    menuIcon.onclick = menuClicked;
    if (slowChk.checked)
        dealTime = slowDeal;
    else
        dealTime = fastDeal;
    openHand = openChk.checked;
    for (let i = 0; i < indices; i++) {
        const p = i2p(i);
        const c = i2c(i);
        if (p != south && deck[i].g == hand) {
            if (openHand) {
                deck[i].f = true;
                deck[i].z = c;
            } else {
                deck[i].f = false;
                deck[i].z = cards - c - 1;
            }
            deck[i].strt.t = now;
            deck[i].fnsh.t = now;
        }
    }
    requestAnimationFrame(frameEvent);
}

// Options menu item clicked: close menu and display options, then await doneClicked
function optionsClicked() {
    menuText.style.display = "none";
    optnsText.style.display = "block";
    statsItem.onclick = "";
    optnsItem.onclick = "";
    rstrtItem.onclick = "";
    optnsX.onclick = optnsXClicked;
}

// Restart menu item clicked: restart the app
function restartClicked() {
     location.reload();
}

// Exit menu item clicked: close the app
function exitClicked() {
    window.close();
}

// Menu icon clicked: display the menu, then await menuXClicked, statsClicked, restartClicked
function menuClicked() {
    menuText.style.display = "block";
    menuIcon.onclick = "";
    menuX.onclick = menuXClicked;
    statsItem.onclick = statsClicked;
    optnsItem.onclick = optionsClicked;
    rstrtItem.onclick = restartClicked;
    exitItem.onclick = exitClicked;
}

// Load event: initialize app, deal cards, sort cards, then trigger deckDealt
function loaded() {
    const all = Array.from(new Array(indices), (v, k) => k % cards);
    for (let v = 0; v < values; v++)
        faceImg[v].src = faceSrc[v];
    backImg.src = backSrc;
    onresize = resized;
    menuIcon.draggable = false;
    menuIcon.onclick = menuClicked;
    shuffleArray(all);
    for (let p of [west, north, east, south]) {
        for (let c = 0; c < cards; c++)
            deck[pc2i(p,c)].v = all.slice(p*20, p*20+20).sort((a,b)=>b-a)[c];
        minCards[p].fill(0);
        maxCards[p].fill(4);
    }
    remaining.fill(4);
    trump = none;
    console.clear();
    console.log("Start");
    console.log("=====");
    for (let p of [west, north, east, south]) {
        let t = `${player$[p]}:`.padEnd(6);
        for (let c = 0; c < cards; c++)
            t += ` ${value$[deck[pc2i(p,c)].v]}`;
        console.log(t);
    }
    setSizes();
    locateCards(true);
    let t0 = performance.now();
    let z = 0;
    for (let c = cards-1; c >= 0; c--) {
        for (let p of [(dealer+1)%players, (dealer+2)%players, (dealer+3)%players, dealer]) {
            const i = pc2i(p, c);
            moveCard(i, gone, t0, heap, z, false, dealTime/20, pc2i(dealer,c), i);
            deck[i].fnsh.x += (Math.random()-0.5)*cardw/2;
            deck[i].fnsh.y += (Math.random()-0.5)*cardw/2;
            deck[i].fnsh.r += (Math.random()-0.5)*Math.PI/4;
            t0 = t0 + (dealTime - dealTime / 20) / indices;
            z++;
        }
    }
    animate(deckDealt);
}

// Set function to be invoked after app is loaded and rendered
onload = loaded;