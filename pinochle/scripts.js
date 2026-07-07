"use strict";

// Player icons
const humanSrc  = "icons/human.svg";
const robotSrc  = "icons/robot.svg";

// Player index values (or none)
const none      = -1;                                       // also used for other indices
const p0        = 0;                                        // my left opponent  (name from botList or joinList)
const p1        = 1;                                        // my partner        (name from botList or joinList)
const p2        = 2;                                        // my right opponent (name from botList or joinList)
const p3        = 3;                                        // me                (name from aliasList)
const pj        = 4;                                        // joiner            (name from aliasList)
const pg        = 5;                                        // game              (name from gameList)
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
const vArray    = [
    jack+diamonds, queen+diamonds, king+diamonds, ten+diamonds, ace+diamonds,
    jack+clubs,    queen+clubs,    king+clubs,    ten+clubs,    ace+clubs,
    jack+hearts,   queen+hearts,   king+hearts,   ten+hearts,   ace+hearts,
    jack+spades,   queen+spades,   king+spades,   ten+spades,   ace+spades
];
const value$    = ["J♦","Q♦","K♦","T♦","A♦","J♣","Q♣","K♣","T♣","A♣","J♥","Q♥","K♥","T♥","A♥","J♠","Q♠","K♠","T♠","A♠","--"];
const deckCards = 80;
const handCards = deckCards / players;
const cArray = [
    0,  1,  2,  3,  4,  5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
    60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79
];

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

