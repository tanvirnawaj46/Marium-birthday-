# test tools (Playwright is preinstalled: require('playwright'))
Start the site first:  `cd /home/claude/marium-birthday- && (setsid nohup python3 -m http.server 8766 >/dev/null 2>&1 &)`
- `node .claude/tools/shots.js 393 852 4 5 12`   -> screenshots to $OUT (default /tmp/shots) as p<n>_<w>.png (omit pages = all). Read them with the Read tool.
- `node .claude/tools/flow.js`                   -> visits every page in FLOW, prints cur/on-page/errors
- `node .claude/tools/audio-peak.js chime key`   -> plays SFX names, prints peak (must stay < 0.95)
Output noise from the proxy ("agent-proxy"/fonts) can be ignored: pipe through `grep -v "agent-proxy\|Allowed\|For details\|googleapis"`.
