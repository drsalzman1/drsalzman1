'use strict';

// Image source files
const dropSrc   = 'icons/drop.svg';
const liftSrc   = 'icons/lift.svg';
const chkdSrc   = 'icons/checked.svg';
const unchkdSrc = 'icons/unchecked.svg';
const downSrc   = 'icons/down.svg';
const editSrc   = 'icons/edit.svg';
const delSrc    = 'icons/del.svg';
const jackSrc   = 'ranks/jack.svg';
const queenSrc  = 'ranks/queen.svg';
const kingSrc   = 'ranks/king.svg';
const tenSrc    = 'ranks/ten.svg';
const aceSrc    = 'ranks/ace.svg';
const diamndSrc = 'suits/diamond.svg';
const clubSrc   = 'suits/club.svg';
const heartSrc  = 'suits/heart.svg';
const spadeSrc  = 'suits/spade.svg';

// Position indices (or none)
const none      = -1;                                       // also used elsewhere
const p0        = 0;                                        // the position of the player
const p1        = 1;                                        // the position left of the player
const p2        = 2;                                        // the position across from the player
const p3        = 3;                                        // the position right of the player
const positions = 4;                                        // the number of positions
const pArray    = [p0, p1, p2, p3];                         // pArray[p] = the position of player p
const oArray    = [p1, p2, p3];                             // oArray[p] = the position of other player o
const next      = [p1, p2, p3, p0];                         // next[p] = the position clockwise from position p
const prev      = [p3, p0, p1, p2];                         // prev[p] = the position counterclockwise from position p
const teamE     = [true, false, true, false];               // teamE[p] = true for position p of p0 and p2
const teamO     = [false, true, false, true];               // teamO[p] = true for position p of p1 and p3

// Suit values (or none)
const diamonds  = 0;
const clubs     = 5;
const hearts    = 10;
const spades    = 15;
const suits     = 4;
const sArray    = [spades, hearts, clubs, diamonds];
const suit$     = ['diamonds',,,,,'clubs',,,,,'hearts',,,,,'spades'];
const suitSrc   = [diamndSrc,,,,,clubSrc,,,,,heartSrc,,,,,spadeSrc];

// Rank values (or none)
const jack      = 0;
const queen     = 1;
const king      = 2;
const ten       = 3;
const ace       = 4;
const ranks     = 5;
const rArray    = [jack, queen, king, ten, ace];
const rank$     = ['jack', 'queen', 'king', 'ten', 'ace'];
const rankSrc   = [jackSrc, queenSrc, kingSrc, tenSrc, aceSrc];

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
const value$    = ['J♦','Q♦','K♦','T♦','A♦','J♣','Q♣','K♣','T♣','A♣','J♥','Q♥','K♥','T♥','A♥','J♠','Q♠','K♠','T♠','A♠','--'];
const deckCards = 80;
const handCards = deckCards / positions;
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
const cntr = 3;                                         // center position

// Card class
class C {
    constructor() {
        this.c    = 0;                                  // card number
        this.p    = 0;                                  // position value
        this.o    = false;                              // position is team O (p1 or p3)
        this.v    = 0;                                  // card value
        this.s    = 0;                                  // card suit
        this.r    = 0;                                  // card rank
        this.t    = false;                              // card take is one
        this.g    = 0;                                  // card group
        this.m    = false;                              // card is in trump
        this.z    = 0;                                  // draw order
        this.f    = false;                              // display face if true
        this.k    = false;                              // card known to all positions
        this.gone = new P;                              // gone position
        this.heap = new P;                              // heap position
        this.hand = new P;                              // hand position
        this.cntr = new P;                              // cntr position
    }
}

// plyr[c] = position assigned card c
const plyr      = [
    p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0, p0,
    p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1, p1,
    p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2, p2,
    p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, p3, 
];

