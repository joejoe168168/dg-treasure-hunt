# DG Treasure Hunt Product Roadmap

## Product direction

V1 is the production baseline. It already contains the stronger game loop, sixteen landmarks, 600 questions, collectibles, traffic, pets, NPCs, events, MTR travel, scoring and a leaderboard.

V2 should remain an experimental prototype. Ideas from V2 may be brought into V1 individually, but V1 should not be replaced by V2.

The strategy is an incremental modular rebuild: preserve the working game while gradually improving architecture, controls, visuals, performance, accessibility and educational progression.

## Current assessment

| Area | Status | Main concern |
| --- | --- | --- |
| Gameplay variety | Strong | Discovery can feel unstructured |
| Educational content | Strong | 600 questions, but only 598 are unique |
| Hong Kong identity | Strong | Landmark quality remains inconsistent |
| Controls | Improving | Keyboard, mouse and touch need unified regression tests |
| UI and UX | Moderate | Crowded HUD and limited onboarding |
| Visual quality | Moderate | Detailed landmarks sit beside simple filler buildings |
| Mobile performance | Fragile | Every touch device receives the same reduced-quality mode |
| Accessibility | Weak | Limited focus, screen-reader and reduced-motion support |
| Architecture | Weak | Rendering, state and gameplay are concentrated in large files |
| Automated testing | Weak | Question checks work, but the full environment is not reproducible |
| Deployment | Moderate | CDN dependencies and leaderboard security need strengthening |

## Success measures

- Preserve all current V1 gameplay features.
- All sixteen chests remain visible, reachable and completable.
- Keyboard, mouse and touch use the same interaction rules.
- Typical desktop computers maintain 60 FPS.
- Supported mobile devices maintain at least 30 FPS.
- No shader failures or invisible-world failures.
- A first-time player can complete the first chest without adult help.
- Every major landmark is recognisable without its floating sign.
- A fresh checkout can install, test, build and run using documented commands.
- Progress, quiz completion and victory are covered by automated tests.

## Release roadmap

### Release 1.1 — Stable baseline

Goal: create a reproducible, recoverable V1 release.

- Establish a clean V1 baseline and archive V2 as experimental.
- Commit current work in reviewable groups.
- Add dependency locking and repeatable commands.
- Resolve source encoding and line-ending inconsistencies.
- Add baseline desktop/mobile screenshots.
- Verify every chest and interaction point.

User outcome: the current game is reliable and can be safely improved.

### Release 1.2 — Modular engine and better onboarding

Goal: reduce regression risk and improve the first ten minutes.

- Split the central engine into focused systems.
- Make landmarks and interactions data-driven.
- Add a guided first mission and clearer objective feedback.
- Simplify the HUD hierarchy.
- Unify keyboard, mouse and touch interactions.
- Add pause and settings screens.

User outcome: clearer controls, easier navigation and fewer bugs.

### Release 1.3 — Waterfront showcase

Goal: create one visually polished showcase district.

- Finish Clock Tower, Star Ferry Pier, Cultural Centre and Space Museum.
- Improve Salisbury Road and the waterfront promenade.
- Add consistent materials, props, vegetation and lighting.
- Introduce asset loading, lightmaps and level-of-detail support.
- Add visual regression and performance tests for the district.

User outcome: an immediately impressive and recognisable Tsim Sha Tsui waterfront.

### Release 1.4 — Complete landmark and street upgrade

Goal: bring the whole world to a consistent quality level.

- Upgrade Peninsula and 1881 Heritage.
- Upgrade K11 MUSEA and Avenue of Stars.
- Upgrade Kowloon Park and Mosque.
- Upgrade iSQUARE, Chungking Mansions and Nathan Road.
- Upgrade Harbour City, Temple Street and St Andrew's Church.
- Improve filler buildings, shopfronts, street furniture and roads.

User outcome: a coherent Jordan/Tsim Sha Tsui world rather than isolated good models.

### Release 1.5 — Learning, accessibility and teachers

Goal: turn the game into a stronger educational platform.

- Give every question a permanent ID and curriculum metadata.
- Remove duplicates and improve selection rules.
- Add mastery tracking and adaptive difficulty.
- Add quick hunt, full hunt, subject practice and free exploration modes.
- Add teacher-friendly time-limit and traffic-penalty settings.
- Add keyboard navigation, screen-reader labels and reduced motion.
- Add language, text-size and volume preferences.

User outcome: more suitable learning sessions for different ages and needs.

### Release 2.0 — Production launch

Goal: deliver a secure, optimised public/school release.

- Complete performance budgets and device testing.
- Add progressive loading and offline/PWA support where appropriate.
- Harden leaderboard validation, sanitisation and rate limiting.
- Add privacy-conscious diagnostics.
- Complete release documentation and deployment automation.

User outcome: a polished, reliable game suitable for wider school use.

## Recommended order

Do not begin full-world visual production before the baseline and architecture work. The recommended sequence is:

1. Stabilise and tag V1.
2. Modularise state, input, interaction and progression.
3. Produce the waterfront showcase.
4. Extend the visual system across the full map.
5. Improve education and accessibility.
6. Harden, optimise and release.

## Indicative schedule

For one developer or one primary AI-assisted workflow, the roadmap is approximately 10–14 weeks.

| Phase | Estimate |
| --- | ---: |
| Stable baseline | 3–5 days |
| Modular engine | 2–3 weeks |
| Controls and UX | 1–2 weeks |
| Visual production | 3–5 weeks |
| Performance | 1–2 weeks |
| Learning and accessibility | 1–2 weeks |
| Release hardening | 1–2 weeks |

