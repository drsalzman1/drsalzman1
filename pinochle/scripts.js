"use strict";

// Player icons
const cloudSrc  = "icons/cloud.svg";
const humanSrc  = "icons/human.svg";
const robotSrc  = "icons/robot.svg";

// Player values (or none)
const none      = -1;
const west      = 0;
const north     = 1;
const east      = 2;
const south     = 3;
const players   = 4;
const next      = [north, east,  south, west ];
const us        = [false, true,  false, true ];
const them      = [true,  false, true,  false];

// Suit values (or none)
const diamonds  = 0;
const clubs     = 5;
const hearts    = 10;
const spades    = 15;
const suits     = 4;
const suit$     = ["diamonds",,,,,"clubs",,,,,"hearts",,,,,"spades"];
const suitSrc   = ["suits/diamond.svg",,,,,"suits/club.svg",,,,,"suits/heart.svg",,,,,"suits/spade.svg"];

// Rank values (or none)
const jack      = 0;
const queen     = 1;
const king      = 2;
const ten       = 3;
const ace       = 4;
const ranks     = 5;
const rank$     = ["jack", "queen", "king", "ten", "ace"];
const rankSrc   = ["ranks/jack.svg", "ranks/queen.svg", "ranks/king.svg", "ranks/ten.svg", "suits/ace.svg"];

// Card values = rank + suit (or back or absent)
const values    = 20;
const back      = 20;
const absent    = 20;
const value$    = ["J♦","Q♦","K♦","T♦","A♦","J♣","Q♣","K♣","T♣","A♣","J♥","Q♥","K♥","T♥","A♥","J♠","Q♠","K♠","T♠","A♠","--"];
const deckCards = 80;
const handCards = deckCards / players;


// suit[v] = suit of card value v
const suit      = [
    diamonds, diamonds, diamonds, diamonds, diamonds,
    clubs, clubs, clubs, clubs, clubs, 
    hearts, hearts, hearts, hearts, hearts, 
    spades, spades, spades, spades, spades,
    none
];

// rank[v] = rank of card value v
const rank      = [
    jack, queen, king, ten, ace, 
    jack, queen, king, ten, ace, 
    jack, queen, king, ten, ace, 
    jack, queen, king, ten, ace,
    none
];

// high[v] = card value v is a point card
const high      = [
    false, false, true, true, true, 
    false, false, true, true, true, 
    false, false, true, true, true, 
    false, false, true, true, true
];

// Bidding constants
const pass      = 0;
const typical   = 14;

// Position class
class P {
    constructor() {
        this.x = 0;                                     // x at card center
        this.y = 0;                                     // y at card center
        this.r = 0;                                     // rotation (0=portrait, pi/2=landscape)
     }
}

// Animation class
class A {
    constructor() {
        this.x = 0;                                     // x at card center
        this.y = 0;                                     // y at card center
        this.r = 0;                                     // rotation (0=portrait, pi/2=landscape)
        this.t = 0;                                     // time to start or finish
     }
}

// Card groups
const gone = 0;                                         // gone (not yet dealt, hidden from view, or pulled)
const heap = 1;                                         // heap of dealt cards
const hand = 2;                                         // normal hand position
const bump = 3;                                         // bump hand position
const play = 4;                                         // play position

// Card class
class C {
    constructor() {
        this.c    = 0;                                  // card number
        this.p    = 0;                                  // player value
        this.u    = false;                              // player is us (north or south)
        this.v    = 0;                                  // card value
        this.s    = 0;                                  // card suit
        this.r    = 0;                                  // card rank
        this.t    = false;                              // card take is one
        this.g    = 0;                                  // card group
        this.m    = false;                              // card is in trump
        this.z    = 0;                                  // draw order
        this.f    = false;                              // display face if true
        this.k    = false;                              // card known to all players
        this.d    = false;                              // card is dimmed
        this.gone = new P;                              // gone position
        this.heap = new P;                              // heap position
        this.hand = new P;                              // hand position
        this.bump = new P;                              // bump position
        this.play = new P;                              // play position
        this.strt = new A;                              // start animation
        this.fnsh = new A;                              // finish animation
    }
}

// plyr[c] = player assigned card c
const plyr      = [
    west, west, west, west, west, west, west, west, west, west, west, west, west, west, west, west, west, west, west, west,
    north,north,north,north,north,north,north,north,north,north,north,north,north,north,north,north,north,north,north,north,
    east, east, east, east, east, east, east, east, east, east, east, east, east, east, east, east, east, east, east, east, 
    south,south,south,south,south,south,south,south,south,south,south,south,south,south,south,south,south,south,south,south,
];

// minC[p] = minimum card number assigned to player p
const minC      = [0, 20, 40, 60];

// maxC[p] = maximum card number assigned to player p
const maxC      = [19, 39, 59, 79];

// remaining[v] = remaining cards of value v to be played
const remaining = Array(values);

// maxCards[p][v] = most cards player p can hold of value v (revealed by meld and play)
const maxCards  = [Array(values), Array(values), Array(values), Array(values)];

// minCards[p][v] = least cards player p can hold of value v (revealed by meld and play)
const minCards  = [Array(values), Array(values), Array(values), Array(values)];

// barSrc[min][max] = bar image representing minCards[p1][v] min and capMaxCards(p1,v,p2) max
const barSrc    = [
    ["icons/0-0.svg", "icons/0-1.svg", "icons/0-2.svg", "icons/0-3.svg", "icons/0-4.svg"],
    ["",              "icons/1-1.svg", "icons/1-2.svg", "icons/1-3.svg", "icons/1-4.svg"],
    ["",              "",              "icons/2-2.svg", "icons/2-3.svg", "icons/2-4.svg"],
    ["",              "",              "",              "icons/3-3.svg", "icons/3-4.svg"],
    ["",              "",              "",              "",              "icons/4-4.svg"]
];

// Checkbox source images
const checked   = "icons/checked.svg";
const unchecked = "icons/unchecked.svg";

// Page elements
const body      = document.getElementById("body");
const canvas    = document.getElementById("canvas");
const context   = canvas.getContext("2d");
const loadPage  = document.getElementById("loadPage");
const joinBtn   = document.getElementById("joinBtn");
const startPage = document.getElementById("startPage");
const playerNam = document.querySelectorAll("#playersGrid input[type='text']");
const playerIco = document.querySelectorAll("#playersGrid input[type='image']");
const playerLst = document.querySelectorAll("#playersGrid ul");
const assistIco = document.querySelectorAll("#assistanceGrid input[type='image']");
const startBtn  = document.getElementById("startBtn");
const gamePage  = document.getElementById("gamePage");
const bidText   = document.getElementById("bidText");
const meldSpan  = document.querySelectorAll("#meldColumn span");
const infoAreas = document.getElementById("infoAreas");
const infoText  = document.querySelectorAll(".infoText");
const infoIcons = document.querySelectorAll(".infoIcons");
const infoIcon  = document.querySelectorAll(".infoIcons img");
const bidBtn    = document.querySelectorAll("#bidText input");
const trumpText = document.getElementById("trumpText");
const trumpBtn  = document.querySelectorAll("#trumpText input");
const playText  = document.getElementById("playText");
const playPara  = document.querySelectorAll("#playText p");
const playBtn   = document.getElementById("playBtn");
const tossBtn   = document.getElementById("tossBtn");
const handText  = document.getElementById("handText");
const handPara  = document.querySelectorAll("#handText p");
const handBtn   = document.getElementById("handBtn");
const menuIcon  = document.getElementById("menuIcon");
const trmpIcon  = document.getElementById("trmpIcon");
const nTrump    = document.getElementById("nTrump");
const menuText  = document.getElementById("menuText");
const spadesT   = document.getElementById("spadesT");
const heartsT   = document.getElementById("heartsT");
const clubsT    = document.getElementById("clubsT");
const diamondsT = document.getElementById("diamondsT");
const tutorText = document.getElementById("tutorText");
const tutorPage = document.querySelectorAll("#tutorText div");
const aboutText = document.getElementById("aboutText");
const vsText    = document.getElementById("vsText");
const iText     = document.getElementById("iText");
const iTrump    = document.getElementById("iTrump");
const iOut      = document.getElementById("iOut");
const iTake     = document.getElementById("iTake");
const wGrid     = document.getElementById("wGrid");
const nGrid     = document.getElementById("nGrid");
const eGrid     = document.getElementById("eGrid");
const count     = document.querySelectorAll(".count");
const cardImg   = document.querySelectorAll("#cardImages img");

// Communication channel with service worker
const channel = new BroadcastChannel("Pinochle");

// Animation constants
const dealTime  = 2000;                                 // milliseconds to deal all cards
const blink     = "blink 1s ease-in-out 5s infinite";   // slow blink animation

