"use strict";

// Puzzle constants
const guesses = 6, letters = 5, tiles = 21, levels = 10
const L1 = 0, L2 = 1, L3 = 2, L4 = 3, L5 = 4                                            // guess letters: letter 1, letter2, letter 3, letter 4, letter 5
const R1 = 0, R3 = 1, R5 = 2, C1 = 3, C3 = 4, C5 = 5                                    // guess numbers: row 1, row 3, row 5, column 1, column 3, column 5
const asca = "a".charCodeAt(), ascz = "z".charCodeAt();
const gry = "rgb(237, 239, 241)";                                                       // "#EDEFF1"
const yel = "rgb(233, 186, 58)";                                                        // "#E9BA3A"
const grn = "rgb(111, 176, 92)";                                                        // "#6FB05C"
const blk = "rgb(0, 0, 0)";                                                             // "#000000"
const wht = "rgb(255, 255, 255)";                                                       // "#FFFFFF"
const red = "rgb(255, 0, 0)";                                                           // "#FF0000"
const blu = "rgb(0, 0, 255)";                                                           // "#0000FF"

// 5-letter dictionary
const word = [                                                                          // word string table where word[w] is word w and word[w][l] is letter l of word w
    "aahed", "aalii", "aargh", "aarti", "abaca", "abaci", "aback", "abacs", "abaft", "abaka", "abamp", "aband", "abase", "abash", "abask", "abate", "abaya", "abbas", "abbed", "abbes",
    "abbey", "abbot", "abcee", "abeam", "abear", "abele", "abers", "abets", "abhor", "abide", "abies", "abled", "abler", "ables", "ablet", "ablow", "abmho", "abode", "abohm", "aboil",
    "aboma", "aboon", "abord", "abore", "abort", "about", "above", "abram", "abray", "abrim", "abrin", "abris", "absey", "absit", "abuna", "abune", "abuse", "abuts", "abuzz", "abyes",
    "abysm", "abyss", "acais", "acari", "accas", "accoy", "acerb", "acers", "aceta", "achar", "ached", "aches", "achoo", "acids", "acidy", "acing", "acini", "ackee", "acker", "acmes",
    "acmic", "acned", "acnes", "acock", "acold", "acorn", "acred", "acres", "acrid", "acros", "acted", "actin", "acton", "actor", "acute", "acyls", "adage", "adapt", "adaws", "adays",
    "adbot", "addax", "added", "adder", "addio", "addle", "adeem", "adept", "adhan", "adieu", "adios", "adits", "adman", "admen", "admin", "admit", "admix", "adobe", "adobo", "adopt",
    "adore", "adorn", "adown", "adoze", "adrad", "adred", "adsum", "aduki", "adult", "adunc", "adust", "advew", "adyta", "adzed", "adzes", "aecia", "aedes", "aegis", "aeons", "aerie",
    "aeros", "aesir", "afald", "afara", "afars", "afear", "affix", "afire", "aflaj", "afoot", "afore", "afoul", "afrit", "afros", "after", "again", "agama", "agami", "agape", "agars",
    "agast", "agate", "agave", "agaze", "agene", "agent", "agers", "agger", "aggie", "aggri", "aggro", "aggry", "aghas", "agila", "agile", "aging", "agios", "agism", "agist", "agita",
    "aglee", "aglet", "agley", "agloo", "aglow", "aglus", "agmas", "agoge", "agone", "agons", "agony", "agood", "agree", "agria", "agrin", "agros", "agued", "agues", "aguna", "aguti",
    "ahead", "aheap", "ahent", "ahigh", "ahind", "ahing", "ahint", "ahold", "ahull", "ahuru", "aidas", "aided", "aider", "aides", "aidoi", "aidos", "aiery", "aigas", "aight", "ailed",
    "aimed", "aimer", "ainee", "ainga", "aioli", "aired", "airer", "airns", "airth", "airts", "aisle", "aitch", "aitus", "aiver", "aiyee", "aizle", "ajies", "ajiva", "ajuga", "ajwan",
    "akees", "akela", "akene", "aking", "akita", "akkas", "alaap", "alack", "alamo", "aland", "alane", "alang", "alans", "alant", "alapa", "alaps", "alarm", "alary", "alate", "alays",
    "albas", "albee", "album", "alcid", "alcos", "aldea", "alder", "aldol", "aleck", "alecs", "alefs", "aleft", "aleph", "alert", "alews", "aleye", "alfas", "algae", "algal", "algas",
    "algid", "algin", "algor", "algum", "alias", "alibi", "alien", "alifs", "align", "alike", "aline", "alist", "alive", "aliya", "alkie", "alkos", "alkyd", "alkyl", "allay", "allee",
    "allel", "alley", "allis", "allod", "allot", "allow", "alloy", "allyl", "almah", "almas", "almeh", "almes", "almud", "almug", "alods", "aloed", "aloes", "aloft", "aloha", "aloin",
    "alone", "along", "aloof", "aloos", "aloud", "alowe", "alpha", "altar", "alter", "altho", "altos", "alula", "alums", "alure", "alvar", "alway", "amahs", "amain", "amass", "amate",
    "amaut", "amaze", "amban", "amber", "ambit", "amble", "ambos", "ambry", "ameba", "ameer", "amend", "amene", "amens", "ament", "amias", "amice", "amici", "amide", "amido", "amids",
    "amies", "amiga", "amigo", "amine", "amino", "amins", "amirs", "amiss", "amity", "amlas", "amman", "ammon", "ammos", "amnia", "amnic", "amnio", "amoks", "amole", "among", "amort",
    "amour", "amove", "amowt", "amped", "ample", "amply", "ampul", "amrit", "amuck", "amuse", "amyls", "anana", "anata", "ancho", "ancle", "ancon", "andro", "anear", "anele", "anent",
    "angas", "angel", "anger", "angle", "anglo", "angry", "angst", "anigh", "anile", "anils", "anima", "anime", "animi", "anion", "anise", "anker", "ankhs", "ankle", "ankus", "anlas",
    "annal", "annas", "annat", "annex", "annoy", "annul", "anoas", "anode", "anole", "anomy", "ansae", "antae", "antar", "antas", "anted", "antes", "antic", "antis", "antra", "antre",
    "antsy", "anura", "anvil", "anyon", "aorta", "apace", "apage", "apaid", "apart", "apayd", "apays", "apeak", "apeek", "apers", "apert", "apery", "apgar", "aphid", "aphis", "apian",
    "aping", "apiol", "apish", "apism", "apnea", "apode", "apods", "apoop", "aport", "appal", "appay", "appel", "apple", "apply", "appro", "appui", "appuy", "apres", "apron", "apses",
    "apsis", "apsos", "apted", "apter", "aptly", "aquae", "aquas", "araba", "araks", "arame", "arars", "arbas", "arbor", "arced", "archi", "arcos", "arcus", "ardeb", "ardor", "ardri",
    "aread", "areae", "areal", "arear", "areas", "areca", "aredd", "arede", "arefy", "areic", "arena", "arene", "arepa", "arere", "arete", "arets", "arett", "argal", "argan", "argil",
    "argle", "argol", "argon", "argot", "argue", "argus", "arhat", "arias", "ariel", "ariki", "arils", "ariot", "arise", "arish", "arked", "arled", "arles", "armed", "armer", "armet",
    "armil", "armor", "arnas", "arnut", "aroba", "aroha", "aroid", "aroma", "arose", "arpas", "arpen", "arrah", "arras", "array", "arret", "arris", "arrow", "arroz", "arsed", "arses",
    "arsey", "arsis", "arson", "artal", "artel", "artic", "artis", "artsy", "aruhe", "arums", "arval", "arvee", "arvos", "aryls", "asana", "ascon", "ascot", "ascus", "asdic", "ashed",
    "ashen", "ashes", "ashet", "aside", "asked", "asker", "askew", "askoi", "askos", "aspen", "asper", "aspic", "aspie", "aspis", "aspro", "assai", "assam", "assay", "asses", "asset",
    "assez", "assot", "aster", "astir", "astun", "asura", "asway", "aswim", "asyla", "ataps", "ataxy", "atigi", "atilt", "atimy", "atlas", "atman", "atmas", "atmos", "atocs", "atoke",
    "atoks", "atoll", "atoms", "atomy", "atone", "atony", "atopy", "atria", "atrip", "attap", "attar", "attic", "atuas", "audad", "audio", "audit", "auger", "aught", "augur", "aulas",
    "aulic", "auloi", "aulos", "aumil", "aunes", "aunts", "aunty", "aurae", "aural", "aurar", "auras", "aurei", "aures", "auric", "auris", "aurum", "autos", "auxin", "avail", "avale",
    "avant", "avast", "avels", "avens", "avers", "avert", "avgas", "avian", "avine", "avion", "avise", "aviso", "avize", "avoid", "avows", "avyze", "await", "awake", "award", "aware",
    "awarn", "awash", "awato", "awave", "aways", "awdls", "aweel", "aweto", "awful", "awing", "awmry", "awned", "awner", "awoke", "awols", "awork", "axels", "axial", "axile", "axils",
    "axing", "axiom", "axion", "axite", "axled", "axles", "axman", "axmen", "axoid", "axone", "axons", "ayahs", "ayaya", "ayelp", "aygre", "ayins", "ayont", "ayres", "ayrie", "azans",
    "azide", "azido", "azine", "azlon", "azoic", "azole", "azons", "azote", "azoth", "azuki", "azure", "azurn", "azury", "azygy", "azyme", "azyms", "baaed", "baals", "babas", "babel",
    "babes", "babka", "baboo", "babul", "babus", "bacca", "bacco", "baccy", "bacha", "bachs", "backs", "bacon", "baddy", "badge", "badly", "baels", "baffs", "baffy", "bafts", "bagel",
    "baggy", "baghs", "bagie", "bahts", "bahus", "bahut", "bails", "bairn", "baisa", "baith", "baits", "baiza", "baize", "bajan", "bajra", "bajri", "bajus", "baked", "baken", "baker",
    "bakes", "bakra", "balas", "balds", "baldy", "baled", "baler", "bales", "balks", "balky", "balls", "bally", "balms", "balmy", "baloo", "balsa", "balti", "balun", "balus", "bambi",
    "banak", "banal", "banco", "bancs", "banda", "bandh", "bands", "bandy", "baned", "banes", "bangs", "bania", "banjo", "banks", "banns", "bants", "bantu", "banty", "banya", "bapus",
    "barbe", "barbs", "barby", "barca", "barde", "bardo", "bards", "bardy", "bared", "barer", "bares", "barfi", "barfs", "barge", "baric", "barks", "barky", "barms", "barmy", "barns",
    "barny", "baron", "barps", "barra", "barre", "barro", "barry", "barye", "basal", "basan", "based", "basen", "baser", "bases", "basho", "basic", "basij", "basil", "basin", "basis",
    "basks", "bason", "basse", "bassi", "basso", "bassy", "basta", "baste", "basti", "basto", "basts", "batch", "bated", "bates", "bathe", "baths", "batik", "baton", "batta", "batts",
    "battu", "batty", "bauds", "bauks", "baulk", "baurs", "bavin", "bawds", "bawdy", "bawks", "bawls", "bawns", "bawrs", "bawty", "bayed", "bayer", "bayes", "bayle", "bayou", "bayts",
    "bazar", "bazoo", "beach", "beads", "beady", "beaks", "beaky", "beals", "beams", "beamy", "beano", "beans", "beany", "beard", "beare", "bears", "beast", "beath", "beats", "beaty",
    "beaus", "beaut", "beaux", "bebop", "becap", "becke", "becks", "bedad", "bedel", "bedes", "bedew", "bedim", "bedye", "beech", "beedi", "beefs", "beefy", "beeps", "beers", "beery",
    "beets", "befit", "befog", "begad", "began", "begar", "begat", "begem", "beget", "begin", "begot", "begum", "begun", "beige", "beigy", "being", "beins", "bekah", "belah", "belar",
    "belay", "belch", "belee", "belga", "belie", "belle", "bells", "belly", "belon", "below", "belts", "bemad", "bemas", "bemix", "bemud", "bench", "bends", "bendy", "benes", "benet",
    "benga", "benis", "benne", "benni", "benny", "bento", "bents", "benty", "bepat", "beray", "beres", "beret", "bergs", "berko", "berks", "berme", "berms", "berob", "berry", "berth",
    "beryl", "besat", "besaw", "besee", "beses", "beset", "besit", "besom", "besot", "besti", "bests", "betas", "beted", "betel", "betes", "beths", "betid", "beton", "betta", "betty",
    "bevel", "bever", "bevor", "bevue", "bevvy", "bewet", "bewig", "bezel", "bezes", "bezil", "bezzy", "bhais", "bhaji", "bhang", "bhats", "bhels", "bhoot", "bhuna", "bhuts", "biach",
    "biali", "bialy", "bibbs", "bibes", "bible", "biccy", "bicep", "bices", "biddy", "bided", "bider", "bides", "bidet", "bidis", "bidon", "bield", "biers", "biffo", "biffs", "biffy",
    "bifid", "bigae", "biggs", "biggy", "bigha", "bight", "bigly", "bigos", "bigot", "bijou", "biked", "biker", "bikes", "bikie", "bilbo", "bilby", "biled", "biles", "bilge", "bilgy",
    "bilks", "bills", "billy", "bimah", "bimas", "bimbo", "binal", "bindi", "binds", "biner", "bines", "binge", "bingo", "bings", "bingy", "binit", "binks", "bints", "biogs", "biome",
    "biont", "biota", "biped", "bipod", "birch", "birds", "birks", "birle", "birls", "biros", "birrs", "birse", "birsy", "birth", "bises", "bisks", "bisom", "bison", "biter", "bites",
    "bitos", "bitou", "bitsy", "bitte", "bitts", "bitty", "bivia", "bivvy", "bizes", "bizzo", "bizzy", "blabs", "black", "blade", "blads", "blady", "blaer", "blaes", "blaff", "blags",
    "blahs", "blain", "blame", "blams", "bland", "blank", "blare", "blart", "blase", "blash", "blast", "blate", "blats", "blatt", "blaud", "blawn", "blaws", "blays", "blaze", "bleak",
    "blear", "bleat", "blebs", "blech", "bleed", "bleep", "blees", "blend", "blent", "blert", "bless", "blest", "blets", "bleys", "blimp", "blimy", "blind", "bling", "blini", "blink",
    "blins", "bliny", "blips", "bliss", "blist", "blite", "blits", "blitz", "blive", "bloat", "blobs", "block", "blocs", "blogs", "bloke", "blond", "blood", "blook", "bloom", "bloop",
    "blore", "blots", "blown", "blows", "blowy", "blubs", "blude", "bluds", "bludy", "blued", "bluer", "blues", "bluet", "bluey", "bluff", "bluid", "blume", "blunk", "blunt", "blurb",
    "blurs", "blurt", "blush", "blype", "boabs", "boaks", "board", "boars", "boart", "boast", "boats", "bobac", "bobak", "bobas", "bobby", "bobol", "bobos", "bocca", "bocce", "bocci",
    "boche", "bocks", "boded", "bodes", "bodge", "bodhi", "bodle", "boeps", "boets", "boeuf", "boffo", "boffs", "bogan", "bogey", "boggy", "bogie", "bogle", "bogue", "bogus", "bohea",
    "bohos", "boils", "boing", "boink", "boite", "boked", "bokeh", "bokes", "bokos", "bolar", "bolas", "bolds", "boles", "bolix", "bolls", "bolos", "bolts", "bolus", "bomas", "bombe",
    "bombo", "bombs", "bonce", "bonds", "boned", "boner", "bones", "boney", "bongo", "bongs", "bonie", "bonks", "bonne", "bonny", "bonus", "bonza", "bonze", "booai", "booay", "boobs",
    "booby", "boody", "booed", "boofy", "boogy", "boohs", "books", "booky", "bools", "booms", "boomy", "boong", "boons", "boord", "boors", "boose", "boost", "booth", "boots", "booty",
    "booze", "boozy", "boppy", "borak", "boral", "boras", "borax", "borde", "bords", "bored", "boree", "borel", "borer", "bores", "borgo", "boric", "borks", "borms", "borna", "borne",
    "boron", "borts", "borty", "bortz", "bosie", "bosks", "bosky", "bosom", "boson", "bossy", "bosun", "botas", "botch", "botel", "botes", "bothy", "botte", "botts", "botty", "bouge",
    "bough", "bouks", "boule", "boult", "bound", "bouns", "bourd", "bourg", "bourn", "bouse", "bousy", "bouts", "bovid", "bowat", "bowed", "bowel", "bower", "bowes", "bowet", "bowie",
    "bowls", "bowne", "bowrs", "bowse", "boxed", "boxen", "boxer", "boxes", "boxla", "boxty", "boyar", "boyau", "boyed", "boyfs", "boygs", "boyla", "boyos", "boysy", "bozos", "braai",
    "brace", "brach", "brack", "bract", "brads", "braes", "brags", "braid", "brail", "brain", "brake", "braks", "braky", "brame", "brand", "brane", "brank", "brans", "brant", "brash",
    "brass", "brast", "brats", "brava", "brave", "bravi", "bravo", "brawl", "brawn", "braws", "braxy", "brays", "braza", "braze", "bread", "break", "bream", "brede", "breds", "breed",
    "breem", "breer", "brees", "breid", "breis", "breme", "brens", "brent", "brere", "brers", "breve", "brews", "breys", "briar", "bribe", "brick", "bride", "brief", "brier", "bries",
    "brigs", "briki", "briks", "brill", "brims", "brine", "bring", "brink", "brins", "briny", "brios", "brise", "brisk", "briss", "brith", "brits", "britt", "brize", "broad", "broch",
    "brock", "brods", "brogh", "brogs", "broil", "broke", "brome", "bromo", "bronc", "brond", "brood", "brook", "brool", "broom", "broos", "brose", "brosy", "broth", "brown", "brows",
    "brugh", "bruin", "bruit", "brule", "brume", "brung", "brunt", "brush", "brusk", "brust", "brute", "bruts", "buats", "buaze", "bubal", "bubas", "bubba", "bubbe", "bubby", "bubus",
    "buchu", "bucko", "bucks", "bucku", "budas", "buddy", "budge", "budis", "budos", "buffa", "buffe", "buffi", "buffo", "buffs", "buffy", "bufos", "bufty", "buggy", "bugle", "buhls",
    "buhrs", "buiks", "build", "built", "buist", "bukes", "bulbs", "bulge", "bulgy", "bulks", "bulky", "bulla", "bulls", "bully", "bulse", "bumbo", "bumfs", "bumph", "bumps", "bumpy",
    "bunas", "bunce", "bunch", "bunco", "bunde", "bundh", "bunds", "bundt", "bundu", "bundy", "bungs", "bungy", "bunia", "bunje", "bunjy", "bunko", "bunks", "bunns", "bunny", "bunts",
    "bunty", "bunya", "buoys", "buppy", "buran", "buras", "burbs", "burds", "buret", "burfi", "burgh", "burgs", "burin", "burka", "burke", "burks", "burls", "burly", "burns", "burnt",
    "buroo", "burps", "burqa", "burro", "burrs", "burry", "bursa", "burse", "burst", "busby", "bused", "buses", "bushy", "busks", "busky", "bussu", "busti", "busts", "busty", "butch",
    "buteo", "butes", "butle", "butoh", "butte", "butts", "butty", "butut", "butyl", "buxom", "buyer", "buzzy", "bwana", "bwazi", "byded", "bydes", "byked", "bykes", "bylaw", "byres",
    "byrls", "byssi", "bytes", "byway", "caaed", "cabal", "cabas", "cabby", "caber", "cabin", "cable", "cabob", "caboc", "cabre", "cacao", "cacas", "cache", "cacks", "cacky", "cacti",
    "caddy", "cadee", "cades", "cadet", "cadge", "cadgy", "cadie", "cadis", "cadre", "caeca", "caese", "cafes", "caffs", "caged", "cager", "cages", "cagey", "cagot", "cahow", "caids",
    "cains", "caird", "cairn", "cajon", "cajun", "caked", "cakes", "cakey", "calfs", "calid", "calif", "calix", "calks", "calla", "calls", "calms", "calmy", "calos", "calpa", "calps",
    "calve", "calyx", "caman", "camas", "camel", "cameo", "cames", "camis", "camos", "campi", "campo", "camps", "campy", "camus", "canal", "candy", "caned", "caneh", "caner", "canes",
    "cangs", "canid", "canna", "canns", "canny", "canoe", "canon", "canso", "canst", "canto", "cants", "canty", "capas", "caped", "caper", "capes", "capex", "caphs", "capiz", "caple",
    "capon", "capos", "capot", "capri", "capul", "caput", "carap", "carat", "carbo", "carbs", "carby", "cardi", "cards", "cardy", "cared", "carer", "cares", "caret", "carex", "cargo",
    "carks", "carle", "carls", "carns", "carny", "carob", "carol", "carom", "caron", "carpi", "carps", "carrs", "carry", "carse", "carta", "carte", "carts", "carve", "carvy", "casas",
    "casco", "cased", "cases", "casks", "casky", "caste", "casts", "casus", "catch", "cater", "cates", "catty", "cauda", "cauks", "cauld", "caulk", "cauls", "caums", "caups", "cauri",
    "causa", "cause", "cavas", "caved", "cavel", "caver", "caves", "cavie", "cavil", "cawed", "cawks", "caxon", "cease", "ceaze", "cebid", "cecal", "cecum", "cedar", "ceded", "ceder",
    "cedes", "cedis", "ceiba", "ceili", "ceils", "celeb", "cella", "celli", "cello", "cells", "celom", "celts", "cense", "cento", "cents", "centu", "ceorl", "cepes", "cerci", "cered",
    "ceres", "cerge", "ceria", "ceric", "cerne", "ceroc", "ceros", "certs", "certy", "cesse", "cesta", "cesti", "cetes", "cetyl", "cezve", "chace", "chack", "chaco", "chado", "chads",
    "chafe", "chaff", "chaft", "chain", "chair", "chais", "chalk", "chals", "champ", "chams", "chana", "chang", "chank", "chant", "chaos", "chape", "chaps", "chapt", "chara", "chard",
    "chare", "chark", "charm", "charr", "chars", "chart", "chary", "chase", "chasm", "chats", "chave", "chavs", "chawk", "chaws", "chaya", "chays", "cheap", "cheat", "check", "cheek",
    "cheep", "cheer", "chefs", "cheka", "chela", "chelp", "chemo", "chems", "chere", "chert", "chess", "chest", "cheth", "chevy", "chews", "chewy", "chiao", "chias", "chibs", "chica",
    "chich", "chick", "chico", "chics", "chide", "chief", "chiel", "chiks", "child", "chile", "chili", "chill", "chimb", "chime", "chimo", "chimp", "china", "chine", "ching", "chino",
    "chins", "chips", "chirk", "chirl", "chirm", "chiro", "chirp", "chirr", "chirt", "chiru", "chits", "chive", "chivs", "chivy", "chizz", "chock", "choco", "chocs", "chode", "chogs",
    "choil", "choir", "choke", "choko", "choky", "chola", "choli", "cholo", "chomp", "chons", "choof", "chook", "choom", "choon", "chops", "chord", "chore", "chose", "chota", "chott",
    "chout", "choux", "chowk", "chows", "chubs", "chuck", "chufa", "chuff", "chugs", "chump", "chums", "chunk", "churl", "churn", "churr", "chuse", "chute", "chuts", "chyle", "chyme",
    "chynd", "cibol", "cided", "cider", "cides", "ciels", "cigar", "ciggy", "cilia", "cills", "cimar", "cimex", "cinch", "cinct", "cines", "cinqs", "cions", "cippi", "circa", "circs",
    "cires", "cirls", "cirri", "cisco", "cissy", "cists", "cital", "cited", "citer", "cites", "cives", "civet", "civic", "civie", "civil", "civvy", "clach", "clack", "clade", "clads",
    "claes", "clags", "claim", "clame", "clamp", "clams", "clang", "clank", "clans", "claps", "clapt", "claro", "clart", "clary", "clash", "clasp", "class", "clast", "clats", "claut",
    "clave", "clavi", "claws", "clays", "clean", "clear", "cleat", "cleck", "cleek", "cleep", "clefs", "cleft", "clegs", "cleik", "clems", "clepe", "clept", "clerk", "cleve", "clews",
    "click", "clied", "clies", "cliff", "clift", "climb", "clime", "cline", "cling", "clink", "clint", "clipe", "clips", "clipt", "clits", "cloak", "cloam", "clock", "clods", "cloff",
    "clogs", "cloke", "clomb", "clomp", "clone", "clonk", "clons", "cloop", "cloot", "clops", "close", "clote", "cloth", "clots", "cloud", "clour", "clous", "clout", "clove", "clown",
    "clows", "cloye", "cloys", "cloze", "clubs", "cluck", "clued", "clues", "cluey", "clump", "clung", "clunk", "clype", "cnida", "coach", "coact", "coady", "coala", "coals", "coaly",
    "coapt", "coarb", "coast", "coate", "coati", "coats", "cobbs", "cobby", "cobia", "coble", "cobra", "cobza", "cocas", "cocci", "cocco", "cocks", "cocky", "cocoa", "cocos", "codas",
    "codec", "coded", "coden", "coder", "codes", "codex", "codon", "coeds", "coffs", "cogie", "cogon", "cogue", "cohab", "cohen", "cohoe", "cohog", "cohos", "coifs", "coign", "coils",
    "coins", "coirs", "coits", "coked", "cokes", "colas", "colby", "colds", "coled", "coles", "coley", "colic", "colin", "colls", "colly", "colog", "colon", "color", "colts", "colza",
    "comae", "comal", "comas", "combe", "combi", "combo", "combs", "comby", "comer", "comes", "comet", "comfy", "comic", "comix", "comma", "commo", "comms", "commy", "compo", "comps",
    "compt", "comte", "comus", "conch", "condo", "coned", "cones", "coney", "confs", "conga", "conge", "congo", "conia", "conic", "conin", "conks", "conky", "conne", "conns", "conte",
    "conto", "conus", "convo", "cooch", "cooed", "cooee", "cooer", "cooey", "coofs", "cooks", "cooky", "cools", "cooly", "coomb", "cooms", "coomy", "coops", "coopt", "coost", "coots",
    "cooze", "copal", "copay", "coped", "copen", "coper", "copes", "coppy", "copra", "copse", "copsy", "coqui", "coral", "coram", "corbe", "corby", "cords", "cored", "corer", "cores",
    "corey", "corgi", "coria", "corks", "corky", "corms", "corni", "corno", "corns", "cornu", "corny", "corps", "corse", "corso", "cosec", "cosed", "coses", "coset", "cosey", "cosie",
    "costa", "coste", "costs", "cotan", "coted", "cotes", "coths", "cotta", "cotts", "couch", "coude", "cough", "could", "count", "coupe", "coups", "courb", "courd", "coure", "cours",
    "court", "couta", "couth", "coved", "coven", "cover", "coves", "covet", "covey", "covin", "cowal", "cowan", "cowed", "cower", "cowks", "cowls", "cowps", "cowry", "coxae", "coxal",
    "coxed", "coxes", "coxib", "coyau", "coyed", "coyer", "coyly", "coypu", "cozed", "cozen", "cozes", "cozey", "cozie", "craal", "crabs", "crack", "craft", "crags", "craic", "craig",
    "crake", "crame", "cramp", "crams", "crane", "crank", "crans", "crape", "craps", "crapy", "crare", "crash", "crass", "crate", "crave", "crawl", "craws", "crays", "craze", "crazy",
    "creak", "cream", "credo", "creds", "creed", "creek", "creel", "creep", "crees", "creme", "crems", "crena", "crepe", "creps", "crept", "crepy", "cress", "crest", "crewe", "crews",
    "crias", "cribs", "crick", "cried", "crier", "cries", "crime", "crimp", "crims", "crine", "crios", "cripe", "crips", "crise", "crisp", "crith", "crits", "croak", "croci", "crock",
    "crocs", "croft", "crogs", "cromb", "crome", "crone", "cronk", "crons", "crony", "crook", "crool", "croon", "crops", "crore", "cross", "crost", "croup", "crout", "crowd", "crown",
    "crows", "croze", "cruck", "crude", "crudo", "cruds", "crudy", "cruel", "crues", "cruet", "cruft", "crumb", "crump", "crunk", "cruor", "crura", "cruse", "crush", "crust", "crusy",
    "cruve", "crwth", "cryer", "crypt", "ctene", "cubby", "cubeb", "cubed", "cuber", "cubes", "cubic", "cubit", "cuddy", "cuffo", "cuffs", "cuifs", "cuing", "cuish", "cuits", "cukes",
    "culch", "culet", "culex", "culls", "cully", "culms", "culpa", "culti", "cults", "culty", "cumec", "cumin", "cundy", "cunei", "cunit", "cunts", "cupel", "cupid", "cuppa", "cuppy",
    "curat", "curbs", "curch", "curds", "curdy", "cured", "curer", "cures", "curet", "curfs", "curia", "curie", "curio", "curli", "curls", "curly", "curns", "curny", "currs", "curry",
    "curse", "cursi", "curst", "curve", "curvy", "cusec", "cushy", "cusks", "cusps", "cuspy", "cusso", "cusum", "cutch", "cuter", "cutes", "cutey", "cutie", "cutin", "cutis", "cutto",
    "cutty", "cutup", "cuvee", "cuzes", "cwtch", "cyano", "cyans", "cyber", "cycad", "cycas", "cycle", "cyclo", "cyder", "cylix", "cymae", "cymar", "cymas", "cymes", "cymol", "cynic",
    "cysts", "cytes", "cyton", "czars", "daals", "dabba", "daces", "dacha", "dacks", "dadah", "dadas", "daddy", "dados", "daffs", "daffy", "dagga", "daggy", "dagos", "dahls", "daiko",
    "daily", "daine", "daint", "dairy", "daisy", "daker", "daled", "dales", "dalis", "dalle", "dally", "dalts", "daman", "damar", "dames", "damme", "damns", "damps", "dampy", "dance",
    "dancy", "dandy", "dangs", "danio", "danks", "danny", "dants", "daraf", "darbs", "darcy", "dared", "darer", "dares", "darga", "dargs", "daric", "daris", "darks", "darns", "darre",
    "darts", "darzi", "dashi", "dashy", "datal", "dated", "dater", "dates", "datos", "datto", "datum", "daube", "daubs", "dauby", "dauds", "dault", "daunt", "daurs", "dauts", "daven",
    "davit", "dawah", "dawds", "dawed", "dawen", "dawks", "dawns", "dawts", "dayan", "daych", "daynt", "dazed", "dazer", "dazes", "deads", "deair", "deals", "dealt", "deans", "deare",
    "dearn", "dears", "deary", "deash", "death", "deave", "deaws", "deawy", "debag", "debar", "debby", "debel", "debes", "debit", "debts", "debud", "debug", "debur", "debus", "debut",
    "debye", "decad", "decaf", "decal", "decan", "decay", "decko", "decks", "decor", "decos", "decoy", "decry", "dedal", "deeds", "deedy", "deely", "deems", "deens", "deeps", "deere",
    "deers", "deets", "deeve", "deevs", "defat", "defer", "deffo", "defis", "defog", "degas", "degum", "degus", "deice", "deids", "deify", "deign", "deils", "deism", "deist", "deity",
    "deked", "dekes", "dekko", "delay", "deled", "deles", "delfs", "delft", "delis", "dells", "delly", "delos", "delph", "delta", "delts", "delve", "deman", "demes", "demic", "demit",
    "demob", "demoi", "demon", "demos", "dempt", "demur", "denar", "denay", "dench", "denes", "denet", "denim", "denis", "dense", "dents", "deoxy", "depot", "depth", "derat", "deray",
    "derby", "dered", "deres", "derig", "derma", "derms", "derns", "derny", "deros", "derro", "derry", "derth", "dervs", "desex", "deshi", "desis", "desks", "desse", "deter", "detox",
    "deuce", "devas", "devel", "devil", "devis", "devon", "devos", "devot", "dewan", "dewar", "dewax", "dewed", "dexes", "dexie", "dhaba", "dhaks", "dhals", "dhikr", "dhobi", "dhole",
    "dholl", "dhols", "dhoti", "dhows", "dhuti", "diact", "dials", "diane", "diary", "diazo", "dibbs", "diced", "dicer", "dices", "dicey", "dicht", "dicks", "dicky", "dicot", "dicta",
    "dicts", "dicty", "diddy", "didie", "didos", "didst", "diebs", "diels", "diene", "diets", "diffs", "dight", "digit", "dikas", "diked", "diker", "dikes", "dikey", "dildo", "dilli",
    "dills", "dilly", "dimbo", "dimer", "dimes", "dimly", "dimps", "dinar", "dined", "diner", "dines", "dinge", "dingo", "dings", "dingy", "dinic", "dinks", "dinky", "dinna", "dinos",
    "dints", "diode", "diols", "diota", "dippy", "dipso", "diram", "direr", "dirge", "dirke", "dirks", "dirls", "dirts", "dirty", "disas", "disci", "disco", "discs", "dishy", "disks",
    "disme", "dital", "ditas", "ditch", "dited", "dites", "ditsy", "ditto", "ditts", "ditty", "ditzy", "divan", "divas", "dived", "diver", "dives", "divis", "divna", "divos", "divot",
    "divvy", "diwan", "dixie", "dixit", "diyas", "dizen", "dizzy", "djinn", "djins", "doabs", "doats", "dobby", "dobes", "dobie", "dobla", "dobra", "dobro", "docht", "docks", "docos",
    "docus", "doddy", "dodge", "dodgy", "dodos", "doeks", "doers", "doest", "doeth", "doffs", "dogan", "doges", "dogey", "doggo", "doggy", "dogie", "dogma", "dohyo", "doilt", "doily",
    "doing", "doits", "dojos", "dolce", "dolci", "doled", "doles", "dolia", "dolls", "dolly", "dolma", "dolor", "dolos", "dolts", "domal", "domed", "domes", "domic", "donah", "donas",
    "donee", "doner", "donga", "dongs", "donko", "donna", "donne", "donny", "donor", "donsy", "donut", "doobs", "dooce", "doody", "dooks", "doole", "dools", "dooly", "dooms", "doomy",
    "doona", "doorn", "doors", "doozy", "dopas", "doped", "doper", "dopes", "dopey", "dorad", "dorba", "dorbs", "doree", "dores", "doric", "doris", "dorks", "dorky", "dorms", "dormy",
    "dorps", "dorrs", "dorsa", "dorse", "dorts", "dorty", "dosai", "dosas", "dosed", "doseh", "doser", "doses", "dosha", "dotal", "doted", "doter", "dotes", "dotty", "douar", "doubt",
    "douce", "doucs", "dough", "douks", "doula", "douma", "doums", "doups", "doura", "douse", "douts", "doved", "doven", "dover", "doves", "dovie", "dowar", "dowds", "dowdy", "dowed",
    "dowel", "dower", "dowie", "dowle", "dowls", "dowly", "downa", "downs", "downy", "dowps", "dowry", "dowse", "dowts", "doxed", "doxes", "doxie", "doyen", "doyly", "dozed", "dozen",
    "dozer", "dozes", "drabs", "drack", "draco", "draff", "draft", "drags", "drail", "drain", "drake", "drama", "drams", "drank", "drant", "drape", "draps", "drats", "drave", "drawl",
    "drawn", "draws", "drays", "dread", "dream", "drear", "dreck", "dreed", "dreer", "drees", "dregs", "dreks", "drent", "drere", "dress", "drest", "dreys", "dribs", "drice", "dried",
    "drier", "dries", "drift", "drill", "drily", "drink", "drips", "dript", "drive", "droid", "droil", "droit", "droke", "drole", "droll", "drome", "drone", "drony", "droob", "droog",
    "drook", "drool", "droop", "drops", "dropt", "dross", "drouk", "drove", "drown", "drows", "drubs", "drugs", "druid", "drums", "drunk", "drupe", "druse", "drusy", "druxy", "dryad",
    "dryas", "dryer", "dryly", "dsobo", "dsomo", "duads", "duals", "duans", "duars", "dubbo", "ducal", "ducat", "duces", "duchy", "ducks", "ducky", "ducts", "duddy", "duded", "dudes",
    "duels", "duets", "duett", "duffs", "dufus", "duing", "duits", "dukas", "duked", "dukes", "dukka", "dulce", "dules", "dulia", "dulls", "dully", "dulse", "dumas", "dumbo", "dumbs",
    "dumka", "dumky", "dummy", "dumps", "dumpy", "dunam", "dunce", "dunch", "dunes", "dungs", "dungy", "dunks", "dunno", "dunny", "dunsh", "dunts", "duomi", "duomo", "duped", "duper",
    "dupes", "duple", "duply", "duppy", "dural", "duras", "dured", "dures", "durgy", "durns", "duroc", "duros", "duroy", "durra", "durrs", "durry", "durst", "durum", "durzi", "dusks",
    "dusky", "dusts", "dusty", "dutch", "duvet", "duxes", "dwaal", "dwale", "dwalm", "dwams", "dwang", "dwarf", "dwaum", "dweeb", "dwell", "dwelt", "dwile", "dwine", "dyads", "dyers",
    "dying", "dykon", "dynel", "dynes", "dzhos", "eager", "eagle", "eagre", "ealed", "eales", "eaned", "eards", "eared", "earls", "early", "earns", "earnt", "earst", "earth", "eased",
    "easel", "easer", "eases", "easle", "easts", "eaten", "eater", "eathe", "eaved", "eaves", "ebbed", "ebbet", "ebons", "ebony", "ebook", "ecads", "eched", "eches", "echos", "eclat",
    "ecrus", "edema", "edged", "edger", "edges", "edict", "edify", "edile", "edits", "educe", "educt", "eejit", "eensy", "eerie", "eeven", "eevns", "effed", "egads", "egers", "egest",
    "eggar", "egged", "egger", "egmas", "egret", "ehing", "eider", "eidos", "eight", "eigne", "eiked", "eikon", "eilds", "eisel", "eject", "ejido", "eking", "ekkas", "elain", "eland",
    "elans", "elate", "elbow", "elchi", "elder", "eldin", "elect", "elegy", "elemi", "elfed", "elfin", "eliad", "elide", "elint", "elite", "elmen", "eloge", "elogy", "eloin", "elope",
    "elops", "elpee", "elsin", "elude", "elute", "elvan", "elven", "elver", "elves", "emacs", "email", "embar", "embay", "embed", "ember", "embog", "embow", "embox", "embus", "emcee",
    "emeer", "emend", "emerg", "emery", "emeus", "emics", "emirs", "emits", "emmas", "emmer", "emmet", "emmew", "emmys", "emoji", "emong", "emote", "emove", "empts", "empty", "emule",
    "emure", "emyde", "emyds", "enact", "enarm", "enate", "ended", "ender", "endew", "endow", "endue", "enema", "enemy", "enews", "enfix", "eniac", "enjoy", "enlit", "enmew", "ennog",
    "ennui", "enoki", "enols", "enorm", "enows", "enrol", "ensew", "ensky", "ensue", "enter", "entia", "entry", "enure", "enurn", "envoi", "envoy", "enzym", "eorls", "eosin", "epact",
    "epees", "ephah", "ephas", "ephod", "ephor", "epics", "epoch", "epode", "epopt", "epoxy", "epris", "equal", "eques", "equid", "equip", "erase", "erbia", "erect", "erevs", "ergon",
    "ergos", "ergot", "erhus", "erica", "erick", "erics", "ering", "erned", "ernes", "erode", "erose", "erred", "error", "erses", "eruct", "erugo", "erupt", "eruvs", "erven", "ervil",
    "escar", "escot", "esile", "eskar", "esker", "esnes", "essay", "esses", "ester", "estoc", "estop", "estro", "etage", "etape", "etats", "etens", "ethal", "ether", "ethic", "ethne",
    "ethos", "ethyl", "etics", "etnas", "ettin", "ettle", "etude", "etuis", "etwee", "etyma", "eughs", "euked", "eupad", "euros", "eusol", "evade", "evens", "event", "evert", "every",
    "evets", "evhoe", "evict", "evils", "evite", "evohe", "evoke", "ewers", "ewest", "ewhow", "ewked", "exact", "exalt", "exams", "excel", "exeat", "execs", "exeem", "exeme", "exert",
    "exfil", "exies", "exile", "exine", "exing", "exist", "exits", "exode", "exome", "exons", "expat", "expel", "expos", "extol", "extra", "exude", "exuls", "exult", "exurb", "eyass",
    "eyers", "eying", "eyots", "eyras", "eyres", "eyrie", "eyrir", "ezine", "fabby", "fable", "faced", "facer", "faces", "facet", "facia", "facta", "facts", "faddy", "faded", "fader",
    "fades", "fadge", "fados", "faena", "faery", "faffs", "faffy", "fagin", "faiks", "fails", "faine", "fains", "faint", "fairs", "fairy", "faith", "faked", "faker", "fakes", "fakey",
    "fakie", "fakir", "falaj", "falls", "false", "famed", "fames", "fanal", "fancy", "fands", "fanes", "fanga", "fango", "fangs", "fanks", "fanny", "fanon", "fanos", "fanum", "faqir",
    "farad", "farce", "farci", "farcy", "fards", "fared", "farer", "fares", "farle", "farls", "farms", "faros", "farro", "farse", "farts", "fasci", "fasti", "fasts", "fatal", "fated",
    "fates", "fatly", "fatso", "fatty", "fatwa", "faugh", "fauld", "fault", "fauna", "fauns", "faurd", "fauts", "fauve", "favas", "favel", "faver", "faves", "favor", "favus", "fawns",
    "fawny", "faxed", "faxes", "fayed", "fayer", "fayne", "fayre", "fazed", "fazes", "feals", "feare", "fears", "feart", "fease", "feast", "feats", "feaze", "fecal", "feces", "fecht",
    "fecit", "fecks", "fedex", "feebs", "feeds", "feels", "feens", "feers", "feese", "feeze", "fehme", "feign", "feint", "feist", "felch", "felid", "fella", "fells", "felly", "felon",
    "felts", "felty", "femal", "femes", "femme", "femmy", "femur", "fence", "fends", "fendy", "fenis", "fenks", "fenny", "fents", "feods", "feoff", "feral", "ferer", "feres", "feria",
    "ferly", "fermi", "ferms", "ferns", "ferny", "ferry", "fesse", "festa", "fests", "festy", "fetal", "fetas", "fetch", "feted", "fetes", "fetid", "fetor", "fetta", "fetts", "fetus",
    "fetwa", "feuar", "feuds", "feued", "fever", "fewer", "feyed", "feyer", "feyly", "fezes", "fezzy", "fiars", "fiats", "fiber", "fibro", "fices", "fiche", "fichu", "ficin", "ficos",
    "ficus", "fides", "fidge", "fidos", "fiefs", "field", "fiend", "fient", "fiere", "fiers", "fiery", "fiest", "fifed", "fifer", "fifes", "fifis", "fifth", "fifty", "figgy", "fight",
    "figos", "fiked", "fikes", "filar", "filch", "filed", "filer", "files", "filet", "filii", "filks", "fille", "fillo", "fills", "filly", "filmi", "films", "filmy", "filos", "filth",
    "filum", "final", "finca", "finch", "finds", "fined", "finer", "fines", "finis", "finks", "finny", "finos", "fiord", "fiqhs", "fique", "fired", "firer", "fires", "firie", "firks",
    "firms", "firns", "firry", "first", "firth", "fiscs", "fishy", "fisks", "fists", "fisty", "fitch", "fitly", "fitna", "fitte", "fitts", "fiver", "fives", "fixed", "fixer", "fixes",
    "fixit", "fizzy", "fjeld", "fjord", "flabs", "flack", "flaff", "flags", "flail", "flair", "flake", "flaks", "flaky", "flame", "flamm", "flams", "flamy", "flane", "flank", "flans",
    "flaps", "flare", "flary", "flash", "flask", "flats", "flava", "flawn", "flaws", "flawy", "flaxy", "flays", "fleam", "fleas", "fleck", "fleek", "fleer", "flees", "fleet", "flegs",
    "fleme", "flesh", "fleur", "flews", "flexi", "flexo", "fleys", "flick", "flics", "flied", "flier", "flies", "flimp", "flims", "fling", "flint", "flips", "flirs", "flirt", "flisk",
    "flite", "flits", "flitt", "float", "flobs", "flock", "flocs", "floes", "flogs", "flong", "flood", "floor", "flops", "flora", "flors", "flory", "flosh", "floss", "flota", "flote",
    "flour", "flout", "flown", "flows", "flubs", "flued", "flues", "fluey", "fluff", "fluid", "fluke", "fluky", "flume", "flump", "flung", "flunk", "fluor", "flurr", "flush", "flute",
    "fluty", "fluyt", "flyby", "flyer", "flype", "flyte", "foals", "foams", "foamy", "focal", "focus", "foehn", "fogey", "foggy", "fogie", "fogle", "fogou", "fohns", "foids", "foils",
    "foins", "foist", "folds", "foley", "folia", "folic", "folie", "folio", "folks", "folky", "folly", "fomes", "fonda", "fonds", "fondu", "fones", "fonly", "fonts", "foods", "foody",
    "fools", "foots", "footy", "foram", "foray", "forbs", "forby", "force", "fordo", "fords", "forel", "fores", "forex", "forge", "forgo", "forks", "forky", "forme", "forms", "forte",
    "forth", "forts", "forty", "forum", "forza", "forze", "fossa", "fosse", "fouat", "fouds", "fouer", "fouet", "foule", "fouls", "found", "fount", "fours", "fouth", "fovea", "fowls",
    "fowth", "foxed", "foxes", "foxie", "foyer", "foyle", "foyne", "frabs", "frack", "fract", "frags", "frail", "fraim", "frame", "franc", "frank", "frape", "fraps", "frass", "frate",
    "frati", "frats", "fraud", "fraus", "frays", "freak", "freed", "freer", "frees", "freet", "freit", "fremd", "frena", "freon", "frere", "fresh", "frets", "friar", "fribs", "fried",
    "frier", "fries", "frigs", "frill", "frise", "frisk", "frist", "frith", "frits", "fritt", "fritz", "frize", "frizz", "frock", "froes", "frogs", "frond", "frons", "front", "frore",
    "frorn", "frory", "frosh", "frost", "froth", "frown", "frows", "frowy", "froze", "frugs", "fruit", "frump", "frush", "frust", "fryer", "fubar", "fubby", "fubsy", "fucks", "fucus",
    "fuddy", "fudge", "fudgy", "fuels", "fuero", "fuffs", "fuffy", "fugal", "fuggy", "fugie", "fugio", "fugle", "fugly", "fugue", "fugus", "fujis", "fulls", "fully", "fumed", "fumer",
    "fumes", "fumet", "fundi", "funds", "fundy", "fungi", "fungo", "fungs", "funks", "funky", "funny", "fural", "furan", "furca", "furls", "furol", "furor", "furrs", "furry", "furth",
    "furze", "furzy", "fused", "fusee", "fusel", "fuses", "fusil", "fusks", "fussy", "fusts", "fusty", "futon", "fuzed", "fuzee", "fuzes", "fuzil", "fuzzy", "fyces", "fyked", "fykes",
    "fyles", "fyrds", "fytte", "gabba", "gabby", "gable", "gaddi", "gades", "gadge", "gadid", "gadis", "gadje", "gadjo", "gadso", "gaffe", "gaffs", "gaged", "gager", "gages", "gaids",
    "gaily", "gains", "gairs", "gaita", "gaits", "gaitt", "gajos", "galah", "galas", "galax", "galea", "galed", "gales", "galls", "gally", "galop", "galut", "galvo", "gamas", "gamay",
    "gamba", "gambe", "gambo", "gambs", "gamed", "gamer", "games", "gamey", "gamic", "gamin", "gamma", "gamme", "gammy", "gamps", "gamut", "ganch", "gandy", "ganef", "ganev", "gangs",
    "ganja", "ganof", "gants", "gaols", "gaped", "gaper", "gapes", "gapos", "gappy", "garbe", "garbo", "garbs", "garda", "gares", "garis", "garms", "garni", "garre", "garth", "garum",
    "gases", "gasps", "gaspy", "gassy", "gasts", "gatch", "gated", "gater", "gates", "gaths", "gator", "gauch", "gaucy", "gauds", "gaudy", "gauge", "gauje", "gault", "gaums", "gaumy",
    "gaunt", "gaups", "gaurs", "gauss", "gauze", "gauzy", "gavel", "gavot", "gawcy", "gawds", "gawks", "gawky", "gawps", "gawsy", "gayal", "gayer", "gayly", "gazal", "gazar", "gazed",
    "gazer", "gazes", "gazon", "gazoo", "geals", "geans", "geare", "gears", "geats", "gebur", "gecko", "gecks", "geeks", "geeky", "geeps", "geese", "geest", "geist", "geits", "gelds",
    "gelee", "gelid", "gelly", "gelts", "gemel", "gemma", "gemmy", "gemot", "genal", "genas", "genes", "genet", "genic", "genie", "genii", "genip", "genny", "genoa", "genom", "genre",
    "genro", "gents", "genty", "genua", "genus", "geode", "geoid", "gerah", "gerbe", "geres", "gerle", "germs", "germy", "gerne", "gesse", "gesso", "geste", "gests", "getas", "getup",
    "geums", "geyan", "geyer", "ghast", "ghats", "ghaut", "ghazi", "ghees", "ghest", "ghost", "ghoul", "ghyll", "giant", "gibed", "gibel", "giber", "gibes", "gibli", "gibus", "giddy",
    "gifts", "gigas", "gighe", "gigot", "gigue", "gilas", "gilds", "gilet", "gills", "gilly", "gilpy", "gilts", "gimel", "gimme", "gimps", "gimpy", "ginch", "ginge", "gings", "ginks",
    "ginny", "ginzo", "gipon", "gippo", "gippy", "gipsy", "girds", "girls", "girly", "girns", "giron", "giros", "girrs", "girsh", "girth", "girts", "gismo", "gisms", "gists", "gitch",
    "gites", "giust", "gived", "given", "giver", "gives", "gizmo", "glace", "glade", "glads", "glady", "glaik", "glair", "glams", "gland", "glans", "glare", "glary", "glass", "glaum",
    "glaur", "glaze", "glazy", "gleam", "glean", "gleba", "glebe", "gleby", "glede", "gleds", "gleed", "gleek", "glees", "gleet", "gleis", "glens", "glent", "gleys", "glial", "glias",
    "glibs", "glide", "gliff", "glift", "glike", "glime", "glims", "glint", "glisk", "glits", "glitz", "gloam", "gloat", "globe", "globi", "globs", "globy", "glode", "glogg", "gloms",
    "gloom", "gloop", "glops", "glory", "gloss", "glost", "glout", "glove", "glows", "gloze", "glued", "gluer", "glues", "gluey", "glugs", "glume", "glums", "gluon", "glute", "gluts",
    "glyph", "gnarl", "gnarr", "gnars", "gnash", "gnats", "gnawn", "gnaws", "gnome", "gnows", "goads", "goafs", "goals", "goary", "goats", "goaty", "goban", "gobar", "gobbi", "gobbo",
    "gobby", "gobis", "gobos", "godet", "godly", "godso", "goels", "goers", "goest", "goeth", "goety", "gofer", "goffs", "gogga", "gogos", "goier", "going", "gojis", "golds", "goldy",
    "golem", "goles", "golfs", "golly", "golpe", "golps", "gombo", "gomer", "gompa", "gonad", "gonch", "gonef", "goner", "gongs", "gonia", "gonif", "gonks", "gonna", "gonof", "gonys",
    "gonzo", "gooby", "goods", "goody", "gooey", "goofs", "goofy", "googs", "gooky", "goold", "gools", "gooly", "goons", "goony", "goops", "goopy", "goors", "goory", "goose", "goosy",
    "gopak", "gopik", "goral", "goras", "gored", "gores", "gorge", "goris", "gorms", "gormy", "gorps", "gorse", "gorsy", "gosht", "gosse", "gotch", "goths", "gothy", "gotta", "gouch",
    "gouge", "gouks", "goura", "gourd", "gouts", "gouty", "gowan", "gowds", "gowfs", "gowks", "gowls", "gowns", "goxes", "goyim", "goyle", "graal", "grabs", "grace", "grade", "grads",
    "graff", "graft", "grail", "grain", "graip", "grama", "grame", "gramp", "grams", "grana", "grand", "grans", "grant", "grape", "graph", "grapy", "grasp", "grass", "grate", "grave",
    "gravs", "gravy", "grays", "graze", "great", "grebe", "grebo", "grece", "greed", "greek", "green", "grees", "greet", "grege", "grego", "grein", "grens", "grese", "greve", "grews",
    "greys", "grice", "gride", "grids", "grief", "griff", "grift", "grigs", "grike", "grill", "grime", "grimy", "grind", "grins", "griot", "gripe", "grips", "gript", "gripy", "grise",
    "grist", "grisy", "grith", "grits", "grize", "groan", "groat", "grody", "grogs", "groin", "groks", "groma", "grone", "groof", "groom", "grope", "gross", "grosz", "grots", "grouf",
    "group", "grout", "grove", "grovy", "growl", "grown", "grows", "grrls", "grrrl", "grubs", "grued", "gruel", "grues", "grufe", "gruff", "grume", "grump", "grund", "grunt", "gryce",
    "gryde", "gryke", "grype", "grypt", "guaco", "guana", "guano", "guans", "guard", "guars", "guava", "gucks", "gucky", "gudes", "guess", "guest", "guffs", "gugas", "guide", "guids",
    "guild", "guile", "guilt", "guimp", "guiro", "guise", "gulag", "gular", "gulas", "gulch", "gules", "gulet", "gulfs", "gulfy", "gulls", "gully", "gulph", "gulps", "gulpy", "gumbo",
    "gumma", "gummi", "gummy", "gumps", "gundy", "gunge", "gungy", "gunks", "gunky", "gunny", "guppy", "guqin", "gurdy", "gurge", "gurls", "gurly", "gurns", "gurry", "gursh", "gurus",
    "gushy", "gusla", "gusle", "gusli", "gussy", "gusto", "gusts", "gusty", "gutsy", "gutta", "gutty", "guyed", "guyle", "guyot", "guyse", "gwine", "gyals", "gyans", "gybed", "gybes",
    "gyeld", "gymps", "gynae", "gynie", "gynny", "gynos", "gyoza", "gypos", "gyppo", "gyppy", "gypsy", "gyral", "gyred", "gyres", "gyron", "gyros", "gyrus", "gytes", "gyved", "gyves",
    "haafs", "haars", "habit", "hable", "habus", "hacek", "hacks", "hadal", "haded", "hades", "hadji", "hadst", "haems", "haets", "haffs", "hafiz", "hafts", "haggs", "hahas", "haick",
    "haika", "haiks", "haiku", "hails", "haily", "hains", "haint", "hairs", "hairy", "haith", "hajes", "hajis", "hajji", "hakam", "hakas", "hakea", "hakes", "hakim", "hakus", "halal",
    "haled", "haler", "hales", "halfa", "halfs", "halid", "hallo", "halls", "halma", "halms", "halon", "halos", "halse", "halts", "halva", "halve", "halwa", "hamal", "hamba", "hamed",
    "hames", "hammy", "hamza", "hanap", "hance", "hanch", "hands", "handy", "hangi", "hangs", "hanks", "hanky", "hansa", "hanse", "hants", "haole", "haoma", "hapax", "haply", "happi",
    "happy", "hapus", "haram", "hards", "hardy", "hared", "harem", "hares", "harim", "harks", "harls", "harms", "harns", "haros", "harps", "harpy", "harry", "harsh", "harts", "hashy",
    "hasks", "hasps", "hasta", "haste", "hasty", "hatch", "hated", "hater", "hates", "hatha", "hauds", "haufs", "haugh", "hauld", "haulm", "hauls", "hault", "hauns", "haunt", "hause",
    "haute", "haven", "haver", "haves", "havoc", "hawed", "hawks", "hawms", "hawse", "hayed", "hayer", "hayey", "hayle", "hazan", "hazed", "hazel", "hazer", "hazes", "heads", "heady",
    "heald", "heals", "heame", "heaps", "heapy", "heard", "heare", "hears", "heart", "heast", "heath", "heats", "heave", "heavy", "heben", "hebes", "hecht", "hecks", "heder", "hedge",
    "hedgy", "heeds", "heedy", "heels", "heeze", "hefte", "hefts", "hefty", "heids", "heigh", "heils", "heirs", "heist", "hejab", "hejra", "heled", "heles", "helio", "helix", "hello",
    "hells", "helms", "helos", "helot", "helps", "helve", "hemal", "hemes", "hemic", "hemin", "hemps", "hempy", "hence", "hench", "hends", "henge", "henna", "henny", "henry", "hents",
    "hepar", "herbs", "herby", "herds", "heres", "herls", "herma", "herms", "herns", "heron", "heros", "herry", "herse", "hertz", "herye", "hesps", "hests", "hetes", "heths", "heuch",
    "heugh", "hevea", "hewed", "hewer", "hewgh", "hexad", "hexed", "hexer", "hexes", "hexyl", "heyed", "hiant", "hicks", "hided", "hider", "hides", "hiems", "highs", "hight", "hijab",
    "hijra", "hiked", "hiker", "hikes", "hikoi", "hilar", "hilch", "hillo", "hills", "hilly", "hilts", "hilum", "hilus", "himbo", "hinau", "hinds", "hinge", "hings", "hinky", "hinny",
    "hints", "hiois", "hiply", "hippo", "hippy", "hired", "hiree", "hirer", "hires", "hissy", "hists", "hitch", "hithe", "hived", "hiver", "hives", "hizen", "hoaed", "hoagy", "hoard",
    "hoars", "hoary", "hoast", "hobby", "hobos", "hocks", "hocus", "hodad", "hodja", "hoers", "hogan", "hogen", "hoggs", "hoghs", "hohed", "hoick", "hoied", "hoiks", "hoing", "hoise",
    "hoist", "hokas", "hoked", "hokes", "hokey", "hokis", "hokku", "hokum", "holds", "holed", "holes", "holey", "holks", "holla", "hollo", "holly", "holme", "holms", "holon", "holos",
    "holts", "homas", "homed", "homer", "homes", "homey", "homie", "homme", "honan", "honda", "honds", "honed", "honer", "hones", "honey", "hongi", "hongs", "honks", "honky", "honor",
    "hooch", "hoods", "hoody", "hooey", "hoofs", "hooka", "hooks", "hooky", "hooly", "hoons", "hoops", "hoord", "hoors", "hoosh", "hoots", "hooty", "hoove", "hopak", "hoped", "hoper",
    "hopes", "hoppy", "horah", "horal", "horas", "horde", "horis", "horks", "horme", "horns", "horny", "horse", "horst", "horsy", "hosed", "hosel", "hosen", "hoser", "hoses", "hosey",
    "hosta", "hosts", "hotch", "hotel", "hoten", "hotly", "hotty", "houff", "houfs", "hough", "hound", "houri", "hours", "house", "houts", "hovea", "hoved", "hovel", "hoven", "hover",
    "hoves", "howbe", "howdy", "howes", "howff", "howfs", "howks", "howls", "howre", "howso", "hoxed", "hoxes", "hoyas", "hoyed", "hoyle", "hubby", "hucks", "hudna", "hudud", "huers",
    "huffs", "huffy", "huger", "huggy", "huhus", "huias", "hulas", "hules", "hulks", "hulky", "hullo", "hulls", "hully", "human", "humas", "humfs", "humic", "humid", "humor", "humph",
    "humps", "humpy", "humus", "hunch", "hunks", "hunky", "hunts", "hurds", "hurls", "hurly", "hurra", "hurry", "hurst", "hurts", "hushy", "husks", "husky", "husos", "hussy", "hutch",
    "hutia", "huzza", "huzzy", "hwyls", "hydra", "hydro", "hyena", "hyens", "hygge", "hying", "hykes", "hylas", "hyleg", "hyles", "hylic", "hymen", "hymns", "hynde", "hyoid", "hyped",
    "hyper", "hypes", "hypha", "hyphy", "hypos", "hyrax", "hyson", "hythe", "iambi", "iambs", "ibrik", "icers", "iched", "iches", "ichor", "icier", "icily", "icing", "icker", "ickle",
    "icons", "ictal", "ictic", "ictus", "idant", "ideal", "ideas", "idees", "ident", "idiom", "idiot", "idled", "idler", "idles", "idola", "idols", "idyll", "idyls", "iftar", "igapo",
    "igged", "igloo", "iglus", "ihram", "ikans", "ikats", "ikons", "ileac", "ileal", "ileum", "ileus", "iliac", "iliad", "ilial", "ilium", "iller", "illth", "image", "imago", "imams",
    "imari", "imaum", "imbar", "imbed", "imbue", "imide", "imido", "imids", "imine", "imino", "immew", "immit", "immix", "imped", "impel", "impis", "imply", "impot", "impro", "imshi",
    "imshy", "inane", "inapt", "inarm", "inbox", "inbye", "incel", "incle", "incog", "incur", "incus", "incut", "indew", "index", "india", "indie", "indol", "indow", "indri", "indue",
    "inept", "inerm", "inert", "infer", "infix", "infos", "infra", "ingan", "ingle", "ingot", "inion", "inked", "inker", "inkle", "inlay", "inlet", "inned", "inner", "innit", "inorb",
    "input", "inrun", "inset", "inspo", "intel", "inter", "intil", "intis", "intra", "intro", "inula", "inure", "inurn", "inust", "invar", "inwit", "iodic", "iodid", "iodin", "ionic",
    "iotas", "ippon", "irade", "irate", "irids", "iring", "irked", "iroko", "irone", "irons", "irony", "isbas", "ishes", "isled", "isles", "islet", "isnae", "issei", "issue", "istle",
    "itchy", "items", "ither", "ivied", "ivies", "ivory", "ixias", "ixnay", "ixora", "ixtle", "izard", "izars", "izzat", "jaaps", "jabot", "jacal", "jacks", "jacky", "jaded", "jades",
    "jafas", "jaffa", "jagas", "jager", "jaggs", "jaggy", "jagir", "jagra", "jails", "jaker", "jakes", "jakey", "jalap", "jalop", "jambe", "jambo", "jambs", "jambu", "james", "jammy",
    "jamon", "janes", "janns", "janny", "janty", "japan", "japed", "japer", "japes", "jarks", "jarls", "jarps", "jarta", "jarul", "jasey", "jaspe", "jasps", "jatos", "jauks", "jaunt",
    "jaups", "javas", "javel", "jawan", "jawed", "jaxie", "jazzy", "jeans", "jeats", "jebel", "jedis", "jeels", "jeely", "jeeps", "jeers", "jeeze", "jefes", "jeffs", "jehad", "jehus",
    "jelab", "jello", "jells", "jelly", "jembe", "jemmy", "jenny", "jeons", "jerid", "jerks", "jerky", "jerry", "jesse", "jests", "jesus", "jetes", "jeton", "jetty", "jeune", "jewed",
    "jewel", "jewie", "jhala", "jiaos", "jibba", "jibbs", "jibed", "jiber", "jibes", "jiffs", "jiffy", "jiggy", "jigot", "jihad", "jills", "jilts", "jimmy", "jimpy", "jingo", "jinks",
    "jinne", "jinni", "jinns", "jirds", "jirga", "jirre", "jisms", "jived", "jiver", "jives", "jivey", "jnana", "jobed", "jobes", "jocko", "jocks", "jocky", "jocos", "jodel", "joeys",
    "johns", "joins", "joint", "joist", "joked", "joker", "jokes", "jokey", "jokol", "joled", "joles", "jolls", "jolly", "jolts", "jolty", "jomon", "jomos", "jones", "jongs", "jonty",
    "jooks", "joram", "jorum", "jotas", "jotty", "jotun", "joual", "jougs", "jouks", "joule", "jours", "joust", "jowar", "jowed", "jowls", "jowly", "joyed", "jubas", "jubes", "jucos",
    "judas", "judge", "judgy", "judos", "jugal", "jugum", "juice", "juicy", "jujus", "juked", "jukes", "jukus", "julep", "jumar", "jumbo", "jumby", "jumps", "jumpy", "junco", "junks",
    "junky", "junta", "junto", "jupes", "jupon", "jural", "jurat", "jurel", "jures", "juror", "justs", "jutes", "jutty", "juves", "juvie", "kaama", "kabab", "kabar", "kabob", "kacha",
    "kacks", "kadai", "kades", "kadis", "kafir", "kagos", "kagus", "kahal", "kaiak", "kaids", "kaies", "kaifs", "kaika", "kaiks", "kails", "kaims", "kaing", "kains", "kakas", "kakis",
    "kalam", "kales", "kalif", "kalis", "kalpa", "kamas", "kames", "kamik", "kamis", "kamme", "kanae", "kanas", "kandy", "kaneh", "kanes", "kanga", "kangs", "kanji", "kants", "kanzu",
    "kaons", "kapas", "kaphs", "kapok", "kapow", "kappa", "kapus", "kaput", "karas", "karat", "karks", "karma", "karns", "karoo", "karos", "karri", "karst", "karsy", "karts", "karzy",
    "kasha", "kasme", "katal", "katas", "katis", "katti", "kaugh", "kauri", "kauru", "kaury", "kaval", "kavas", "kawas", "kawau", "kawed", "kayak", "kayle", "kayos", "kazis", "kazoo",
    "kbars", "kebab", "kebar", "kebob", "kecks", "kedge", "kedgy", "keech", "keefs", "keeks", "keels", "keema", "keeno", "keens", "keeps", "keets", "keeve", "kefir", "kehua", "keirs",
    "kelep", "kelim", "kells", "kelly", "kelps", "kelpy", "kelts", "kelty", "kembo", "kembs", "kemps", "kempt", "kempy", "kenaf", "kench", "kendo", "kenos", "kente", "kents", "kepis",
    "kerbs", "kerel", "kerfs", "kerky", "kerma", "kerne", "kerns", "keros", "kerry", "kerve", "kesar", "kests", "ketas", "ketch", "ketes", "ketol", "kevel", "kevil", "kexes", "keyed",
    "keyer", "khadi", "khafs", "khaki", "khans", "khaph", "khats", "khaya", "khazi", "kheda", "kheth", "khets", "khoja", "khors", "khoum", "khuds", "kiaat", "kiack", "kiang", "kibbe",
    "kibbi", "kibei", "kibes", "kibla", "kicks", "kicky", "kiddo", "kiddy", "kidel", "kidge", "kiefs", "kiers", "kieve", "kievs", "kight", "kikoi", "kiley", "kilim", "kills", "kilns",
    "kilos", "kilps", "kilts", "kilty", "kimbo", "kinas", "kinda", "kinds", "kindy", "kines", "kings", "kinin", "kinks", "kinky", "kinos", "kiore", "kiosk", "kipes", "kippa", "kipps",
    "kirby", "kirks", "kirns", "kirri", "kisan", "kissy", "kists", "kited", "kiter", "kites", "kithe", "kiths", "kitty", "kitul", "kivas", "kiwis", "klang", "klaps", "klett", "klick",
    "klieg", "kliks", "klong", "kloof", "kluge", "klutz", "knack", "knags", "knaps", "knarl", "knars", "knaur", "knave", "knawe", "knead", "kneed", "kneel", "knees", "knell", "knelt",
    "knife", "knish", "knits", "knive", "knobs", "knock", "knoll", "knops", "knosp", "knots", "knout", "knowe", "known", "knows", "knubs", "knurl", "knurr", "knurs", "knuts", "koala",
    "koans", "koaps", "koban", "kobos", "koels", "koffs", "kofta", "kogal", "kohas", "kohen", "kohls", "koine", "kojis", "kokam", "kokas", "koker", "kokra", "kokum", "kolas", "kolos",
    "kombu", "konbu", "kondo", "konks", "kooks", "kooky", "koori", "kopek", "kophs", "kopje", "koppa", "korai", "koras", "korat", "kores", "korma", "koros", "korun", "korus", "koses",
    "kotch", "kotos", "kotow", "koura", "kraal", "krabs", "kraft", "krais", "krait", "krang", "krans", "kranz", "kraut", "krays", "kreep", "kreng", "krewe", "krill", "krona", "krone",
    "kroon", "krubi", "krunk", "ksars", "kubie", "kudos", "kudus", "kudzu", "kufis", "kugel", "kuias", "kukri", "kukus", "kulak", "kulan", "kulas", "kulfi", "kumis", "kumys", "kuris",
    "kurre", "kurta", "kurus", "kusso", "kutas", "kutch", "kutis", "kutus", "kuzus", "kvass", "kvell", "kwela", "kyack", "kyaks", "kyang", "kyars", "kyats", "kybos", "kydst", "kyles",
    "kylie", "kylin", "kylix", "kyloe", "kynde", "kynds", "kypes", "kyrie", "kytes", "kythe", "laari", "labda", "label", "labia", "labis", "labor", "labra", "laced", "lacer", "laces",
    "lacet", "lacey", "lacks", "laddy", "laded", "laden", "lader", "lades", "ladle", "laers", "laevo", "lagan", "lager", "lahal", "lahar", "laich", "laics", "laids", "laigh", "laika",
    "laiks", "laird", "lairs", "lairy", "laith", "laity", "laked", "laker", "lakes", "lakhs", "lakin", "laksa", "laldy", "lalls", "lamas", "lambs", "lamby", "lamed", "lamer", "lames",
    "lamia", "lammy", "lamps", "lanai", "lanas", "lance", "lanch", "lande", "lands", "lanes", "lanks", "lanky", "lants", "lapel", "lapin", "lapis", "lapje", "lapse", "larch", "lards",
    "lardy", "laree", "lares", "large", "largo", "laris", "larks", "larky", "larns", "larnt", "larum", "larva", "lased", "laser", "lases", "lassi", "lasso", "lassu", "lassy", "lasts",
    "latah", "latch", "lated", "laten", "later", "latex", "lathe", "lathi", "laths", "lathy", "latke", "latte", "latus", "lauan", "lauch", "lauds", "laufs", "laugh", "laund", "laura",
    "laval", "lavas", "laved", "laver", "laves", "lavra", "lavvy", "lawed", "lawer", "lawin", "lawks", "lawns", "lawny", "laxed", "laxer", "laxes", "laxly", "layed", "layer", "layin",
    "layup", "lazar", "lazed", "lazes", "lazos", "lazzi", "lazzo", "leach", "leads", "leady", "leafs", "leafy", "leaks", "leaky", "leams", "leans", "leant", "leany", "leaps", "leapt",
    "leare", "learn", "lears", "leary", "lease", "leash", "least", "leats", "leave", "leavy", "leaze", "leben", "leccy", "ledes", "ledge", "ledgy", "ledum", "leear", "leech", "leeks",
    "leeps", "leers", "leery", "leese", "leets", "leeze", "lefte", "lefts", "lefty", "legal", "leger", "leges", "legge", "leggo", "leggy", "legit", "lehrs", "lehua", "leirs", "leish",
    "leman", "lemed", "lemel", "lemes", "lemma", "lemme", "lemon", "lemur", "lends", "lenes", "lengs", "lenis", "lenos", "lense", "lenti", "lento", "leone", "leper", "lepid", "lepra",
    "lepta", "lered", "leres", "lerps", "leses", "lests", "letch", "lethe", "letup", "leuch", "leuco", "leuds", "leugh", "levas", "levee", "level", "lever", "leves", "levin", "levis",
    "lewis", "lexes", "lexis", "lezes", "lezza", "lezzy", "liana", "liane", "liang", "liard", "liars", "liart", "libel", "liber", "libra", "libri", "lichi", "licht", "licit", "licks",
    "lidar", "lidos", "liefs", "liege", "liens", "liers", "lieus", "lieve", "lifer", "lifes", "lifts", "ligan", "liger", "ligge", "light", "ligne", "liked", "liken", "liker", "likes",
    "likin", "lilac", "lills", "lilos", "lilts", "liman", "limas", "limax", "limba", "limbi", "limbo", "limbs", "limby", "limed", "limen", "limes", "limey", "limit", "limma", "limns",
    "limos", "limpa", "limps", "linac", "linch", "linds", "lindy", "lined", "linen", "liner", "lines", "liney", "linga", "lingo", "lings", "lingy", "linin", "links", "linky", "linns",
    "linny", "linos", "lints", "linty", "linum", "linux", "lions", "lipas", "lipes", "lipid", "lipin", "lipos", "lippy", "liras", "lirks", "lirot", "lisks", "lisle", "lisps", "lists",
    "litai", "litas", "lited", "liter", "lites", "lithe", "litho", "liths", "litre", "lived", "liven", "liver", "lives", "livid", "livor", "livre", "llama", "llano", "loach", "loads",
    "loafs", "loams", "loamy", "loans", "loast", "loath", "loave", "lobar", "lobby", "lobed", "lobes", "lobos", "lobus", "local", "loche", "lochs", "locie", "locis", "locks", "locos",
    "locum", "locus", "loden", "lodes", "lodge", "loess", "lofts", "lofty", "logan", "loges", "loggy", "logia", "logic", "logie", "login", "logoi", "logon", "logos", "lohan", "loids",
    "loins", "loipe", "loirs", "lokes", "lolls", "lolly", "lolog", "lomas", "lomed", "lomes", "loner", "longa", "longe", "longs", "looby", "looed", "looey", "loofa", "loofs", "looie",
    "looks", "looky", "looms", "loons", "loony", "loops", "loopy", "loord", "loose", "loots", "loped", "loper", "lopes", "loppy", "loral", "loran", "lords", "lordy", "lorel", "lores",
    "loric", "loris", "lorry", "losed", "losel", "losen", "loser", "loses", "lossy", "lotah", "lotas", "lotes", "lotic", "lotos", "lotsa", "lotta", "lotte", "lotto", "lotus", "loued",
    "lough", "louie", "louis", "louma", "lound", "louns", "loupe", "loups", "loure", "lours", "loury", "louse", "lousy", "louts", "lovat", "loved", "lover", "loves", "lovey", "lovie",
    "lowan", "lowed", "lower", "lowes", "lowly", "lownd", "lowne", "lowns", "lowps", "lowry", "lowse", "lowts", "loxed", "loxes", "loyal", "lozen", "luach", "luaus", "lubed", "lubes",
    "lubra", "luces", "lucid", "lucks", "lucky", "lucre", "ludes", "ludic", "ludos", "luffa", "luffs", "luged", "luger", "luges", "lulls", "lulus", "lumas", "lumbi", "lumen", "lumme",
    "lummy", "lumps", "lumpy", "lunar", "lunas", "lunch", "lunes", "lunet", "lunge", "lungi", "lungs", "lunks", "lunts", "lupin", "lupus", "lurch", "lured", "lurer", "lures", "lurex",
    "lurgi", "lurgy", "lurid", "lurks", "lurry", "lurve", "luser", "lushy", "lusks", "lusts", "lusty", "lusus", "lutea", "luted", "luter", "lutes", "luvvy", "luxed", "luxer", "luxes",
    "lweis", "lyams", "lyard", "lyart", "lyase", "lycea", "lycee", "lycra", "lying", "lymes", "lymph", "lynes", "lyres", "lyric", "lysed", "lyses", "lysin", "lysis", "lysol", "lyssa",
    "lyted", "lytes", "lythe", "lytic", "lytta", "maaed", "maare", "maars", "mabes", "macas", "macaw", "maced", "macer", "maces", "mache", "machi", "macho", "machs", "macks", "macle",
    "macon", "macro", "madam", "madge", "madid", "madly", "madre", "maerl", "mafia", "mafic", "mages", "maggs", "magic", "magma", "magot", "magus", "mahoe", "mahua", "mahwa", "maids",
    "maiko", "maiks", "maile", "maill", "mails", "maims", "mains", "maire", "mairs", "maise", "maist", "maize", "major", "makar", "maker", "makes", "makis", "makos", "malam", "malar",
    "malas", "malax", "males", "malic", "malik", "malis", "malls", "malms", "malmy", "malts", "malty", "malus", "malva", "malwa", "mamas", "mamba", "mambo", "mamee", "mamey", "mamie",
    "mamma", "mammy", "manas", "manat", "mandi", "maneb", "maned", "maneh", "manes", "manet", "manga", "mange", "mango", "mangs", "mangy", "mania", "manic", "manis", "manky", "manly",
    "manna", "manor", "manos", "manse", "manta", "manto", "manty", "manul", "manus", "mapau", "maple", "maqui", "marae", "marah", "maras", "march", "marcs", "mardy", "mares", "marge",
    "margs", "maria", "marid", "marka", "marks", "marle", "marls", "marly", "marms", "maron", "maror", "marra", "marri", "marry", "marse", "marsh", "marts", "marvy", "masas", "mased",
    "maser", "mases", "mashy", "masks", "mason", "massa", "masse", "massy", "masts", "masty", "masus", "matai", "match", "mated", "mater", "mates", "matey", "maths", "matin", "matlo",
    "matte", "matts", "matza", "matzo", "mauby", "mauds", "mauls", "maund", "mauri", "mausy", "mauts", "mauve", "mauzy", "maven", "mavie", "mavin", "mavis", "mawed", "mawks", "mawky",
    "mawns", "mawrs", "maxed", "maxes", "maxim", "maxis", "mayan", "mayas", "maybe", "mayed", "mayor", "mayos", "mayst", "mazed", "mazer", "mazes", "mazey", "mazut", "mbira", "meads",
    "meals", "mealy", "meane", "means", "meant", "meany", "meare", "mease", "meath", "meats", "meaty", "mebos", "mecca", "mechs", "mecks", "medal", "media", "medic", "medii", "medle",
    "meeds", "meers", "meets", "meffs", "meins", "meint", "meiny", "meith", "mekka", "melas", "melba", "melds", "melee", "melic", "melik", "mells", "melon", "melts", "melty", "memes",
    "memos", "menad", "mends", "mened", "menes", "menge", "mengs", "mensa", "mense", "mensh", "menta", "mento", "menus", "meous", "meows", "merch", "mercs", "mercy", "merde", "mered",
    "merel", "merer", "meres", "merge", "meril", "meris", "merit", "merks", "merle", "merls", "merry", "merse", "mesal", "mesas", "mesel", "meses", "meshy", "mesic", "mesne", "meson",
    "messy", "mesto", "metal", "meted", "meter", "metes", "metho", "meths", "metic", "metif", "metis", "metol", "metre", "metro", "meuse", "meved", "meves", "mewed", "mewls", "meynt",
    "mezes", "mezze", "mezzo", "mhorr", "miaou", "miaow", "miasm", "miaul", "micas", "miche", "micht", "micks", "micky", "micos", "micra", "micro", "middy", "midge", "midgy", "midis",
    "midst", "miens", "mieve", "miffs", "miffy", "mifty", "miggs", "might", "mihas", "mihis", "miked", "mikes", "mikra", "mikva", "milch", "milds", "miler", "miles", "milfs", "milia",
    "milko", "milks", "milky", "mille", "mills", "milor", "milos", "milpa", "milts", "milty", "miltz", "mimed", "mimeo", "mimer", "mimes", "mimic", "mimsy", "minae", "minar", "minas",
    "mince", "mincy", "minds", "mined", "miner", "mines", "minge", "mings", "mingy", "minim", "minis", "minke", "minks", "minny", "minor", "minos", "mints", "minty", "minus", "mired",
    "mires", "mirex", "mirid", "mirin", "mirks", "mirky", "mirly", "miros", "mirth", "mirvs", "mirza", "misch", "misdo", "miser", "mises", "misgo", "misos", "missa", "missy", "mists",
    "misty", "mitch", "miter", "mites", "mitis", "mitre", "mitts", "mixed", "mixen", "mixer", "mixes", "mixte", "mixup", "mizen", "mizzy", "mneme", "moans", "moats", "mobby", "mobes",
    "mobey", "mobie", "moble", "mocha", "mochi", "mochs", "mochy", "mocks", "modal", "model", "modem", "moder", "modes", "modge", "modii", "modus", "moers", "mofos", "moggy", "mogul",
    "mohel", "mohos", "mohrs", "mohua", "mohur", "moile", "moils", "moira", "moire", "moist", "moits", "mojos", "mokes", "mokis", "mokos", "molal", "molar", "molas", "molds", "moldy",
    "moled", "moles", "molla", "molls", "molly", "molto", "molts", "molys", "momes", "momma", "mommy", "momus", "monad", "monal", "monas", "monde", "mondo", "moner", "money", "mongo",
    "mongs", "monic", "monie", "monks", "monos", "monte", "month", "monty", "moobs", "mooch", "moods", "moody", "mooed", "mooks", "moola", "mooli", "mools", "mooly", "moong", "moons",
    "moony", "moops", "moors", "moory", "moose", "moots", "moove", "moped", "moper", "mopes", "mopey", "moppy", "mopsy", "mopus", "morae", "moral", "moras", "morat", "moray", "morel",
    "mores", "moria", "morne", "morns", "moron", "morph", "morra", "morro", "morse", "morts", "mosed", "moses", "mosey", "mosks", "mosso", "mossy", "moste", "mosts", "moted", "motel",
    "moten", "motes", "motet", "motey", "moths", "mothy", "motif", "motis", "motor", "motte", "motto", "motts", "motty", "motus", "motza", "mouch", "moues", "mould", "mouls", "moult",
    "mound", "mount", "moups", "mourn", "mouse", "moust", "mousy", "mouth", "moved", "mover", "moves", "movie", "mowas", "mowed", "mower", "mowra", "moxas", "moxie", "moyas", "moyle",
    "moyls", "mozed", "mozes", "mozos", "mpret", "mucho", "mucic", "mucid", "mucin", "mucks", "mucky", "mucor", "mucro", "mucus", "muddy", "mudge", "mudir", "mudra", "muffs", "mufti",
    "mugga", "muggs", "muggy", "muhly", "muids", "muils", "muirs", "muist", "mujik", "mulch", "mulct", "muled", "mules", "muley", "mulga", "mulie", "mulla", "mulls", "mulse", "mulsh",
    "mumms", "mummy", "mumps", "mumsy", "mumus", "munch", "munga", "munge", "mungo", "mungs", "munis", "munts", "muntu", "muons", "mural", "muras", "mured", "mures", "murex", "murid",
    "murks", "murky", "murls", "murly", "murra", "murre", "murri", "murrs", "murry", "murti", "murva", "musar", "musca", "mused", "muser", "muses", "muset", "musha", "mushy", "music",
    "musit", "musks", "musky", "musos", "musse", "mussy", "musth", "musts", "musty", "mutch", "muted", "muter", "mutes", "mutha", "mutis", "muton", "mutts", "muxed", "muxes", "muzak",
    "muzzy", "mvule", "myall", "mylar", "mynah", "mynas", "myoid", "myoma", "myope", "myops", "myopy", "myrrh", "mysid", "mythi", "myths", "mythy", "myxos", "mzees", "naams", "naans",
    "nabes", "nabis", "nabks", "nabla", "nabob", "nache", "nacho", "nacre", "nadas", "nadir", "naeve", "naevi", "naffs", "nagas", "naggy", "nagor", "nahal", "naiad", "naifs", "naiks",
    "nails", "naira", "nairu", "naive", "naked", "naker", "nakfa", "nalas", "naled", "nalla", "named", "namer", "names", "namma", "namus", "nanas", "nance", "nancy", "nandu", "nanna",
    "nanny", "nanos", "nanua", "napas", "naped", "napes", "napoo", "nappa", "nappe", "nappy", "naras", "narco", "narcs", "nards", "nares", "naric", "naris", "narks", "narky", "narre",
    "nasal", "nashi", "nasty", "natal", "natch", "nates", "natis", "natty", "nauch", "naunt", "naval", "navar", "navel", "naves", "navew", "navvy", "nawab", "nazes", "nazir", "nazis",
    "nduja", "neafe", "neals", "neaps", "nears", "neath", "neats", "nebek", "nebel", "necks", "neddy", "needs", "needy", "neeld", "neele", "neemb", "neems", "neeps", "neese", "neeze",
    "negro", "negus", "neifs", "neigh", "neist", "neive", "nelis", "nelly", "nemas", "nemns", "nempt", "nenes", "neons", "neper", "nepit", "neral", "nerds", "nerdy", "nerka", "nerks",
    "nerol", "nerts", "nertz", "nerve", "nervy", "nests", "netes", "netop", "netts", "netty", "neuks", "neume", "neums", "nevel", "never", "neves", "nevus", "newbs", "newed", "newel",
    "newer", "newie", "newly", "newsy", "newts", "nexts", "nexus", "ngaio", "ngana", "ngati", "ngoma", "ngwee", "nicad", "nicer", "niche", "nicht", "nicks", "nicol", "nidal", "nided",
    "nides", "nidor", "nidus", "niece", "niefs", "nieve", "nifes", "niffs", "niffy", "nifty", "niger", "nighs", "night", "nihil", "nikab", "nikah", "nikau", "nills", "nimbi", "nimbs",
    "nimps", "niner", "nines", "ninja", "ninny", "ninon", "ninth", "nipas", "nippy", "niqab", "nirls", "nirly", "nisei", "nisse", "nisus", "niter", "nites", "nitid", "niton", "nitre",
    "nitro", "nitry", "nitty", "nival", "nixed", "nixer", "nixes", "nixie", "nizam", "nkosi", "noahs", "nobby", "noble", "nobly", "nocks", "nodal", "noddy", "nodes", "nodus", "noels",
    "noggs", "nohow", "noils", "noily", "noint", "noirs", "noise", "noisy", "noles", "nolls", "nolos", "nomad", "nomas", "nomen", "nomes", "nomic", "nomoi", "nomos", "nonas", "nonce",
    "nones", "nonet", "nongs", "nonis", "nonny", "nonyl", "noobs", "nooit", "nooks", "nooky", "noons", "noops", "noose", "nopal", "noria", "noris", "norks", "norma", "norms", "north",
    "nosed", "noser", "noses", "nosey", "notal", "notch", "noted", "noter", "notes", "notum", "nould", "noule", "nouls", "nouns", "nouny", "noups", "novae", "novas", "novel", "novum",
    "noway", "nowed", "nowls", "nowts", "nowty", "noxal", "noxes", "noyau", "noyed", "noyes", "nubby", "nubia", "nucha", "nuddy", "nuder", "nudes", "nudge", "nudie", "nudzh", "nuffs",
    "nugae", "nuked", "nukes", "nulla", "nulls", "numbs", "numen", "nummy", "nunny", "nurds", "nurdy", "nurls", "nurrs", "nurse", "nutso", "nutsy", "nutty", "nyaff", "nyala", "nying",
    "nylon", "nymph", "nyssa", "oaked", "oaken", "oaker", "oakum", "oared", "oases", "oasis", "oasts", "oaten", "oater", "oaths", "oaves", "obang", "obeah", "obeli", "obese", "obeys",
    "obias", "obied", "obiit", "obits", "objet", "oboes", "obole", "oboli", "obols", "occam", "occur", "ocean", "ocher", "oches", "ochre", "ochry", "ocker", "ocrea", "octad", "octal",
    "octan", "octas", "octet", "octyl", "oculi", "odahs", "odals", "odder", "oddly", "odeon", "odeum", "odism", "odist", "odium", "odors", "odour", "odyle", "odyls", "ofays", "offal",
    "offed", "offer", "offie", "oflag", "often", "ofter", "ogams", "ogeed", "ogees", "oggin", "ogham", "ogive", "ogled", "ogler", "ogles", "ogmic", "ogres", "ohias", "ohing", "ohmic",
    "ohone", "oidia", "oiled", "oiler", "oinks", "oints", "ojime", "okapi", "okays", "okehs", "okras", "oktas", "olden", "older", "oldie", "oleic", "olein", "olent", "oleos", "oleum",
    "olios", "olive", "ollas", "ollav", "oller", "ollie", "ology", "olpae", "olpes", "omasa", "omber", "ombre", "ombus", "omega", "omens", "omers", "omits", "omlah", "omovs", "omrah",
    "oncer", "onces", "oncet", "oncus", "onely", "oners", "onery", "onion", "onium", "onkus", "onlay", "onned", "onset", "ontic", "oobit", "oohed", "oomph", "oonts", "ooped", "oorie",
    "ooses", "ootid", "oozed", "oozes", "opahs", "opals", "opens", "opepe", "opera", "opine", "oping", "opium", "oppos", "opsin", "opted", "opter", "optic", "orach", "oracy", "orals",
    "orang", "orant", "orate", "orbed", "orbit", "orcas", "orcin", "order", "ordos", "oread", "orfes", "organ", "orgia", "orgic", "orgue", "oribi", "oriel", "orixa", "orles", "orlon",
    "orlop", "ormer", "ornis", "orpin", "orris", "ortho", "orval", "orzos", "oscar", "oshac", "osier", "osmic", "osmol", "ossia", "ostia", "otaku", "otary", "other", "ottar", "otter",
    "ottos", "oubit", "oucht", "ouens", "ought", "ouija", "oulks", "oumas", "ounce", "oundy", "oupas", "ouped", "ouphe", "ouphs", "ourie", "ousel", "ousts", "outby", "outdo", "outed",
    "outer", "outgo", "outre", "outro", "outta", "ouzel", "ouzos", "ovals", "ovary", "ovate", "ovels", "ovens", "overs", "overt", "ovine", "ovist", "ovoid", "ovoli", "ovolo", "ovule",
    "owche", "owies", "owing", "owled", "owler", "owlet", "owned", "owner", "owres", "owrie", "owsen", "oxbow", "oxers", "oxeye", "oxide", "oxids", "oxies", "oxime", "oxims", "oxlip",
    "oxter", "oyers", "ozeki", "ozone", "ozzie", "paals", "paans", "pacas", "paced", "pacer", "paces", "pacey", "pacha", "packs", "pacos", "pacta", "pacts", "paddy", "padis", "padle",
    "padma", "padre", "padri", "paean", "paedo", "paeon", "pagan", "paged", "pager", "pages", "pagle", "pagod", "pagri", "paiks", "pails", "pains", "paint", "paire", "pairs", "paisa",
    "paise", "pakka", "palas", "palay", "palea", "paled", "paler", "pales", "palet", "palis", "palki", "palla", "palls", "pally", "palms", "palmy", "palpi", "palps", "palsa", "palsy",
    "pampa", "panax", "pance", "panda", "pands", "pandy", "paned", "panel", "panes", "panga", "pangs", "panic", "panim", "panko", "panne", "panni", "pansy", "panto", "pants", "panty",
    "paoli", "paolo", "papal", "papas", "papaw", "paper", "papes", "pappi", "pappy", "parae", "paras", "parch", "pardi", "pards", "pardy", "pared", "paren", "pareo", "parer", "pares",
    "pareu", "parev", "parge", "pargo", "paris", "parka", "parki", "parks", "parky", "parle", "parly", "parma", "parol", "parps", "parra", "parrs", "parry", "parse", "parti", "parts",
    "party", "parve", "parvo", "paseo", "pases", "pasha", "pashm", "paska", "paspy", "passe", "pasta", "paste", "pasts", "pasty", "patch", "pated", "paten", "pater", "pates", "paths",
    "patin", "patio", "patka", "patly", "patsy", "patte", "patty", "patus", "pauas", "pauls", "pause", "pavan", "paved", "paven", "paver", "paves", "pavid", "pavin", "pavis", "pawas",
    "pawaw", "pawed", "pawer", "pawks", "pawky", "pawls", "pawns", "paxes", "payed", "payee", "payer", "payor", "paysd", "peace", "peach", "peage", "peags", "peaks", "peaky", "peals",
    "peans", "peare", "pearl", "pears", "peart", "pease", "peats", "peaty", "peavy", "peaze", "pebas", "pecan", "pechs", "pecke", "pecks", "pecky", "pedal", "pedes", "pedis", "pedro",
    "peece", "peeks", "peels", "peens", "peeoy", "peepe", "peeps", "peers", "peery", "peeve", "peggy", "peghs", "peins", "peise", "peize", "pekan", "pekes", "pekin", "pekoe", "pelas",
    "pelau", "peles", "pelfs", "pells", "pelma", "pelon", "pelta", "pelts", "penal", "pence", "pends", "pendu", "pened", "penes", "pengo", "penie", "penis", "penks", "penna", "penne",
    "penni", "penny", "pents", "peons", "peony", "pepla", "pepos", "peppy", "pepsi", "perai", "perce", "perch", "percs", "perdu", "perdy", "perea", "peres", "peril", "peris", "perks",
    "perky", "perms", "perns", "perog", "perps", "perry", "perse", "perst", "perts", "perve", "pervo", "pervs", "pervy", "pesky", "pesos", "pesto", "pests", "pesty", "petal", "petar",
    "peter", "petit", "petre", "petri", "petti", "petto", "petty", "pewee", "pewit", "peyse", "phage", "phang", "phare", "pharm", "phase", "pheer", "phene", "pheon", "phese", "phial",
    "phish", "phizz", "phlox", "phoca", "phone", "phono", "phons", "phony", "photo", "phots", "phpht", "phuts", "phyla", "phyle", "piani", "piano", "pians", "pibal", "pical", "picas",
    "piccy", "picks", "picky", "picot", "picra", "picul", "piece", "piend", "piers", "piert", "pieta", "piets", "piety", "piezo", "piggy", "pight", "pigmy", "piing", "pikas", "pikau",
    "piked", "piker", "pikes", "pikey", "pikis", "pikul", "pilae", "pilaf", "pilao", "pilar", "pilau", "pilaw", "pilch", "pilea", "piled", "pilei", "piler", "piles", "pilis", "pills",
    "pilot", "pilow", "pilum", "pilus", "pimas", "pimps", "pinas", "pinch", "pined", "pines", "piney", "pingo", "pings", "pinko", "pinks", "pinky", "pinna", "pinny", "pinon", "pinot",
    "pinta", "pinto", "pints", "pinup", "pions", "piony", "pious", "pioye", "pioys", "pipal", "pipas", "piped", "piper", "pipes", "pipet", "pipis", "pipit", "pippy", "pipul", "pique",
    "pirai", "pirls", "pirns", "pirog", "pisco", "pises", "pisky", "pisos", "pissy", "piste", "pitas", "pitch", "piths", "pithy", "piton", "pitot", "pitta", "piums", "pivot", "pixel",
    "pixes", "pixie", "pized", "pizes", "pizza", "plaas", "place", "plack", "plage", "plaid", "plain", "plait", "plane", "plank", "plans", "plant", "plaps", "plash", "plasm", "plast",
    "plate", "plats", "platt", "platy", "playa", "plays", "plaza", "plead", "pleas", "pleat", "plebe", "plebs", "plena", "pleon", "plesh", "plews", "plica", "plied", "plier", "plies",
    "plims", "pling", "plink", "ploat", "plods", "plong", "plonk", "plook", "plops", "plots", "plotz", "plouk", "plows", "ploye", "ploys", "pluck", "plues", "pluff", "plugs", "plumb",
    "plume", "plump", "plums", "plumy", "plunk", "pluot", "plush", "pluto", "plyer", "poach", "poaka", "poake", "poboy", "pocks", "pocky", "podal", "poddy", "podex", "podge", "podgy",
    "podia", "poems", "poeps", "poesy", "poets", "pogey", "pogge", "pogos", "pohed", "poilu", "poind", "point", "poise", "pokal", "poked", "poker", "pokes", "pokey", "pokie", "polar",
    "poled", "poler", "poles", "poley", "polio", "polis", "polje", "polka", "polks", "polls", "polly", "polos", "polts", "polyp", "polys", "pombe", "pomes", "pommy", "pomos", "pomps",
    "ponce", "poncy", "ponds", "pones", "poney", "ponga", "pongo", "pongs", "pongy", "ponks", "ponts", "ponty", "ponzu", "pooch", "poods", "pooed", "poofs", "poofy", "poohs", "pooja",
    "pooka", "pooks", "pools", "poons", "poops", "poopy", "poori", "poort", "poots", "poove", "poovy", "popes", "poppa", "poppy", "popsy", "porae", "poral", "porch", "pored", "porer",
    "pores", "porge", "porgy", "porin", "porks", "porky", "porno", "porns", "porny", "porta", "ports", "porty", "posed", "poser", "poses", "posey", "posho", "posit", "posse", "posts",
    "potae", "potch", "poted", "potes", "potin", "potoo", "potsy", "potto", "potts", "potty", "pouch", "pouff", "poufs", "pouke", "pouks", "poule", "poulp", "poult", "pound", "poupe",
    "poupt", "pours", "pouts", "pouty", "powan", "power", "powin", "pownd", "powns", "powny", "powre", "poxed", "poxes", "poynt", "poyou", "poyse", "pozzy", "praam", "prads", "prahu",
    "prams", "prana", "prang", "prank", "praos", "prase", "prate", "prats", "pratt", "praty", "praus", "prawn", "prays", "predy", "preed", "preen", "prees", "preif", "prems", "premy",
    "prent", "preon", "preop", "preps", "presa", "prese", "press", "prest", "preve", "prexy", "preys", "prial", "price", "prick", "pricy", "pride", "pried", "prief", "prier", "pries",
    "prigs", "prill", "prima", "prime", "primi", "primo", "primp", "prims", "primy", "prink", "print", "prion", "prior", "prise", "prism", "priss", "privy", "prize", "proas", "probe",
    "probs", "prods", "proem", "profs", "progs", "proin", "proke", "prole", "proll", "promo", "proms", "prone", "prong", "pronk", "proof", "props", "prore", "prose", "proso", "pross",
    "prost", "prosy", "proto", "proud", "proul", "prove", "prowl", "prows", "proxy", "proyn", "prude", "prune", "prunt", "pruta", "pryer", "pryse", "psalm", "pseud", "pshaw", "psion",
    "psoae", "psoai", "psoas", "psora", "psych", "psyop", "pubco", "pubes", "pubic", "pubis", "pucan", "pucer", "puces", "pucka", "pucks", "puddy", "pudge", "pudgy", "pudic", "pudor",
    "pudsy", "pudus", "puers", "puffa", "puffs", "puffy", "puggy", "pugil", "puhas", "pujah", "pujas", "pukas", "puked", "puker", "pukes", "pukey", "pukka", "pukus", "pulao", "pulas",
    "puled", "puler", "pules", "pulik", "pulis", "pulka", "pulks", "pulli", "pulls", "pully", "pulmo", "pulps", "pulpy", "pulse", "pulus", "pumas", "pumie", "pumps", "punas", "punce",
    "punch", "punga", "pungs", "punji", "punka", "punks", "punky", "punny", "punto", "punts", "punty", "pupae", "pupas", "pupil", "puppy", "pupus", "purda", "pured", "puree", "purer",
    "pures", "purge", "purin", "puris", "purls", "purpy", "purrs", "purse", "pursy", "purty", "puses", "pushy", "pusle", "putid", "puton", "putti", "putto", "putts", "putty", "puzel",
    "pwned", "pyats", "pyets", "pygal", "pygmy", "pyins", "pylon", "pyned", "pynes", "pyoid", "pyots", "pyral", "pyran", "pyres", "pyrex", "pyric", "pyros", "pyxed", "pyxes", "pyxie",
    "pyxis", "pzazz", "qadis", "qaids", "qajaq", "qanat", "qapik", "qibla", "qophs", "qorma", "quack", "quads", "quaff", "quags", "quail", "quair", "quais", "quake", "quaky", "quale",
    "qualm", "quant", "quare", "quark", "quart", "quash", "quasi", "quass", "quate", "quats", "quayd", "quays", "qubit", "quean", "queen", "queer", "quell", "queme", "quena", "quern",
    "query", "quest", "queue", "queyn", "queys", "quich", "quick", "quids", "quiet", "quiff", "quill", "quilt", "quims", "quina", "quine", "quino", "quins", "quint", "quipo", "quips",
    "quipu", "quire", "quirk", "quirt", "quist", "quite", "quits", "quoad", "quods", "quoif", "quoin", "quoit", "quoll", "quonk", "quops", "quota", "quote", "quoth", "qursh", "quyte",
    "rabat", "rabbi", "rabic", "rabid", "rabis", "raced", "racer", "races", "rache", "racks", "racon", "radar", "radge", "radii", "radio", "radix", "radon", "raffs", "rafts", "ragas",
    "ragde", "raged", "ragee", "rager", "rages", "ragga", "raggs", "raggy", "ragis", "ragus", "rahed", "rahui", "raias", "raids", "raiks", "raile", "rails", "raine", "rains", "rainy",
    "raird", "raise", "raita", "raits", "rajah", "rajas", "rajes", "raked", "rakee", "raker", "rakes", "rakia", "rakis", "rakus", "rales", "rally", "ralph", "ramal", "ramee", "ramen",
    "ramet", "ramie", "ramin", "ramis", "rammy", "ramps", "ramus", "ranas", "rance", "ranch", "rands", "randy", "ranee", "ranga", "range", "rangi", "rangs", "rangy", "ranid", "ranis",
    "ranke", "ranks", "rants", "raped", "raper", "rapes", "raphe", "rapid", "rappe", "rared", "raree", "rarer", "rares", "rarks", "rased", "raser", "rases", "rasps", "raspy", "rasse",
    "rasta", "ratal", "ratan", "ratas", "ratch", "rated", "ratel", "rater", "rates", "ratha", "rathe", "raths", "ratio", "ratoo", "ratos", "ratty", "ratus", "rauns", "raupo", "raved",
    "ravel", "raven", "raver", "raves", "ravey", "ravin", "rawer", "rawin", "rawly", "rawns", "raxed", "raxes", "rayah", "rayas", "rayed", "rayle", "rayne", "rayon", "razed", "razee",
    "razer", "razes", "razoo", "razor", "reach", "react", "readd", "reads", "ready", "reais", "reaks", "realm", "realo", "reals", "reame", "reams", "reamy", "reans", "reaps", "rearm",
    "rears", "reast", "reata", "reate", "reave", "rebar", "rebbe", "rebec", "rebel", "rebid", "rebit", "rebop", "rebus", "rebut", "rebuy", "recal", "recap", "recce", "recco", "reccy",
    "recit", "recks", "recon", "recta", "recti", "recto", "recur", "recut", "redan", "redds", "reddy", "reded", "redes", "redia", "redid", "redip", "redly", "redon", "redos", "redox",
    "redry", "redub", "redux", "redye", "reech", "reede", "reeds", "reedy", "reefs", "reefy", "reeks", "reeky", "reels", "reens", "reest", "reeve", "refed", "refel", "refer", "reffo",
    "refis", "refit", "refix", "refly", "refry", "regal", "regar", "reges", "reggo", "regie", "regma", "regna", "regos", "regur", "rehab", "rehem", "reifs", "reify", "reign", "reiki",
    "reiks", "reink", "reins", "reird", "reist", "reive", "rejig", "rejon", "reked", "rekes", "rekey", "relax", "relay", "relet", "relic", "relie", "relit", "rello", "reman", "remap",
    "remen", "remet", "remex", "remit", "remix", "renal", "renay", "rends", "renew", "reney", "renga", "renig", "renin", "renne", "renos", "rente", "rents", "reoil", "reorg", "repay",
    "repeg", "repel", "repin", "repla", "reply", "repos", "repot", "repps", "repro", "reran", "rerig", "rerun", "resat", "resaw", "resay", "resee", "reses", "reset", "resew", "resid",
    "resin", "resit", "resod", "resow", "resto", "rests", "resty", "resus", "retag", "retax", "retch", "retem", "retia", "retie", "retox", "retro", "retry", "reuse", "revel", "revet",
    "revie", "revue", "rewan", "rewax", "rewed", "rewet", "rewin", "rewon", "rewth", "rexes", "rezes", "rheas", "rheme", "rheum", "rhies", "rhime", "rhine", "rhino", "rhody", "rhomb",
    "rhone", "rhumb", "rhyme", "rhyne", "rhyta", "riads", "rials", "riant", "riata", "ribas", "ribby", "ribes", "riced", "ricer", "rices", "ricey", "richt", "ricin", "ricks", "rider",
    "rides", "ridge", "ridgy", "ridic", "riels", "riems", "rieve", "rifer", "riffs", "rifle", "rifte", "rifts", "rifty", "riggs", "right", "rigid", "rigol", "rigor", "riled", "riles",
    "riley", "rille", "rills", "rimae", "rimed", "rimer", "rimes", "rimus", "rinds", "rindy", "rines", "rings", "rinks", "rinse", "rioja", "riots", "riped", "ripen", "riper", "ripes",
    "ripps", "risen", "riser", "rises", "rishi", "risks", "risky", "risps", "risus", "rites", "ritts", "ritzy", "rival", "rivas", "rived", "rivel", "riven", "river", "rives", "rivet",
    "riyal", "rizas", "roach", "roads", "roams", "roans", "roars", "roary", "roast", "roate", "robed", "robes", "robin", "roble", "robot", "rocks", "rocky", "roded", "rodeo", "rodes",
    "roger", "rogue", "roguy", "rohes", "roids", "roils", "roily", "roins", "roist", "rojak", "rojis", "roked", "roker", "rokes", "rolag", "roles", "rolfs", "rolls", "romal", "roman",
    "romeo", "romps", "ronde", "rondo", "roneo", "rones", "ronin", "ronne", "ronte", "ronts", "roods", "roofs", "roofy", "rooks", "rooky", "rooms", "roomy", "roons", "roops", "roopy",
    "roosa", "roose", "roost", "roots", "rooty", "roped", "roper", "ropes", "ropey", "roque", "roral", "rores", "roric", "rorid", "rorie", "rorts", "rorty", "rosed", "roses", "roset",
    "roshi", "rosin", "rosit", "rosti", "rosts", "rotal", "rotan", "rotas", "rotch", "roted", "rotes", "rotis", "rotls", "roton", "rotor", "rotos", "rotte", "rouen", "roues", "rouge",
    "rough", "roule", "rouls", "roums", "round", "roups", "roupy", "rouse", "roust", "route", "routh", "routs", "roved", "roven", "rover", "roves", "rowan", "rowdy", "rowed", "rowel",
    "rowen", "rower", "rowie", "rowme", "rownd", "rowth", "rowts", "royal", "royne", "royst", "rozet", "rozit", "ruana", "rubai", "rubby", "rubel", "rubes", "rubin", "ruble", "rubli",
    "rubus", "ruche", "rucks", "rudas", "rudds", "ruddy", "ruder", "rudes", "rudie", "rudis", "rueda", "ruers", "ruffe", "ruffs", "rugae", "rugal", "rugby", "ruggy", "ruing", "ruins",
    "rukhs", "ruled", "ruler", "rules", "rumal", "rumba", "rumbo", "rumen", "rumes", "rumly", "rummy", "rumor", "rumpo", "rumps", "rumpy", "runch", "runds", "runed", "runes", "rungs",
    "runic", "runny", "runts", "runty", "rupee", "rupia", "rural", "rurps", "rurus", "rusas", "ruses", "rushy", "rusks", "rusma", "russe", "rusts", "rusty", "ruths", "rutin", "rutty",
    "ryals", "rybat", "ryked", "rykes", "rymme", "rynds", "ryots", "ryper", "saags", "sabal", "sabed", "saber", "sabes", "sabha", "sabin", "sabir", "sable", "sabot", "sabra", "sabre",
    "sacks", "sacra", "saddo", "sades", "sadhe", "sadhu", "sadis", "sadly", "sados", "sadza", "safed", "safer", "safes", "sagas", "sager", "sages", "saggy", "sagos", "sagum", "saheb",
    "sahib", "saice", "saick", "saics", "saids", "saiga", "sails", "saims", "saine", "sains", "saint", "sairs", "saist", "saith", "sajou", "sakai", "saker", "sakes", "sakia", "sakis",
    "sakti", "salad", "salal", "salat", "salep", "sales", "salet", "salic", "salix", "salle", "sally", "salmi", "salol", "salon", "salop", "salpa", "salps", "salsa", "salse", "salto",
    "salts", "salty", "salue", "salut", "salve", "salvo", "saman", "samas", "samba", "sambo", "samek", "samel", "samen", "sames", "samey", "samfu", "sammy", "sampi", "samps", "sands",
    "sandy", "saned", "saner", "sanes", "sanga", "sangh", "sango", "sangs", "sanko", "sansa", "santo", "sants", "saola", "sapan", "sapid", "sapor", "sappy", "saran", "sards", "sared",
    "saree", "sarge", "sargo", "sarin", "saris", "sarks", "sarky", "sarod", "saros", "sarus", "saser", "sasin", "sasse", "sassy", "satai", "satay", "sated", "satem", "sates", "satin",
    "satis", "satyr", "sauba", "sauce", "sauch", "saucy", "saugh", "sauls", "sault", "sauna", "saunt", "saury", "saute", "sauts", "saved", "saver", "saves", "savey", "savin", "savor",
    "savoy", "savvy", "sawah", "sawed", "sawer", "saxes", "sayed", "sayer", "sayid", "sayne", "sayon", "sayst", "sazes", "scabs", "scads", "scaff", "scags", "scail", "scala", "scald",
    "scale", "scall", "scalp", "scaly", "scamp", "scams", "scand", "scans", "scant", "scapa", "scape", "scapi", "scare", "scarf", "scarp", "scars", "scart", "scary", "scath", "scats",
    "scatt", "scaud", "scaup", "scaur", "scaws", "sceat", "scena", "scend", "scene", "scent", "schav", "schmo", "schul", "schwa", "scion", "sclim", "scody", "scoff", "scogs", "scold",
    "scone", "scoog", "scoop", "scoot", "scopa", "scope", "scops", "score", "scorn", "scots", "scoug", "scoup", "scour", "scout", "scowl", "scowp", "scows", "scrab", "scrae", "scrag",
    "scram", "scran", "scrap", "scrat", "scraw", "scray", "scree", "screw", "scrim", "scrip", "scrob", "scrod", "scrog", "scrow", "scrub", "scrum", "scuba", "scudi", "scudo", "scuds",
    "scuff", "scuft", "scugs", "sculk", "scull", "sculp", "sculs", "scums", "scups", "scurf", "scurs", "scuse", "scuta", "scute", "scuts", "scuzz", "scyes", "sdayn", "sdein", "seals",
    "seame", "seams", "seamy", "seans", "seare", "sears", "sease", "seats", "seaze", "sebum", "secco", "sechs", "sects", "sedan", "seder", "sedes", "sedge", "sedgy", "sedum", "seeds",
    "seedy", "seeks", "seeld", "seels", "seely", "seems", "seeps", "seepy", "seers", "sefer", "segar", "segni", "segno", "segol", "segos", "segue", "sehri", "seifs", "seils", "seine",
    "seirs", "seise", "seism", "seity", "seiza", "seize", "sekos", "sekts", "selah", "seles", "selfs", "sella", "selle", "sells", "selva", "semee", "semen", "semes", "semie", "semis",
    "senas", "sends", "senes", "sengi", "senna", "senor", "sensa", "sense", "sensi", "sente", "senti", "sents", "senvy", "senza", "sepad", "sepal", "sepia", "sepic", "sepoy", "septa",
    "septs", "serac", "serai", "seral", "sered", "serer", "seres", "serfs", "serge", "seric", "serif", "serin", "serks", "seron", "serow", "serra", "serre", "serrs", "serry", "serum",
    "serve", "servo", "sesey", "sessa", "setae", "setal", "seton", "setts", "setup", "seven", "sever", "sewan", "sewar", "sewed", "sewel", "sewen", "sewer", "sewin", "sexed", "sexer",
    "sexes", "sexto", "sexts", "seyen", "shack", "shade", "shads", "shady", "shaft", "shags", "shahs", "shake", "shako", "shakt", "shaky", "shale", "shall", "shalm", "shalt", "shaly",
    "shama", "shame", "shams", "shand", "shank", "shans", "shape", "shaps", "shard", "share", "shark", "sharn", "sharp", "shash", "shaul", "shave", "shawl", "shawm", "shawn", "shaws",
    "shaya", "shays", "shchi", "sheaf", "sheal", "shear", "sheas", "sheds", "sheel", "sheen", "sheep", "sheer", "sheet", "sheik", "shelf", "shell", "shend", "shent", "sheol", "sherd",
    "shere", "shero", "shets", "sheva", "shewn", "shews", "shiai", "shied", "shiel", "shier", "shies", "shift", "shill", "shily", "shims", "shine", "shins", "shiny", "ships", "shire",
    "shirk", "shirr", "shirs", "shirt", "shish", "shiso", "shist", "shite", "shits", "shiur", "shiva", "shive", "shivs", "shlep", "shlub", "shmek", "shmoe", "shoal", "shoat", "shock",
    "shoed", "shoer", "shoes", "shogi", "shogs", "shoji", "shojo", "shola", "shone", "shook", "shool", "shoon", "shoos", "shoot", "shope", "shops", "shore", "shorl", "shorn", "short",
    "shote", "shots", "shott", "shout", "shove", "showd", "shown", "shows", "showy", "shoyu", "shred", "shrew", "shris", "shrow", "shrub", "shrug", "shtik", "shtum", "shtup", "shuck",
    "shule", "shuln", "shuls", "shuns", "shunt", "shura", "shush", "shute", "shuts", "shwas", "shyer", "shyly", "sials", "sibbs", "sibyl", "sices", "sicht", "sicko", "sicks", "sicky",
    "sidas", "sided", "sider", "sides", "sidha", "sidhe", "sidle", "siege", "sield", "siens", "sient", "sieth", "sieur", "sieve", "sifts", "sighs", "sight", "sigil", "sigla", "sigma",
    "signa", "signs", "sijos", "sikas", "siker", "sikes", "silds", "siled", "silen", "siler", "siles", "silex", "silks", "silky", "sills", "silly", "silos", "silts", "silty", "silva",
    "simar", "simas", "simba", "simis", "simps", "simul", "since", "sinds", "sined", "sines", "sinew", "singe", "sings", "sinhs", "sinks", "sinky", "sinus", "siped", "sipes", "sippy",
    "sired", "siree", "siren", "sires", "sirih", "siris", "siroc", "sirra", "sirup", "sisal", "sises", "sissy", "sista", "sists", "sitar", "sited", "sites", "sithe", "sitka", "situp",
    "situs", "siver", "sixer", "sixes", "sixmo", "sixte", "sixth", "sixty", "sizar", "sized", "sizel", "sizer", "sizes", "skags", "skail", "skald", "skank", "skart", "skate", "skats",
    "skatt", "skaws", "skean", "skear", "skeds", "skeed", "skeef", "skeen", "skeer", "skees", "skeet", "skegg", "skegs", "skein", "skelf", "skell", "skelm", "skelp", "skene", "skens",
    "skeos", "skeps", "skers", "skets", "skews", "skids", "skied", "skier", "skies", "skiey", "skiff", "skill", "skimo", "skimp", "skims", "skink", "skins", "skint", "skios", "skips",
    "skirl", "skirr", "skirt", "skite", "skits", "skive", "skivy", "sklim", "skoal", "skody", "skoff", "skogs", "skols", "skool", "skort", "skosh", "skran", "skrik", "skuas", "skugs",
    "skulk", "skull", "skunk", "skyed", "skyer", "skyey", "skyfs", "skyre", "skyrs", "skyte", "slabs", "slack", "slade", "slaes", "slags", "slaid", "slain", "slake", "slams", "slane",
    "slang", "slank", "slant", "slaps", "slart", "slash", "slate", "slats", "slaty", "slaws", "slays", "slebs", "sleds", "sleek", "sleep", "sleer", "sleet", "slept", "slews", "sleys",
    "slice", "slick", "slide", "slier", "slily", "slime", "slims", "slimy", "sling", "slink", "slipe", "slips", "slipt", "slish", "slits", "slive", "sloan", "slobs", "sloes", "slogs",
    "sloid", "slojd", "slomo", "sloom", "sloop", "sloot", "slope", "slops", "slopy", "slorm", "slosh", "sloth", "slots", "slove", "slows", "sloyd", "slubb", "slubs", "slued", "slues",
    "sluff", "slugs", "sluit", "slump", "slums", "slung", "slunk", "slurb", "slurp", "slurs", "sluse", "slush", "slyer", "slyly", "slype", "smaak", "smack", "smaik", "small", "smalm",
    "smalt", "smarm", "smart", "smash", "smaze", "smear", "smeek", "smees", "smeik", "smeke", "smell", "smelt", "smerk", "smews", "smile", "smirk", "smirr", "smirs", "smite", "smith",
    "smits", "smock", "smogs", "smoke", "smoko", "smoky", "smolt", "smoor", "smoot", "smore", "smorg", "smote", "smout", "smowt", "smugs", "smurs", "smush", "smuts", "snabs", "snack",
    "snafu", "snags", "snail", "snake", "snaky", "snaps", "snare", "snarf", "snark", "snarl", "snars", "snary", "snash", "snath", "snaws", "snead", "sneak", "sneap", "snebs", "sneck",
    "sneds", "sneed", "sneer", "snees", "snell", "snibs", "snick", "snide", "snies", "sniff", "snift", "snigs", "snipe", "snips", "snipy", "snirt", "snits", "snobs", "snods", "snoek",
    "snoep", "snogs", "snoke", "snood", "snook", "snool", "snoop", "snoot", "snore", "snort", "snots", "snout", "snowk", "snows", "snowy", "snubs", "snuck", "snuff", "snugs", "snush",
    "snyes", "soaks", "soaps", "soapy", "soare", "soars", "soave", "sobas", "sober", "socas", "soces", "socko", "socks", "socle", "sodas", "soddy", "sodic", "sodom", "sofar", "sofas",
    "softa", "softs", "softy", "soger", "soggy", "sohur", "soils", "soily", "sojas", "sojus", "sokah", "soken", "sokes", "sokol", "solah", "solan", "solar", "solas", "solde", "soldi",
    "soldo", "solds", "soled", "solei", "soler", "soles", "solid", "solon", "solos", "solum", "solus", "solve", "soman", "somas", "sonar", "sonce", "sonde", "sones", "songs", "sonic",
    "sonly", "sonne", "sonny", "sonse", "sonsy", "sooey", "sooks", "sooky", "soole", "sools", "sooms", "soops", "soote", "sooth", "soots", "sooty", "sophs", "sophy", "sopor", "soppy",
    "sopra", "soral", "soras", "sorbo", "sorbs", "sorda", "sordo", "sords", "sored", "soree", "sorel", "sorer", "sores", "sorex", "sorgo", "sorns", "sorra", "sorry", "sorta", "sorts",
    "sorus", "soths", "sotol", "souce", "souct", "sough", "souks", "souls", "soums", "sound", "soups", "soupy", "sours", "souse", "south", "souts", "sowar", "sowce", "sowed", "sower",
    "sowff", "sowfs", "sowle", "sowls", "sowms", "sownd", "sowne", "sowps", "sowse", "sowth", "soyas", "soyle", "soyuz", "sozin", "space", "spacy", "spade", "spado", "spaed", "spaer",
    "spaes", "spags", "spahi", "spail", "spain", "spait", "spake", "spald", "spale", "spall", "spalt", "spams", "spane", "spang", "spank", "spans", "spard", "spare", "spark", "spars",
    "spart", "spasm", "spate", "spats", "spaul", "spawl", "spawn", "spaws", "spayd", "spays", "spaza", "spazz", "speak", "speal", "spean", "spear", "speat", "speck", "specs", "spect",
    "speed", "speel", "speer", "speil", "speir", "speks", "speld", "spelk", "spell", "spelt", "spend", "spent", "speos", "sperm", "spets", "speug", "spews", "spewy", "spial", "spica",
    "spice", "spicy", "spide", "spied", "spiel", "spier", "spies", "spiff", "spifs", "spike", "spiky", "spile", "spill", "spilt", "spims", "spina", "spine", "spink", "spins", "spiny",
    "spire", "spirt", "spiry", "spite", "spits", "spitz", "spivs", "splat", "splay", "split", "splog", "spode", "spods", "spoil", "spoke", "spoof", "spook", "spool", "spoom", "spoon",
    "spoor", "spoot", "spore", "spork", "sport", "sposh", "spots", "spout", "sprad", "sprag", "sprat", "spray", "spred", "spree", "sprew", "sprig", "sprit", "sprod", "sprog", "sprue",
    "sprug", "spuds", "spued", "spuer", "spues", "spugs", "spule", "spume", "spumy", "spunk", "spurn", "spurs", "spurt", "sputa", "spyal", "spyre", "squab", "squad", "squat", "squaw",
    "squeg", "squib", "squid", "squit", "squiz", "stabs", "stack", "stade", "staff", "stage", "stags", "stagy", "staid", "staig", "stain", "stair", "stake", "stale", "stalk", "stall",
    "stamp", "stand", "stane", "stang", "stank", "staph", "staps", "stare", "stark", "starn", "starr", "stars", "start", "stash", "state", "stats", "staun", "stave", "staws", "stays",
    "stead", "steak", "steal", "steam", "stean", "stear", "stedd", "stede", "steds", "steed", "steek", "steel", "steem", "steen", "steep", "steer", "steil", "stein", "stela", "stele",
    "stell", "steme", "stems", "stend", "steno", "stens", "stent", "steps", "stept", "stere", "stern", "stets", "stews", "stewy", "steys", "stich", "stick", "stied", "sties", "stiff",
    "stilb", "stile", "still", "stilt", "stime", "stims", "stimy", "sting", "stink", "stint", "stipa", "stipe", "stire", "stirk", "stirp", "stirs", "stive", "stivy", "stoae", "stoai",
    "stoas", "stoat", "stobs", "stock", "stoep", "stogy", "stoic", "stoit", "stoke", "stole", "stoln", "stoma", "stomp", "stond", "stone", "stong", "stonk", "stonn", "stony", "stood",
    "stook", "stool", "stoop", "stoor", "stope", "stops", "stopt", "store", "stork", "storm", "story", "stoss", "stots", "stott", "stoun", "stoup", "stour", "stout", "stove", "stown",
    "stowp", "stows", "strad", "strae", "strag", "strak", "strap", "straw", "stray", "strep", "strew", "stria", "strig", "strim", "strip", "strop", "strow", "stroy", "strum", "strut",
    "stubs", "stuck", "stude", "studs", "study", "stuff", "stull", "stulm", "stumm", "stump", "stums", "stung", "stunk", "stuns", "stunt", "stupa", "stupe", "sture", "sturt", "styed",
    "styes", "style", "styli", "stylo", "styme", "stymy", "styre", "styte", "suave", "subah", "subas", "subby", "suber", "subha", "succi", "sucks", "sucky", "sucre", "sudds", "sudor",
    "sudsy", "suede", "suent", "suers", "suete", "suets", "suety", "sugan", "sugar", "sughs", "sugos", "suhur", "suids", "suing", "suint", "suite", "suits", "sujee", "sukhs", "sukuk",
    "sulci", "sulfa", "sulfo", "sulks", "sulky", "sully", "sulph", "sulus", "sumac", "sumis", "summa", "sumos", "sumph", "sumps", "sunis", "sunks", "sunna", "sunns", "sunny", "sunup",
    "super", "supes", "supra", "surah", "sural", "suras", "surat", "surds", "sured", "surer", "sures", "surfs", "surfy", "surge", "surgy", "surly", "surra", "sused", "suses", "sushi",
    "susus", "sutor", "sutra", "sutta", "swabs", "swack", "swads", "swage", "swags", "swail", "swain", "swale", "swaly", "swami", "swamp", "swamy", "swang", "swank", "swans", "swaps",
    "swapt", "sward", "sware", "swarf", "swarm", "swart", "swash", "swath", "swats", "swayl", "sways", "sweal", "swear", "sweat", "swede", "sweed", "sweel", "sweep", "sweer", "swees",
    "sweet", "sweir", "swell", "swelt", "swept", "swerf", "sweys", "swies", "swift", "swigs", "swile", "swill", "swims", "swine", "swing", "swink", "swipe", "swire", "swirl", "swish",
    "swiss", "swith", "swits", "swive", "swizz", "swobs", "swole", "swoln", "swoon", "swoop", "swops", "swopt", "sword", "swore", "sworn", "swots", "swoun", "swung", "sybbe", "sybil",
    "syboe", "sybow", "sycee", "syces", "sycon", "syens", "syker", "sykes", "sylis", "sylph", "sylva", "symar", "synch", "syncs", "synds", "syned", "synes", "synod", "synth", "syped",
    "sypes", "syphs", "syrah", "syren", "syrup", "sysop", "sythe", "syver", "taals", "taata", "tabby", "taber", "tabes", "tabid", "tabis", "tabla", "table", "taboo", "tabor", "tabun",
    "tabus", "tacan", "taces", "tacet", "tache", "tacho", "tachs", "tacit", "tacks", "tacky", "tacos", "tacts", "taels", "taffy", "tafia", "taggy", "tagma", "tahas", "tahrs", "taiga",
    "taigs", "taiko", "tails", "tains", "taint", "taira", "taish", "taits", "tajes", "takas", "taken", "taker", "takes", "takhi", "takin", "takis", "takky", "talak", "talaq", "talar",
    "talas", "talcs", "talcy", "talea", "taler", "tales", "talks", "talky", "talls", "tally", "talma", "talon", "talpa", "taluk", "talus", "tamal", "tamed", "tamer", "tames", "tamin",
    "tamis", "tammy", "tamps", "tanas", "tanga", "tangi", "tango", "tangs", "tangy", "tanhs", "tanka", "tanks", "tanky", "tanna", "tansy", "tanti", "tanto", "tanty", "tapas", "taped",
    "tapen", "taper", "tapes", "tapet", "tapir", "tapis", "tappa", "tapus", "taras", "tardo", "tardy", "tared", "tares", "targa", "targe", "tarns", "taroc", "tarok", "taros", "tarot",
    "tarps", "tarre", "tarry", "tarsi", "tarts", "tarty", "tasar", "tased", "taser", "tases", "tasks", "tassa", "tasse", "tasso", "taste", "tasty", "tatar", "tater", "tates", "taths",
    "tatie", "tatou", "tatts", "tatty", "tatus", "taube", "tauld", "taunt", "tauon", "taupe", "tauts", "tavah", "tavas", "taver", "tawai", "tawas", "tawed", "tawer", "tawie", "tawny",
    "tawse", "tawts", "taxed", "taxer", "taxes", "taxis", "taxol", "taxon", "taxor", "taxus", "tayra", "tazza", "tazze", "teach", "teade", "teads", "teaed", "teaks", "teals", "teams",
    "tears", "teary", "tease", "teats", "teaze", "techs", "techy", "tecta", "teddy", "teels", "teems", "teend", "teene", "teens", "teeny", "teers", "teeth", "teffs", "teggs", "tegua",
    "tegus", "tehrs", "teiid", "teils", "teind", "teins", "telae", "telco", "teles", "telex", "telia", "telic", "tells", "telly", "teloi", "telos", "temed", "temes", "tempi", "tempo",
    "temps", "tempt", "temse", "tench", "tends", "tendu", "tenes", "tenet", "tenge", "tenia", "tenne", "tenno", "tenny", "tenon", "tenor", "tense", "tenth", "tents", "tenty", "tenue",
    "tepal", "tepas", "tepee", "tepid", "tepoy", "terai", "teras", "terce", "terek", "teres", "terfe", "terfs", "terga", "terms", "terne", "terns", "terra", "terry", "terse", "terts",
    "tesla", "testa", "teste", "tests", "testy", "tetes", "teths", "tetra", "tetri", "teuch", "teugh", "tewed", "tewel", "tewit", "texas", "texes", "texts", "thack", "thagi", "thaim",
    "thale", "thali", "thana", "thane", "thang", "thank", "thans", "thanx", "tharm", "thars", "thaws", "thawy", "thebe", "theca", "theed", "theek", "thees", "theft", "thegn", "theic",
    "thein", "their", "thelf", "thema", "theme", "thens", "theow", "there", "therm", "these", "thesp", "theta", "thete", "thews", "thewy", "thick", "thief", "thigh", "thigs", "thilk",
    "thill", "thine", "thing", "think", "thins", "thiol", "third", "thirl", "thoft", "thole", "tholi", "thong", "thorn", "thoro", "thorp", "those", "thous", "thowl", "thrae", "thraw",
    "three", "threw", "thrid", "thrip", "throb", "throe", "throw", "thrum", "thuds", "thugs", "thuja", "thumb", "thump", "thunk", "thurl", "thuya", "thyme", "thymi", "thymy", "tians",
    "tiara", "tiars", "tibia", "tical", "ticca", "ticed", "tices", "tichy", "ticks", "ticky", "tidal", "tiddy", "tided", "tides", "tiers", "tiffs", "tifos", "tifts", "tiger", "tiges",
    "tight", "tigon", "tikas", "tikes", "tikis", "tikka", "tilak", "tilde", "tiled", "tiler", "tiles", "tills", "tilly", "tilth", "tilts", "timbo", "timed", "timer", "times", "timid",
    "timon", "timps", "tinas", "tinct", "tinds", "tinea", "tined", "tines", "tinge", "tings", "tinks", "tinny", "tints", "tinty", "tipis", "tippy", "tipsy", "tired", "tires", "tirls",
    "tiros", "tirrs", "titan", "titch", "titer", "tithe", "titis", "title", "titre", "titty", "titup", "tiyin", "tiyns", "tizes", "tizzy", "toads", "toady", "toast", "toaze", "tocks",
    "tocky", "tocos", "today", "todde", "toddy", "toeas", "toffs", "toffy", "tofts", "tofus", "togae", "togas", "toged", "toges", "togue", "tohos", "toile", "toils", "toing", "toise",
    "toits", "tokay", "toked", "token", "toker", "tokes", "tokos", "tolan", "tolar", "tolas", "toled", "toles", "tolls", "tolly", "tolts", "tolus", "tolyl", "toman", "tombs", "tomes",
    "tomia", "tommy", "tomos", "tonal", "tondi", "tondo", "toned", "toner", "tones", "toney", "tonga", "tongs", "tonic", "tonka", "tonks", "tonne", "tonus", "tools", "tooms", "toons",
    "tooth", "toots", "topaz", "toped", "topee", "topek", "toper", "topes", "tophe", "tophi", "tophs", "topic", "topis", "topoi", "topos", "toppy", "toque", "torah", "toran", "toras",
    "torch", "torcs", "tores", "toric", "torii", "toros", "torot", "torrs", "torse", "torsi", "torsk", "torso", "torta", "torte", "torts", "torus", "tosas", "tosed", "toses", "toshy",
    "tossy", "total", "toted", "totem", "toter", "totes", "totty", "touch", "tough", "touks", "touns", "tours", "touse", "tousy", "touts", "touze", "touzy", "towed", "towel", "tower",
    "towie", "towns", "towny", "towse", "towsy", "towts", "towze", "towzy", "toxic", "toxin", "toyed", "toyer", "toyon", "toyos", "tozed", "tozes", "tozie", "trabs", "trace", "track",
    "tract", "trade", "trads", "tragi", "traik", "trail", "train", "trait", "tramp", "trams", "trank", "tranq", "trans", "trant", "trape", "traps", "trapt", "trash", "trass", "trats",
    "tratt", "trave", "trawl", "trayf", "trays", "tread", "treat", "treck", "treed", "treen", "trees", "trefa", "treif", "treks", "trema", "trems", "trend", "tress", "trest", "trets",
    "trews", "treyf", "treys", "triac", "triad", "trial", "tribe", "trice", "trick", "tride", "tried", "trier", "tries", "triff", "trigo", "trigs", "trike", "trild", "trill", "trims",
    "trine", "trins", "triol", "trior", "trios", "tripe", "trips", "tripy", "trist", "trite", "troad", "troak", "troat", "trock", "trode", "trods", "trogs", "trois", "troke", "troll",
    "tromp", "trona", "tronc", "trone", "tronk", "trons", "troop", "trooz", "trope", "troth", "trots", "trout", "trove", "trows", "troys", "truce", "truck", "trued", "truer", "trues",
    "trugo", "trugs", "trull", "truly", "trump", "trunk", "truss", "trust", "truth", "tryer", "tryke", "tryma", "tryps", "tryst", "tsade", "tsadi", "tsars", "tsked", "tsuba", "tsubo",
    "tuans", "tuart", "tuath", "tubae", "tubal", "tubar", "tubas", "tubby", "tubed", "tuber", "tubes", "tucks", "tufas", "tuffe", "tuffs", "tufts", "tufty", "tugra", "tuile", "tuina",
    "tuism", "tuktu", "tules", "tulip", "tulle", "tulpa", "tulsi", "tumid", "tummy", "tumor", "tumps", "tumpy", "tunas", "tunds", "tuned", "tuner", "tunes", "tungs", "tunic", "tunny",
    "tupek", "tupik", "tuple", "tuque", "turbo", "turds", "turfs", "turfy", "turks", "turme", "turms", "turns", "turnt", "turps", "turrs", "tushy", "tusks", "tusky", "tutee", "tutor",
    "tutti", "tutty", "tutus", "tuxes", "tuyer", "twaes", "twain", "twals", "twang", "twank", "twats", "tways", "tweak", "tweed", "tweel", "tween", "tweep", "tweer", "tweet", "twerk",
    "twerp", "twice", "twier", "twigs", "twill", "twilt", "twine", "twink", "twins", "twiny", "twire", "twirl", "twirp", "twist", "twite", "twits", "twixt", "twoer", "twyer", "tyees",
    "tyers", "tying", "tyiyn", "tykes", "tyler", "tymps", "tynde", "tyned", "tynes", "typal", "typed", "types", "typey", "typic", "typos", "typps", "typto", "tyran", "tyred", "tyres",
    "tyros", "tythe", "tzars", "udals", "udder", "udons", "ugali", "ugged", "uhlan", "uhuru", "ukase", "ulama", "ulans", "ulcer", "ulema", "ulmin", "ulnad", "ulnae", "ulnar", "ulnas",
    "ulpan", "ultra", "ulvas", "ulyie", "ulzie", "umami", "umbel", "umber", "umble", "umbos", "umbra", "umbre", "umiac", "umiak", "umiaq", "ummah", "ummas", "ummed", "umped", "umphs",
    "umpie", "umpty", "umrah", "umras", "unais", "unapt", "unarm", "unary", "unaus", "unbag", "unban", "unbar", "unbed", "unbid", "unbox", "uncap", "unces", "uncia", "uncle", "uncos",
    "uncoy", "uncus", "uncut", "undam", "undee", "under", "undid", "undos", "undue", "undug", "uneth", "unfed", "unfit", "unfix", "ungag", "unget", "ungod", "ungot", "ungum", "unhat",
    "unhip", "unica", "unify", "union", "unite", "units", "unity", "unjam", "unked", "unket", "unkid", "unlaw", "unlay", "unled", "unlet", "unlid", "unlit", "unman", "unmet", "unmew",
    "unmix", "unpay", "unpeg", "unpen", "unpin", "unred", "unrid", "unrig", "unrip", "unsaw", "unsay", "unsee", "unset", "unsew", "unsex", "unsod", "untax", "untie", "until", "untin",
    "unwed", "unwet", "unwit", "unwon", "unzip", "upbow", "upbye", "updos", "updry", "upend", "upjet", "uplay", "upled", "uplit", "upped", "upper", "upran", "uprun", "upsee", "upset",
    "upsey", "uptak", "upter", "uptie", "uraei", "urali", "uraos", "urare", "urari", "urase", "urate", "urban", "urbex", "urbia", "urdee", "ureal", "ureas", "uredo", "ureic", "urena",
    "urent", "urged", "urger", "urges", "urial", "urine", "urite", "urman", "urnal", "urned", "urped", "ursae", "ursid", "urson", "urubu", "urvas", "usage", "users", "usher", "using",
    "usnea", "usque", "usual", "usure", "usurp", "usury", "uteri", "utile", "utter", "uveal", "uveas", "uvula", "vacua", "vaded", "vades", "vagal", "vague", "vagus", "vails", "vaire",
    "vairs", "vairy", "vakas", "vakil", "vales", "valet", "valid", "valis", "valor", "valse", "value", "valve", "vamps", "vampy", "vanda", "vaned", "vanes", "vangs", "vants", "vaped",
    "vaper", "vapes", "vapid", "vapor", "varan", "varas", "vardy", "varec", "vares", "varia", "varix", "varna", "varus", "varve", "vasal", "vases", "vasts", "vasty", "vatic", "vatus",
    "vauch", "vault", "vaunt", "vaute", "vauts", "vawte", "vaxes", "veale", "veals", "vealy", "veena", "veeps", "veers", "veery", "vegan", "vegas", "veges", "vegie", "vegos", "vehme",
    "veils", "veily", "veins", "veiny", "velar", "velds", "veldt", "veles", "vells", "velum", "venae", "venal", "vends", "vendu", "veney", "venge", "venin", "venom", "vents", "venue",
    "venus", "verbs", "verge", "verra", "verry", "verse", "verso", "verst", "verts", "vertu", "verve", "vespa", "vesta", "vests", "vetch", "vexed", "vexer", "vexes", "vexil", "vezir",
    "vials", "viand", "vibes", "vibex", "vibey", "vicar", "viced", "vices", "vichy", "video", "viers", "views", "viewy", "vifda", "viffs", "vigas", "vigia", "vigil", "vigor", "vilde",
    "viler", "villa", "villi", "vills", "vimen", "vinal", "vinas", "vinca", "vined", "viner", "vines", "vinew", "vinic", "vinos", "vints", "vinyl", "viola", "viold", "viols", "viper",
    "viral", "vired", "vireo", "vires", "virga", "virge", "virid", "virls", "virtu", "virus", "visas", "vised", "vises", "visie", "visit", "visne", "vison", "visor", "vista", "visto",
    "vitae", "vital", "vitas", "vitex", "vitro", "vitta", "vivas", "vivat", "vivda", "viver", "vives", "vivid", "vixen", "vizir", "vizor", "vleis", "vlies", "vlogs", "voars", "vocab",
    "vocal", "voces", "voddy", "vodka", "vodou", "vodun", "voema", "vogie", "vogue", "voice", "voids", "voila", "voile", "voips", "volae", "volar", "voled", "voles", "volet", "volks",
    "volta", "volte", "volti", "volts", "volva", "volve", "vomer", "vomit", "voted", "voter", "votes", "vouch", "vouge", "voulu", "vowed", "vowel", "vower", "voxel", "vozhd", "vraic",
    "vrils", "vroom", "vrous", "vrouw", "vrows", "vuggs", "vuggy", "vughs", "vughy", "vulgo", "vulns", "vulva", "vutty", "vying", "waacs", "wacke", "wacko", "wacks", "wacky", "wadds",
    "waddy", "waded", "wader", "wades", "wadge", "wadis", "wadts", "wafer", "waffs", "wafts", "waged", "wager", "wages", "wagga", "wagon", "wagyu", "wahoo", "waide", "waifs", "waift",
    "wails", "wains", "wairs", "waist", "waite", "waits", "waive", "wakas", "waked", "waken", "waker", "wakes", "wakfs", "waldo", "walds", "waled", "waler", "wales", "walie", "walis",
    "walks", "walla", "walls", "wally", "walty", "waltz", "wamed", "wames", "wamus", "wands", "waned", "wanes", "waney", "wangs", "wanks", "wanky", "wanle", "wanly", "wanna", "wants",
    "wanty", "wanze", "waqfs", "warbs", "warby", "wards", "wared", "wares", "warez", "warks", "warms", "warns", "warps", "warre", "warst", "warts", "warty", "wases", "washy", "wasms",
    "wasps", "waspy", "waste", "wasts", "watap", "watch", "water", "watts", "wauff", "waugh", "wauks", "waulk", "wauls", "waurs", "waved", "waver", "waves", "wavey", "wawas", "wawes",
    "wawls", "waxed", "waxen", "waxer", "waxes", "wayed", "wazir", "wazoo", "weald", "weals", "weamb", "weans", "wears", "weary", "weave", "webby", "weber", "wecht", "wedel", "wedge",
    "wedgy", "weeds", "weedy", "weeke", "weeks", "weels", "weems", "weens", "weeny", "weeps", "weepy", "weest", "weete", "weets", "wefte", "wefts", "weids", "weigh", "weils", "weird",
    "weirs", "weise", "weize", "wekas", "welch", "welds", "welke", "welks", "welkt", "wells", "welly", "welsh", "welts", "wembs", "wends", "wenge", "wenny", "wents", "weros", "wersh",
    "wests", "wetas", "wetly", "wexed", "wexes", "whack", "whale", "whamo", "whams", "whang", "whaps", "whare", "wharf", "whata", "whats", "whaup", "whaur", "wheal", "whear", "wheat",
    "wheel", "wheen", "wheep", "wheft", "whelk", "whelm", "whelp", "whens", "where", "whets", "whews", "wheys", "which", "whids", "whiff", "whift", "whigs", "while", "whilk", "whims",
    "whine", "whins", "whiny", "whios", "whips", "whipt", "whirl", "whirr", "whirs", "whish", "whisk", "whiss", "whist", "white", "whits", "whity", "whizz", "whole", "whomp", "whoof",
    "whoop", "whoot", "whops", "whorl", "whort", "whose", "whoso", "whows", "whump", "whups", "whyda", "wicca", "wicks", "wicky", "widdy", "widen", "wider", "wides", "widow", "width",
    "wield", "wiels", "wifed", "wifes", "wifey", "wifie", "wifty", "wigan", "wigga", "wiggy", "wight", "wikis", "wilco", "wilds", "wiled", "wiles", "wilga", "wilis", "wilja", "wills",
    "willy", "wilts", "wimps", "wimpy", "wince", "winch", "winds", "windy", "wined", "wines", "winey", "winge", "wings", "wingy", "winks", "winna", "winns", "winos", "winze", "wiped",
    "wiper", "wipes", "wired", "wirer", "wires", "wirra", "wised", "wiser", "wises", "wisha", "wisht", "wisps", "wispy", "wists", "witan", "witch", "wited", "wites", "withe", "withs",
    "withy", "witty", "wived", "wiver", "wives", "wizen", "wizes", "woads", "woald", "wocks", "wodge", "woful", "wojus", "woken", "woker", "wokka", "wolds", "wolfs", "wolly", "wolve",
    "woman", "wombs", "womby", "women", "womyn", "wonga", "wongi", "wonks", "wonky", "wonts", "woods", "woody", "wooed", "wooer", "woofs", "woofy", "woold", "wools", "wooly", "woons",
    "woops", "woopy", "woose", "woosh", "wootz", "woozy", "words", "wordy", "works", "world", "worms", "wormy", "worry", "worse", "worst", "worth", "worts", "would", "wound", "woven",
    "wowed", "wowee", "woxen", "wrack", "wrang", "wraps", "wrapt", "wrast", "wrate", "wrath", "wrawl", "wreak", "wreck", "wrens", "wrest", "wrick", "wried", "wrier", "wries", "wring",
    "wrist", "write", "writs", "wroke", "wrong", "wroot", "wrote", "wroth", "wrung", "wryer", "wryly", "wuddy", "wudus", "wulls", "wurst", "wuses", "wushu", "wussy", "wuxia", "wyled",
    "wyles", "wynds", "wynns", "wyted", "wytes", "xebec", "xenia", "xenic", "xenon", "xeric", "xerox", "xerus", "xoana", "xrays", "xylan", "xylem", "xylic", "xylol", "xylyl", "xysti",
    "xysts", "yaars", "yabas", "yabba", "yabby", "yacca", "yacht", "yacka", "yacks", "yaffs", "yager", "yages", "yagis", "yahoo", "yaird", "yakka", "yakow", "yales", "yamen", "yampy",
    "yamun", "yangs", "yanks", "yapok", "yapon", "yapps", "yappy", "yarak", "yarco", "yards", "yarer", "yarfa", "yarks", "yarns", "yarrs", "yarta", "yarto", "yates", "yauds", "yauld",
    "yaups", "yawed", "yawey", "yawls", "yawns", "yawny", "yawps", "ybore", "yclad", "ycled", "ycond", "ydrad", "ydred", "yeads", "yeahs", "yealm", "yeans", "yeard", "yearn", "years",
    "yeast", "yecch", "yechs", "yechy", "yedes", "yeeds", "yeesh", "yeggs", "yelks", "yells", "yelms", "yelps", "yelts", "yenta", "yente", "yerba", "yerds", "yerks", "yeses", "yesks",
    "yests", "yesty", "yetis", "yetts", "yeuks", "yeuky", "yeven", "yeves", "yewen", "yexed", "yexes", "yfere", "yield", "yiked", "yikes", "yills", "yince", "yipes", "yippy", "yirds",
    "yirks", "yirrs", "yirth", "yites", "yitie", "ylems", "ylike", "ylkes", "ymolt", "ympes", "yobbo", "yobby", "yocks", "yodel", "yodhs", "yodle", "yogas", "yogee", "yoghs", "yogic",
    "yogin", "yogis", "yoick", "yojan", "yoked", "yokel", "yoker", "yokes", "yokul", "yolks", "yolky", "yomim", "yomps", "yonic", "yonis", "yonks", "yoofs", "yoops", "yores", "yorks",
    "yorps", "youks", "young", "yourn", "yours", "yourt", "youse", "youth", "yowed", "yowes", "yowie", "yowls", "yowza", "yrapt", "yrent", "yrivd", "yrneh", "ysame", "ytost", "yuans",
    "yucas", "yucca", "yucch", "yucko", "yucks", "yucky", "yufts", "yugas", "yuked", "yukes", "yukky", "yukos", "yulan", "yules", "yummo", "yummy", "yumps", "yupon", "yuppy", "yurta",
    "yurts", "yuzus", "zabra", "zacks", "zaida", "zaidy", "zaire", "zakat", "zaman", "zambo", "zamia", "zanja", "zante", "zanza", "zanze", "zappy", "zarfs", "zaris", "zatis", "zaxes",
    "zayin", "zazen", "zeals", "zebec", "zebra", "zebub", "zebus", "zedas", "zeins", "zendo", "zerda", "zerks", "zeros", "zests", "zesty", "zetas", "zexes", "zezes", "zhomo", "zibet",
    "ziffs", "zigan", "zilas", "zilch", "zilla", "zills", "zimbi", "zimbs", "zinco", "zincs", "zincy", "zineb", "zines", "zings", "zingy", "zinke", "zinky", "zippo", "zippy", "ziram",
    "zitis", "zizel", "zizit", "zlote", "zloty", "zoaea", "zobos", "zobus", "zocco", "zoeae", "zoeal", "zoeas", "zoism", "zoist", "zombi", "zonae", "zonal", "zonda", "zoned", "zoner",
    "zones", "zonks", "zooea", "zooey", "zooid", "zooks", "zooms", "zoons", "zooty", "zoppa", "zoppo", "zoril", "zoris", "zorro", "zouks", "zowee", "zowie", "zulus", "zupan", "zupas",
    "zuppa", "zurfs", "zuzim", "zygal", "zygon", "zymes", "zymic"
];
const words = word.length;                                                              // words in dictionary

