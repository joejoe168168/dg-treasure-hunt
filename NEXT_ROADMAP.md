# DG Treasure Hunt — Next Roadmap

Created: 2026-07-13

This roadmap starts from the evidence in `PHASE_1_6_REVIEW.md`. Work in order. Check an item only after its verification directly passes.

## Phase 7 — Close the foundation gaps

Goal: make existing features truthful, measurable and safe to extend.

- [x] Make Quick Hunt an actual ten-minute session with a visible countdown.
- [x] Add a deterministic time-up path and system tests.
- [x] Use topic mastery to prioritize weaker/unseen content.
- [x] Keep adaptive selection inside the manually chosen difficulty.
- [x] Replace random-comparator shuffling with deterministic Fisher–Yates shuffling.
- [x] Replace index-derived question IDs with stable content IDs and add a migration map.
- [ ] Split broad subjects into curriculum-relevant topics and skills.
- [ ] Replace placeholder source/reviewer values with traceable review records.

Verification gate:

- [x] Question and session-clock system tests pass.
- [x] Functional browser suite passes after timer integration.
- [x] A timed-out Quick Hunt is verified in the real UI.

## Phase 8 — Accessibility, child usability and UI clarity

Goal: allow a primary-school player to operate every screen without precise mouse control.

- [x] Add semantic dialog roles and labelled controls to all overlays.
- [x] Add visible `:focus-visible` treatment for every interactive control.
- [x] Add focus trapping/restoration for quiz, settings, results and victory.
- [x] Add live-region announcements for quiz feedback and timer warnings.
- [x] Add colour-independent answer feedback with symbols and text.
- [x] Add text-size choices and persist them.
- [ ] Make the language preference actually switch interface copy.
- [x] Pause the session clock while Pause & Settings is open; per-question quiz time remains active only inside quizzes.
- [ ] Run keyboard-only, touch-only and 390×844 mobile audits.
- [ ] Conduct at least three observed child/teacher play sessions and record friction points.

Verification gate:

- [x] Automated structural accessibility audit covers dialogs, labels, focus trapping and symbolic feedback.
- [ ] All screens complete with keyboard only.
- [ ] All gameplay interactions complete with touch only.

## Phase 9 — Architecture and runtime reliability

Goal: reduce change risk and make a larger, richer map affordable.

- [ ] Reduce `js/main.js` to application composition and lifecycle wiring.
- [ ] Extract camera, pickups, traffic consequences, events and screen flow.
- [x] Add a spatial hash/grid for collision queries.
- [ ] Pool sparkles, fireworks, red packets and other transient objects.
- [x] Add explicit unload disposal for geometry, material, texture, renderer and audio resources; reset ownership remains to be measured.
- [ ] Add reset/replay leak measurements.
- [ ] Load a minimum playable district first and stream later districts.
- [ ] Add asset failure, retry and fallback UI.
- [ ] Split the Three.js/post-processing bundle and remove the production chunk warning.

Verification gate:

- [ ] `main.js` is below 500 lines.
- [ ] Ten replay cycles show no increasing timers, objects or renderer memory.
- [ ] Initial playable state is reached in about five seconds on the agreed test profile.
- [ ] No regular gameplay frame exceeds 100 ms in the performance sample.

## Phase 10 — Visual landmark and street upgrade

Goal: make Tsim Sha Tsui recognisable from shape, street context and material response.

- [ ] Establish approved morning/night reference views for every major district.
- [ ] Upgrade Clock Tower, Space Museum, Peninsula, K11 MUSEA, iSQUARE and Star Ferry first.
- [x] Add an initial instanced façade-detail pass with balconies and AC units; pipes, canopies and roof plant remain.
- [ ] Replace repeated filler blocks with district-specific modules.
- [ ] Improve junction geometry, lane markings, kerbs, crossings, bus stops and signs.
- [ ] Add LOD and instancing rules to every new asset.
- [ ] Keep paths, chest approaches and camera sightlines clear.

Verification gate:

- [ ] Each priority landmark is recognisable without a floating label.
- [ ] Morning/night desktop/mobile comparison captures are approved.
- [x] Performance budgets remain green after the instanced façade-detail batch.

## Phase 11 — Education, teacher tools and content operations

Goal: turn the question bank into a maintainable learning product.

- [ ] Define learning objectives and topic taxonomy for P1–P6.
- [x] Add a versioned question schema and migration validation.
- [x] Add teacher-visible mastery summaries without exposing unnecessary child data.
- [ ] Add session presets that teachers can copy/share locally.
- [ ] Add review workflow and expiry/recheck dates for general-knowledge questions.
- [ ] Add import/export tools for curriculum reviewers.
- [ ] Measure question difficulty and distractor quality from privacy-safe aggregate results.

Verification gate:

- [ ] A teacher can configure and run a lesson session without developer help.
- [ ] Every production question has traceable curriculum/reviewer status.

## Phase 12 — Privacy, security and release

Goal: produce a deployable school-safe release with rollback evidence.

- [x] Validate and normalize leaderboard names, scores, times and difficulty server-side.
- [x] Render every remote field without HTML injection.
- [ ] Add rate limiting and concurrency-safe score updates.
- [x] Add an explicit local-only/no-submission option.
- [x] Document data collected, purpose, retention and the current administrator deletion path.
- [x] Add CI for static/system checks, production build and dependency audit.
- [x] Add staging guidance, release version display, release notes and rollback instructions.
- [ ] Run a complete sixteen-chest production-like playthrough.
- [ ] Create the baseline/release commit and tag only after user approval.

Final gate:

- [ ] Automated, browser, accessibility, performance and security gates pass.
- [ ] Desktop/mobile and morning/night manual smoke tests pass.
- [ ] School stakeholder approves gameplay, learning content and privacy wording.