// cpArray[p] = card indices assigned to position p
const cpArray = [
    [0,  1,  2,  3,  4,  5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
    [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79]
];

// remaining[v] = remaining cards of value v to be played
const remaining = Array(values);

// maxCards[p][v] = most cards position p can hold of value v (revealed by meld and play)
const maxCards  = [Array(values), Array(values), Array(values), Array(values)];

// minCards[p][v] = least cards position p can hold of value v (revealed by meld and play)
const minCards  = [Array(values), Array(values), Array(values), Array(values)];

// Page elements
const nameBlk   = Array.from(document.querySelectorAll('.nameBlk'));
const nameBtn   = Array.from(document.querySelectorAll('.nameBlk button'));
const nameSpn   = Array.from(document.querySelectorAll('.nameBlk span'));
const nameImg   = Array.from(document.querySelectorAll('.nameBlk img'));
const nameInp   = Array.from(document.querySelectorAll('.nameBlk input'));
const nameLst   = Array.from(document.querySelectorAll('.nameLst'));
const botBlk    = Array.from(document.querySelectorAll('.botBlk'));
const botBox    = Array.from(document.querySelectorAll('.botBlk input'));
const showInp   = Array.from(document.querySelectorAll('#showGrd input'));
const meldSpan  = Array.from(document.querySelectorAll('#meldColumn span'));
const infoNam   = Array.from(document.querySelectorAll('.infoNam'));
const infoBid   = Array.from(document.querySelectorAll('.infoBid'));
const infoHnt   = Array.from(document.querySelectorAll('.infoHnt'));
const infoChr   = Array.from(document.querySelectorAll('.infoHnt>span'));
const trumpBtn  = Array.from(document.querySelectorAll('#trumpDiv input'));
const needPara  = Array.from(document.querySelectorAll('#needDiv p'));
const handCell  = Array.from(document.querySelectorAll('#handGrd div'));
const slideImg  = Array.from(document.querySelectorAll('#slideImg img'));
const cardImg   = Array.from(document.querySelectorAll('#cardImg img'));
const faceImg   = Array.from(document.querySelectorAll('#faceImg img'));
const backImg   = Array.from(document.querySelectorAll('#backImg img'));
const infoCell  = Array.from(document.querySelectorAll('#infoGrd div'));
const helpDiv   = Array.from(document.querySelectorAll('#helpPag div'));

// Timer constants
const dealTime  = 2000;                                 // milliseconds to deal all cards
const wsTime    = 1000;                                 // milliseconds between websocket heartbeats
const pongTime  = 2000;                                 // milliseconds between websocket pongs (max)
const fadeDelay = 5000;                                 // milliseconds to fade in slider

// Client message syntax (txed to server)                   Server action
// ======================================                   =============
const pingSyn   = '{"id":$,"ping":#}';                      // tx lost messages then tx pong
const loginSyn  = '{"id":$,"t":#,"login":$}';               // login then tx ins to awaiting
const groupSyn  = '{"id":$,"t":#,"group":[$]}';             // tx outs to old and ins to new
const logoutSyn = '{"id":$,"t":#,"logout":$}';              // tx outs to group then logout
const spreadSyn = '{"id":$,"t":#,...}';                     // tx modified message to group

// Server message syntax (txed to client)                   Client action
// ======================================                   =============
const pongSyn   = '{"id":$,"pong":#}';                      // tx lost messages then tx ping
const inSyn     = '{"id":$,"t":#,"in":$}';                  // start when all in
const playerSyn = '{"id":$,"t":#,"player":[$],"flag":[!]}'; // set up game
const dealSyn   = '{"id":$,"t":#,"deal":[#]}';              // deal cards
const bidSyn    = '{"id":$,"t":#,"bid":#}';                 // bid hand
const trumpSyn  = '{"id":$,"t":#,"trump":#,"toss":!}';      // pick trump and toss/play hand
const playOkSyn = '{"id":$,"t":#,"playOk":$}';              // play when all ok
const playSyn   = '{"id":$,"t":#,"play":#}';                // play card
const nextOkSyn = '{"id":$,"t":#,"nextOk":$}';              // deal next/logout when all ok
const outSyn    = '{"id":$,"t":#,"out":$}';                 // reload app

// Message semantics                                        Example
// =================                                        =======
// bid:    bid (0=pass)                                     bid:50
// deal:   [d]=suit+rank (0..19), d=play (0..79)            deal:[19,18,17,16,15,14,13,12,...]
// flag:   [0..3]=robot0..3, [4]=showCounts, [5]=showHands  flag:[false,true,true,true,tru...]
// group:  [g]=name of group member g                       group:['South','West','North',...]
// id:     client name ('' if none)                         id:'South'
// in:     name of player who logged in                     in:'South'
// login:  name of player who is logging in                 login:'South'
// logout: name of player who is logging out                logout:'South'
// nextOk: name of player ready for next deal or game       nextOk:'South'
// out:    name of player who logged out                    out:'South'
// ping:   number of messages received                      ping:0
// play:   0=p0c0, 1=p0c1, ...79=p3c19                      play:62
// playOk: name of player ready for play                    playOk:'South'
// player: [0]=maker, [1]=left, [2]=across, [3]=right       player:['South','West','North'...]
// pong:   number of messages received                      pong:0
// t:      number of messages transmitted                   t:0
// toss:   true=toss, false=play                            toss:true;
// trump:  0=diamonds, 5=clubs, 10=hearts, 15=spades        trump:0

// Syntax symbols: #=1+digits, $="0+legals", !=true|false, ...=0+chars, []=array
const digits    = '0123456789';
const legals    = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' ";

// Server log value syntax
const valSyn = '{w:{id:$,...},group:[$],rxed:#,txed:#,txms:#,q:[$]}';

// Server log value semantics                               Example
// ==========================                               =======
// w:      client's websocket object or null                w:{id:'South',...}
// id:     client name                                      id:'South'
// group:  [g]=name of group member g                       group:['South','West','North',...]
// rxed:   number of messages received                      rxed:0
// txed:   number of messages transmitted                   txed:0
// txms:   milliseconds since epoch of latest transmission  txms:1795396113528
// q:      queue of stringified server messages             q:['{"in":"South"}']

// Comm variables and constants
let websocket   = null;                                 // websocket object (or null)
let wsTimer     = 0;                                    // websocket heatbeat timer
let pongTimer   = 0;                                    // websocket message timeout
let online      = false;                                // true when player[0] is online
let rxed        = 0;                                    // number of messages received
let txed        = 0;                                    // number of messages transmitted
let txms        = 0;                                    // milliseconds since epoch of latest transmission
const q         = [];                                   // queue of outgoing message strings
const setOk     = [];                                   // [p]=position p ok to set game
const playOk    = [];                                   // [p]=position p ok to play
const nextOk    = [];                                   // [p]=position p ok to deal next hand or play next game

// validSyn[i] = pattern for message i
const validSyn  = [
    loginSyn, groupSyn, logoutSyn, inSyn, playerSyn, dealSyn, 
    bidSyn, trumpSyn, playOkSyn, playSyn, nextOkSyn, outSyn
];    

// msgFunct[i] = function to handle message i
const msgFunct  = [
    loginEvent, groupEvent, logoutEvent, inEvent, playerEvent, dealEvent, 
    bidEvent, trumpEvent, playOkEvent, playEvent, nextOkEvent, outEvent
];

// msgLocal[i] = true if ok to process message i locally as it is sent
const msgLocal  = [
    false, false, false, false, true, true, 
    true, true, true, true, true, false
];

// Player settings (stored in player's sessionStorage and device's localStorage as defaults)
let version     = '0.6';                                // version of game and player settings
let role        = 'solo';                               // Player's role ('solo', 'make' or 'join')
const names     = ['East', 'North', 'South', 'West'];   // list of past players
const player    = ['South', 'West', 'North', 'East'];   // player[p] is name at position p (can't be empty)
const robot     = [false, true, true, true];            // robot[p] is true if position p is a robot
const show      = [true, false];                        // show[counts/hands] is true if counts/hands are to be shown

// Game variables and constants from maker's perspective
const helpStack = [];                                   // stack of help pages
let pPlayer     = 0;                                    // position of player from maker's perspective
const card      = [                                     // card[c] = deck card c
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C
];
let dealer      = p0;                                   // the position who is dealing or last dealt
let bidder      = p1;                                   // the position who is bidding or won the bid
let position    = none;                                 // the position who is choosing then playing a card
const bid       = [none, none, none, none];             // bid[p] = position p's bid (or none or pass)
const est       = [typical, typical, typical, typical]; // est[p] = position p's estimated meld based on jump bids
let trump       = none;                                 // the bidder's trump suit
let toss        = false;                                // the bidder's toss decision
let chosen      = none;                                 // the card number that was chosen
let leadCard    = none;                                 // the card number that was lead
let highCard    = none;                                 // the card number of the highest card so far
let meldE       = 0;                                    // team E's meld
let meldO       = 0;                                    // team O's meld
let needE       = 0;                                    // points team E needs to take in order to save
let needO       = 0;                                    // points team O needs to take in order to save
let takeE       = 0;                                    // points team E has taken so far in hand
let takeO       = 0;                                    // points team O has taken so far in hand
let scoreE      = 0;                                    // team E's total points so far in game
let scoreO      = 0;                                    // team O's total points so far in game
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

// Global drag and drop variables
let pickedC     = 0;                                    // Picked card number
let pickedE     = null;                                 // Picked element
let offsetX     = 0;                                    // offset of pointer X from card X
let offsetY     = 0;                                    // offset of pointer Y from card Y
let strt        = '';                                   // start transform
let fnsh        = '';                                   // finish transform

// Animation varaiables
let fadeId      = 0;                                    // fade timer id

// Compare function to sort in ascending order
function up(a, b) {
    return a - b;
}

// Compare function to sort in descending order
function down(a, b) {
    return b - a;
}

// Log debugText on console (comment out when done debugging)
function log(debugText = '') {
    console.log(debugText);
    return debugText;
}

// Return true if the suit of card value v is trump
function trmp(v) {
    return suit[v]==trump;
}

// Return number of cards in position p's hand
function nCards(p) {
    let n = 0;
    for (const c of cpArray[p])
        if (card[c].g == hand)
            n++;
    return n;
}

// Return number of cards of value v in position p's hand
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

// Return number of cards of suit s in position p's hand
function nSuit(p, s) {
    let n = 0;
    for (const c of cpArray[p])
        if (card[c].g==hand && card[c].s==s)
            n++;
    return n;
}

// Return number of cards of rank r in position p's hand
function nRank(p, r) {
    let n = 0;
    for (const c of cpArray[p])
        if (card[c].g==hand && card[c].r==r)
            n++;
    return n;
}

// Return number of cards in position p's short suit
function nShort(p) {
    return Math.min(nSuit(p,spades), nSuit(p,hearts), nSuit(p,clubs), nSuit(p,diamonds));
}

// Return number of rank r arounds in position p's hand
function arounds(p, r) {
    let n = 4;
    for (const s of sArray)
        n = Math.min(n, nValue(p, r+s));
    return n;
}

// Return number of suit s runs in the position p's hand
function runs(p, s) {
    let n = 4;
    for (const r of rArray)
        n = Math.min(n, nValue(p, r+s));
    return n;
}

// Return number of pinochles in position p's hand
function pinochles(p) {
    return Math.min(nValue(p, queen+spades), nValue(p, jack+diamonds));
}

// Return number of suit s marriage's in the position p's hand
function marriages(p, s) {
    return Math.min(nValue(p, king+s), nValue(p, queen+s));
}

// Return position p's meld based on trump suit t
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

// Return minimum meld in position p's hand
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

// Return suit with maximum meld in position p's hand
function maxSuit(p) {
    for (const s of sArray)
        if (meld(p, s) == maxMeld(p))
            return s;
}

// Tag n cards of value v in position p's hand as known to all
function tagCards(p, v, n) {
    for (const c of cpArray[p])
        if (card[c].v==v && n-->0)
            card[c].k = true;
}

// Return number of position p's known cards of value v
function nKnown(p, v) {
    let n = 0;
    for (const c of cpArray[p])
        if (card[c].k && card[c].v==v)
            n++;
    return n;
}

// Note meld/need, tag meld cards, tag known cards (to be revealed to others), and set minCards/maxCards accordingly
function tagMeld() {
    meldE = meld(p0, trump) + meld(p2, trump);
    meldO = meld(p1, trump) + meld(p3, trump);
    needE = teamO[bidder]? 20 : (meldE<20? bid[bidder] : Math.max(20,bid[bidder]-meldE));
    needO = teamE[bidder]? 20 : (meldO<20? bid[bidder] : Math.max(20,bid[bidder]-meldO));
    for (const c of cArray)
        card[c].m = card[c].s==trump;
    for (const p of pArray) {                                   // for each position,
        if ((teamO[p] && meldO<20) || (teamE[p] && meldE<20)) {     // if position's team can't keep their meld,
            if (p == bidder)                                            // if position won the bid,
                for (const r of [queen, king])                               // tag one trump marriage (if possible, to allow play)
                    tagCards(p, r+trump, Math.min(marriages(p, trump)), 1);
            for (const s of sArray)                                     // show any aces around (house rule?)
                tagCards(p, ace+s, arounds(p, ace));
        } else {                                                    // if position's team may be able to keep their meld,
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
    for (const p of pArray)                                     // for each position,
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

// Return quality = cards in position p's best suit + aces - cards short suit (7+4-3-8=0)
function quality(p) {
    return nSuit(p,maxSuit(p)) + nRank(p,ace) - nShort(p) - 8;
}

// Return true if position p has no marriages
function noMarriages(p) {
    return marriages(p,spades)==0 && marriages(p,hearts)==0 && marriages(p,clubs)==0 && marriages(p,diamonds)==0;
}

// Return bid string for position p
function bidString(p) {
    if (bid[p] == none)
        return '';
    else
        return `${bid[p]==pass? 'Pass' : bid[p]}`;
}

// Log bidder's bid, quality(bidder), minMeld(bidder), maxMeld(bidder), est[partner] and reason (returns bid)
function logBid(bid, reason) {
    const partner = next[next[bidder]];
    let t = '  ';
    t += `bid[${player[bidder][0]}]:`.padEnd(7) + `${bid==pass?'Pass':bid},`.padEnd(6);
    t += `quality(${player[bidder][0]}):${(quality(bidder)>=0?'+':'')+quality(bidder)},`.padEnd(16);
    t += `minMeld(${player[bidder][0]}):${minMeld(bidder)},`.padEnd(16);
    t += `maxMeld(${player[bidder][0]}):${maxMeld(bidder)},`.padEnd(16);
    t += `est[${player[partner][0]}]:${est[partner]},`.padEnd(12);
    t += `reason:${reason}`;
    log(t);
    return(bid);
}

// Return number of positions who passed
function nPass() {
    return (bid[p0]==pass?1:0) + (bid[p1]==pass?1:0) + (bid[p2]==pass?1:0) + (bid[p3]==pass?1:0);
}

// Return true if position p has a run in his best suit
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
    const meldE = meld(p0, trump) + meld(p2, trump);
    const needE = meldE<20? bid[bidder] : Math.max(20,bid[bidder]-meldE);
    const meldO = meld(p1, trump) + meld(p3, trump);
    const needO = meldO<20? bid[bidder] : Math.max(20,bid[bidder]-meldO);
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
        for (const i of cpArray[card[c].p])                         // if position can follow but doesn't, c's illegal
            if (card[i].g==hand && card[i].s==card[leadCard].s)
                return false;
        if (card[c].m && card[c].r>card[highCard].r)                // if position overtrumps, c's legal
            return true;
        for (const i of cpArray[card[c].p])                         // if position can overtrump but doesn't, c's illegal
            if (card[i].g==hand && card[i].m && card[i].r>card[highCard].r)
                return false;
        if (card[c].m)                                              // if c's trump, c's legal
            return true;
        for (const i of cpArray[card[c].p])                         // if position can trump but doesn't, c's illegal
            if (card[i].g==hand && card[i].m)
                return false;
    } else {                                                    // If trump was lead or high card isn't trump,
        if (card[c].s==card[leadCard].s && card[c].r>card[highCard].r) // if c follows lead and beats high, c's legal
            return true;
        for (const i of cpArray[card[c].p])                         // if position can follow lead & beat high but doesn't, c's illegal
            if (card[i].g==hand && card[i].s==card[leadCard].s && card[i].r>card[highCard].r)
                return false;
        if (card[c].s == card[leadCard].s)                          // if c follows lead, c's legal
            return true;
        for (const i of cpArray[card[c].p])                         // if position can follow lead but doesn't, c's illegal
            if (card[i].g==hand && card[i].s==card[leadCard].s)
                return false;
        if (card[c].m)                                              // if card is (first) trump, c's legal
            return true;
        for (const i of cpArray[card[c].p])                         // if position can trump but doesn't, c's illegal
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
    let t = '';
    for (const p of pArray) {
        t = `  ${player[p][0]}:`;
        for (const c of cpArray[p])
            t += card[c].g==hand? ` ${value$[card[c].v]}` : ` --`;
        log(t);
    }
}

// Cap max cards for position pa of value v given remaining[v], position pb's cards, minCards[pa][v], and maxCards[pa][v]
function capMaxCards(pa, v, pb) {
    let loose = remaining[v] - nValue(pb, v);
    for (let p = next[pb]; p != pb; p = next[p])
        loose -= minCards[p][v];
    return Math.min(maxCards[pa][v], minCards[pa][v] + loose);
}

// Display enabled hints
function showHints() {
    if (show[counts]) {
        let n = 0, i = 0;
        for (const r of rArray)
            n += remaining[r+trump] - nValue(p0,r+trump);
        trumpTxt.textContent = n;
        for (const o of oArray) {
            for (const s of sArray) {
                n = 0;
                for (const r of rArray)
                    n += capMaxCards(o, r+s, p0);
                if (n==0)                                                   // if no cards in suit, display 'X'
                    infoChr[i++].innerHTML = 'X';
                else if (minCards[o][ace+s]>0)                              // otherwise, if ace in suit, display 'A'
                    infoChr[i++].innerHTML = 'A';
                else if (capMaxCards(o,ace+s,p0)==0)                        // otherwise, if no ace in suit, display '↓'
                    infoChr[i++].innerHTML = `<img src=${downSrc}>`;
                else                                                        // otherwise, display '?'
                    infoChr[i++].innerHTML = '?';
            }
            infoHnt[o].style.display = nCards(o)>0? 'inline' : 'none';
        }
    } else {
        trumpTxt.textContent = '';
        infoHnt[p1].style.display = infoHnt[p2].style.display = infoHnt[p3].style.display = 'none';
    }
}

// Get plausible card values cardV given other positions' unknown cards
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

    // Make list of unknown cards in other positions' hands
    const unknown = Array(deckCards).fill(0);
    let u = 0;
    for (const c of cArray)
        if (card[c].g==hand && card[c].p!=position && !card[c].k)
            unknown[u++] = card[c].v;

    // Until compliant: shuffle list, fill in cardV, and test for compliance
    nextTry: do {
        shuffleArray(unknown, u);
        u = 0;
        for (const c of cArray)
            if (card[c].g==hand && card[c].p!=position && !card[c].k)
                cardV[c] = unknown[u++];
            else
                cardV[c] = card[c].g==gone? absent : card[c].v;
        for (const p of pArray)
            for (let v = 0; v < values; v++) {
                let nV = 0;
                for (const c of cpArray[p])
                    if (card[c].g==hand && cardV[c]==v)
                        nV++;
                if (nV > capMaxCards(p, v, position))
                    continue nextTry;
            }
    } while (false);
}

// Find position p's best legal move bestC[p] given card values v and played cards playC
function bestMerit(v, bestC, playC, p, leadCard0, highCard0, nPlayed) {
    let l = leadCard0;
    let h = highCard0;
    let merit = 0;
    let bestM = -100;
    nextC: for (const c of cpArray[p]) {                        // For all of position p's cards,
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
                        for (const c of cpArray[p])                                 // if p can follow the lead, c's no good
                            if (suit[v[c]] == sl)
                                continue nextC;
                        if (!tc || rc<=rh) {                                        // if c doesn't overtrump,
                            for (const c of cpArray[p])                                 // if p can overtrump, c's no good
                                if (trmp(v[c]) && v[c]>vh)
                                    continue nextC;
                            if (!tc)                                                    // if c's not trump,
                                for (const c of cpArray[p])                                 // if p can trump, c's no good
                                    if (trmp(v[c]))
                                        continue nextC;
                        }
                    }
                } else {                                                    // otherwise,
                    if (sc!=sl || rc<=rh) {                                     // if c doesn't follow lead or doesn't beats high,
                        for (const c of cpArray[p])                                 // if p can follow lead & beat high, c's no good
                            if (suit[v[c]]==sl && v[c]>vh)
                                continue nextC;
                        if (sc != sl) {                                             // if c doesn't follow lead,
                            for (const c of cpArray[p])                                 // if p can follow lead, c's no good
                                if (suit[v[c]] == sl)
                                    continue nextC;
                            if (!tc)                                                    // if c's not trump,
                                for (const c of cpArray[p])                                 // if p can trump, c's no good
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
            if (nPlayed+1 < positions) {
                // Play incomplete: recurse to next position
                merit = -bestMerit(v, bestC, playC, next[p], l, h, nPlayed+1);
            } else {
                // Play complete: calculate merit
                const s=v[playC[p0]], w=v[playC[p1]], n=v[playC[p2]], e=v[playC[p3]];
                if (teamE[p] && teamE[plyr[h]]) {
                    // NS is last position and NS won
                    merit =  +trckMerit;
                    merit += (+high[w] + high[n] + high[e] + high[s]) * highMerit;
                    merit += (+rank[w] - rank[n] + rank[e] - rank[s]) * rankMerit;
                    merit += (+trmp(w) - trmp(n) + trmp(e) - trmp(s)) * trmpMerit;
                } else if (teamO[p] && teamO[plyr[h]]) {
                    // EW is last position and EW won
                    merit =  +trckMerit;
                    merit += (+high[w] + high[n] + high[e] + high[s]) * highMerit;
                    merit += (-rank[w] + rank[n] - rank[e] + rank[s]) * rankMerit;
                    merit += (-trmp(w) + trmp(n) - trmp(e) + trmp(s)) * trmpMerit;
                } else if (teamE[p] && teamO[plyr[h]]) {
                    // NS is last position and EW won
                    merit =  -trckMerit;
                    merit += (-high[w] - high[n] - high[e] - high[s]) * highMerit;
                    merit += (+rank[w] - rank[n] + rank[e] - rank[s]) * rankMerit;
                    merit += (+trmp(w) - trmp(n) + trmp(e) - trmp(s)) * trmpMerit;
                } else if (teamO[p] && teamE[plyr[h]]) {
                    // EW is last position and EW lost
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

// Return robot's best legal card number based on plausible hands (or none)
function botCard() {
    const cardV = Array(deckCards).fill(0);
    const nPlayed = nGroup(cntr);
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
            if (card[c].g == cntr) {
                bestC[card[c].p] = c;
                playC[card[c].p] = c;
            }
        getPlausible(cardV);
        bestMerit(cardV, bestC, playC, position, leadCard, highCard, nPlayed);
        results[bestC[position]].n++;
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

// Relocate cards and p1/p3 infoNam, infoBid and infoHnt
function relocate() {
    const r0 = [0,          +Math.PI,   0,          -Math.PI  ][dealer] ?? 0;
    const r1 = [-Math.PI/2, +Math.PI/2, +Math.PI/2, -Math.PI/2][dealer] ?? 0;
    const r2 = [0,          0,          0,          0         ][dealer] ?? 0;
    const r3 = [+Math.PI/2, +Math.PI/2, -Math.PI/2, -Math.PI/2][dealer] ?? 0;
    const maxY = [0, vh*0.475, 0, vh*0.475];
    let n = 0;                                                  // n = number of semi-exposed cards
    let v = 0;                                                  // v = visible card number
    let vpad = 0;                                               // vertical padding for p0 and p2 hands
    let hpad = 0;                                               // horizontal padding for p1 and p3 hands
    let pitch0 = 0;                                             // card pitch for p0's hand
    let pitch1 = 0;                                             // card pitch for p1's hand
    let pitch2 = 0;                                             // card pitch for p2's hand
    let pitch3 = 0;                                             // card pitch for p3's hand
    for (const c of cArray) {
        const p = card[c].p;
        if (c == cpArray[p][0]) {
            n = -1;
            for (const c of cpArray[p])
                n = card[c].g==hand? n+1 : n;
            if (vw <= vh) { // portrait
                hpad = pad;
                vpad = iconh + pad;
                pitch0 = Math.min(cardw*3/4, (vw - pad*2 - cardw) / n);
                pitch1 = Math.min(cardw*1/4, (vh - cardh*2 - iconh*4 - pad*3 - cardw) / n);
                pitch2 = Math.min(cardw*1/4, (vw - pad*2 - cardw) / n);
                pitch3 = Math.min(cardw*1/4, (vh - cardh*2 - iconh*4 - pad*3 - cardw) / n);
            } else { // landscape
                hpad = pad;
                vpad = iconh + pad;
                pitch0 = Math.min(cardw*3/4, (vw - pad*4 - cardh*2 - cardw) / n);
                pitch1 = Math.min(cardw*1/4, (vh - iconh*3 - pad*1.5 - cardw) / n);
                pitch2 = Math.min(cardw*1/4, (vw - pad*2 - cardw) / n);
                pitch3 = Math.min(cardw*1/4, (vh - iconh*3 - pad*1.5 - cardw) / n);
            }
            v = 0;
        }
        card[c].gone.x = Math.round([vw/2, -cardh/2-1, vw/2, vw+cardh/2+1][p]);
        card[c].gone.y = Math.round([vh+cardh/2+1, vh/2, -cardh/2-1, vh/2][p]);
        card[c].gone.r = [r0, r1, r2, r3][p];
        card[c].heap.x = Math.round([vw/2, cardw+hpad, vw/2, vw-cardw-hpad][p] + (Math.random()-0.5)*cardw/2);
        card[c].heap.y = Math.round([vh-cardw-vpad, vh/2, cardw+vpad, vh/2][p] + (Math.random()-0.5)*cardw/2);
        card[c].heap.r = [0, Math.PI/2, 0, -Math.PI/2][dealer] + (Math.random()-0.5)*Math.PI/4;
        card[c].hand.x = Math.round([vw/2+pitch0*(v-n/2), cardh/2+hpad, vw/2-pitch2*(v-n/2), vw-cardh/2-hpad][p]);
        card[c].hand.y = Math.round([vh-cardh/2-vpad, vh*0.475+pitch1*(v-n/2), cardh/2+vpad, vh*0.475-pitch3*(v-n/2)][p]);
        card[c].hand.r = [r0, r1, r2, r3][p];
        card[c].cntr.x = Math.round(vw/2 + [0, -cardw*0.38, 0, +cardw*0.38][p]);
        card[c].cntr.y = Math.round(vh/2 + [+cardw*0.38, 0, -cardw*0.38, 0][p]);
        card[c].cntr.r = [r0, r1, r2, r3][p];
        if (card[c].g==hand) {
            v++;
            maxY[p] = Math.max(maxY[p], card[c].hand.y);
        }
    }
    if (card[0].g == heap)
        infoNam[p1].style.top  = infoNam[p3].style.top  = vh/2 - cardw*1.4 + 'px';
    else {
        infoNam[p1].style.top = maxY[p1] + cardw*0.52 + 'px';
        infoNam[p3].style.top = maxY[p3] + cardw*0.52 + 'px';
        infoBid[p1].style.top  = infoHnt[p1].style.top = maxY[p1] + cardw*0.81 + 'px';
        infoBid[p3].style.top  = infoHnt[p3].style.top = maxY[p3] + cardw*0.81 + 'px';
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
    const x0 = [card[c0].gone.x, card[c0].heap.x, card[c0].hand.x, card[c0].cntr.x][g0];
    const y0 = [card[c0].gone.y, card[c0].heap.y, card[c0].hand.y, card[c0].cntr.y][g0];
    const r0 = [card[c0].gone.r, card[c0].heap.r, card[c0].hand.r, card[c0].cntr.r][g0];
    const x1 = [card[c1].gone.x, card[c1].heap.x, card[c1].hand.x, card[c1].cntr.x][g1];
    const y1 = [card[c1].gone.y, card[c1].heap.y, card[c1].hand.y, card[c1].cntr.y][g1];
    const r1 = [card[c1].gone.r, card[c1].heap.r, card[c1].hand.r, card[c1].cntr.r][g1];
    const strt =`translate(${x0}px,${y0}px) rotate(${r0}rad)`;
    const fnsh =`translate(${x1}px,${y1}px) rotate(${r1}rad)`;
    cardImg[c].animate([{transform:strt}, {transform:fnsh}], {duration:t, delay:d, fill:'forwards'});
}

// Update everyone's estimate of bidder's meld if jump bid
function updateEst(newBid) {
    const max0 = Math.max(50, ...bid);                          // note high bid so far
    if (bid[bidder]==none && newBid>max0+1 && newBid<60)        // if jump bid,
        est[bidder] = (newBid - max0) * 10;                         // adjust everyone's estimate of bidder's meld
}

// Save player settings whenever a player setting changes
function saveSettings() {
    sessionStorage.pinochle = JSON.stringify({version, role, names, player, robot, show});
    localStorage.pinochle = JSON.stringify({version, role, names, player, robot, show});
}

// Reset playPag then show list l (or none)
function resetPlayPag(l) {
    const waiting = getComputedStyle(playTxt).display=='block';
    roleGrd.style.opacity = waiting? '0.4' : '1.0';
    soloBox.src = role=='solo'? chkdSrc : unchkdSrc;
    makeBox.src = role=='make'? chkdSrc : unchkdSrc;
    joinBox.src = role=='join'? chkdSrc : unchkdSrc;
    soloBox.disabled = makeBox.disabled = joinBox.disabled = waiting;
    nameRow1.style.display = nameRow2.style.display = nameRow3.style.display = role=='join'? 'none' : '';
    for (const p of pArray) {
        nameBlk[p].style.opacity = waiting? '0.4' : '1.0';
        nameInp[p].style.display = 'none';
        nameBtn[p].style.display = 'block';
        nameBtn[p].disabled = waiting;
        nameSpn[p].textContent = player[p];
        nameLst[p].innerHTML = '';
        nameLst[p].style.visibility = 'hidden';
        nameImg[p].src = dropSrc;
        botBlk[p].style.visibility = p!=p0&&role=='make'? 'visible' : 'hidden';
        botBlk[p].style.opacity = waiting? '0.4' : '1.0';
        botBox[p].src = robot[p]? chkdSrc : unchkdSrc;
        botBox[p].disabled = waiting;
    }
    showGrd.style.display = role=='join'? 'none' : '';
    showGrd.style.opacity = waiting? '0.4' : '1.0';
    for (const s of [counts, hands]) {
        showInp[s].src = show[s]? chkdSrc : unchkdSrc;
        showInp[s].disabled = waiting;
    }
    playBtn.textContent = role=='solo'? 'Play' : (role=='make'? 'Start' : 'Join');
    playBtn.disabled = role=='join'? player[p0]=='TBD' : player.includes('TBD');
    if (l != none) {
        let h = `<div onclick=newEvent(event)><span style=font-style:italic>New name</span><img src=${editSrc}></div>`;
        for (const n of names)
            h += `<div><span onclick=namEvent(event)>${n}</span><img src=${delSrc} onclick=delEvent(event)></div>`;
        nameLst[l].innerHTML = h;
        nameLst[l].style.visibility = 'visible';
        nameImg[l].src = liftSrc;
    }
}

// Create or recreate a websocket if browser is onLine, and not running from debugger
function createSocket(force=false) {
    if (force || (navigator.onLine && location.hostname)) {
        const hst = location.hostname;
        const url = hst=='pinochle.koyeb.app'? `wss://${hst}/ws` : `ws://${hst}:3000`;
        websocket = new WebSocket(url);
        websocket.onclose = wsCloseEvent;
        websocket.onerror = wsErrorEvent;
        websocket.onmessage = wsMessageEvent;
        websocket.onopen = wsOpenEvent;
        hrefTxt.textContent = `${location.protocol}//${hst}${location.port?(':'+location.port):''}`;
    }
}

// Copy source array to existing array
function copy(existing=[], source=[]) {
    existing.length = 0;
    existing.push(...source);
}

// Return true if input string conforms to pattern string
function conforms(string='', pattern='') {
    let s = 0;                                                  // s is the current string index
    let p = 0;                                                  // p is the current pattern index
    let inArray = false;                                        // inArray is true between '[' and ']'
    while (s<string.length && p<pattern.length) {               // while indices are within string and pattern;
        const s2 = string.slice(s, s+2);                            // s2 is next 2 string chars
        const s4 = string.slice(s, s+4);                            // s4 is next 4 string chars
        const s5 = string.slice(s, s+5);                            // s5 is next 5 string chars
        const p3 = string.slice(p, p+3);                            // p3 is next 3 pattern chars
        switch (pattern[p]) {                                       // if the pattern char...
        case '[':                                                   // ...signals start of array,
            if (s2=='[]' && (p3=='[#]' || p3=='[$]' || p3=='[!]')) {    // if string '[]' and pattern '[#]', '[$]' or '[!]',
                p += 3;                                                     // advance pattern index
                s += 2;                                                     // advance string index
                break;                                                      // accept and continue
            }
            if (string[s] != '[')                                       // if string char doesn't match the pattern char,
                return false;                                               // return string doesn't conform to pattern
            inArray = true;                                             // flag inArray
            p += 1;                                                     // advance pattern index
            s += 1;                                                     // advance string index
            break;
        case ']':                                                   // ...signals end of array
            if (string[s] != ']')                                       // if string char doesn't match the pattern char,
                return false;                                               // return string doesn't conform to pattern
            inArray = false;                                            // clear inArray and look for string match
            p += 1;                                                     // advance pattern index
            s += 1;                                                     // advance string index
            break;
        case '#':                                                   // ...is '#',
            if (!digits.includes(string[s]))                            // if first string char isn't a digit,
                return false;                                               // return string doesn't conform to pattern
            while (digits.includes(string[s]))                          // while string char is a digit,
                s += 1;                                                     // advance string index
            p += !inArray || string[s]!=','? 1 : 0;                     // if !inArray or string !comma, advance pattern index
            s += inArray && string[s]==','? 1 : 0;                      // if inArray and string comma, advance string index
            break;
        case '$':                                                   // ...is '$',
            if (string[s] != '"')                                       // if string char isn't '"',
                return false;                                               // return string doesn't conform to pattern
            s += 1;                                                     // advance string index
            while (legals.includes(string[s]))                          // while string char is a legal name char,
                s += 1;                                                     // advance string index
            if (string[s] != '"')                                       // if string char isn't '"',
                return false;                                               // return string doesn't conform to pattern
            s += 1;                                                     // advance string index
            p += !inArray || string[s]!=','? 1 : 0;                     // if !inArray or string !comma, advance pattern index
            s += inArray && string[s]==','? 1 : 0;                      // if inArray and string comma, advance string index
            break;
        case '!':                                                   // ...is '!',
            if (s4!='true' && s5!='false')                              // if string is invalid,
                return false;                                               // return string doesn't conform to pattern
            s += s4=='true'? 4 : 5;                                     // advance string index
            p += !inArray || string[s]!=','? 1 : 0;                     // if !inArray or string !comma, advance pattern index
            s += inArray && string[s]==','? 1 : 0;                      // if inArray and string comma, advance string index
            break;
        case '.':                                                   // ...is '.',
            p += 3;                                                     // advance pattern index to char beyond '...'
            while (s<string.length && string[s]!=pattern[p])            // while string char isn't char beyond '...',
                s += 1;                                                     // advance string index
            break;
        default:                                                    // otherwise,
            if (string[s] != pattern[p])                                // if string doesn't match pattern,
                return false;                                               // return string doesn't conform to pattern
            p += 1;                                                     // advance pattern index
            s += 1;                                                     // advance string index
        }
    }
    return s==string.length && p==pattern.length;               // if all parsed, return string conforms to pattern
}

// Return index of the pattern that matches the object (or none)
function msgIndex(string='', pattern=['']) {
    for (let i=0; i<pattern.length; i++)
        if (conforms(string, pattern[i]))
            return i;
    return none;
}

// Send server message object m and, if also local, dispatch message
function send(m) {
    const s = JSON.stringify({id:player[0], t:q.length, ...m}); // s = stringified message object
    if (role != 'solo') {                                       // if not solo,
        q.push(s);                                                  // add stringified message to queue
        if (online) {                                               // if online,
            for (let i=txed; txed<q.length; i++) {                      // for each untxed message in queue,
                websocket.send(q[i]);                                       // tx untxed message
                txed++;                                                     // update txed counter
                txms = Date.now();                                          // update tx counter
            }
            clearInterval(wsTimer);                                     // delay beat to avoid unneeded resends
            wsTimer = setInterval(wsTimerEvent, wsTime);
        }
    }
    if (msgLocal[msgIndex(s, validSyn)])                            // if message string is also ok to dispatch,
        setTimeout(msgFunct[msgIndex(s, validSyn)], 0, m);              // dispatch message object
}

/////////////////////////////////////////////////////////////
//                     EVENT HANDLERS                      //
/////////////////////////////////////////////////////////////

// Send leftMsg and reload app
function termOkEvent() {
    location.reload();
}

// Cancel termination
function termCancelEvent() {
    termDlg.close();
}

// Show termination dialog, then await termOkEvent or cancel
function appCloseEvent() {
    termDlg.showModal();
}

// Hide current helpDiv (if any); display new helpDiv topic
function helpEvent(topic) {
    resetPlayPag(none);
    for (const div of helpDiv)
        if (div.id == topic) {
            if (helpStack.length)
                helpStack.at(-1).style.display = 'none';
            div.style.display = 'block';
            helpStack.push(div);
            break;
        }
}

// Pop and hide current helpDiv, then display previous helpDiv
function helpCloseEvent() {
    if (helpStack.length > 0)
        helpStack.pop().style.display = 'none';
    if (helpStack.length > 0)
        helpStack.at(-1).style.display = 'block';
}

// Display infoDiv
function infoEvent() {
    infoBdr.textContent = `${player[bidder]} won bid.`;
    let i = 0;
    for (const s of sArray)
        infoCell[i++].textContent = remaining[ace+s] - nValue(p0,ace+s);
    for (const s of sArray) {
        let q = 0;
        for (const r of rArray)
            q += remaining[r+s] - nValue(p0,r+s);
        infoCell[i++].textContent = q;
    }
    infoGrd.style.display = show[counts]? 'grid' : 'none';
    infoTake.textContent = `Your take: ${takeO} of ${needO}. Their take: ${takeE} of ${needE}.`;
    infoDiv.style.display = 'flex';
}

// Clear infoDiv
function infoCloseEvent() {
    infoDiv.style.display = 'none';
}

// Reload app after player clicks Ok for left dialog
function leftOkEvent() {
    location.reload();
}

// Alert player, then reload app
function outEvent(m) {
    log(`${m.out}: {out:${m.out}}`);
    if (m.out == player[0])
        location.reload();
    leftNam.textContent = m.out;
    leftDlg.showModal();
}

// Update waiting text (not all ready) or reload game (game over) or deal next hand (dealer)
function nextOkEvent(m) {
    log(`${m.nextOk}: {nextOk:${m.nextOk}}`);
    if (!player.includes(m.nextOk))
        return;
    nextOk[player.indexOf(m.nextOk)] = true;
    if (nextOk.includes(false))
        handTxt.textContent = `Waiting for ${player[nextOk.indexOf(false)]}`;
    else {
        if (takeO==50 || takeE==50 || scoreO>=500 || scoreE>=500)
            location.reload();
        else if (dealer==p0 || role!='join'&&robot[dealer]) {
            let h = Array(deckCards).fill(0).map((h,i,a)=>i%handCards);
            shuffleArray(h, deckCards);
            h = [...h.slice(0,20).sort(down), ...h.slice(20,40).sort(down), ...h.slice(40,60).sort(down), ...h.slice(60,80).sort(down)];
            send({deal:h});
        }
    }
}

// Display 'waiting'; advance dealer; send okMsg; then await nextOkEvent
function handBtnEvent() {
    handBtn.style.display = 'none';
    handTxt.style.display = 'inline';
    dealer = next[dealer];
    send({nextOk:player[0]});
}

// Display handDiv, defer any dealMsg, then await handBtnEvent
function handEndedEvent() {
    const tossE = teamE[bidder] && toss;
    const tossO = teamO[bidder] && toss;
    const bidE = Math.max(bid[p0], bid[p2]);
    const bidO = Math.max(bid[p1], bid[p3]);
    infoBlks.style.display = 'none';
    handCell[4].innerHTML = scoreE;
    handCell[5].innerHTML = scoreO;
    handCell[7].innerHTML = teamE[bidder]? bidE : 'Pass';
    handCell[8].innerHTML = teamO[bidder]? bidO : 'Pass';
    handCell[10].innerHTML = meldE<20||(!tossO&&takeE<20)||(teamE[bidder]&&meldE+takeE<bidE)? `<s>&nbsp;${meldE}&nbsp;</s>` : meldE;
    meldE = meldE<20||(!tossO&&takeE<20)? 0 : meldE;
    handCell[11].innerHTML = meldO<20||(!tossE&&takeO<20)||(teamO[bidder]&&meldO+takeO<bidO)? `<s>&nbsp;${meldO}&nbsp;</s>` : meldO;
    meldO = meldO<20||(!tossE&&takeO<20)? 0 : meldO;
    handCell[13].innerHTML = takeE>0&&(takeE<20||(teamE[bidder]&&meldE+takeE<bidE))? `<u><s>&nbsp;${takeE}&nbsp;</s></u>` : `<u>${takeE}</u>`;
    takeE = takeE<20? 0 : takeE;
    handCell[14].innerHTML = takeO>0&&(takeO<20||(teamO[bidder]&&meldO+takeO<bidO))? `<u><s>&nbsp;${takeO}&nbsp;</s></u>` : `<u>${takeO}</u>`;
    takeO = takeO<20? 0 : takeO;
    scoreE += teamE[bidder]&&meldE+takeE<bidE? -bidE : meldE+takeE;
    scoreO += teamO[bidder]&&meldO+takeO<bidO? -bidO : meldO+takeO;
    handCell[16].innerHTML = scoreE;
    handCell[17].innerHTML = scoreO;
    if (takeE==50 || (scoreE>=500 && scoreO<500) || (scoreE>=500 && scoreO>=500 && teamE[bidder]))
        handPar.textContent = `Woohoo! You win!`;
    else if (takeO==50 || (scoreO>=500 && scoreE<500) || (scoreE>=500 && scoreO>=500 && teamO[bidder]))
        handPar.textContent = `Boohoo! You lose!`;
    else
        handPar.textContent = `${player[next[dealer]]} deals next.`;
    handBtn.style.display = 'inline';
    handTxt.style.display = 'none';
    handDiv.style.display = 'block';
    nextOk[0]=robot[0], nextOk[1]=robot[1], nextOk[2]=robot[2], nextOk[3]=robot[3];
}

// Pull trick; if cards, set position then await refannedEvent; if no cards, award bonus then await handEndedEvent
function trickViewedEvent() {
    for (const c of cArray)
        if (card[c].g == cntr)
            moveCard(c, cntr, 0, gone, 100, false, dealTime/10, c, cpArray[card[highCard].p][0]);
    if (nGroup(hand) > 0) {
        position = card[highCard].p;
        chosen = leadCard = highCard = none;
        setTimeout(refannedEvent, dealTime/10);
    } else {
        takeO += card[highCard].o? 2 : 0;
        takeE += !card[highCard].o? 2 : 0;
        trumpIco.style.display = 'none';
        trumpTxt.textContent = '';
        infoHnt[p1].style.display = infoHnt[p2].style.display = infoHnt[p3].style.display = 'none';
        setTimeout(handEndedEvent, dealTime/10);
    }
}

// Update take, then await trickViewedEvent
function trickPlayedEvent() {
    for (const c of cArray) {
        takeO += card[c].g==cntr && card[c].t && card[highCard].o? 1 : 0;
        takeE += card[c].g==cntr && card[c].t && !card[highCard].o? 1 : 0;
    }
    setTimeout(trickViewedEvent, dealTime/4);
}

// Close hand, advance position, then await trickPlayedEvent(all played) or refannedEvent
function cardPlayedEvent() {
    relocate();
    for (const c of cpArray[position])
        moveCard(c, card[c].g, 0, card[c].g, card[c].z, card[c].f, 0);
    position = next[position];
    if (nGroup(cntr) == positions)
        setTimeout(trickPlayedEvent, 100);
    else
        setTimeout(refannedEvent, 100);
}

// Clear slide, note chosen card, update stats, play chosen card(!p0), then await cardPlayedEvent
function playEvent(m) {
    chosen = (m.play + (deckCards - pPlayer * handCards)) % deckCards;
    log(`${player[position]}: {play:${value$[card[chosen].v]}}`);
    clearTimeout(fadeId);
    slideImg[p0].style.opacity = slideImg[p1].style.opacity = slideImg[p2].style.opacity = slideImg[p3].style.opacity = '0';
    // if chosen card is in high suit and doesn't beat non-ace high card, position must not have any cards that can beat the high card 
    if (highCard!=none && card[chosen].s==card[highCard].s && card[highCard].r!=ace && card[chosen].r<=card[highCard].r)
        for (let v = card[highCard].v+1; v<=ace+card[highCard].s; v++)
            maxCards[position][v] = 0;
    // if no lead card, chosen card must be the lead card and the high card
    if (leadCard == none)
        leadCard = highCard = chosen;
    // if chosen card is in trump and trump wasn't led, position must be out of the first suit
    if (card[chosen].m && !card[leadCard].m)
        for (let v = jack+card[leadCard].s; v <= ace+card[leadCard].s; v++)
            maxCards[position][v] = 0;
    // if chosen card is in high suit and beats high card, we have a new high card
    if (card[chosen].s==card[highCard].s && card[chosen].r>card[highCard].r)
        highCard = chosen;
    // if chosen card is in trump and the high suit isn't trump, we have a new high card
    if (card[chosen].m && !card[highCard].m)
        highCard = chosen;
    // if chosen card doesn't follow the lead and isn't trump, position must be out of lead suit and trump
    if (card[chosen].s!=card[leadCard].s && !card[chosen].m)
        for (const r of rArray)
            maxCards[position][r+card[leadCard].s] = maxCards[position][r+trump] = 0;
    remaining[card[chosen].v]--;
    minCards[position][card[chosen].v] = Math.max(minCards[position][card[chosen].v] - 1, 0);
    let loose = remaining[card[chosen].v]
    for (const p of pArray)
        loose -= minCards[p][card[chosen].v];
    for (const p of pArray)
        maxCards[p][card[chosen].v] = Math.min(maxCards[p][card[chosen].v], minCards[p][card[chosen].v] + loose);
    if (position != p0)
        moveCard(chosen, card[chosen].g, 0, cntr, playZ++, true, dealTime/10);
    setTimeout(cardPlayedEvent, dealTime/10);
}

// Select card
function pointerDownEvent(e) {
    e.preventDefault();
    pickedC = cardImg.indexOf(e.target);
    pickedE = e.target;
    pickedE.setPointerCapture(e.pointerId);
    offsetX = e.clientX - card[pickedC].hand.x;
    offsetY = e.clientY - card[pickedC].hand.y;
    fnsh = `translate(${e.clientX-offsetX}px, ${e.clientY-offsetY}px)`;
};

// Drag card
function pointerMoveEvent(e) {
    e.preventDefault();
    if (pickedE) {
        strt = fnsh;
        fnsh = `translate(${e.clientX-offsetX}px, ${e.clientY-offsetY}px)`;
        pickedE.animate([{transform:strt}, {transform:fnsh}], {duration:0, fill:'forwards'});
    };
};

// If click or big move to center, move card to center, send cardMsg; otherwise return card to hand
function pointerUpEvent(e) {
    const deltaY = card[pickedC].hand.y - (e.clientY - offsetY);
    e.preventDefault();
    if (pickedE) {
        if (deltaY==0 || deltaY>cardh/2) {
            card[pickedC].g = cntr;
            cardImg[pickedC].style.zIndex = card[pickedC].z = playZ++;
            strt = fnsh;
            fnsh = `translate(${card[pickedC].cntr.x}px, ${card[pickedC].cntr.y}px)`;
            pickedE.animate([{transform:strt}, {transform:fnsh}], {duration:dealTime/10, fill:'forwards'});
            for (const c of cpArray[p0]) {
                cardImg[c].onpointerdown = cardImg[c].onpointermove = cardImg[c].onpointerup = '';
                cardImg[c].style.filter = card[c].g==hand? 'brightness(70%)' : 'brightness(100%)';
            }
            send({play:(pickedC + pPlayer*handCards) % deckCards});
        } else {
            strt = fnsh;
            fnsh = `translate(${card[pickedC].hand.x}px, ${card[pickedC].hand.y}px)`;
            pickedE.animate([{transform:strt}, {transform:fnsh}], {duration:dealTime/10, fill:'forwards'});
        }
        pickedE = null;
    }
}

// If my bot, choose card & send cardMsg, then await pointerDown/pointerMove/pointerDown/cardMsg events
function refannedEvent() {
    gameHelp.onclick = ()=>{helpEvent('playHelp')};
    showHints();
    fadeId = setTimeout(()=>{slideImg[position].style.opacity='1'}, fadeDelay);
    for (const c of cpArray[p0]) {
        if (nGroup(cntr)<=[3,0,1,2][position] && card[c].g==hand)
            cardImg[c].style.filter = `brightness(${legal(c)?'100%':'70%'})`;
        if (position==p0 && legal(c)) {
            cardImg[c].onpointerdown = pointerDownEvent;
            cardImg[c].onpointermove = pointerMoveEvent;
            cardImg[c].onpointerup = pointerUpEvent;
        }
    }
    if (role!='join' && robot[position]) {
        chosen = botCard();
        send({play:(chosen + pPlayer*handCards) % deckCards});
    }
}

// Refan hands, then await refannedEvent
function meldGatheredEvent() {
    for (const c of cArray) {
        cardImg[c].style.filter = card[c].p==p0? 'brightness(70%)' : 'brightness(100%)';
        card[c].g = hand;
    }
    relocate();
    for (const c of cArray)
        if (show[hands] || card[c].p==p0)
            moveCard(c, gone, 0, hand, c, true, dealTime/10);
        else
            moveCard(c, gone, 0, hand, -c, false, dealTime/10);
    for (const p of pArray)
        infoBid[p].style.display = 'none';
    trumpIco.src = suitSrc[trump];
    trumpIco.style.display = 'block';
    setTimeout(refannedEvent, dealTime/10);
}

// Update waiting text (not all ready) or clear needDiv, gather meld, then await meldGathered or handEnded event
function playOkEvent(m) {
    log(`${m.playOk}: {playOk:${m.playOk}}`);
    if (!player.includes(m.playOk))
        return;
    playOk[player.indexOf(m.playOk)] = true;
    if (playOk.includes(false))
        needTxt.textContent = `Waiting for ${player[playOk.indexOf(false)]}`;
    else {
        needDiv.style.display = 'none';
        for (const c of cArray) {
            cardImg[c].style.filter = 'brightness(100%)';
            moveCard(c, hand, 0, gone, -c, false, dealTime/10);
        }
        if (toss)
            setTimeout(handEndedEvent, dealTime/10);
        else
            setTimeout(meldGatheredEvent, dealTime/10);
    }
}

// Send trumpMsg (if bidder is player), signal ready, replace buttons with wait message
function okBtnEvent() {
    if (bidder == p0)
        send({trump:trump, toss:false});
    send({playOk:player[0]});
    okBtn.style.display = tossBtn.style.display = 'none';
    needTxt.textContent = 'Waiting for others.';
    needTxt.style.display = 'block';
}

// Send trumpMsg, signal ready, replace buttons with wait message
function tossBtnEvent() {
    send({trump:trump, toss:true});
    send({playOk:player[0]});
    okBtn.style.display = tossBtn.style.display = 'none';
    needTxt.textContent = 'Waiting for others.';
    needTxt.style.display = 'block';
}

// Display needDiv, then await okBtnEvent or tossBtnEvent
function meldFannedEvent() {
    needPara[0].innerHTML = `${bidder==p0?'You':player[bidder]} picked ${suit$[trump]}.`;
    needPara[1].innerHTML = `Your meld is ${meldE<20?'<20':meldE}.<br>Their meld is ${meldO<20?'<20':meldO}.`;
    if (marriages(bidder,trump)==0)
        needPara[2].innerHTML = `${bidder==p0?'You must toss':player[bidder]+' tossed'} due to no marriage.`;
    else if (toss)
        needPara[2].innerHTML = `${player[bidder]} tossed the hand.`;
    else
        needPara[2].innerHTML = `You need ${needE} points.<br>They need ${needO} points.`;
    okBtn.style.display = bidder==p0 && marriages(p0,trump)==0? 'none' : 'inline';
    tossBtn.style.display = bidder==p0? 'inline' : 'none';
    needTxt.style.display = 'none';
    needDiv.style.display = 'flex';
    gameHelp.onclick = ()=>{helpEvent('tossHelp')};
}

// Dim/display meld, then await meldFanned event
function regatheredEvent() {
    for (const c of cArray)                                     // group p0 and known cards into positions' hands
        card[c].g = card[c].p==p0 || card[c].k? hand : gone;
    relocate();                                                 // reset card and info text locations
    for (const c of cArray) {                                   // dim unknown cards and move cards to their new locations
        cardImg[c].style.filter = card[c].k? 'brightness(100%)' : 'brightness(70%)';
        moveCard(c, gone, 0, card[c].g, c, true, dealTime/10);
    }
    setTimeout(meldFannedEvent, dealTime/10);                   // await meldFanned event
}

// Set trump/toss and, if I'm not the bid winner, tag meld, clear bid text, gather hands then await regathered event
function trumpEvent(m) {
    log(`${player[bidder]}: {trump:${suit$[m.trump]}, toss:${m.toss}}`);
    trump = m.trump;                                            // set trump suit and toss flag
    toss = m.toss;
    playOk[0]=robot[0], playOk[1]=robot[1], playOk[2]=robot[2], playOk[3]=robot[3];
    if (bidder != p0) {                                         // if bid winner isn't me,
        tagMeld();                                                  // tag the meld cards
        bidDiv.style.display = 'none';                              // clear bid text
        for (const c of cArray)                                     // gather hands
            moveCard(c, hand, 0, gone, -c, false, dealTime/10);
        setTimeout(regatheredEvent, dealTime/10);                   // await regathered event
    }
}

// Set trump, tag meld, clear trumpDiv, gather hands, then await regathered event
function trumpBtnEvent(s) {
    trump = s;
    tagMeld();
    trumpDiv.style.display = 'none';
    for (const c of cArray)
        moveCard(c, hand, 0, gone, -c, false, dealTime/10);
    setTimeout(regatheredEvent, dealTime/10);
}

// Note bid, advance bidder, then retrigger fannedEvent
function bidEvent(m) {
    log(`${player[bidder]}: {bid:${m.bid==0?'Pass':m.bid}}`);
    updateEst(m.bid);
    bid[bidder] = m.bid;
    infoBid[bidder].innerHTML = bidString(bidder);
    bidder = next[bidder];
    setTimeout(fannedEvent);
}

// Send bidMsg, then await bidMsg or declareMsg
function passBtnEvent() {
    logBid(pass, 'Undisclosed');
    send({bid:pass});
}

// Decrease bid button value, then await lessBtn, bidBtn or moreBtn
function lessBtnEvent() {
    const highBid = Math.max(...bid, 49);
    if (Number(bidBtn.value) != highBid + (highBid<60?1:5))
        bidBtn.value = Number(bidBtn.value) - (Math.max(...bid,Number(bidBtn.value))<=60?1:5);
    if (Number(bidBtn.value) == highBid + (highBid<60?1:5))
        lessBtn.disabled = true;
}

// Send bidMsg, then await bidMsg or declareMsg
function bidBtnEvent() {
    logBid(Number(bidBtn.value), 'Undisclosed');
    send({bid:Number(bidBtn.value)});
}

// Increase bid button value, then await lessBtn, bidBtn or moreBtn
function moreBtnEvent() {
    bidBtn.value = Number(bidBtn.value) + (Math.max(...bid,Number(bidBtn.value))>=60?5:1);
    lessBtn.disabled = false;
}

// Send my bot's next bidMsg then await bidMsg or trumpMsg
function botBidEvent() {
    const left    = next[bidder];
    const across  = next[left];
    const right   = next[across];
    const highBid = Math.max(...bid);
    const maxBid  = maxMeld(bidder) + est[across] + 20 + quality(bidder);
    let b = bid[bidder];
    if (nPass() == 3)
        b = logBid(Math.max(b, 50), 'Last bid');
    else if (noMarriages(bidder))
        b = logBid(pass, 'No marriage');
    else if (bid[left]==none && bid[right]!=pass && highBid<60 && quality(bidder)>0 && maxBid>=60)
        b = logBid(60, 'Block bid');
    else if (b==none && bid[across]!=pass && highBid<58 && minMeld(bidder)>15)
        b = logBid(Math.min(Math.max(50, ...bid) + Math.round(minMeld(bidder)/10), 59), 'Jump bid');
    else if (highBid<60 && quality(bidder)>=0 && maxBid>=60 && maxBid<70)
        b = logBid(60, 'Worried');
    else if (quality(bidder)>=0 && nextBid() <= maxBid)
        b = logBid(nextBid(), 'Want bid');
    else if (highBid<50 && across==dealer)
        b = logBid(50, 'Save');
    else if (quality(bidder) < 0)
        b = logBid(pass, 'Bad quality');
    else
        b = logBid(pass, 'Too high');
    send({bid:b});
}

// Display bidDiv, handle situation, then await trumpBtn, trumpMsg, botBid, lessBtn, bidBtn, moreBtn or bidMsg event
function fannedEvent() {
    while (bid[bidder] == pass)                                 // skip players who already passed
        bidder = next[bidder];
    meldSpan[0].textContent = meld(p0, spades);                 // display bidDiv
    meldSpan[1].textContent = meld(p0, hearts);
    meldSpan[2].textContent = meld(p0, clubs);
    meldSpan[3].textContent = meld(p0, diamonds);
    if (bidder == p0) {
        bidBtn.value = nextBid();
        lessBtn.disabled = true;
        passBtn.disabled = moreBtn.disabled = nPass()==3;
        passBtn.style.display = lessBtn.style.display = bidBtn.style.display = moreBtn.style.display = 'inline';
        bidTxt.style.display = 'none';
    } else {
        passBtn.style.display = lessBtn.style.display = bidBtn.style.display = moreBtn.style.display = 'none';
        bidTxt.textContent = `Waiting for ${player[bidder]}.`;
        bidTxt.style.display = 'inline';
    }
    bidDiv.style.display = 'flex';
    if (nPass()==3 && bid[bidder]!=none) {                      // if bidding is complete,
        position = bidder;                                          // first position will be the bid winner
        toss = false;                                               // hand is not tossed yet
        if (bidder == p0) {                                         // if user won the bid,
            bidDiv.style.display = 'none';                              // clear bid text
            trumpBtn[0].value = `Spades (${meld(p0, spades)})`;         // display trump text and await trumpBtnEvent
            trumpBtn[1].value = `Hearts (${meld(p0, hearts)})`;
            trumpBtn[2].value = `Clubs (${meld(p0, clubs)})`;
            trumpBtn[3].value = `Diamonds (${meld(p0, diamonds)})`;
            trumpBtn[0].disabled = marriages(p0,spades)==0 && !noMarriages(bidder);
            trumpBtn[1].disabled = marriages(p0,hearts)==0 && !noMarriages(bidder);
            trumpBtn[2].disabled = marriages(p0,clubs)==0 && !noMarriages(bidder);
            trumpBtn[3].disabled = marriages(p0,diamonds)==0 && !noMarriages(bidder);
            trumpDiv.style.display = 'flex';
            gameHelp.onclick = ()=>{helpEvent('trumpHelp')};
        } else if (role!='join' && robot[bidder]) {                 // otherwise, if my bot won the bid,
            send({trump:botSuit(), toss:botToss()});                 // send my bot's trumpMsg
        } else {                                                    // otherwise,
            bidTxt.textContent = `Waiting for ${player[bidder]}.`;     // await trumpEvent
        }
    } else if (role!='join' && robot[bidder]) {                 // otherwise, if it's my bot's bid,
        setTimeout(botBidEvent, dealTime/4);                        // trigger botBidEvent after delay
    }
}

// relocate hands and infoBlks, fan hands, then await fannedEvent
function gatheredEvent() {
    for (const c of cArray)
        card[c].g = hand;
    relocate();
    for (const c of cArray)
        if (show[hands] || card[c].p==p0)
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

// Deal cards based on dealMsg
function dealEvent(m) {
    log(`${player[dealer]}: {deal:[...]}`);
    for (const c of cArray) {                                   // deck is from m.deal, offset to my perspective
        card[c].c = c;
        card[c].p = plyr[c];
        card[c].o = teamO[card[c].p];
        card[c].v = m.deal[(c + pPlayer*handCards) % deckCards];
        card[c].s = suit[card[c].v];
        card[c].r = rank[card[c].v];
        card[c].t = high[card[c].v];
        card[c].g = hand;
        card[c].m = false;
        card[c].z = 0;
        card[c].f = false;
        card[c].k = false;
        cardImg[c].style.filter = 'brightness(100%)';
    }
    bidder = next[dealer];                                      // bidder is left of dealer
    bid.fill(none);                                             // no bids yet
    est.fill(typical)                                           // no jump bids yet
    remaining.fill(4);                                          // no cards played
    chosen = leadCard = highCard = none;                        // no chosen, lead or high card yet
    takeO = takeE = 0;                                          // no take yet;
    logHands();
    playPag.style.display = 'none';
    gamePag.style.display = 'block';
    handDiv.style.display = 'none';
    for (const p of pArray) {
        infoNam[p].textContent = player[p];
        infoBid[p].innerHTML = '';
        infoBid[p].style.display = 'inline';
    }
    infoHnt[p1].style.display = infoHnt[p2].style.display = infoHnt[p3].style.display = 'none';
    infoBlks.style.display = 'block';
    card[0].g = heap;                                           // ensure infoNam is not under heap
    relocate();
    let d = 0;
    let p = next[dealer];
    for (const z of cArray) {
        const c = cpArray[p][0] + Math.floor(z/positions);
        moveCard(c, gone, d, heap, z, false, dealTime/20, cpArray[dealer][0], c);
        d += (dealTime - dealTime / 20) / deckCards;
        p = next[p];
    }
    playZ = -1000;
    setTimeout(dealtEvent, dealTime);
}

// Set pPlayer, player, robot, show and dealer based on playerMsg, update playPag, then, deal or await deal
function playerEvent(m) {
    log(`${m.player[0]}: {player:[${m.player}], flag:[${m.flag}]}`);
    pPlayer = m.player.indexOf(player[0]);                      // pPlayer is position of player[0] from maker's perspective
    for (const p of pArray) {                                   // for each position,
        player[p] = m.player[(p+pPlayer)%positions];                // set player name
        robot[p] = m.flag[(p+pPlayer)%positions];                   // set robot flag
    }
    show[counts] = m.flag[4];                                   // set show[counts] flag
    show[hands] = m.flag[5];                                    // set show[hands] flag
    saveSettings();                                             // save settings
    dealer = (p0 + (positions - pPlayer)) % positions;          // first dealer is p0 from maker's perspective
    resetPlayPag(none);
    if (role == 'join') {                                       // if joiner,
        const group = [];                                           // start group
        for (const p of pArray)                                     // for each position,
            if (!robot[p])                                              // if not robot,
                group.push(player[p]);                                      // add player to group
        send({group:group});                                        // send group message to server
    } else {                                                    // otherwise, send first dealMsg
        let h = Array(deckCards).fill(0).map((h,i,a)=>i%handCards);
        shuffleArray(h, deckCards);
        h = [...h.slice(0,20).sort(down), ...h.slice(20,40).sort(down), ...h.slice(40,60).sort(down), ...h.slice(60,80).sort(down)];
        send({deal:h});
    }
}

// If maker, update waiting text (not all positions ready) or send setMsg (all positions ready)
function inEvent(m) {
    log(`${m.in}: {in:${m.in}}`);
    if (role!='make' || !player.includes(m.in) || setOk[player.indexOf(m.in)])
        return;
    setOk[player.indexOf(m.in)] = true;
    if (setOk.includes(false))
        playTxt.textContent = `Waiting for ${player[setOk.indexOf(false)]}`;
    else
        send({player:player, flag:[...robot, ...show]});
}

// Ignore logout message (server action only)
function logoutEvent(m) {
    log(`${m.logout}: {logout:${m.logout}}`);
}

// Ignore group message (server action only)
function groupEvent(m) {
    log(`${player[p0]}: {group:[${m.group}]}`);
}

// Ignore login message (server action only)
function loginEvent(m) {
    log(`${m.login}: {login:${m.login}}`);
}

// Set role when a role box is clicked
function roleEvent(r) {
    role = r;
    saveSettings();
    resetPlayPag(none);
}

// Update playPag based on nameInp's keydown event
function nameInpKeyEvent(e) {
    const k = e.key;
    const p = nameInp.indexOf(e.target);
    if (k=='Backspace' || k=='Tab' || (nameInp[p].value.length<10 && k.length==1 && nameChrs.includes(k)))
        return;
    if (k=='Escape')
        nameInp[p].value = '';
    if (k=='Enter')
        nameInp[p].blur();
    e.preventDefault();
}

// Update playPag when nameInp loses focus
function nameInpBlurEvent(e) {
    const p = nameInp.indexOf(e.target);
    const name = nameInp[p].value.trim();
    if (name != '') {
        if (player.includes(name))
            player[player.indexOf(name)] = 'TBD';
        player[p] = name;
        if (!names.includes(name)) {
            names.push(name);
            names.sort();
        }
        saveSettings();
    }
    resetPlayPag(none);
}

// Prepare to enter a name when a nameList New name or add icon is clicked
function newEvent(e) {
    const p = nameLst.indexOf(e.target.parentElement.parentElement);
    resetPlayPag(none);
    nameBtn[p].style.display = 'none';
    nameInp[p].value = '';
    nameInp[p].placeholder = 'Enter new name';
    nameInp[p].style.display = 'block';
    nameInp[p].focus();
}

// Select a name when a nameLst name is clicked
function namEvent(e) {
    const p = nameLst.indexOf(e.target.parentElement.parentElement);
    const name = e.target.textContent;
    if (player.includes(name))
        player[player.indexOf(name)] = 'TBD';
    player[p] = name;
    saveSettings();
    resetPlayPag(none);
    if (p == p3)
        showInp[p0].focus();
    else
        nameBtn[next[p]].focus();
}

// Delete name when a nameLst del icon is clicked
function delEvent(e) {
    const p = nameLst.indexOf(e.target.parentElement.parentElement);
    const name = e.target.previousElementSibling.textContent;
    if (player.includes(name))
        player[player.indexOf(name)] = 'TBD';
    names.splice(names.indexOf(name), 1);
    saveSettings();
    resetPlayPag(p);
} 

// Open or close a nameLst when a nameBtn or drop icon is clicked
function nameBtnEvent(e) {
    const p = Math.max(nameBtn.indexOf(e.target), nameBtn.indexOf(e.target.parentElement));
    e.preventDefault();
    if (getComputedStyle(nameLst[p]).visibility == 'hidden')
        resetPlayPag(p);
    else
        resetPlayPag(none);
}

// Toggle robot[p] when robot box is clicked
function botBoxEvent(p) {
    robot[p] = !robot[p];
    saveSettings();
    resetPlayPag(none);
}

// Toggle show when a show box is clicked
function showEvent(e) {
    const s = showInp.indexOf(e.target);
    show[s] = !show[s];
    saveSettings();
    resetPlayPag(none);
}

// Handle play ('Play single', 'Start multi' or 'Join multi') button
function playBtnEvent() {
    if (robot[p1] && robot[p2] && robot[p3])
        role = 'solo';
    switch (role) {
    case 'solo':
        robot[p1] = robot[p2] = robot[p3] = true;
        saveSettings();
        send({player:player, flag:[...robot, ...show]});
        break;
    case 'make':
        setOk.splice(0, positions, true, robot[1], robot[2], robot[3]);
        playBtn.style.display = 'none';
        playTxt.textContent = `Waiting for ${setOk.includes(false)?player[setOk.indexOf(false)]:'server'}`;
        playTxt.style.display = 'block';
        const group = [];
        for (const p of pArray)
            if (!robot[p])
                group.push(player[p]);
        send({login:player[0]});
        send({group:group});
        break;
    case 'join':
        playBtn.style.display = 'none';
        playTxt.textContent = `Waiting for ${online?'starter':'server'}`;
        playTxt.style.display = 'block';
        send({login:player[0]});
    }
    resetPlayPag(none);
}

// If pong not received in time, close websocket and force new websocket
function pongTimerEvent() {
    log(`pongTimerEvent`);
    websocket.close();
    websocket.onclose = websocket.onerror = websocket.onmessage = websocket.onopen = null;
    createSocket(true);
}

// Handle incoming websocket message event e
function wsMessageEvent(e) {
    let logged = false;                                         // server message not yet logged

    // Ignore message if it won't parse
    try {JSON.parse(e.data)} catch(error) {
        note(`ignored (caught:${error.name}, detail:${error.message})`);
        return;
    }

    // Ignore message if it won't parse to a simple object
    const m = JSON.parse(e.data);                               // m is the message object
    if (typeof m!='object' || m=='null' || Array.isArray(m)) {
        note(`ignored (not object)`);
        return;
    }

    // Handle pongMsg
    if (conforms(e.data, pongSyn)) {                            // if pongMsg string,
        clearTimeout(pongTimer);                                    // reset pongTimer
        pongTimer = setTimeout(pongTimerEvent, pongTime);
        if (m.id == '') {                                           // if not logged in,
            //note('ignored (empty id)');                                 // note action taken
            return;                                                     // ignore pong
        }
        if (m.pong > txed) {                                        // if rxed more than txed,
            note(`advanced (txed:${txed})`);                            // note action taken
            q.length = txed = m.pong;                                   // advance queue and txed to match rxed
        }
        if (txed>m.pong && Date.now()>txms+pongTime)                // if more txed than rxed and enough time has elapsed,
            for (let i=m.pong; i<txed; i++) {                           // for every unrxed message that was txed,
                note(`resent ${q[i].slice(0,90)}`);                         // note action taken
                websocket.send(q[i]);                                           // resend unrxed message
            }
        else                                                        // otherwise,
            //note(`no action required`);                                 // note action taken
        return;                                                     // return
    }

    // Handle all other valid messages
    if (msgIndex(e.data, validSyn) != none) {                   // if valid message string,
        if (m.t > rxed) {                                           // if txed more than rxed,
            note(`ignored (rxed:${rxed})`);                             // note action taken
            return;                                                     // return to allow server to resend lost
        }
        if (rxed > m.t) {                                           // if rxed more than txed,
            note(`rewound (rxed:${rxed})`);                             // note action taken
            rxed = m.t;                                                 // rewind rxed to match txed
        }
        rxed++;                                                     // increment server msgs rxed counter
        setTimeout(msgFunct[msgIndex(e.data, validSyn)], 0, m);     // dispatch message object
        return;                                                     // return;
    }

    // Handle unrecognized message
    note(`discarded (unrecognized)`);                           // note action
    return;

    // Note server message (one time) and action taken
    function note(action) {
        if (!logged)
            log(`${e.data.slice(0,100)}`);
        if (action)
            log(`-- ${action}`);
        logged = true;
    }
}

// Websocket open: Display online, transmit queued messages, start pong timer
function wsOpenEvent() {
    log(`wsOpenEvent`);
    online = true;                                              // note player[0] is online
    playIco.style.display = 'none';
    gameIco.style.display = 'none';
    netDlg.close();
    for (let i=txed; i<q.length; i++) {                          // for each untxed client message,
        websocket.send(q[i]);                                       // tx untxed client message
        txed++;                                                      // increment tx number
    }
    clearTimeout(pongTimer);
    pongTimer = setTimeout(pongTimerEvent, pongTime);
}

// Websocket close: Display offline, stop pongTimer, start reconnect attempts
function wsCloseEvent() {
    log(`wsCloseEvent`);
    online = false;
    playIco.style.display = 'block';
    gameIco.style.display = 'block';
    if (role != 'solo')
        netDlg.showModal();
    clearTimeout(pongTimer);
    clearInterval(wsTimer);
    wsTimer = setInterval(wsTimerEvent, wsTime)
}

// Ignore websocket error events
function wsErrorEvent() {
    log(`wsErrorEvent`);
}

// Send periodic pingMsg and make periodic reconnect attempts
function wsTimerEvent() {
    if (websocket) {
        switch (websocket.readyState) {
        case WebSocket.CONNECTING:
            log(`wsTimerEvent: connecting`);
            break;
        case WebSocket.OPEN:
            //log(`wsTimerEvent: open`);
            websocket.send(JSON.stringify({'id':player[0], ping:rxed}));
            break;
        case WebSocket.CLOSING:
            log(`wsTimerEvent: closing`);
            break;
        case WebSocket.CLOSED:
            log(`wsTimerEvent: closed`);
            createSocket();
        }
    }
}

// Ignore context menu events
function contextmenuEvent(e) {
    e.preventDefault();
}

// Set dynamic sizes and, if sizes changed, redraw deck
function resizeEvent() {
    const em = Number.parseFloat(getComputedStyle(body).fontSize);
    playTtl.textContent = em;
    vw = Number.parseFloat(getComputedStyle(body).width);
    vh = Number.parseFloat(getComputedStyle(body).height);
    cardw = 4 * em;
    cardh = 5.6 * em;
    iconw = 1.32 * em;
    iconh = 1.32 * em;
    pad   = 0.4 * em;
    if (vh!=vh0 || vw!=vw0) {
        vh0 = vh;
        vw0 = vw;
        relocate();
        for (const c of cArray)
            moveCard(c, card[c].g, 0, card[c].g, card[c].z, card[c].f, 0);
    }
}

// Initialize app, then await events
function loadEvent() {

    // Initialize console, images, help text, and game settings
    console.clear();                                            // clear console
    for (const img of document.querySelectorAll('img'))         // prevent player from dragging images
        img.draggable = false;
    for (const c of cArray) {                                   // initialize card images
        cardImg[c].src = backImg[0].src;
        cardImg[c].style.transform = 'translate(-2.8em, -2em)';
    }
    vTxt.textContent = version;                                 // add version to helpPag
    let s = {};                                                 // assume no session or local settings
    if ('pinochle' in sessionStorage)                           // if session settings exist,
        s = JSON.parse(sessionStorage.pinochle);                    // recall session settings
    else if ('pinochle' in localStorage)                        // otherwise, if local settings exist,
        s = JSON.parse(localStorage.pinochle);                      // recall local settings
    if (s.version == version)                                   // if recalled version is ok, replace default settings
        role=s.role, copy(names,s.names), copy(player,s.player), copy(robot,s.robot), copy(show,s.show);
    saveSettings();                                             // save session and local settings

    // Log out of old game (if any)
    createSocket();                                             // create websocket
    wsTimer = setInterval(wsTimerEvent, wsTime);                // start heartbeat timer
    send({logout:player[0]});                                   // logout and tx out messages

    // Initialize playPag
    resetPlayPag(none);                                         // initialize playPag
    nameBtn[p0].focus();

    // Initialize dynamic size and card locations, then draw deck
    setTimeout(resizeEvent);                                    // initialize size variables and card locations

    // Start service worker (if not running from debugger)
    /*if (location.origin != 'file://')
        navigator.serviceWorker.register('service-worker.js', {updateViaCache: 'none'});*/
}

onload        = loadEvent;                                  // prepare for load event
onresize      = resizeEvent;                                // prepare for resize event
oncontextmenu = contextmenuEvent;                           // prepare for context (right-click or long-press) menu events