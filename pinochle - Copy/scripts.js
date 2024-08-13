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
const suitSrc  = ["suits/diamond.svg",,,,,"suits/club.svg",,,,,"suits/heart.svg",,,,,"suits/spade.svg"];

// Rank values
const jack     = 0;
const queen    = 1;
const king     = 2;
const ten      = 3;
const ace      = 4;
const ranks    = 5;
const rank$    = ["Jack", "Queen", "King", "Ten", "Ace"];

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
const hand = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

// offer[p] = player p's bid (or none or pass)
const pass = -1;
const offer = [none, none, none, none];

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
        this.x = 0;                 // x at card center
        this.y = 0;                 // y at card center
        this.m = 0;                 // multiplier for card height (0 to 1)
        this.t = 0;                 // clock value
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

// deck[i] = deck card index i
const indices = 80;
const deck = [
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C
];

// Page elements
const body       = document.getElementById("body");
const canvas     = document.getElementById("canvas");
const context    = canvas.getContext("2d");
const pickBid    = document.getElementById("pickBid");
const meldSpan   = document.querySelectorAll("#meldColumn span");
const bidBox     = document.querySelectorAll("#bidBox div");
const bidButton  = document.querySelectorAll("#pickBid input");
const pickTrump  = document.getElementById("pickTrump");
const pickButton = document.querySelectorAll("#pickTrump input");
const revealBid  = document.getElementById("revealBid");
const bidWinner  = document.getElementById("bidWinner");
const bidValue   = document.getElementById("bidValue");
const trumpName  = document.getElementById("trumpName");
const ourMeld    = document.getElementById("ourMeld");
const theirMeld  = document.getElementById("theirMeld");
const weNeed     = document.getElementById("weNeed");
const theyNeed   = document.getElementById("theyNeed");
const yesButton  = document.getElementById("yesButton");
const noButton   = document.getElementById("noButton");
const menuIcon   = document.getElementById("menuIcon");
const menuText   = document.getElementById("menuText");
const closeIcon  = document.getElementById("closeIcon");
const reload     = document.getElementById("reload");

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

// State constants
const starting  = 0;
const dealing   = starting  + 1;
const stacking1 = dealing   + 1;
const fanning1  = stacking1 + 1;
const bidding   = fanning1  + 1;
const stacking2 = bidding   + 1;
const fanning2  = stacking2 + 1;
const waiting1  = fanning2  + 1;
const stacking3 = waiting1  + 1;
const fanning3  = stacking3 + 1;
const playing   = fanning3  + 1;
const closing   = playing   + 1;
const pulling   = closing   + 1;
const waiting2  = pulling   + 1;

// Global variables
let state       = starting;         // state tracks the application state
let drawn       = true;             // true when rendering is complete
let dealer      = south;            // the player who is dealing or last dealt
let bidder      = none;             // the player who is bidding or won the bid
let trump       = none;             // the bidder's trump suit
let firstPlayer = none;             // the player who plays first
let turn        = none;             // the next player to play
let led         = none;             // the card led in this hand
let plays       = none;             // the number of cards played in this hand (so far)
let highCard    = none;             // the high card in this hand (so far)
let highPlayer  = none;             // the player who played the high card

// Dynamic sizes
let vw          = 0;                // view width
let vh          = 0;                // view height
let pad         = 0;                // padding width and height
let cw          = 0;                // card width
let ch          = 0;                // card height

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

// Count number of time value v occurs in array a
function count(a, v) {
    let n = 0;
    for (let i = 0; i < a.length; i++)
        if (a[i] == v)
            n++;
    return n;
}

// Return suit of card value v (or none if v is none)
function suit(v) {
    if (v == none)
        return none;
    return Math.floor (v / cards);
}

// Return rank of card value v (or none if v is none)
function rank(v) {
    if (v == none)
        return none;
    return v % cards;
}

// Return next player after current player (or none if current is none)
function nextPlayer(current) {
    if (current == none)
        return none;
    return (current + 1) % players;
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
    return suit(v) == suit(led);
}

// True is player p can't follow the lead
function cantFollow(p) {
    return highest(p, suit(led)) == none;
}

// True is player p can't trump
function cantTrump(p) {
    return highest(p, trump) == none;
}