// Guess words
const entry =    ["",      "",      "",      "",      "",      ""     ];                // entry[n][l]    is the entry character at letter l of guess n
const entryHue = ["gbbbg", "bbgbb", "gbbbg", "gbbbg", "bbgbb", "gbbbg"];                // entryHue[n][l] is the entry hue       at letter l of guess n
const test =     ["goulm", "tmiuk", "ysdry", "getry", "uaiod", "mmkuy"];                // test[n][l]     is the test  character at letter l of guess n
const testHue =  ["gyyyg", "ybgby", "gbybg", "gbybg", "ybgyy", "gbybg"];                // testHue[n][l]  is the test  hue       at letter l of guess n
const final =    ["",      "",      "",      "",      "",      ""     ];                // final[n][l]    is the final character at letter l of guess n

// Conversion tables
const nl2t = [                                                                          // nl2t[n][l] is the tile index for letter l of guess n
    [ 0,  1,  2,  3,  4],
    [ 8,  9, 10, 11, 12],
    [16, 17, 18, 19, 20],
    [ 0,  5,  8, 13, 16],
    [ 2,  6, 10, 14, 18],
    [ 4,  7, 12, 15, 20]
];

const nl2p = [                                                                          // nl2p[n][l] is true if letter l of guess n is a primary mapping (non-dupe)
    [ true, true,  true, true,  true], 
    [ true, true,  true, true,  true], 
    [ true, true,  true, true,  true], 
    [false, true, false, true, false],
    [false, true, false, true, false],
    [false, true, false, true, false]
];

