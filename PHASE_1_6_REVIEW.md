# Phase 1–6 Development Review

Reviewed: 2026-07-13

This review compares the roadmap claims with the current V1 implementation, automated checks, production build and hands-on browser inspection. A checked task means that a feature exists; it does not by itself mean that the phase is release-complete.

## Executive assessment

The project has moved from a single experimental Three.js page to a testable game with modular gameplay systems, sixteen working landmarks, multiple input methods, session modes, 600 validated questions and capability-based rendering. The foundation is sound and current checks pass.

Phases 1–6 are not all complete. The largest gaps are the 1,600-line composition file, procedural landmark quality that still needs art direction and approval, incomplete resource lifecycle/loading work, coarse educational metadata, and missing release/accessibility/security gates.

| Phase | Assessment | Evidence | Main remaining work |
|---|---|---|---|
| 1 — Architecture | Partly complete | Input, interaction, quiz, mission, scoring and update systems are extracted and tested. | `js/main.js` is still about 1,600 lines and owns UI flow, camera, pickups, events and composition. |
| 2 — UX and controls | Strong, not signed off | Onboarding, objective guidance, settings, mouse/touch/keyboard paths and persistence have automated coverage. | Complete keyboard/focus accessibility, make language preference change actual copy, and run structured child/user testing. |
| 3 — Waterfront pipeline | Functional prototype | Vite/local Three.js, procedural landmarks, QA views and performance measurements exist. | The GLTF manager is not used by production assets; no approved promotional-quality visual baseline exists. |
| 4 — Full-map consistency | Partly complete | Sixteen chest locations, district landmarks, roads, street props and navigation checks exist. | Add façade depth/rooftop detail, reduce filler repetition, and bring weaker districts to the waterfront bar. |
| 5 — Performance/reliability | Partly complete | Quality presets, visibility pause, named update systems and a repeatable FPS/draw-call test exist. | Add pooling, spatial indexing, disposal, progressive loading, failure states and frame-time/load-time gates. |
| 6 — Education | Feature-complete foundation | 600 unique questions, stable content IDs, metadata, deterministic selection, recent history, mastery and five session modes exist. | Topic metadata is broad, reviewer fields need real curriculum sign-off, and learning outcomes need teacher testing. |

## Defects and inconsistencies found during review

- [x] Quick Hunt was labelled “ten minutes” but had no session deadline. A real 600-second timer and time-up path were added.
- [x] Mastery was recorded but not used for selection. Weak/unseen topics are now preferred within the selected difficulty.
- [x] The HUD markup was checked for duplicate IDs; the live source contains one mute button.
- [ ] The language selector persists a value but does not yet translate or filter most interface copy.
- [ ] The performance test measures average FPS but does not yet enforce long-frame or load-time budgets.
- [ ] Visual quality claims still require human approval on representative desktop/mobile morning/night captures.
- [ ] Remote leaderboard validation and concurrency behavior require deployment-level verification.

## Verification evidence

- [x] `npm run check` — syntax, 600-question validation, core systems and adaptive-selection tests.
- [x] `npm run build` — V1 and V2 production output generated successfully.
- [x] Initial browser load — start screen renders with no console errors.
- [x] Previous functional suite — keyboard, mouse, touch, chests, session modes, pickups, traffic, persistence and victory.
- [x] Fresh full functional, visual, chest and performance suites after the review changes.
- [ ] Manual morning/night and desktop/mobile sign-off after the review changes.

## Decision

Continue improving V1. Keep V2 as an experiment until it offers a clearly better gameplay and art result. Do not call Phases 1–6 “finished”; call them a stable feature foundation with architecture, art-production and release-hardening debt.