// ------------------------------------------Websocket server------------------------------------------------
//                                                                  
// Event               Actions
// =====               =======
// wsConnect(ws)       set ws.onclose and ws.onmessage
// wsMessage("ping")   send("pong") to ws
// wsMessage(data)     if s$ unregged, reg s$, send queued data to s$; send/queue data to regged/unreggrg dsts
// wsClose()           dereg ws
//
// data = JSON.stringify({src:s$, dst:[d$], msg:m$})
// s$   = source name (e.g. "South")
// [d$] = destination names (e.g. ["West", "North", "East"])
// m$   = JSON.stringify(m) (e.g. JSON.stringify({op:"join", joiner:p}))
// m    = {op:"invite", player:[p0$..p3$], robot[f0..f3], showTrump:f, showCount:f, showSummary:f, showDetail:f, showHand:f}
// m    = {op:"join", player:p}
// m    = {op:"deal", player:p, cardV[c0..c79]}
// m    = {op:"bid", bidder:p, bid[b0..b3]}
// m    = {op:"pick", trump:s}
// m    = {op:"toss"}
// m    = {op:"ready", player:p}
// m    = {op:"play", card:c}
// p$   = player name
// p    = player value (e.g. south)
// f    = flag value (e.g. false)
// c    = card number in deck (e.g. 0)
// b    = bid value (e.g. pass)
// s    = suit value (e.g. diamonds)
// t$   = text string
//
//  Creator: wsConnect, [wsMessage], wsClose
//  Joiner:  wsConnect, [wsMessage], wsClose
let websocket   = null;                                 // websocket object (or null)
let wsIntervlID = null;                                 // websocket interval timer identifier (or null)

// Game variables from this player's perspective
let solo        = true;                                 // creator is only human player
let left        = 0;                                    // number of players left of creator
let src         = "South";                              // source for all websocket messages
let dst         = [];                                   // destination for all websocket messages
let favorites   = ["East", "North", "South", "West" ];  // favorite player names (sorted)
let player$     = ["West", "North", "East",  "South"];  // player name
let robot       = [true,   true,    true,    false  ];  // player is a robot
let online      = [true,   true,    true,    true   ];  // player is online (robots are always online)
let ready       = [true,   true,    true,    true   ];  // player is ready to play
let showTrump   = true;                                 // show trump icon
let showCount   = true;                                 // show trump count
let showSummary = true;                                 // show card count summary
let showDetail  = false;                                // show card count detail
let showHand    = false;                                // show player hands
let dealer      = south;                                // the player who is dealing or last dealt
let card        = [                                     // card[c] = deck card c
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C
];
let bidder      = none;                                 // the player who is bidding or won the bid
let bid         = [none, none, none, none];             // bid[p] = player p's bid (or none or pass)
let est         = [typical, typical, typical, typical]; // est[p] = player p's estimated meld based on jump bids
let trump       = none;                                 // the bidder's trump suit
let ondone      = "";                                   // event to invoke after animation completes
let onready     = "";                                   // event to invoke after all players message ready
let player      = none;                                 // the player who is choosing then playing a card
let chosen      = none;                                 // the card number that was chosen
let leadCard    = none;                                 // the card number that was lead
let highCard    = none;                                 // the card number of the highest card so far
let ourBid      = none;                                 // our bid if we win the bid (or none)
let theirBid    = none;                                 // their bid if they win the bid (or none)
let ourMeld     = 0;                                    // total of north and south meld for this hand
let theirMeld   = 0;                                    // total of west and east meld for this hand
let weNeed      = 0;                                    // take north and south need to save
let theyNeed    = 0;                                    // take west and east need to save
let ourTake     = 0;                                    // total of north and south points so far in hand
let theirTake   = 0;                                    // total of west and east points so far in hand
let ourScore    = 0;                                    // total of north and south points so far in game
let theirScore  = 0;                                    // total of west and east points so far in game
let tossHand    = false;                                // true if bidder tosses in the hand
let mustToss    = false;                                // true if bidder lacks a marriage in trump
let tutorialPg  = none;                                 // tutorial page (or none)
let playZ       = -1000;                                // z-index for played card (auto-increments)

// Dynamic sizes
let vw0         = 0;                                    // previous view width
let vh0         = 0;                                    // previous view height
let vw          = 0;                                    // view width
let vh          = 0;                                    // view height
let cardw       = 0;                                    // card width
let cardh       = 0;                                    // card height
let iconw       = 0;                                    // icon width
let iconh       = 0;                                    // icon height
let pad         = 0;                                    // padding around display elements
let hpad        = 0;                                    // horizontal padding for east and west hands
let vpad        = 0;                                    // vertical padding for north and south hands
let hpitch      = 0;                                    // horizontal card pitch for north and south hands
let vpitch      = 0;                                    // vertical card pitch for east and west hands

// Log debugText on console (comment out when done debugging)
function log(debugText = "") {
    // console.log(debugText);
}

// Return value(s) of player x, array x, or NodeList x offset by "left" players
function pOff(x) {
    if (typeof x == "number")
        return (x + left) % players;
    else if (x instanceof Array)
        return Array.from(x, (v,i)=>x[pOff(i)]);
    else if (x instanceof NodeList)
        return Array.from(x, (v,i)=>x[pOff(i)].value);
}

// Return value(s) of card x, array x, or NodeList x offset by "left" players
function cOff(x) {
    if (typeof x == "number")
        return (x + left*handCards) % deckCards;
    else if (x instanceof Array)
        return Array.from(x, (v,i)=>x[cOff(i)]);
    else if (x instanceof NodeList)
        return Array.from(x, (v,i)=>x[cOff(i)].value);
}