const rc2t = [                                                                          // rc2t[r][c] is the tile index for column c of row r (or -1 if no tile index)
    [ 0,  1,  2,  3,  4],
    [ 5, -1,  6, -1,  7],
    [ 8,  9, 10, 11, 12],
    [13, -1, 14, -1, 15],
    [16, 17, 18, 19, 20]
];

const t2n = [                                                                           // t2n[t] is the primary guess number for tile t
    R1, R1, R1, R1, R1,  
    C1,     C3,     C5,
    R3, R3, R3, R3, R3,
    C1,     C3,     C5,
    R5, R5, R5, R5, R5
];

const t2l = [                                                                           // t2l[t] is the primary guess letter for tile t
    L1, L2, L3, L4, L5,
    L2,     L2,     L2,
    L1, L2, L3, L4, L5,
    L4,     L4,     L4,
    L1, L2, L3, L4, L5
];

const moves = 420;                                                                      // 420 possible moves: 0..209 double greens; 210..419 single greens
const single = 210;                                                                     // 210 is the first possible single green move
const m2st = [                                                                          // m2st[m] is the source tile for move m
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
        1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,
            2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  
                3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  
                    4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  
                        5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  
                            6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  
                                7,  7,  7,  7,  7,  7,  7,  7,  7,  7,  7,  7,  7,  
                                    8,  8,  8,  8,  8,  8,  8,  8,  8,  8,  8,  8,  
                                        9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  
                                            10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 
                                                11, 11, 11, 11, 11, 11, 11, 11, 11, 
                                                    12, 12, 12, 12, 12, 12, 12, 12, 
                                                        13, 13, 13, 13, 13, 13, 13, 
                                                            14, 14, 14, 14, 14, 14, 
                                                                15, 15, 15, 15, 15, 
                                                                    16, 16, 16, 16, 
                                                                        17, 17, 17, 
                                                                            18, 18, 
                                                                                19,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
        1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,
            2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  
                3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  
                    4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  
                        5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  
                            6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  
                                7,  7,  7,  7,  7,  7,  7,  7,  7,  7,  7,  7,  7,  
                                    8,  8,  8,  8,  8,  8,  8,  8,  8,  8,  8,  8,  
                                        9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  
                                            10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 
                                                11, 11, 11, 11, 11, 11, 11, 11, 11, 
                                                    12, 12, 12, 12, 12, 12, 12, 12, 
                                                        13, 13, 13, 13, 13, 13, 13, 
                                                            14, 14, 14, 14, 14, 14, 
                                                                15, 15, 15, 15, 15, 
                                                                    16, 16, 16, 16, 
                                                                        17, 17, 17, 
                                                                            18, 18, 
                                                                                19
];

