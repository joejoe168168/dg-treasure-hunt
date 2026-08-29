# DG Treasure Hunt Detailed Execution Plan

This document is designed to be followed by a developer or AI coding agent. Check an item only after its stated verification has passed.

## Operating rules for agents

- [x] Treat V1 at `/` as the production product.
- [x] Treat `/v2/` as experimental unless a task explicitly targets it.
- [x] Preserve all existing user changes and inspect `git status` before editing.
- [x] Do not remove a gameplay feature merely to simplify refactoring.
- [x] Make small, reviewable changes with one primary purpose.
- [x] Run proportional verification after every meaningful change.
- [ ] Test both morning and night modes when changing materials or lighting.
- [x] Test desktop and mobile layouts when changing UI or input.
- [x] Keep keyboard, mouse and touch behavior consistent.
- [ ] Record newly discovered defects under the relevant phase before fixing them.
- [ ] Do not mark a milestone complete while required checks are failing.

## Status legend

- `[ ]` Not started
- `[x]` Completed and verified
- `[~]` In progress; replace with `[x]` only after verification
- `[!]` Blocked; describe the blocker immediately below the item

---

# Phase 0 — Establish a stable baseline

Progress recorded 2026-07-12:

- Reproducible Node 20+ setup, lockfile and cross-platform browser discovery are in place.
- `build`, syntax, 600-question validation, gameplay smoke, desktop/mobile visual,
  all-16-chest and scenery interaction checks pass.
- V1 and V2 both respond over the documented local HTTP server.
- The leaderboard storage dependency was upgraded and `npm audit` reports zero vulnerabilities.
- The complete interaction/victory matrix, screenshot organisation and line-ending
  normalisation now pass. Only a user-approved baseline commit/tag remains.

## 0.1 Repository and change audit

- [x] Run `git status --short` and record all modified and untracked files.
- [x] Separate V1 improvements from V2 experimental work.
- [x] Review current diffs for accidental generated files or unrelated changes.
- [ ] Decide whether V2 should be committed, archived or excluded from the next V1 release.
- [ ] Create a baseline tag or commit after all Phase 0 checks pass.

Verification:

- [x] Working-tree changes are understood and intentionally scoped.
- [x] No user-owned work has been overwritten.
- [ ] The production baseline can be restored from Git.

## 0.2 Reproducible development environment

- [x] Confirm the supported Node.js version.
- [x] Add `package-lock.json` using the supported package manager.
- [x] Add a local static-development server dependency or documented equivalent.
- [x] Replace platform-specific start behavior with cross-platform scripts where practical.
- [x] Add scripts for `dev`, `test`, `validate:questions`, `check` and `build`.
- [x] Document Windows startup separately if `START-V2.cmd` remains.
- [x] Confirm a fresh checkout can install without undocumented global tools.

Verification:

- [x] Delete/recreate dependencies in a safe test environment.
- [x] Run the documented install command successfully.
- [x] Run the documented development command successfully.
- [x] Load `/` and `/v2/` over HTTP.

## 0.3 Encoding and source consistency

- [x] Ensure all HTML, CSS, JavaScript and Markdown files are UTF-8.
- [x] Add or update `.editorconfig`.
- [x] Add or update `.gitattributes` for consistent line endings.
- [x] Search for visible mojibake in source and rendered UI.
- [x] Verify Traditional Chinese text in Chrome/Edge on Windows.

Verification:

- [x] No broken Chinese characters appear in the rendered game.
- [x] Git no longer reports unexpected line-ending conversions.

## 0.4 Baseline functional audit

- [x] Start a new easy game in morning mode.
- [x] Start a new hard game in night mode.
- [x] Verify WASD and arrow-key movement.
- [x] Verify the mobile joystick.
- [x] Verify `E`, object clicking, object tapping and the action button.
- [x] Verify chest quiz progression.
- [x] Verify NPC conversation.
- [x] Verify puppy and lucky-cat interactions.
- [x] Verify MTR fast travel.
- [x] Verify coins, stars, gifts and food boosts.
- [x] Verify traffic penalties.
- [x] Verify all sixteen chest locations.
- [x] Verify victory and replay.
- [x] Verify local leaderboard saving.
- [x] Verify remote leaderboard fallback behavior.

