"use strict";

// Player icons
const humanSrc  = "icons/human.svg";
const robotSrc  = "icons/robot.svg";

// Player values (or none)
const none      = -1;                                       // also used for other values
const p0        = 0;                                        // my left opponent  (name from robot or waiter)
const p1        = 1;                                        // my partner        (name from robot or waiter)
const p2        = 2;                                        // my right opponent (name from robot or waiter)
const p3        = 3;                                        // me                (name from alias)
const pj        = 4;                                        // joiner            (name from alias)
const players   = 4;
const pArray    = [p0, p1, p2, p3];
const next      = [p1, p2, p3, p0];                         // next player to the left
const teamO     = [false, true, false, true];               // odd players (p1, p3)
const teamE     = [true, false, true, false];               // even players (p0, p2)

// Suit values (or none)
const diamonds  = 0;
const clubs     = 5;
const hearts    = 10;
const spades    = 15;
const suits     = 4;
const sArray    = [spades, hearts, clubs, diamonds];
const suit$     = ["diamonds",,,,,"clubs",,,,,"hearts",,,,,"spades"];
const suitSrc   = ["suits/diamond.svg",,,,,"suits/club.svg",,,,,"suits/heart.svg",,,,,"suits/spade.svg"];

// Rank values (or none)
const jack      = 0;
const queen     = 1;
const king      = 2;
const ten       = 3;
const ace       = 4;
const ranks     = 5;
const rArray    = [jack, queen, king, ten, ace];
const rank$     = ["jack", "queen", "king", "ten", "ace"];
const rankSrc   = ["ranks/jack.svg", "ranks/queen.svg", "ranks/king.svg", "ranks/ten.svg", "suits/ace.svg"];

// Card values = rank + suit (or back or absent)
const values    = 20;
const back      = 20;
const absent    = 20;
const value$    = ["J♦","Q♦","K♦","T♦","A♦","J♣","Q♣","K♣","T♣","A♣","J♥","Q♥","K♥","T♥","A♥","J♠","Q♠","K♠","T♠","A♠","--"];
const deckCards = 80;
const handCards = deckCards / players;

// Show values
const counts     = 0;
const hands      = 1;

// Merit values for various play outcomes
const trckMerit = 10;   // Merit(demerit) for winning(losing) the trick
const highMerit = 10;   // Merit(demerit) for each point card won(lost)
const rankMerit = 1;    // Merit(demerit) for each card  foe(ally) uses
const trmpMerit = 1;    // Merit(demerit) for each trump foe(ally) uses