// Return true if player p can play card c
function legal(p, c) {
    const v = hand[p][c];
    if (suit(led) == none)
        return true;
    if (suit(highCard) == trump) {
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
        if (follow(v) && highest(p,suit(led))<=highCard)
            return true;
        if (cantFollow(p) && suit(v)==trump)
            return true;
        if (cantFollow(p) && cantTrump(p))
            return true;
        }
    return false;
}

// Draw cards in z order until each card is at its final state then reset its start state for the next operation
function draw() {
    const now = performance.now();
    deck.sort((a,b)=>a.z-b.z);
    drawn = true;
    context.clearRect(0, 0, vw, vh);
    for (let i = 0; i < indices; i++) {
        const r = [Math.PI/2, 0, Math.PI/2, 0][i2p(deck[i].i)];
        if (now < deck[i].fnsh.t)
            drawn = false;
        if (now <= deck[i].strt.t) {
            context.translate(deck[i].strt.x, deck[i].strt.y);
            context.rotate(r);
            context.drawImage(img[deck[i].v], -cw/2, -ch/2*deck[i].strt.m, cw, ch*deck[i].strt.m);
            context.resetTransform();
        }
        if (now >= deck[i].fnsh.t) {
            context.translate(deck[i].fnsh.x, deck[i].fnsh.y);
            context.rotate(r);
            context.drawImage(img[deck[i].v], -cw/2, -ch/2*deck[i].fnsh.m, cw, ch*deck[i].fnsh.m);
            context.resetTransform();
            deck[i].strt.x = deck[i].fnsh.x;
            deck[i].strt.y = deck[i].fnsh.y;
            deck[i].strt.m = deck[i].fnsh.m;
        }
        if (now > deck[i].strt.t && now < deck[i].fnsh.t) {
            const ps = (deck[i].fnsh.t - now) / (deck[i].fnsh.t - deck[i].strt.t);
            const pf = (now - deck[i].strt.t) / (deck[i].fnsh.t - deck[i].strt.t);
            const x = deck[i].strt.x*ps + deck[i].fnsh.x*pf;
            const y = deck[i].strt.y*ps + deck[i].fnsh.y*pf;
            const m = deck[i].strt.m*ps + deck[i].fnsh.m*pf;
            context.translate(x, y);
            context.rotate(r);
            context.drawImage(img[deck[i].v], -cw/2, -ch/2*m, cw, ch*m);
            context.resetTransform();
        }
    }
    deck.sort((a,b)=>a.i-b.i);
}

// Locate all card positions (n = number of semi-exposed cards; v = visble card number)
function locate() {
    for (let p of [west, north, east, south]) {
        const n = cards - count(hand[p], none) - 1;
        let v = 0;
        for (let c = 0; c < cards; c++) {
            const i = pc2i(p, c);
            deck[i].stck.x = [-ch/2, vw/2, vw + ch/2, vw/2][p];
            deck[i].stck.y = [vh/2, -ch/2, vh/2, vh + ch/2][p];
            deck[i].norm.x = [ch/2+pad, vw/2-cw/4*(v-n/2), vw-ch/2-pad, vw/2+cw/4*(v-n/2)][p];
            deck[i].norm.y = [vh/2+cw/4*(v-n/2), ch/2+pad, vh/2-cw/4*(v-n/2), vh-ch/2-pad][p];
            deck[i].bump.x = deck[i].norm.x + [ch*0.4, 0, -ch*0.4, 0][p];
            deck[i].bump.y = deck[i].norm.y + [0, ch*0.4, 0, -ch*0.4][p];
            deck[i].play.x = vw/2 + [-ch/2-pad/2, cw/2+pad/2, ch/2+pad/2, -cw/2-pad/2][p];
            deck[i].play.y = vh/2 + [-cw/2-pad/2, -ch/2-pad/2, cw/2+pad/2, ch/2+pad/2][p];
            deck[i].strt.x = [deck[i].stck.x, deck[i].norm.x, deck[i].bump.x, deck[i].play.x][deck[i].g];
            deck[i].strt.y = [deck[i].stck.y, deck[i].norm.y, deck[i].bump.y, deck[i].play.y][deck[i].g];
            deck[i].fnsh.x = [deck[i].stck.x, deck[i].norm.x, deck[i].bump.x, deck[i].play.x][deck[i].g];
            deck[i].fnsh.y = [deck[i].stck.y, deck[i].norm.y, deck[i].bump.y, deck[i].play.y][deck[i].g];
            if (hand[p][c] != none)
                v++;
        }
    }
}

