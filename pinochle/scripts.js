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

// Card value = rank + suit
const grayBack = 20;
const maxHand  = 20;
const maxDeck  = 80;

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

// hand[p][c] = player p's card c's card value (or -1)
const hand = [Array(maxHand), Array(maxHand), Array(maxHand), Array(maxHand)];

// offer[p] = player p's bid (0 = none; -1 = pass)
const none = 0;
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
        this.v = 0;                 // card value
        this.x = 0;                 // x at card center
        this.y = 0;                 // y at card center
        this.m = 0;                 // multiplier for card height (0 to 1)
        this.c = 0;                 // clock value
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

// deck[i] = deck card i
const deck = [
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,
    new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C,new C
];

// Page elements
const felt       = document.getElementById("felt");
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
const dealTime   = 2000;            // milliseconds to deal all cards
const flyTime    = dealTime / 20;   // milliseconds to deal a card
const stackTime  = dealTime / 10;   // milliseconds to stack cards
const sortTime   = dealTime / 4;    // milliseconds to sort cards
const fanTime    = dealTime / 10;   // milliseconds to stack cards
const bidTime    = dealTime / 4;    // milliseconds between bids
const bumpTime   = dealTime / 20;   // milliseconds to bump/umbump a card
const playTime   = dealTime / 10;   // milliseconds to play a card
const closeTime  = dealTime / 10;   // milliseconds to close gaps in hand
const pullTime   = dealTime / 10;   // milliseconds to pull a trick

// Other constants
const version    = "0.77";          // version number to display

// Function to end draw chain
function end() {};

// Global variables
let dealer  = 0;                    // the player who is dealing or last dealt
let bidder  = 0;                    // the player who is bidding or won the bid
let trump   = 0;                    // the bidder's trump suit
let turn    = 0;                    // the next player to play
let puller  = 0;                    // the player who won the play
let feltW   = 0;                    // felt width
let feltH   = 0;                    // felt height
let pad     = 0;                    // padding width and height
let cardW   = 0;                    // card width
let cardH   = 0;                    // card height
let next    = end;                  // next function in draw chain

// Convert deck index i to player p
function i2p(i) {
    return Math.floor(i / maxHand);
}

// Convert deck index i to card c
function i2c(i) {
    return i % maxHand;
}

// Convert player p and card c to deck index i
function pc2i(p, c) {
    return p * maxHand + c;
}

// Count number of time value v occurs in array a
function count(a, v) {
    let n = 0;
    for (let i = 0; i < a.length; i++)
        if (a[i] == v)
            n++;
    return n;
}

// Draw cards in z order until each card is at its final state then reset its start state for the next operation
function draw() {
    let drawn = true;
    const now = performance.now();
    deck.sort((a,b)=>a.z-b.z);
    context.clearRect(0, 0, feltW, feltH);
    for (let i = 0; i < maxDeck; i++) {
        const r = [Math.PI/2, 0, Math.PI/2, 0][i2p(deck[i].i)];
        if (now < deck[i].fnsh.c)
            drawn = false;
        if (now <= deck[i].strt.c) {
            context.translate(deck[i].strt.x, deck[i].strt.y);
            context.rotate(r);
            context.drawImage(img[deck[i].v], -cardW/2, -cardH/2*deck[i].strt.m, cardW, cardH*deck[i].strt.m);
            context.resetTransform();
        }
        if (now >= deck[i].fnsh.c) {
            context.translate(deck[i].fnsh.x, deck[i].fnsh.y);
            context.rotate(r);
            context.drawImage(img[deck[i].v], -cardW/2, -cardH/2*deck[i].fnsh.m, cardW, cardH*deck[i].fnsh.m);
            context.resetTransform();
            deck[i].strt.x = deck[i].fnsh.x;
            deck[i].strt.y = deck[i].fnsh.y;
            deck[i].strt.m = deck[i].fnsh.m;
        }
        if (now > deck[i].strt.c && now < deck[i].fnsh.c) {
            const ps = (deck[i].fnsh.c - now) / (deck[i].fnsh.c - deck[i].strt.c);
            const pf = (now - deck[i].strt.c) / (deck[i].fnsh.c - deck[i].strt.c);
            const x = deck[i].strt.x*ps + deck[i].fnsh.x*pf;
            const y = deck[i].strt.y*ps + deck[i].fnsh.y*pf;
            const m = deck[i].strt.m*ps + deck[i].fnsh.m*pf;
            context.translate(x, y);
            context.rotate(r);
            context.drawImage(img[deck[i].v], -cardW/2, -cardH/2*m, cardW, cardH*m);
            context.resetTransform();
        }
    }
    deck.sort((a,b)=>a.i-b.i);
    if (drawn)
        next();
    else
        window.requestAnimationFrame(draw);
}