Verification gate:

- [x] No blocking console errors.
- [x] All sixteen chests are reachable.
- [x] A full game can reach victory.
- [x] Refresh/replay does not corrupt saved data.

## 0.5 Baseline visual evidence

- [x] Capture desktop morning screenshot at start.
- [x] Capture desktop night screenshot at start.
- [x] Capture desktop screenshots of each major landmark.
- [x] Capture mobile portrait gameplay screenshot.
- [x] Capture quiz and victory screenshots.
- [x] Store reference images in a documented test-artifact location.

Milestone 0 definition of done:

- [x] Fresh setup is reproducible.
- [x] Encoding is stable.
- [x] Baseline tests pass.
- [x] Reference screenshots exist.
- [ ] A recoverable V1 baseline is tagged or committed.

---

# Phase 1 — Modularise the engine without changing gameplay

Progress recorded 2026-07-12:

- Added a dedicated input controller for keyboard and floating-joystick state.
- Preserved north/up movement, E interaction, touch tapping and mobile action-button behavior.
- The 31-check functional audit and desktop/mobile visual audit pass after extraction.

## 1.1 Introduce an application structure

Target structure:

```text
js/
  app/
    game.js
    game-state.js
    config.js
  systems/
    input-controller.js
    interaction-system.js
    camera-controller.js
    mission-system.js
    quiz-system.js
    pickup-system.js
    event-system.js
    save-system.js
    audio-system.js
  world/
    world.js
    roads.js
    traffic.js
    environment.js
    landmarks/
  ui/
    hud.js
    screens.js
    minimap.js
```

- [x] Create modules without moving behavior initially.
- [x] Move shared constants into `config.js`.
- [x] Move state construction into `game-state.js`.
- [x] Keep a temporary compatibility layer while extracting systems.
- [x] Remove compatibility code only after equivalent tests exist.

## 1.2 Extract input handling

- [x] Move keyboard listeners into `input-controller.js`.
- [x] Move joystick handling into the same controller.
- [x] Move pointer raycasting into the same interaction pipeline.
- [x] Define normalized actions: `move`, `interact`, `pause`, `cameraReset`.
- [x] Prevent duplicate interaction from a single tap/click.
- [x] Define input enable/disable rules for start, play, quiz and victory phases.

Verification:

- [x] Keyboard behavior matches the baseline.
- [x] Mouse clicking matches the baseline.
- [x] Touch tapping and joystick dragging do not conflict.
- [x] Interaction cannot trigger behind an overlay.

## 1.3 Extract interaction handling

- [x] Create one registry for chests, NPCs, pets, MTR and future objects.
- [x] Define interaction distance per object type.
- [x] Define hover, prompt, activate and completed states.
- [x] Make `E`, click, tap and action button call the same activation method.
- [x] Add deterministic tests for near/far interaction behavior.

Verification:

- [x] Each object type passes keyboard, mouse and touch tests.
- [x] Clicking a distant object gives guidance but no reward.
- [x] Completed objects cannot be rewarded twice.

## 1.4 Extract quiz and progression

- [x] Move question selection into `quiz-system.js`.
- [x] Move timer lifecycle into the quiz system.
- [x] Move scoring and streak logic into a tested scoring module.
- [x] Move chest completion and victory detection into `mission-system.js`.
- [x] Make rendering consume state rather than mutate progression directly.

Verification:

- [x] Three questions complete one chest.
- [x] Timeout, correct and incorrect answers score correctly.
- [x] Sixteen completed chests trigger victory exactly once.

## 1.5 Extract world and update systems

- [x] Replace the general `world.updatables` array with named systems.
- [x] Separate traffic updates from decorative animation.
- [x] Separate particle/event updates from persistent world entities.
- [x] Add lifecycle methods: `start`, `update`, `reset`, `dispose`.
- [x] Confirm replay does not leak timers, audio nodes or objects.

Milestone 1 definition of done:

- [ ] `main.js` is primarily application composition, not gameplay implementation.
- [x] No gameplay features were removed.
- [x] Baseline functional and visual tests still pass.
- [x] Core progression can be tested without rendering the full scene.

---

# Phase 2 — Controls, onboarding and UI/UX

Progress recorded 2026-07-12:

- Added a skippable, persistent three-step move/collect/interact tutorial.
- Added a live nearest-chest compass, distance, landmark name and hint action.
- Added pause/resume, camera reset, smooth-camera and reduced-motion settings.
- Added automated refresh-persistence coverage and fixed pointer handling discovered by the audit.

## 2.1 First-session onboarding

- [x] Add a short three-step tutorial: move, collect, interact.
- [x] Point the player to one nearby chest.
- [x] Explain minimap symbols only when first needed.
- [x] Allow returning players to skip onboarding.
- [x] Store tutorial completion locally.

## 2.2 Objective guidance

- [x] Add an optional nearest-chest compass.
- [x] Add distance-to-objective text.
- [x] Highlight the next recommended landmark without locking exploration.
- [x] Detect unreachable or hidden chest placement in tests.
- [x] Add a “show hint” action after prolonged inactivity.

## 2.3 HUD redesign

- [x] Group score, progress and collectibles by importance.
- [x] Reduce the number of independent floating pills.
- [x] Keep minimap clear of controls at all breakpoints.
- [x] Ensure transient toasts do not cover questions or crossings.
- [x] Add a compact mobile layout.
- [x] Add a pause/settings button.

## 2.4 Camera settings

- [x] Add sensitivity settings.
- [x] Add optional inverted vertical control.
- [x] Add camera reset.
- [x] Prevent camera clipping into buildings.
- [x] Add obstruction handling between camera and player.
- [x] Preserve a simple fixed-camera option for younger players.

## 2.5 Settings persistence

- [x] Store music volume.
- [x] Store effects volume.
- [x] Store camera sensitivity.
- [x] Store preferred language.
- [x] Store reduced-motion preference.
- [x] Store quality preference with an automatic default.

Milestone 2 definition of done:

- [x] A new player completes the first chest without external instructions.
- [x] No HUD overlap at supported desktop and mobile sizes.
- [x] All input methods remain available.
- [x] Settings survive refresh.

---

# Phase 3 — Waterfront visual-production pipeline

Progress recorded 2026-07-12:

- Adopted Vite with multi-page V1/V2 production output and local Three.js bundling.
- Added a shared GLTF loading manager with progress/error reporting.
- Documented GLB naming, coordinates, texture/material, collision and LOD conventions.
- Production build passes. Automated measurements sustain about 58–60 FPS on
  desktop and mobile while remaining inside documented geometry/texture/draw-call ceilings.

## 3.1 Asset pipeline

- [x] Adopt Vite or another suitable bundler.
- [x] Bundle Three.js locally rather than depending exclusively on CDN imports.
- [x] Define GLTF/GLB naming and export conventions.
- [x] Define texture-size and material conventions.
- [x] Define collision-mesh conventions.
- [x] Define high/medium/low LOD conventions.
- [x] Add a loading manager with progress reporting.

## 3.2 Landmark quality bar

Each landmark must include:

- [x] Correct recognisable silhouette.
- [x] Correct relative scale.
- [x] Distinct entrances and street-facing side.
- [x] Material roughness appropriate to stone, brick, glass or metal.
- [x] A simplified collision mesh.
- [x] At least one lower-detail version where needed.
- [x] Morning and night appearance.
- [x] A verified chest interaction point.

## 3.3 Waterfront assets

- [x] Clock Tower final procedural model and materials.
- [x] Star Ferry Pier final procedural model and materials.
- [x] Cultural Centre final procedural model and materials.
- [x] Space Museum final procedural model and materials.
- [x] Salisbury Road upgrade.
- [x] Promenade paving and railings.
- [x] Benches, planters, trees and signage.
- [x] Harbour material and reflections.
- [x] Waterfront lighting and night identity.

## 3.4 Waterfront verification

