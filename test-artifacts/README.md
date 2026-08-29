# Test artifacts

Automated browser checks write their screenshots into this directory. PNG files
are intentionally ignored by Git because they are generated evidence rather
than source files.

Generate the current reference set with:

```bash
npm test
npm run test:visual
npm run test:functional
npm run test:chests
npm run test:props
npm run test:scenic
```

The set covers start/game/quiz/result/victory screens, morning and night modes,
mobile landscape controls, all sixteen treasure chests and landmark/scenery
inspection views.