// Notify other players of action object a (if multiplayer game)
function notify (a) {
    if (!solo)
        websocket.send(JSON.stringify({src:src, dst:dst, msg:JSON.stringify(a)}));
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
    for (let c = 0; c < deckCards; c++)
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
    for (let p of [west, north, east, south])                   // for each player,
        if ((us[p] && ourMeld<20) || (them[p] && theirMeld<20)) {   // if player's team can't keep their meld,
            if (p == bidder)                                            // if player won the bid,
                for (let r of [queen, king])                                // tag one trump marriage (if possible, to allow play)
                    tagCards(p, r+trump, Math.min(marriages(p, trump)), 1);
            for (let s of [diamonds, clubs, hearts, spades])            // show any aces around (house rule?)
                tagCards(p, ace+s, arounds(p, ace));
        } else {                                                    // if player's team may be able to keep their meld,
            for (let r of [jack, queen, king, ace])                     // tag arounds
                for (let s of [diamonds, clubs, hearts, spades])
                    tagCards(p, r+s, arounds(p, r));
            for (let r of [jack, queen, king, ten, ace])                // tag runs in trump
                tagCards(p, r+trump, runs(p, trump));
            tagCards(p, jack+diamonds, pinochles(p));                   // tag pinochles
            tagCards(p, queen+spades, pinochles(p));
            for (let r of [queen, king])                                // tag marriages
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

// Cap max cards for player p1 of value v given remaining[v], player p2's cards, minCards[p1][v], and maxCards[p1][v]
function capMaxCards(p1, v, p2) {
    let loose = remaining[v] - nValue(p2, v);
    for (let p = next[p2]; p != p2; p = next[p])
        loose -= minCards[p][v];
    return Math.min(maxCards[p1][v], minCards[p1][v] + loose);
}

// Update hint images based on minCards and capMaxCards
function updateHints() {
    if (showTrump && trump!=none) {
        trmpIcon.src = suitSrc[trump];
        trmpIcon.style.display = "block";
    } else
        trmpIcon.style.display = "none";
    if (showCount && trump!=none) {
        let q = 0;
        for (let r of [ace, ten, king, queen, jack])
            q += remaining[r+trump] - nValue(south,r+trump);
        nTrump.textContent = q;
    } else
        nTrump.textContent = "";
    if (showSummary && player!=none) {
        infoIcons[west].style.display = infoIcons[north].style.display = infoIcons[east].style.display = "inline";
        let i = 0;
        for (let p of [west, north, east])
            for (let s of [spades, hearts, clubs, diamonds])
                if (minCards[p][ace+s])
                    infoIcon[i++].style.opacity = "100%";
                else if (capMaxCards(p,ace+s,south)>0)
                    infoIcon[i++].style.opacity = "66%";
                else if (capMaxCards(p,ten+s,south)>0)
                    infoIcon[i++].style.opacity = "33%";
                else if (capMaxCards(p,king+s,south)>0)
                    infoIcon[i++].style.opacity = "33%";
                else if (capMaxCards(p,queen+s,south)>0)
                    infoIcon[i++].style.opacity = "33%";
                else if (capMaxCards(p,jack+s,south)>0)
                    infoIcon[i++].style.opacity = "33%";
                else
                    infoIcon[i++].style.opacity = "0%";
    } else
        infoIcons[west].style.display = infoIcons[north].style.display = infoIcons[east].style.display = "none";
    if (showDetail && player!=none) {
        let i = 0;
        for (let p of [west, north, east])
            for (let s of [spades, hearts, clubs, diamonds])
                for (let r of [ace, ten, king, queen, jack])
                    count[i++].src = barSrc[minCards[p][r+s]][capMaxCards(p,r+s,south)];
        wGrid.style.display = nGrid.style.display = eGrid.style.display = "grid";
    } else
        wGrid.style.display = nGrid.style.display = eGrid.style.display = "none";
}

// Get plausible card values cardV given other players' unknown cards
function getPlausible(cardV) {

    // Cap known cards based on minCards (in case a known card was chosen rather than an unknown card)
    for (let p of [west, north, east, west])
        for (let v = 0; v < values; v++) {
            let nMin = minCards[p][v];
            for (let c = minC[p]; c <= maxC[p]; c++)
                if (card[c].g==hand && card[c].v==v && card[c].k)
                    if (nMin > 0)
                        nMin--;
                    else
                        card[c].k = false;
        }

    // Make list of unknown cards in other players' hands
    const unknown = Array(deckCards).fill(0);
    let u = 0;
    for (let c = 0; c < deckCards; c++)
        if (card[c].g==hand && card[c].p!=player && !card[c].k)
            unknown[u++] = card[c].v;

    // Until compliant: shuffle list, fill in cardV, and test for compliance
    nextTry: do {
        shuffleArray(unknown, u);
        u = 0;
        for (let c = 0; c < deckCards; c++)
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
                if (nV > capMaxCards(p, v, player))
                    continue nextTry;
            }
    } while (false);
}

const trckMerit = 10;   // Merit(demerit) for winning(losing) the trick
const highMerit = 10;   // Merit(demerit) for each point card won(lost)
const rankMerit = 1;    // Merit(demerit) for each card  foe(ally) uses
const trmpMerit = 1;    // Merit(demerit) for each trump foe(ally) uses

// Return true if the suit of card value v is trump
function trmp(v) {
    return suit[v]==trump;
}

// Find player p's best legal move bestC[p] given card values v and played cards playC[west..south]
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
                const tc=trmp(vc), tl=trmp(vl), th=trmp(vh);
                if (!tl && th) {                                        // if lead suit isn't trump and high suit is trump, 
                    if (sc != sl) {                                         // if c doesn't follow the lead,
                        for (let c = minC[p]; c <= maxC[p]; c++)                // if p can follow the lead, c's no good
                            if (suit[v[c]] == sl)
                                continue nextC;
                        if (!tc || rc<=rh) {                                    // if c doesn't overtrump,
                            for (let c = minC[p]; c <= maxC[p]; c++)                // if p can overtrump, c's no good
                                if (trmp(v[c]) && v[c]>vh)
                                    continue nextC;
                            if (!tc)                                                // if c's not trump,
                                for (let c = minC[p]; c <= maxC[p]; c++)                // if p can trump, c's no good
                                    if (trmp(v[c]))
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
                                    if (trmp(v[c]))
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
                    merit += (+trmp(w) - trmp(n) + trmp(e) - trmp(s)) * trmpMerit;
                } else if (!us[p] && !us[plyr[h]]) {
                    // EW is last player and EW won
                    merit =  +trckMerit;
                    merit += (+high[w] + high[n] + high[e] + high[s]) * highMerit;
                    merit += (-rank[w] + rank[n] - rank[e] + rank[s]) * rankMerit;
                    merit += (-trmp(w) + trmp(n) - trmp(e) + trmp(s)) * trmpMerit;
                } else if (us[p] && !us[plyr[h]]) {
                    // NS is last player and NS lost
                    merit =  -trckMerit;
                    merit += (-high[w] - high[n] - high[e] - high[s]) * highMerit;
                    merit += (+rank[w] - rank[n] + rank[e] - rank[s]) * rankMerit;
                    merit += (+trmp(w) - trmp(n) + trmp(e) - trmp(s)) * trmpMerit;
                } else if (!us[p] && us[plyr[h]]) {
                    // EW is last player and EW lost
                    merit =  -trckMerit;
                    merit += (-high[w] - high[n] - high[e] - high[s]) * highMerit;
                    merit += (-rank[w] + rank[n] - rank[e] + rank[s]) * rankMerit;
                    merit += (-trmp(w) + trmp(n) - trmp(e) + trmp(s)) * trmpMerit;
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
    const cardV = Array(deckCards).fill(0);
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
        for (let c = 0; c < deckCards; c++)
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
    for (let i = 0; i < deckCards; i++)
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

// Locate east and west info boxes based on east and west hands
function locateInfo() {
    if (card[0].g == heap) {
        infoText[west].style.top  = infoText[east].style.top  = vh/2 - cardw*1.4 + "px";
        infoIcons[west].style.top = infoIcons[east].style.top = vh/2 + cardw*1.4 + "px";
    } else {
        infoText[west].style.top  = vh/2 - cardw*0.70 - nCards(west)*vpitch/2 + "px";
        infoText[east].style.top  = vh/2 - cardw*0.70 - nCards(east)*vpitch/2 + "px";
        infoIcons[west].style.top = vh/2 + cardw*0.42 + nCards(west)*vpitch/2 + "px";
        infoIcons[east].style.top = vh/2 + cardw*0.42 + nCards(east)*vpitch/2 + "px";
    }
}

// Locate all card positions (n = number of semi-exposed cards; v = visible card number)
function locateCards() {
    const rWest  = [+Math.PI/2, +Math.PI/2, -Math.PI/2, -Math.PI/2][dealer];
    const rNorth = [0,          0,          0,          0         ][dealer];
    const rEast  = [+Math.PI/2, -Math.PI/2, -Math.PI/2, +Math.PI/2][dealer];
    const rSouth = [+Math.PI,   0,          -Math.PI,   0         ][dealer];
    let n, v;
    for (let c = 0; c < deckCards; c++) {
        const p = card[c].p;
        if (c == minC[p]) {
            n = -1;
            for (let c = minC[p]; c <= maxC[p]; c++)
                n = card[c].g==hand||card[c].g==bump? n+1 : n;
            v = 0;
        }
        card[c].gone.x = [-cardh/2, vw/2, vw+cardh/2, vw/2][p];
        card[c].gone.y = [vh/2, -cardh/2, vh/2, vh+cardh/2][p];
        card[c].gone.r = [rWest, rNorth, rEast, rSouth][p];
        card[c].heap.x = [cardw+hpad, vw/2, vw-cardw-hpad, vw/2][p] + (Math.random()-0.5)*cardw/2;
        card[c].heap.y = [vh/2, cardw+vpad, vh/2, vh-cardw-vpad][p] + (Math.random()-0.5)*cardw/2;
        card[c].heap.r = [Math.PI/2, 0, -Math.PI/2, 0][dealer] + (Math.random()-0.5)*Math.PI/4;
        card[c].hand.x = [cardh/2+hpad, vw/2-hpitch*(v-n/2), vw-cardh/2-hpad, vw/2+hpitch*(v-n/2)][p];
        card[c].hand.y = [vh/2+vpitch*(v-n/2), cardh/2+vpad, vh/2-vpitch*(v-n/2), vh-cardh/2-vpad][p];
        card[c].hand.r = [rWest, rNorth, rEast, rSouth][p];
        card[c].bump.x = card[c].hand.x + [cardh*0.4, 0, -cardh*0.4, 0][p];
        card[c].bump.y = card[c].hand.y + [0, cardh*0.4, 0, -cardh*0.4][p];
        card[c].bump.r = [rWest, rNorth, rEast, rSouth][p];
        card[c].play.x = vw/2 + [-cardw*0.38, 0, +cardw*0.38, 0][p];
        card[c].play.y = vh/2 + [0, -cardw*0.38, 0, +cardw*0.38][p];
        card[c].play.r = [rWest, rNorth, rEast, rSouth][p];
        card[c].strt.x = [card[c].gone.x, card[c].heap.x, card[c].hand.x, card[c].bump.x, card[c].play.x][card[c].g];
        card[c].strt.y = [card[c].gone.y, card[c].heap.y, card[c].hand.y, card[c].bump.y, card[c].play.y][card[c].g];
        card[c].strt.r = [rWest, rNorth, rEast, rSouth][p];
        card[c].fnsh.x = [card[c].gone.x, card[c].heap.x, card[c].hand.x, card[c].bump.x, card[c].play.x][card[c].g];
        card[c].fnsh.y = [card[c].gone.y, card[c].heap.y, card[c].hand.y, card[c].bump.y, card[c].play.y][card[c].g];
        card[c].fnsh.r = [rWest, rNorth, rEast, rSouth][p];
        if (card[c].g==hand || card[c].g==bump)
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

// Initialize the global variables based on the size of body
function setSizes() {
    vw = Number.parseFloat(getComputedStyle(body).width);
    vh = Number.parseFloat(getComputedStyle(body).height);
    const em = Number.parseFloat(getComputedStyle(body).fontSize);
    cardw = 4 * em;
    cardh = 5.6 * em;
    iconw = 1.32 * em;
    iconh = 1.32 * em;
    pad   = 0.4 * em;
    if (vw <= vh) {
        hpad = pad;
        vpad = iconh + pad;
        hpitch = cardw/4;
        vpitch = Math.min(cardw/4, (vh - cardh*2 - iconw*4 - pad*3 - cardw) / 19);
    } else {
        hpad = iconw + pad*2;
        vpad = iconw + pad;
        hpitch = cardw/4;
        vpitch = Math.min(cardw/4, (vh - iconw*2 - pad*2 - cardw) / 19);
    }
    canvas.width  = vw;
    canvas.height = vh;
}

// Return card number of top south card (or undefined) at x,y coordinates 
function xy2c(x, y) {
    let topC;
    card.sort((a,b)=>a.z-b.z);
    for (let c = 0; c < deckCards; c++) {
        const l = card[c].hand.x - [cardh/2, cardw/2, cardh/2, cardw/2][card[c].p];
        const r = card[c].hand.x + [cardh/2, cardw/2, cardh/2, cardw/2][card[c].p];
        const t = card[c].hand.y - [cardw/2, cardh/2, cardw/2, cardh/2][card[c].p];
        const b = card[c].hand.y + [cardw/2, cardh/2, cardw/2, cardh/2][card[c].p];
        if (card[c].g==hand && x>=l && x<=r && y>=t && y<=b)
            topC = card[c].c;
        else if (card[c].g==bump && x>=l && x<=r && y>=t-cardh*0.4 && y<=b)
            topC = card[c].c;
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
    for (let c = 0; c < deckCards; c++) {
        const img = card[c].f? cardImg[card[c].v] : cardImg[back];
        context.filter = card[c].d? "brightness(0.7)" : "brightness(1.0)";
        if (now < card[c].fnsh.t)
            done = false;
        if (now <= card[c].strt.t) {
            context.translate(card[c].strt.x, card[c].strt.y);
            context.rotate(card[c].strt.r);
            context.drawImage(img, -cardw/2, -cardh/2, cardw, cardh);
            context.resetTransform();
        }
        if (now >= card[c].fnsh.t) {
            context.translate(card[c].fnsh.x, card[c].fnsh.y);
            context.rotate(card[c].fnsh.r);
            context.drawImage(img, -cardw/2, -cardh/2, cardw, cardh);
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
            context.drawImage(img, -cardw/2, -cardh/2, cardw, cardh);
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

// Hand button clicked: note south is ready, notify others, and await all ready
function handClicked() {
    log("--> handClicked");
    handBtn.disabled = true;
    ready[south] = true;
    notify({op:"ready", player:pOff(south)});
    if (left==0 && ready[west] && ready[north] && ready[east])
        setTimeout(onready);
}

// Hand ended: display stats, await all ready, then deal next hand or start new game
function handEnded() {
    log("--> handEnded");
    log(`bidder:${bidder}, us[bidder]:${us[bidder]}, tossHand:${tossHand}, ourMeld:${ourMeld}, theirMeld:${theirMeld}, ourTake:${ourTake}, theirTake:${theirTake}`)
    trmpIcon.style.display = "none";
    nTrump.textContent = "";
    infoAreas.style.display = "none";
    if (us[bidder] && tossHand) {
        ourScore = ourScore - ourBid;
        handPara[0].innerHTML = `You lost your bid (${ourBid}) because ` +
            `${bidder==south?"You":player$[bidder]} tossed due to ${mustToss?"no trump marriage":"insufficient meld"}.`;
    } else if (us[bidder] && (ourMeld<20 || ourTake<20 || ourMeld+ourTake<ourBid)) {
        ourScore = ourScore - ourBid;
        handPara[0].innerHTML = `You lost your bid (${ourBid}) because ` + 
            (ourMeld<20? `your meld (${ourMeld}) was less than 20.` :
            (ourTake<20? `your take (${ourTake}) was less than 20.` :
            `your meld (${ourMeld}) plus your take (${ourTake}) was less than your bid (${ourBid}).`));
    } else if (us[bidder]) {
        ourScore = ourScore + ourMeld + ourTake;
        handPara[0].innerHTML = `You won your meld (${ourMeld}) plus your take (${ourTake}) because ` +
            `you made your bid (${ourBid}).`;
    } else if (them[bidder] && tossHand) {
        theirScore = theirScore - theirBid;
        handPara[0].innerHTML = `They lost their bid (${theirBid}) because ` +
            `${player$[bidder]} tossed in the hand due to ${mustToss?"no trump marriage":"insufficient meld"}.`;
    } else if (them[bidder] && (theirMeld<20 || theirTake<20 || theirMeld+theirTake<theirBid)) {
        theirScore = theirScore - theirBid;
        handPara[0].innerHTML = `They lost their bid (${theirBid}) because ` + 
            (theirMeld<20? `their meld (${theirMeld}) was less than 20.` :
            (theirTake<20? `their take (${theirTake}) was less than 20.` :
            `their meld (${theirMeld}) plus their take (${theirTake}) was less than their bid (${theirBid}).`));
    } else if (them[bidder]) {
        theirScore = theirScore + theirMeld + theirTake;
        handPara[0].innerHTML = `They won their meld (${theirMeld}) plus their take (${theirTake}) because ` +
            `they made their bid (${theirBid}).`;
    }
    if (us[bidder] && tossHand && theirMeld<20) {
        theirScore = theirScore;
        handPara[1].innerHTML = `They didn't win their meld (${theirMeld}) because `+
            `it was less than 20.`;
    } else if (us[bidder] && tossHand && theirMeld>=20) {
        theirScore = theirScore + theirMeld;
        handPara[1].innerHTML = `They won their meld (${theirMeld}) because ` +
            `it was at least 20.`;
    } else if (us[bidder] && !tossHand && theirTake<20) {
        theirScore = theirScore;
        handPara[1].innerHTML = `They didn't win their meld (${theirMeld}) or take (${theirTake}) because ` +
            `their take was less than 20.`;
    } else if (us[bidder] && !tossHand && theirMeld<20 && theirTake>=20) {
        theirScore = theirScore + theirTake;
        handPara[1].innerHTML = `They didn't win their meld (${theirMeld}) because it was less than 20, but ` +
            `they won their take (${theirTake}) because it was at least 20.`;
    } else if (us[bidder] && !tossHand && theirMeld>=20 && theirTake>=20) {
        theirScore = theirScore + theirMeld + theirTake;
        handPara[1].innerHTML = `They won their meld (${theirMeld}) and their take (${theirTake}) because ` +
            `they were both at least 20.`;
    } else if (them[bidder] && tossHand && ourMeld<20) {
        ourScore = ourScore;
        handPara[1].innerHTML = `We didn't win our meld (${ourMeld}) because ` +
            `it was less than 20.`;
    } else if (them[bidder] && tossHand && ourMeld>=20) {
        ourScore = ourScore + ourMeld;
        handPara[1].innerHTML = `We won our meld (${ourMeld}) because ` +
            `it was at least 20.`;
    } else if (them[bidder] && !tossHand && ourTake<20) {
        ourScore = ourScore;
        handPara[1].innerHTML = `We didn't win our meld (${ourMeld}) or take (${ourTake}) because ` +
            `our take was less than 20.`;
    } else if (them[bidder] && !tossHand && ourMeld<20 && ourTake>=20) {
        ourScore = ourScore + ourTake;
        handPara[1].innerHTML = `We didn't win our meld (${ourMeld}) because it was less than 20, but ` +
            `we won our take (${ourTake}) because it was at least 20.`;
    } else if (them[bidder] && !tossHand && ourMeld>=20 && ourTake>=20) {
        ourScore = ourScore + ourMeld + ourTake;
        handPara[1].innerHTML = `We won our meld (${ourMeld}) and our take (${ourTake}) because ` +
            `they were both at least 20.`;
    }
    handPara[2].innerHTML = `Your score is now ${ourScore}.<br>Their score is now ${theirScore}.`;    
    dealer = next[dealer];
    shuffleCards();
    for (const p of [west, north, east, south])
        ready[p] = robot[p];
    if (theirTake==50 || (theirScore>=500 && ourScore<500) || (ourScore>=500 && theirScore>=500 && them[bidder]))
        handPara[3].innerHTML = `Boohoo! We lost!`;
    else if (ourTake==50 || (ourScore>=500 && theirScore<500) || (ourScore>=500 && theirScore>=500 && us[bidder]))
        handPara[3].innerHTML = `Woohoo! We win!`;
    else
        handPara[3].innerHTML = `${player$[dealer]} deals next.`;
    handBtn.disabled = false;
    handText.style.display = "block";
    for (const p of [west, north, east, south])
        ready[p] = robot[p];
    onready = ourTake<50 && theirTake<50 && ourScore<500 && theirScore<500? dealCards : loaded;
}

// Trick viewed: pull trick, then retrigger handsRefanned or trigger handEnded
function trickViewed() {
    log("--> trickViewed");
    const now = performance.now();
    for (let c = 0; c < deckCards; c++)
        if (card[c].g == play)
            moveCard(c, play, now, gone, 100, false, dealTime/10, c, minC[card[highCard].p]);
    if (nGroup(hand) > 0) {
        player = card[highCard].p;
        chosen = leadCard = highCard = none;
        animate(handsRefanned);
    } else {
        player = none;
        updateHints();
        if (card[highCard].u)
            ourTake += 2;
        else
            theirTake += 2;
        infoAreas.style.display = "none";
        animate(handEnded);
    }
}

// Trick played: pause a moment to view trick, then trigger trickViewed
function trickPlayed() {
    log("--> trickPlayed");
    const now = performance.now();
    for (let c = 0; c < deckCards; c++)
        if (card[c].g == play) {
            if (card[c].r==ace || card[c].r==ten || card[c].r==king)
                if (card[highCard].u)
                    ourTake += 1;
                else
                    theirTake += 1;
            moveCard(c, play, now, play, card[c].z, true, dealTime/4);
        }
    animate(trickViewed);
}

// Card played: close hand, then trigger trickPlayed or handsRefanned  
function cardPlayed() {
    log("--> cardPlayed");
    const now = performance.now();
    locateCards();
    locateInfo();
    moveCard(chosen, play, now, play, playZ++, true, 0);
    if (nGroup(play) == players)
        animate(trickPlayed);
    else {
        player = next[player];
        animate(handsRefanned);
    }
}

// Card chosen: update stats, play face, then trigger cardPlayed
function cardChosen() {
    log("--> cardChosen");
    const now = performance.now();
    let msg = "Best follow";

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
    // if chosen card doesn't follow the lead and isn't trump, player must be out of lead suit and trump
    if (card[chosen].s!=card[leadCard].s && !card[chosen].m) {
        msg = `Out of ${suit$[card[leadCard].s]} and out of trump.`;
        for (let r of [jack, queen, king, ten, ace])
            maxCards[player][r+card[leadCard].s] = maxCards[player][r+trump] = 0;
    }
    // Update stats based on chosen card
    remaining[card[chosen].v]--;
    minCards[player][card[chosen].v] = Math.max(minCards[player][card[chosen].v] - 1, 0);
    let loose = remaining[card[chosen].v]
    for (let p of [west, north, east, south])
        loose -= minCards[p][card[chosen].v];
    for (let p of [west, north, east, south])
        maxCards[p][card[chosen].v] = Math.min(maxCards[p][card[chosen].v], minCards[p][card[chosen].v] + loose);
    updateHints();

    // log this play
    log(`${player$[player]} chose ${value$[card[chosen].v]}, msg:${msg}`);

    // animate card play
    infoText[south].style.animation = "none";
    moveCard(chosen, card[chosen].g, now, play, card[chosen].z, true, dealTime/10);
    animate(cardPlayed);
}

// Mouse moved: if off bump card, unbump cards; if moved to hand legal card, bump it
function mouseMoved(e) {
    //log("--> mouseMoved");
    const now = performance.now();
    const c = xy2c(e.clientX, e.clientY);
    if (c == undefined || card[c].g != bump)
        for (let c2 = 0; c2 < deckCards; c2++)
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
        log(player$[card[c].p]);
        for (let c2 = 0; c2 < deckCards; c2++) {
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
            body.onmousemove = "";
            body.onmousedown = "";
            body.ontouchstart = "";
            body.ontouchmove = "";
            notify({op:"play", card:cOff(chosen)});
            setTimeout(cardChosen);
        }
    }
}

// Touch started: if legal bump card, choose it; if isn't bump card, unbump cards; if hand legal, bump it 
function touchStarted(e) {
    log("--> touchStarted");
    body.onmousedown = "";
    body.onmousemove = "";
    const now = performance.now();
    const c = xy2c(e.touches[0].clientX, e.touches[0].clientY);
    if (c!=undefined && card[c].g==bump && card[c].p==player && legal(c, leadCard, highCard)) {
        chosen = c; 
        body.ontouchstart = "";
        body.ontouchmove = "";
        notify({op:"play", card:cOff(chosen)});
        setTimeout(cardChosen);
        return;
    }
    if (c==undefined || card[c].g!=bump) {
        for (let c2 = 0; c2 < deckCards; c2++) {
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
        for (let c2 = 0; c2 < deckCards; c2++) {
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

// Hands re-fanned: wait for south or robot to choose a card
function handsRefanned() {
    log("--> handsRefanned");
    updateHints();
    if (player == south) {
        body.onmousemove = mouseMoved;
        body.onmousedown = mousePressed;
        body.ontouchstart = touchStarted;
        body.ontouchmove = touchMoved;
        infoText[south].style.animation = blink;
    } else if (left==0 && robot[player]) {
        chosen = autoSelect();
        notify({op:"play", card:cOff(chosen)});
        setTimeout (cardChosen, 0);
    }
}

// Meld gathered: re-fan hands, then trigger handsRefanned
function meldGathered() {
    log("--> meldGathered");
    const now = performance.now();
    for (let c = 0; c < deckCards; c++)
        card[c].g = hand;
    locateCards();
    locateInfo();
    for (let c = 0; c < deckCards; c++)
        if (showHand || card[c].p==south)
            moveCard(c, gone, now, hand, c, true, dealTime/10);
        else
            moveCard(c, gone, now, hand, -c, false, dealTime/10);
    player = bidder;
    chosen = leadCard = highCard = none;
    animate(handsRefanned);
}

// Bidding is complete: gather meld, then trigger handEnded or meldGathered
function biddingComplete() {
    log("--> biddingComplete");
    const now = performance.now();
    playText.style.display = "none";
    for (let c = 0; c < deckCards; c++) {
        card[c].d = false;
        moveCard(c, hand, now, gone, -c, false, dealTime/10);
    }
    if (tossHand)
        animate(handEnded);
    else
        animate(meldGathered);
}

// Play button clicked: notify others then await all ready
function playClicked() {
    log(`--> playBtn clicked`);
    notify({op:"ready", player:pOff(south)});
    playBtn.disabled = true;
    tossBtn.disabled = true;
    ready[south] = true;
    if (ready[west] && ready[north] && ready[east] && ready[south])
        setTimeout(onready);
}

// Toss button clicked: notify others then await all ready
function tossClicked() {
    log(`--> tossBtn clicked`);
    tossHand = true;
    notify({op:"toss"});
    playBtn.disabled = true;
    tossBtn.disabled = true;
    ready[south] = true;
    if (ready[west] && ready[north] && ready[east] && ready[south])
        setTimeout(onready);
}

// Meld fanned: display information then await all ready
function meldFanned() {
    log("--> meldFanned");
    playPara[0].innerHTML = `${bidder==south?"You":player$[bidder]} picked ${suit$[trump]}.`;
    playPara[1].innerHTML = `Your meld is ${ourMeld<20?"<20":ourMeld}.<br>`;
    playPara[1].innerHTML += `Their meld is ${theirMeld<20?"<20":theirMeld}.`;
    if (mustToss)
        playPara[2].innerHTML = `${bidder==south?"You":player$[bidder]} must toss due to no trump marriage.`;
    else
        playPara[2].innerHTML = `You need ${weNeed} points.<br>They need ${theyNeed} points.`;
    playBtn.disabled = bidder==south? mustToss : false;
    tossBtn.style.display = bidder==south? "inline" : "none";
    for (const p of [west, north, east, south])
        ready[p] = robot[p];
    playText.style.display = "flex";
    onready = biddingComplete;
}

// Hands regathered: fan out meld, then trigger meldFanned
function handsRegathered() {
    log("--> handsRegathered");
    const now = performance.now();

    // move south and known (meld) cards into hands
    for (let c = 0; c < deckCards; c++) {                       // for all cards,
        card[c].d = card[c].p==south && !card[c].k;                 // dim southern, known cards
        card[c].g = card[c].p==south || card[c].k? hand : gone;     // put southern and known cards in their hands
    }
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
    updateHints();

    // animate movement of meld cards to hand
    locateCards();
    locateInfo();
    for (let c = 0; c < deckCards; c++)
        if (card[c].g==hand || card[c].g==bump)
            moveCard(c, gone, now, card[c].g, c, true, dealTime/10);
    animate(meldFanned);
}

// Trump picked: regather hands, then trigger handsRegathered
function trumpPicked() {
    log("--> trumpPicked");
    log(`${player$[bidder]} picks ${suit$[trump]}`);
    const now = performance.now();
    infoText[bidder].style.animation = "none";
    ourBid     = Math.max(bid[north], bid[south]);
    theirBid   = Math.max(bid[west],  bid[east]);
    ourMeld    = meld(north, trump) + meld(south, trump);
    theirMeld  = meld(west, trump)  + meld(east, trump);
    weNeed     = them[bidder]? 20 : (ourMeld<20?   bid[bidder] : Math.max(20,bid[bidder]-ourMeld));
    theyNeed   = us[bidder]?   20 : (theirMeld<20? bid[bidder] : Math.max(20,bid[bidder]-theirMeld));
    mustToss   = marriages(bidder, trump) == 0;
    tossHand   = mustToss || (robot[bidder] && (us[bidder]&&weNeed>30 || them[bidder]&&theyNeed>30));
    tagMeld();
    for (let c = 0; c < deckCards; c++) {
        card[c].m = card[c].s==trump;
        moveCard(c, hand, now, gone, -c, false, dealTime/10);
    }
    animate(handsRegathered);
}

// Suit s clicked: set trump, then trigger trumpPicked
function suitClicked(s) {
    log(`--> ${suit$[s]}Clicked`);
    trump = s;                                                  // note suit picked
    trumpText.style.display = "none";
    notify({op:"pick", trump:trump});                           // notify other players
    setTimeout(trumpPicked);
}

// Bid won: await suitClicked (south), autoPick (robot) or picked message (remote human)
function bidDone() {
    log("--> bidDone");
    for (let p of [west, north, east, south])                   // reset infoText
        infoText[p].textContent = player$[p];
    for (bidder of [west, north, east, south])                  // find winning bidder
        if (bid[bidder] > pass)
            break;
    if (bidder == south) {                                      // if I won the bid,
        trumpBtn[0].disabled = marriages(south, spades) == 0;       // await my suit pick
        trumpBtn[0].value = `Spades (${meld(south, spades)})`;
        trumpBtn[1].disabled = marriages(south, hearts) == 0;
        trumpBtn[1].value = `Hearts (${meld(south, hearts)})`;
        trumpBtn[2].disabled = marriages(south, clubs) == 0;
        trumpBtn[2].value = `Clubs (${meld(south, clubs)})`;
        trumpBtn[3].disabled = marriages(south, diamonds) == 0;
        trumpBtn[3].value = `Diamonds (${meld(south, diamonds)})`;
        if (noMarriages(bidder))
            trumpBtn[0].disabled = trumpBtn[1].disabled = trumpBtn[2].disabled = trumpBtn[3].disabled = false;
        trumpText.style.display = "flex";
        return;
    }
    if (left==0 && robot[bidder]) {                             // if my robot won the bid,
        trump = autoPick();                                         // the robot picks trump
        notify({op:"pick", trump:trump});                           // notify other players
        setTimeout(trumpPicked);                                    // advance to trump picked
        return;
    }
    infoText[bidder].style.animation = blink;                   // await pick message
}

// Bid button clicked: handle button n and retrigger handsFanned or trigger bidDone
function bidClicked(n) {
    log("--> bidClicked");
    const value = bidBtn[n].value;
    const highBid = Math.max(...bid);
    infoText[south].style.animation = "none";
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
    if (value == "Pass") {
        bid[south] = pass;
        infoText[south].textContent = "Pass";
    } else {
        if (bid[south]==none && Number(value)>51 && Number(value)<60)
            est[south] = (Number(value) - Math.max(50, ...bid)) * 10;
        bid[south] = Number(value);
        infoText[south].textContent = value;
    }
    notify({op:"bid", bidder:pOff(bidder), bid:pOff(bid)})  // notify others of my bid
    bidder = next[bidder];                                      // advance to next bidder
    bidText.style.display = "none";
    infoText[bidder].textContent = bid[bidder]==pass? "Pass" : player$[bidder];
    setTimeout(handsFanned, dealTime / 4);
}

// Hands fanned: await bidClicked, autoBid or data message then retrigger handsFanned or trigger bidDone
function handsFanned() {
    log("--> handsFanned");
    while (bid[bidder] == pass)                                 // skip passes
        bidder = next[bidder];
    if (nPass()==3) {                                           // if this is the last bid,
        if (bid[bidder] == none) {                                  // if this is the bidder's first bid,
            logBid(50, "Dropped");                                      // they must bid 50
            bid[bidder] = 50;
        }
        notify({op:"bid", bidder:pOff(bidder), bid:pOff(bid)}); // notify others of their bid
        setTimeout(bidDone, dealTime / 4);                      // advance to bidding done
        return;
    }
    if (bidder == south) {                                      // if bidder is south,
        meldSpan[0].textContent = meld(south, spades);              // await bidClicked
        meldSpan[1].textContent = meld(south, hearts);
        meldSpan[2].textContent = meld(south, clubs);
        meldSpan[3].textContent = meld(south, diamonds);
        bidBtn[0].value = "Pass";
        bidBtn[1].value = nextBid();
        bidBtn[2].value = ">";
        bidText.style.display = "flex";
        infoText[south].textContent = player$[south];
        infoText[south].style.animation = blink;
        return;
    }
    if (left==0 && robot[bidder]) {                             // if my robot is the bidder,
        bid[bidder] = autoBid();                                    // get robot's bid
        infoText[bidder].textContent = bid[bidder]==pass? "Pass" : bid[bidder];
        notify({op:"bid", bidder:pOff(bidder), bid:pOff(bid)}); // notify others of robot's bid
        bidder = next[bidder];                                      // advance to next bidder
        infoText[bidder].textContent = bid[bidder]==pass? "Pass" : player$[bidder];
        setTimeout(handsFanned, dealTime / 4);                      // go again
        return;
    }
    infoText[bidder].textContent = player$[bidder];             // await bid message
    infoText[bidder].style.animation = blink;
}

// Hands gathered: fan hands, then trigger handsFanned
function handsGathered() {
    log("--> handsGathered");
    const now = performance.now();
    for (let c = 0; c < deckCards; c++)
        card[c].g = hand;
    locateCards();
    locateInfo();
    for (let c = 0; c < deckCards; c++)
        if (showHand || card[c].p==south)
            moveCard(c, gone, now, hand, c, true, dealTime/10);
        else
            moveCard(c, gone, now, hand, -c, false, dealTime/10);
    bidder = next[dealer];
    tossHand = false;
    bid[west] = bid[north] = bid[east] = bid[south] = none;
    est[west] = est[north] = est[east] = est[south] = typical;
    ourTake  = theirTake = 0;
    infoText[west].textContent = infoText[north].textContent = infoText[east].textContent = infoText[south].textContent = "";
    logHands();
    animate(handsFanned);
}

// Deck dealt: gather hands, then trigger handsGathered
function deckDealt() {
    log("--> deckDealt");
    const now = performance.now();
    for (let c = 0; c < deckCards; c++)
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
        locateInfo();
        for (let c = 0; c < deckCards; c++) {
            card[c].strt.t = now;
            card[c].fnsh.t = now;
        }
        requestAnimationFrame(frameEvent);
    }
}

// Deal cards: notify others, initialize variables, then notify others and deal cards
function dealCards() {
    const cardV = Array.from(card, (c)=>c.v);
    startPage.style.display = "none";
    handText.style.display = "none";
    gamePage.style.display = "block";
    infoAreas.style.display = "block";
    for (let p of [west, north, east, south]) {
        minCards[p].fill(0);
        maxCards[p].fill(4);
        infoText[p].textContent = player$[p];
    }
    remaining.fill(4);
    trump = none;
    player = none;
    locateCards();
    let t0 = performance.now();
    let p = next[dealer];
    for (let z = 0; z < deckCards; z++) {
        const c = minC[p] + Math.floor(z/players);
        moveCard(c, gone, t0, heap, z, false, dealTime/20, minC[dealer], c);
        t0 = t0 + (dealTime - dealTime / 20) / deckCards;
        p = next[p];
    }
    playZ = -1000;
    locateInfo();
    updateHints();
    if (left == 0)
        notify({op:"deal", dealer:dealer, cardV:cardV});
    animate(deckDealt);
}

// Shuffle cards returning sorted hands in card[]
function shuffleCards() {
    const deck = Array(80).fill(jack+diamonds);
    for (let c = 0; c < deckCards; c++)
        deck[c] = c % handCards;
    shuffleArray(deck, deckCards);
    let c = 0;
    while (c < deckCards) {
        const hand = deck.slice(c, c+handCards).sort((a,b)=>b-a);
        for (let i = 0; i < handCards; i++) {
            card[c].c = c; 
            card[c].p = plyr[c];
            card[c].u = us[card[c].p];
            card[c].v = hand[i];
            card[c].s = suit[hand[i]];
            card[c].r = rank[hand[i]];
            card[c].t = high[hand[i]];
            card[c].g = gone;
            card[c].m = false;
            card[c].z = 0;
            card[c].f = false;
            card[c].k = false;
            card[c].d = false;
            c++;
        }
    }
}

// Menu icon clicked: display the menu
function menuIconClicked() {
    log("--> menuIconClicked");
    menuText.style.display = "block";
}

// Menu close icon clicked: close the menu
function menuCloseClicked() {
    log("--> menuCloseClicked");
    menuText.style.display = "none";
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

// Trmp icon clicked: display the info
function trmpIconClicked() {
    log("--> trmpIconClicked");
    iTrump.textContent = `Trump is ${suit$[trump]}.`;
    let t = "";
    for (let s of [spades, hearts, clubs, diamonds]) {
        let q = 0;
        for (let r of [ace, ten, king, queen, jack])
            q += remaining[r+s] - nValue(south,r+s);
        t += `${q} ${suit$[s]}`;
        if (s==spades || s==hearts || s==clubs)
            t += ", ";
        else
            t += " are in other hands.";
    }
    iOut.textContent = t;
    iTake.textContent = `Our take is ${ourTake} of ${weNeed}. Their take is ${theirTake} of ${theyNeed}.`;
    iText.style.display = "flex";
}

// iClose icon clicked: close the info
function iCloseClicked() {
    log("--> iCloseClicked");
    iText.style.display = "none";
}

// Create button clicked: close load page, apply game settings and open start page
function createClicked() {
    log(`--> create clicked`);
    for (let p of [west, north, east, south]) {
        playerNam[p].value = player$[p];
        playerNam[p].disabled = false;
        playerIco[p].src = robot[p]? robotSrc : (online[p]? humanSrc : cloudSrc);
        playerIco[p].disabled = p==south || !websocket;
    }
    for (let i = 0; i < assistIco.length; i++) {
        assistIco[i].src = [showTrump, showCount, showSummary, showDetail, showHand][i]? checked : unchecked;
        assistIco[i].disabled = false;
    }
    startBtn.value = "Create";
    loadPage.style.display = "none";
    startPage.style.display = "flex";
}

// Join button clicked: close load page, apply game settings and open start page
function joinClicked() {
    log(`--> join clicked`);
    robot[west] = robot[north] = robot[east] = false;
    online[west] = online[north] = online[east] = false;
    playerNam[west].value = playerNam[north].value = playerNam[east].value = "";
    playerNam[west].disabled = playerNam[north].disabled = playerNam[east].disabled = true;
    playerIco[west].src = playerIco[north].src = playerIco[east].src = cloudSrc;
    playerIco[west].disabled = playerIco[north].disabled = playerIco[east].disabled = true;
    playerNam[south].value = player$[south];
    playerNam[south].disabled = false;
    playerIco[south].src = humanSrc;
    playerIco[south].disabled = true;
    assistIco[0].src = assistIco[1].src = assistIco[2].src = assistIco[3].src = assistIco[4].src = unchecked;
    assistIco[0].disabled = assistIco[1].disabled = assistIco[2].disabled = assistIco[3].disabled = assistIco[4].disabled = true;
    loadPage.style.display = "none";
    startBtn.value = "Check";
    startPage.style.display = "flex";
}

// Start close icon clicked
function startCloseClicked() {
    log("--> start close clicked");
    startPage.style.display = "none";
    loadPage.style.display = "flex";
}

let selectedItem = none;

// Start name for player p keyed
function nKeyed(event, p) {
    log(`--> start name ${p} keyed '${event.key}'`);
    const listItems = playerLst[p].querySelectorAll('li');
    switch (event.key) {
        case "ArrowDown":
            event.preventDefault();
            selectedItem = selectedItem+1<listItems.length? selectedItem+1 : selectedItem;
            listItems.forEach(item => item.classList.remove('selected'));
            if (selectedItem != none)
                listItems[selectedItem].classList.add('selected');
            break;
        case "ArrowUp":
            event.preventDefault();
            selectedItem = selectedItem>0? selectedItem-1 : selectedItem;
            listItems.forEach(item => item.classList.remove('selected'));
            if (selectedItem != none)
                listItems[selectedItem].classList.add('selected');
            break;
        case "Enter":
            event.preventDefault();
            if (selectedItem !== none) {
                player$[p] = playerNam[p].value = listItems[selectedItem].textContent;
                playerLst[p].style.display = 'none';
            }
            break;
        case "Escape":
            event.preventDefault();
            playerLst[p].style.display = "none";
            break;
    }
}

// Start name for player p focused
function nFocused(p) {
    log(`--> start name ${p} focused`);
    for (let p of [west, north, east, south])
        playerLst[p].style.display = "none";
    playerLst[p].innerHTML = "";
    for (const name of favorites) {
        const li = document.createElement("li");
        li.innerText = name;
        playerLst[p].appendChild(li);
    }
    playerLst[p].style.display = favorites.length==0? "none" : "block";
    selectedItem = none;
}

// Start name for player p blurred
function nBlurred(p) {
    player$[p] = playerNam[p].value = playerNam[p].value=""? player$[p] : playerNam[p].value;
    setTimeout(() => {
        log(`--> start name ${p} blurred`);
        playerLst[p].style.display = "none";
    }, 200);
}

// Start list for player p clicked
function lClicked(event, p) {
    log(`--> start list ${p} clicked ${event.target.textContent}`);
    playerNam[p].value = event.target.textContent;
    for (let p of [west, north, east, south])
        playerLst[p].style.display = "none";
}

// Start list for player p contexted (right click or long press)
function lContexted(event, p) {
    log(`--> start list ${p} contexted ${event.target.textContent}`);
    event.preventDefault();
    if (confirm(`Delete ${event.target.textContent} from this list?`)) {
        favorites.splice(favorites.indexOf(event.target.textContent), 1);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        playerNam[p].value = favorites[0] ?? ""; 
    }
}

// Start icon for player p clicked
function iClicked(p) {
    log(`--> start icon ${p} clicked`);
    for (let p of [west, north, east, south])
        playerLst[p].style.display = "none";
    robot[p] = !robot[p];
    online[p] = robot[p];
    playerIco[p].src = robot[p]? robotSrc : cloudSrc;
}

// Start box b clicked (b=0,1,2,3,4 for ts,tc,ccs,ccd,ohBox)
function bClicked(b) {
    log(`--> start box ${b} clicked`);
    for (let p of [west, north, east, south])
        playerLst[p].style.display = "none";
    switch (b) {
        case 0:
            showTrump = !showTrump;
            assistIco[b].src = showTrump? checked : unchecked;
            break;
        case 1:
            showCount = !showCount;
            assistIco[b].src = showCount? checked : unchecked;
            break;
        case 2:
            showSummary = !showSummary;
            assistIco[b].src = showSummary? checked : unchecked;
            break;
        case 3:
            showDetail = !showDetail;
            assistIco[b].src = showDetail? checked : unchecked;
            break;
        case 4:
            showHand = !showHand;
            assistIco[b].src = showHand? checked : unchecked;
            break;
    }
}

// Update game storage
function store() {
    sessionStorage.setItem("left", JSON.stringify(left));
    for (const p of [west, north, east, south]) {               // update favorites
        if (favorites.includes(playerNam[p].value))
            continue;
        favorites.push(playerNam[p].value);
        favorites.sort();
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    localStorage.setItem("settings", JSON.stringify({           // save game settings
        player: pOff(playerNam),
        robot: pOff(robot),
        showTrump: showTrump,
        showCount: showCount,
        showSummary: showSummary,
        showDetail: showDetail,
        showHand: showHand,
    }));
}

// Start button clicked
function startBtnClicked() {
    log(`--> start ${startBtn.value} button clicked`);

    switch (startBtn.value) {
    case "Create":                                              // If attempting to create,
        for (const p of [west, north, east, south])                 // copy player names from start page
            player$[p] = playerNam[p].value
        left = 0;                                                   // I'm this game's creator
        solo = robot[west] && robot[north] && robot[east];          // solo game if other players are all robots
        store();                                                    // save game settings
        shuffleCards();                                             // shuffle cards
        if (solo)                                                   // If solo game, deal the cards
            setTimeout(dealCards);
        else {                                                      // Otherwise, 
            src = player$[south];                                       // initialize the source for my messages
            dst = [];                                                   // initialize the destination(s) for my messages
            for (const p of [west, north, east])
                if (!robot[p])
                    dst.push(player$[p]);
            notify({                                                    // invite others to join
                op: "invite",
                player: pOff(player$),
                robot: pOff(robot),
                showTrump: showTrump,
                showCount: showCount,
                showSummary: showSummary,
                showDetail: showDetail,
                showHand: showHand,
            });
            startBtn.disabled = true;                                   // wait for others to join
        }
        break;

    case "Check":                                               // If checking for an invitation,
        src = player$[south] = playerNam[south].value;              // copy player name from start page
        websocket.send(JSON.stringify({src:src, dst:[], msg:""}))   // register player with server
        startBtn.disabled = true;                                   // wait for invitation
        break;

    case "Join":                                                // If joining a game,
        src = player$[south];                                       // initialize the source of my messages
        dst = [];                                                   // initialize the destination(s) for my messages
        for (const p of [west, north, east])
            if (!robot[p])
                dst.push(player$[p]);
        store();
        solo = false;
        notify({op:"join", player:pOff(south)});                  // notify others that I've joined the game
        startBtn.disabled = true;                                   // wait for others to join and card to be dealt
    }
}

// Handle websocket connect calls and websocket reconnect timer
function wsConnect() {
    if (!navigator.onLine) {                                    // if client is offline,
        log(`websocket is offline`);                                // try again in a second
        return;
    }
    let url = "";
    if (document.location.hostname == "localhost")
        url = `ws://localhost:3000`;
    else
        url = `wss://${document.location.hostname}/ws`;
    websocket = new WebSocket(url);                             // try to create a new websocket
    websocket.onopen = wsOpen;                                  // prepare for callbacks
    websocket.onerror = wsError;
    websocket.onmessage = wsMessage;
    websocket.onclose = wsClose;
    clearInterval(wsIntervlID);                                // clear websocket timer, if any
    src = undefined;
    wsIntervlID = setInterval(wsCheck, 1000);                  // check websocket status every second
    log(`websocket connecting...`);
}

// Handle the websocket's open event
function wsOpen(event) {
    joinBtn.disabled = false;
    log(`websocket opened`);
}

// Handle the websocket's error event
function wsError(event) {
    log(`websocket erred`);
}

// Handle the websocket's message event
function wsMessage(messageEvent) {
    if (messageEvent.data == "pong")                            // if "pong",
        return;                                                     // ignore
    log(messageEvent.data);
    const msg = JSON.parse(JSON.parse(messageEvent.data).msg);  // parse the message event data
    switch (msg.op) {
    case "invite":                                              // if msg {op:"invite", player:[p$], robot:[f], showX:fX},
        const i = msg.player.indexOf(src);                          // player[i] = my name
        left = i + 1;                                               // I am i+1 players left of creator
        player$ = pOff(msg.player);                               // copy players and flags
        robot = pOff(msg.robot);
        showTrump = msg.showTrump;
        showCount = msg.showCount;
        showSummary = msg.showSummary;
        showDetail = msg.showDetail;
        showHand = msg.showHand;
        for (let p of [west, north, east]) {                        // initialize start page
            playerNam[p].value = player$[p];
            playerIco[p].src = robot[p]? robotSrc : (online[p]? humanSrc : cloudSrc);
        }
        assistIco[0].src = showTrump? checked : unchecked; 
        assistIco[1].src = showCount? checked : unchecked; 
        assistIco[2].src = showSummary? checked : unchecked; 
        assistIco[3].src = showDetail? checked : unchecked; 
        assistIco[4].src = showHand? checked : unchecked;
        startBtn.value = "Join";                                    // wait for this player to join this game
        startBtn.disabled = false;
        break;
    case "join":                                                // if msg {op:"join", player:p},
        online[pOff(msg.player)] = true;                          // mark player p online
        playerIco[pOff(msg.player)].src = humanSrc;
        log(`${player$[pOff(msg.player)]} is online`);
        if (left==0&&online[west]&&online[north]&&online[east])     // if my game and all others are online,
            setTimeout(dealCards);                                      // deal the cards
        break;
    case "deal":                                                // if msg {op:"deal", dealer:p, cardV[v]}
        dealer = pOff(msg.dealer);
        for (let c = 0; c < deckCards; c++) {
            card[c].c = c;
            card[c].p = plyr[c];
            card[c].u = us[card[c].p];
            card[c].v = msg.cardV[cOff(c)];
            card[c].s = suit[card[c].v];
            card[c].r = rank[card[c].v];
            card[c].t = high[card[c].v];
            card[c].g = gone;
            card[c].m = false;
            card[c].z = 0;
            card[c].f = false;
            card[c].k = false;
            card[c].d = false;
        }
        setTimeout(dealCards);
        break;
    case "bid":                                                 // if msg {op:"bid", bidder:p, bid[b]},
        bidder = pOff(msg.bidder);
        infoText[bidder].style.animation = "none";
        bid = pOff(msg.bid);
        for (const p of [west, north, east, south])
            infoText[p].textContent = bid[p]==none? "" : (bid[p]==pass? "Pass" : bid[p]);
        bidder = next[bidder];
        if (nPass()==3) {
            if (bid[bidder] == none) {
                logBid(50, "Dropped");
                bid[bidder] = 50;
            }
            setTimeout(bidDone, dealTime / 4);
        } else
            setTimeout(handsFanned, dealTime / 4);
        break;
    case "pick":                                                // if msg {op:"pick", trump:s}
        trump = msg.trump;
        setTimeout(trumpPicked);
        break;
    case "toss":                                                // if msg {op:"toss"}
        tossHand = true;
        ready[bidder] = true;
        if (ready[west] && ready[north] && ready[east] && ready[south])
            setTimeout(onready);
        break;
    case "ready":                                               // if msg {op:"ready", player:p}
        ready[pOff(msg.player)] = true;
        if (ready[west] && ready[north] && ready[east] && ready[south])
            setTimeout(onready);
        break;
    case "play":                                                // if msg {op:"play", card:c}
        chosen = cOff(msg.card);
        setTimeout(cardChosen);
        break;
    default:                                                    // if unrecognized, log message
        log(`unrecognized`);
    }
}

// Handle the websocket's close event
function wsClose(closeEvent) {
    joinBtn.disabled = true;
    log(`websocket closed`);
    clearInterval(wsIntervlID);                                 // stop websocket timer, if any
    wsIntervlID = setInterval(wsConnect, 1000);                 // start websocket reconnect timer
}

// Handle websocket disconnect calls
function wsDisconnect() {
    clearInterval(wsIntervlID);                                 // clear websocket timer, if any
    websocket.close();
    log(`websocket disconnected`);
}

// Handle websocket check timer
function wsCheck() {
    switch (websocket.readyState) {
        case WebSocket.CONNECTING:                              // if websocket connecting, log state
            log(`websocket connecting`);
            break;
        case WebSocket.OPEN:                                    // if websocket open, ping server
            websocket.send("ping");
            break;
        case WebSocket.CLOSING:                                 // if websocket closing, log state
            log(`websocket closing`);
            break;
        case WebSocket.CLOSED:                                  // if websocket closed, log state
            log(`websocket closed`);
            break;
        default:                                                // if websocket in unknown state, log state
            log(`websocket in unknown state '${websocket.readyState}'`);
    }
}

// Handle document loaded
function loaded() {
    console.clear();
    log("--> loaded");

    // Initialize constants
    menuIcon.draggable = false;
    setSizes();
    vh0 = vh;
    vw0 = vw;
    onresize = resized;

    // Recall (or initialize) game settings
    if (sessionStorage.getItem("left"))
        left = JSON.parse(sessionStorage.getItem("left"));
    if (localStorage.getItem("favorites"))
        favorites = JSON.parse(localStorage.getItem("favorites"));
    if (localStorage.getItem("settings")) {
        const settings = JSON.parse(localStorage.getItem("settings"));
        player$ = pOff(settings.player);
        robot = pOff(settings.robot);
        showTrump = settings.showTrump;
        showCount = settings.showCount;
        showSummary = settings.showSummary;
        showDetail = settings.showDetail;
        showHand = settings.showHand;
    }

    // Initialize websocket if server exists
    if (document.location.hostname) {
        wsConnect();
    }

    /*
    // Implement proxy server for web fetches when app is offline
    if ("serviceWorker" in navigator && window.location.origin != "file://") {
        navigator.serviceWorker.register("service-worker.js", {updateViaCache: "none"});
        channel.onmessage = messageRxed;
    }
    */
}

onload = loaded;