const m2dt = [                                                                          // m2st[m] is the destinaton tile for move m
    1,  2,  3,  4,  5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        2,  3,  4,  5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
            3,  4,  5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                4,  5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                    5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                        6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                            7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                                8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                                    9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                                        10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                                            11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                                                12, 13, 14, 15, 16, 17, 18, 19, 20,
                                                    13, 14, 15, 16, 17, 18, 19, 20,
                                                        14, 15, 16, 17, 18, 19, 20,
                                                            15, 16, 17, 18, 19, 20,
                                                                16, 17, 18, 19, 20,
                                                                    17, 18, 19, 20,
                                                                        18, 19, 20,
                                                                            19, 20,
                                                                                20,
    1,  2,  3,  4,  5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        2,  3,  4,  5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
            3,  4,  5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                4,  5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                    5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                        6,  7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                            7,  8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                                8,  9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                                    9,  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                                        10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                                            11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                                                12, 13, 14, 15, 16, 17, 18, 19, 20,
                                                    13, 14, 15, 16, 17, 18, 19, 20,
                                                        14, 15, 16, 17, 18, 19, 20,
                                                            15, 16, 17, 18, 19, 20,
                                                                16, 17, 18, 19, 20,
                                                                    17, 18, 19, 20,
                                                                        18, 19, 20,
                                                                            19, 20,
                                                                                20
];