- [x] Confirm every landmark is recognisable without its sign.
- [x] Confirm no model blocks roads or chest access.
- [x] Confirm shadows do not flicker.
- [x] Confirm night materials remain readable.
- [x] Confirm the district stays within draw-call and memory budgets.

Milestone 3 definition of done:

- [ ] The waterfront is suitable for promotional screenshots.
- [x] Desktop meets the target frame rate.
- [x] Mobile meets the target frame rate using appropriate LODs.
- [ ] Visual regression screenshots are approved.

---

# Phase 4 — Full-map visual consistency

Progress recorded 2026-07-12:

- All named districts are represented with bespoke landmark geometry, materials and chest access.
- Roads, street furniture, façade variation, emissive signage and tiered lighting are covered by
the existing world/landmark systems and regression screenshots.

## 4.1 Landmark batches

- [x] Peninsula and 1881 Heritage.
- [x] K11 MUSEA and Avenue of Stars.
- [x] Kowloon Park and Kowloon Mosque.
- [x] iSQUARE and Chungking Mansions.
- [x] Harbour City and Ocean Terminal.
- [x] Temple Street and Tin Hau Temple.
- [x] St Andrew's Church.
- [x] Jordan and TST MTR entrances.

## 4.2 City fabric

- [x] Create reusable residential façade modules.
- [x] Create reusable shopfront modules.
- [ ] Add balconies, air conditioners, pipes and rooftop utilities selectively.
- [x] Improve kerbs, lane arrows, bus markings and crossings.
- [x] Add consistent street-name signs.
- [x] Add bins, barriers, bollards and seating.
- [ ] Replace obviously repeated filler patterns.
- [x] Instance repeated windows, lamps and trees.

## 4.3 Lighting consistency

- [x] Establish morning exposure and colour targets.
- [x] Establish night exposure and bloom targets.
- [x] Limit decorative dynamic lights by quality tier.
- [x] Use emissive materials where real lights are unnecessary.
- [x] Verify skin, uniform and quiz overlays remain correctly exposed.

Milestone 4 definition of done:

- [ ] No district looks substantially less finished than the waterfront.
- [x] Road hierarchy is visually clear.
- [x] Landmark scale and placement remain navigable.
- [x] Performance budgets still pass.

---

# Phase 5 — Performance and reliability

Progress recorded 2026-07-12:

- Added capability-aware low/medium/high presets and persisted manual quality override.
- Rendering pauses when the document is hidden; profiling tracks FPS, draw calls, geometry,
  texture and named update-system counts.

## 5.1 Capability-based quality tiers

- [x] Replace touch-only quality detection with renderer capability detection.
- [x] Measure maximum texture size and shader limits.
- [x] Define low, medium and high presets.
- [x] Scale pixel ratio by preset.
- [x] Scale shadows by preset.
- [x] Scale post-processing by preset.
- [x] Scale object density and LOD by preset.
- [x] Allow manual override in settings.

## 5.2 Runtime optimisation

- [x] Instance repeated meshes.
- [ ] Pool fireworks, sparkles and red packets.
- [ ] Add spatial indexing for collisions and interaction searches.
- [x] Pause rendering when the document is hidden.
- [ ] Dispose replaced materials, textures and geometries.
- [x] Remove inactive event listeners and timers on reset.
- [x] Profile CPU, GPU, memory and draw calls.

## 5.3 Loading

- [ ] Load the minimum playable district first.
- [ ] Load distant districts progressively.
- [ ] Show useful progress and retry states.
- [ ] Handle failed or missing assets gracefully.
- [ ] Consider a service worker after the asset pipeline is stable.

Performance gates:

- [ ] Typical desktop: stable 60 FPS.
- [x] Supported mobile: stable 30 FPS.
- [ ] No regular gameplay frame exceeds 100 ms.
- [ ] No shader compilation failures.
- [ ] Initial playable load is approximately five seconds or better on normal Wi-Fi.

---

# Phase 6 — Educational progression

Progress recorded 2026-07-12:

- All 600 questions now have permanent IDs and structured learning metadata.
- Removed the two cross-tier duplicates; validation now reports 600 unique questions.
- Recent-question persistence, local topic mastery and deterministic seeded selection are covered by tests.
- Added full, quick, subject-practice, free-exploration and teacher session modes with
  mode-specific chest goals, subject filtering, timer and traffic rules.

## 6.1 Question data quality

- [x] Give every question a permanent ID.
- [x] Remove the two detected duplicates.
- [x] Add year-level metadata.
- [x] Add subject and topic metadata.
- [x] Add skill metadata.
- [x] Add language metadata.
- [x] Add source/reviewer metadata where appropriate.
- [x] Validate answer index and option uniqueness.

## 6.2 Selection and mastery

- [x] Prevent immediate question repetition.
- [x] Track recent questions locally.
- [x] Track correct/incorrect performance by topic.
- [x] Adapt selection within safe difficulty bounds.
- [x] Keep manual difficulty selection available.
- [x] Add deterministic seeded selection for tests.

## 6.3 Session modes

- [x] Full sixteen-landmark hunt.
- [x] Ten-minute quick hunt.
- [x] Subject-practice mode.
- [x] Free-exploration mode.
- [x] Teacher mode without time pressure.
- [x] Teacher mode without traffic penalties.

Milestone 6 definition of done:

- [x] Selection behavior is deterministic under test.
- [x] Progress is stored by topic rather than score alone.
- [x] Session modes clearly describe their learning purpose.

---

# Phase 7 — Accessibility, safety and release

## 7.1 Accessibility

- [x] Keyboard-operable start, quiz, results and settings screens.
- [x] Visible focus indicators.
- [x] Screen-reader names and status announcements.
- [x] Colour-independent correct/incorrect feedback.
- [x] Reduced-motion mode.
- [x] Adjustable text size.
- [x] Separate music and effects volume.
- [ ] Traditional Chinese and English preferences.
- [x] Avoid interactions requiring precise pointer movement.

## 7.2 Leaderboard and privacy

- [x] Validate names on the server.
- [x] Validate plausible score and time ranges.
- [x] Render all leaderboard values as text rather than HTML.
- [ ] Add rate limiting.
- [ ] Handle concurrent score writes safely.
- [x] Document stored data and retention.
- [x] Avoid collecting unnecessary child identifiers.
- [x] Add a way to play without submitting a score.

## 7.3 Release automation

- [x] Add production build verification.
- [x] Add CI checks for production build and dependency audit.
- [ ] Add a staging environment.
- [x] Add release notes and version display.
- [x] Add rollback documentation.
- [ ] Tag the production release.

Final release gate:

- [x] All currently implemented automated checks pass.
- [ ] Desktop and mobile manual smoke tests pass.
- [ ] Accessibility checklist passes.
- [x] Performance budgets pass.
- [ ] Leaderboard security checks pass.
- [x] Full sixteen-chest automated playthrough passes.
- [ ] Deployment and rollback are documented.

---

# Standard verification commands

These commands describe the intended verification interface. Update them during Phase 0 if the package scripts differ.

```powershell
npm install
npm run check
npm run validate:questions
npm test
npm run build
```

Manual browser targets:

```text
http://localhost:8000/
http://localhost:8000/?inspect=clock
http://localhost:8000/?inspect=space
http://localhost:8000/?inspect=k11
http://localhost:8000/v2/
```

# Per-task agent completion template

Copy this block into an issue, task or working note:

```markdown
## Task

<Concrete objective>

## Scope

- [ ] Files and systems in scope are identified.
- [ ] Existing user changes are reviewed.
- [ ] Out-of-scope behavior is recorded.

## Implementation

- [ ] Smallest safe change implemented.
- [ ] Existing behavior preserved unless intentionally changed.
- [ ] New behavior documented where necessary.

## Verification

- [ ] Syntax/static checks pass.
- [ ] Relevant automated tests pass.
- [ ] Desktop behavior checked.
- [ ] Mobile behavior checked when applicable.
- [ ] Morning/night checked when applicable.
- [ ] No new browser console errors.

## Handoff

- [ ] Changed files listed.
- [ ] Known limitations listed.
- [ ] Follow-up work added to the roadmap.
```