// Locate all card positions (n = number of semi-exposed cards; v = visble card number)
function locate() {
    for (let p of [west, north, east, south]) {
        const n = maxHand - count(hand[p], -1) - 1;
        let v = 0;
        for (let c = 0; c < maxHand; c++) {
            const i = pc2i(p, c);
            deck[i].stck.x = [-cardH/2, feltW/2, feltW + cardH/2, feltW/2][p];
            deck[i].stck.y = [feltH/2, -cardH/2, feltH/2, feltH + cardH/2][p];
            deck[i].norm.x = [cardH/2+pad, feltW/2-cardW/4*(v-n/2), feltW-cardH/2-pad, feltW/2+cardW/4*(v-n/2)][p];
            deck[i].norm.y = [feltH/2+cardW/4*(v-n/2), cardH/2+pad, feltH/2-cardW/4*(v-n/2), feltH-cardH/2-pad][p];
            deck[i].bump.x = deck[i].norm.x + [cardH*0.4, 0, -cardH*0.4, 0][p];
            deck[i].bump.y = deck[i].norm.y + [0, cardH*0.4, 0, -cardH*0.4][p];
            deck[i].play.x = feltW/2 + [-cardH/2-pad/2, cardW/2+pad/2, cardH/2+pad/2, -cardW/2-pad/2][p];
            deck[i].play.y = feltH/2 + [-cardW/2-pad/2, -cardH/2-pad/2, cardW/2+pad/2, cardH/2+pad/2][p];
            deck[i].strt.x = [deck[i].stck.x, deck[i].norm.x, deck[i].bump.x, deck[i].play.x][deck[i].g];
            deck[i].strt.y = [deck[i].stck.y, deck[i].norm.y, deck[i].bump.y, deck[i].play.y][deck[i].g];
            deck[i].fnsh.x = [deck[i].stck.x, deck[i].norm.x, deck[i].bump.x, deck[i].play.x][deck[i].g];
            deck[i].fnsh.y = [deck[i].stck.y, deck[i].norm.y, deck[i].bump.y, deck[i].play.y][deck[i].g];
            if (hand[p][c] != -1)
                v++;
        }
    }
}

// Redraw all cards after a change in the felt size
function redraw() {
    const now = performance.now();
    locate();
    for (let i = 0; i < maxDeck; i++) {
        deck[i].strt.c = now;
        deck[i].fnsh.c = now;
    }
    draw();
}

// Pull play cards after all players have played
function pull() {
    const now = performance.now();
    for (let i = 0; i < maxDeck; i++) {
        if (deck[i].g == played) {
            deck[i].g = stackd;
            deck[i].strt.c = now;
            deck[i].fnsh.x = deck[puller*maxHand].stck.x;
            deck[i].fnsh.y = deck[puller*maxHand].stck.y;
            deck[i].fnsh.c = now + pullTime;
        }
    }
    next = end;
    draw();
}

// Close hand after card i is played
function close(i) {
    const now = performance.now();
    hand[i2p(i)][i2c(i)] = -1;
    locate();
    for (let i = 0; i < maxDeck; i++) {
        deck[i].strt.c = now;
        deck[i].fnsh.c = now + closeTime;
    }
    if (turn == (bidder + players) % players) 
        next = pull;
    else
        next = end;
    draw();
}

// Return next player after current player
function nextPlayer(current) {
    return (current + 1) % players;
}

// Play deck card i (part 2)
function play2(i) {
    const now = performance.now();
    turn = nextPlayer(turn);
    deck[i].g = played;
    deck[i].z = -1;
    deck[i].strt.c = now;
    deck[i].fnsh.x = deck[i].play.x;
    deck[i].fnsh.y = deck[i].play.y;
    deck[i].fnsh.m = 1;
    deck[i].fnsh.c = now + playTime / 2;
    next = function() {close(i)};
    draw();
}