// Text entry values
const keys = 27;
const backSpace = 26;
let cursor = 0;

// getMoves variables
const curC = ["","","","","","","","","","","","","","","","","","","","",""];          // curC[t] is the current character for tile t
const finC = ["","","","","","","","","","","","","","","","","","","","",""];          // finC[t] is the final   character for tile t
const move = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];                                            // move[m] is the move index for move m

// Navigation values
let state = "Letters";                                                                  // start in the "Enter Letters" state
let number = 1;                                                                         // start number at one
let foundFinal = false;                                                                 // start with final guess words not yet found
let foundMoves = false;                                                                 // start with moves not yet found

// Eliminate words based on entry characters and entry hues
function phase1(wp, cw, cp) {
    let ye, ng;
    for (let n = R1; n <= C5; n++) {                                                    // for each entry number,
        for (let l = L1; l <= L5; l++) {                                                    // for each entry letter,
            for (let w = 0; w < words; w++) {                                                   // for each word index,
                switch (entryHue[n][l]) {
                case "g":                                                                           // if this entry hue is green,
                    if (word[w][l] != entry[n][l]) wp[w][n] = false;                                    // if this word character doesn't match this entry character, this word is impossible
                    break;
                case "y":                                                                           // if this entry hue is yellow,
                    if (word[w][l] == entry[n][l]) wp[w][n] = false;                                    // if this word character matches this entry character, this word is impossible
                    else {                                                                              // otherwise,
                        ye = 0;                                                                             // count non-intersecting yellow entry letters that match this yellow entry letter
                        ng = 0;                                                                             // count non-green word letters that match this yellow entry letter
                        for (let p = L1; p <= L5; p++) {
                            if ((p == L2 || p == L4) && entryHue[n][p] == "y" && entry[n][p] == entry[n][l]) ye++;
                            if (entryHue[n][p] != "g" && word[w][p] == entry[n][l]) ng++;
                        };
                        if (ye > ng) wp[w][n] = false;                                                      // if yellow count is greater than non-green count, this word is impossible
                    };
                    break;
                case "b":                                                                           // if this entry hue is blank,
                    if (word[w][l] == entry[n][l]) wp[w][n] = false;                                    // if this word character matches this entry character, this word is impossible
                    else {                                                                              // otherwise,
                        ye = 0;                                                                             // count yellow entry letters that match this blank entry letter
                        ng = 0;                                                                             // count non-green word letters that match this blank entry letter
                        for (let p = L1; p <= L5; p++) {
                            if (entryHue[n][p] == "y" && entry[n][p] == entry[n][l]) ye++;
                            if (entryHue[n][p] != "g" && word[w][p] == entry[n][l]) ng++;
                        };
                        if (ng > ye) wp[w][n] = false;                                                      // if non-green count is greater than yellow count, this word is impossible
                    };
                };
            };
        };
    };
    for (let n = R1; n <= C5; n++) {                                                    // populate current words table and current possibilities array
        cp[n] = 0;
        for (let w = 0; w < words; w++) {
            cw[w][n] = "";
            if (wp[w][n]) {
                cw[cp[n]][n] = word[w];
                cp[n]++;
            };
        };
    };
};

