# test tools (Playwright is preinstalled: require('playwright'))
Start the site first:  `cd /home/claude/marium-birthday- && (setsid nohup python3 -m http.server 8766 >/dev/null 2>&1 &)`
- `node .claude/tools/shots.js 393 852 4 5 12`   -> screenshots to $OUT (default /tmp/shots) as p<n>_<w>.png (omit pages = all). Read them with the Read tool.
- `node .claude/tools/flow.js`                   -> visits every page in FLOW, prints cur/on-page/errors
- `node .claude/tools/audio-peak.js chime key star:14:90`   -> plays SFX names (name:N:ms = N overlapping calls SFX.name(i) every ms), prints peak (must stay < 0.95)
Output noise from the proxy ("agent-proxy"/fonts) can be ignored: pipe through `grep -v "agent-proxy\|Allowed\|For details\|googleapis"`.

## Added 2026-11-13 (all need the local server: `cd <repo> && (setsid nohup python3 -m http.server 8766 >/dev/null 2>&1 &)`)
- `monkey.js W H [pages] [late]`  random taps on EMPTY screen of every page. Expect `ok` (no page change, no sound, video not restarted). `late` = p5 after 12s, p11 after end. (p4 changes page by its own 5.3s timer, p17/p7/p14/p6/p12 react because their objects fill the screen: fine.)
- `scrollnext.js W H [pages]`  every gated page: ready -> hint -> wheel scroll -> Next pill -> click goes to nextOf. Writes /tmp/shots/sx_W_n_{h,m,e}.png.
- `stage1.js`  functional checks: p19 box taps vs empty taps, p5 Continue only, p11 pause button / no tap-replay, go(same page) no-op.
- `video.js`  p11 end state + Next pill (local python server cannot seek video, so it fires `ended` by hand).
- `glassshots.js W H`  screenshots of p5/p11/p17/p19 to judge the liquid-glass look (/tmp/shots/g2_W_n.png); stitch with PIL and READ them.

