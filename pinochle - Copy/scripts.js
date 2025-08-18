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

// Card values = rank + suit
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
        this.c    = 0;              // card number
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

// card[c] = card c
const cards = 80;
const cardsPerPlayer = cards / players;
const card = [
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
let dealer      = south;            // the player who is dealing or last dealt
let bidder      = none;             // the player who is bidding or won the bid
let trump       = none;             // the bidder's trump suit
let thisPlayer  = none;             // the player who is playing a card
let thisCard    = none;             // the card number that is being played
let firstSuit   = none;             // the suit led in this hand
let highValue   = none;             // the high card value in this hand (so far)
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
let openHand    = false;            // true if faces for all hands are displayed
let tossHand    = false;            // true if bidder decides to toss in the hand

// Dynamic sizes
let vw          = 0;                // view width
let vh          = 0;                // view height
let pad         = 0;                // padding around display elements
let hpad        = 0;                // horizontal padding for east and west hands
let vpad        = 0;                // vertical padding for north and south hands 
let cardw       = 0;                // card width
let cardh       = 0;                // card height

// Return player assigned to card c
function c2p(c) {
    return Math.floor(c / cardsPerPlayer);
}

// Return first card assigned to player p (or 80 for player south+1)
function p2c(p) {
    return p * cardsPerPlayer;
}

// Return card number of top south card (or undefined) at x,y coordinates 
function xy2c(x, y) {
    let topC;
    card.sort((a,b)=>a.z-b.z);
    for (let c = 0; c < cards; c++) {
        if (c2p(card[c].c) == south) {
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
    for (let c = p2c(p); c < p2c(p+1); c++)
        if (suit(card[c].v)==s && card[c].v>h)
            h = card[c].v;
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
    for (let c = p2c(p); c < p2c(p+1); c++)
        if (card[c].v == v)
            n++;
    return n;
}

// Return number of player p's face up cards with card value v
function nValueUp(p, v) {
    let n = 0;
    for (let c = p2c(p); c < p2c(p+1); c++)
        if (card[c].f && card[c].v==v)
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

// Return minimum meld in bidder's hand
function minMeld() {
    let min = 999;
    for (let s of [spades, hearts, clubs, diamonds])
        min = Math.min(meld(bidder, s), min);
    return min;
}

// Return maximum meld in bidder's hand
function maxMeld() {
    let max = 0;
    for (let s of [spades, hearts, clubs, diamonds])
        max = Math.max(meld(bidder, s), max);
    return max;
}

// Return suit with maximum meld 
function maxSuit() {
    for (let s of [spades, hearts, clubs, diamonds])
        if (meld(bidder, s) == maxMeld())
            return s;
}

// Recall n cards of value v for into player p's hand 
function recallCards(p, v, n) {
    for (let c = 0; n > 0 && c < cards; c++)
        if (c2p(c)==p && card[c].v==v) {
            card[c].g = hand;
            card[c].f = true;
            n--;
        }
}

// Recall meld into player's hands
function recallMeld() {
    for (let p of [west, north, east, south])
        if (((p==north || p==south) && ourMeld<20) || ((p==west || p==east) && theirMeld<20)) {
            if (p == bidder)
                for (let r of [queen, king]) 
                    recallCards(p, r+trump, Math.min(marriages(p, trump)), 1);
            for (let s of [diamonds, clubs, hearts, spades])
                recallCards(p, ace+s, arounds(p, ace));
        } else {
            for (let r of [jack, queen, king, ace])
                for (let s of [diamonds, clubs, hearts, spades])
                    recallCards(p, r+s, arounds(p, r));
            for (let r of [jack, queen, king, ten, ace])
                recallCards(p, r+trump, runs(p, trump));
            recallCards(p, jack+diamonds, pinochles(p));
            recallCards(p, queen+spades, pinochles(p));
            for (let r of [queen, king]) 
                for (let s of [diamonds, clubs, hearts, spades])
                    recallCards(p, r+s, marriages(p, s));
        }
}

// Return next player after current player p (or none if p is none)
function nextPlayer(p) {
    if (p == none)
        return none;
    return (p + 1) % players;
}

// Return next bid based on high bid (or none or pass)
function nextBid() {
    const high = Math.max(49, ...bid);
    if (high < 60)
        return high + 1;
    else
        return high + 5;
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
    return marriages(bidder,spades)==0 && marriages(bidder,hearts)==0 && marriages(bidder,clubs)==0 && marriages(bidder,diamonds)==0;
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
        const jump = Math.min(high + Math.round(minMeld()/10), 59);
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

// Return true if card c can be selected
function legal(c) {
    const p = c2p(c);
    const v = card[c].v;
    if (v == none || p != thisPlayer)
        return false;
    if (firstSuit == none)
        return true;
    if (firstSuit!=trump && highSuit==trump) {
        if (follow(v))
            return true;
        if (cantFollow(p) && suit(v)==trump && v>highValue)
            return true;
        if (cantFollow(p) && highest(p,trump)<=highValue && suit(v)==trump)
            return true;
        if (cantFollow(p) && cantTrump(p))
            return true;
    } else {
        if (follow(v) && v>highValue)
            return true;
        if (follow(v) && highest(p,firstSuit)<=highValue)
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

// Return computer player p's first legal card number
function autoSelect(p) {
    for (let c = p2c(p); c < p2c(p+1); c++)
        if (legal(c))
            return c;
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

// Return number of cards in player p's hand
function nCards(p) {
    let n = 0;
    for (let c = p2c(p); c < p2c(p+1); c++)
        if (card[c].g == hand)
            n++;
    return n;
}

// Locate all card positions (full if full hands, n = number of semi-exposed cards; v = visible card number)
function locateCards(full = false) {
    const rWest  = [+Math.PI/2, +Math.PI/2, -Math.PI/2, -Math.PI/2][dealer];
    const rNorth = [0,          0,          0,          0         ][dealer];
    const rEast  = [+Math.PI/2, -Math.PI/2, -Math.PI/2, +Math.PI/2][dealer];
    const rSouth = [+Math.PI,   0,          -Math.PI,   0         ][dealer];
    let n, v;
    for (let c = 0; c < cards; c++) {
        const p = c2p(c);
        if (c == p2c(p)) {
            n = full? 19 : nCards(p)-1;
            v = 0;
        }
        card[c].gone.x = [-cardh/2, vw/2, vw+cardh/2, vw/2][p];
        card[c].gone.y = [vh/2, -cardh/2, vh/2, vh+cardh/2][p];
        card[c].gone.r = [rWest, rNorth, rEast, rSouth][p];
        card[c].heap.x = [cardw+hpad, vw/2, vw-cardw-hpad, vw/2][p];
        card[c].heap.y = [vh/2, cardw+vpad, vh/2, vh-cardw-vpad][p];
        card[c].heap.r = [rWest, rNorth, rEast, rSouth][p];
        card[c].hand.x = [cardh/2+hpad, vw/2-cardw/4*(v-n/2), vw-cardh/2-hpad, vw/2+cardw/4*(v-n/2)][p];
        card[c].hand.y = [vh/2+cardw/4*(v-n/2), cardh/2+vpad, vh/2-cardw/4*(v-n/2), vh-cardh/2-vpad][p];
        card[c].hand.r = [rWest, rNorth, rEast, rSouth][p];
        card[c].bump.x = card[c].hand.x + [cardh*0.4, 0, -cardh*0.4, 0][p];
        card[c].bump.y = card[c].hand.y + [0, cardh*0.4, 0, -cardh*0.4][p];
        card[c].bump.r = [rWest, rNorth, rEast, rSouth][p];
        card[c].play.x = vw/2 + [-cardh/2-pad/4, cardw/2+pad/4, cardh/2+pad/4, -cardw/2-pad/4][p];
        card[c].play.y = vh/2 + [-cardw/2-pad/4, -cardh/2-pad/4, cardw/2+pad/4, cardh/2+pad/4][p];
        card[c].play.r = [rWest, rNorth, rEast, rSouth][p];
        card[c].strt.x = [card[c].gone.x, card[c].heap.x, card[c].hand.x, card[c].bump.x, card[c].play.x][card[c].g];
        card[c].strt.y = [card[c].gone.y, card[c].heap.y, card[c].hand.y, card[c].bump.y, card[c].play.y][card[c].g];
        card[c].strt.r = [rWest, rNorth, rEast, rSouth][p];
        card[c].fnsh.x = [card[c].gone.x, card[c].heap.x, card[c].hand.x, card[c].bump.x, card[c].play.x][card[c].g];
        card[c].fnsh.y = [card[c].gone.y, card[c].heap.y, card[c].hand.y, card[c].bump.y, card[c].play.y][card[c].g];
        card[c].fnsh.r = [rWest, rNorth, rEast, rSouth][p];
        if (full || card[c].g==hand)
            v++;
    }
}

// Move card c from c0(?), group g0 at time t0 to c1(?), group g1, zIndex z1, face f1 over time t1
function moveCard(c, g0, t0, g1, z1, f1, t1, c0, c1) {
    c0 = c0 ?? c;
    c1 = c1 ?? c;
    card[c].c = c;
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
    for (let c = 0; c < cards; c++)
        if (card[c].g == play) {
            card[c].v = none;
            moveCard(c, play, now, gone, 100, false, dealTime/10, c, p2c(highPlayer));
        }
    if (nValue(west, none) < cardsPerPlayer) {
        thisPlayer = highPlayer;
        thisCard = firstSuit = highValue = highSuit = highPlayer = none;
        animate(handsRefanned);
    } else {
        if (highPlayer == north || highPlayer == south)
            ourTake += 2;
        else
            theirTake += 2;
        animate(handEnded);
    }
}

// Trick played: pause a moment to view trick, then trigger trickViewed
function trickPlayed() {
    const now = performance.now();
    for (let c = 0; c < cards; c++)
        if (card[c].g == play) {
            if (rank(card[c].v)==ace || rank(card[c].v)==ten || rank(card[c].v)==king)
                if (highPlayer == north || highPlayer == south)
                    ourTake += 1;
                else
                    theirTake += 1;
            moveCard(c, play, now, play, -100, true, dealTime/4);
        }
    animate(trickViewed);
}

// Card played: close hand, then trigger trickPlayed or handsRefanned  
function cardPlayed() {
    const now = performance.now();
    locateCards();
    moveCard(thisCard, play, now, play, -100, true, 0);
    thisPlayer = nextPlayer(thisPlayer);
    if (nGroup(play) == players)
        animate(trickPlayed);
    else
        animate(handsRefanned);
}

// Card selected: update stats, play face, then trigger cardPlayed
function cardSelected() {
    const now = performance.now();
    const p = thisPlayer;
    const c = thisCard;
    const v = card[c].v;
    let msg = "";

    // if card is in high suit and doesn't beat non-ace high card, player must not have any cards that can beat the high card 
    if (suit(v)==highSuit && highValue!=ace+highSuit && v<=highValue) {
        msg = `Can't beat ${value$[highValue]}`;
        for (let v=highValue+1; v<=ace+highSuit; v++)
            maxCards[p][v] = 0;
    }
    // if no first suit, this must be the first suit and the high value/suit/player
    if (firstSuit == none) {
        console.log(`\nPlay       Remain  West   North  East   South  Message`);
        console.log  (`=========  ======  =====  =====  =====  =====  =======`);
        firstSuit = suit(v);
        highValue = v;
        highSuit = suit(v);
        highPlayer = p;
    }
    // if card is in trump and trump wasn't led, player must be out of the first suit
    if (suit(v)==trump && firstSuit!=trump) {
        msg = `Out of ${suit$[firstSuit]}.`;
        for (let v = jack+firstSuit; v <= ace+firstSuit; v++)
            maxCards[p][v] = 0;
    }
    // if card is in high suit and beats high card, we have a new high value/suit/player
    if (suit(v)==highSuit && v>highValue) {
        highValue = v;
        highSuit = suit(v);
        highPlayer = p;
    }
    // if card is in trump and the high suit isn't trump, we have a new high value/suit/player
    if (suit(v)==trump && highSuit!=trump) {
        highValue = v;
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
    moveCard(c, card[c].g, now, play, card[c].z, true, dealTime/10);
    animate(cardPlayed);
}

// Mouse moved: if off bump card, unbump cards; if moved to hand legal card, bump it
function mouseMoved(e) {
    const now = performance.now();
    const c = xy2c(e.clientX, e.clientY);
    if (c == undefined || card[c].g != bump)
        for (let c2 = 0; c2 < cards; c2++)
            if (card[c2].g == bump) {
                moveCard(c2, bump, now, hand, c2, true, dealTime/20);
                requestAnimationFrame(frameEvent);
            }
    if (c != undefined && card[c].g == hand && legal(c)) {
        moveCard(c, hand, now, bump, c, true, dealTime/20);
        requestAnimationFrame(frameEvent);
    }
}

// Mouse pressed: if hand/bump southern card, unbump cards; if hand legal card, bump it; if legal, play it
function mousePressed(e) {
    const now = performance.now();
    const c = xy2c(e.clientX, e.clientY);
    if (c != undefined) {
        for (let c2 = 0; c2 < cards; c2++) {
            if (c2 != c && card[c2].g == bump) {
                moveCard(c2, bump, now, hand, c2, true, dealTime/20);
                requestAnimationFrame(frameEvent);
            }
        }
        if (card[c].g == hand && legal(c)) {
            moveCard(c, hand, now, bump, c, true, dealTime/20);
            requestAnimationFrame(frameEvent);
        }
        if (legal(c)) {
            thisCard = c; 
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
    const c = xy2c(e.touches[0].clientX, e.touches[0].clientY);
    if (c != undefined && card[c].g == bump && legal(c)) {
        thisCard = c; 
        docBody.ontouchstart = "";
        docBody.ontouchmove = "";
        setTimeout(cardSelected);
        return;
    }
    if (c == undefined || card[c].g != bump) {
        for (let c2 = 0; c2 < cards; c2++) {
            if (card[c2].g == bump) {
                moveCard(c2, bump, now, hand, c2, true, dealTime/20);
                requestAnimationFrame(frameEvent);
            }
        }
    }
    if (c != undefined && card[c].g == hand && legal(c)) {
        moveCard(c, hand, now, bump, c, true, dealTime/20);
        requestAnimationFrame(frameEvent);
    }
}

// Touch moved: if off bump card, unbump cards; if hand legal card, bump it
function touchMoved(e) {
    const now = performance.now();
    const c = xy2c(e.touches[0].clientX, e.touches[0].clientY);
    if (c == undefined || card[c].g != bump) {
        for (let c2 = 0; c2 < cards; c2++) {
            if (card[c2].g == bump) {
                moveCard(c2, bump, now, hand, c2, true, dealTime/20);
                requestAnimationFrame(frameEvent);
            }
        }
    }
    if (c != undefined && card[c].g == hand && legal(c)) {
        moveCard(c, hand, now, bump, c, true, dealTime/20);
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
    for (let c = 0; c < cards; c++)
        if (openHand || c2p(c)==south)
            moveCard(c, gone, now, hand, c, true, dealTime/10);
        else
            moveCard(c, gone, now, hand, -c, false, dealTime/10);
    thisPlayer = bidder;
    thisCard = firstSuit = highValue = highSuit = highPlayer = none;
    ourTake = theirTake = 0;
    tossHand = false;
    animate(handsRefanned);
}

// Show button clicked: show entire south hand, then trigger meldFanned
function showClicked() {
    const now = performance.now();
    if (showBtn.value == "Show") {
        for (let c = p2c(south); c < p2c(south+1); c++)
            card[c].g = hand;
        locateCards();
        for (let c = p2c(south); c < p2c(south+1); c++)
            moveCard(c, gone, now, hand, c, true, dealTime/10);
        showBtn.value = "Hide";
    } else {
        for (let c = p2c(south); c < p2c(south+1); c++)
            card[c].g = gone;
        recallMeld();
        locateCards();
        for (let c = p2c(south); c < p2c(south+1); c++)
            if (card[c].g == hand)
                moveCard(c, gone, now, hand, c, true, dealTime/10);
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
    for (let c = 0; c < cards; c++)
        moveCard(c, hand, now, gone, -c, false, dealTime/10);
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
    for (let c = 0; c < cards; c++)
        moveCard(c, hand, now, gone, -c, false, dealTime/10);
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
    ourMeld = meld(north, trump) + meld(south, trump);
    theirMeld = meld(west, trump) + meld(east, trump);

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
    for (let c = 0; c < cards; c++)
        if (card[c].g == hand)
            moveCard(c, gone, now, hand, c, true, dealTime/10);
    animate(meldFanned);
}

// Trump picked: regather hands, then trigger handsRegathered
function trumpPicked() {
    const now = performance.now();
    console.log(`\n${player$[bidder]} picks ${suit$[trump]}.`)
    for (let c = 0; c < cards; c++)
        moveCard(c, hand, now, gone, -c, false, dealTime/10);
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
        meldSpan[0].textContent = meld(south, spades);
        meldSpan[1].textContent = meld(south, hearts);
        meldSpan[2].textContent = meld(south, clubs);
        meldSpan[3].textContent = meld(south, diamonds);
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
    for (let c = 0; c < cards; c++)
        if (openHand || c2p(c)==south)
            moveCard(c, gone, now, hand, c, true, dealTime/10);
        else
            moveCard(c, gone, now, hand, -c, false, dealTime/10);
    bidder = nextPlayer(dealer);
    bid[west] = bid[north] = bid[east] = bid[south] = none;
    est[west] = est[north] = est[east] = est[south] = typical;
    animate(handsFanned);
}

// Deck dealt: gather hands, then trigger handsGathered
function deckDealt() {
    const now = performance.now();
    for (let c = 0; c < cards; c++)
        moveCard(c, heap, now, gone, -c, false, dealTime/20);
    animate(handsGathered);
}

// Resize event: adjust dynamic sizes, then trigger deck redraw
function resized () {
    const now = performance.now();
    setSizes();
    locateCards();
    for (let c = 0; c < cards; c++) {
        card[c].strt.t = now;
        card[c].fnsh.t = now;
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
    for (let c = 0; c < cards; c++)
        if (c2p(c)!=south && card[c].g==hand) {
            if (openHand) {
                card[c].f = true;
                card[c].z = c;
            } else {
                card[c].f = false;
                card[c].z = -c;
            }
            card[c].strt.t = now;
            card[c].fnsh.t = now;
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
    const deck = Array.from(new Array(cards), (v, k) => k % cardsPerPlayer);
    let sort = [];
    for (let v = 0; v < values; v++)
        faceImg[v].src = faceSrc[v];
    backImg.src = backSrc;
    onresize = resized;
    menuIcon.draggable = false;
    menuIcon.onclick = menuClicked;
    shuffleArray(deck);
    for (let p of [west, north, east, south]) {
        sort = sort.concat(deck.slice(p2c(p),p2c(p+1)).sort((a,b)=>b-a));
        minCards[p].fill(0);
        maxCards[p].fill(4);
    }
    for (let c = 0; c < cards; c++)
        card[c].v = sort[c];
    remaining.fill(4);
    trump = none;
    console.clear();
    console.log("Start");
    console.log("=====");
    let t = "";
    for (let c = 0; c < cards; c++) {
        const p = c2p(c);
        if (c == p2c(p))
            t = `${player$[p]}:`.padEnd(6);
        t += ` ${value$[card[c].v]}`;
        if (c == p2c(p+1)-1)
            console.log(t);
    }
    setSizes();
    locateCards(true);
    let t0 = performance.now();
    for (let z = 0; z < cards; z++) {
        const c = (z%players+dealer+1)%players*20 + Math.floor(z/4);
        moveCard(c, gone, t0, heap, z, false, dealTime/20, p2c(dealer), c);
        card[c].fnsh.x += (Math.random()-0.5)*cardw/2;
        card[c].fnsh.y += (Math.random()-0.5)*cardw/2;
        card[c].fnsh.r += (Math.random()-0.5)*Math.PI/4;
        t0 = t0 + (dealTime - dealTime / 20) / cards;
    }
    animate(deckDealt);
}

// Set function to be invoked after app is loaded and rendered
onload = loaded;