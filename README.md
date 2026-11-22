# Signing Day — College Football Recruiting

A college football recruiting simulator for the NIL and transfer-portal era. You are the director of recruiting at one of 98 real programs (real head coaches as of opening day 2026) — scout, recruit, sign, retain, and climb the coaching-staff ladder while the season plays out around you.

**Play:** https://mlstarr.github.io/signing-day/ — or open `index.html` in any browser (works great on mobile). Saves to your browser's local storage.

## Features
- 1,400-prospect classes ranked by two independent services (PrepGrid 300 & Blue Chip Index) plus a composite — about as accurate as the real thing
- Scouting with hidden ceilings, work ethic, character, GPA, and 14 hidden traits revealed through film, evals, visits and exposure
- 12 recruit priorities (playing time, NIL, winning, proximity, coach, NFL development, academics, brand, scheme fit, coaching stability, lifestyle, family ties)
- Calls, pitches, assistant & head-coach visits, official visits tied to home-game results, NIL offers (with NIL Go flags), flips, decommits, commitment ceremonies
- Full weekly season sim: AP Top 25, CFP rankings, conference standings and title games, bowls, 12-team playoff
- Rivalries that swing momentum, prestige, AD support and head-to-head recruits
- Dynamic programs: prestige, NIL power, facilities and buzz rise and fall with results
- Transfer portal, retention deals, player progression, NFL Draft
- Coaching carousel — follow your coach, stay, or hit the job market
- Director career: XP levels, perk tree, hands-on skills, AD requests & political capital, academic standards and honor codes, high-school and state recruiting pipelines
- Every school's UI is themed in its colors

## Development
Source lives in `src/` (`data.js`, `engine.js`, `ui.js`, `shell.html`). Run `python3 build.py` to rebuild the single-file `index.html`.

To host on GitHub Pages: Settings → Pages → Deploy from branch → `main` / root.