// Redraw all cards after a change in the window size
function redraw() {
    const now = performance.now();
    locate();
    for (let i = 0; i < indices; i++) {
        deck[i].strt.t = now;
        deck[i].fnsh.t = now;
}
    draw();
}

// Pull play cards after all players have played
function pull() {
    const now = performance.now();
    const x = deck[highPlayer*cards].stck.x;
    const y = deck[highPlayer*cards].stck.y;
    for (let i = 0; i < indices; i++) {
        if (deck[i].g == played) {
            deck[i].g = stackd;
            deck[i].strt.t = now;
            deck[i].fnsh.x = x;
            deck[i].fnsh.y = y;
            deck[i].fnsh.t = now + pullTime;
        }
    }
    turn = highPlayer;
    led = none;
    plays = none;
    highCard = none;
    highPlayer = none;
    draw();
}


// Given the previous highPlayer, c
function analyze() {
    for (let p = firstPlayer; nextPlayer(p) != firstPlayer; p = nextPlayer(p)) {
        for (let c = 0; c < cards; c++) {
            const i = pc2i(p, c);
            if (deck[i].g = played) {
                plays++;
                highCard = deck[i].v;
                highPlayer = p;
            }
        }
    }
}

// Close hand after card i is played
function close(i) {
    const now = performance.now();
    const p = i2p(i);
    const c = i2c(i);
    hand[p][c] = none;
    locate();
    for (let i2 = 0; i2 < indices; i2++) {
        deck[i2].strt.t = now;
        deck[i2].fnsh.t = now + closeTime;
    }
    plays++
    if (plays < players) {
        turn = nextPlayer(p);
        next = play;
    } else
        next = pull;
    draw();
}

// Play deck card i (part 2)
function play2(i) {
    const now = performance.now();
    turn = nextPlayer(turn);
    deck[i].z = -1;
    deck[i].strt.t = now;
    deck[i].fnsh.x = deck[i].play.x;
    deck[i].fnsh.y = deck[i].play.y;
    deck[i].fnsh.m = 1;
    deck[i].fnsh.t = now + playTime / 2;
    next = function() {close(i)};
    draw();
}

// Play deck card i (part 1)
function play1(i) {
    const now = performance.now();
    deck[i].g = played;
    deck[i].strt.t = now;
    deck[i].fnsh.x = (deck[i].fnsh.x + deck[i].play.x) / 2;
    deck[i].fnsh.y = (deck[i].fnsh.y + deck[i].play.y) / 2;
    if (i2p(i) != south) 
        deck[i].fnsh.m = 0;
    deck[i].fnsh.t = now + playTime / 2;
    next = function() {play2(i);};
    draw();
}

function play() {
    if (turn != south) {
        for (let i = 0; i < indices; i++) {
            if (legal(i2p(i), i2c(i))) {
                setTimeout (play1, playTime, i);
                return;
            }
        }
    }
}

