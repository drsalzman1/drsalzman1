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

// Position values (or none)
const none      = -1;                                       // also used elsewhere
const p0        = 0;                                        // left of user
const p1        = 1;                                        // across from user
const p2        = 2;                                        // right of user
const p3        = 3;                                        // user
const positions = 4;
const pArray    = [p0, p1, p2, p3];
const next      = [p1, p2, p3, p0];                         // next position to the left
const prev      = [p3, p0, p1, p2];                         // next position to the right
const teamO     = [false, true, false, true];               // odd positions (p1, p3)
const teamE     = [true, false, true, false];               // even positions (p0, p2)

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
const body      = document.getElementById('body');
const playPag   = document.getElementById('playPag');
const playIco   = document.getElementById('playIco');
const roleGrd   = document.getElementById('roleGrd');
const soloBox   = document.getElementById('soloBox');
const makeBox   = document.getElementById('makeBox');
const joinBox   = document.getElementById('joinBox');
const nameGrd   = document.getElementById('nameGrd');
const nameBlkNL = document.querySelectorAll('.nameBlk');
const nameBlk   = [nameBlkNL[1], nameBlkNL[2], nameBlkNL[3], nameBlkNL[0]];
const nameBtnNL = document.querySelectorAll('#nameGrd button');
const nameBtn   = [nameBtnNL[1], nameBtnNL[2], nameBtnNL[3], nameBtnNL[0]];
const nameSpnNL = document.querySelectorAll('button span');
const nameSpn   = [nameSpnNL[1], nameSpnNL[2], nameSpnNL[3], nameSpnNL[0]];
const nameImgNL = document.querySelectorAll('button img');
const nameImg   = [nameImgNL[1], nameImgNL[2], nameImgNL[3], nameImgNL[0]];
const nameInpNL = document.querySelectorAll('.nameBlk input');
const nameInp   = [nameInpNL[1], nameInpNL[2], nameInpNL[3], nameInpNL[0]];
const nameLstNL = document.querySelectorAll('.nameLst');
const nameLst   = [nameLstNL[1], nameLstNL[2], nameLstNL[3], nameLstNL[0]];
const botBlkNL  = document.querySelectorAll('.botBlk');
const botBlk    = [botBlkNL[1], botBlkNL[2], botBlkNL[3], botBlkNL[0]];
const botBoxNL  = document.querySelectorAll('.botBlk input');
const botBox    = [botBoxNL[1], botBoxNL[2], botBoxNL[3], botBoxNL[0]];
const showGrd   = document.getElementById('showGrd');
const showInp   = Array.from(document.querySelectorAll('#showGrd input'));
const playBtn   = document.getElementById('playBtn');
const playMsg   = document.getElementById('playMsg');
const gamePag   = document.getElementById('gamePag');
const gameHelp  = document.getElementById('gameHelp');
const trumpIco  = document.getElementById('trumpIco');
const trumpMsg  = document.getElementById('trumpMsg');
const gameIco   = document.getElementById('gameIco');
const bidTxt    = document.getElementById('bidTxt');
const meldSpan  = document.querySelectorAll('#meldColumn span');
const passBtn   = document.getElementById('passBtn');
const lessBtn   = document.getElementById('lessBtn');
const bidBtn    = document.getElementById('bidBtn');
const moreBtn   = document.getElementById('moreBtn');
const bidMsg    = document.getElementById('bidMsg');
const infoBlks  = document.getElementById('infoBlks');
const infoNam   = document.querySelectorAll('.infoNam');
const infoBid   = document.querySelectorAll('.infoBid');
const infoHnt   = document.querySelectorAll('.infoHnt');
const infoChr   = document.querySelectorAll('.infoHnt>span');
const trumpTxt  = document.getElementById('trumpTxt');
const trumpBtn  = document.querySelectorAll('#trumpTxt input');
const needTxt   = document.getElementById('needTxt');
const needPara  = document.querySelectorAll('#needTxt p');
const needMsg   = document.getElementById('needMsg');
const okBtn     = document.getElementById('okBtn');
const tossBtn   = document.getElementById('tossBtn');
const handTxt   = document.getElementById('handTxt');
const handCell  = document.querySelectorAll('#handGrd div');
const handPar   = document.getElementById('handPar');
const handBtn   = document.getElementById('handBtn');
const handMsg   = document.getElementById('handMsg');
const slideImg  = document.querySelectorAll('#slideImg img');
const cardImg   = document.querySelectorAll('#cardImg img');
const faceImg   = document.querySelectorAll('#faceImg img');
const backImg   = document.querySelectorAll('#backImg img');
const infoTxt   = document.getElementById('infoTxt');
const infoBiddr = document.getElementById('infoBiddr');
const infoGrd   = document.getElementById('infoGrd');
const infoCell  = document.querySelectorAll('#infoGrd div');
const infoTake  = document.getElementById('infoTake');
const helpPag   = document.querySelectorAll('#helpPag div');
const netDlg    = document.getElementById('netDlg');
const termDlg   = document.getElementById('termDlg');
const quitDlg   = document.getElementById('quitDlg');
const quitNam   = document.getElementById('quitNam');
const hrefTxt   = document.getElementById('hrefTxt');

// Animation constants
const dealTime  = 2000;                                 // milliseconds to deal all cards

// Legal player name characters
const nameChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' ";

