# DG Treasure Hunt · 尖沙咀尋寶記

A 3D treasure-hunt web game built with [three.js](https://threejs.org/), set in
**Jordan / Tsim Sha Tsui, Hong Kong** at dusk, following the real street layout.
Play as a schoolgirl in her white uniform with a royal-blue collar and waist belt and
explore real landmarks — the Clock Tower, Star Ferry Pier, Cultural Centre, Space Museum,
The Peninsula, 1881 Heritage, iSQUARE, Chungking Mansions, K11 MUSEA, Harbour City,
Kowloon Park & Mosque, St Andrew's Church, Temple Street Night Market, Avenue of Stars
and MTR stations — find all 16 treasure chests and climb the leaderboard!

## How to play

1. Enter your name, pick a **difficulty**, and press **START**:
   - 🟢 Easy (P1–P2) — 15s per question, ×1 score (default)
   - 🟡 Medium (P3–P4) — 12s per question, ×1.5 score
   - 🔴 Hard (P5–P6) — 10s per question, ×2 score
2. Find the **16 glowing treasure chests** at real TST landmarks (gold dots on the minimap).
3. Each chest asks **3 multiple-choice questions** (Math / English / Chinese / General
   knowledge) from a bank of **310+ hand-written questions** plus endless generated math.
4. Fun along the way:
   - 💰 Coins (+10) and ⭐ golden stars (+25) all over the streets
   - 🎀 Mystery gifts — random +50/+100/+150 points or a speed boost
   - 😋 Street-food stalls (egg tarts, fishballs, egg waffles…) — +15 and an 8s speed boost
   - 💬 NPC schoolmates share Hong Kong fun facts, hints to the nearest chest, and +20
   - 🐶 A **puppy** waits by Kowloon Park — pet it and it follows you for the whole hunt!
   - 🚖 **Dodge the traffic!** Taxis, red double-deckers and HK minibuses cruise the
     roads — get hit and you lose 10 points, so use the zebra crossings!
   - 🎆 Answer all 3 correctly and **fireworks** light up the sky
   - 🌃 Watch the **Symphony of Lights** beams sweeping over Victoria Harbour
5. Scoring: correct answer +100 × multiplier plus a speed bonus; **streak combos**
   (3+ correct in a row) earn growing bonuses; all 3 correct = perfect bonus; finish
   fast for a completion time bonus!
6. Gentle background music plays in-game — toggle it with the 🔊 button.
7. Your score is saved to a persistent **leaderboard** (stored in your browser).

## Controls

| Action | Desktop | Mobile / Tablet |
| --- | --- | --- |
| Move | `WASD` or arrow keys | Left-side virtual joystick |
| Open chest / talk / pet | `E` | 🎁 / 💬 / 🐶 button |

## Run it

This is a fully static site (three.js loads from CDN, so internet is required).
Browsers block ES modules from `file://`, so serve it with any static server:

```bash
# Python
python -m http.server 8000

# or Node
npx serve .
```

Then open http://localhost:8000

## Deploy (Vercel / GitHub Pages / Netlify)

No build step needed — deploy the repository root as a static site.
On **Vercel**: import the repo, set Framework Preset to **Other**, leave build
command empty and output directory as the root. Done!

## Project structure

```
index.html          UI overlays (start, difficulty, HUD, quiz, results, leaderboard)
css/style.css       All styling
js/main.js          Game engine: loop, controls, camera, chests, pickups, quiz flow
js/character.js     Procedural 3D girl model in uniform + walk animation
js/world.js         Jordan/TST street grid, buildings, neon, harbour, park, market
js/landmarks.js     Real TST landmarks (Clock Tower, Peninsula, K11, Mosque, …)
js/questions.js     310+ tiered questions (easy/medium/hard) + procedural math
js/audio.js         WebAudio sound effects (no audio files needed)
js/leaderboard.js   localStorage top-10 leaderboard
```