// Re-fan each player's hand
function refan() {
    const now = performance.now();
    locate();
    for (let i = 0; i < indices; i++) {
        const p = i2p(i);
        const c = i2c(i);
        if (p == south) {
            deck[i].v = hand[p][c];
            deck[i].z = c + cards;
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
    next = play;
    draw();
}

// Stack the meld
function restack() {
    const now = performance.now();
    revealBid.style.display = "none";
    for (let i = 0; i < indices; i++) {
        deck[i].g = stackd;
        deck[i].strt.t = now;
        deck[i].fnsh.x = deck[i].stck.x;
        deck[i].fnsh.y = deck[i].stck.y;
        deck[i].fnsh.t = now + stackTime;
    }
    next = refan;
    draw();
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
            m += marriages(player, suit) * 4;
        else
            m += marriages(player, suit) * 2;
    return m;
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

// Cull all cards, restore cards needed for meld, then fan out the meld
function cull() {
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
    locate();
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
    next = end;
    draw();
}

// Reveal bid winner and stack the cards
function reveal() {
    const now = performance.now();
    pickTrump.style.display = "none";
    bidWinner.textContent = ["Your left opponent", "Your partner", "Your right opponent", "You"][bidder];
    bidValue.textContent = offer[bidder];
    trumpName.textContent = ["diamonds",,,,,"clubs",,,,,"hearts",,,,,"spades"][trump];
    ourMeld.textContent = meld(north, trump) + meld(south, trump);
    theirMeld.textContent = meld(west, trump) + meld(east, trump);
    if (bidder == north || bidder == south) {
        weNeed.textContent = Math.max(20, offer[bidder] - meld(north, trump) - meld(south, trump));
        theyNeed.textContent = 20;
    } else {
        weNeed.textContent = 20;
        theyNeed.textContent = Math.max(20, offer[bidder] - meld(west, trump) - meld(east, trump));
    }
    revealBid.style.display = "block";
    turn = bidder;
    for (let i = 0; i < indices; i++) {
        deck[i].strt.t = now;
        deck[i].g = stackd;
        deck[i].fnsh.x = deck[i].stck.x;
        deck[i].fnsh.y = deck[i].stck.y;
        deck[i].fnsh.t = now + stackTime;
    }
    next = cull;
    draw();
}

// Pick trump suit
function pick() {
    if (bidder == south) {
        pickTrump.style.display = "flex";
        return;
    }
    trump = spades;
    reveal();
}

// Return next offer after current offer
function nextOffer(current) {
    if (current == none)
        return 50;
    if (current < 60)
        return current + 1;
    return current + 5;
}

// Bid for the ability to name trump and go first
function bid() {
    while (offer[bidder] == pass) 
        bidder = nextPlayer(bidder);
    if (count(offer, pass) == 3) {
        for (let p of [west, north, east, south])
            bidBox[p].style.display = "none";
        pick();
        return;
    }
    if (offer[bidder] == none) {
        bidBox[bidder].style.display = "block";
        if (bidder == south) {
            meldSpan[0].textContent = meld(south, spades);
            meldSpan[1].textContent = meld(south, hearts);
            meldSpan[2].textContent = meld(south, clubs);
            meldSpan[3].textContent = meld(south, diamonds);
            pickBid.style.display = "flex";
        }
    }
    if (bidder == south) {
        offer[south] = nextOffer(Math.max(...offer));
        bidBox[south].textContent = "";
        bidButton[0].value = "Pass";
        bidButton[1].value = offer[south];
        for (let i = 2; i < bidButton.length; i++)
            bidButton[i].value = nextOffer(Number(bidButton[i-1].value));
        for (let i = 0; i < bidButton.length; i++)
            bidButton[i].disabled = false;
        return;
    } else {
        if (nextOffer(Math.max(...offer)) <= 65) {
            offer[bidder] = nextOffer(Math.max(...offer));
            bidBox[bidder].textContent = offer[bidder];
        } else {
            offer[bidder] = pass;
            bidBox[bidder].textContent = "Pass";
        }
        bidder = nextPlayer(bidder);
        setTimeout(bid, bidTime);
    }
}

// Fan cards from stacks to hands
function fan() {
    const now = performance.now();
    for (let i = 0; i < indices; i++) {
        const p = i2p(i);
        const c = i2c(i);
        if (p == south || state == fanning2) {
            deck[i].v = hand[p][c];
            deck[i].z = i;
        } else {
            deck[i].v = grayBack;
            deck[i].z = cards - c - 1;
        }
        deck[i].g = normal;
        deck[i].strt.t = now;
        deck[i].fnsh.x = deck[i].norm.x;
        deck[i].fnsh.y = deck[i].norm.y;
        deck[i].fnsh.t = now + fanTime;
    }
    draw();
}

// Fan cards from stacks to handst each player's stack
function sort() {
    const now = performance.now();
    for (let p = west; p <= south; p++)
        hand[p].sort((a,b)=>b-a);
    for (let i = 0; i < indices; i++) {
        const p = i2p(i);
        const c = i2c(i);
        if (p == south) {
            deck[i].v = hand[p][c];
            deck[i].z = cards + c;
            deck[i].strt.t = now;
            deck[i].fnsh.t = now + sortTime;
        }
    }
    next = fan;
    draw();
}

// Stack cards in player's stack
function stack() {
    const now = performance.now();
    for (let i = 0; i < indices; i++) {
        deck[i].g = stackd;
        deck[i].strt.t = now;
        deck[i].fnsh.x = deck[i].stck.x;
        deck[i].fnsh.y = deck[i].stck.y;
        deck[i].fnsh.t = now + stackTime;
    }
    draw();
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
    const seq = Array.from(new Array(indices), (v, k) => k % cards);
    bidder = nextPlayer(dealer);
    shuffle(seq);
    locate();
    for (let i = 0; i < indices; i++) {
        const p = (bidder + i) % players;
        const c = cards - Math.floor(i / players) - 1;
        const i2 = pc2i(p, c);
        hand[p][c] = seq[i];
        deck[i2].i = i2;
        deck[i2].v = grayBack;
        deck[i2].g = normal;
        deck[i2].z = cards - c - 1;
        deck[i2].strt.x = deck[dealer*cards].stck.x;
        deck[i2].strt.y = deck[dealer*cards].stck.y;
        deck[i2].strt.m = 1;
        deck[i2].strt.t = now + i * (dealTime - flyTime) / indices;
        deck[i2].fnsh.x = deck[i2].norm.x;
        deck[i2].fnsh.y = deck[i2].norm.y;
        deck[i2].fnsh.m = 1;
        deck[i2].fnsh.t = deck[i2].strt.t + flyTime;
    }
    drawn = false;
}

// Initialize the global variables that rely on the window size
function windowResized () {
    vw = Number.parseFloat(getComputedStyle(body).width);
    vh = Number.parseFloat(getComputedStyle(body).height);
    if (vw < vh) {
        pad = vw * 0.01;
        cw = Math.min(vw * 0.154, vh * 0.113);
    } else {
        pad = vw * 0.01;
        cw = Math.min(vh * 0.154, vw * 0.113);
    }
    ch = cw / 2.5 * 3.5;
    canvas.width  = vw;
    canvas.height = vh;
    redraw();
}

// When a bid button is clicked: blank center if south passed, advance bidder, and disable bid button
function bidClicked(e) {
    const value = e.target.value;
    bidBox[south].style.display = "block";
    bidBox[south].textContent = value;
    if (value == "Pass")
        offer[south] = pass;
    else
        offer[south] = Number(value);
    bidder = nextPlayer(bidder);
    for (let i = 0; i < bidButton.length; i++)
        bidButton[i].disabled = true;
    bid();
}

// When a pick buttion is clicked: set trump and reveal meld
function pickClicked(e) {
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
    pickTrump.style.display = "none";
    reveal();
}

// When play button is clicked: start play of hand
function yesClicked() {
    restack();
}

// When play button is clicked: start play of hand
function noClicked() {
}

// Convert x,y coordinates to index of top playable southern card (or undefined) 
function xy2i(x, y) {
    let topI;
    deck.sort((a,b)=>a.z-b.z);
    for (let i = 0; i < indices; i++) {
        const i2 = deck[i].i;
        const p = i2p(i2);
        const c = i2c(i2);
        if (p == south && legal(p, c)) {
            const l = deck[i].norm.x - cw/2;
            const r = deck[i].norm.x + cw/2;
            const t = deck[i].norm.y - ch/2;
            const b = deck[i].norm.y + ch/2;
            if (deck[i].g==normal && x>=l && x<=r && y>=t-ch*0.0 && y<=b)
                topI = i2;
            if (deck[i].g==bumped && x>=l && x<=r && y>=t-ch*0.4 && y<=b)
                topI = i2;
        }
    }
    deck.sort((a,b)=>a.i-b.i);
    return topI;
}

// If mouse moved off bumped card, unbump cards, and if mouse moved to normal card, bump it
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
                window.requestAnimationFrame(draw);
            }
        }
    }
    if (i != undefined && deck[i].g == normal) {
        deck[i].g = bumped;
        deck[i].strt.t = now;
        deck[i].fnsh.x = deck[i].bump.x;
        deck[i].fnsh.y = deck[i].bump.y;
        deck[i].fnsh.t = now + bumpTime;
        window.requestAnimationFrame(draw);
    }
}