// -------------------------------------- Websocket Protocol ----------------------------------
//
// Client Message                                       Server Action
// ==============                                       =============
// {src:str, smr:int} (aka ping)                        reply with any queued msgs and pong
// {src:str, smr:int, dst:[str], cmt:int, msg:obj}      forward, queue or discard 
//
// Server Message                                       Client Action
// ==============                                       =============
// {cmr:int} (aka pong)                                 reply with any queued msgs and ping
// {cmr:int, smt:int, msg:obj}                          discard or process msg
//
// App Msg                                              Client Action
// =======                                              =============
// {player:[str], robot:[bln], show:[bln]}              set up game
// {play:str}                                           play game, if dealer
// {hand:[int]}                                         deal hand
// {bid:integer}                                        post bid
// {trump:int, toss:bln}                                pick trump and toss/play hand
// {lead:str}                                           lead card, if bid winner
// {card:int}                                           play card
// {deal:str}                                           deal next hand, if dealer
// {quit:str}                                           quit game
//
// Key:Value                                            Example
// =========                                            =======
// bid:    bid (0=pass)                                 bid:50
// card:   0=left's card0, ...79=maker's card19         card:62
// cmr:    client appMsgs received by server            cmr:0
// cmt:    client appMsgs transmitted by client         cmt:0
// deal:   name of player ready for next deal           deal:'Grampy'
// dst:    [n]=remote player n's name                   dst:['Grammy','Grampy']
// exp:    expiration date of unsocketed entry          exp:1784301482813
// hand:   [card] 0=JD, 1=QD, 2=KD, 3=TD, 4=AD, 19=AS   hand:[0,0,0,0,1,1,1,1, ...19,19,19,19]
// lead:   name of player ready for next lead card      lead:'Grampy'
// msg:    appMsg                                       msg:{ready:'Grampy'}
// player: [0]=left, [1]=across, [2]=right, [3]=maker   player:['West','North','East','South']
// play:   name of player ready to play game            play:'Grampy'
// q:      [0]=1st unackd msg, [1]=2nd unackd msg, ...  q:[{deal:'Grampy'}]
// quit:   name of quitter                              quit:'Grammy'
// robot:  [0]=left's a robot, ...[3]=maker's a robot   robot:[true,true,true,false]
// show:   [0]=showCounts, [1]=showHands                show:[true,false]
// smr:    server appMsgs received by client            smr:0
// smt:    server appMsgs transmitted by client         smt:0
// src:    local player name                            src:'Grampy'
// toss:   true=toss, false=play                        toss:true;
// trump:  0=diamonds, 5=clubs, 10=hearts, 15=spades    trump:0
// ws:     websocket                                    ws:{name:'Bob', ...}

// Comm variables
let websocket   = null;                                 // websocket object (or null)
let online      = false;                                // true when websocket is connected to server
let src         = "South";                              // client message source name
let dst         = [];                                   // client message destination names
let smt         = 0;                                    // number of server appMsgs transmitted by server
let smr         = 0;                                    // number of server appMsgs received from server
let cmt         = 0;                                    // number of client appMsgs transmitted to server
let cmr         = 0;                                    // number of client appMsgs received by server
let q           = [];                                   // queue of outgoing messages awaiting acknowledgement
let play        = [];                                   // list of players ready to play game
let lead        = [];                                   // list of players ready for next lead card
let deal        = [];                                   // list of players ready for next deal, if any

// User settings (from maker's perspective) (stored in user's sessionStorage and localStorage as defaults)
let version     = '1.0';                                // version of user settings
let names       = ['East', 'North', 'South', 'West'];   // list of past players
let user        = 'South';                              // User name
let role        = 'solo';                               // User role ('solo', 'make' or 'join')
let player      = ['West', 'North', 'East', 'South'];   // player[p] is name of position p (can't be empty)
let robot       = [true, true, true, false];            // robot[p] is true if position p is a robot
let show        = [true, false];                        // show[counts/hands] is true if counts/hands are to be shown

// Game variables from maker's perspective
let helpStack   = [];                                   // stack of help pages
let shift       = 0;                                    // p3 is shift positions left of maker
let card        = [                                     // card[c] = deck card c
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C
];
let dealer      = p3;                                   // the position who is dealing or last dealt
let bidder      = p0;                                   // the position who is bidding or won the bid
let position    = none;                                 // the position who is choosing then playing a card
let bid         = [none, none, none, none];             // bid[p] = position p's bid (or none or pass)
let est         = [typical, typical, typical, typical]; // est[p] = position p's estimated meld based on jump bids
let trump       = none;                                 // the bidder's trump suit
let toss        = false;                                // the bidder's toss decision
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
let strt = '';                                          // start transform
let fnsh = '';                                          // finish transform

// Animation varaiables
let timeoutId = 0;                                      // Id of opacityEvent timer

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

// Return p rotated clockwise by 'shift' positions; if shift is 1, p0 returns p1 and [p0,p1,p2,p3] returns [p1,p2,p3,p0]
function left(p) {
    if (typeof p == 'number')
        return (p + shift) % positions;
    const temp = Array(p.length);
    for (let i=0; i<positions; i++)
        temp[i] = p[(i + shift) % positions];
    return temp;
}

// Return p rotated counter-clockwise by 'shift' positions; if shift is 1, p1 returns p0 and [p1,p2,p3,p0] returns [p0,p1,p2,p3]
function right(p) {
    if (typeof p == 'number')
        return (p + (positions-shift)) % positions;
    const temp = Array(p.length);
    for (let i=0; i<positions; i++)
        temp[i] = p[(i + (positions-shift)) % positions];
    return temp;
}

// Return card c rotated clockwise by 'shift' positions; if shift is 1, c0 returns c20
function cardLeft(c) {
    return (c + shift*handCards) % deckCards;
}