// Eliminate words by letter counts
function phase2(wp, cw, cp) {
    let ac;
    const ea = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];                   // count ascii codes of available (primary, non-green) entry characters (e.g. ea[0] is number of a's in all entries)
    for (let n = R1; n <= C5; n++) {                                                    // for each entry number,
        for (let l = L1; l <= L5; l++) {                                                    // for each entry letter,
            if (l < entry[n].length && nl2p[n][l] && entryHue[n][l] != "g") {                   // if letter is in range, this entry letter is primary, and this entry hue isn't green,
                ea[entry[n][l].charCodeAt() - asca]++;                                          // increment the corresponding ascii count
            };
        };
    };
    const wa = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];                   // count ascii codes of non-green word characters (e.g. wa[0] is number of a's in a word)
    for (let n = R1; n <= C5; n++) {                                                    // For each entry number,
        for (let w = 0; w < words; w++) {                                               // for each word index,
            if (!wp[w][n]) continue;                                                            // if this word is not possible, skip it
            wa.fill(0);                                                                         // count ascii codes of non-green characters in this word
            for (let l = L1; l <= L5; l++) {
                if (word[w][l] != entry[n][l]) {
                    wa[word[w][l].charCodeAt() - asca]++;
                };
            };
            for (let a = 0; a <= ascz - asca; a++) {                                            // if this word requires any more codes than the entries provide, mark this word as impossible
                if (wa[a] > ea[a]) {
                    wp[w][n] = false;                                                                   // note that this word is impossible
                    break;
                };
            };
        };
    };
    for (let n = R1; n <= C5; n++) {                                                    // populate current words table and current possibilities array
        cp[n] = 0;
        for (let w = 0; w < words; w++) {
            cw[w][n] = "";
            if (wp[w][n]) {
                cw[cp[n]][n] = word[w];
                cp[n]++;
            };
        };
    };
};