// Play deck card i (part 1)
function play1(i) {
    const now = performance.now();
    deck[i].strt.c = now;
    deck[i].fnsh.x = (deck[i].fnsh.x + deck[i].play.x) / 2;
    deck[i].fnsh.y = (deck[i].fnsh.y + deck[i].play.y) / 2;
    if (i2p(i) != south) 
        deck[i].fnsh.m = 0;
    deck[i].fnsh.c = now + playTime / 2;
    next = function() {play2(i);};
    draw();
}

// Re-fan each player's hand
function refan() {
    const now = performance.now();
    locate();
    for (let i = 0; i < maxDeck; i++) {
        const p = i2p(i);
        const c = i2c(i);
        if (p == south) {
            deck[i].v = hand[p][c];
            deck[i].z = c + maxHand;
        } else {
            deck[i].v = grayBack;
            deck[i].z = maxHand - c - 1;
        }
        deck[i].g = normal;
        deck[i].strt.c = now;
        deck[i].fnsh.x = deck[i].norm.x;
        deck[i].fnsh.y = deck[i].norm.y;
        deck[i].fnsh.c = now + stackTime;
    }
    next = end;
    draw();
}

// Stack the meld
function restack() {
    const now = performance.now();
    revealBid.style.display = "none";
    for (let i = 0; i < maxDeck; i++) {
        deck[i].g = stackd;
        deck[i].strt.c = now;
        deck[i].fnsh.x = deck[i].stck.x;
        deck[i].fnsh.y = deck[i].stck.y;
        deck[i].fnsh.c = now + stackTime;
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
    for (let i = 0; n > 0 && i < maxDeck; i++) {
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
    const save = [Array(maxHand), Array(maxHand), Array(maxHand), Array(maxHand)];
    const need = Array(maxHand);
    for (let player of [west, north, east, south]) {
        save[player] = [...hand[player]];
        need.fill(-1);
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
        for (let c = 0; c < maxHand; c++) {
            const i = pc2i(p, c);
            if (hand[p][c] != -1) {
                deck[i].v = hand[p][c];
                deck[i].g = normal;
                deck[i].z = c;
                deck[i].strt.c = now;
                deck[i].fnsh.x = deck[i].norm.x;
                deck[i].fnsh.y = deck[i].norm.y;
                deck[i].fnsh.c = now + fanTime;
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
    puller = bidder;
    for (let i = 0; i < maxDeck; i++) {
        deck[i].strt.c = now;
        deck[i].g = stackd;
        deck[i].fnsh.x = deck[i].stck.x;
        deck[i].fnsh.y = deck[i].stck.y;
        deck[i].fnsh.c = now + stackTime;
    }
    next = cull;
    draw();
}

// Pick trump suit
function pick() {
    pickBid.style.display = "none";
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
    next = end;
    while (offer[bidder] == pass) 
        bidder = nextPlayer(bidder);
    if (count(offer, pass) == 3) {
        for (let p = 0; p < players; p++)
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

// Fan player's cards
function fan() {
    const now = performance.now();
    for (let i = 0; i < maxDeck; i++) {
        deck[i].strt.c = now;
        deck[i].g = normal;
        deck[i].fnsh.x = deck[i].norm.x;
        deck[i].fnsh.y = deck[i].norm.y;
        deck[i].fnsh.c = now + fanTime;
    }
    next = bid;
    draw();
}

// Sort each player's stack
function sort() {
    const now = performance.now();
    for (let p = west; p <= south; p++)
        hand[p].sort((a,b)=>b-a);
    for (let i = 0; i < maxDeck; i++) {
        const p = i2p(i);
        const c = i2c(i);
        if (p == south) {
            deck[i].v = hand[p][c];
            deck[i].z = maxHand + c;
            deck[i].strt.c = now;
            deck[i].fnsh.c = now + sortTime;
        }
    }
    next = fan;
    draw();
}

// Stack cards in player's stack
function stack() {
    const now = performance.now();
    for (let i = 0; i < maxDeck; i++) {
        deck[i].g = stackd;
        deck[i].strt.c = now;
        deck[i].fnsh.x = deck[i].stck.x;
        deck[i].fnsh.y = deck[i].stck.y;
        deck[i].fnsh.c = now + stackTime;
    }
    next = sort;
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
    const seq = Array.from(new Array(maxDeck), (v, k) => k % maxHand);
    dealer = Math.floor(Math.random() * players);
    bidder = turn = puller = nextPlayer(dealer);
    shuffle(seq);
    locate();
    for (let s = 0; s < maxDeck; s++) {
        const p = (bidder + s) % players;
        const c = maxHand - Math.floor(s / players) - 1;
        const i = pc2i(p, c);
        hand[p][c] = seq[s];
        deck[i].i = i;
        deck[i].v = grayBack;
        deck[i].g = normal;
        deck[i].z = maxHand-c-1;
        deck[i].strt.x = deck[dealer*maxHand].stck.x;
        deck[i].strt.y = deck[dealer*maxHand].stck.y;
        deck[i].strt.m = 1;
        deck[i].strt.c = now + s * (dealTime - flyTime) / maxDeck;
        deck[i].fnsh.x = deck[i].norm.x;
        deck[i].fnsh.y = deck[i].norm.y;
        deck[i].fnsh.m = 1;
        deck[i].fnsh.c = deck[i].strt.c + flyTime;
    }
    next = stack;
    draw();
}

// Convert x,y coordinates to index of top card (or undefined)
function xy2i(x, y) {
    let topI, l, r, t, b;
    deck.sort((a,b)=>a.z-b.z);
    for (let d = 0; d < maxDeck; d++) {
        const i = deck[d].i;
        const p = i2p(i);
        switch(deck[d].g) {
        case normal:
            l = deck[d].norm.x - [cardH/2, cardW/2, cardH/2, cardW/2][p];
            r = deck[d].norm.x + [cardH/2, cardW/2, cardH/2, cardW/2][p];
            t = deck[d].norm.y - [cardW/2, cardH/2, cardW/2, cardH/2][p];
            b = deck[d].norm.y + [cardW/2, cardH/2, cardW/2, cardH/2][p];
            if (x >= l && x <= r && y >= t && y <= b)
                topI = i;
            break;
        case bumped:
            l = deck[d].norm.x - [cardH/2, cardW/2, cardH/1, cardW/2][p];
            r = deck[d].norm.x + [cardH/1, cardW/2, cardH/2, cardW/2][p];
            t = deck[d].norm.y - [cardW/2, cardH/2, cardW/2, cardH/1][p];
            b = deck[d].norm.y + [cardW/2, cardH/1, cardW/2, cardH/2][p];
            if (x >= l && x <= r && y >= t && y <= b)
                topI = i;
        }
    }
    deck.sort((a,b)=>a.i-b.i);
    return topI;
}

// Initialize the global variables that rely on the window size
function windowResized () {
    feltW = Number.parseFloat(getComputedStyle(felt).width);
    feltH = Number.parseFloat(getComputedStyle(felt).height);
    if (feltW < feltH) {
        pad = feltW * 0.01;
        cardW = Math.min(feltW * 0.154, feltH * 0.113);
    } else {
        pad = feltW * 0.01;
        cardW = Math.min(feltH * 0.154, feltW * 0.113);
    }
    cardH = cardW / 2.5 * 3.5;
    canvas.width  = feltW;
    canvas.height = feltH;
    redraw();
}

// When bid button is clicked: blank center if south passed, advance bidder, and disable bid button
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

// When pick buttion i is clicked: set trump and reveal meld
function pickClicked(i) {
    trump = [spades, hearts, clubs, diamonds][i];
    reveal();
}

// When play button is clicked: start play of hand
function yesClicked() {
    restack();
}

// When play button is clicked: start play of hand
function noClicked() {
}

// If mouse moved off bumped card, unbump cards, and if mouse moved to normal card, bump it
function mouseMoved(e) {
    const now = performance.now();
    const i = xy2i (e.clientX, e.clientY);
    if (i == undefined || deck[i].g != bumped) {
        for (let d = 0; d < maxDeck; d++) {
            if (deck[d].g == bumped) {
                deck[d].g = normal;
                deck[d].strt.c = now;
                deck[d].fnsh.x = deck[d].norm.x;
                deck[d].fnsh.y = deck[d].norm.y;
                deck[d].fnsh.c = now + bumpTime;
                window.requestAnimationFrame(draw);
            }
        }
    }
    if (i != undefined && deck[i].g == normal) {
        deck[i].g = bumped;
        deck[i].strt.c = now;
        deck[i].fnsh.x = deck[i].bump.x;
        deck[i].fnsh.y = deck[i].bump.y;
        deck[i].fnsh.c = now + bumpTime;
        window.requestAnimationFrame(draw);
    }
}

// If mouse pressed normal/bumped card, unbump cards; if mouse pressed normal card, bump it; if it's its turn, play it
function mousePressed(e) {
    const now = performance.now();
    const i = xy2i (e.clientX, e.clientY);
    if (i != undefined) {
        for (let d = 0; d < maxDeck; d++) {
            if (d != i && deck[d].g == bumped) {
                deck[d].g = normal;
                deck[d].strt.c = now;
                deck[d].fnsh.x = deck[d].norm.x;
                deck[d].fnsh.y = deck[d].norm.y;
                deck[d].fnsh.c = now + bumpTime;
                window.requestAnimationFrame(draw);
            }
        }
        if (deck[i].g == normal) {
            deck[i].g = bumped;
            deck[i].strt.c = now;
            deck[i].fnsh.x = deck[i].bump.x;
            deck[i].fnsh.y = deck[i].bump.y;
            deck[i].fnsh.c = now + bumpTime;
            window.requestAnimationFrame(draw);
        }
        if (i2p(i) == turn)
            play1(i);
    }
}

// If touched bumped card and it's its turn, play it; if touch isn't bumped card, unbump cards; if normal touched, bump it 
function touchStarted(e) {
    felt.onmousedown = "";
    felt.onmousemove = "";
    const now = performance.now();
    const i = xy2i (e.touches[0].clientX, e.touches[0].clientY);
    if (i != undefined && deck[i].g == bumped && i2p(i) == turn)
            play1(i);
    if (i == undefined || deck[i].g != bumped) {
        for (let d = 0; d < maxDeck; d++) {
            if (deck[d].g == bumped) {
                deck[d].g = normal;
                deck[d].strt.c = now;
                deck[d].fnsh.x = deck[d].norm.x;
                deck[d].fnsh.y = deck[d].norm.y;
                deck[d].fnsh.c = now + bumpTime;
                window.requestAnimationFrame(draw);
            }
        }
    }
    if (i != undefined && deck[i].g == normal) {
        deck[i].g = bumped;
        deck[i].strt.c = now;
        deck[i].fnsh.x = deck[i].bump.x;
        deck[i].fnsh.y = deck[i].bump.y;
        deck[i].fnsh.c = now + bumpTime;
        window.requestAnimationFrame(draw);
    }
}

// If touch moved off bumped card, unbump cards, and if touch moved to normal card, bump it
function touchMoved(e) {
    const now = performance.now();
    const i = xy2i (e.touches[0].clientX, e.touches[0].clientY);
    if (i == undefined || deck[i].g != bumped) {
        for (let d = 0; d < maxDeck; d++) {
            if (deck[d].g == bumped) {
                deck[d].g = normal;
                deck[d].strt.c = now;
                deck[d].fnsh.x = deck[d].norm.x;
                deck[d].fnsh.y = deck[d].norm.y;
                deck[d].fnsh.c = now + bumpTime;
                window.requestAnimationFrame(draw);
            }
        }
    }
    if (i != undefined && deck[i].g == normal) {
        deck[i].g = bumped;
        deck[i].strt.c = now;
        deck[i].fnsh.x = deck[i].bump.x;
        deck[i].fnsh.y = deck[i].bump.y;
        deck[i].fnsh.c = now + bumpTime;
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
    felt.onmousemove   = mouseMoved;
    felt.onmousedown   = mousePressed;
    felt.ontouchstart  = touchStarted;
    felt.ontouchmove   = touchMoved;
    menuIcon.onclick   = menuClicked;
    closeIcon.onclick  = closeClicked;
    reload.onclick     = reloadClick;
    deal();
}