// If mouse pressed normal/bumped card, unbump cards; if mouse pressed normal card, bump it; if it's its turn, play it
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
                window.requestAnimationFrame(draw);
            }
        }
        if (deck[i].g == normal) {
            deck[i].g = bumped;
            deck[i].strt.t = now;
            deck[i].fnsh.x = deck[i].bump.x;
            deck[i].fnsh.y = deck[i].bump.y;
            deck[i].fnsh.t = now + bumpTime;
            window.requestAnimationFrame(draw);
        }
        if (i2p(i) == turn)
            play1(i);
    }
}

// If touched bumped card and it's its turn, play it; if touch isn't bumped card, unbump cards; if normal touched, bump it 
function touchStarted(e) {
    body.onmousedown = "";
    body.onmousemove = "";
    const now = performance.now();
    const i = xy2i (e.touches[0].clientX, e.touches[0].clientY);
    if (i != undefined && deck[i].g == bumped && i2p(i) == turn)
            play1(i);
    if (i == undefined || deck[i].g != bumped) {
        for (let i2 = 0; i2 < indices; i2++) {
            if (deck[i2].g == bumped) {
                deck[i2].g = normal;
                deck[i2].strt.t = now;
                deck[i2].fnsh.x = deck[i2].norm.x;
                deck[i2].fnsh.y = deck[i2].norm.y;
                deck[i2].fnsh.t = now + bumpTime;
                window.requestAnimationFrame(draw);
            }
        }
    }
    if (i != undefined && deck[i].g == normal) {
        deck[i].g = bumped;
        deck[i].strt.t = now;
        deck[i].fnsh.x = deck[i].bump.x;
        deck[i].fnsh.y = deck[i].bump.y;
        deck[i].fnsh.t = now + bumpTime;
        window.requestAnimationFrame(draw);
    }
}