// Eliminate words by intersection conflicts
function phase3(cw, cp) {
    let cf;                                                                             // conflict found is true if a conflict was found in this pass
    let xn;                                                                             // intersecting guess number from R1 to C5
    let xl;                                                                             // intersecting guess letter from L1 to L5
    let pi;                                                                             // possible word index
    do {                                                                                // Do while conflicts are found,
        cf = false;                                                                         // no conflict found (yet)
        for (let n = R1; n <= C5; n++) {                                                    // For each guess number,
            if (cp[n] != 1) continue;                                                           // if more or less than one possible word for this guess number, move on to next guess number
            for (let l = L1; l <= L5; l += 2) {                                                 // for each intersecting guess letter,
                switch (n) {                                                                        // calculate intersecting guess number and intersecting guess letter
                case R1:
                    switch (l) {case L1: xn = C1; break; case L3: xn = C3; break; case L5: xn = C5};
                    xl = L1;
                    break;
                case R3:
                    switch (l) {case L1: xn = C1; break; case L3: xn = C3; break; case L5: xn = C5};
                    xl = L3;
                    break;
                case R5:
                    switch (l) {case L1: xn = C1; break; case L3: xn = C3; break; case L5: xn = C5};
                    xl = L5;
                    break;
                case C1:
                    switch (l) {case L1: xn = R1; break; case L3: xn = R3; break; case L5: xn = R5};
                    xl = L1;
                    break;
                case C3:
                    switch (l) {case L1: xn = R1; break; case L3: xn = R3; break; case L5: xn = R5};
                    xl = L3;
                    break;
                case C5:
                    switch (l) {case L1: xn = R1; break; case L3: xn = R3; break; case L5: xn = R5};
                    xl = L5;
                };
                pi = 0;
                while (pi < cp[xn]) {                                                               // for each possible word of the intersecting guess number,
                    if (cw[pi][xn][xl] == cw[0][n][l]) pi++;                                            // if the intersecting letters match, move on to the next possible word
                    else {                                                                              // otherwise,
                        cf = true;                                                                          // note conflict was found
                        for (let p2 = pi; p2 < cp[xn]; p2++) {                                              // eliminate the impossible word
                            cw[p2][xn] = cw[p2 + 1][xn];
                        };
                        cp[xn]--;                                                                           // note one less possible word
                    };
                };
            };
        };
    } while (cf == true);
};

// Count the primary character codes in wordArray; return "<#a's>, <#b's>, ... <#z's>"
function codeCount(guess) {
    const ca = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];                   // code count array where ca[0] is the count of a's in the guess words
    for (let n = R1; n <= C5; n++) {                                                    // for guess number,
        for (let l = L1; l <= L5; l++) {                                                    // for each guess letter,
            if (l < guess[n].length && nl2p[n][l]) ca[guess[n][l].charCodeAt() - asca]++;       // if this letter is in range and this guess letter is primary, increment corresponding code count
        };
    };
    return ca.toString();                                                               // return "<#a's>, <#b's>, ... <#z's>" in the wordArray
};

// Identify solutions where the duplicates match and the letters are some scramble of the guess letters
function phase4(cw, cp, sw) {
    let R1w, R3w, R5w, C1w, C3w, C5w;
    const es = codeCount(entry);                                                        // entry string is "<#a's>, <#b's>, ... <#z's>" in the entry words
    for (let R1i = 0; R1i < cp[R1]; R1i++) {
        R1w = cw[R1i][R1];
        for (let R3i = 0; R3i < cp[R3]; R3i++) {
            R3w = cw[R3i][R3];
            for (let R5i = 0; R5i < cp[R5]; R5i++) {
                R5w = cw[R5i][R5];
                for (let C1i = 0; C1i < cp[C1]; C1i++) {
                    C1w = cw[C1i][C1];
                    for (let C3i = 0; C3i < cp[C3]; C3i++) {
                        C3w = cw[C3i][C3];
                        for (let C5i = 0; C5i < cp[C5]; C5i++) {
                            C5w = cw[C5i][C5];
                            if (codeCount ([R1w, R3w, R5w, C1w, C3w, C5w]) == es                                // if this code count string matches the entry code count string ...
                                && R1w[L1] == C1w[L1] && R1w[L3] == C3w[L1] && R1w[L5] == C5w[L1]               // ... and the secondaries match the primaries,
                                && R3w[L1] == C1w[L3] && R3w[L3] == C3w[L3] && R3w[L5] == C5w[L3] 
                                && R5w[L1] == C1w[L5] && R5w[L3] == C3w[L5] && R5w[L5] == C5w[L5]) {
                                sw.push([R1w, R3w, R5w, C1w, C3w, C5w]);                                            // push this 6-word solution to the solution words array
                            };
                        };
                    };
                };
            };
        };
    };
};
    
