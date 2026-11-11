// ===== EDIT EVERYTHING HERE =====
// Bangla ba English, jeta khushi lekho. Bangla likhle font/size/color auto set hoye jabe.
window.CONFIG = {

  // ---- NAME / AGE / SENDER ----
  name: "Marium",   // page 1 (Surprise for), HB page, cake, letter "Dear ...", final page
  age: 19,          // tree page: "you're turning 19"
  from: "Akib",     // "Akib made this", envelope "Akib wrote you a letter", voice page

  // ---- FILES (assets folder) ----
  music: "assets/music.mp3",
  video: "assets/birthday.mp4",
  voice: ["assets/voice.mp3","assets/voice.m4a","assets/voice.webm","assets/voice.ogg"],
  videoPoster: "assets/poster.jpg",

  // ---- BALLOON PAGE (3 ta balloon, 3 ta reason) ----
  balloonTitle: "Only 3 balloons hold a reason you're loved. Find and pop them all",
  decoyBalloons: 5,   // koyta khali (decoy) balloon thakbe. Beshi dile aro confusing
  balloons: [
    "You believed in me when I didn't",          // balloon 1 -> REASON NO.1
    "My worst days get shorter when you call",   // balloon 2 -> REASON NO.2
    "Being with you feels like home"             // balloon 3 -> REASON NO.3
  ],

  // ---- GALLERY 1 (polaroid swipe page) ----
  photos: [   // jotogulo khushi
    {src:"assets/Where it all started.jpeg", caption:"Where it all started"},
    {src:"assets/Our favourite day.jpeg", caption:"Our favourite day"},
    {src:"assets/Still smiling.jpeg", caption:"Still smiling"},
    {src:"assets/Never forget this one.jpeg", caption:"Never forget this one"},
    {src:"assets/photo5.jpg", caption:"More to come"}
  ],

  // ---- GALLERY 2 (notun page: 5 ta picture, protita alada animation) ----
  gallery2Title: "Our little moments",
  gallery2Sub: "tap any photo to see it big",
  photos2: [  // max 5 ta
    {src:"assets/Just us.jpeg", caption:"Just us"},
    {src:"assets/That laugh.jpeg", caption:"That laugh"},
    {src:"assets/My favourite person.jpeg", caption:"My favourite person"},
    {src:"assets/Golden hour.jpeg", caption:"Golden hour"},
    {src:"assets/Forever.jpeg", caption:"Forever"}
  ],

  // ---- VOUCHERS (p15 "A few little gifts") : e=emoji, t=title, n=small note. Jototuku khushi add/remove koro ----
  voucherTitle: "A few little gifts 🎁",
  voucherHint: "tap a gift to redeem it, then show it to Akib ✦",
  vouchers: [
    {e:"🤗", t:"One long hug",           n:"any time you want, no questions asked"},
    {e:"🍳", t:"Breakfast in bed",       n:"made by me, burnt toast included"},
    {e:"🍽️", t:"Your favourite dinner",  n:"my treat, your choice"},
    {e:"🌙", t:"A whole day, just us",   n:"phones away, you pick the plan"},
    {e:"🎬", t:"Movie night",            n:"you choose the film, I bring the snacks"},
    {e:"💌", t:"One surprise",           n:"I will not tell you when"}
  ],

  // ---- STARS (p18 "Connect our stars") : heart complete hole name-er niche ei line ashbe ----
  starLine: "my favourite constellation",

  // ---- GARDEN (p17 "Planted just for you") : age = koyta phul lagano jabe (default 19). {n} = age number ----
  gardenEnd: "{n} flowers for {n} years, and one more to grow with you ♡",

  // ---- LOVE METER (p16 "A very serious question") ----
  loveQ1: "How much do you love me?",
  loveQ2: "How much do I love you?",
  loveEnd: "Always one more ♡",

  // ---- CANDLE (p5) : true = phone-er mic-e fuu diye candle nibhano jabe (mic permission chaibe). Kaj na korle / deny korle candle-e tap korlei nibhe.
  //      iPhone-e ekbar test koro; kono somossa hole false koro (tokhon shudhu candle tap) ----
  blowMic: true,

  // ---- FINAL PAGE extras (p12) ----
  // secret: orb-er (naam-er golpar) upor 1.2 second-er moddhe 3 bar tap korle ei chhoto note ashe; note-e tap korle ba abar 3 bar tap korle lukiye jay
  secret: "P.S. You are my favourite thing, always. ♡",
  // since: "YYYY-MM-DD" dile final page-e live "together for 2 years 3 months 14 days" ashbe (prottek second-e update). Khali "" = kichu dekhabe na
  since: "",
  // dob: "YYYY-MM-DD" (jonmodin) dile "19 years = 6,939 days" ashbe. Khali "" = kichu dekhabe na
  dob: "",

  // ---- LETTER ----
  letter: "I keep thinking about how lucky I got with you. You have seen me at my worst and stayed anyway, and I do not say thank you nearly enough for that. This year, I hope life is gentle with you, that your days are full of laughter, and that you always know how loved you are.",
  finalLine: "Another year of you, my favourite part of every single day.",   // last page, name er niche
  signoff: "With all my love,"   // letter-er sheshe, tarpor "from" name ashe
};
