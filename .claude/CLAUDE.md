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
- [ ] A1. Global: glass/shimmer .btn, softer page transition (not #p2/#p8/#p10)
- [ ] A2. Wish section (#s2): letter wave/shimmer, glow halo, twinkle
- [ ] A3. Tree section (#s3): staggered text reveal, gradient heading
- [ ] A4. Voice card (#s13): pulsing mic ring, glow border, nicer wave
Part B (after reset, do ONLY these):
- [ ] B1. Gift page p0 + bow game p1 polish
- [ ] B2. Cake p4 + wish p5 (candle/flame glow, confetti, text reveal)
- [ ] B3. Balloons p6 (shine, pop burst, counter chips)
- [ ] B4. Photos p7 + p14 (polaroid float/tilt, entrance stagger, lightbox)
- [ ] B5. Envelope p8 + letter p10 (paper/ink glow, small details)
- [ ] B6. Video p11 + final p12 (title reveal, confetti, replay button)
- [ ] B7. Test 393x852 / 428x926 all pages, audio untouched, push