// Eliminate solutions that violate yellow intersection rule
function phase5(sw) {
    let nr, nf, xn, xc;
    let i = 0;                                                                          // solution index
    while (i < sw.length) {                                                             // while solution index is in range,
        nr = 0;                                                                             // initialize number required for this solution
        nf = 0;                                                                             // initialize number found for this solution
        for (let n = R1; n <= C5; n++) {                                                    // for each guess number,
            for (let l = L1; l <= L5; l += 2) {                                                 // for each intersecting guess letter,
                if (entryHue[n][l] != "y") continue;                                                // if intersection isn't yellow, move on to next intersection
                switch (n) {                                                                        // calculate intersecting guess number
                case R1:
                case R3:
                case R5:
                    switch (l) {case L1: xn=C1; break; case L3: xn=C3; break; case L5: xn=C5};
                    break;
                case C1:
                case C3:
                case C5:
                    switch (l) {case L1: xn=R1; break; case L3: xn=R3; break; case L5: xn=R5};
                };
                xc = entry[n][l];                                                                   // note intersection character
                nr = 1;                                                                             // count number of intersection characters required in the intersecting words
                nf = 0;                                                                             // count number of intersection characters found in the intersecting words
                for (let l = L1; l <= L5; l++) {                                                    // for each guess letter,
                    if (entry[n][l] == xc) {                                                            // if this entry character matches the intersection character,
                        switch (entryHue[n][l]) {
                        case "g":                                                                           // if this entry hue is green,
                            nr++;                                                                               // increment number of intersection characters required
                            break;
                        case "y":                                                                           // if this entry hue is yellow,
                            if (l == L2 || l == L4) nr++;                                                       // if not intersection, increment number of intersection characters required
                        };
                    };
                    if (entry[xn][l] == xc) {                                                           // if this intersecting entry character matches the intersection character,
                        switch (entryHue[xn][l]) {
                        case "g":                                                                           // if this intersecting entry hue is green,
                            nr++;                                                                               // increment number of intersection characters required
                            break;
                        case "y":                                                                           // if this intersecting entry hue is yellow,
                            if (l == L2 || l == L4) nr++;                                                       // if not intersection, increment number of intersection characters required
                        };
                    };
                    if (sw[i][n][l] == xc) nf++;                                                        // if this solution character matches the intersection character, increment number of intersection characters found
                    if (sw[i][xn][l] == xc) nf++;                                                       // if this intersecting solution character matches the intersection character, inc number of intersection chars found
                };
                if (nr > nf) {                                                                      // if number required is greater than number found,
                    sw.splice(i, 1);                                                                    // eliminate this solution
                    break;                                                                              // stop evaluating this solution
                };
            };
            if (nr > nf) break;
        };
        if (nr <= nf) i++;
    };
};

// Display current words
function display(current) {
    let t, n, l, nr, nf, ct, cn, cl, rt, rn, rl;
    const tilElm = document.querySelectorAll("#puzzle button");
    for (n = R1; n <= C5; n++) {                                                        // set tile characters based on current words
        for (l = L1; l <= L5; l++) {
            t = nl2t[n][l];
            if (l < current[n].length) {
                tilElm[t].innerText = current[n][l].toUpperCase();
            } else {
                tilElm[t].innerText = "";    
            };
        };
    };
    if (current == entry) {                                                             // if displaying entry, set tile colors based on entry hues
        for (n = R1; n <= C5; n++) {
            for (l = L1; l <= L5; l++) {
                t = nl2t[n][l];
                switch (entryHue[n][l]) {
                case "b":
                    tilElm[t].style.backgroundColor = gry;
                    tilElm[t].style.borderColor = gry;
                    tilElm[t].style.color = blk;
                    break;
                case "y":
                    tilElm[t].style.backgroundColor = yel;
                    tilElm[t].style.borderColor = yel;
                    tilElm[t].style.color = wht;
                    break;
                case "g":
                    tilElm[t].style.backgroundColor = grn;
                    tilElm[t].style.borderColor = grn;
                    tilElm[t].style.color = wht;
                };
            };
        };
    } else {                                                                            // otherwise, set tile colors based on current words vs. final words
        for (let r = L1; r <= L5; r++) {                                                    // for each tile row,
            for (let c = L1; c <= L5; c++) {                                                    // for each tile column,
                t = rc2t[r][c];                                                                     // look up this tile index based on this tile row and this tile column
                if (t == -1) continue;                                                              // if dead area, skip this column
                n = t2n[t];                                                                         // look up this primary guess number based on this tile index
                l = t2l[t];                                                                         // look up this primary guess letter based on this tile index
                tilElm[t].style.backgroundColor = gry;                                              // tentatively color this tile gray
                tilElm[t].style.borderColor = gry;
                tilElm[t].style.color = blk;
                if (current[n][l] == final[n][l]) {                                                 // if this current character (target) matches this final character,
                    tilElm[t].style.backgroundColor = grn;                                              // color this tile green
                    tilElm[t].style.borderColor = grn;
                    tilElm[t].style.color = wht;
                } else {                                                                            // otherwise,
                    nr = 0;                                                                             // count number of yellows required
                    nf = 0;                                                                             // count number of yellows found
                    if (c == L1 || c == L3 || c == L5) {                                                // if this tile is on a column,
                        for (let cr = L1; cr <= L5; cr++) {                                                 // for each row of this column,
                            ct = rc2t[cr][c];                                                                   // look up this tile index based on this tile row and this tile column
                            cn = t2n[ct];                                                                       // look up this primary guess number based on this tile index
                            cl = t2l[ct];                                                                       // look up this primary guess letter based on the this tile index
                            if (current[cn][cl] != final[cn][cl]) {                                             // if this current character doesn't match this final character,
                                if (final[cn][cl] == current[n][l]) nr++;                                           // if this final character matches the target, increment number of yellows required
                                if (current[cn][cl] == current[n][l]) {                                             // if this current character matches the target,
                                    if (getComputedStyle(tilElm[ct]).backgroundColor == yel) nf++;                      // if this tile color is already yellow, increment number of yellows found
                                };
                            };
                        };
                    };
                    if (r == L1 || r == L3 || r == L5) {                                                // if this tile is on a row,
                        for (let rc = L1; rc <= L5; rc++) {                                                 // for each column of this row,
                            rt = rc2t[r][rc];                                                                   // look up this tile index based on this tile row and this tile column
                            rn = t2n[rt];                                                                       // look up this primary guess number based on this tile index
                            rl = t2l[rt];                                                                       // look up this primary guess letter based on the this tile index
                            if (current[rn][rl] != final[rn][rl]) {                                             // if this current character doesn't match this final character,
                                if (final[rn][rl] == current[n][l]) nr++;                                           // if this final character matches the target, increment number of yellows required
                                if (current[rn][rl] == current[n][l]) {                                             // if this current character matches the target,
                                    if (getComputedStyle(tilElm[rt]).backgroundColor == yel) nf++;                      // if this tile color is already yellow, increment number of yellows found
                                };
                            };
                        };
                    };
                    if (nr > nf) {                                                                      // if more yellows are required than found, color this tile yellow
                        tilElm[t].style.backgroundColor = yel;
                        tilElm[t].style.borderColor = yel;
                        tilElm[t].style.color = wht;
                    };
                };
            };
        };
    };
};

// display specified prompts
function prompt(leftText, centerText, rightText, keyboard = "none") {
    document.getElementById("leftText").innerText = leftText;                           // update left text (left arrow action)
    if (leftText == "") {                                                               // if left text is empty,
        document.getElementById("leftSide").style.visibility = "hidden";                    // make left side hidden
    } else {                                                                            // otherwise,
        document.getElementById("leftSide").style.visibility = "visible";                   // make left side visible
    };
    document.getElementById("centerText").innerText = centerText;                       // update center text (user instructions)
    document.getElementById("rightText").innerText = rightText;                         // update left text (left arrow action)
    if (rightText == "") {                                                              // if right text is empty,
        document.getElementById("rightSide").style.visibility = "hidden";                   // make right side hidden
    } else {                                                                            // otherwise,
        document.getElementById("rightSide").style.visibility = "visible";                  // make right side visible
    };
    document.getElementById("keyboard").style.display = keyboard;                       // keyboard can be "block" (visible) or "none" (default)
};

function displayMove(number, noAnimation = false) {
    let t, n, l, m, st, sc, dt, dc;
    const cc = ["","","","","","","","","","","","","","","","","","","","",""];        // cc[t] is the current character for tile t
    const cs = ["","","","","",""];                                                     // cs[n] is the current string for guess n
    const tilElm = document.querySelectorAll("#puzzle button");
    for (t = 0; t < tiles; t++) {                                                       // initialize the current characters based on the entry strings
        n = t2n[t];
        l = t2l[t];
        cc[t] = entry[n][l];
    };
    for (let level = 0; level < number-1; level++) {                                    // scramble the current characters based on the preceeding moves
        m = move[level];
        st = m2st[m];
        sc = cc[st];
        dt = m2dt[m];
        dc = cc[dt];
        cc[st] = dc;
        cc[dt] = sc;
    };
    for (n = R1; n <= C5; n++) {                                                        // build the current strings based on the current characters
        cs[n] = "";
        for (l = L1; l <= L5; l++) {
            t = nl2t[n][l];
            cs[n] += cc[t];
        };
    };
    display(cs);                                                                        // display the current (pre-move) strings
    m = move[number-1];                                                                 // scramble the current characters based on the current move
    st = m2st[m];
    sc = cc[st];
    dt = m2dt[m];
    dc = cc[dt];
    cc[st] = dc;
    cc[dt] = sc;
    for (n = R1; n <= C5; n++) {                                                        // build the current strings based on the current characters
        cs[n] = "";
        for (l = L1; l <= L5; l++) {
            t = nl2t[n][l];
            cs[n] += cc[t];
        };
    };
    if (noAnimation) {                                                                  // if no animation is requested,
        display(cs);                                                                        // display the current (post-move) strings
    } else {                                                                            // otherwise,
        const sx = tilElm[st].offsetLeft;                                                   // animate movement of this source tile to this destination tile
        const sy = tilElm[st].offsetTop;
        const dx = tilElm[dt].offsetLeft;
        const dy = tilElm[dt].offsetTop;
        tilElm[st].style.transition = "transform 1s";
        tilElm[st].style.transform = "translate(" + (dx-sx) + "px, " + (dy-sy) + "px)";
        tilElm[st].style.zIndex = "1";
        tilElm[st].ontransitionend = function() {                                           // when animation is complete,
            tilElm[st].style.transition = "transform 0s";                                       // restore this source tile location
            tilElm[st].style.transform = "none";
            tilElm[st].style.zIndex = "0";
            display(cs);                                                                        // display the current (post-move) strings
            tilElm[st].style.color = blu;
            tilElm[dt].style.color = blu;
            };
    };
};

// Find final guess words
function findFinal() {
    const wp = [];                                                                      // word possible table where wp[wi][gn] is true if word wi is still possible for guess gn
    const cw = [];                                                                      // current word table where cw[pi][gn] is the current possible word pi for guess gn
    const cp = [0,0,0,0,0,0];                                                           // current possibilites table where cp[gn] is the current number of possible words for guess gn
    const sw = [];                                                                      // solution word table where sw[si][gn] is solution si for guess gn
    for (let w = 0; w < words; w++) {                                                   // for each word index,
        wp[w] = [true, true, true, true, true, true];                                       // initialize these word possibles
        cw[w] = ["", "", "", "", "", ""];                                                   // initialize these current words
    };
    phase1(wp, cw, cp);                                                                 // Eliminate words based on entry characters and entry hues
    phase2(wp, cw, cp);                                                                 // Eliminate words that require more ascii codes than the guesses provide
    phase3(cw, cp)                                                                      // Eliminate words due to conflicting intersecting words
    phase4(cw, cp, sw);                                                                 // Identify 6-word solutions with right letters and matching dupes
    phase5(sw);                                                                         // Eliminate any 6-word solutions that violate the yellow intersection rule
    if (sw.length != 1) {                                                               // If no 6-word solution or more than one,
        prompt("Colors", "No final tiles - please fix puzzle", "");                         // update prompt
    } else {                                                                            // otherwise,
        foundFinal = true;                                                                  // flag solution was found
        for (let n = R1; n <= C5; n++) {                                                    // for each guess number,
            final[n] = "";                                                                      // build this final word
            for (let l = L1; l <= L5; l++) {
                final[n] += sw[0][n][l];
            };
        };
        prompt("Colors", "Today's final tiles", "Move 1");                                  // update prompt
        display(final);                                                                     // display solution
    };
};

// Find the moves (character exchanges) required to transform entry string into final string
function findMoves(level = 0) {
    let n, l, st, sc, dt, dc;
    if (level == 0) {                                                                   // if first level, initialize the current and final arrays
        for (let t = 0; t < tiles; t++) {
            n = t2n[t];
            l = t2l[t];
            curC[t] = entry[n][l];
            finC[t] = final[n][l];
        };
    };
    for (let m = 0; m < moves; m++) {                                                   // for each possible move,
        st = m2st[m];                                                                       // look up this move's source tile
        sc = curC[st];                                                                      // look up this source tile's current character
        if (sc == finC[st]) continue;                                                       // if source character is already green, move on to next move
        dt = m2dt[m];                                                                       // look up this move's destination tile
        dc = curC[dt];                                                                      // look up this destination tile's current character
        if (dc == finC[dt]) continue;                                                       // if destination character is already green, move on to next move
        if (m < single) {                                                                   // if we're still looking for double green moves,
            if (sc != finC[dt] || dc != finC[st]) continue;                                     // if the result wouldn't be a double green, move on to next move
        } else {                                                                            // otherwise,
            if (sc != finC[dt] && dc != finC[st]) continue;                                     // if the result wouldn't be a single green, move on to next move
        };
        curC[st] = dc;                                                                      // tentatively swap the source and destination characters
        curC[dt] = sc;
        if (level == levels - 1) {                                                          // if this is the last level,
            if (curC.toString() == finC.toString()) {                                           // if the current string matches the final string,
                foundMoves = true                                                                   // note that we found the correct moves
                move[level] = m;                                                                    // note the move at this level
                return true;                                                                        // report that we found the correct moves
            };
            curC[st] = sc;                                                                      // restore the source and destination characters
            curC[dt] = dc;
            return false;                                                                       // report that we didn't find the correct moves
        };
        if (findMoves(level + 1)) {                                                         // if a recursion to the next level finds the correct moves,
            move[level] = m;                                                                    // note the move at this level
            if (level == 0) {                                                                   // if at bottom level,
                state = "Moves";                                                                    // change state to "Moves"
                number = 1;                                                                         // start with move 1
                prompt("Final", "Today's move 1", "Move 2");                                        // update prompt
                displayMove(number);
            };
            return true;                                                                        // report that we found the correct moves
        };
        curC[st] = sc;                                                                      // restore the source and destination characters
        curC[dt] = dc;
        if (m < single) break;                                                              // if we already found a double green, we won't find anything better
    };
    if (level == 0) prompt("Colors", "No moves - please fix puzzle.", "");              // if at bottom level, flag error
    return false;                                                                       // report that we didn't find the correct moves
};

//          +---------+     +--------+     +-------+     +-------+
//  load -> | Letters | <-> | Colors | <-> | Final | <-> | Moves |
//          +---------+     +--------+     +-------+     +-------+
//                               A             |no           |no
//                               +-------------+-------------+
//
// Initialize javascript after window loads
window.onload = function() {
    let t;
    const tilElm = document.querySelectorAll("#puzzle button");                         // tilElm[t] is the document element for tile index t
    const keyElm = document.querySelectorAll("#keyboard button");                       // keyElm[t] is the document element for key index t
    document.getElementById("rightSide").onclick = function() {                         // if user clicks the right side,
        switch (state) {
        case "Letters":                                                                     // if state is "Letters",
            state = "Colors";                                                                   // change state to "Colors"
            prompt("Letters", "Touch tiles to enter today's colors", "Final");                  // update prompt
            for (let t of [0, 4, 10, 16, 20]) {                                                 // fill in gimme's
                tilElm[t].style.backgroundColor = grn;
                tilElm[t].style.borderColor = grn;
                tilElm[t].style.color = wht;
            };
            break;
        case "Colors":                                                                      // if state is "Colors", 
            state = "Final";                                                                    // change state to "Final"
            if (foundFinal) {                                                                   // if final already found,
                prompt("Colors", "Today's final tiles", "Move 1");                                  // update prompt
                display(final);                                                                     // display final
            } else {                                                                            // otherwise,
                prompt("", "Finding today's final tiles...", "");                                   // update prompt
                for (let n = R1; n <= C5; n++) {                                                    // build entry and entryHue from tiles
                    entry[n] = "";
                    entryHue[n] = "";
                    for (let l = L1; l <= L5; l++) {
                        t = nl2t[n][l];
                        entry[n] += tilElm[t].innerText.toLowerCase();
                        switch (getComputedStyle(tilElm[t]).backgroundColor) {
                        case gry:
                            entryHue[n] += "b";
                            break;
                        case yel:
                            entryHue[n] += "y";
                            break;
                        case grn:
                            entryHue[n] += "g";
                        };
                    };
                };
                setTimeout(findFinal, 100);                                                         // invoke findFinal after pause to update screen
            };
            break;
        case "Final":                                                                       // if state is "Final",
            state = "Moves";                                                                    // change state to "Moves"
            number = 1;                                                                         // start with move 1
            if (foundMoves) {                                                                   // if moves already found,
                prompt("Final", "Today's move 1", "Move 2");                                        // update prompt
                displayMove(number);                                                                // display first move
            } else {                                                                            // otherwise,
                prompt("", "Finding today's moves...", "");                                         // update prompt
                setTimeout(findMoves, 100);                                                         // invoke findMoves after pause to update screen
            };
            break;
        case "Moves":                                                                       // if state is "Moves",
            number++;                                                                           // advance to next move
            if (number < levels) {                                                              // update prompt
                prompt("Move " + (number-1), "Today's move " + number, "Move " + (number+1));
            } else {
                prompt("Move 9", "Today's move 10", "");
            };
            displayMove(number);
        };
    };
    document.getElementById("leftSide").onclick = function() {                          // if user clicks the left side,
        switch (state) {
        case "Letters":                                                                     // if state is "Enter Letters",
            location.reload();                                                                  // reload page
            break;
        case "Colors":                                                                      // if state is "Colors",
            state = "Letters"   ;                                                               // change state to "Letters"
            if (foundFinal) {                                                                   // update prompt
                prompt("Reload", "Today's letters", "Colors");
            } else {
                prompt("Reload", "Touch keys to enter today's letters", "Colors", "block");
            };
            break;
        case "Final":                                                                       // if state is "Final",
            state = "Colors";                                                                   // change state to "Colors"
            if (foundFinal) {                                                                   // update prompt
                prompt("Letters", "Today's colors", "Final");
            } else {
                prompt("Letters", "Touch tiles to enter today's colors.", "Final");
            };
            display(entry);                                                                     // display entry
            break;
        case "Moves":                                                                       // if state is "Moves",
            if (number == 1) {                                                                  // if move 1 is being displayed,
                state = "Final";                                                                    // change state to "Final"
                prompt("Colors", "Today's final tiles", "Move 1");                                  // update prompt
                display(final);                                                                     // display final
            } else {                                                                            // otherwise,
                number--;                                                                           // decrement move number
                if (number == 1) {                                                                  // update prompt
                    prompt("Final", "Today's move 1", "Move 2");
                } else {
                    prompt("Move " + (number-1), "Today's move " + number, "Move " + (number+1));
                }
                displayMove(number, true);
            };
        };
    };
    for (let t = 0; t < tiles; t++) {                                                   // for each tile index,
        tilElm[t].onclick = function() {                                                    // if user clicks this tile,
            if (state != "Colors") return;                                                      // if user is not entering colors, ignore this tile click
            foundFinal = false;
            switch (getComputedStyle(tilElm[t]).backgroundColor) {
            case gry:
                tilElm[t].style.backgroundColor = yel;
                tilElm[t].style.borderColor = yel;
                tilElm[t].style.color = wht;
                break;
            case yel:
                tilElm[t].style.backgroundColor = grn;
                tilElm[t].style.borderColor = grn;
                tilElm[t].style.color = wht;
                break;
            case grn:
                tilElm[t].style.backgroundColor = gry;
                tilElm[t].style.borderColor = gry;
                tilElm[t].style.color = blk;
            };
        };
    };
    for (let key = 0; key < keys; key++) {                                              // for each key index,
        keyElm[key].onclick = function() {                                                  // if user clicks this on-screen key,
            if (state != "Letters") return;                                                     // if user is not entering letters, ignore this on-screen key click
            foundFinal = false;
            if (key == backSpace && cursor > 0) {
                if (cursor < tiles) tilElm[cursor].style.borderColor = gry;
                cursor -= 1;
                tilElm[cursor].innerText = "";
                tilElm[cursor].style.borderColor = blk;
            } else if (key < backSpace && cursor < tiles) {
                tilElm[cursor].innerText = keyElm[key].innerText;
                tilElm[cursor].style.borderColor = gry;
                cursor += 1;
                if (cursor < tiles) tilElm[cursor].style.borderColor = blk;
            };
        };
    };
    document.onkeydown = function(e) {                                                  // if user presses a physical key, 
        if (state != "Letters") return;                                                     // if user is not entering letters, ignore this keydown
        foundFinal = false;
        const key = e.key.toUpperCase();
        if (key == "BACKSPACE" && cursor > 0) {
            if (cursor < tiles) tilElm[cursor].style.borderColor = gry;
            cursor -= 1;
            tilElm[cursor].innerText = "";
            tilElm[cursor].style.borderColor = blk;
        } else if (key.length == 1 && key >= "A" && key <= "Z" && cursor < tiles) {
            tilElm[cursor].innerText = key;
            tilElm[cursor].style.borderColor = gry;
            cursor += 1;
            if (cursor < tiles) tilElm[cursor].style.borderColor = blk;
        };
    };
    /*
    for (let n = R1; n <= C5; n++) {                                                    // initialize entry data with test data
        for (let l = L1; l <= L5; l++) {
            tilElm[nl2t[n][l]].innerText = test[n][l].toUpperCase();
            switch (testHue[n][l]) {
            case "b":
                tilElm[nl2t[n][l]].style.backgroundColor = gry;
                tilElm[nl2t[n][l]].style.borderColor = gry;
                tilElm[nl2t[n][l]].style.color = blk;
                break;
            case "y":
                tilElm[nl2t[n][l]].style.backgroundColor = yel;
                tilElm[nl2t[n][l]].style.borderColor = yel;
                tilElm[nl2t[n][l]].style.color = wht;
                break;
            case "g":
                tilElm[nl2t[n][l]].style.backgroundColor = grn;
                tilElm[nl2t[n][l]].style.borderColor = grn;
                tilElm[nl2t[n][l]].style.color = wht;
            };
        };
    };
    cursor = tiles;
    prompt("Reload", "Touch keys to enter today's letters.", "Colors", "block");
    */
};