# Signing Day — College Football Recruiting

A college football recruiting simulator for the NIL and transfer-portal era. You are the director of recruiting at one of 98 real programs (real head coaches as of opening day 2026) — scout, recruit, sign, retain, and climb the coaching-staff ladder while the season plays out around you.

**Play:** https://mlstarr.github.io/signing-day/ — or open `index.html` in any browser (works great on mobile). Saves to your browser's local storage.

## Features
- **Three classes at once** — seniors, juniors and sophomores (3,300 prospects), with early commitments, unofficial visits, and late bloomers who appear as they grow
- Two independent ranking services (PrepGrid 300 & Blue Chip Index) plus a composite — about as accurate as the real thing
- Scouting with hidden ceilings, work ethic, character, GPA, and 14 hidden traits revealed through film, evals, visits, camps and playing time
- 12 recruit priorities, handlers and parents with their own agendas, a recruit social feed, dead periods
- Calls, pitches, assistant & head-coach visits, official visits tied to home-game results, NIL offers (with NIL Go flags), flips, decommits, commitment ceremonies
- **Real rosters for all 98 programs** — stats, injuries, Heisman race, All-America team, real transfer portal, real NFL Draft, walk-ons fill every roster after signing day
- Full weekly season: AP Top 25, CFP rankings, standings, title games, every bowl, 12-team playoff
- Rivalries, program momentum, buzz, prestige/NIL/facilities that rise and fall with results
- **Assistant coaches** with recruiting territories, position groups and schemes — hire, fire, and watch them get poached
- Camp season, national showcase, All-American Bowl announcements
- Coaching carousel — follow your coach (or a former assistant), stay, or hit the job market
- Director career: XP levels, perk tree, hands-on skills, AD requests & political capital, academic standards and honor codes, recruiting pipelines
- Legacy: trophy case, record book, Recruiter of the Year, Hall of Fame retirement
- Every school's UI is themed in its colors; installable as a phone app (PWA) with offline play
- 3 compressed save slots (IndexedDB), plus export/import to move careers between devices

## Development
Source lives in `src/` (`data.js`, `engine.js`, `ui.js`, `shell.html`). PWA files: `manifest.webmanifest`, `sw.js`, icons. Run `python3 build.py` to rebuild the single-file `index.html`.

To host on GitHub Pages: Settings → Pages → Deploy from branch → `main` / root. On your phone, open the site and use **Add to Home Screen** to install it.

When you ship an update, bump `CACHE` in `sw.js` so installed copies refresh.