// cpArray[p] = card indices assigned to player p
const cpArray = [
    [0,  1,  2,  3,  4,  5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
    [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79]
];

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
const joinGBtn  = document.getElementById("joinGBtn");
const startPage = document.getElementById("startPage");
const startCtr  = document.getElementById("startCtr");
const nameSel   = document.querySelectorAll(".nameSel");
const nameIco   = document.querySelectorAll(".nameIco");
const assistBox = document.querySelectorAll(".assistBox");
const inviteBtn = document.getElementById("inviteBtn");
const startBtn  = document.getElementById("startBtn");
const startAdd  = document.getElementById("startAdd");
const startAImg = document.getElementById("startAImg");
const startALbl = document.getElementById("startALbl");
const startAInp = document.getElementById("startAInp");
const startABtn = document.getElementById("startABtn");
const startDel  = document.getElementById("startDel");
const startDLbl = document.getElementById("startDLbl");
const startDSel = document.getElementById("startDSel");
const joinPage  = document.getElementById("joinPage");
const joinBtns  = document.getElementById("joinBtns");
const joinWait  = document.getElementById("joinWait");
const joinBtn   = document.getElementById("joinBtn");
const checkBtn  = document.getElementById("checkBtn");
const joinAImg  = document.getElementById("joinAImg");
const joinAdd   = document.getElementById("joinAdd");
const joinALbl  = document.getElementById("joinALbl");
const joinAInp  = document.getElementById("joinAInp");
const joinABtn  = document.getElementById("joinABtn");
const joinDel   = document.getElementById("joinDel");
const joinDLbl  = document.getElementById("joinDLbl");
const joinDSel  = document.getElementById("joinDSel");
const gamePage  = document.getElementById("gamePage");
const gameHelp  = document.getElementById("gameHelp");
const trumpIco  = document.getElementById("trumpIco");
const trumpOut  = document.getElementById("trumpOut");
const bidText   = document.getElementById("bidText");
const meldSpan  = document.querySelectorAll("#meldColumn span");
const bidBtn    = document.querySelectorAll("#bidBtns input");
const bidWait   = document.getElementById("bidWait");
const infoAreas = document.getElementById("infoAreas");
const infoName  = document.querySelectorAll(".infoName");
const infoBid   = document.querySelectorAll(".infoBid");
const infoHint  = document.querySelectorAll(".infoHint");
const infoChr   = document.querySelectorAll(".infoHint span");
const infoIco   = document.querySelectorAll(".infoHint img");
const trumpText = document.getElementById("trumpText");
const trumpBtn  = document.querySelectorAll("#trumpText input");
const needText  = document.getElementById("needText");
const needPara  = document.querySelectorAll("#needText p");
const okBtn     = document.getElementById("okBtn");
const playBtn   = document.getElementById("playBtn");
const tossBtn   = document.getElementById("tossBtn");
const gameText  = document.getElementById("gameText");
const handText  = document.getElementById("handText");
const handCell  = document.querySelectorAll("#handGrid div");
const handPara  = document.getElementById("handPara");
const handBtn   = document.getElementById("handBtn");
const handWait  = document.getElementById("handWait");
const spadesT   = document.getElementById("spadesT");
const heartsT   = document.getElementById("heartsT");
const clubsT    = document.getElementById("clubsT");
const diamondsT = document.getElementById("diamondsT");
const cardImg   = document.querySelectorAll("#cardImg img");
const faceImg   = document.querySelectorAll("#faceImg img");
const backImg   = document.querySelectorAll("#backImg img");
const tutorPage = document.querySelectorAll(".tutorPage");
const aboutText = document.getElementById("aboutText");
const infoText  = document.getElementById("infoText");
const infoBiddr = document.getElementById("infoBiddr");
const infoGrid  = document.getElementById("infoGrid");
const infoCell  = document.querySelectorAll("#infoGrid div");
const infoTake  = document.getElementById("infoTake");
const helpPage  = document.querySelectorAll("#helpPage div");
const netDlg    = document.getElementById("netDlg");
const debugTxt  = document.getElementById("debugTxt");

// Animation constants
const dealTime  = 2000;                                 // milliseconds to deal all cards

// ---------------------------------------Websocket Server Protocol--------------------------------------------
//
// From sender                                        In Game?  Server action
// ===========                                        ========  =============
// wsConnect(ws,req) req.url=wss://games.koyeb.app/ws/      ?   pick ws.id; reply {op:"id", id:i}
// wsConnect(ws,req) req.url=wss://games.koyeb.app/ws/i     ?   set ws.id, ws.game; reply {op:"id", id:i}
// wsClose(event)                                               set socket[ws.id] to null
//
// {op:"ping", turn:[]}                                     N   reply {op:"pong", turn:[]}
// {op:"ping", turn:[t]}                                    Y   update game; reply {op:"pong", turn:[t]}
// {op:"create", game:g}                                    N   create game; set ws.game
// {op:"list"}                                              N   reply {op:"list", game:[g]}
// {op:"join", game:g, name:n}                              N   add id; send {op:"join", name:n} to id[0]
//
// {op:"deal", name:[n], bot:[f], show:[f], value:[v]}      Y   update game; send {op:"pong", turn:[t]} to id[]
// {op:"bid", bid:b}                                        Y   update game; send {op:"pong", turn:[t]} to id[]
// {op:"declare", suit:s, toss:f}                           Y   update game; send {op:"pong", turn:[t]} to id[]
// {op:"play", card:c}                                      Y   update game; send {op:"pong", turn:[t]} to id[]
// {op:"quit", name:n}                                      Y   send {op:"quit", name:n} to others; delete game
// {op:"quit", name:n}                                      N   ignore

// Parameters                                                   Example
// ==========                                                   =======
// b = bidder's bid (none=-1, pass=0)                           bid:50
// c = card index (0 to 79) from starter's perspective          card:62
// f = flag (true, false)                                       toss:false
// g = game name (game starter's name)                          game:"Grampy"
// i = socket index                                             id:1234
// n = player name                                              name:"Grampy"
// s = suit value (diamonds=0, clubs=5, hearts=10, spades=15)   suit:0
// t = turn object                                              turn:[{op:"bid", bid:50}]
// v = card value (suit + rank=0..4 for JQKTA)                  value:[0, 0, 0, 0, ...19, 19, 19, 19]

let websocket   = null;                                         // websocket object (or null)
let id          = none;                                         // id = websocket identifier
let online      = false;                                        // true when online with a numbered connection
let msgEvents   = false;                                        // true when msg events are allowed
let done        = 0;                                            // number of turns processed
const turnOps   = ["deal", "bid", "declare", "play"];           // array of turn op codes
const turn      = [];                                           // array of turn objects

// Game variables from this player's perspective
let helpStack   = [];                                   // stack of help pages
let gameList    = [];                                   // list of game names from server
let game        = "";                                   // game name (name of starter)
let solo        = false;                                // starter is only human player
let shift       = 0;                                    // p3 is shift players left of starter
let starter     = false;                                // p3 is starter
let joinList    = [];                                   // list of players trying to join game
let name        = ["", "", "", ""];                     // name[p] = player p's name
let bot         = [false, false, false, false];         // bot[p] = player p is a bot
let show        = [false, false];                       // show[counts] and show[hands]
let card        = [                                     // card[c] = deck card c
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C
];
let dealer      = none;                                 // the player who is dealing or last dealt
let bidder      = none;                                 // the player who is bidding or won the bid
let player      = none;                                 // the player who is choosing then playing a card
let bid         = [none, none, none, none];             // bid[p] = player p's bid (or none or pass)
let est         = [typical, typical, typical, typical]; // est[p] = player p's estimated meld based on jump bids
let trump       = none;                                 // the bidder's trump suit
let toss        = false;                                // the bidder's toss decision
let ondone      = "";                                   // event to invoke after animation completes
let chosen      = none;                                 // the card number that was chosen
let leadCard    = none;                                 // the card number that was lead
let highCard    = none;                                 // the card number of the highest card so far
let meldO       = 0;                                    // team O's meld
let meldE       = 0;                                    // team E's meld
let needO       = 0;                                    // points team O needs to take in order to save
let needE       = 0;                                    // points team E needs to take in order to save
let takeO       = 0;                                    // points team O has taken so far in hand
let takeE       = 0;                                    // points team E has taken so far in hand
let scoreO      = 0;                                    // team O's total points so far in game
let scoreE      = 0;                                    // team E's total points so far in game
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
let vpad        = 0;                                    // verright(tical padding for p1 and p3 hands
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

// Send msg if mutiplayer); trigger msgEvent if solo
function sendMsg(msg) {
    if (solo)                                                   // if playing solo,
        setTimeout(msgEvent, 0, msg);                               // trigger msg event immediately
    else {                                                      // otherwise,
        if (turnOps.includes(msg.op))                               // if msg.op is a turn op,
            turn.push(msg);                                             // append msg to turn object array
        if (online)                                                 // if online,
            websocket.send(JSON.stringify(msg));                        // send message to server and await reply
    }
}

// Compare function to sort in ascending order
function up(a, b) {
    return a - b;
}

// Compare function to sort in descending order
function down(a, b) {
    return b - a;
}

// Log debugText on console (comment out when done debugging)
function log(debugText = "") {
    console.log(debugText);
}

// Return p rotated clockwise by "shift" players; if shift is 1, p0 returns p1 and [p0,p1,p2,p3] returns [p1,p2,p3,p0]
function left(p) {
    if (typeof p == "number")
        return (p + shift) % players;
    const temp = Array(p.length);
    for (let i=0; i<players; i++)
        temp[i] = p[(i + shift) % players];
    return temp;
}

// Return p rotated counter-clockwise by "shift" players; if shift is 1, p1 returns p0 and [p1,p2,p3,p0] returns [p0,p1,p2,p3]
function right(p) {
    if (typeof p == "number")
        return (p + (players-shift)) % players;
    const temp = Array(p.length);
    for (let i=0; i<players; i++)
        temp[i] = p[(i + (players-shift)) % players];
    return temp;
}

// Return card c rotated clockwise by "shift" players; if shift is 1, c0 returns c20
function cardLeft(c) {
    return (c + shift*handCards) % deckCards;
}

// Return card c rotated clockwise by "shift" players; if shift is 1, c20 returns c0
function cardRight(c) {
    return (c + (deckCards-shift*handCards)) % deckCards;
}

// Return true if the suit of card value v is trump
function trmp(v) {
    return suit[v]==trump;
}

// Return number of cards in player p's hand
function nCards(p) {
    let n = 0;
    for (const c of cpArray[p])
        if (card[c].g == hand)
            n++;
    return n;
}

// Return number of cards of value v in player p's hand
function nValue(p, v) {
    let n = 0;
    for (const c of cpArray[p])
        if (card[c].g==hand && card[c].v==v)
            n++;
    return n;
}

// Return number of cards in group g
function nGroup(g) {
    let n = 0;
    for (const c of cArray)
        if (card[c].g == g)
            n++;
    return n;
}

// Return number of cards of suit s in player p's hand
function nSuit(p, s) {
    let n = 0;
    for (const c of cpArray[p])
        if (card[c].g==hand && card[c].s==s)
            n++;
    return n;
}

// Return number of cards of rank r in player p's hand
function nRank(p, r) {
    let n = 0;
    for (const c of cpArray[p])
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
    for (const c of cpArray[p])
        if (card[c].v==v && n-->0)
            card[c].k = true;
}

// Return number of player p's known cards of value v
function nKnown(p, v) {
    let n = 0;
    for (const c of cpArray[p])
        if (card[c].k && card[c].v==v)
            n++;
    return n;
}

// Note meld/need, tag meld cards, tag known cards (to be revealed to others), and set minCards/maxCards accordingly
function tagMeld() {
    meldO = meld(p1, trump) + meld(p3, trump);
    meldE = meld(p0, trump) + meld(p2, trump);
    needO = teamE[bidder]? 20 : (meldO<20? bid[bidder] : Math.max(20,bid[bidder]-meldO));
    needE = teamO[bidder]? 20 : (meldE<20? bid[bidder] : Math.max(20,bid[bidder]-meldE));
    for (const c of cArray)
        card[c].m = card[c].s==trump;
    for (const p of pArray) {                                   // for each player,
        if ((teamO[p] && meldO<20) || (teamE[p] && meldE<20)) {     // if player's team can't keep their meld,
            if (p == bidder)                                            // if player won the bid,
                for (const r of [queen, king])                               // tag one trump marriage (if possible, to allow play)
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
        for (let v = 0; v < values; v++)                            // mincards = # tagged values
            minCards[p][v] = nKnown(p, v);
        maxCards[p].fill(4);                                        // start maxCards at 4
        for (const r of [ace, king, queen, jack]) {                 // reduce maxCards if missing a card for an around
            let minCount = 5;
            let minSuit = none;
            let minHits = 0;
            for (const s of sArray)
                if (nKnown(p,r+s) < minCount) {
                    minCount = nKnown(p,r+s);
                    minSuit = s;
                    minHits = 1;
                } else if (nKnown(p,r+s) == minCount)
                    minHits++;
            if (minHits == 1)
                maxCards[p][r+minSuit] = minCount;
        }
        for (const s of sArray)                                     // cap maxCards if missing a card for a marriage
            if (nKnown(p,queen+s) < nKnown(p,king+s))
                maxCards[p][queen+s] = Math.min(maxCards[p][queen+s], nKnown(p,queen+s));
            else if (nKnown(p,king+s) < nKnown(p,queen+s))
                maxCards[p][king+s] = Math.min(maxCards[p][king+s], nKnown(p,king+s));
        if (nKnown(p,jack+diamonds) < nKnown(p,queen+spades))       // cap maxCards if missing a card for a pinochle
            maxCards[p][jack+diamonds] = Math.min(maxCards[p][jack+diamonds], nKnown(p,jack+diamonds));
        else if (nKnown(p,queen+spades) < nKnown(p,jack+diamonds))
            maxCards[p][queen+spades] = Math.min(maxCards[p][queen+spades], nKnown(p,queen+spades));
        let minOther = 5;                                           // cap maxCards if missing a ten for a trump run
        for (const r of [ace, king, queen, jack])
            if (nKnown(p,r+trump) < minOther)
                minOther = nKnown(p,r+trump);
        if (nKnown(p,ten+trump) < minOther)
            maxCards[p][ten+trump] = Math.min(maxCards[p][ten+trump], nKnown(p,ten+trump));
    }
    for (const p of pArray)                                     // for each player,
        for (const v of vArray) {                                   // cap maxCards at minCards + loose cards        
            const loose = 4 - minCards[p0][v] - minCards[p1][v] - minCards[p2][v] - minCards[p3][v];
            maxCards[p][v] = Math.min(maxCards[p][v], minCards[p][v] + loose);
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

// Log bidder's bid, quality(bidder), minMeld(bidder), maxMeld(bidder), est[partner] and reason (returns bid)
function logBid(bid, reason) {
    const partner = next[next[bidder]];
    let t = "  ";
    t += `bid[${name[bidder][0]}]:`.padEnd(7) + `${bid==pass?"Pass":bid},`.padEnd(6);
    t += `quality(${name[bidder][0]}):${(quality(bidder)>=0?"+":"")+quality(bidder)},`.padEnd(16);
    t += `minMeld(${name[bidder][0]}):${minMeld(bidder)},`.padEnd(16);
    t += `maxMeld(${name[bidder][0]}):${maxMeld(bidder)},`.padEnd(16);
    t += `est[${name[partner][0]}]:${est[partner]},`.padEnd(12);
    t += `reason:${reason}`;
    log(t);
    return(bid);
}

// Return number of players who passed
function nPass() {
    return (bid[p0]==pass?1:0) + (bid[p1]==pass?1:0) + (bid[p2]==pass?1:0) + (bid[p3]==pass?1:0);
}

// Return true if player p has a run in his best suit
function run(p) {
    return runs(p, maxSuit(p)) > 0;
}

// Return bot's trump suit
function botSuit() {
    const partner = next[next[bidder]];
    let n = 0, t;
    if (nRank(bidder,king) + nRank(bidder,queen) == 0)          // if no kings or queens (must toss),
        for (const s of sArray) {                                   // pick suit with most aces then tens then jacks
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
    else if (noMarriages(bidder))                               // if no marriages (must toss),
        for (const s of sArray) {                                   // pick suit with most kings then queens
            if (nValue(bidder, king+s) > n) {
                n = nValue(bidder, king+s);
                t = s;
            }
            if (nValue(bidder, queen+s) > n) {
                n = nValue(bidder, queen+s);
                t = s;
            }
        }
    else if (bid[bidder]>maxMeld(bidder)+est[partner]+20 && run(bidder)) // if stretching a run,
        t = maxSuit(bidder);                                        // pick suit with most meld
    else                                                        // all other cases
        for (const s of sArray) {                                   // pick suit w/ marriage and most cards + most aces
            if (marriages(bidder,s)>0 && nSuit(bidder,s)+nValue(bidder,ace+s)>n) {
                n = nSuit(bidder,s) + nValue(bidder, ace+s);
                t = s;
            }
        }
    return t;
}

// Return bot's toss flag
function botToss() {
    const trump = botSuit();                                    // must preview trump/meld/need to know to play/toss
    const meldO = meld(p1, trump) + meld(p3, trump);
    const needO = meldO<20? bid[bidder] : Math.max(20,bid[bidder]-meldO);
    const meldE = meld(p0, trump) + meld(p2, trump);
    const needE = meldE<20? bid[bidder] : Math.max(20,bid[bidder]-meldE);
    return marriages(bidder,trump)==0 || (teamO[bidder]?needO:needE)>maxTake;
}

// Return true if card c can be chosen based on leadCard, highCard, and trump (disturbing nothing)
function legal(c) {
    if (card[c].g!=hand)                                        // c's not in hand, c's illegal
        return false;
    if (leadCard == none)                                       // If no lead card (and no high card), c's legal
        return true;
    if (!card[leadCard].m && card[highCard].m) {                // If non-trump lead was trumped, 
        if (card[c].s == card[leadCard].s)                          // if c follows the lead, c's legal
            return true;
        for (const i of cpArray[card[c].p])                         // if player can follow but doesn't, c's illegal
            if (card[i].g==hand && card[i].s==card[leadCard].s)
                return false;
        if (card[c].m && card[c].r>card[highCard].r)                // if player overtrumps, c's legal
            return true;
        for (const i of cpArray[card[c].p])                         // if player can overtrump but doesn't, c's illegal
            if (card[i].g==hand && card[i].m && card[i].r>card[highCard].r)
                return false;
        if (card[c].m)                                              // if c's trump, c's legal
            return true;
        for (const i of cpArray[card[c].p])                         // if player can trump but doesn't, c's illegal
            if (card[i].g==hand && card[i].m)
                return false;
    } else {                                                    // If trump was lead or high card isn't trump,
        if (card[c].s==card[leadCard].s && card[c].r>card[highCard].r) // if c follows lead and beats high, c's legal
            return true;
        for (const i of cpArray[card[c].p])                         // if player can follow lead & beat high but doesn't, c's illegal
            if (card[i].g==hand && card[i].s==card[leadCard].s && card[i].r>card[highCard].r)
                return false;
        if (card[c].s == card[leadCard].s)                          // if c follows lead, c's legal
            return true;
        for (const i of cpArray[card[c].p])                         // if player can follow lead but doesn't, c's illegal
            if (card[i].g==hand && card[i].s==card[leadCard].s)
                return false;
        if (card[c].m)                                              // if card is (first) trump, c's legal
            return true;
        for (const i of cpArray[card[c].p])                         // if player can trump but doesn't, c's illegal
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
        t = `  ${name[p][0]}:`;
        for (const c of cpArray[p])
            t += card[c].g==hand? ` ${value$[card[c].v]}` : ` --`;
        log(t);
    }
}

// log stats on console
function logStats() {
    let t = "";
    log("     J♦ Q♦ K♦ T♦ A♦ J♣ Q♣ K♣ T♣ A♣ J♥ Q♥ K♥ T♥ A♥ J♠ Q♠ K♠ T♠ A♠");
    for (const p of pArray) {
        t = `  ${name[p][0]}:`;
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
        trumpOut.textContent = n;
        for (const p of [p0, p1, p2]) {
            for (const s of sArray) {
                n = 0;
                for (const r of rArray)
                    n += capMaxCards(p, r+s, p3);
                if (n==0)                                                   // if no cards in suit, display "X"
                    infoChr[i++].innerHTML = "X";
                else if (minCards[p][ace+s]>0)                              // otherwise, if ace in suit, display "A"
                    infoChr[i++].innerHTML = "A";
                else if (capMaxCards(p,ace+s,p3)==0)                        // otherwise, if no ace in suit, display "↓"
                    infoChr[i++].innerHTML = "&#129031;";
                else                                                        // otherwise, display "?"
                    infoChr[i++].innerHTML = "?";
            }
            infoHint[p].style.display = nCards(p)>0? "inline" : "none";
        }
    } else {
        trumpOut.textContent = "";
        infoHint[p0].style.display = infoHint[p1].style.display = infoHint[p2].style.display = "none";
    }
}

// Get plausible card values cardV given other players' unknown cards
function getPlausible(cardV) {

    // Cap known cards based on minCards (in case a known card was chosen rather than an unknown card)
    for (const p of pArray)
        for (let v = 0; v < values; v++) {
            let nMin = minCards[p][v];
            for (const c of cpArray[p])
                if (card[c].g==hand && card[c].v==v && card[c].k)
                    if (nMin > 0)
                        nMin--;
                    else
                        card[c].k = false;
        }

    // Make list of unknown cards in other players' hands
    const unknown = Array(deckCards).fill(0);
    let u = 0;
    for (const c of cArray)
        if (card[c].g==hand && card[c].p!=player && !card[c].k)
            unknown[u++] = card[c].v;

    // Until compliant: shuffle list, fill in cardV, and test for compliance
    nextTry: do {
        shuffleArray(unknown, u);
        u = 0;
        for (const c of cArray)
            if (card[c].g==hand && card[c].p!=player && !card[c].k)
                cardV[c] = unknown[u++];
            else
                cardV[c] = card[c].g==gone? absent : card[c].v;
        for (const p of pArray)
            for (let v = 0; v < values; v++) {
                let nV = 0;
                for (const c of cpArray[p])
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
    nextC: for (const c of cpArray[p]) {                        // For all of player p's cards,
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
                        for (const c of cpArray[p])                    // if p can follow the lead, c's no good
                            if (suit[v[c]] == sl)
                                continue nextC;
                        if (!tc || rc<=rh) {                                        // if c doesn't overtrump,
                            for (const c of cpArray[p])                    // if p can overtrump, c's no good
                                if (trmp(v[c]) && v[c]>vh)
                                    continue nextC;
                            if (!tc)                                                    // if c's not trump,
                                for (const c of cpArray[p])                    // if p can trump, c's no good
                                    if (trmp(v[c]))
                                        continue nextC;
                        }
                    }
                } else {                                                    // if lead suit is trump or high suit isn't trump,
                    if (sc!=sl || rc<=rh) {                                     // if c doesn't follow lead or doesn't beats high,
                        for (const c of cpArray[p])                    // if p can follow lead & beat high, c's no good
                            if (suit[v[c]]==sl && v[c]>vh)
                                continue nextC;
                        if (sc != sl) {                                             // if c doesn't follow lead,
                            for (const c of cpArray[p])                    // if p can follow lead, c's no good
                                if (suit[v[c]] == sl)
                                    continue nextC;
                            if (!tc)                                                    // if c's not trump,
                                for (const c of cpArray[p])                    // if p cam trump, c's no good
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
function botCard() {
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
        for (const c of cArray)
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
    let s = `  ${cycles.toLocaleString()} cycles`;
    for (const i of cArray)
        if (results[i].n / cycles > 0.01)
            s += `, ` + `${Math.round(results[i].n/cycles*100)}%` + ` ${value$[card[results[i].c].v]}`;
    log(s);
    return results[0].c;
}

// Relocate cards and p0/p2 infoName, infoBid and infoHint
function relocate() {
    const r0 = [+Math.PI/2, +Math.PI/2, -Math.PI/2, -Math.PI/2][dealer] ?? 0;
    const r1 = [0,          0,          0,          0         ][dealer] ?? 0;
    const r2 = [+Math.PI/2, -Math.PI/2, -Math.PI/2, +Math.PI/2][dealer] ?? 0;
    const r3 = [+Math.PI,   0,          -Math.PI,   0         ][dealer] ?? 0;
    const maxY = [vh*0.475, 0, vh*0.475, 0];
    let n = 0;                                                  // n = number of semi-exposed cards
    let v = 0;                                                  // v = visible card number
    for (const c of cArray) {
        const p = card[c].p;
        if (c == cpArray[p][0]) {
            n = -1;
            for (const c of cpArray[p])
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
    for (const c of cArray) {
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

// Set option list for each name selector
function setNameSelOptions() {
    const aliasList = localStorage.aliasList? JSON.parse(localStorage.aliasList) : [];
    const botList = localStorage.botList? JSON.parse(localStorage.botList) : [];
    for (let p=0; p<nameSel.length; p++) {
        const list = p==pg? gameList : (p==p3||p==pj? aliasList : (bot[p]? botList : joinList));
        const name = nameSel[p].value;
        nameSel[p].innerHTML = "";
        const opt = document.createElement("option");
        opt.disabled = opt.selected = opt.hidden = true;
        opt.text = "Select...";
        nameSel[p].appendChild(opt);
        if (p==p3 || p==pj || bot[p]) {
            nameSel[p].add(new Option("(add)"));
            if (list.length > 0)
                nameSel[p].add(new Option("(delete)"));
        }
        for (const i of list)
            nameSel[p].add(new Option(i));
        nameSel[p].value = name;
    }
}

// Update everyone's estimate of bidder's meld if jump bid
function updateEst(newBid) {
    const max0 = Math.max(50, ...bid);                          // note high bid so far
    if (bid[bidder]==none && newBid>max0+1 && newBid<60)        // if jump bid,
        est[bidder] = (newBid - max0) * 10;                         // adjust everyone's estimate of bidder's meld
}

/////////////////////////////////////////////////////////////
//                     EVENT HANDLERS                      //
/////////////////////////////////////////////////////////////

// If user confirms: send quitMsg, close app, and, if close fails, reload app
function appCloseEvent() {
    if (confirm(`Terminate the game?`)) {
        sendMsg({op:"quit", name:name[p3]});
        window.close();
        location.reload();
    }
}

// Hide current helpPage (if any); display new helpPage topic
function helpEvent(topic) {
    for (const div of helpPage)
        if (div.id == topic) {
            if (helpStack.length)
                helpStack.at(-1).style.display = "none";
            div.style.display = "block";
            helpStack.push(div);
            break;
        }
}

// Pop and hide current helpPage, then display previous helpPage
function helpCloseEvent() {
    if (helpStack.length > 0)
        helpStack.pop().style.display = "none";
    if (helpStack.length > 0)
        helpStack.at(-1).style.display = "block";
}

// Display infoText
function infoEvent() {
    infoBiddr.textContent = `${name[bidder]} won bid.`;
    let i = 0;
    for (const s of sArray)
        infoCell[i++].textContent = remaining[ace+s] - nValue(p3,ace+s);
    for (const s of sArray) {
        let q = 0;
        for (const r of rArray)
            q += remaining[r+s] - nValue(p3,r+s);
        infoCell[i++].textContent = q;
    }
    infoGrid.style.display = show[counts]? "grid" : "none";
    infoTake.textContent = `Your take: ${takeO} of ${needO}. Their take: ${takeE} of ${needE}.`;
    infoText.style.display = "flex";
}

// Clear infoText
function infoCloseEvent() {
    infoText.style.display = "none";
}

// Display "waiting"; advance dealer; restart app(game over); send dealMsg(my/my bot's deal); await dealMsgEvent  
function handBtnEvent() {
    handBtn.style.display = "none";                             // replace handBtn with handWait
    handWait.style.display = "inline";
    dealer = next[dealer];                                      // advance dealer
    if (takeO==50 || takeE==50 || scoreO>=500 || scoreE>=500)   // if game is over,
        loadEvent();                                                // reload game
    else if (dealer==p3 || starter&&bot[dealer]) {              // if I'm the new dealer or my bot's the new dealer,
        let v = Array(deckCards).fill(0).map((v,i,a)=>i%handCards); // send a new dealMsg
        shuffleArray(v, deckCards);
        v = [...v.slice(0,20).sort(down), ...v.slice(20,40).sort(down), ...v.slice(40,60).sort(down), ...v.slice(60,80).sort(down)];
        sendMsg({op:"deal", name:right(name), bot:right(bot), show:show, value:v});
    }                                                           // await dealMsg event
    msgEvents = true;                                           // allow msg events
    nextMsg();                                                  // trigger next pending msg
}

// Display handText, defer any dealMsg, then await handBtnEvent
function handEndedEvent() {
    const tossO = teamO[bidder] && toss;
    const tossE = teamE[bidder] && toss;
    const bidO = Math.max(bid[p1], bid[p3]);
    const bidE = Math.max(bid[p0], bid[p2]);
    relocate();
    handCell[4].innerHTML = scoreO;
    handCell[5].innerHTML = scoreE;
    handCell[7].innerHTML = teamO[bidder]? bidO : "Pass";
    handCell[8].innerHTML = teamE[bidder]? bidE : "Pass";
    handCell[10].innerHTML = meldO<20||(!tossE&&takeO<20)||(teamO[bidder]&&meldO+takeO<bidO)? `<s>&nbsp;${meldO}&nbsp;</s>` : meldO;
    meldO = meldO<20||(!tossE&&takeO<20)? 0 : meldO;
    handCell[11].innerHTML = meldE<20||(!tossO&&takeE<20)||(teamE[bidder]&&meldE+takeE<bidE)? `<s>&nbsp;${meldE}&nbsp;</s>` : meldE;
    meldE = meldE<20||(!tossO&&takeE<20)? 0 : meldE;
    handCell[13].innerHTML = takeO>0&&(takeO<20||(teamO[bidder]&&meldO+takeO<bidO))? `<u><s>&nbsp;${takeO}&nbsp;</s></u>` : `<u>${takeO}</u>`;
    takeO = takeO<20? 0 : takeO;
    handCell[14].innerHTML = takeE>0&&(takeE<20||(teamE[bidder]&&meldE+takeE<bidE))? `<u><s>&nbsp;${takeE}&nbsp;</s></u>` : `<u>${takeE}</u>`;
    takeE = takeE<20? 0 : takeE;
    scoreO += teamO[bidder]&&meldO+takeO<bidO? -bidO : meldO+takeO;
    scoreE += teamE[bidder]&&meldE+takeE<bidE? -bidE : meldE+takeE;
    handCell[16].innerHTML = scoreO;
    handCell[17].innerHTML = scoreE;
    if (takeE==50 || (scoreE>=500 && scoreO<500) || (scoreO>=500 && scoreE>=500 && teamE[bidder]))
        handPara.textContent = `Boohoo! You lose!`;
    else if (takeO==50 || (scoreO>=500 && scoreE<500) || (scoreO>=500 && scoreE>=500 && teamO[bidder]))
        handPara.textContent = `Woohoo! You win!`;
    else
        handPara.textContent = `${name[next[dealer]]} deals next.`;
    handBtn.style.display = "inline";
    handWait.style.display = "none";
    handText.style.display = "block";
    msgEvents = false;                                          // defer msg events until OK'd
}

// Pull trick; if cards, set player then await refannedEvent; if no cards, award bonus then await handEndedEvent
function trickViewedEvent() {
    for (const c of cArray)
        if (card[c].g == play)
            moveCard(c, play, 0, gone, 100, false, dealTime/10, c, cpArray[card[highCard].p][0]);
    if (nGroup(hand) > 0) {
        player = card[highCard].p;
        chosen = leadCard = highCard = none;
        setTimeout(refannedEvent, dealTime/10);
    } else {
        takeO += card[highCard].o? 2 : 0;
        takeE += !card[highCard].o? 2 : 0;
        trumpIco.style.display = "none";
        trumpOut.textContent = "";
        infoHint[p0].style.display = infoHint[p1].style.display = infoHint[p2].style.display = "none";
        setTimeout(handEndedEvent, dealTime/10);
    }
}

// Update take, then await trickViewedEvent
function trickPlayedEvent() {
    for (const c of cArray) {
        takeO += card[c].g==play && card[c].t && card[highCard].o? 1 : 0;
        takeE += card[c].g==play && card[c].t && !card[highCard].o? 1 : 0;
    }
    setTimeout(trickViewedEvent, dealTime/4);
}

// Close hand, advance player, then await trickPlayedEvent(all played) or refannedEvent
function cardPlayedEvent() {
    relocate();
    for (const c of cpArray[player])
        moveCard(c, card[c].g, 0, card[c].g, card[c].z, card[c].f, 0);
    player = next[player];
    if (nGroup(play) == players)
        setTimeout(trickPlayedEvent, 100);
    else
        setTimeout(refannedEvent, 100);
}

// Clear gameText, note chosen card, update stats, play chosen card(!p3), then await cardPlayedEvent
function playMsgEvent(msg) {
    gameText.textContent = ``;
    chosen = cardRight(msg.card);
    log(`(${name[player]}) op:play, card:${value$[card[chosen].v]}`);
    // if chosen card is in high suit and doesn't beat non-ace high card, player must not have any cards that can beat the high card 
    if (highCard!=none && card[chosen].s==card[highCard].s && card[highCard].r!=ace && card[chosen].r<=card[highCard].r)
        for (let v = card[highCard].v+1; v<=ace+card[highCard].s; v++)
            maxCards[player][v] = 0;
    // if no lead card, chosen card must be the lead card and the high card
    if (leadCard == none)
        leadCard = highCard = chosen;
    // if chosen card is in trump and trump wasn't led, player must be out of the first suit
    if (card[chosen].m && !card[leadCard].m)
        for (let v = jack+card[leadCard].s; v <= ace+card[leadCard].s; v++)
            maxCards[player][v] = 0;
    // if chosen card is in high suit and beats high card, we have a new high card
    if (card[chosen].s==card[highCard].s && card[chosen].r>card[highCard].r)
        highCard = chosen;
    // if chosen card is in trump and the high suit isn't trump, we have a new high card
    if (card[chosen].m && !card[highCard].m)
        highCard = chosen;
    // if chosen card doesn't follow the lead and isn't trump, player must be out of lead suit and trump
    if (card[chosen].s!=card[leadCard].s && !card[chosen].m)
        for (const r of rArray)
            maxCards[player][r+card[leadCard].s] = maxCards[player][r+trump] = 0;
    remaining[card[chosen].v]--;
    minCards[player][card[chosen].v] = Math.max(minCards[player][card[chosen].v] - 1, 0);
    let loose = remaining[card[chosen].v]
    for (const p of pArray)
        loose -= minCards[p][card[chosen].v];
    for (const p of pArray)
        maxCards[p][card[chosen].v] = Math.min(maxCards[p][card[chosen].v], minCards[p][card[chosen].v] + loose);
    if (player != p3)
        moveCard(chosen, card[chosen].g, 0, play, playZ++, true, dealTime/10);
    setTimeout(cardPlayedEvent, dealTime/10);
}

// Select card
function pointerDownEvent(event) {
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

// Drag card
function pointerMoveEvent(event) {
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

// If click or big move to center, move card to center, send playMsg; otherwise return card to hand
function pointerUpEvent(event) {
    const deltaY = card[pickedC].hand.y - (event.clientY - offsetY);
    event.preventDefault();
    if (pickedC && pickedE) {
        if (deltaY==0 || deltaY>cardh/2) {
            card[pickedC].g = play;
            cardImg[pickedC].style.zIndex = card[pickedC].z = playZ++;
            strt = fnsh;
            fnsh = `translate(${card[pickedC].play.x}px, ${card[pickedC].play.y}px)`;
            pickedE.animate([{transform:strt}, {transform:fnsh}], {duration:dealTime/10, fill:"forwards"});
            for (const c of cpArray[p3]) {
                cardImg[c].onpointerdown = cardImg[c].onpointermove = cardImg[c].onpointerup = "";
                cardImg[c].style.filter = card[c].g==hand? "brightness(70%)" : "brightness(100%)";
            }
            sendMsg({op:"play", card:cardLeft(pickedC)});
        } else {
            strt = fnsh;
            fnsh = `translate(${card[pickedC].hand.x}px, ${card[pickedC].hand.y}px)`;
            pickedE.animate([{transform:strt}, {transform:fnsh}], {duration:dealTime/10, fill:"forwards"});
        }
        pickedE = null;
    }
}

// If my bot, choose card & send playMsg, then await pointerDown/pointerMove/pointerDown/playMsg events
function refannedEvent() {
    gameHelp.onclick = function () {helpEvent('playHelp')};
    showHints();
    gameText.textContent = nGroup(play)==0? `Waiting for ${player==p3?"you":name[player]}.` : ``;
    for (const c of cpArray[p3]) {
        if (player>=nGroup(play) && card[c].g==hand)
            cardImg[c].style.filter = `brightness(${legal(c)?"100%":"70%"})`;
        if (player==p3 && legal(c)) {
            cardImg[c].onpointerdown = pointerDownEvent;
            cardImg[c].onpointermove = pointerMoveEvent;
            cardImg[c].onpointerup = pointerUpEvent;
        }
    }
    if (starter && bot[player]) {
        chosen = botCard();
        sendMsg({op:"play", card:cardLeft(chosen)});
    }
    msgEvents = true;                                           // allow msg events
    nextMsg();                                                  // trigger next pending msg
}

// Refan hands, then await refannedEvent
function meldGatheredEvent() {
    for (const c of cArray) {
        cardImg[c].style.filter = card[c].p==p3? "brightness(70%)" : "brightness(100%)";
        card[c].g = hand;
    }
    relocate();
    for (const c of cArray)
        if (show[hands] || card[c].p==p3)
            moveCard(c, gone, 0, hand, c, true, dealTime/10);
        else
            moveCard(c, gone, 0, hand, -c, false, dealTime/10);
    for (const p of pArray)
        infoBid[p].style.display = "none";
    trumpIco.src = suitSrc[trump];
    trumpIco.style.display = "block";
    setTimeout(refannedEvent, dealTime/10);
}

// Clear needText, brighten/gather meld, then await handEndedEvent(toss) or meldGatheredEvent(!toss)
function okBtnEvent() {
    needText.style.display = "none";                            // clear play text
    for (const c of cArray) {                                   // brighten and gather meld cards
        cardImg[c].style.filter = "brightness(100%)";
        moveCard(c, hand, 0, gone, -c, false, dealTime/10);
    }
    if (toss)                                                   // if toss,
        setTimeout(handEndedEvent, dealTime/10);                    // await handEnded event
    else                                                        // otherwise,
        setTimeout(meldGatheredEvent, dealTime/10);                 // await meldGathered event
}

// Send declareMsg, clear needText, brighten/gather meld, then await meldGatheredEvent
function playBtnEvent() {
    sendMsg({op:"declare", suit:trump, toss:false});            // declare trump suit and toss flag
    needText.style.display = "none";                            // clear play text
    for (const c of cArray) {                                   // brighten and gather meld cards
        cardImg[c].style.filter = "brightness(100%)";
        moveCard(c, hand, 0, gone, -c, false, dealTime/10);
    }
    setTimeout(meldGatheredEvent, dealTime/10);                 // await meldGathered event
}

// Send declareMsg, clear needText, brighten/gather meld, then await handEndedEvent
function tossBtnEvent() {
    sendMsg({op:"declare", suit:trump, toss:true});
    needText.style.display = "none";
    for (const c of cArray) {
        cardImg[c].style.filter = "brightness(100%)";
        moveCard(c, hand, 0, gone, -c, false, dealTime/10);
    }
    setTimeout(handEndedEvent, dealTime/10);
}

// Display needText, then await okBtnEvent(!p3), playBtnEvent(p3) or tossBtnEvent(p3)
function meldFannedEvent() {
    needPara[0].innerHTML = `${bidder==p3?"You":name[bidder]} picked ${suit$[trump]}.`;
    needPara[1].innerHTML = `Your meld is ${meldO<20?"<20":meldO}.<br>Their meld is ${meldE<20?"<20":meldE}.`;
    if (marriages(bidder,trump)==0)
        needPara[2].innerHTML = `${bidder==p3?"You must toss":name[bidder]+" tossed"} due to no marriage.`;
    else if (toss)
        needPara[2].innerHTML = `${name[bidder]} tossed the hand.`;
    else
        needPara[2].innerHTML = `You need ${needO} points.<br>They need ${needE} points.`;
    okBtn.style.display = bidder!=p3? "inline" : "none";
    playBtn.style.display = bidder==p3 && marriages(p3,trump)!=0? "inline" : "none";
    tossBtn.style.display = bidder==p3? "inline" : "none";
    needText.style.display = "flex";
    gameHelp.onclick = function () {helpEvent('tossHelp')};
}

// Dim/display meld, then await meldFanned event
function regatheredEvent() {
    for (const c of cArray)                                     // group p3 and known cards into players' hands
        card[c].g = card[c].p==p3 || card[c].k? hand : gone;
    relocate();                                                 // reset card and info text locations
    for (const c of cArray) {                                   // dim unknown cards and move cards to their new locations
        cardImg[c].style.filter = card[c].k? "brightness(100%)" : "brightness(70%)";
        moveCard(c, gone, 0, card[c].g, c, true, dealTime/10);
    }
    setTimeout(meldFannedEvent, dealTime/10);                   // await meldFanned event
}

// Set trump/toss, tag meld, and, if I'm not the bid winner, clear bid text, gather hands then await regathered event
function declareMsgEvent(msg) {
    if (bidder != p3)                                           // if I didn't win the bid,
        msgEvents = false;                                          // defer msg events until OK'd
    log(`(${name[bidder]}) op:declare, suit:${suit$[msg.suit]}, toss:${msg.toss}`);
    trump = msg.suit;                                           // set trump suit and toss flag
    toss = msg.toss;
    if (bidder != p3) {                                         // if bid winner isn't me,
        tagMeld();                                                  // tag the meld cards
        bidText.style.display = "none";                             // clear bid text
        for (const c of cArray)                                     // gather hands
            moveCard(c, hand, 0, gone, -c, false, dealTime/10);
        setTimeout(regatheredEvent, dealTime/10);                   // await regathered event
    }
}

// Set trump, tag meld, clear trumpText, gather hands, then await regathered event
function trumpBtnEvent(s) {
    trump = s;
    tagMeld();
    trumpText.style.display = "none";
    for (const c of cArray)
        moveCard(c, hand, 0, gone, -c, false, dealTime/10);
    setTimeout(regatheredEvent, dealTime/10);
}

// Note bid, advance bidder, then retrigger fannedEvent
function bidMsgEvent(msg) {
    log(`(${name[bidder]}) op:bid, bid:${msg.bid==pass?"Pass":msg.bid}`);
    updateEst(msg.bid);
    bid[bidder] = msg.bid;
    infoBid[bidder].innerHTML = bidString(bidder);
    bidder = next[bidder];
    setTimeout(fannedEvent);
}

// Adjust bid values, or send bidMsg and await bidMsg or declareMsg
function bidBtnEvent(n) {
    const v = bidBtn[n].value;
    const highBid = Math.max(...bid);
    switch (v) {
    case ">":
        bidBtn[1].value = Number(bidBtn[1].value) + (highBid<60?1:5);
        bidBtn[0].value = "<";
        break;
    case "<": 
        bidBtn[1].value = Number(bidBtn[1].value) - (highBid<60?1:5);
        bidBtn[0].value = bidBtn[1].value==nextBid()? "Pass" : bidBtn[0].value;
        break;
    default:
        const b = v=="Pass"? pass : Number(v);
        logBid(b, "Undisclosed");
        sendMsg({op:"bid", bid:b});
        msgEvents = true;                                           // allow msg events
        nextMsg();                                                  // trigger next pending msg events
    }
}

// Send my bot's next bidMsg then await bidMsg or declareMsg
function botBidEvent() {
    const lefty   = next[bidder];
    const partner = next[lefty];
    const right   = next[partner];
    const highBid = Math.max(...bid);
    const maxBid  = maxMeld(bidder) + est[partner] + 20 + quality(bidder);
    let b = bid[bidder];
    if (b == pass)
        b = logBid(pass, "Repeat");
    else
        if (nPass() == 3)
            b = logBid(Math.max(b, 50), "Last bid");
        else if (noMarriages(bidder))
            b = logBid(pass, "No marriage");
        else if (bid[lefty]==none && bid[right]!=pass && highBid<60 && quality(bidder)>0 && maxBid>=60)
            b = logBid(60, "Block bid");
        else if (b==none && bid[partner]!=pass && highBid<58 && minMeld(bidder)>15)
            b = logBid(Math.min(Math.max(50, ...bid) + Math.round(minMeld(bidder)/10), 59), "Jump bid");
        else if (highBid<60 && quality(bidder)>=0 && maxBid>=60 && maxBid<70)
            b = logBid(60, "Worried");
        else if (quality(bidder)>=0 && nextBid() <= maxBid)
            b = logBid(nextBid(), "Want bid");
        else if (highBid<50 && partner==dealer)
            b = logBid(50, "Save");
        else if (quality(bidder) < 0)
            b = logBid(pass, "Bad quality");
        else
            b = logBid(pass, "Too high");
    sendMsg({op:"bid", bid:b});
    msgEvents = true;                                           // allow msg events
    nextMsg();                                                  // trigger next pending msg events
}

// Display bidText, handle situation, then await trumpBtn, declareMsg, botBid, bidBtn or bidMsg event
function fannedEvent() {
    if (nPass() == 3)                                           // if others passed, bidder is the remaining player
        for (bidder of pArray)
            if (bid[bidder] != pass)
                break;
    meldSpan[0].textContent = meld(p3, spades);                 // display bidText
    meldSpan[1].textContent = meld(p3, hearts);
    meldSpan[2].textContent = meld(p3, clubs);
    meldSpan[3].textContent = meld(p3, diamonds);
    bidBtn[0].value = "Pass";
    bidBtn[0].style.display = bidder==p3 && nPass()<3? "inline" : "none";
    bidBtn[1].value = nextBid();
    bidBtn[1].style.display = bidder==p3? "inline" : "none";
    bidBtn[2].value = ">";
    bidBtn[2].style.display = bidder==p3 && nPass()<3? "inline" : "none";
    bidWait.textContent = `Waiting for ${name[bidder]}.`;
    bidWait.style.display = bidder!=p3? "inline" : "none";
    bidText.style.display = "flex";
    if (nPass()==3 && bid[bidder]!=none) {                      // if bidding is complete,
        for (bidder of pArray)                                      // find bid winner
            if (bid[bidder] > pass)
                break;
        player = bidder;                                            // first player will be the bid winner
        toss = false;                                               // hand is not tossed yet
        if (bidder == p3) {                                         // if I won the bid,
            bidText.style.display = "none";                             // clear bid text
            trumpBtn[0].value = `Spades (${meld(p3, spades)})`;         // display trump text and await trumpBtnEvent
            trumpBtn[1].value = `Hearts (${meld(p3, hearts)})`;
            trumpBtn[2].value = `Clubs (${meld(p3, clubs)})`;
            trumpBtn[3].value = `Diamonds (${meld(p3, diamonds)})`;
            trumpBtn[0].disabled = marriages(p3,spades)==0 && !noMarriages(bidder);
            trumpBtn[1].disabled = marriages(p3,hearts)==0 && !noMarriages(bidder);
            trumpBtn[2].disabled = marriages(p3,clubs)==0 && !noMarriages(bidder);
            trumpBtn[3].disabled = marriages(p3,diamonds)==0 && !noMarriages(bidder);
            trumpText.style.display = "flex";
            gameHelp.onclick = function () {helpEvent('trumpHelp')};
        } else if (starter && bot[bidder])                          // otherwise, if my bot won the bid,
            sendMsg({op:"declare", suit:botSuit(), toss:botToss()});    // send my bot's declareMsg
        else                                                        // otherwise,
            bidWait.textContent = `Waiting for ${name[bidder]}.`;       // await declareMsgEvent
    } else if (bidder==p3 && bid[p3]==pass) {                   // otherwise, if it's my bid and I've already passed,
        logBid(pass, "Repeat");                                     // pass again
        sendMsg({op:"bid", bid:pass});                              // resend my bidMsg
    } else if (starter && bot[bidder]) {                        // otherwise, if it's my bot's bid,
        setTimeout(botBidEvent, bid[bidder]==pass?0:dealTime/4);    // await botBidEvent (quick if repeat pass)
        return;                                                     // defer msg events until my bot bids
    }                                                           // otherwise, await bidBtnEvent or bidMsgEvent
    msgEvents = true;                                           // allow msg events
    nextMsg();                                                  // trigger next pending msg events
}

// relocate hands and infoAreas, fan hands, then await fannedEvent
function gatheredEvent() {
    for (const c of cArray)
        card[c].g = hand;
    relocate();
    for (const c of cArray)
        if (show[hands] || card[c].p==p3)
            moveCard(c, gone, 0, hand, c, true, dealTime/10);
        else
            moveCard(c, gone, 0, hand, -c, false, dealTime/10);
    setTimeout(fannedEvent, dealTime/10);
}

// Gather hands, then await gatheredEvent
function dealtEvent() {
    for (const c of cArray)
        moveCard(c, heap, 0, gone, -c, false, dealTime/20);
    setTimeout(gatheredEvent, dealTime/20);
}

// Initialize hands, clear pages, display gamePage, deal cards, then await dealtEvent
function dealMsgEvent(msg) {
    if (msg.name[p3] == name[p3])                               // set shift based on position of my name in msg.name
        shift = 0;
    else if (msg.name[p2] == name[p3])
        shift = 3;
    else if (msg.name[p1] == name[p3])
        shift = 2;
    else
        shift = 1;
    if (dealer == none)                                         // if dealer is unknown,
        dealer = right(p3);                                         // dealer is shift positions to my right
    starter = shift==0;                                         // I'm the starter if shift is 0
    log(`(${name[dealer]}) op:deal, name:[${msg.name}], bot:[${msg.bot}], show:[${msg.show}], value:[...]`);
    //shift = (msg.name.indexOf(name[p3])+1) % players;           // shift is number of players left of starter
    for (const c of cArray) {                                   // deck is from msg.value, offset to my perspective
        card[c].c = c;
        card[c].p = plyr[c];
        card[c].o = teamO[card[c].p];
        card[c].v = msg.value[cardLeft(c)];
        card[c].s = suit[card[c].v];
        card[c].r = rank[card[c].v];
        card[c].t = high[card[c].v];
        card[c].g = hand;
        card[c].m = false;
        card[c].z = 0;
        card[c].f = false;
        card[c].k = false;
        cardImg[c].style.filter = "brightness(100%)";
    }
    name = left(msg.name);                                      // name array is from msg.name, offset to my perspective
    bot = left(msg.bot);                                        // bot array if from msg.bot, offset to my perspective
    show = msg.show;                                            // show array is from msg.show
    bidder = next[dealer];                                      // bidder is left of dealer
    bid.fill(none);                                             // no bids yet
    est.fill(typical)                                           // no jump bids yet
    remaining.fill(4);                                          // no cards played
    chosen = leadCard = highCard = none;                        // no chosen, lead or high card yet
    takeO = takeE = 0;                                          // no take yet;
    logHands();
    startPage.style.display = "none";
    joinPage.style.display = "none";
    gamePage.style.display = "block";
    handText.style.display = "none";
    for (const p of pArray) {
        infoBid[p].innerHTML = "";
        infoBid[p].style.display = "inline";
        infoName[p].textContent = name[p];
    }
    infoAreas.style.display = "block";
    card[0].g = heap;                                           // ensure infoName is not under heap
    relocate();
    let d = 0;
    let p = next[dealer];
    for (const z of cArray) {
        const c = cpArray[p][0] + Math.floor(z/players);
        moveCard(c, gone, d, heap, z, false, dealTime/20, cpArray[dealer][0], c);
        d += (dealTime - dealTime / 20) / deckCards;
        p = next[p];
    }
    playZ = -1000;
    setTimeout(dealtEvent, dealTime);
}

// Dispatch legal deal, bid, declare, and play message events; log other message events
function msgEvent(msg) {
    if (msg.op=="ping" && "turn" in msg)
        return;
    else if (msg.op=="deal" && "name" in msg && "bot" in msg && "show" in msg && "value" in msg)
        dealMsgEvent(msg);
    else if (msg.op=="bid" && "bid" in msg)
        bidMsgEvent(msg);
    else if (msg.op=="declare" && "suit" in msg && "toss" in msg)
        declareMsgEvent(msg);
    else if (msg.op=="play" && "card" in msg)
        playMsgEvent(msg);
    else if (msg.op=="quit" && "name" in msg)
        return;
    else
        log(JSON.stringify(msg));
}

// If msg events are allowed, trigger first pending msg event then disable msg events
function nextMsg() {
    if (msgEvents && done<turn.length) {
        setTimeout(msgEvent, 0, turn[done++]);
        msgEvents = false;
    }
}

// Handle name select event for player p (p0, p1, p2, p3, pj, pg)
function nameSelEvent(event, p) {
    const addDiv = p==pj? joinAdd : startAdd;
    const addImg = p==pj? joinAImg : startAImg;
    const addLbl = p==pj? joinALbl : startALbl;
    const addInp = p==pj? joinAInp : startAInp;
    const addBtn = p==pj? joinABtn : startABtn;
    const delDiv = p==pj? joinDel : startDel;
    const delLbl = p==pj? joinDLbl : startDLbl;
    const delDel = p==pj? joinDSel : startDSel;

    function addImgEvent() {                                    // add image (close icon) clicked
        addInp.removeEventListener("keydown", addInpEvent);
        addBtn.removeEventListener("click", addBtnEvent);
        addImg.removeEventListener("click", addImgEvent);
        addDiv.style.visibility = "hidden";
        nameSel[p].value = "";
        startBtn.disabled = true;
        nameSel[p].focus();
    }

    function addBtnEvent() {                                    // add button clicked
        addInp.removeEventListener("keydown", addInpEvent);
        addBtn.removeEventListener("click", addBtnEvent);
        addImg.removeEventListener("click", addImgEvent);
        addDiv.style.visibility = "hidden";
        const aliasList = localStorage.aliasList? JSON.parse(localStorage.aliasList) : [];
        const botList = localStorage.botList? JSON.parse(localStorage.botList) : [];
        const name = addInp.value.trim().substring(0,10);
        if ((p==p3||p==pj) && name!="" && !aliasList.includes(name))
            aliasList.push(name);
        else if ((p==p0||p==p1||p==p2) && name!="" && !botList.includes(name))
            botList.push(name);
        aliasList.sort();
        botList.sort();
        localStorage.aliasList = JSON.stringify(aliasList);
        localStorage.botList = JSON.stringify(botList);
        setNameSelOptions();
        nameSel[p].value = name;
        startBtn.disabled = nameSel[p0].value=="" || nameSel[p1].value=="" || nameSel[p2].value=="" || nameSel[p3].value=="";
        joinBtn.disabled = nameSel[pj].value=="" || nameSel[pg].value=="";
        nameSel[p].focus();
    }

    function addInpEvent(event) {                               // add input keyed: if entered name, add name to list
        if (event.key == "Escape") {
            event.preventDefault();
            addImgEvent();
        } else if (event.key == "Enter") {
            event.preventDefault();
            addBtnEvent();
        }
    }

    function delSelEvent(event) {                               // delete select changed: delete selected name from list
        event.preventDefault();
        delDel.removeEventListener("changed", delSelEvent);
        delDiv.style.visibility = "hidden";
        const aliasList = localStorage.aliasList? JSON.parse(localStorage.aliasList) : [];
        const botList = localStorage.botList? JSON.parse(localStorage.botList) : [];
        const name = delDel.value;
        if ((p==p3||p==pj) && aliasList.includes(name))
            aliasList.splice(aliasList.indexOf(name), 1);
        else if ((p==p0||p==p1||p==p2) && botList.includes(name))
            botList.splice(botList.indexOf(name), 1);
        localStorage.aliasList = JSON.stringify(aliasList);
        localStorage.botList = JSON.stringify(botList);
        setNameSelOptions();
        nameSel[p].value = "";
        startBtn.disabled = true;
        nameSel[p].focus();
    }

    nameSel[p].style.color = "black";
    switch (nameSel[p].value) {
    case "(add)":
        nameSel[p].value = "";
        startBtn.disabled = true;
        delDiv.style.display = "none";
        addDiv.style.display = "block";
        addDiv.style.visibility = "visible";
        addLbl.textContent = p==p3||p==pj? "New alias:" : "New bot name:";
        addInp.value = "";
        addInp.focus();
        addInp.addEventListener("keydown", addInpEvent);
        addBtn.addEventListener("click", addBtnEvent);
        addImg.addEventListener("click", addImgEvent);
        break;
    case "(delete)":
        const aliasList = localStorage.aliasList? JSON.parse(localStorage.aliasList) : [];
        const botList = localStorage.botList? JSON.parse(localStorage.botList) : [];
        const list = p==p3||p==pj? aliasList : botList;
        nameSel[p].value = "";
        startBtn.disabled = true;
        addDiv.style.display = "none";
        delDiv.style.display = "block";
        delDiv.style.visibility = "visible";
        delLbl.textContent = p==p3||p==pj? "Old alias:" : "Old bot name:";
        delDel.innerHTML = "";
        const opt = document.createElement("option");
        opt.value = "";
        opt.disabled = opt.selected = opt.hidden = true;
        opt.text = "Select...";
        delDel.appendChild(opt);
        delDel.add(new Option("(none)"));
        for (const i of list)
            delDel.add(new Option(i));
        delDel.focus();
        delDel.addEventListener("change", delSelEvent);
        break;
    case "":
        break;
    default:
        startBtn.disabled = nameSel[p0].value=="" || nameSel[p1].value=="" || nameSel[p2].value=="" || nameSel[p3].value=="";
        startCtr.style.visibility = solo || !inviteBtn.disabled? "hidden" : "visible";
        joinBtn.textContent = nameSel[pg].value==""? "Check" : "Join";
    }
}

// Validate input, initialize game, display "waiting", send joinMsg, then await dealMsgEvent
function checkBtnEvent(event) {
    sendMsg({op:"list"});
}

// Validate input, initialize game, display "waiting", send joinMsg, then await dealMsgEvent
function joinBtnEvent(event) {
    event.preventDefault();
    name[p3] = nameSel[pj].value;
    game = nameSel[pg].value;
    localStorage.self = name[p3];
    nameSel[pj].disabled = true;
    nameSel[pg].disabled = true;
    checkBtn.style.display = "none";
    joinBtn.style.display = "none";
    joinWait.textContent = `Waiting for ${game}.`;
    joinWait.style.display = "inline";
    sendMsg({op:"join", game:game, name:name[p3]});
    msgEvents = true;                                           // allow msg events
    nextMsg();                                                  // trigger next pending msg events
}

// Clear loadPage, display joinPage, send listMsg, then await listMsgEvent, nameSelEvent and joinBtnEvent
function joinGBtnEvent() {
    starter = false;
    loadPage.style.display = "none";
    const aliasList = localStorage.aliasList? JSON.parse(localStorage.aliasList) : [];
    setNameSelOptions();
    nameSel[pj].value = localStorage.self? localStorage.self : "";
    nameSel[pg].value = "";
    checkBtn.style.display = "inline";
    joinBtn.disabled = true;
    joinBtn.style.display = "inline";
    joinWait.style.display = "none";
    joinAdd.style.display = "none";
    joinDel.style.display = "block";
    joinDel.style.visibility = "hidden";
    nameSel[pj].disabled = nameSel[pg].disabled = false;
    if (nameSel[pj].value == "")
        nameSel[pj].focus();
    else
        nameSel[pg].focus();
    joinPage.style.display = "grid";
    solo = false;
    sendMsg({op:"list"});
}

// Set game name and send createMsg
function inviteBtnEvent() {
    game = nameSel[p3].value;
    sendMsg({op:"create", game:game});
    inviteBtn.disabled = true;
    startCtr.textContent = `0 invitation responses`;
    startCtr.style.visibility = "visible";
    nameSel[p3].disabled = true;
}

// Validate names, initialize game, send dealMsg, then await dealMsg event
function startBtnEvent(event) {
    event.preventDefault();
    name.fill("");
    for (const p of pArray) {
        if (name.includes(nameSel[p].value)) {
            startCtr.textContent = `Duplicate name! Please restart game.`;
            startCtr.style.visibility = "visible";
            return;
        }
        name[p] = nameSel[p].value;
    }
    localStorage.name = JSON.stringify(name);
    localStorage.bot  = JSON.stringify(bot);
    localStorage.show = JSON.stringify(show);
    let v = Array(deckCards).fill(0).map((v,i,a)=>i%handCards);
    shuffleArray(v, deckCards);
    v = [...v.slice(0,20).sort(down), ...v.slice(20,40).sort(down), ...v.slice(40,60).sort(down), ...v.slice(60,80).sort(down)];
    sendMsg({op:"deal", name:name, bot:bot, show:show, value:v});
    msgEvents = true;                                           // allow msg events
    nextMsg();                                                  // trigger next pending msg events
}

// Toggle bot[p] and nameIco[p], hide startCtr if all bots, update nameSel options, force player p selection
function nameIcoEvent(event, p) {
    event.preventDefault();
    if (bot[p] && !online)                                      // if bot and offline,
        return;                                                     // don't allow toggle to human
    bot[p] = !bot[p];
    nameIco[p].src = bot[p]? robotSrc : humanSrc;
    solo = bot[p0] && bot[p1] && bot[p2];
    nameSel[p].value = "";
    inviteBtn.disabled = solo || nameSel[p3]=="" || game!="";
    startBtn.disabled = nameSel[p0].value=="" || nameSel[p1].value=="" || nameSel[p2].value=="" || nameSel[p3].value=="";
    startCtr.style.visibility = solo || !inviteBtn.disabled? "hidden" : "visible";
    setNameSelOptions();
}

// Toggle show[b] and assistBox[b] icon
function assistBoxEvent(event, b) {
    event.preventDefault();
    show[b] = !show[b];
    assistBox[b].src = show[b]? checked : unchecked;
}

// Clear loadPage, display startPage, then await nameSel, nameIco, assistBox, inviteBtn, and startBtn events
function startGBtnEvent() {
    starter = true;
    loadPage.style.display = "none";
    const aliasList = localStorage.aliasList? JSON.parse(localStorage.aliasList) : [];
    const botList = localStorage.botList? JSON.parse(localStorage.botList) : [];
    name = localStorage.name? JSON.parse(localStorage.name) : name;
    bot = localStorage.bot? JSON.parse(localStorage.bot) : bot;
    show = localStorage.show? JSON.parse(localStorage.show) : show;
    for (const p of pArray) {                                   // for each player,
        bot[p] = bot[p] || (p==p0||p==p1||p==p2)&&!online;          // player is a bot if was a bot or is an offline p0/p1/p2
        const list = bot[p]? botList : (p==p3? aliasList : null);   // select botList, aliasList or no list
        name[p] = list&&list.includes(name[p])? name[p] : "";       // keep old name if it's in list, otherwise clear name
    }
    solo = bot[p0] && bot[p1] && bot[p2];
    setNameSelOptions();
    for (const p of pArray)                                     // for every player,
        if (p==p3) {                                                // if player is p3,
            nameSel[p].value = name[p];                                 // default to old name
            nameIco[p].src = humanSrc;                                  // set name icon to human
        } else if (bot[p]) {                                        // if player is a bot,
            nameSel[p].value = name[p];                                 // default to old name
            nameIco[p].src = robotSrc;                                  // set name icon to bot
        } else {                                                    // if player is human p0/p1/p2,
            nameSel[p].value = "";                                      // default to no name
            nameIco[p].src = humanSrc;                                  // set name icon to human
        }
    joinList.length = 0;
    inviteBtn.disabled = solo || nameSel[p3]=="";
    startBtn.disabled = nameSel[p0].value=="" || nameSel[p1].value=="" || nameSel[p2].value=="" || nameSel[p3].value=="";
    startCtr.style.visibility = "hidden";
    assistBox[counts].src = show[counts]? checked : unchecked;
    assistBox[hands].src = show[hands]? checked : unchecked;
    assistBox[counts].disabled = assistBox[hands].disabled = false;
    startAdd.style.display = "block";
    startDel.style.display = "none";
    startAdd.style.visibility = startDel.style.visibility = "hidden";
    nameSel[p3].disabled = false;
    startPage.style.display = "flex";
}

// Process websocket close events
function wsCloseEvent(event) {
    log(`wsCloseEvent, id:${id}`);
    online = false;
    if (!solo)
        netDlg.showModal();
    joinGBtn.disabled = true;
}

// Ignore websocket error events
function wsErrorEvent(event) {
    log(`wsErrorEvent! id:${id}`);
}

// Handle incoming websocket message events
function wsMessageEvent(event) {
    const msg = JSON.parse(event.data);                         // parse the event data
    if (msg.op=="id" && "id" in msg) {                          // if legal idMsg,
        log(`op:id, id:${msg.id}`);
        if (id == none) {                                           // if first id of this session,
            id = msg.id;                                                // id is id offered by our anonymous connection
            sessionStorage.id = id;                                     // store id in case of page refresh
            websocket.close();                                          // close websocket
            return;                                                     // await wsInterval event
        }
        if (msg.id != id)                                           // if id is not what was expected,
            console.error(`Unexpected id !`);                           // log error
        id = msg.id;                                                // save new id (may impact comms)
        sessionStorage.id = id;                                     // store id in case of page refresh
        online = true;                                              // note that we're online
        netDlg.close();
        joinGBtn.disabled = false;                                  // enable joinG button
        return;
    }
    if (msg.op=="pong" && "turn" in msg) {                      // if legal pongMsg,
        //log(`op:pong, turn.length:${msg.turn.length}`);
        for (let i=turn.length; i<msg.turn.length; i++)             // add any missing turns
            turn[i] = msg.turn[i];
        nextMsg();                                                  // if allowed, trigger next pending msg
        return;
    }
    if (msg.op=="list" && "game" in msg) {                      // if legal listMsg,
        log(`op:list, game:[${msg.game}]`);
        gameList = [...msg.game];                                   // update game list
        setNameSelOptions();                                        // update nameSel options
        nameSel[pg].value = gameList[0];                            // default to first game
        if (nameSel[pj].value!="" && nameSel[pg].value!="")         // if join fields have values,
            joinBtn.disabled = false;                                   // enable join button
        return;
    }
    if (starter && msg.op=="join" && "name" in msg) {           // if starter and legal joinMsg,
        log(`op:join, name:${msg.name}`);
        joinList.push(msg.name);                                    // add name to join list
        startCtr.textContent = `${joinList.length} invitation response${joinList.length!=1?"s":""}`;
        setNameSelOptions();                                        // update nameSel options
        let j = 0;
        for (const p of [p0, p1, p2])                               // prefill human player names
            if (j<joinList.length && !bot[p])
                nameSel[p].value = joinList[j++];
        startBtn.disabled = nameSel[p0].value==""||nameSel[p1].value==""||nameSel[p2].value==""||nameSel[p3].value=="";
        return;
    }
    if (msg.op=="quit" && "name" in msg) {                      // if legal quitMsg,
        log(`op:quit, name:${msg.name}`);
        if (msg.name == name[p3])                                   // if my create was rejected, alert me of such
            alert(`The old "${name[p3]}" game will soon expire. In the meantime, please restart with a new name.`);
        else                                                        // otherwise, alert me that someone quit
            alert(`${msg.name} terminated the game.`);
        window.close();                                             // close app
        location.reload();                                          // if close fails, reload app
        return;
    }
    log(event.data);                                            // log undecipherable event data 
}

// Ignore websocket open events
function wsOpenEvent(event) {
    log(`wsOpenEvent, id:${id}`);
}

// Send periodic websocket pings and make periodic websocket reconnect attempts
function wsIntervalEvent() {
    switch (websocket.readyState) {
    case WebSocket.CONNECTING:                                  // if websocket connecting,
        log(`wsIntervalEvent, connecting`);                         // log event
        break;
    case WebSocket.OPEN:                                        // if websocket open,
        //log(`wsIntervalEvent, open`);                             // log event
        websocket.send(JSON.stringify({op:"ping", turn:turn}));   // send pingMsg (in case my turn was lost)
        break;
    case WebSocket.CLOSING:                                     // if websocket closing,
        log(`wsIntervalEvent: closing`);                            // log event
        break;
    case WebSocket.CLOSED:                                      // if websocket closed,
        log(`wsIntervalEvent: closed`);                             // log event
        const hostname = location.hostname;
        if (navigator.onLine && hostname) {                     // if browser is online and not running from debugger,
            let url = hostname=="games.koyeb.app"? `wss://${hostname}/ws/` : `ws://${hostname}:3000/`;
            id = sessionStorage.id? sessionStorage.id : none;           // did this session already have an id?
            url = id==none? url : url+id;                               // if so, try to get it again
            websocket = new WebSocket(url);                             // create a new websocket
            websocket.onclose = wsCloseEvent;
            websocket.onerror = wsErrorEvent;
            websocket.onmessage = wsMessageEvent;
            websocket.onopen = wsOpenEvent;
            log(`Reconnecting to url:${url}`);
        }
    }
}

// Set dynamic sizes and, if sizes changed, redraw deck
function resizeEvent() {
    setSizes();
    if (vh!=vh0 || vw!=vw0) {
        vh0 = vh;
        vw0 = vw;
        relocate();
        for (const c of cArray)
            moveCard(c, card[c].g, 0, card[c].g, card[c].z, card[c].f, 0);
    }
}

// Initialize app, then await resizeEvent, startGBtnEvent or joinGBtnEvent
function loadEvent() {
    console.clear();
    const images = document.querySelectorAll("img");            // initialize constants
    for (const img of images)
        img.draggable = false;
    setSizes();
    vh0 = vh;
    vw0 = vw;
    onresize = resizeEvent;
    for (const c of cArray) {                                   // initialize card images and location
        cardImg[c].src = backImg[0].src;
        cardImg[c].style.transform = "translate(-2.8em, -2em)";
    }
    trumpIco.style.display = "none";                            // initialize display
    trumpOut.textContent = "";
    infoHint[p0].style.display = infoHint[p1].style.display = infoHint[p2].style.display = "none";
    gamePage.style.display = "none";
    loadPage.style.display = "flex";
    online = false;                                             // initialize websocket
    turn.length = 0;                                            // initialize turn object storage
    done = 0;
    msgEvents = false;
    game = "";
    starter = false;
    solo = true;
    dealer = none;
    joinGBtn.disabled = true;
    debugTxt.textContent = `navigator.onLine:${navigator.onLine}, location.hostname:${location.hostname}`;
    const hostname = location.hostname;
    if (navigator.onLine && hostname) {                         // if online and not running from debugger,
        let url = hostname=="games.koyeb.app"? `wss://${hostname}/ws/` : `ws://${hostname}:3000/`;
        id = sessionStorage.id? sessionStorage.id : none;           // did this session already have an id?
        url = id==none? url : url+id;                               // if so, try to get it again
        websocket = new WebSocket(url);                             // create a new websocket
        websocket.onclose = wsCloseEvent;
        websocket.onerror = wsErrorEvent;
        websocket.onmessage = wsMessageEvent;
        websocket.onopen = wsOpenEvent;
        setInterval(wsIntervalEvent, 1000);                         // start heartbeat
        log(`Connecting to url:${url}`);
    }
    /*if (location.origin != "file://")                               // if not running from debugger, start service worker
        navigator.serviceWorker.register("service-worker.js", {updateViaCache: "none"});*/
}

onload = loadEvent;