// suit[v] = suit of card value v
const suit      = [
    diamonds, diamonds, diamonds, diamonds, diamonds,
    clubs,    clubs,    clubs,    clubs,    clubs, 
    hearts,   hearts,   hearts,   hearts,   hearts, 
    spades,   spades,   spades,   spades,   spades,
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

// Bidding constants (or none)
const pass      = 0;
const typical   = 10;                                   // bots assume you have typical points if no jump bid
const maxTake   = 30;                                   // bots will toss hand if they need to take more than maxTake

// Position class
class P {
    constructor() {
        this.x = 0;                                     // x at card center
        this.y = 0;                                     // y at card center
        this.r = 0;                                     // rotation (0=portrait, pi/2=landscape)
     }
}

// Results class
class R {
    constructor(c) {
        this.c = c;                                     // card number
        this.n = 0;                                     // number of times this card had the best merit
     }
}

// Card groups
const gone = 0;                                         // gone (not yet dealt, hidden from view, or pulled)
const heap = 1;                                         // heap of dealt cards
const hand = 2;                                         // normal hand position
const play = 3;                                         // play position

// Card class
class C {
    constructor() {
        this.c    = 0;                                  // card number
        this.p    = 0;                                  // player value
        this.o    = false;                              // player is team O (p1 or p3)
        this.v    = 0;                                  // card value
        this.s    = 0;                                  // card suit
        this.r    = 0;                                  // card rank
        this.t    = false;                              // card take is one
        this.g    = 0;                                  // card group
        this.m    = false;                              // card is in trump
        this.z    = 0;                                  // draw order
        this.f    = false;                              // display face if true
        this.k    = false;                              // card known to all players
        this.gone = new P;                              // gone position
        this.heap = new P;                              // heap position
        this.hand = new P;                              // hand position
        this.play = new P;                              // play position
    }
}

// plyr[c] = player assigned card c
const plyr      = [
    p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0,
    p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1,
    p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, 
    p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3,
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

// Checkbox source images
const checked   = "icons/checked.svg";
const unchecked = "icons/unchecked.svg";

// Page elements
const body      = document.getElementById("body");
const loadPage  = document.getElementById("loadPage");
const joinBtn   = document.getElementById("joinBtn");
const createPg  = document.getElementById("createPg");
const createHdg = document.getElementById("createHdg");
const pLegend   = document.getElementById("pLegend");
const pName     = document.querySelectorAll(".pName");
const pIcon     = document.querySelectorAll(".pIcon");
const aBox      = document.querySelectorAll(".aBox");
const createSub = document.getElementById("createSub");
const joinPage  = document.getElementById("joinPage");
const jGame     = document.getElementById("jGame");
const joinBtns  = document.getElementById("joinBtns");
const joinWait  = document.getElementById("joinWait");
const joinSub   = document.getElementById("joinSub");
const gamePage  = document.getElementById("gamePage");
const bidText   = document.getElementById("bidText");
const meldSpan  = document.querySelectorAll("#meldColumn span");
const infoAreas = document.getElementById("infoAreas");
const infoName  = document.querySelectorAll(".infoName");
const infoBid   = document.querySelectorAll(".infoBid");
const infoHint  = document.querySelectorAll(".infoHint");
const infoIcon  = document.querySelectorAll(".infoHint img");
const bidBtn    = document.querySelectorAll("#bidText input");
const trumpText = document.getElementById("trumpText");
const trumpBtn  = document.querySelectorAll("#trumpText input");
const playText  = document.getElementById("playText");
const playPara  = document.querySelectorAll("#playText p");
const playBtn   = document.getElementById("playBtn");
const tossBtn   = document.getElementById("tossBtn");
const handText  = document.getElementById("handText");
const handPara  = document.querySelectorAll("#handText p");
const handCell  = document.querySelectorAll("#handGrid div");
const handBtn   = document.getElementById("handBtn");
const menuIcon  = document.getElementById("menuIcon");
const trmpIcon  = document.getElementById("trmpIcon");
const nTrump    = document.getElementById("nTrump");
const menuText  = document.getElementById("menuText");
const spadesT   = document.getElementById("spadesT");
const heartsT   = document.getElementById("heartsT");
const clubsT    = document.getElementById("clubsT");
const diamondsT = document.getElementById("diamondsT");
const cardImg   = document.querySelectorAll("#cardImg img");
const faceImg   = document.querySelectorAll("#faceImg img");
const backImg   = document.querySelectorAll("#backImg img");
const tutorPage = document.querySelectorAll(".tutorPage");
const aboutText = document.getElementById("aboutText");
const iText     = document.getElementById("iText");
const iTrump    = document.getElementById("iTrump");
const iOutGrid  = document.getElementById("iOut");
const iOutCell  = document.querySelectorAll("#iOut div");
const iTake     = document.getElementById("iTake");
const infoText  = document.querySelectorAll("#infoText div");
const pAdd      = document.getElementById("pAdd");
const pAddLbl   = document.getElementById("pAddLbl");
const pAddInp   = document.getElementById("pAddInp");
const pAddAdd   = document.getElementById("pAddAdd");
const pAddCan   = document.getElementById("pAddCan");
const pDel      = document.getElementById("pDel");
const pDelLbl   = document.getElementById("pDelLbl");
const pDelSel   = document.getElementById("pDelSel");
const pDelDel   = document.getElementById("pDelDel");
const pDelCan   = document.getElementById("pDelCan");

// Animation constants
const dealTime  = 2000;                                 // milliseconds to deal all cards
const blink     = "blink 1s ease-in-out 5s infinite";   // slow blink animation

// --------------------------------------------Websocket Server Protocol--------------------------------------------
//
// From sender                                                      Server action
// ===========                                                      =============
// wsConnect(ws) (if reconnect, url basename is id)                 set ws.id; reply {op:"id", id:i}
// wsClose(closeEvent)                                              socket[closeEvent.target.id]=null
// {op:"ping"}                                                      reply {op:"pong"}
// {op:"join", name:n$, creator:i}                                  fix groups; send {op:"join", name:n$} to creator
// {op:"solo"}                                                      clear sender's group
// {op:"deal", player:p, value:[v], name:[n$], bot:[f], show:[f]}   forward message to sender's group
// {op:"bid",  player:p, bid:b}                                     forward message to sender's group
// {op:"pick", suit:s}                                              forward message to sender's group
// {op:"toss"}                                                      forward message to sender's group
// {op:"ready", player:p}                                           forward message to sender's group
// {op:"play", card:c}                                              forward message to sender's group
//
// Parameters                                                       Example
// ==========                                                       =======
// i    = player identifier (index of player's websocket)           id:1234
// n$   = player name                                               name:"Grampy"
// p    = player index (left=0, across=1, right=2, origin=3)        player:3
// [v]  = array of 80 card values (suit + rank=0..4 for JQKTA)      value:[0, 0, 0, 0, ...19, 19, 19, 19]
// [n$] = array of 4 player names                                   name:["Bender", "Data", "Jarvis", "Creator"]
// [f]  = array of 4 bot flags                                      bot:[true, false, true, false]
// [f]  = array of 2 show flags (counts, hands)                     show:[true, false]
// b    = player's bid (none=-1, pass=0)                            bid:50
// s    = suit value (diamonds=0, clubs=5, hearts=10, spades=15)    suit:0
// c    = card index in deck (0 to 79)                              card:62
//
//  creator: >wsConnect <id [<join] [>deal [<>bid] <>pick <>toss/ready [<>play]] >solo >wsClose
//  joiner:  >wsConnect <id  >join  [<deal [<>bid] <>pick <>toss/ready [<>play]] >solo >wsClose
let websocket   = null;                                 // websocket object (or null)
let wsIntervlID = null;                                 // websocket interval timer identifier (or null)
let id          = none;                                 // id = websocket identifier

// Game variables from this player's perspective
let idStack     = [];                                   // stack of infoText divs
let game        = none;                                 // game number (aka id of creator)
let solo        = true;                                 // creator is only human player
let shift       = 0;                                    // this player is shift players left of creator
let waiter      = [];                                   // waiter[w] = waiter w's name
let name        = ["Bender", "Data", "Jarvis", ""];     // name[p] = player p's name
let bot         = [true, true, true, false];            // bot[p] = player p is a bot (include pj)
let ready       = [true, true, true, true ];            // ready[p] = player p is ready to play (robots are always ready)
let show        = [true, false];                        // show[counts] and show[hands]
let dealer      = p3;                                   // the player who is dealing or last dealt
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
let bidO        = none;                                 // team O's bid if they win the bid (or none)
let bidE        = none;                                 // team E's bid if they win the bid (or none)
let meldO       = 0;                                    // team O's meld for this hand
let meldE       = 0;                                    // team E's meld for this hand
let needO       = 0;                                    // points team O needs to take to save
let needE       = 0;                                    // points team E meeds to take to save
let takeO       = 0;                                    // points team O has taken so far in hand
let takeE       = 0;                                    // points team E has taken so far in hand
let scoreO      = 0;                                    // team O's total points so far in game
let scoreE      = 0;                                    // team E's total points so far in game
let tossO       = false;                                // true if team O tosses in the hand
let tossE       = false;                                // true if team E tosses in the hand
let mustToss    = false;                                // true if bidder lacks a marriage in trump
let tutorialPg  = none;                                 // tutorial page (or none)
let playZ       = -1000;                                // z-index for played card (auto-increments)
let select      = none;                                 // item[select] = item to select


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
let hpad        = 0;                                    // horizontal padding for p2 and p0 hands
let vpad        = 0;                                    // vertical padding for p1 and p3 hands
let pitch1      = 0;                                    // horizontal card pitch for p1 hand
let pitch3      = 0;                                    // horizontal card pitch for p3 hand
let vpitch      = 0;                                    // vertical card pitch for p2 and p0 hands

// Global drag and drop variables
let pickedC = 0;                                        // Picked card number
let pickedE = null;                                     // Picked element
let offsetX = 0;                                        // offset of pointer X from card X
let offsetY = 0;                                        // offset of pointer Y from card Y
let strt = "";                                          // start transform
let fnsh = "";                                          // finish transform

// Log debugText on console (comment out when done debugging)
function log(debugText = "") {
    console.log(debugText);
}

// Log state s on console and update state variable
function logState(s) {
    log(`--> ${s}`);
}

// Return p rotated clockwise by "shift" players; if shift is 1, p0 returns p1 and [p0,p1,p2,p3] returns [p1,p2,p3,p0]
function left(p) {
    if (typeof p == "number")
        p = (p + shift) % players;
    else {
        const temp = [...p];
        for (let i=0; i<players; i++)
            p[i] = temp[(i + shift) % players];
    }
    return p;
}

// Return p rotated counter-clockwise by "shift" players; if shift is 1, p1 returns p0 and [p1,p2,p3,p0] returns [p0,p1,p2,p3]
function right(p) {
    if (typeof p == "number")
        p = (p + (players-shift)) % players;
    else {
        const temp = [...p];
        for (let i=0; i<players; i++)
            p[i] = temp[(i + (players-shift)) % players];
    }
    return p;
}

// Return card c rotated clockwise by "shift" players; if shift is 1, c0 returns c20
function cardLeft(c) {
    return (c + shift*handCards) % deckCards;
}

// Return card c rotated clockwise by "shift" players; if shift is 1, c20 returns c0
function cardRight(c) {
    return (c + (deckCards-shift*handCards)) % deckCards;
}

// Notify other players of action object a (if multiplayer game)
function notify(a) {
    if (!solo)
        websocket.send(JSON.stringify(a));
}

// Return true if the suit of card value v is trump
function trmp(v) {
    return suit[v]==trump;
}

// Return number of cards in player p's hand
function nCards(p) {
    let n = 0;
    for (let c = minC[p]; c <= maxC[p]; c++)
        if (card[c].g == hand)
            n++;
    return n;
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
    for (const s of sArray)
        n = Math.min(n, nValue(p, r+s));
    return n;
}

// Return number of suit s runs in the player p's hand
function runs(p, s) {
    let n = 4;
    for (const r of rArray)
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
    for (const s of sArray)
        m += marriages(p,s) * (s==t?4:2);
    return m;
}

// Return minimum meld in player p's hand
function minMeld(p) {
    let min = 999;
    for (const s of sArray)
        min = Math.min(meld(p, s), min);
    return min;
}

// Return maximum meld in bidder's hand
function maxMeld(p) {
    let max = 0;
    for (const s of sArray)
        max = Math.max(meld(p, s), max);
    return max;
}

// Return suit with maximum meld in player p's hand
function maxSuit(p) {
    for (const s of sArray)
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
    for (const p of pArray)                                     // for each player,
        if ((teamO[p] && meldO<20) || (teamE[p] && meldE<20)) {     // if player's team can't keep their meld,
            if (p == bidder)                                            // if player won the bid,
                for (const r of [queen, king])                              // tag one trump marriage (if possible, to allow play)
                    tagCards(p, r+trump, Math.min(marriages(p, trump)), 1);
            for (const s of sArray)                                     // show any aces around (house rule?)
                tagCards(p, ace+s, arounds(p, ace));
        } else {                                                    // if player's team may be able to keep their meld,
            for (const r of [jack, queen, king, ace])                   // tag arounds
                for (const s of sArray)
                    tagCards(p, r+s, arounds(p, r));
            for (const r of rArray)                                     // tag runs in trump
                tagCards(p, r+trump, runs(p, trump));
            tagCards(p, jack+diamonds, pinochles(p));                   // tag pinochles
            tagCards(p, queen+spades, pinochles(p));
            for (const r of [queen, king])                              // tag marriages
                for (const s of sArray)
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

// Return bid string for player p
function bidString(p) {
    if (bid[p] == none)
        return "";
    else
        return `${teamO[p]? "&nbsp;-&nbsp;" : ""}${bid[p]==pass? "Pass" : String(bid[p])}`;
}

// Log bidder's bid (text or number), quality(bidder), minMeld(bidder), maxMeld(bidder), est[partner] and reason
function logBid(bid, reason) {
    const partner = next[next[bidder]];
    let t = "";
    t += `bid[${name[bidder][0]}]:`.padEnd(7) + `${bid},`.padEnd(6);
    t += `quality(${name[bidder][0]}):${(quality(bidder)>=0?"+":"")+quality(bidder)},`.padEnd(16);
    t += `minMeld(${name[bidder][0]}):${minMeld(bidder)},`.padEnd(16);
    t += `maxMeld(${name[bidder][0]}):${maxMeld(bidder)},`.padEnd(16);
    t += `est[${name[partner][0]}]:${est[partner]},`.padEnd(12);
    t += `reason:${reason}`;
    log(t);
}

// Return number of players who passed
function nPass() {
    return (bid[p0]==pass?1:0) + (bid[p1]==pass?1:0) + (bid[p2]==pass?1:0) + (bid[p3]==pass?1:0);
}

// Return computer bidder's bid
function autoBid() {
    const lefty   = next[bidder];
    const partner = next[lefty];
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
    if (bid[lefty]==none && bid[right]!=pass && highBid<60 && quality(bidder)>0 && maxBid>=60) {
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
        for (const s of sArray) {
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
        for (const s of sArray) {
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
        for (const s of sArray) {
            if (marriages(bidder,s)>0 && nSuit(bidder,s)+nValue(bidder,ace+s)>n) {
                n = nSuit(bidder,s) + nValue(bidder, ace+s);
                t = s;
            }
        }
    return t;
}

// Return true if card c can be chosen based on lead card l, high card h, and trump (disturbing nothing)
function legal(c, l, h) {
    if (card[c].g!=hand)                                        // c's not in hand, c's illegal
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
    for (const p of pArray) {
        t = `${name[p][0]}:`;
        for (let c = minC[p]; c <= maxC[p]; c++)
            t += card[c].g==hand? ` ${value$[card[c].v]}` : ` --`;
        log(t);
    }
}

// log stats on console
function logStats() {
    let t = "";
    log("   J♦ Q♦ K♦ T♦ A♦ J♣ Q♣ K♣ T♣ A♣ J♥ Q♥ K♥ T♥ A♥ J♠ Q♠ K♠ T♠ A♠");
    for (const p of pArray) {
        t = `${name[p][0]}:`;
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

// Display enabled hints
function showHints() {
    if (show[counts]) {
        let n = 0, i = 0;
        for (const r of rArray)
            n += remaining[r+trump] - nValue(p3,r+trump);
        nTrump.textContent = n;
        for (const p of [p0, p1, p2]) {
            for (const s of sArray) {
                let n = 0;
                for (const r of rArray)
                    n += capMaxCards(p, r+s, p3);
                infoIcon[i++].style.filter = n==0? "invert(0%)" : (minCards[p][ace+s]>0? "invert(100%)" : "invert(50%)");
            }
            infoHint[p].style.display = nCards(p)>0? "inline" : "none";
        }
    } else {
        nTrump.textContent = "";
        infoHint[p0].style.display = infoHint[p1].style.display = infoHint[p2].style.display = "none";
    }
}

// Get plausible card values cardV given other players' unknown cards
function getPlausible(cardV) {

    // Cap known cards based on minCards (in case a known card was chosen rather than an unknown card)
    for (const p of pArray)
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
        for (const p of pArray)
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

// Find player p's best legal move bestC[p] given card values v and played cards playC[p0..p3]
function bestMerit(v, bestC, playC, p, leadCard0, highCard0, nPlayed) {
    let l = leadCard0;
    let h = highCard0;
    let merit = 0;
    let bestM = -100;
    nextC: for (let c = minC[p]; c <= maxC[p]; c++) {           // For all of player p's cards,
        if (v[c] != absent) {                                       // if card is in hand,
            if (l == none)                                              // if no lead card,
                l = h = c;                                                  // lead and high cards are now this card
            else {                                                      // otherwise,
                const vc=v[c],     vl=v[l],     vh=v[h];
                const sc=suit[vc], sl=suit[vl], sh=suit[vh];
                const rc=rank[vc], rl=rank[vl], rh=rank[vh];
                const tc=trmp(vc), tl=trmp(vl), th=trmp(vh);
                if (!tl && th) {                                            // if lead suit isn't trump and high suit is trump, 
                    if (sc != sl) {                                             // if c doesn't follow the lead,
                        for (let c = minC[p]; c <= maxC[p]; c++)                    // if p can follow the lead, c's no good
                            if (suit[v[c]] == sl)
                                continue nextC;
                        if (!tc || rc<=rh) {                                        // if c doesn't overtrump,
                            for (let c = minC[p]; c <= maxC[p]; c++)                    // if p can overtrump, c's no good
                                if (trmp(v[c]) && v[c]>vh)
                                    continue nextC;
                            if (!tc)                                                    // if c's not trump,
                                for (let c = minC[p]; c <= maxC[p]; c++)                    // if p can trump, c's no good
                                    if (trmp(v[c]))
                                        continue nextC;
                        }
                    }
                } else {                                                    // if lead suit is trump or high suit isn't trump,
                    if (sc!=sl || rc<=rh) {                                     // if c doesn't follow lead or doesn't beats high,
                        for (let c = minC[p]; c <= maxC[p]; c++)                    // if p can follow lead & beat high, c's no good
                            if (suit[v[c]]==sl && v[c]>vh)
                                continue nextC;
                        if (sc != sl) {                                             // if c doesn't follow lead,
                            for (let c = minC[p]; c <= maxC[p]; c++)                    // if p can follow lead, c's no good
                                if (suit[v[c]] == sl)
                                    continue nextC;
                            if (!tc)                                                    // if c's not trump,
                                for (let c = minC[p]; c <= maxC[p]; c++)                    // if p cam trump, c's no good
                                    if (trmp(v[c]))
                                        continue nextC;
                        }
                    }
                }
                if (sc==sh && rc>rh || tc&&!th)                             // if c beats h or c's trump and h's not,
                    h = c;                                                      // new high card.
            }
            // Legal card: play it
            playC[p] = c;
            if (nPlayed+1 < players) {
                // Play incomplete: recurse to next player
                merit = -bestMerit(v, bestC, playC, next[p], l, h, nPlayed+1);
            } else {
                // Play complete: calculate merit
                const w=v[playC[p0]], n=v[playC[p1]], e=v[playC[p2]], s=v[playC[p3]];
                if (teamO[p] && teamO[plyr[h]]) {
                    // NS is last player and NS won
                    merit =  +trckMerit;
                    merit += (+high[w] + high[n] + high[e] + high[s]) * highMerit;
                    merit += (+rank[w] - rank[n] + rank[e] - rank[s]) * rankMerit;
                    merit += (+trmp(w) - trmp(n) + trmp(e) - trmp(s)) * trmpMerit;
                } else if (!teamO[p] && !teamO[plyr[h]]) {
                    // EW is last player and EW won
                    merit =  +trckMerit;
                    merit += (+high[w] + high[n] + high[e] + high[s]) * highMerit;
                    merit += (-rank[w] + rank[n] - rank[e] + rank[s]) * rankMerit;
                    merit += (-trmp(w) + trmp(n) - trmp(e) + trmp(s)) * trmpMerit;
                } else if (teamO[p] && !teamO[plyr[h]]) {
                    // NS is last player and NS lost
                    merit =  -trckMerit;
                    merit += (-high[w] - high[n] - high[e] - high[s]) * highMerit;
                    merit += (+rank[w] - rank[n] + rank[e] - rank[s]) * rankMerit;
                    merit += (+trmp(w) - trmp(n) + trmp(e) - trmp(s)) * trmpMerit;
                } else if (!teamO[p] && teamO[plyr[h]]) {
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

// Locate all card positions (n = number of semi-exposed cards; v = visible card number) and p0/p2 info boxes
function locateCards() {
    const r0 = [+Math.PI/2, +Math.PI/2, -Math.PI/2, -Math.PI/2][dealer];
    const r1 = [0,          0,          0,          0         ][dealer];
    const r2 = [+Math.PI/2, -Math.PI/2, -Math.PI/2, +Math.PI/2][dealer];
    const r3 = [+Math.PI,   0,          -Math.PI,   0         ][dealer];
    const maxY = [vh*0.475, 0, vh*0.475, 0];
    let n, v;
    for (let c = 0; c < deckCards; c++) {
        const p = card[c].p;
        if (c == minC[p]) {
            n = -1;
            for (let c = minC[p]; c <= maxC[p]; c++)
                n = card[c].g==hand? n+1 : n;
            if (vw <= vh) { // portrait
                hpad = pad;
                vpad = iconh + pad;
                pitch1 = Math.min(cardw*1/4, (vw - pad*2 - cardw) / n);
                pitch3 = Math.min(cardw*3/4, (vw - pad*2 - cardw) / n);
                vpitch = Math.min(cardw*1/4, (vh - cardh*2 - iconh*4 - pad*3 - cardw) / n);
            } else { // landscape
                hpad = pad;
                vpad = iconh + pad;
                pitch1 = Math.min(cardw*1/4, (vw - pad*2 - cardw) / n);
                pitch3 = Math.min(cardw*3/4, (vw - pad*4 - cardh*2 - cardw) / n);
                vpitch = Math.min(cardw*1/4, (vh - iconh*3 - pad*1.5 - cardw) / n);
            }
            v = 0;
        }
        card[c].gone.x = Math.round([-cardh/2-1, vw/2, vw+cardh/2+1, vw/2][p]);
        card[c].gone.y = Math.round([vh/2, -cardh/2-1, vh/2, vh+cardh/2+1][p]);
        card[c].gone.r = [r0, r1, r2, r3][p];
        card[c].heap.x = Math.round([cardw+hpad, vw/2, vw-cardw-hpad, vw/2][p] + (Math.random()-0.5)*cardw/2);
        card[c].heap.y = Math.round([vh/2, cardw+vpad, vh/2, vh-cardw-vpad][p] + (Math.random()-0.5)*cardw/2);
        card[c].heap.r = [Math.PI/2, 0, -Math.PI/2, 0][dealer] + (Math.random()-0.5)*Math.PI/4;
        card[c].hand.x = Math.round([cardh/2+hpad, vw/2-pitch1*(v-n/2), vw-cardh/2-hpad, vw/2+pitch3*(v-n/2)][p]);
        card[c].hand.y = Math.round([vh*0.475+vpitch*(v-n/2), cardh/2+vpad, vh*0.475-vpitch*(v-n/2), vh-cardh/2-vpad][p]);
        card[c].hand.r = [r0, r1, r2, r3][p];
        card[c].play.x = Math.round(vw/2 + [-cardw*0.38, 0, +cardw*0.38, 0][p]);
        card[c].play.y = Math.round(vh/2 + [0, -cardw*0.38, 0, +cardw*0.38][p]);
        card[c].play.r = [r0, r1, r2, r3][p];
        if (card[c].g==hand) {
            v++;
            maxY[p] = Math.max(maxY[p], card[c].hand.y);
        }
    }
    if (card[0].g == heap)
        infoName[p0].style.top  = infoName[p2].style.top  = vh/2 - cardw*1.4 + "px";
    else {
        infoName[p0].style.top = maxY[p0] + cardw*0.52 + "px";
        infoName[p2].style.top = maxY[p2] + cardw*0.52 + "px";
        infoBid[p0].style.top  = infoHint[p0].style.top = maxY[p0] + cardw*0.81 + "px";
        infoBid[p2].style.top  = infoHint[p2].style.top = maxY[p2] + cardw*0.81 + "px";
    }
}

// Move card c from c0(?), group g0 after delay d to c1(?), group g1, zIndex z1, face f1 over time t
function moveCard(c, g0, d, g1, z1, f1, t, c0, c1) {
    c0 = c0 ?? c;
    c1 = c1 ?? c;
    card[c].g = g1;
    cardImg[c].style.zIndex = z1;
    card[c].z = z1;
    if (card[c].f != f1)
        cardImg[c].src = f1? faceImg[card[c].v].src : backImg[0].src;
    card[c].f = f1;
    const x0 = [card[c0].gone.x, card[c0].heap.x, card[c0].hand.x, card[c0].play.x][g0];
    const y0 = [card[c0].gone.y, card[c0].heap.y, card[c0].hand.y, card[c0].play.y][g0];
    const r0 = [card[c0].gone.r, card[c0].heap.r, card[c0].hand.r, card[c0].play.r][g0];
    const x1 = [card[c1].gone.x, card[c1].heap.x, card[c1].hand.x, card[c1].play.x][g1];
    const y1 = [card[c1].gone.y, card[c1].heap.y, card[c1].hand.y, card[c1].play.y][g1];
    const r1 = [card[c1].gone.r, card[c1].heap.r, card[c1].hand.r, card[c1].play.r][g1];
    const strt =`translate(${x0}px,${y0}px) rotate(${r0}rad)`;
    const fnsh =`translate(${x1}px,${y1}px) rotate(${r1}rad)`;
    cardImg[c].animate([{transform:strt}, {transform:fnsh}], {duration:t, delay:d, fill:"forwards"});
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
}

// Return card number of top p3 card (or undefined) at x,y coordinates 
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
    }
    card.sort((a,b)=>a.c-b.c);
    return topC;
}

/////////////////////////////////////////////////////////////
//                     EVENT HANDLERS                      //
/////////////////////////////////////////////////////////////

// Info close icon clicked: pop and hide and discard current infoText div, then display previous infoText div
function infoCloseClicked() {
    if (idStack.length > 0)
        idStack.pop().style.display = "none";
    if (idStack.length > 0)
        idStack.at(-1).style.display = "block";
}

// Info icon or link clicked: hide previous infoText div and display new infoText div id
function info(id) {
    for (const div of infoText)
        if (div.id == id) {
            if (idStack.length > 0)
                idStack.at(-1).style.display = "none";
            div.style.display = "block";
            idStack.push(div);
            break;
        }
}

// Info icon clicked: reveal/hide handEnded paragraphs
function infoClicked() {
    if (handPara[0].style.display == "none")
        handPara[0].style.display = handPara[1].style.display = handPara[2].style.display = "block";
    else
        handPara[0].style.display = handPara[1].style.display = handPara[2].style.display = "none";
}

// Ok button clicked: note p3 is ready, notify others, and await all ready
function okClicked() {
    handBtn.disabled = true;
    ready[p3] = true;
    notify({op:"ready", player:left(p3)});
    infoName[p3].style.animation = "none";
    if (shift==0 && ready[p0] && ready[p1] && ready[p2])
        setTimeout(onready);
}

// Hand ended: display stats, await all ready, then deal next hand or start new game
function handEnded() {
    logState("handEnded");
    handCell[4].innerHTML = scoreO;
    handCell[5].innerHTML = scoreE;
    handCell[7].innerHTML = teamO[bidder]? bidO : "Pass";
    handCell[8].innerHTML = teamE[bidder]? bidE : "Pass";
    handCell[10].innerHTML = meldO<20||(!tossE&&takeO<20)? `<s>&nbsp;${meldO}&nbsp;</s>` : meldO;
    handCell[11].innerHTML = meldE<20||(!tossO&&takeE<20)? `<s>&nbsp;${meldE}&nbsp;</s>` : meldE;
    handCell[13].innerHTML = takeO<20? `<u><s>&nbsp;${takeO}&nbsp;</s></u>` : `<u>${takeO}</u>`;
    handCell[14].innerHTML = takeE<20? `<u><s>&nbsp;${takeE}&nbsp;</s></u>` : `<u>${takeE}</u>`;
    if (tossO) {
        scoreO = scoreO - bidO;
        handPara[0].innerHTML = `You lost your bid because ` +
            `${bidder==p3?"you":name[bidder]} tossed due to ${mustToss?`no trump marriage`:`insufficient meld`}.`;
    } else if (teamO[bidder] && (meldO<20 || takeO<20 || meldO+takeO<bidO)) {
        scoreO = scoreO - bidO;
        handPara[0].innerHTML = `You lost your bid because ` + 
            (meldO<20? `your meld was less than 20.` :
            (takeO<20? `your take was less than 20.` :
            `your meld plus take was less than your bid.`));
    } else if (teamO[bidder]) {
        scoreO = scoreO + meldO + takeO;
        handPara[0].innerHTML = `You won your meld plus take because ` +
            `they were each at least 20 and your meld plus take was at least your bid.`;
    } else if (tossE) {
        scoreE = scoreE - bidE;
        handPara[0].innerHTML = `They lost their bid because ` +
            `${name[bidder]} tossed in the hand due to ${mustToss?`no trump marriage`:`insufficient meld`}.`;
    } else if (teamE[bidder] && (meldE<20 || takeE<20 || meldE+takeE<bidE)) {
        scoreE = scoreE - bidE;
        handPara[0].innerHTML = `They lost their bid because ` + 
            (meldE<20? `their meld was less than 20.` :
            (takeE<20? `their take was less than 20.` :
            `their meld plus take was less than their bid.`));
    } else if (teamE[bidder]) {
        scoreE = scoreE + meldE + takeE;
        handPara[0].innerHTML = `They won their meld plus take because ` +
            `they were each at least 20 and their meld plus take was at least their bid.`;
    }
    if (tossO && meldE<20) {
        scoreE = scoreE;
        handPara[1].innerHTML = `They didn't win their meld because it was less than 20.`;
    } else if (tossO && meldE>=20) {
        scoreE = scoreE + meldE;
        handPara[1].innerHTML = `They won their meld because it was at least 20.`;
    } else if (teamO[bidder] && !tossO && takeE<20) {
        scoreE = scoreE;
        handPara[1].innerHTML = `They didn't win their meld or take because their take was less than 20.`;
    } else if (teamO[bidder] && !tossO && meldE<20 && takeE>=20) {
        scoreE = scoreE + takeE;
        handPara[1].innerHTML = `They didn't win their meld because it was less than 20, but ` +
            `they won their take because it was at least 20.`;
    } else if (teamO[bidder] && !tossO && meldE>=20 && takeE>=20) {
        scoreE = scoreE + meldE + takeE;
        handPara[1].innerHTML = `They won their meld plus take because they were each at least 20.`;
    } else if (tossE && meldO<20) {
        scoreO = scoreO;
        handPara[1].innerHTML = `We didn't win our meld because it was less than 20.`;
    } else if (tossE && meldO>=20) {
        scoreO = scoreO + meldO;
        handPara[1].innerHTML = `We won our meld because it was at least 20.`;
    } else if (teamE[bidder] && !tossE && takeO<20) {
        scoreO = scoreO;
        handPara[1].innerHTML = `We didn't win our meld or take because our take was less than 20.`;
    } else if (teamE[bidder] && !tossE && meldO<20 && takeO>=20) {
        scoreO = scoreO + takeO;
        handPara[1].innerHTML = `We didn't win our meld because it was less than 20, but ` +
            `we won our take because it was at least 20.`;
    } else if (teamE[bidder] && !tossE && meldO>=20 && takeO>=20) {
        scoreO = scoreO + meldO + takeO;
        handPara[1].innerHTML = `We won our meld plus take because they were each at least 20.`;
    }
    handPara[2].innerHTML = `Your score is now ${scoreO}.<br>Their score is now ${scoreE}.`;    
    handCell[16].innerHTML = scoreO;
    handCell[17].innerHTML = scoreE;
    dealer = next[dealer];
    shuffleCards();
    for (const p of pArray)
        ready[p] = bot[p];
    if (takeE==50 || (scoreE>=500 && scoreO<500) || (scoreO>=500 && scoreE>=500 && teamE[bidder]))
        handPara[3].innerHTML = `Boohoo! We lost!`;
    else if (takeO==50 || (scoreO>=500 && scoreE<500) || (scoreO>=500 && scoreE>=500 && teamO[bidder]))
        handPara[3].innerHTML = `Woohoo! We win!`;
    else
        handPara[3].innerHTML = `${name[dealer]} deals next.`;
    handBtn.disabled = false;
    handPara[0].style.display = handPara[1].style.display = handPara[2].style.display = "none";
    handText.style.display = "block";
    for (const p of pArray) {
        ready[p] = bot[p];
        infoName[p].style.animation = ready[p]? "none" : blink;
    }
    onready = takeO<50 && takeE<50 && scoreO<500 && scoreE<500? dealCards : loaded;
}

// Trick viewed: pull trick, then retrigger awaitChoice or trigger handEnded
function trickViewed() {
    logState("trickViewed");
    for (let c = 0; c < deckCards; c++)
        if (card[c].g == play)
            moveCard(c, play, 0, gone, 100, false, dealTime/10, c, minC[card[highCard].p]);
    if (nGroup(hand) > 0) {
        player = card[highCard].p;
        chosen = leadCard = highCard = none;
        infoName[player].style.animation = blink;                   // wait for next player to choose a card
        setTimeout(awaitChoice, dealTime/10);
    } else {
        player = none;
        if (card[highCard].o)
            takeO += 2;
        else
            takeE += 2;
        trmpIcon.style.display = "none";
        nTrump.textContent = "";
        infoHint[p0].style.display = infoHint[p1].style.display = infoHint[p2].style.display = "none";
        setTimeout(handEnded, dealTime/10);
    }
}

// Trick played: pause a moment to view trick, then trigger trickViewed
function trickPlayed() {
    logState("trickPlayed");
    for (let c = 0; c < deckCards; c++)
        if (card[c].g == play) {
            if (card[c].r==ace || card[c].r==ten || card[c].r==king)
                if (card[highCard].o)
                    takeO += 1;
                else
                    takeE += 1;
            moveCard(c, play, 0, play, card[c].z, true, dealTime/4);
        }
    setTimeout(trickViewed, dealTime/4);
}

// Card played: close hand, then trigger trickPlayed or awaitChoice and wait for player to bick a card 
function cardPlayed() {
    logState("cardPlayed");
    locateCards();
    for (let c=minC[player]; c<=maxC[player]; c++)
        moveCard(c, card[c].g, 0, card[c].g, c==chosen?playZ++:card[c].z, card[c].f, 0);
    if (nGroup(play) == players)
        setTimeout(trickPlayed, 100);
    else {
        player = next[player];
        infoName[player].style.animation = blink;                   // wait for next player to pick a card
        setTimeout(awaitChoice, 100);
    }
}

// Card chosen: update stats, play face, then trigger cardPlayed
function cardChosen() {
    logState("cardChosen");
    let msg = "Best follow";

    // if chosen card is in high suit and doesn't beat non-ace high card, player must not have any cards that can beat the high card 
    if (highCard!=none && card[chosen].s==card[highCard].s && card[highCard].r!=ace && card[chosen].r<=card[highCard].r) {
        msg = `Can't beat ${value$[card[highCard].v]}`;
        for (let v = card[highCard].v+1; v<=ace+card[highCard].s; v++)
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
        for (const r of rArray)
            maxCards[player][r+card[leadCard].s] = maxCards[player][r+trump] = 0;
    }
    // Update stats based on chosen card
    remaining[card[chosen].v]--;
    minCards[player][card[chosen].v] = Math.max(minCards[player][card[chosen].v] - 1, 0);
    let loose = remaining[card[chosen].v]
    for (const p of pArray)
        loose -= minCards[p][card[chosen].v];
    for (const p of pArray)
        maxCards[p][card[chosen].v] = Math.min(maxCards[p][card[chosen].v], minCards[p][card[chosen].v] + loose);

    // log this play
    log(`${name[player]} chose ${value$[card[chosen].v]}, msg:${msg}, card[chosen].z:${card[chosen].z}`);

    // animate card play
    if (player != p3)
        moveCard(chosen, card[chosen].g, 0, play, card[chosen].z, true, dealTime/10);
    setTimeout(cardPlayed, dealTime/10);
}

// Pointer down event
function pointerDowned(event) {
    let pickX, pickY;
    event.preventDefault();
    pickX = event.clientX;
    pickY = event.clientY;
    pickedC = xy2c(pickX, pickY)
    if (!pickedC)
        return;
    pickedE = event.target;
    pickedE.setPointerCapture(event.pointerId);
    offsetX = pickX - card[pickedC].hand.x;
    offsetY = pickY - card[pickedC].hand.y;
    fnsh = `translate(${pickX-offsetX}px, ${pickY-offsetY}px)`;
};

// Pointer move event
function pointerMoved(event) {
    let moveX, moveY;
    event.preventDefault();
    if (pickedC && pickedE) {
        moveX = event.clientX;
        moveY = event.clientY;
        strt = fnsh;
        fnsh = `translate(${moveX-offsetX}px, ${moveY-offsetY}px)`;
        pickedE.animate([{transform:strt}, {transform:fnsh}], {duration:0, fill:"forwards"});
    };
};

// Pointer up event
function pointerUpped(event) {
    event.preventDefault();
    if (pickedC && pickedE) {
        if (event.clientY-offsetY < card[pickedC].hand.y-cardh/2) {
            strt = fnsh;
            fnsh = `translate(${card[pickedC].play.x}px, ${card[pickedC].play.y}px)`;
            pickedE.animate([{transform:strt}, {transform:fnsh}], {duration:dealTime/10, fill:"forwards"});
            card[pickedC].g = play;
            chosen = pickedC; 
            notify({op:"play", card:cardLeft(chosen)});
            infoName[p3].style.animation = "none";                      // stop waiting for me to pick a card
            for (let c=minC[p3]; c<=maxC[p3]; c++) {
                cardImg[c].onpointerdown = "";
                cardImg[c].onpointermove = "";
                cardImg[c].onpointerup = "";
                cardImg[c].style.filter = card[c].g==hand? "brightness(70%)" : "brightness(100%)";
            }
            setTimeout(cardChosen, dealTime/10);
        } else {
            strt = fnsh;
            fnsh = `translate(${card[pickedC].hand.x}px, ${card[pickedC].hand.y}px)`;
            pickedE.animate([{transform:strt}, {transform:fnsh}], {duration:dealTime/10, fill:"forwards"});
        }
        pickedE = null;
    }
}

// Hands re-fanned: wait for p3, bot or remote player to choose a card
function awaitChoice() {
    logState("awaitChoice");
    showHints();
    if (player == p3)
        for (let c=minC[p3]; c<=maxC[p3]; c++)
            if (legal(c, leadCard, highCard)) {
                cardImg[c].style.filter = "brightness(100%)";
                cardImg[c].onpointerdown = pointerDowned;
                cardImg[c].onpointermove = pointerMoved;
                cardImg[c].onpointerup = pointerUpped;
            } else
                cardImg[c].style.filter = "brightness(70%)";

    else if (shift==0 && bot[player]) {
        chosen = autoSelect();
        notify({op:"play", card:cardLeft(chosen)});
        infoName[player].style.animation = "none";              // stop waiting for my bot to choose a card
        setTimeout (cardChosen);
    }
}

// Meld gathered: re-fan hands, then await choice
function meldGathered() {
    logState("meldGathered");
    for (let c = 0; c < deckCards; c++) {
        cardImg[c].style.filter = card[c].p==p3? "brightness(70%)" : "brightness(100%)";
        card[c].g = hand;
    }
    locateCards();
    for (let c = 0; c < deckCards; c++)
        if (show[hands] || card[c].p==p3)
            moveCard(c, gone, 0, hand, c, true, dealTime/10);
        else
            moveCard(c, gone, 0, hand, -c, false, dealTime/10);
    player = bidder;
    chosen = leadCard = highCard = none;
    infoName[player].style.animation = blink;
    setTimeout(awaitChoice, dealTime/10);                       // wait for player to choose a card
}

// Bidding is complete: gather meld, then trigger handEnded or meldGathered
function biddingComplete() {
    logState("biddingComplete");
    playText.style.display = "none";
    for (let c = 0; c < deckCards; c++) {
        cardImg[c].style.filter = "brightness(100%)";
        moveCard(c, hand, 0, gone, -c, false, dealTime/10);
    }
    if (tossO || tossE)
        setTimeout(handEnded, dealTime/10);
    else
        setTimeout(meldGathered, dealTime/10);
}

// Play button clicked: notify others then await all ready
function playClicked() {
    notify({op:"ready", player:left(p3)});
    infoName[p3].style.animation = "none";                      // stop waiting for me to be ready
    playBtn.disabled = true;
    tossBtn.disabled = true;
    ready[p3] = true;
    if (ready[p0] && ready[p1] && ready[p2] && ready[p3])
        setTimeout(onready);
}

// Toss button clicked: notify others then await all ready
function tossClicked() {
    tossO = true;
    notify({op:"toss"});
    infoName[p3].style.animation = "none";                      // stop waiting for me to toss
    playBtn.disabled = true;
    tossBtn.disabled = true;
    ready[p3] = true;
    if (ready[p0] && ready[p1] && ready[p2] && ready[p3])
        setTimeout(onready);
}

// Meld fanned: display information then await all ready
function meldFanned() {
    logState("meldFanned");
    playPara[0].innerHTML = `${bidder==p3?"You":name[bidder]} picked ${suit$[trump]}.`;
    playPara[1].innerHTML = `Your meld is ${meldO<20?"<20":meldO}.<br>`;
    playPara[1].innerHTML += `Their meld is ${meldE<20?"<20":meldE}.`;
    if (mustToss)
        playPara[2].innerHTML = `${bidder==p3?"You":name[bidder]} must toss due to no trump marriage.`;
    else if (tossE || tossO)
        playPara[2].innerHTML = `${name[bidder]} tossed due to insufficient meld.`;
    else
        playPara[2].innerHTML = `You need ${needO} points.<br>They need ${needE} points.`;
    playBtn.disabled = bidder==p3? mustToss : false;
    tossBtn.style.display = bidder==p3? "inline" : "none";
    tossBtn.disabled = false;
    for (const p of pArray) {
        ready[p] = bot[p];
        infoName[p].style.animation = bot[p]? "none" : blink;       // wait for all ready
    }
    playText.style.display = "flex";
    onready = biddingComplete;
}

// Hands regathered: fan out meld, then trigger meldFanned
function handsRegathered() {
    logState("handsRegathered");

    // brighten known (meld) cards, and move p3 and known cards into hands
    for (let c = 0; c < deckCards; c++) {
        cardImg[c].style.filter = card[c].k? "brightness(100%)" : "brightness(70%)";
        card[c].g = card[c].p==p3 || card[c].k? hand : gone;
    }
    logHands();

    // Adjust minCards and maxCards based on meld cards
    for (const p of pArray) {
        // Adjust minCards based on revealed cards
        for (let v = 0; v < values; v++)
            minCards[p][v] = nValue(p, v);
        // if #A/K/Q/J in other suits > #A/K/Q/J in this suit, max = #A/K/Q/J in this suit
        for (const r of [ace, king, queen, jack]) {
            let minCount = 5;
            let minSuit = none;
            let minHits = 0;
            for (const s of sArray)
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
        for (const s of sArray)
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
        for (const r of [ace, king, queen, jack])
            if (nValue(p,r+trump) < minOther)
                minOther = nValue(p,r+trump);
        if (nValue(p,ten+trump) < minOther)
            maxCards[p][ten+trump] = nValue(p,ten+trump);
    }
    // reduce maxCards based on minCards
    for (const p of pArray)
        for (let v = 0; v < values; v++) {
            const loose = 4 - minCards[p0][v] - minCards[p1][v] - minCards[p2][v] - minCards[p3][v];
            maxCards[p][v] = Math.min(maxCards[p][v], minCards[p][v] + loose);
        }
    logStats();

    // animate movement of meld cards to hand
    locateCards();
    for (let c = 0; c < deckCards; c++)
        if (card[c].g==hand)
            moveCard(c, gone, 0, card[c].g, c, true, dealTime/10);
    setTimeout(meldFanned, dealTime/10);
}

// Trump picked: regather hands, then trigger handsRegathered
function trumpPicked() {
    logState("trumpPicked");
    trmpIcon.src = suitSrc[trump];
    trmpIcon.style.display = "block";
    bidO  = Math.max(bid[p1], bid[p3]);
    bidE  = Math.max(bid[p0], bid[p2]);
    meldO = meld(p1, trump) + meld(p3, trump);
    meldE = meld(p0, trump) + meld(p2, trump);
    needO = teamE[bidder]? 20 : (meldO<20? bid[bidder] : Math.max(20,bid[bidder]-meldO));
    needE = teamO[bidder]? 20 : (meldE<20? bid[bidder] : Math.max(20,bid[bidder]-meldE));
    mustToss   = marriages(bidder, trump) == 0;
    tossO = teamO[bidder] && (mustToss || (bot[bidder] && needO>maxTake));
    tossE = teamE[bidder] && (mustToss || (bot[bidder] && needE>maxTake));
    tagMeld();
    for (let c = 0; c < deckCards; c++) {
        card[c].m = card[c].s==trump;
        moveCard(c, hand, 0, gone, -c, false, dealTime/10);
    }
    setTimeout(handsRegathered, dealTime/10);
}

// Suit s clicked: set trump, then trigger trumpPicked
function suitClicked(s) {
    trump = s;                                                  // note suit picked
    trumpText.style.display = "none";
    notify({op:"pick", suit:trump});                            // notify other players
    infoName[bidder].style.animation = "none";                  // stop waiting for me to pick trump
    setTimeout(trumpPicked);
}

// Bid won: await suitClicked (p3), autoPick (bot) or picked message (remote human)
function bidDone() {
    logState("bidDone");
    for (const p of pArray)                                     // stop displaying bids
        infoBid[p].style.display = "none";
    for (bidder of pArray)                                      // find winning bidder
        if (bid[bidder] > pass)
            break;
    if (bidder == p3) {                                         // if I won the bid,
        trumpBtn[0].disabled = marriages(p3, spades) == 0;          // await my suit pick
        trumpBtn[0].value = `Spades (${meld(p3, spades)})`;
        trumpBtn[1].disabled = marriages(p3, hearts) == 0;
        trumpBtn[1].value = `Hearts (${meld(p3, hearts)})`;
        trumpBtn[2].disabled = marriages(p3, clubs) == 0;
        trumpBtn[2].value = `Clubs (${meld(p3, clubs)})`;
        trumpBtn[3].disabled = marriages(p3, diamonds) == 0;
        trumpBtn[3].value = `Diamonds (${meld(p3, diamonds)})`;
        if (noMarriages(bidder))
            trumpBtn[0].disabled = trumpBtn[1].disabled = trumpBtn[2].disabled = trumpBtn[3].disabled = false;
        trumpText.style.display = "flex";
        infoName[p3].style.animation = blink;                       // wait for me to pick trump
        return;
    }
    if (shift==0 && bot[bidder]) {                              // if my bot won the bid,
        trump = autoPick();                                         // the bot picks trump
        notify({op:"pick", suit:trump});                            // notify other players
        setTimeout(trumpPicked);                                    // advance to trump picked
        return;
    }
}

// Bid button n clicked: handle button n and retrigger awaitBid or trigger bidDone
function bidClicked(n) {
    const b = bidBtn[n].value;
    const highBid = Math.max(...bid);
    if (b == ">") {
        if (highBid < 60)
            bidBtn[1].value = Number(bidBtn[1].value) + 1;
        else
            bidBtn[1].value = Number(bidBtn[1].value) + 5;
        bidBtn[0].value = "<";
        return;
    }
    if (b == "<") {
        if (highBid < 60)
            bidBtn[1].value = Number(bidBtn[1].value) - 1;
        else
            bidBtn[1].value = Number(bidBtn[1].value) - 5;
        if (bidBtn[1].value == nextBid())
            bidBtn[0].value = "Pass";
        return;
    }
    bidText.style.display = "none";
    logBid(b, "No reason");
    const bid0 = bid[p3] == none;                               // note if this is my first bid
    const max0 = Math.max(50, ...bid);                          // note highest bid, so far
    bid[p3] = b=="Pass"? pass : Number(b);                      // record my bid
    if (bid0 && bid[p3]>max0+1 && bid[p3]<60)                   // if I made a jump bid,
        est[p3] = (bid[p3] - max0) * 10;                            // update other's estimate of my hand
    infoBid[p3].innerHTML = bidString(p3);                      // display my bid
    notify({op:"bid", player:left(p3), bid:bid[p3]});           // notify others of my bid
    infoName[p3].style.animation = "none";                      // stop awaiting my bid
    bidder = next[bidder];                                      // advance to next bidder
    infoName[bidder].style.animation = blink;                   // await next bidder
    setTimeout(awaitBid, dealTime / 4);                         // await next bidder
}

// Hands fanned: await bidClicked, autoBid or data message then retrigger awaitBid or trigger bidDone
function awaitBid() {
    logState("awaitBid");
    infoIcon.onclick = "info('bidding')";
    while (bid[bidder] == pass) {                               // if bidder passed,
        infoName[bidder].style.animation = "none";                  // stop waitin for this bidder
        bidder = next[bidder];                                      // advance to next bidder
        infoName[bidder].style.animation = blink;                   // await the next bidder
    }
    if (nPass()==3) {                                           // if this is the last bid,
        for (const p of pArray)                                     // clear bid displays
            infoBid[p].style.display = "none";
        if (bid[bidder] == none) {                                  // if this is the bidder's first bid,
            logBid(50, "Dropped");                                      // bidder must bid 50
            bid[bidder] = 50;
        }
        if (bidder==p3 || (shift==0&&bot[bidder])) {                // if the last bidder is me or my bot,
            notify({op:"bid", player:left(bidder), bid:bid[bidder]});   // notify others of this bid
            infoName[bidder].style.animation = "none";                  // stop waiting for this bid
            setTimeout(bidDone, dealTime / 4);                          // advance to bidding done
        }
        return;
    }
    if (bidder == p3) {                                         // if bidder is p3,
        meldSpan[0].textContent = meld(p3, spades);                 // await bidClicked
        meldSpan[1].textContent = meld(p3, hearts);
        meldSpan[2].textContent = meld(p3, clubs);
        meldSpan[3].textContent = meld(p3, diamonds);
        bidBtn[0].value = "Pass";
        bidBtn[1].value = nextBid();
        bidBtn[2].value = ">";
        bidText.style.display = "flex";
        return;
    }
    if (shift==0 && bot[bidder]) {                              // if my bot is the bidder,
        const bid0 = bid[bidder] == none;                           // note if my bot's first bid
        const max0 = Math.max(50, ...bid);                          // note previous high bid
        bid[bidder] = autoBid();                                    // get my bot's bid
        if (bid0 && bid[bidder]>max0+1 && bid[bidder]<60)           // if my bot made a jump bid,
            est[bidder] = (bid[bidder] - max0) * 10;                    // update other's estimate of my bot's hand
        infoBid[bidder].innerHTML = bidString(bidder);              // display my bot's bid
        notify({op:"bid", player:left(bidder), bid:bid[bidder]});   // notify others of my bot's bid
        infoName[bidder].style.animation = "none";                  // stop waiting for my bot's bid
        bidder = next[bidder];                                      // advance to next bidder
        infoName[bidder].style.animation = blink;
        setTimeout(awaitBid, dealTime / 4);                         // await next bid
        return;
    }
}

// Hands gathered: fan hands, then trigger awaitBid
function handsGathered() {
    logState("handsGathered");
    for (let c = 0; c < deckCards; c++)
        card[c].g = hand;
    locateCards();
    for (let c = 0; c < deckCards; c++) {
        cardImg[c].style.filter = "brightness(100%)";
        if (show[hands] || card[c].p==p3)
            moveCard(c, gone, 0, hand, c, true, dealTime/10);
        else
            moveCard(c, gone, 0, hand, -c, false, dealTime/10);
    }
    bidder = next[dealer];
    infoName[bidder].style.animation = blink;
    tossO = tossE = false;
    takeO = takeE = 0;
    trump = none;
    player = none;
    for (const p of pArray) {
        minCards[p].fill(0);
        maxCards[p].fill(4);
        bid[p] = none;
        est[p] = typical;
        infoBid[p].innerHTML = bidString(p);
        infoBid[p].style.display = "inline";
    }
    remaining.fill(4);
    logHands();
    setTimeout(awaitBid, dealTime/10);
}

// Deck dealt: gather hands, then trigger handsGathered
function deckDealt() {
    logState("deckDealt");
    for (let c = 0; c < deckCards; c++)
        moveCard(c, heap, 0, gone, -c, false, dealTime/20);
    setTimeout(handsGathered, dealTime/20);
}

// Resize event: adjust dynamic sizes, then trigger immediate deck redraw
function resized() {
    setSizes();
    if (vh!=vh0 || vw!=vw0) {
        vh0 = vh;
        vw0 = vw;
        locateCards();
        for (let c=0; c<deckCards; c++)
            moveCard(c, card[c].g, 0, card[c].g, card[c].z, card[c].f, 0);
    }
}

// Deal cards: initialize variables, then deal cards and notify others
function dealCards() {
    logState("dealCards");
    const cardV = Array.from(card, (c)=>c.v);
    createPg.style.display = "none";
    joinPage.style.display = "none";
    handText.style.display = "none";
    gamePage.style.display = "block";
    infoAreas.style.display = "block";
    for (const p of pArray)
        infoName[p].textContent = name[p];
    card[0].g = heap;                                           // ensure infoName is not under heap
    locateCards();
    let d = 0;
    let p = next[dealer];
    for (let z = 0; z < deckCards; z++) {
        const c = minC[p] + Math.floor(z/players);
        moveCard(c, gone, d, heap, z, false, dealTime/20, minC[dealer], c);
        d += (dealTime - dealTime / 20) / deckCards;
        p = next[p];
    }
    playZ = -1000;
    if (shift == 0)
        notify({op:"deal", player:dealer, value:cardV, name:name, bot:bot, show:show});
    setTimeout(deckDealt, dealTime);
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
            card[c].o = teamO[card[c].p];
            card[c].v = hand[i];
            card[c].s = suit[hand[i]];
            card[c].r = rank[hand[i]];
            card[c].t = high[hand[i]];
            card[c].g = gone;
            card[c].m = false;
            card[c].z = 0;
            card[c].f = false;
            card[c].k = false;
            c++;
        }
    }
}

// Menu icon clicked: display the menu
function menuIconClicked() {
    menuText.style.display = "block";
}

// Menu close icon clicked: close the menu
function menuCloseClicked() {
    menuText.style.display = "none";
}

// Reload app menu item clicked: restart the app
function reloadClicked() {
    window.location.reload();
}

// Tutor menu item clicked: close menu and display first page of tutorial
function tutorClicked() {
    menuText.style.display = "none";
    tutorialPg = 0;
    tutorPage[tutorialPg].style.display = "block";
}

// Tutor back icon clicked: close current page and display previous page
function tutorBackClicked() {
    tutorPage[tutorialPg--].style.display = "none";
    tutorPage[tutorialPg].style.display = "block";
}

// Tutor next icon clicked: close current page and display next page
function tutorNextClicked() {
    tutorPage[tutorialPg++].style.display = "none";
    tutorPage[tutorialPg].style.display = "block";
}

// Tutor close icon clicked: close the tutor display
function tutorCloseClicked() {
    tutorPage[tutorialPg].style.display = "none";
}

// About app menu item clicked: close the app
function aboutClicked() {
    menuText.style.display = "none";
    aboutText.style.display = "block"
}

// Tutor close icon clicked: close the tutor display
function aboutCloseClicked() {
    aboutText.style.display = "none";
}

// Exit app menu item clicked: close the app
function exitClicked() {
    window.close();
}

// Trmp icon clicked: display the info
function trmpIconClicked() {
    iTrump.textContent = `Trump is ${suit$[trump]}.`;
    let i = 0;
    for (const s of sArray)
        iOutCell[i++].textContent = remaining[ace+s] - nValue(p3,ace+s);
    for (const s of sArray) {
        let q = 0;
        for (const r of rArray)
            q += remaining[r+s] - nValue(p3,r+s);
        iOutCell[i++].textContent = q;
    }
    iOutGrid.style.display = show[counts]? "grid" : "none";
    iTake.textContent = `Your take: ${takeO} of ${needO}. Their take: ${takeE} of ${needE}.`;
    iText.style.display = "flex";
}

// iClose icon clicked: close the info
function iCloseClicked() {
    iText.style.display = "none";
}

// Set option list for each name selector
function setOptions() {
    const alias = localStorage.alias? JSON.parse(localStorage.alias) : [];
    const robot = localStorage.robot? JSON.parse(localStorage.robot) : ["Bender", "Data", "Jarvis"];
    for (let p=0; p<pName.length; p++) {
        const list = p==p3||p==pj? alias : (bot[p]? robot : waiter);
        const name = pName[p].value;
        pName[p].innerHTML = "";
        const opt = document.createElement("option");
        opt.value = "";
        opt.disabled = opt.selected = opt.hidden = true;
        opt.text = "Select...";
        pName[p].appendChild(opt);
        if (p==p3 || p==pj || bot[p]) {
            pName[p].add(new Option("Add..."));
            pName[p].add(new Option("Delete..."));
            pName[p].appendChild(document.createElement("hr"));
        }
        for (const i of list)
            pName[p].add(new Option(i));
        pName[p].value = name;
    }
}

// Create button clicked: close load page, apply game settings and open create page
function createClicked() {
    logState("createPage");
    infoIcon.onclick = "info('creating')";
    name = localStorage.name? JSON.parse(localStorage.name) : name;
    bot  = localStorage.bot?  JSON.parse(localStorage.bot)  : bot;
    show = localStorage.show? JSON.parse(localStorage.show) : show;
    game = id;
    shift = 0;
    waiter.length = 0;
    createHdg.innerText = `Create Game ${websocket?id:""}`;
    for (const p of [p0, p1, p2])                               // for p0..p2,
        bot[p] = bot[p] || !websocket;                              // bot if was bot last time or is now offline
    setOptions();                                               // set option list for each name selector
    for (const p of pArray)                                     // for every player,
        if (p==p3) {                                                // if I'm the player,
            pName[p].value = name[p];                                   // default to my old name
            pIcon[p].src = humanSrc;                                    // set player icon to human
            pIcon[p].disabled = true;                                   // disallow player type change
        } else if (bot[p]) {                                        // if the player is a robot,
            pName[p].value = name[p];                                   // default to robot's old name
            pIcon[p].src = robotSrc;                                    // set player icon to robot
            pIcon[p].disabled = !websocket;                             // disallow player type change if offline
        } else {                                                    // if the player is a human who isn't me,
            pName[p].value = "";                                        // default to no name
            pIcon[p].src = humanSrc;                                    // set player icon to human
            pIcon[p].disabled = false;                                  // allow player type change
        }
    pLegend.style.visibility = bot[p0]&&bot[p1]&&bot[p2]? "hidden" : "visible";
    aBox[counts].src = show[counts]? checked : unchecked;
    aBox[hands].src = show[hands]? checked : unchecked;
    aBox[counts].disabled = aBox[hands].disabled = false;
    pAdd.style.visibility = pDel.style.visibility = "hidden";
    pDel.style.display = "none";
    loadPage.style.display = "none";
    createPg.style.display = "flex";
}

// Create close icon clicked
function createCloseClicked() {
    createPg.style.display = "none";
    loadPage.style.display = "flex";
}

// Join button clicked: recall defaults, close load page, open join page
function joinClicked() {
    logState("joinPage");
    pName[pj].value = localStorage.self? localStorage.self : "";
    pName[pj].placeholder = "";
    jGame.value = "";
    jGame.placeholder = "";
    loadPage.style.display = "none";
    joinSub.style.display = "inline";
    joinWait.style.display = "none";
    joinPage.style.display = "grid";
    pName[pj].disabled = false;
    jGame.disabled = false;
    if (pName[pj].value == "")
        pName[pj].focus();
    else
        jGame.focus();
}

// Join close icon clicked
function joinCloseClicked() {
    joinPage.style.display = "none";
    loadPage.style.display = "flex";
}

// Name for player p changed: show pAdd or pDel dialogs, if necessary
function nChanged(event, p) {

    // pAdd input keyed: if entered name, add name to list
    function pAddKeyed(event) {
        if (event.key != "Enter")
            return;
        event.preventDefault();
        const name = pAddInp.value.trim().substring(0,10);
        if (name != "")
            if (p==p3 || p==pj) {
                const alias = localStorage.alias? JSON.parse(localStorage.alias) : [];
                if (alias.indexOf(name) == none)
                    alias.push(name);
                alias.sort();
                localStorage.alias = JSON.stringify(alias);
            } else {
                const robot = localStorage.robot? JSON.parse(localStorage.robot) : ["Bender", "Data", "Jarvis"];
                if (robot.indexOf(name) == none)
                    robot.push(name);
                robot.sort();
                localStorage.robot = JSON.stringify(robot);
            }
        setOptions();
        pAddInp.removeEventListener("keydown", pAddKeyed);
        pAdd.style.visibility = "hidden";
        pName[p].value = name;
        pName[p].focus();
    }

    // pDel select changed: delete selected name from list
    function pDelChanged() {
        if (pDelSel.value != "") {
            if (p==p3 || p==pj) {
                const alias = localStorage.alias? JSON.parse(localStorage.alias) : [];
                alias.splice(alias.indexOf(pDelSel.value), 1);
                localStorage.alias = JSON.stringify(alias);
            } else {
                const robot = localStorage.robot? JSON.parse(localStorage.robot) : ["Bender", "Data", "Jarvis"];
                robot.splice(robot.indexOf(pDelSel.value), 1);
                localStorage.robot = JSON.stringify(robot);
            }
            setOptions();
            pDelSel.removeEventListener("changed", pDelChanged);
            pDel.style.visibility = "hidden";
            pName[p].value = "";
            pName[p].focus();
        }
    }

    if (event.target.value == "Add...") {
        pDel.style.display = "none";
        pAdd.style.display = "block";
        pAdd.style.visibility = "visible";
        pAddLbl.textContent = p==p3||p==pj? "New alias:" : "New bot name:";
        pAddInp.value = "";
        pAddInp.focus();
        pAddInp.addEventListener("keydown", pAddKeyed);
    } else if (event.target.value == "Delete...") {
        const alias = localStorage.alias? JSON.parse(localStorage.alias) : [];
        const robot = localStorage.robot? JSON.parse(localStorage.robot) : [];
        const list = p==p3||p==pj? alias : robot;
        pAdd.style.display = "none";
        pDel.style.display = "block";
        pDel.style.visibility = "visible";
        pDelLbl.textContent = p==p3||p==pj? "Old alias:" : "Old bot name:";
        pDelSel.innerHTML = "";
        const opt = document.createElement("option");
        opt.value = "";
        opt.disabled = opt.selected = opt.hidden = true;
        opt.text = "Select...";
        pDelSel.appendChild(opt);
        pDelSel.add(new Option("(none)"));
        pDelSel.appendChild(document.createElement("hr"));
        for (const i of list)
            pDelSel.add(new Option(i));
        pDelSel.focus();
        pDelSel.addEventListener("change", pDelChanged);
    }
}

// Create icon for player p clicked
function iClicked(event,p) {
    event.preventDefault();
    bot[p] = !bot[p];
    pIcon[p].src = bot[p]? robotSrc : humanSrc;
    pLegend.style.visibility = bot[p0]&&bot[p1]&&bot[p2]? "hidden" : "visible";
    pName[p].value = "";
}

// Create box b clicked (b=0,1 for counts,hands)
function bClicked(event, b) {
    event.preventDefault();
    show[b] = !show[b];
    aBox[b].src = show[b]? checked : unchecked;
}

// Create form submitted
function createSubmitted(event) {
    event.preventDefault();
    for (const p of pArray)
        if (!/^[A-Za-z]{2,10}$/.test(pName[p].value)) {
            pName[p].value = "";
            pName[p].placeholder = bot[p]? "2 to 10 letters" : "pick from list";
            return;
        }
    const alias = localStorage.alias? JSON.parse(localStorage.alias) : [];
    const robot = localStorage.robot? JSON.parse(localStorage.robot) : ["Bender", "Data", "Jarvis"];
    for (const p of pArray) {                                   // for each player,
        name[p] = pName[p].value;                                   // copy player name from form
        if (p==p3 && !alias.includes(name[p]))                      // if player name isn't a favorite, add it
            alias.push(name[p]);
        if (bot[p] && !robot.includes(name[p]))
            robot.push(name[p]);
    }
    alias.sort();                                               // sort favorites
    robot.sort();
    shift = 0;                                                  // I'm this game's creator
    localStorage.alias = JSON.stringify(alias);                 // update favorites and settings
    localStorage.robot = JSON.stringify(robot);
    localStorage.name = JSON.stringify(name);
    localStorage.bot = JSON.stringify(bot);
    localStorage.show = JSON.stringify(show);
    shuffleCards();
    solo = bot[p0] && bot[p1] && bot[p2];                       // solo game if other players are all bots
    setTimeout(dealCards);                                      // deal the cards
}

// Join form submitted: store form data and join game, then await deal message
function joinSubmitted(event) {
    event.preventDefault();
    if (!/^[A-Za-z]{2,10}$/.test(pName[pj].value)) {
        pName[pj].value = "";
        pName[pj].placeholder = "2 to 10 letters";
        return;
    }
    if (jGame.value.length<1 || jGame.value.length>5) {
        jGame.value = "";
        jGame.placeholder = "1 to 5 digits";
        jGame.focus();
        return;
    }
    name[p3] = pName[pj].value;                                  // copy player name from form
    game = Number(jGame.value);                                 // copy game number from form
    const alias = localStorage.alias? JSON.parse(localStorage.alias) : [];
    if (!alias.includes(name[p3]))                              // if new name,
        alias.push(name[p3]);                                       // add to alias list
    alias.sort();
    localStorage.alias = JSON.stringify(alias);                 // update alias list
    localStorage.self = name[p3];                               // save my name for next time
    websocket.send(JSON.stringify({                             // send join message
        op: "join",
        name: name[p3],
        creator: game
    }));
    pName[pj].disabled = true;
    jGame.disabled = true;
    joinSub.style.display = "none";
    joinWait.style.display = "inline";
    solo = false;
}

// Handle websocket connect calls and websocket reconnect timer
function wsConnect() {
    if (!navigator.onLine) {                                    // if client is offline,
        log(`wsConnect: navigator.onLine:${navigator.online}`);     // try again in a second
        return;
    }
    let url = "";
    if (document.location.hostname == "localhost")
        url = `ws://localhost:3000/`;
    else
        url = `wss://${document.location.hostname}/ws/`;
    url = id==none? url : url+id;                               // if is exists, append id to url
    websocket = new WebSocket(url);                             // try to create a new websocket
    websocket.onopen = wsOpen;                                  // prepare for callbacks
    websocket.onerror = wsError;
    websocket.onmessage = wsMessage;
    websocket.onclose = wsClose;
    clearInterval(wsIntervlID);                                 // clear websocket timer, if any
    wsIntervlID = setInterval(wsCheck, 1000);                   // check websocket status every second
    log(`wsConnect: url:${url}`);
}

// Handle the websocket's open event
function wsOpen(event) {
    joinBtn.disabled = false;
    log(`wsOpen:`);
}

// Handle the websocket's error event
function wsError(event) {
    log(`wsError:`);
}

// Handle the websocket's message event
function wsMessage(messageEvent) {
    const msg = JSON.parse(messageEvent.data);                  // parse the message event data
    switch (msg.op) {
    case "id":                                                  // if {op:"id", id:i},
        log(`wsMessage: op:id, id:${msg.id}`);
        id = msg.id;                                                // save id
        break;
    case "pong":                                                // if {op:"pong"}, ignore
        break;
    case "join":                                                // if {op:"join", name:n$}, (only received by creator)
        log(`wsMessage: op:join, name:${msg.name}`);
        waiter.push(msg.name);                                      // add name to waiter list
        pLegend.textContent = `Players joining: ${waiter.length}`;  // update count on create page
        break;
    case "deal":                                                // if {op:"deal", player:p, value:[v], name:[n$], bot:[f], show:[f]}
        log(`wsMessage: op:deal, player:${msg.player}, value:${msg.value}, name:${msg.name}, bot:${msg.bot}, show:${msg.show}`);
        shift = (msg.name.indexOf(name[p3]) + 1) % players;     // Players from origin (0=origin, 1=left, 2=partner, 3=right)
        dealer = right(msg.player);                                 // get dealer (shifted to the right)
        for (let c = 0; c < deckCards; c++) {                       // initialize deck from [v], offset to my perspective
            card[c].c = c;
            card[c].p = plyr[c];
            card[c].o = teamO[card[c].p];
            card[c].v = msg.value[cardLeft(c)];
            card[c].s = suit[card[c].v];
            card[c].r = rank[card[c].v];
            card[c].t = high[card[c].v];
            card[c].g = gone;
            card[c].m = false;
            card[c].z = 0;
            card[c].f = false;
            card[c].k = false;
        }
        name = left(msg.name);
        bot = left(msg.bot);
        show = msg.show;                                            // get show flags (no offset needed)
        setTimeout(dealCards);                                      // deal the cards
        break;
    case "bid":                                                 // if {op:"bid", player:p, bid:b},
        log(`wsMessage: op:bid, player:${msg.player}, bid:${msg.bid}`);
        bidder = right(msg.player);                                 // record bidder (shifted to the right)
        infoName[bidder].style.animation = "none";                  // done awaiting this bid
        const bid0 = bid[bidder] == none;                           // note if bidder's first bid
        const max0 = Math.max(50, ...bid);                          // note high bid so far
        bid[bidder] = msg.bid;                                      // record bidder's bid
        if (bid0 && bid[bidder]>max0+1 && bid[bidder]<60)           // if bidder made a jump bid,
            est[bidder] = (bid[bidder] - max0) * 10;                    // update other's estimate of bidder's hand
        infoBid[bidder].innerHTML = bidString(bidder);              // display bidder's bid
        bidder = next[bidder];                                      // advance to next bidder
        infoName[bidder].style.animation = blink;
        setTimeout(awaitBid, dealTime / 4);                         // await next bid
        break;
    case "pick":                                                // if {op:"pick", suit:s},
        log(`op:pick, suit:${msg.suit}`);
        trump = msg.suit;                                           // store trump
        infoName[bidder].style.animation = "none";                  // done awaiting pick
        setTimeout(trumpPicked);                                    // advance to trumpPicked
        break;
    case "toss":                                                // if {op:"toss"},
        log(`op:toss}`);
        tossO = teamO[bidder];                                      // note which team tossed hand
        tossE = teamE[bidder];
        ready[bidder] = true;                                       // note bidder is ready
        infoName[bidder].style.animation = "none";                  // done awaiting toss
        if (ready[p0] && ready[p1] && ready[p2] && ready[p3])       // if everyone's ready,
            setTimeout(onready);                                        // advance to next state
        break;
    case "ready":                                               // if msg {op:"ready", player:p},
        log(`op:ready, player:${msg.player}`);
        ready[right(msg.player)] = true;                            // note player (shifted to the right) is ready
        infoName[right(msg.player)].style.animation = "none";       // done awaiting ready
        if (ready[p0] && ready[p1] && ready[p2] && ready[p3])       // if everyone's ready,
            setTimeout(onready);                                        // advance to next state
        break;
    case "play":                                                // if msg {op:"play", card:c},
        log(`op:play, card:${msg.card}`);
        chosen = cardRight(msg.card);                               // note chosen card
        infoName[player].style.animation = "none";                  // done awaiting play
        setTimeout(cardChosen);                                     // advance to cardChosen
        break;
    default:                                                    // if unrecognized,
        log(`wsMessage msg:${msg}`);                                // log message
    }
}

// Handle the websocket's close event
function wsClose(closeEvent) {
    joinBtn.disabled = true;
    log(`wsClose`);
    clearInterval(wsIntervlID);                                 // stop websocket timer, if any
    wsIntervlID = setInterval(wsConnect, 1000);                 // start websocket reconnect timer
}

// Handle websocket disconnect calls
function wsDisconnect() {
    clearInterval(wsIntervlID);                                 // clear websocket timer, if any
    websocket.close();
    log(`wsDisconnect`);
}

// Handle websocket check timer
function wsCheck() {
    switch (websocket.readyState) {
        case WebSocket.CONNECTING:                              // if websocket connecting, log state
            log(`wsCheck: connecting`);
            break;
        case WebSocket.OPEN:                                    // if websocket open, ping server
            websocket.send(JSON.stringify({op:"ping"}));
            break;
        case WebSocket.CLOSING:                                 // if websocket closing, log state
            log(`wsCheck: closing`);
            break;
        case WebSocket.CLOSED:                                  // if websocket closed, log state
            log(`wsCheck: closed`);
            break;
        default:                                                // if websocket in unknown state, log state
            log(`wsCheck: readyState:${websocket.readyState}`);
    }
}

// Handle document loaded (could be after game ends)
function loaded() {
    console.clear();

    // Initialize constants
    for (const img of document.querySelectorAll("img"))
        img.draggable = false;
    setSizes();
    vh0 = vh;
    vw0 = vw;
    onresize = resized;

    // Initialize deck
    locateCards();
    for (let c=0; c<deckCards; c++) {
        cardImg[c].src = backImg[0].src;
        moveCard(c, gone, 0, gone, 0, false, 0, minC[p3], c);
    }

    // Initialize display
    trmpIcon.style.display = "none";
    nTrump.textContent = "";
    infoHint[p0].style.display = infoHint[p1].style.display = infoHint[p2].style.display = "none";
    gamePage.style.display = "none";
    loadPage.style.display = "flex";
    logState("loadPage");

    // Initialize websocket if not running from WS Code debugger
    if (location.hostname) {
        wsConnect();
    }

    /*
    // Implement proxy server for web fetches when app is offline
    if ("serviceWorker" in navigator && window.location.origin != "file://")
        navigator.serviceWorker.register("service-worker.js", {updateViaCache: "none"});
    */
}

onload = loaded;