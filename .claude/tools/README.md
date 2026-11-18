# test tools (Playwright is preinstalled: require('playwright'))
Start the site first:  `cd /home/claude/marium-birthday- && (setsid nohup python3 -m http.server 8766 >/dev/null 2>&1 &)`
- `node .claude/tools/shots.js 393 852 4 5 12`   -> screenshots to $OUT (default /tmp/shots) as p<n>_<w>.png (omit pages = all). Read them with the Read tool.
- `node .claude/tools/flow.js`                   -> visits every page in FLOW, prints cur/on-page/errors
- `node .claude/tools/audio-peak.js chime key star:14:90`   -> plays SFX names (name:N:ms = N overlapping calls SFX.name(i) every ms), prints peak (must stay < 0.95)
Output noise from the proxy ("agent-proxy"/fonts) can be ignored: pipe through `grep -v "agent-proxy\|Allowed\|For details\|googleapis"`.

## Added 2026-11-13 (all need the local server: `cd <repo> && (setsid nohup python3 -m http.server 8766 >/dev/null 2>&1 &)`)
- `monkey.js W H [pages] [late]`  random taps on EMPTY screen of every page. Expect `ok` (no page change, no sound, video not restarted). `late` = p5 after 12s, p11 after end. (p4 changes page by its own 5.3s timer, p17/p7/p14/p6/p12 react because their objects fill the screen: fine.)
- `scrollnext.js W H [pages]`  every gated page (page-as-scroller): ready -> chevron mark -> native wheel scroll -> 'Up next' card (ring/live/full) -> tap its button -> goes to nextOf (p12 'Play again' -> page 1). Shots: /tmp/shots/sx_W_n_{h,m,e}.png (hint / mid / end).
- `touchscroll.js W H [pages]`  REAL touch swipes (CDP Input.dispatchTouchEvent; synthesizeScrollGesture does NOT work in this harness) from 5 start points on every gated page: the page must follow the finger from anywhere (OK = scrollTop > 100 for all 5).
- `stage1.js`  functional checks: p19 box taps vs empty taps, p5 Continue only, p11 pause button / no tap-replay, go(same page) no-op.
- `video.js`  p11 end state + Up-next card button (local python server cannot seek video, so it fires `ended` by hand).
- `glassshots.js W H`  screenshots of p5/p11/p17/p19 to judge the liquid-glass look (/tmp/shots/g2_W_n.png); stitch with PIL and READ them.
- `dbltap.js W H`  double-tap zoom guard with REAL CDP touches: fast 2nd tap cancelled on any element, single/slow/far taps, swipes, long press, 2-finger, pointerdowns still delivered (p6), html.dtw window, touch-action audit of every page. Expect `ALL OK`. (iOS itself is NOT testable here.)
- `touchmisc.js W H`  REAL touches on the scrollers that are not .sc pages: p2 document scroll (3 start points), p7 carousel sideways (also with the page forced to touch-action:none), p10 letter. Expect `ALL OK`.
