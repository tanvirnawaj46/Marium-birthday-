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
- [ ] 1. Envelope scene (p8): wax seal cracks, flap opens in 3D, paper slides OUT of the pocket, rises, unfolds into the letter (no page-9 detour)
- [ ] 2. Letter page (p10): paper matches scene end-state, ink-in typing with soft caret + human rhythm
- [ ] 3. Realistic keyboard sound (key-down thock + key-up click, varied, space/enter/line-bell) + envelope sounds
- [ ] 4. Test 393x852 / 428x926 (screens + audio levels) and push