// If touch moved off bumped card, unbump cards, and if touch moved to normal card, bump it
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
                window.requestAnimationFrame(draw);
            }
        }
    }
    if (i != undefined && deck[i].g == normal) {
        deck[i].g = bumped;
        deck[i].strt.t = now;
        deck[i].fnsh.x = deck[i].bump.x;
        deck[i].fnsh.y = deck[i].bump.y;
        deck[i].fnsh.t = now + bumpTime;
        window.requestAnimationFrame(draw);
    }
}

// Open menu
function menuClicked() {
    menuText.style.display = "block";
}

// Close menu
function closeClicked() {
    menuText.style.display = "none";
}

// Reload application
function reloadClick() {
     location.reload();
}

// Run the app
function run() {
    while (true) {
        if (!drawn)
            draw();
        if (drawn) {
            switch (state) {
            case starting:
                state = dealing;
                deal();
                break;
            case dealing:
                state = stacking1;
                stack();
                break;
            case stacking1:
                for (let p of [west, north, east, south])
                    hand[p].sort((a,b)=>b-a);
                state = fanning1;
                fan();
                break;
            case fanning1:
                state = bidding;
                bid();
                break;
            case bidding:
                turn = bidder;
                state = stacking2;
                stack();
                break;
            case stacking2:
                state = fanning2;
                fan();
                break;
            case fanning2:
                state = waiting1;
                wait();
                break;
            case waiting1:
                state = stacking3;
                stack();
                break;
            case stacking3:
                state = fanning3;
                fan();
                break;
            case fanning3:
                state = playing;
                play();
                break;
            case playing:
                state = closing;
                close();
                break;
            case closing:
                state = pulling;
                pull();
                break;
            case pulling:
                state = playing;
                play();
                break;
            case waiting2:
                state = dealing;
                deal();
            }
        }
        if (!drawn)
            window.requestAnimationFrame(run);
    }
}

// Initialize javascript and start game after window loads
window.onload = function() {
    for (let v = 0; v < src.length; v++)
        img[v].src = src[v];
    windowResized();
    window.onresize = windowResized;
    menuIcon.draggable = false;
    for (let i = 0; i < bidButton.length; i++)
        bidButton[i].onclick = bidClicked;
    for (let i = 0; i < pickButton.length; i++)
        pickButton[i].onclick = function() {pickClicked(i)};
    yesButton.onclick = yesClicked;
    noButton.onclick = noClicked;
    body.onmousemove   = mouseMoved;
    body.onmousedown   = mousePressed;
    body.ontouchstart  = touchStarted;
    body.ontouchmove   = touchMoved;
    menuIcon.onclick   = menuClicked;
    closeIcon.onclick  = closeClicked;
    reload.onclick     = reloadClick;
    run();
}
