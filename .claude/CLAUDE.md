# Marium birthday website (GitHub Pages: tanvirnawaj46/Marium-birthday-)

Static site: index.html + style.css + main.js + config.js + assets/. No build step. Deployed from `main` (root).
Owner writes in romanized Bengali (Banglish) -> reply in Banglish, short, no big recaps.
Targets: iPhone 15 Pro (393x852) and iPhone 12 Pro Max (428x926), full-screen, no bars, safe-area aware.
Audio: WebAudio mixer in main.js (priority voice > scratch > typing > fx > music). Test levels with a headless
Chromium analyser after any sound change; peaks must stay < ~0.95.
Push: `git fetch origin main && git reset --hard origin/main`, copy edits, commit, `git push origin HEAD:main`.
Commit trailer: Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>

## Standing instruction from owner
Usage limit may cut the session. Work in small stages, push each working stage to main. When he sends a command
after the limit resets, continue ONLY the unchecked items below; do not restart or redo finished work.

## Current job: letter opening + typing (started 2026-11-06)
- [x] 1. (DONE, pushed) Envelope scene (p8): wax seal cracks, flap opens in 3D, paper slides OUT of the pocket, rises, unfolds into the letter (no page-9 detour)
- [x] 2. (DONE, pushed) Letter page (p10): paper matches scene end-state, ink-in typing with soft caret + human rhythm
- [x] 3. (DONE, pushed) Realistic keyboard sound (key-down thock + key-up click, varied, space/enter/line-bell) + envelope sounds
- [x] 4. (DONE) Test 393x852 / 428x926 (screens + audio levels) and push
- [x] 0. (DONE, pushed) Status/bottom bar colour match: solid .edge strips per page + theme-color + html/body bg colour (THEME table in main.js holds each page's real top/bottom colour; re-measure if a page background changes)

All items above are finished. Do NOT redo them; wait for the owner's next request.

## Job 2: scroll chapter (started 2026-11-09)
- [x] 1. (DONE, pushed) p2/p3/p13 are now ONE native scroll page (#p2 with sections #s2 #s3 #s13, init[3]/init[13] fired by IntersectionObserver, chapter() in main.js); single fixed gradient #ffcee8->#c5c1fd = THEME[2] so bars match like owner's Tanisha site. (old: slide/drag-follow, slide transition, dots, swipe-up hint); p3 Keep going -> p13; p13 Continue -> p4 cake; p13 forward swipe only after scratch done; cache-bust ?v= on css/js
- [x] 2. (DONE) Bars: Safari keeps load-time colour, so EVERY page uses the same pastel gradient #fbe0f1 -> #f9cfe8 -> #ecd0f4 -> #f2dff3 (edges = bar colours), THEME all constant, .eT/.eB forced. DO NOT change page edge colours or backgrounds - owner says bar matching is perfect now.

## Job 3: design/animation polish (started 2026-11-09) - owner: "colours perfect, keep them; make animations/design prettier. Do half now, rest after the 5h limit reset"
Rule: keep page backgrounds/edge colours exactly (bar match). Only touch animation, typography, buttons, cards, motion. Push each item.
Part A (before limit):
- [x] A1. (DONE, pushed) Global: glass/shimmer .btn, softer page transition (not #p2/#p8/#p10)
- [x] A2. (DONE, pushed) Wish section (#s2): letter wave/shimmer, glow halo, twinkle
- [x] A3. (DONE, pushed) Tree section (#s3): staggered text reveal, gradient heading
- [x] A4. (DONE, pushed) Voice card (#s13): pulsing mic ring, glow border, nicer wave
Part B (after reset, do ONLY these):
- [x] B1. (DONE, pushed) Gift page p0 + bow game p1 polish
- [x] B2. (DONE, pushed) Cake p4 + wish p5 (candle/flame glow, confetti, text reveal)
- [x] B3. (DONE, pushed) Balloons p6 (shine, pop burst, counter chips)
- [x] B4. (DONE, pushed) Photos p7 + p14 (polaroid float/tilt, entrance stagger, lightbox)
- [x] B5. (DONE, pushed) Envelope p8 + letter p10 (paper/ink glow, small details)
- [x] B6. (DONE, pushed) Video p11 + final p12 (title reveal, confetti, replay button)
- [x] B7. (DONE, pushed) Test 393x852 / 428x926 all pages, audio untouched, push

## Job 4 (2026-11-10)
- [x] (DONE, pushed) Double-tap/pinch zoom disabled
- [x] (DONE, pushed) Tree page is standalone #p3 again, BEFORE the scroll page. Flow: p1 bow -> p3 tree (Keep going -> go(2)) -> p2 scroll page (Wish #s2 -> Voice #s13, 2 dots) -> p13 Continue -> p4 cake
- [x] (DONE, pushed) Final page p12 redesigned: minimal elegant (breathing orb + rotating text ring + blur-in italic name + finalLine from config.js) + wish lanterns: she types a wish, lantern rises and becomes a star (stars saved in localStorage 'stars12'). No confetti/fireworks there anymore. Edit finalLine in config.js.
- [x] (DONE, pushed) Wish/ntfy/email system REMOVED from final page (owner asked). Final page keeps orb + ring + name + finalLine + decorative lanterns only.
- [x] (DONE, pushed) Smoothness pass: particle canvas idles when empty and has no shadowBlur; resize debounced; removed non-passive touchmove, nudge(), animated background-position/box-shadow/filter/backdrop-filter; fewer floating emoji, no per-emoji drop-shadow; button shimmer via transform.

# ======================= Job 5: NEW FEATURES (planned 2026-11-10) =======================
Owner (2026-11-10): "think of NEW ideas and add features that will make my wife very happy, lots of beautiful design. Stop when the usage
limit hits; after the 5h reset continue so I don't have to think again." => After a reset: continue ONLY the unchecked items below, in order,
using the specs here as they are (do NOT redesign, do NOT re-ask). Tick each box when pushed. Tools: `.claude/tools/README.md`.

## RULES for every item
- Bar match is sacred: every new page is `<section class="pg pst" id="pNN">` (pastel gradient + edge strips come from `.pst`). Never give a page its own
  background, never touch THEME / .eT / .eB. Keep the top ~26px and bottom ~26px visually pastel.
- Smooth on iPhone: animate ONLY transform / opacity / translate / scale / rotate. No animated filter, box-shadow, backdrop-filter, background-position;
  no canvas shadowBlur; <= 25 animated elements per page; timers only via `later()`; own rAF loops must stop when `cur!==thatPage`.
- Inputs >= 16px font. Drag areas `touch-action:none`; scroll areas `touch-action:pan-y`. Use pointer events. Zoom stays disabled.
- Sound: add entries to `SFX` + `CAT` + `DIP` (see existing). Then `node .claude/tools/audio-peak.js <names>`; peak must be < 0.95.
- Editable text goes in `config.js` (Banglish comments), defaults sweet + generic, NO invented facts about their life.
- Every item: implement -> `node --check main.js` -> shots at 393x852 AND 428x926 (read the PNGs) -> flow.js -> bump `?v=` in index.html ->
  commit (trailer from system reminder) -> `git push origin HEAD:main` -> tick here. Reply to owner in short Banglish.
- Page numbers: new pages use ids 15..19 (see N0). Add `FLT[n]` floaters only if cheap (reuse FLT[10] style) ; THEME[n]=["#fbe0f1","#f2dff3"].

## N0. Flow table (prerequisite, small)  [x] DONE, pushed
- main.js: `const FLOW=[0,1,3,2,4,5,6,16,7,14,17,8,10,15,11,18,12];` `const nextOf=n=>{const i=FLOW.indexOf(n);return i<0?n+1:(FLOW[i+1]??n)}`.
- go(): cap `if(n>19)n=19`. `.go` buttons -> `go(nextOf(id))`. Replace hard-coded next calls: p4 `go(5)`, p5 `go(6)`, g7 `go(14)`, g14 `go(8)`, p8 `go(10,true)`/RM `go(10)`,
  p11 `go(12)` (3 places: onerror/skip/.go) -> use `go(nextOf(N))`. p1->3, p3->2, p13->4 stay (scroll chapter is special). THEME entries 15..19 constant.
- index.html: empty new `<section class="pg pst" id="p15"> ...` etc. are added by each item. `init[n]` for each. Test: flow.js passes through all pages.
- Until an item is built, its id is simply not in FLOW (so the flow never shows a missing page): add each id to FLOW only when that item is done.

## N1. p15 "Little gifts" voucher book  [x] DONE, pushed   (FLOW: after p10 letter, before p11 video)
- config.js: `vouchers:[{e:"🤗",t:"One long hug",n:"any time you want, no questions asked"},{e:"🍳",t:"Breakfast in bed",n:"made by me, burnt toast included"},{e:"🍽️",t:"Your favourite dinner",n:"my treat, your choice"},{e:"🌙",t:"A whole day, just us",n:"phones away, you pick the plan"},{e:"🎬",t:"Movie night",n:"you choose the film, I bring the snacks"},{e:"💌",t:"One surprise",n:"I will not tell you when"}]`, `voucherTitle:"A few little gifts 🎁"`, `voucherHint:"tap a gift to redeem it, then show it to Akib ✦"` (use C.from).
- Markup: `.top` title; `#vlist` scroll area (absolute, top 14vh, bottom 14vh, overflow-y:auto, hide scrollbar, padding 4px, gap .8rem, `touch-action:pan-y`);
  each `.vt` ticket: width min(88vw,380px), cream `#fffaf6` bg, radius 18px, left emoji bubble 54px (pink radial), centre title (Fredoka 600 1.05rem #9b2f78) + note (italic .85rem), right dashed
  perforation line + tiny caps "REDEEM". Notches on left/right edges via CSS `mask` (two radial-gradients, `-webkit-mask-composite:source-in`). Soft shadow. `.btn` "Keep going ✨" fixed at bottom (hidden until >=1 redeemed OR after 6s).
- Behaviour: pointerdown/click on a ticket (not done) -> `.done` : a rotated (-10deg) pink-red rounded-rect stamp "REDEEMED ♡" scales 2.2->1 (transform+opacity, .35s cubic-bezier(.3,1.6,.5,1)), ticket opacity .8, small `burst()` at ticket, `SFX.stamp()`.
  Persist redeemed indexes in localStorage `vouch` (try/catch). Toast under list: "show this to ${C.from} 💌". Re-entering restores stamps. Tickets stagger-in (translateY 24px -> 0, 60ms apart) when page opens.
- SFX.stamp: thud `tone(120,.14,'sine',.55,50,0,0)` + paper snap `noise(.05,.3,{bp:2800,q:.8})` + tiny chime `tone(1568,.35,'sine',.08,0,.08,.4)`; CAT stamp:1.3, DIP stamp:[.55,500].
- Add p15 to FLOW. Test at both sizes with all 6 tickets scrolling, redeem 2, reload page -> stamps persist.

## N2. Keepsake wallpaper (final page p12)  [x] DONE, pushed (pre-renders at 4.8s, share sheet or press-and-hold overlay fallback)
- Under the replay link on p12 add a small elegant text button `#keep` "✦ keep this as a wallpaper" (same style as `.f-re`, delay 7.4s).
- On tap draw a canvas 1179x2556: vertical gradient #fbe0f1 -> #f9cfe8 -> #ecd0f4 -> #f2dff3, big soft white radial glow top-third, ~40 small gold/pink stars (seeded random), thin ring of text
  ("made with love for NAME by FROM", canvas text along a circle, 26px letter-spaced) around a glass circle (white 35% fill, white stroke), NAME in italic 600 "Cormorant Garamond" (fallback Georgia italic) 170px gradient (#b0286e->#8a4fd1) centered in circle,
  "HAPPY BIRTHDAY" 40px letter-spaced above the circle, `C.finalLine` wrapped under it (italic 54px), tiny "— FROM" + the year at bottom (safe for lock-screen clock: keep top 30% and bottom 12% light).
- Wait for `document.fonts.ready`. `canvas.toBlob` -> File `happy-birthday-NAME.png` -> if `navigator.canShare&&navigator.canShare({files:[f]})` use `navigator.share({files:[f]})` (iOS share sheet has "Save Image") ; else `window.open(URL.createObjectURL(blob))`.
  Button text turns "saved ✓" after. No SFX needed except `SFX.chime`. Test: toBlob size > 20KB, screenshot the canvas via page.evaluate -> dataURL -> save PNG and view it.

## N3. p18 "Our stars" constellation heart  [x] DONE, pushed (note: class is .cstar because .cs = scroll sections; shooting-star sound is SFX.meteor because SFX.shoot = bow arrow)   (FLOW: after p11 video, before p12 final)
- Title `.top` "Connect our stars ✨". Stage `#cst` (position:absolute; inset: 16vh 0 14vh; touch-action:none) containing a `<canvas id="cvc">` (DPR<=2, redraw ONLY on pointer events/finish) + 14 DOM star dots `.cs` (22px radial gold-white gradient, glow via radial-gradient background (no box-shadow animation), twinkle = opacity animation only on 6 of them).
- Star positions: parametric heart x=16sin^3t, y=-(13cos t-5cos2t-2cos3t-cos4t) sampled at 14 t values from t=PI (bottom tip) around, scaled to stage (fit 78% width), +-6px jitter, fixed seed. Order = path order; the loop closes back to star 0.
- Interaction: the "next" star shows a pulsing ring (scale+opacity anim). pointerdown/move: if finger within 30px of next star -> link (line from previous star), `SFX.star(i)`; lines drawn with 3px rose (#c0286e, alpha .85) rounded strokes + live segment from last star to finger (alpha .4). Wrong stars ignored. Also tap-each-in-order works.
- SFX.star(i): C-major-pentatonic bell, notes [523,587,659,784,880,1047,1175,1319,1568,1760,1976,2349,2637,3136] -> `tone(f,.9,'sine',.12,0,0,.5)+tone(f*2,.5,'sine',.04,0,0,.4)`; CAT star:1.3, DIP star:[.6,400].
- Complete: closing line, heart fill (canvas path fill rgba(255,170,210,.28)), stars lift (scale 1.15, opacity-only glow), shooting star streak (one DOM `<i>` translate 0->(-120vw,60vh)... 1.1s) + `SFX.shoot()` + `burst`; text fades in: NAME (italic serif, gradient) + `C.starLine||"my favourite constellation"`; `.btn` "Keep going ✨". If idle 10s show hand hint `.hand` (existing class) dragging from star0->star1.
- Add p18 to FLOW. Test: simulate pointer drag via page.mouse through all star centers (read positions with getBoundingClientRect) and screenshot at 50% and complete.

## N4. p17 "19 flowers for 19 years" garden  [x] DONE, pushed (flower = 2 stacked SVGs .sm stem + .bm bloom; FLOW updated)   (FLOW: after p14 frames, before p8 envelope)
- Title `.top` "Planted just for you 🌷". Counter chip `#fcn` "0 / ${C.age}" under the title. Ground: a soft lavender ellipse glow (radial-gradient #e8c9f2 -> transparent) at 66% height (NOT green hills: bottom edge must stay pastel).
- Flowers: JS builds inline SVG (viewBox 0 0 60 120): stem (green #6fbf8e gradient to #4aa874, 3px, slightly curved path), 2 leaves, bloom type by index%5: tulip (pink/magenta), daisy (white petals, gold centre), rose (layered circles pink), lavender (stacked violet dots), cosmos (8 petals coral). Colours pastel-saturated so they pop on the pastel bg.
- Tap/hold anywhere on stage (pointerdown; while held plant every 260ms): plant at tap x (clamped 8%..92%), y = ground +- row (3 depth rows, size 0.7/0.85/1.0, z-order by y). Growth: stem `scaleY 0->1` (transform-origin bottom, .8s ease-out) then bloom `scale 0->1` overshoot (.5s) + sparkle `burst(x,y,8)`; idle sway = `rotate` +-2.5deg 3-5s alternate infinite per flower (<= 19 elements, fine). `SFX.plant(k)`: pentatonic note rising with k (same table as star) `tone(f,.6,'sine',.1,0,0,.4)` + soft `noise(.05,.12,{bp:1800,q:.6})` pop. CAT plant:1.2, DIP plant:[.6,350].
- Count = C.age flowers max (default 19). When full: the camera "breathes": a giant 20th flower grows in the middle (scale 2.2) with glow ring (transform/opacity), text fades in: `${C.age} flowers for ${C.age} years, and one more to grow with you ♡` (config `gardenEnd`), `SFX.chime` + `SFX.burst`, petals rain (`rain(40,true)`), `.btn` Keep going. Hint before first tap: "tap anywhere to plant" with `.hand`. Auto-plant 1 flower per 900ms if nothing tapped for 8s (so nobody gets stuck).
- Add p17 to FLOW. Test: dispatch 19 pointerdowns, screenshot at 7 and 19.

## N5. p16 "A very serious question" love meter  [ ]   (FLOW: after p6 balloons, before p7 photos)
- Title `.top` "A very serious question 🧐". Big heart (existing heart SVG style, 120px, `#ff5c93` gradient) with number `#lmv` below ("0%"), question `#lmq`: "How much do you love me?" (config `loveQ1`).
- Slider track `#lmt` (height 18px, radius 9px, white 55% bg, width 80vw) with fill `#lmf` (scaleX transform from left, gradient pink->orange) and thumb `#lmth` (34px heart emoji) ; pointer drag (touch-action:none) sets value 0..100. Heart scale = 1+v/200 (transform).
- When thumb reaches 100: the track "can't hold it" — thumb wiggles (rotate anim), meter numbers keep counting 100 -> 1,000 -> 1,000,000 -> "∞" automatically over 2.5s (number text via rAF, ease-in), heart grows to 1.6 and shakes, `SFX.meter(v)` rising tone sweep (use one `tone(300,1.6,'sine',.12,1400,0,.3)`); text `#lmq` becomes "Wait, that doesn't fit on a scale 😅".
- Part 2 (button `.btn` "Now my turn ❤️"): question -> `How much do I love you?` (config `loveQ2`), meter fills itself instantly past all limits showing "∞ + 1", big `burst(W/2,H*.4,120,true)` + `SFX.burst`, text `Always one more ♡` (config `loveEnd`), `.btn` Keep going. Cap number display lengths so nothing overflows (clamp font via JS).
- Test both parts at both sizes; drag with page.mouse; screenshot at 60%, at ∞, at end.

## N6. p5 candle: blow it out with the microphone  [ ]   (upgrade existing p5, no new page)
- config `blowMic:true`. p5 text: "Make a wish… then blow out the candle 🕯️" and a small mic button `#blow` "🎤 blow here" (needs a user gesture on iOS). Existing "tap anywhere to continue" stays as fallback AFTER blowing or after 12s.
- On `#blow` tap: `navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}})` -> `AC.createMediaStreamSource(stream)` -> `AnalyserNode(fft 512)` (NEVER connect to destination). Measure baseline RMS of low band (bins < 1.5kHz) for 500ms, then rAF loop: blow = level > max(baseline*3, 0.05) sustained 300ms. Stop tracks + disconnect immediately after detection or error; `AC.resume()`.
- Any failure (unsupported / denied / 10s timeout) -> text "tap the candle to blow it out ✨" and the candle itself becomes tappable. The flame is the one in `cakeSVG` (`.flame` paths); blowing = flame scale 0 + 5 smoke wisps (small circles rising, opacity) + `SFX.puff()` (`noise(.5,.3,{bp:500,bp2:1400,q:.4,a:.1})`) + 600ms later `burst` + `SFX.good()`; then (after N7 exists) play the music-box melody, else `SFX.chime`; auto-continue to nextOf(5) after 3.2s.
- IMPORTANT iOS risk: capturing mic can change the audio session (music quieter). Mitigation: stop stream right after detection, call `navigator.audioSession.type='playback'` again, `AC.resume()`, `applyMix(.9)`. Cannot be tested here -> mention to owner: "test once on iPhone; set blowMic:false to disable".

## N7. p19 music box + "Happy Birthday" melody  [ ]   (FLOW: after p5, before p6)
- Title `.top` "A tiny music box 🎶". Pink jewellery box SVG (lid open) with a spinning ballerina (SVG: tutu ellipse, body, arms; `rotate` anim 4s linear only while playing) on a small turntable; notes `♪` float up (DOM, <=8 at once, translate+opacity).
- Melody (C major) as [freq, beats]: G4 .75,G4 .25,A4 1,G4 1,C5 1,B4 2, G4 .75,G4 .25,A4 1,G4 1,D5 1,C5 2, G4 .75,G4 .25,G5 1,E5 1,C5 1,B4 1,A4 1, F5 .75,F5 .25,E5 1,C5 1,D5 1,C5 2 (freqs 392,392,440,392,523,494 | 392,392,440,392,587,523 | 392,392,784,659,523,494,440 | 698,698,659,523,587,523). Beat = 0.5s.
- Two modes: (a) tap the box/anywhere: each tap plays the NEXT note (no timing needed), note label + sparkle; (b) button "▶ play it for me" auto-plays whole tune. Music-box timbre = `tone(f,1.2,'sine',.14,0,0,.5)+tone(f*3,.4,'sine',.035,0,0,.3)+tone(f*2,.6,'sine',.05,0,0,.4)`; `SFX.mb(f)`; CAT mb:1.2, DIP mb:[.55,700] (dip music while it plays).
- After the last note: lyric line fades in "Happy birthday, ${C.name} ♡", burst hearts, `.btn` Keep going. N6 candle can call `playTune()` (export it as a function) when the candle goes out.
- Add p19 to FLOW only if N6 not using it inline. Test audio-peak mb; screenshot mid-song.

## N8. Small delights  [ ] (each is a sub-box; do all)
- [ ] N8a. Photo "develop" reveal on p7 + p14: each photo starts covered by a cream "latent" overlay (opacity 1 + tiny scale 1.02 on the img) that fades to 0 over 2.4s when the page opens (stagger 300ms) — opacity/transform only; tap a photo during the fade = instant reveal + `SFX.photo`.
- [ ] N8b. Secret on the final page: triple-tap the orb within 1.2s -> a small glass note fades in under the line: `config.secret` (default "P.S. You are my favourite thing, always. ♡") + `burst` hearts + chime; tap again hides.
- [ ] N8c. Live counters (only if config `since:"YYYY-MM-DD"` or `dob:"YYYY-MM-DD"` is non-empty; defaults empty => nothing shown): p12 shows a quiet italic line "together for 2 years 3 months 14 days" / "19 years = 6,939 days" updated once per second via textContent (NOT per frame). Document in config.js comments.
- [ ] N8d. Iris page transition: on `go()` (non-seam, not entering 5/8/10) a pink circle (`#iris`, fixed, 40vmax radial pastel #f8c6e4->#fbe0f1, `transform:scale(0)->scale(4)` 520ms ease-in then fade out 420ms) wipes from the last tap point; page swap happens under it. transform+opacity only. Skip when `RM`.
- [ ] N8e. Reasons jar (p20 -> allow cap 20): glass jar SVG with 12 folded-paper hearts (config `reasons:[...12 short lines]`, defaults generic like "your laugh", "the way you care", ...); tap a heart -> it floats up, unfolds into a card with the text (cream paper, handwriting font Caveat), counter "3 / 12"; after 12 -> Keep going. FLOW: after p17 garden, before p8 envelope.
- [ ] N8f. Gentle gyro parallax (only on iOS after the first tap, `DeviceOrientationEvent.requestPermission` inside a user gesture, wrapped in try/catch; falls back to pointer-move parallax) on p12 orb/ring/sky: translate by +-8px using transform only.

## N9. Final QA  [ ]
- [ ] flow.js through all FLOW pages at 393 + 428; shots of every NEW page; audio-peak of every new SFX (< .95); check no console errors; grep `style.css`/`main.js` for forbidden animated props (filter/box-shadow/backdrop-filter inside @keyframes); cache-bust bump; update this file; short Banglish summary to owner with "how to find each new feature".