// Return card c rotated clockwise by 'shift' positions; if shift is 1, c20 returns c0
function cardRight(c) {
    return (c + (deckCards-shift*handCards)) % deckCards;
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
    meldO = meld(p1, trump) + meld(p3, trump);
    meldE = meld(p0, trump) + meld(p2, trump);
    needO = teamE[bidder]? 20 : (meldO<20? bid[bidder] : Math.max(20,bid[bidder]-meldO));
    needE = teamO[bidder]? 20 : (meldE<20? bid[bidder] : Math.max(20,bid[bidder]-meldE));
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

// Cap max cards for position p1 of value v given remaining[v], position p2's cards, minCards[p1][v], and maxCards[p1][v]
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
        trumpMsg.textContent = n;
        for (const p of [p0, p1, p2]) {
            for (const s of sArray) {
                n = 0;
                for (const r of rArray)
                    n += capMaxCards(p, r+s, p3);
                if (n==0)                                                   // if no cards in suit, display 'X'
                    infoChr[i++].innerHTML = 'X';
                else if (minCards[p][ace+s]>0)                              // otherwise, if ace in suit, display 'A'
                    infoChr[i++].innerHTML = 'A';
                else if (capMaxCards(p,ace+s,p3)==0)                        // otherwise, if no ace in suit, display '↓'
                    infoChr[i++].innerHTML = `<img src=${downSrc}>`;
                else                                                        // otherwise, display '?'
                    infoChr[i++].innerHTML = '?';
            }
            infoHnt[p].style.display = nCards(p)>0? 'inline' : 'none';
        }
    } else {
        trumpMsg.textContent = '';
        infoHnt[p0].style.display = infoHnt[p1].style.display = infoHnt[p2].style.display = 'none';
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

// Find position p's best legal move bestC[p] given card values v and played cards playC[p0..p3]
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
            if (nPlayed+1 < positions) {
                // Play incomplete: recurse to next position
                merit = -bestMerit(v, bestC, playC, next[p], l, h, nPlayed+1);
            } else {
                // Play complete: calculate merit
                const w=v[playC[p0]], n=v[playC[p1]], e=v[playC[p2]], s=v[playC[p3]];
                if (teamO[p] && teamO[plyr[h]]) {
                    // NS is last position and NS won
                    merit =  +trckMerit;
                    merit += (+high[w] + high[n] + high[e] + high[s]) * highMerit;
                    merit += (+rank[w] - rank[n] + rank[e] - rank[s]) * rankMerit;
                    merit += (+trmp(w) - trmp(n) + trmp(e) - trmp(s)) * trmpMerit;
                } else if (!teamO[p] && !teamO[plyr[h]]) {
                    // EW is last position and EW won
                    merit =  +trckMerit;
                    merit += (+high[w] + high[n] + high[e] + high[s]) * highMerit;
                    merit += (-rank[w] + rank[n] - rank[e] + rank[s]) * rankMerit;
                    merit += (-trmp(w) + trmp(n) - trmp(e) + trmp(s)) * trmpMerit;
                } else if (teamO[p] && !teamO[plyr[h]]) {
                    // NS is last position and NS lost
                    merit =  -trckMerit;
                    merit += (-high[w] - high[n] - high[e] - high[s]) * highMerit;
                    merit += (+rank[w] - rank[n] + rank[e] - rank[s]) * rankMerit;
                    merit += (+trmp(w) - trmp(n) + trmp(e) - trmp(s)) * trmpMerit;
                } else if (!teamO[p] && teamO[plyr[h]]) {
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

// Relocate cards and p0/p2 infoNam, infoBid and infoHnt
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
        card[c].cntr.x = Math.round(vw/2 + [-cardw*0.38, 0, +cardw*0.38, 0][p]);
        card[c].cntr.y = Math.round(vh/2 + [0, -cardw*0.38, 0, +cardw*0.38][p]);
        card[c].cntr.r = [r0, r1, r2, r3][p];
        if (card[c].g==hand) {
            v++;
            maxY[p] = Math.max(maxY[p], card[c].hand.y);
        }
    }
    if (card[0].g == heap)
        infoNam[p0].style.top  = infoNam[p2].style.top  = vh/2 - cardw*1.4 + 'px';
    else {
        infoNam[p0].style.top = maxY[p0] + cardw*0.52 + 'px';
        infoNam[p2].style.top = maxY[p2] + cardw*0.52 + 'px';
        infoBid[p0].style.top  = infoHnt[p0].style.top = maxY[p0] + cardw*0.81 + 'px';
        infoBid[p2].style.top  = infoHnt[p2].style.top = maxY[p2] + cardw*0.81 + 'px';
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

// Update everyone's estimate of bidder's meld if jump bid
function updateEst(newBid) {
    const max0 = Math.max(50, ...bid);                          // note high bid so far
    if (bid[bidder]==none && newBid>max0+1 && newBid<60)        // if jump bid,
        est[bidder] = (newBid - max0) * 10;                         // adjust everyone's estimate of bidder's meld
}

// Return true if b is a boolean
function bo(b) {
    return typeof b=='boolean';
}

// Return true if a is an array of boolean
function ab(a) {
    return typeof a=='object' && Array.isArray(a) && a.every(b => typeof b=='boolean');
}

// Return true if s is a full (non-empty) string
function fs(s) {
    return typeof s=='string' && s!='';
}

// Return true if a is an array of full (non-empty) strings
function af(a) {
    return typeof a=='object' && Array.isArray(a) && a.every(s => typeof s=='string' && s!='');
}

// Return true if i is a positive (>=0) integer
function pi(i) {
    return typeof i=='number' && Number.isInteger(i) && i>=0;
}

// Return true if a is an array of positive (>=0) integers
function ap(a) {
    return typeof a=='object' && Array.isArray(a) && a.every(i => Number.isInteger(i) && i>=0);
}

// Return true if o is a simple (non-null, non-array) object
function so(o) {
    return typeof o=='object' && o!='null' && !Array.isArray(o);
}

// Return number of keys in simple object (or 0)
function keys(o) {
    return so(o)? Object.keys(o).length : 0;
}

// Update sessionStorage and localStorage whenever a game setting changes
function saveSettings() {
    player = right(player);                                     // shift player array from user's to maker's perspective
    robot = right(robot);                                       // shift robot array from user's to maker's perspective
    sessionStorage.pinochle = JSON.stringify({version, names, user, role, player, robot, show});
    localStorage.pinochle = JSON.stringify({version, names, user, role, player, robot, show});
    player = left(player);                                      // shift player array from maker's to user's perspective
    robot = left(robot);                                        // shift robot array from maker's to user's perspective
    src = user = player[p3];
    dst = [];
    for (const p of [p0, p1, p2])
        if (!robot[p])
            dst.push(player[p]);
}

// Reset playPag then show list l (or none)
function resetPlayPag(l) {
    const waiting = getComputedStyle(playMsg).display=='block';
    roleGrd.style.opacity = waiting? '0.4' : '1.0';
    soloBox.src = role=='solo'? chkdSrc : unchkdSrc;
    makeBox.src = role=='make'? chkdSrc : unchkdSrc;
    joinBox.src = role=='join'? chkdSrc : unchkdSrc;
    soloBox.disabled = makeBox.disabled = joinBox.disabled = waiting;
    for (const p of pArray) {
        nameBlk[p].style.opacity = waiting||(role=='join'&&p!=p3)? '0.4' : '1.0';
        nameInp[p].style.display = 'none';
        nameBtn[p].style.display = 'block';
        nameBtn[p].disabled = waiting || (role=='join'&&p!=p3)
        nameSpn[p].textContent = player[p];
        nameLst[p].innerHTML = '';
        nameLst[p].style.visibility = 'hidden';
        nameImg[p].src = dropSrc;
        botBlk[p].style.opacity = waiting || role!='make'? '0.4' : '1.0';
        botBox[p].src = robot[p]? chkdSrc : unchkdSrc;
        botBox[p].disabled = waiting || role!='make';
    }
    showGrd.style.opacity = waiting||role=='join'? '0.4' : '1.0';
    for (const s of [counts, hands]) {
        showInp[s].src = show[s]? chkdSrc : unchkdSrc;
        showInp[s].disabled = waiting||role=='join';
    }
    playBtn.textContent = role=='solo'? 'Play' : (role=='make'? 'Start' : 'Join');
    playBtn.disabled = player.includes('TBD');
    if (l != none) {
        let h = `<div onclick=newEvent(event)><span><i>New name</i></span><img src=${editSrc}></div>`;
        for (const n of names)
            h += `<div><span onclick=namEvent(event)>${n}</span><img src=${delSrc} onclick=delEvent(event)></div>`;
        nameLst[l].innerHTML = h;
        nameLst[l].style.visibility = 'visible';
        nameImg[l].src = liftSrc;
    }
}

// Dispatch msg to appropriate event handler (or log error)
function dispatch(msg) {
    if (af(msg.player))
        setTimeout(playerMsgEvent, 0, msg);
    else if (fs(msg.play))
        setTimeout(playMsgEvent, 0, msg);
    else if (ap(msg.hand))
        setTimeout(handMsgEvent, 0, msg);
    else if (pi(msg.bid))
        setTimeout(bidMsgEvent, 0, msg);
    else if (pi(msg.trump))
        setTimeout(trumpMsgEvent, 0, msg);
    else if (fs(msg.lead))
        setTimeout(leadMsgEvent, 0, msg);
    else if (pi(msg.card))
        setTimeout(cardMsgEvent, 0, msg);
    else if (fs(msg.deal))
        setTimeout(dealMsgEvent, 0, msg);
    else if (fs(msg.quit))
        setTimeout(quitMsgEvent, 0, msg);
    else
        log(`-- discarded (unrecognized msg)`);
}

// Send msg to user; if remote players, send msg to server and add msg to resend queue
function sendMsg(msg) {
    log(`client: ${JSON.stringify(msg).slice(0,70)}`);
    dispatch(msg);
    if (dst.length) {
        const c = {src:src, smr:smr, dst:dst, cmt:cmt++, msg:msg};
        if (websocket) {
            //log(`-- ${JSON.stringify(c).slice(0,70)}`);
            websocket.send(JSON.stringify(c));
        }
        q.push(msg);
    }
}

/////////////////////////////////////////////////////////////
//                     EVENT HANDLERS                      //
/////////////////////////////////////////////////////////////

// Send quitMsg and reload app
function termOkEvent() {
    sendMsg({quit:user});
    location.reload();
}

// Send quitMsg and reload app
function termCancelEvent() {
    termDlg.close();
}

// Show termination dialog, then await termOkEvent or cancel
function appCloseEvent() {
    termDlg.showModal();
}

// Hide current helpPag (if any); display new helpPag topic
function helpEvent(topic) {
    resetPlayPag(none);
    for (const div of helpPag)
        if (div.id == topic) {
            if (helpStack.length)
                helpStack.at(-1).style.display = 'none';
            div.style.display = 'block';
            helpStack.push(div);
            break;
        }
}

// Pop and hide current helpPag, then display previous helpPag
function helpCloseEvent() {
    if (helpStack.length > 0)
        helpStack.pop().style.display = 'none';
    if (helpStack.length > 0)
        helpStack.at(-1).style.display = 'block';
}

// Display infoTxt
function infoEvent() {
    infoBiddr.textContent = `${player[bidder]} won bid.`;
    let i = 0;
    for (const s of sArray)
        infoCell[i++].textContent = remaining[ace+s] - nValue(p3,ace+s);
    for (const s of sArray) {
        let q = 0;
        for (const r of rArray)
            q += remaining[r+s] - nValue(p3,r+s);
        infoCell[i++].textContent = q;
    }
    infoGrd.style.display = show[counts]? 'grid' : 'none';
    infoTake.textContent = `Your take: ${takeO} of ${needO}. Their take: ${takeE} of ${needE}.`;
    infoTxt.style.display = 'flex';
}

// Clear infoTxt
function infoCloseEvent() {
    infoTxt.style.display = 'none';
}

// Reload app after user clicks Ok for quit dialog
function quitOkEvent() {
    location.reload();
}

// Alert user, then reload app
function quitMsgEvent(msg) {
    if (msg.quit == user)
        location.reload();
    quitNam.textContent = msg.quit;
    quitDlg.showModal();
}

// Note ok clicked; if everyone ok, reload game or send handMsg, then await handMsg or playBtn event
function dealMsgEvent(msg) {
    deal.push(msg.deal);                                        // save name of player who is ready for deal
    let n = 0;                                                  // assume no positions are ready
    for (const p of pArray)                                     // for each position,
        if (robot[p] || deal.includes(player[p]))                   // if position is a robot or ready player,
            n++;                                                        // position is ready
        else                                                        // otherwise,
            handMsg.textContent = `Waiting for ${player[p]}.`;          // update handMsg
    if (n==positions)                                           // if all positions are ready
        if (takeO==50 || takeE==50 || scoreO>=500 || scoreE>=500)   // if game is over,
            location.reload();                                          // reload game
        else if (dealer==p3 || role!='join'&&robot[dealer]) {       // otherwise, if user or user's bot is the new dealer,
            let h = Array(deckCards).fill(0).map((h,i,a)=>i%handCards); // send a new handMsg
            shuffleArray(h, deckCards);
            h = [...h.slice(0,20).sort(down), ...h.slice(20,40).sort(down), ...h.slice(40,60).sort(down), ...h.slice(60,80).sort(down)];
            sendMsg({hand:h});
        }
}

// Display 'waiting'; advance dealer; await okMsg event
function handBtnEvent() {
    handBtn.style.display = 'none';                             // replace handBtn with handMsg
    handMsg.style.display = 'inline';
    dealer = next[dealer];                                      // advance dealer
    sendMsg({deal:user});
}

// Display handTxt, defer any dealMsg, then await handBtnEvent
function handEndedEvent() {
    const tossO = teamO[bidder] && toss;
    const tossE = teamE[bidder] && toss;
    const bidO = Math.max(bid[p1], bid[p3]);
    const bidE = Math.max(bid[p0], bid[p2]);
    relocate();
    handCell[4].innerHTML = scoreO;
    handCell[5].innerHTML = scoreE;
    handCell[7].innerHTML = teamO[bidder]? bidO : 'Pass';
    handCell[8].innerHTML = teamE[bidder]? bidE : 'Pass';
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
        handPar.textContent = `Boohoo! You lose!`;
    else if (takeO==50 || (scoreO>=500 && scoreE<500) || (scoreO>=500 && scoreE>=500 && teamO[bidder]))
        handPar.textContent = `Woohoo! You win!`;
    else
        handPar.textContent = `${player[next[dealer]]} deals next.`;
    handBtn.style.display = 'inline';
    handMsg.style.display = 'none';
    handTxt.style.display = 'block';
    deal.length = 0;                                            // no positions are ready for deal
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
        trumpMsg.textContent = '';
        infoHnt[p0].style.display = infoHnt[p1].style.display = infoHnt[p2].style.display = 'none';
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

// Clear slide, note chosen card, update stats, play chosen card(!p3), then await cardPlayedEvent
function cardMsgEvent(msg) {
    chosen = cardRight(msg.card);
    clearTimeout(timeoutId);
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
    if (position != p3)
        moveCard(chosen, card[chosen].g, 0, cntr, playZ++, true, dealTime/10);
    setTimeout(cardPlayedEvent, dealTime/10);
}

// Select card
function pointerDownEvent(e) {
    let pickX, pickY;
    e.preventDefault();
    pickX = e.clientX;
    pickY = e.clientY;
    pickedC = xy2c(pickX, pickY)
    if (!pickedC)
        return;
    pickedE = e.target;
    pickedE.setPointerCapture(e.pointerId);
    offsetX = pickX - card[pickedC].hand.x;
    offsetY = pickY - card[pickedC].hand.y;
    fnsh = `translate(${pickX-offsetX}px, ${pickY-offsetY}px)`;
};

// Drag card
function pointerMoveEvent(e) {
    let moveX, moveY;
    e.preventDefault();
    if (pickedC && pickedE) {
        moveX = e.clientX;
        moveY = e.clientY;
        strt = fnsh;
        fnsh = `translate(${moveX-offsetX}px, ${moveY-offsetY}px)`;
        pickedE.animate([{transform:strt}, {transform:fnsh}], {duration:0, fill:'forwards'});
    };
};

// If click or big move to center, move card to center, send cardMsg; otherwise return card to hand
function pointerUpEvent(e) {
    const deltaY = card[pickedC].hand.y - (e.clientY - offsetY);
    e.preventDefault();
    if (pickedC && pickedE) {
        if (deltaY==0 || deltaY>cardh/2) {
            card[pickedC].g = cntr;
            cardImg[pickedC].style.zIndex = card[pickedC].z = playZ++;
            strt = fnsh;
            fnsh = `translate(${card[pickedC].cntr.x}px, ${card[pickedC].cntr.y}px)`;
            pickedE.animate([{transform:strt}, {transform:fnsh}], {duration:dealTime/10, fill:'forwards'});
            for (const c of cpArray[p3]) {
                cardImg[c].onpointerdown = cardImg[c].onpointermove = cardImg[c].onpointerup = '';
                cardImg[c].style.filter = card[c].g==hand? 'brightness(70%)' : 'brightness(100%)';
            }
            sendMsg({card:cardLeft(pickedC)});
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
    timeoutId = setTimeout(()=>{slideImg[position].style.opacity='1'}, 5000);
    for (const c of cpArray[p3]) {
        if (position>=nGroup(cntr) && card[c].g==hand)
            cardImg[c].style.filter = `brightness(${legal(c)?'100%':'70%'})`;
        if (position==p3 && legal(c)) {
            cardImg[c].onpointerdown = pointerDownEvent;
            cardImg[c].onpointermove = pointerMoveEvent;
            cardImg[c].onpointerup = pointerUpEvent;
        }
    }
    if (role!='join' && robot[position]) {
        chosen = botCard();
        sendMsg({card:cardLeft(chosen)});
    }
}

// Refan hands, then await refannedEvent
function meldGatheredEvent() {
    for (const c of cArray) {
        cardImg[c].style.filter = card[c].p==p3? 'brightness(70%)' : 'brightness(100%)';
        card[c].g = hand;
    }
    relocate();
    for (const c of cArray)
        if (show[hands] || card[c].p==p3)
            moveCard(c, gone, 0, hand, c, true, dealTime/10);
        else
            moveCard(c, gone, 0, hand, -c, false, dealTime/10);
    for (const p of pArray)
        infoBid[p].style.display = 'none';
    trumpIco.src = suitSrc[trump];
    trumpIco.style.display = 'block';
    setTimeout(refannedEvent, dealTime/10);
}

// Note player ready; if everyone ready, gather meld, then await handEndedEvent(toss) or meldGatheredEvent(!toss)
function leadMsgEvent(msg) {
    lead.push(msg.lead);                                        // save name of player who is ready for lead card
    let n = 0;                                                  // assume no positions are ready
    for (const p of pArray)                                     // for each position,
        if (robot[p] || lead.includes(player[p]))                   // if position is a robot or ready player,
            n++;                                                        // position is ready
        else                                                        // otherwise,
            needMsg.textContent = `Waiting for ${player[p]}.`;          // update needMsg
    if (n==positions) {                                         // if all positions are ready
        needTxt.style.display = 'none';                             // clear need text
        for (const c of cArray) {                                   // brighten and gather meld cards
            cardImg[c].style.filter = 'brightness(100%)';
            moveCard(c, hand, 0, gone, -c, false, dealTime/10);
        }
        if (toss)                                                   // if toss,
            setTimeout(handEndedEvent, dealTime/10);                    // await handEnded event
        else                                                        // otherwise,
            setTimeout(meldGatheredEvent, dealTime/10);                 // await meldGathered event
    }
}

// Send trumpMsg (if bidder is user), signal ready, replace buttons with wait message
function okBtnEvent() {
    if (bidder == p3)
        sendMsg({trump:trump, toss:false});
    sendMsg({lead:user});
    okBtn.style.display = tossBtn.style.display = 'none';
    needMsg.textContent = 'Waiting for others.';
    needMsg.style.display = 'block';
}

// Send trumpMsg, signal ready, replace buttons with wait message
function tossBtnEvent() {
    sendMsg({trump:trump, toss:true});
    sendMsg({lead:user});
    okBtn.style.display = tossBtn.style.display = 'none';
    needMsg.textContent = 'Waiting for others.';
    needMsg.style.display = 'block';
}

// Display needTxt, then await okBtnEvent or tossBtnEvent
function meldFannedEvent() {
    needPara[0].innerHTML = `${bidder==p3?'You':player[bidder]} picked ${suit$[trump]}.`;
    needPara[1].innerHTML = `Your meld is ${meldO<20?'<20':meldO}.<br>Their meld is ${meldE<20?'<20':meldE}.`;
    if (marriages(bidder,trump)==0)
        needPara[2].innerHTML = `${bidder==p3?'You must toss':player[bidder]+' tossed'} due to no marriage.`;
    else if (toss)
        needPara[2].innerHTML = `${player[bidder]} tossed the hand.`;
    else
        needPara[2].innerHTML = `You need ${needO} points.<br>They need ${needE} points.`;
    okBtn.style.display = bidder==p3 && marriages(p3,trump)==0? 'none' : 'inline';
    tossBtn.style.display = bidder==p3? 'inline' : 'none';
    needMsg.style.display = 'none';
    needTxt.style.display = 'flex';
    gameHelp.onclick = ()=>{helpEvent('tossHelp')};
    lead.length = 0;
}

// Dim/display meld, then await meldFanned event
function regatheredEvent() {
    for (const c of cArray)                                     // group p3 and known cards into positions' hands
        card[c].g = card[c].p==p3 || card[c].k? hand : gone;
    relocate();                                                 // reset card and info text locations
    for (const c of cArray) {                                   // dim unknown cards and move cards to their new locations
        cardImg[c].style.filter = card[c].k? 'brightness(100%)' : 'brightness(70%)';
        moveCard(c, gone, 0, card[c].g, c, true, dealTime/10);
    }
    setTimeout(meldFannedEvent, dealTime/10);                   // await meldFanned event
}

// Set trump/toss, tag meld, and, if I'm not the bid winner, clear bid text, gather hands then await regathered event
function trumpMsgEvent(msg) {
    trump = msg.trump;                                          // set trump suit and toss flag
    toss = msg.toss;
    if (bidder != p3) {                                         // if bid winner isn't me,
        tagMeld();                                                  // tag the meld cards
        bidTxt.style.display = 'none';                              // clear bid text
        for (const c of cArray)                                     // gather hands
            moveCard(c, hand, 0, gone, -c, false, dealTime/10);
        setTimeout(regatheredEvent, dealTime/10);                   // await regathered event
    }
}

// Set trump, tag meld, clear trumpTxt, gather hands, then await regathered event
function trumpBtnEvent(s) {
    trump = s;
    tagMeld();
    trumpTxt.style.display = 'none';
    for (const c of cArray)
        moveCard(c, hand, 0, gone, -c, false, dealTime/10);
    setTimeout(regatheredEvent, dealTime/10);
}

// Note bid, advance bidder, then retrigger fannedEvent
function bidMsgEvent(msg) {
    updateEst(msg.bid);
    bid[bidder] = msg.bid;
    infoBid[bidder].innerHTML = bidString(bidder);
    bidder = next[bidder];
    setTimeout(fannedEvent);
}

// Send bidMsg, then await bidMsg or declareMsg
function passBtnEvent() {
    logBid(pass, 'Undisclosed');
    sendMsg({bid:pass});
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
    sendMsg({bid:Number(bidBtn.value)});
}

// Increase bid button value, then await lessBtn, bidBtn or moreBtn
function moreBtnEvent() {
    bidBtn.value = Number(bidBtn.value) + (Math.max(...bid,Number(bidBtn.value))>=60?5:1);
    lessBtn.disabled = false;
}

// Send my bot's next bidMsg then await bidMsg or trumpMsg
function botBidEvent() {
    const lefty   = next[bidder];
    const partner = next[lefty];
    const right   = next[partner];
    const highBid = Math.max(...bid);
    const maxBid  = maxMeld(bidder) + est[partner] + 20 + quality(bidder);
    let b = bid[bidder];
    if (b == pass)
        b = logBid(pass, 'Repeat');
    else
        if (nPass() == 3)
            b = logBid(Math.max(b, 50), 'Last bid');
        else if (noMarriages(bidder))
            b = logBid(pass, 'No marriage');
        else if (bid[lefty]==none && bid[right]!=pass && highBid<60 && quality(bidder)>0 && maxBid>=60)
            b = logBid(60, 'Block bid');
        else if (b==none && bid[partner]!=pass && highBid<58 && minMeld(bidder)>15)
            b = logBid(Math.min(Math.max(50, ...bid) + Math.round(minMeld(bidder)/10), 59), 'Jump bid');
        else if (highBid<60 && quality(bidder)>=0 && maxBid>=60 && maxBid<70)
            b = logBid(60, 'Worried');
        else if (quality(bidder)>=0 && nextBid() <= maxBid)
            b = logBid(nextBid(), 'Want bid');
        else if (highBid<50 && partner==dealer)
            b = logBid(50, 'Save');
        else if (quality(bidder) < 0)
            b = logBid(pass, 'Bad quality');
        else
            b = logBid(pass, 'Too high');
    sendMsg({bid:b});
}

// Display bidTxt, handle situation, then await trumpBtn, declareMsg, botBid, lessBtn, bidBtn, moreBtn or bidMsg event
function fannedEvent() {
    if (nPass() == 3)                                           // if others passed, bidder is the remaining position
        for (bidder of pArray)
            if (bid[bidder] != pass)
                break;
    meldSpan[0].textContent = meld(p3, spades);                 // display bidTxt
    meldSpan[1].textContent = meld(p3, hearts);
    meldSpan[2].textContent = meld(p3, clubs);
    meldSpan[3].textContent = meld(p3, diamonds);
    if (bidder == p3) {
        bidBtn.value = nextBid();
        lessBtn.disabled = true;
        passBtn.disabled = moreBtn.disabled = nPass()==3;
        passBtn.style.display = lessBtn.style.display = bidBtn.style.display = moreBtn.style.display = 'inline';
        bidMsg.style.display = 'none';
    } else {
        bidMsg.textContent = `Waiting for ${player[bidder]}.`;
        passBtn.style.display = lessBtn.style.display = bidBtn.style.display = moreBtn.style.display = 'none';
        bidMsg.style.display = 'inline';
    }
    bidTxt.style.display = 'flex';
    if (nPass()==3 && bid[bidder]!=none) {                      // if bidding is complete,
        for (bidder of pArray)                                      // find bid winner
            if (bid[bidder] > pass)
                break;
        position = bidder;                                          // first position will be the bid winner
        toss = false;                                               // hand is not tossed yet
        if (bidder == p3) {                                         // if I won the bid,
            bidTxt.style.display = 'none';                              // clear bid text
            trumpBtn[0].value = `Spades (${meld(p3, spades)})`;         // display trump text and await trumpBtnEvent
            trumpBtn[1].value = `Hearts (${meld(p3, hearts)})`;
            trumpBtn[2].value = `Clubs (${meld(p3, clubs)})`;
            trumpBtn[3].value = `Diamonds (${meld(p3, diamonds)})`;
            trumpBtn[0].disabled = marriages(p3,spades)==0 && !noMarriages(bidder);
            trumpBtn[1].disabled = marriages(p3,hearts)==0 && !noMarriages(bidder);
            trumpBtn[2].disabled = marriages(p3,clubs)==0 && !noMarriages(bidder);
            trumpBtn[3].disabled = marriages(p3,diamonds)==0 && !noMarriages(bidder);
            trumpTxt.style.display = 'flex';
            gameHelp.onclick = ()=>{helpEvent('trumpHelp')};
        } else if (role!='join' && robot[bidder])                   // otherwise, if my bot won the bid,
            sendMsg({trump:botSuit(), toss:botToss()});                 // send my bot's declareMsg
        else                                                        // otherwise,
            bidMsg.textContent = `Waiting for ${player[bidder]}.`;     // await trumpMsgEvent
    } else if (bidder==p3 && bid[p3]==pass) {                   // otherwise, if it's my bid and I've already passed,
        logBid(pass, 'Repeat');                                     // pass again
        sendMsg({bid:pass});                                        // resend my bidMsg
    } else if (role!='join' && robot[bidder]) {                 // otherwise, if it's my bot's bid,
        setTimeout(botBidEvent, bid[bidder]==pass?0:dealTime/4);    // await botBidEvent (quick if repeat pass)
        return;                                                     // defer msg events until my bot bids
    }                                                           // otherwise, await bidBtnEvent or bidMsgEvent
}

// relocate hands and infoBlks, fan hands, then await fannedEvent
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

// Deal cards based on handMsg
function handMsgEvent(msg) {
    for (const c of cArray) {                                   // deck is from m.msg.hand, offset to my perspective
        card[c].c = c;
        card[c].p = plyr[c];
        card[c].o = teamO[card[c].p];
        card[c].v = msg.hand[cardLeft(c)];
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
    handTxt.style.display = 'none';
    for (const p of pArray) {
        infoNam[p].textContent = player[p];
        infoBid[p].innerHTML = '';
        infoBid[p].style.display = 'inline';
    }
    infoHnt[p0].style.display = infoHnt[p1].style.display = infoHnt[p2].style.display = 'none';
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

// If solo or make, send handMsg when everyone is ready to play game
function playMsgEvent(msg) {
    play.push(msg.play);                                        // save name of player who is ready to play game
    let n = 0;                                                  // assume no positions are ready
    for (const p of pArray)                                     // for each position
        if (robot[p] || play.includes(player[p]))                   // if position is a robot or ready player,
            n++;                                                        // position is ready
        else                                                        // otherwise,
            playMsg.textContent = `Waiting for ${player[p]}.`;          // update playMsg
    if (n==positions && role!='join') {                         // if all positions are ready and user isn't joiner,
        let h = Array(deckCards).fill(0).map((h,i,a)=>i%handCards); // send a handMsg
        shuffleArray(h, deckCards);
        h = [...h.slice(0,20).sort(down), ...h.slice(20,40).sort(down), ...h.slice(40,60).sort(down), ...h.slice(60,80).sort(down)];
        sendMsg({hand:h});
    }
}

// Set shift, dealer, player, robot and show based on playerMsg, then update playPag
function playerMsgEvent(msg) {
    shift = (msg.player.indexOf(user) + 1) % positions;         // shift = 1/2/3/0 for user==msg.player[p0/p1/p2/p3]
    player = left(msg.player);                                  // player array is from msg.player from user's perspective
    robot = left(msg.robot);                                    // robot array if from msg.robot from user's perspective
    show = msg.show;                                            // show array is from msg.show
    dealer = role=='join'? right(p3) : p3;                      // dealer is p3 from user's perspective
    saveSettings();
    resetPlayPag(none);
}

// Set role when a role box is clicked
function roleEvent(r) {
    role = r;
    if (role == 'solo')
        robot[p0] = robot[p1] = robot[p2] = true;
    saveSettings();
    resetPlayPag(none);
}

// Update playPag based on nameInp's keydown event
function nameInpKeyEvent(e) {
    const k = e.key;
    const p = nameInp.indexOf(e.target);
    if (k=='Backspace' || k=='Tab' || (nameInp[p].value.length<10 && k.length==1 && nameChars.includes(k)))
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

// Prepare to enter a name when a nameList edit icon is clicked
function newEvent(e) {
    const p = nameLst.indexOf(e.target.parentElement.parentElement.parentElement);
    resetPlayPag(none);
    nameBtn[p].style.display = 'none';
    nameInp[p].value = '';
    nameInp[p].placeholder = 'Enter new name';
    nameInp[p].style.display = 'block';
    nameInp[p].focus();
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

// Select a name when a nameLst name is clicked
function namEvent(e) {
    const p = nameLst.indexOf(e.target.parentElement.parentElement);
    const name = e.target.textContent;
    if (player.includes(name))
        player[player.indexOf(name)] = 'TBD';
    player[p] = name;
    saveSettings();
    resetPlayPag(none);
    if (p == p2)
        showInp[0].focus();
    else
        nameBtn[next[p]].focus();
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
    resetPlayPag(none);
}

// Toggle show when a show box is clicked
function showEvent(e) {
    const s = showInp.indexOf(e.target);
    show[s] = !show[s];
    saveSettings();
    resetPlayPag(none);
}

// Notify players when user clicks the play ('Play single', 'Start multi', or 'Join multi') button
function playBtnEvent() {
    playBtn.style.display = 'none';
    playMsg.textContent = 'Waiting for others.'
    playMsg.style.display = 'block';
    if (role == 'join')
        sendMsg({play:user});
    else {
        dealer = p3;
        sendMsg({player:player, robot:robot, show:show});
        sendMsg({play:user});
    }
    resetPlayPag(none);
}

// Process websocket close events
function wsCloseEvent() {
    log(`wsCloseEvent`);
    online = false;
    playIco.style.display = 'block';
    gameIco.style.display = 'block';
    if (role != 'solo')
        netDlg.showModal();
}

// Ignore websocket error events
function wsErrorEvent() {
    log(`wsErrorEvent`);
}

// Handle incoming websocket message event e
function wsMessageEvent(e) {
    try {JSON.parse(e.data)}                                    // try to parse event data
    catch(error) {                                              // if parse fails, log error and return
        log(`server:${e.data}`);                                    // log server message
        log(`-- error:${error.name}, detail:${error.message}`);     // log (non)response
        return;
    }
    const m = JSON.parse(e.data);                               // m is the server message object
    let logged = false;                                         // message not logged yet
    if (pi(m.cmr)) {                                            // if may have to mess with resend queue,
        cmr = m.cmr;                                                // save m.cmr;
        if (cmr != cmt) {                                           // if server message is worth logging,
            log(`server:${e.data.slice(0,70)}`);                        // log server/client message
            logged = true;                                              // note server message logged
        }
        if (cmr == cmt) {                                           // if server received all client appMsgs txed,
            //log(`-- ackd ${q.length} queued msgs`);                   // log (non)response
            q.length = 0;                                               // clear resend queue (all ackd)
        } else if (q.length && cmt-cmr<=q.length) {                 // otherwise, if server didn't rx all queued msgs,
            let t = cmr;                                                // start client msgs txed at client msgs rxed
            let i = q.length - (cmt - cmr);                             // i is the q index
            while (t < cmt) {                                           // while server msgs txed < client msgs rxed,
                const c = {src:src, smr:smr, dst:dst, cmt:t++, msg:q[i++]}; // c is the client message
                websocket.send(JSON.stringify(c));                          // resend client message to dst
                log(`-- resent:${JSON.stringify(c).slice(0,70)}`);          // log resent appMsg
            }
        } else {                                                    // otherwise,
            log(`-- resynced (cmt:${cmt}, q.length:${q.length})`);      // log cmr response
            cmt = cmr;                                                  // assume server is correct
            q.length = 0;                                               // clear resend queue
        }
    }
    if (keys(m)==1 && pi(m.cmr)) {                              // if pingMsg,
        return;                                                     // return
    }
    if (keys(m)==3 && pi(m.cmr) && pi(m.smt) && so(m.msg)) {    // if appMsg,
        //log(`server:${e.data.slice(0,70)}`);                      // log server message
        log(`server:${JSON.stringify(m.msg).slice(0,70)}`);         // log msg
        smt = m.smt;                                                // save m.smt
        if (smt == smr) {                                           // if appMsg is in sync,
            smr++;                                                      // note receipt of appMsg
            dispatch(m.msg);                                            // dispatch msg
            return;                                                     // return;
        } else {                                                    // otherwise (appmsg out of sync),
            smr--;                                                      // reverse receipt of appMsg
            log(`-- discarded (out of sync)`);                          // log (non)response
            return;                                                     // return
        }
    }
    log(`server:${e.data.slice(0,70)}`);                        // log unrecognized server message
    log(`-- discarded (unrecognized server message)`);                  // log (non)response
}

// Ignore websocket open events
function wsOpenEvent() {
    log(`wsOpenEvent`);
    online = true;
    playIco.style.display = 'none';
    gameIco.style.display = 'none';
    netDlg.close();
}

// Send periodic websocket pings and make periodic websocket reconnect attempts
function wsIntervalEvent() {
    switch (websocket.readyState) {
    case WebSocket.CONNECTING:                                  // if websocket connecting,
        log(`wsIntervalEvent: connecting`);                         // log event
        break;
    case WebSocket.OPEN:                                        // if websocket open,
        //log(`wsIntervalEvent: open`);                             // log event
        websocket.send(JSON.stringify({src:src, smr:smr}));         // send pingMsg
        break;
    case WebSocket.CLOSING:                                     // if websocket closing,
        log(`wsIntervalEvent: closing`);                            // log event
        break;
    case WebSocket.CLOSED:                                      // if websocket closed,
        log(`wsIntervalEvent: closed`);                             // log event
        if (navigator.onLine && location.hostname) {                // if browser online and not running from debugger,
            const hst = location.hostname;
            const url = hst=='pinochle.koyeb.app'? `wss://${hst}/ws` : `ws://${hst}:3000`;
            websocket = new WebSocket(url);                             // create a new websocket
            websocket.onclose = wsCloseEvent;
            websocket.onerror = wsErrorEvent;
            websocket.onmessage = wsMessageEvent;
            websocket.onopen = wsOpenEvent;
            hrefTxt.textContent = `${location.protocol}//${hst}${location.port?(':'+location.port):''}`;
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
    console.clear();                                            // clear console
    for (const img of document.querySelectorAll('img'))         // prevent user from dragging images
        img.draggable = false;
    for (const c of cArray) {                                   // initialize card images
        cardImg[c].src = backImg[0].src;
        cardImg[c].style.transform = 'translate(-2.8em, -2em)';
    }
    let s = {};                                                 // assume no session or local setup
    if ('pinochle' in sessionStorage)                           // if session setup exists,
        s = JSON.parse(sessionStorage.pinochle);                    // recall session setup from maker's perspective
    else if ('pinochle' in localStorage)                        // otherwise, if local setup exists,
        s = JSON.parse(localStorage.pinochle);                      // recall local setup from maker's perspective
    if (s.version == version)                                   // if recalled setup version is ok, replace default setup
        names=s.names, user=s.user, role=s.role, player=s.player, robot=s.robot, show=s.show;
    shift = (player.indexOf(user) + 1) % positions;             // shift = 1/2/3/0 for user==msg.player[p0/p1/p2/p3]
    player = left(player);                                      // shift player array to user's perspective
    robot = left(robot);                                        // shift robot array to user's perspective
    saveSettings();                                             // save game settings
    resetPlayPag(none);                                         // initialize playPag
    playMsg.style.display = 'none';
    gamePag.style.display = 'none';
    playPag.style.display = 'flex';
    nameBtn[p3].focus();

    if (navigator.onLine && location.hostname) {                // if browser is online and not running from debugger,
        const hst = location.hostname;
        const url = hst=='pinochle.koyeb.app'? `wss://${hst}/ws` : `ws://${hst}:3000`;
        websocket = new WebSocket(url);                             // create a new websocket
        websocket.onclose = wsCloseEvent;
        websocket.onerror = wsErrorEvent;
        websocket.onmessage = wsMessageEvent;
        websocket.onopen = wsOpenEvent;
        setInterval(wsIntervalEvent, 1000);                         // start heartbeat
        hrefTxt.textContent = `${location.protocol}//${hst}${location.port?(':'+location.port):''}`;
    }
    /*
    if (location.origin != 'file://')                           // if not running from debugger, start service worker
        navigator.serviceWorker.register('service-worker.js', {updateViaCache: 'none'});*/
    window.dispatchEvent(new Event('resize'));                  // trigger resize to go fullscreen
    //setTimeout(resizeEvent);                                    // initialize size variables and card locations
}

onload        = loadEvent;                                  // prepare for load event
onresize      = resizeEvent;                                // prepare for resize event
oncontextmenu = contextmenuEvent;                           // prepare for context (right-click or long-press) menu events