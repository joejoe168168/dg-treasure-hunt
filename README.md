# DG Treasure Hunt · 尖沙咀尋寶記

A 3D treasure-hunt web game built with [three.js](https://threejs.org/), set in
**Jordan / Tsim Sha Tsui, Hong Kong** at dusk, following the real street layout.
Play as a schoolgirl in her white uniform with a royal-blue collar and waist belt and
explore real landmarks — the Clock Tower, Star Ferry Pier, Cultural Centre, Space Museum,
The Peninsula, 1881 Heritage, iSQUARE, Chungking Mansions, K11 MUSEA, Harbour City,
Kowloon Park & Mosque, St Andrew's Church, Temple Street Night Market, Avenue of Stars
and MTR stations — find all 16 treasure chests and climb the leaderboard!

## How to play

1. Enter your name, pick a **difficulty** and a **time of day**, then press **START**:
   - 🟢 Easy (P1–P2) — 15s per question, ×1 score (default)
   - 🟡 Medium (P3–P4) — 12s per question, ×1.5 score
   - 🔴 Hard (P5–P6) — 10s per question, ×2 score
   - 🌅 Morning (bright, default) or 🌃 Night (neon + Symphony of Lights) —
     switchable in-game any time with the HUD button
2. Find the **16 glowing treasure chests** at real TST landmarks (gold dots on the minimap).
3. Each chest asks **3 multiple-choice questions** (Math / English / Chinese / General
   knowledge) from a bank of **600 hand-written questions** (200 per difficulty,
   50 per subject, calibrated to the HK curriculum) plus endless generated math.
4. Fun along the way:
   - 💰 Coins (+10) and ⭐ golden stars (+25) all over the streets
   - 🎀 Mystery gifts — random +50/+100/+150 points or a speed boost
   - 😋 Street-food stalls (egg tarts, fishballs, egg waffles…) — +15 and an 8s speed boost
   - 💬 NPC schoolmates share Hong Kong fun facts, hints to the nearest chest, and +20
   - 🐶 A **puppy** waits by Kowloon Park — pet it and it follows you for the whole hunt!
   - 🐱 A **lucky cat (招財貓)** waves on the Nathan Road pavement — rub it once per
     game for a surprise bonus (up to +88!)
   - 🕊️ **Pigeon flocks** peck around the streets and scatter into the air as you run up
   - 🚇 **Ride the MTR!** Walk up to the Jordan or TST station entrance and press `E`
     to fast-travel to the other station
   - 💛 A hidden **Golden Bauhinia** is tucked away somewhere on the map — find it
     for a secret +200 bonus!
   - 🧧 **Red packet rain!** Every minute or two, lucky red packets flutter down
     around you — grab them quick for +20 each
   - 🐉 A **dragon dance** parades up and down Nathan Road — brush past it for a
     +30 luck bonus (once a minute)
   - 📸 **Photo spots** at the Clock Tower and Avenue of Stars — stand on the glowing
     ring for a camera flash and +25
   - 🎡 The **Observation Wheel** turns on the far shore beside the island skyline
   - 🚖 **Dodge the traffic!** Taxis, red double-deckers and HK minibuses cruise the
     roads — get hit and you lose 10 points, so use the zebra crossings!
   - 🎆 Answer all 3 correctly and **fireworks** light up the sky
   - 🌃 Watch the **Symphony of Lights** beams sweeping over Victoria Harbour
   - 🚁 A sightseeing **helicopter** circles the harbour with a blinking beacon
   - 🕊️ **Seagulls** wheel over the promenade; 🏮 **red lanterns** sway above Temple St
   - 🏮 Street life everywhere: working **pedestrian crossing lights** (flashing green
     man!), **bamboo scaffolding** with a safety net, **laundry swaying** over Temple
     Street, incense smoke at the **Tin Hau Temple**…
   - ✨ On desktop, neon signs **bloom and glow** with real post-processing
5. Scoring: correct answer +100 × multiplier plus a speed bonus; **streak combos**
   (3+ correct in a row) earn growing bonuses; all 3 correct = perfect bonus; finish
   fast for a completion time bonus!
6. Gentle background music plays in-game — toggle it with the 🔊 button.
7. Scores are **auto-saved**: locally in your browser, and — when deployed on
   Vercel with a Blob store — to a 🌍 **global leaderboard** shared by all players.

## Session modes

- **Full hunt** — complete all 16 landmark treasure chests.
- **Quick hunt** — a focused three-chest session.
- **Subject practice** — five chests using the selected subject only.
- **Free exploration** — explore, collect and interact without chest goals or traffic penalties.
- **Teacher mode** — the full hunt with no question timer or traffic penalty.

## Controls

| Action | Desktop | Mobile / Tablet |
| --- | --- | --- |
| Move | `WASD` or arrow keys | Floating joystick — touch anywhere on the lower screen |
| Open chest / talk / pet / rub | `E` | 🎁 / 💬 / 🐶 / 🐱 button |
| Orbit camera | Right-click and drag | Fixed follow camera |
| Reset camera | `R` | Settings → Reset camera |
| Pause / settings | `Esc` or ⚙️ | ⚙️ Settings |

## Run it

This is a Vite-powered static site. Three.js is installed locally, so the game
does not depend on a runtime CDN import.
Browsers block ES modules from `file://`, so run it through the included local
server. Node.js 20 or newer is supported:

```bash
npm install
npm run dev
```

Then open http://localhost:8000. V1 is at `/` and the experimental comparison
build is at `/v2/`.

Useful verification commands:

```bash
npm run check         # JavaScript syntax and all 600 questions
npm test              # gameplay smoke test
npm run test:visual   # desktop/mobile controls and layout
npm run test:functional # interactions, pickups, MTR, victory and saving
npm run test:chests   # all 16 landmark chest locations
npm run test:props    # scenery interaction check
npm run test:performance # desktop/mobile FPS and long-frame audit
```

Generated reference screenshots are written to `test-artifacts/`.

### If the game appears frozen

Use the HTTP server URL (`http://127.0.0.1:8000/`), then do a hard refresh
(`Ctrl+Shift+R` on Windows/Linux or `Cmd+Shift+R` on macOS) after pulling changes.
The game now pauses world simulation behind the start screen and throttles the
HUD, objective guide, and minimap work so those updates do not block rendering.
The `buttons.js` “refresh_token 无效” message belongs to the surrounding Codex
browser host, not this game bundle; it can be ignored when diagnosing game FPS.

## V2 comparison build

The redesigned museum version is available at http://localhost:8000/v2/.
On Windows, double-click `START-V2.cmd` in the project root to start the local
server and open V2 automatically. Do not open `v2/index.html` directly: browser
security prevents JavaScript modules and Three.js from running over `file://`.

## Deploy (Vercel)

Vite builds the static V1 and V2 clients, plus one serverless function provides
the global leaderboard:

1. Import the repo on **Vercel** (Framework Preset: **Vite**, build command
   `npm run build`, output directory `dist`).
2. In the project's **Storage** tab, create / connect a **Blob** store
   (e.g. `dg-treasure-hunt-blob`) with env prefix `BLOB` — this injects
   `BLOB_READ_WRITE_TOKEN`, which `api/leaderboard.js` uses.
3. Deploy. Scores now auto-save to the shared global leaderboard.

Without the Blob store (or when running locally) the game gracefully falls back
to the browser-local leaderboard.

## Project structure

```
index.html          UI overlays (start, difficulty, HUD, quiz, results, leaderboard)
css/style.css       All styling
js/main.js          Game engine: loop, controls, camera, chests, pickups, quiz flow
js/character.js     Procedural 3D girl model in uniform + walk animation
js/world.js         Jordan/TST street grid, buildings, neon, harbour, park, market
js/landmarks.js     Real TST landmarks (Clock Tower, Peninsula, K11, Mosque, …)
js/questions.js     question engine + procedural math generator
js/questions/       600 hand-written questions, one file per tier
js/audio.js         WebAudio sound effects + background music (no audio files)
js/leaderboard.js   global leaderboard client (+ localStorage fallback)
api/leaderboard.js  Vercel serverless function — global board in Vercel Blob
```
