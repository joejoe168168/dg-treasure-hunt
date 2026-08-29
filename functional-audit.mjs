import puppeteer from 'puppeteer-core';
import { browserExecutable } from './browser-path.mjs';
import { artifactPath } from './test-artifacts.mjs';

const BASE = 'http://127.0.0.1:8000/';
const browser = await puppeteer.launch({
  executablePath: browserExecutable(),
  headless: 'new',
  args: ['--window-size=1280,800', '--use-gl=angle', '--enable-unsafe-swiftshader'],
});

const results = [];
const errors = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const assert = (condition, label, details = '') => {
  if (!condition) throw new Error(`${label}${details ? ` — ${details}` : ''}`);
  results.push(`PASS ${label}`);
};

async function makePage({ mobile = false, path = '' } = {}) {
  const page = await browser.newPage();
  if (mobile) {
    await page.emulate({
      name: 'Audit touch device',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
      viewport: { width: 844, height: 390, deviceScaleFactor: 2, isMobile: true, hasTouch: true, isLandscape: true },
    });
  } else {
    await page.setViewport({ width: 1280, height: 800 });
  }
  page.on('pageerror', error => errors.push(`PAGEERROR ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error' && !message.location()?.url?.includes('/api/leaderboard')) {
      errors.push(`CONSOLE ${message.text()}`);
    }
  });
  await page.goto(BASE + path, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction(() => window.__dg?.state);
  return page;
}

async function startGame(page, { name = 'FunctionalGirl', difficulty = 'easy', night = false } = {}) {
  await page.type('#player-name', name);
  if (difficulty !== 'easy') await page.click(`[data-diff="${difficulty}"]`);
  if (night) await page.click('[data-time="night"]');
  await page.click('#start-btn');
  await page.waitForFunction(() => window.__dg.state.phase === 'play');
  await delay(250);
}

async function teleport(page, objectExpression, offset = { x: 0, z: 0 }) {
  await page.evaluate(({ objectExpression, offset }) => {
    const object = Function(`return (${objectExpression})`)();
    window.__dg.girl.position.set(object.position.x + offset.x, 0, object.position.z + offset.z);
  }, { objectExpression, offset });
  await delay(180);
}

async function projectedPoint(page, objectExpression, yOffset = 1) {
  return page.evaluate(({ objectExpression, yOffset }) => {
    const object = Function(`return (${objectExpression})`)();
    const point = object.position.clone();
    point.y += yOffset;
    point.project(window.__dg.camera);
    const rect = document.getElementById('game-canvas').getBoundingClientRect();
    return {
      x: rect.left + (point.x + 1) * rect.width / 2,
      y: rect.top + (1 - point.y) * rect.height / 2,
    };
  }, { objectExpression, yOffset });
}

try {
  // Hard/night start and both keyboard control families.
  {
    const page = await makePage();
    await startGame(page, { difficulty: 'hard', night: true, name: 'NightAudit' });
    const mode = await page.evaluate(() => ({
      difficulty: window.__dg.state.difficulty,
      morning: window.__dg.state.morning,
      phase: window.__dg.state.phase,
    }));
    assert(mode.difficulty === 'hard' && !mode.morning && mode.phase === 'play', 'hard game starts in night mode');

    const before = await page.evaluate(() => ({ x: window.__dg.girl.position.x, z: window.__dg.girl.position.z }));
    await page.keyboard.down('KeyW'); await delay(350); await page.keyboard.up('KeyW');
    await page.keyboard.down('ArrowDown'); await delay(350); await page.keyboard.up('ArrowDown');
    await page.keyboard.down('ArrowLeft'); await delay(350); await page.keyboard.up('ArrowLeft');
    await page.keyboard.down('KeyD'); await delay(350); await page.keyboard.up('KeyD');
    const after = await page.evaluate(() => ({ x: window.__dg.girl.position.x, z: window.__dg.girl.position.z }));
    assert(Math.hypot(after.x - before.x, after.z - before.z) < 2.5, 'WASD and arrow keys move in opposite cardinal pairs');
    await page.mouse.move(700, 400);
    await page.mouse.down({ button: 'right' });
    await page.mouse.move(780, 340, { steps: 4 });
    await page.mouse.up({ button: 'right' });
    assert(await page.evaluate(() => Math.abs(window.__dg.cameraOrbit.yaw) > 0.05 && Math.abs(window.__dg.cameraOrbit.pitch) > 0.05),
      'right-drag adjusts horizontal and vertical camera orbit');
    await page.keyboard.press('KeyR');
    assert(await page.evaluate(() => window.__dg.cameraOrbit.yaw === 0 && window.__dg.cameraOrbit.pitch === 0),
      'R resets the camera');
    await page.keyboard.press('Escape');
    assert(await page.evaluate(() => window.__dg.state.phase === 'paused'), 'Escape pauses the game');
    await page.keyboard.press('Escape');
    assert(await page.evaluate(() => window.__dg.state.phase === 'play'), 'Escape resumes the game');
    await page.close();
  }

  // Keyboard E opens a nearby chest.
  {
    const page = await makePage();
    await startGame(page);
    await teleport(page, 'window.__dg.chests[0]', { x: 0, z: -2 });
    await page.keyboard.press('KeyE');
    await page.waitForFunction(() => window.__dg.state.phase === 'quiz');
    assert(true, 'E opens a nearby treasure chest');
    await page.close();
  }

  // Session modes change mission, learning and safety rules without changing controls.
  {
    const quick = await makePage();
    await quick.type('#player-name', 'QuickAudit');
    await quick.click('[data-session="quick"]'); await quick.click('#start-btn');
    const quickState = await quick.evaluate(() => ({
      goal: window.__dg.state.chestGoal,
      active: window.__dg.chests.filter(ch => ch.userData.active).length,
      duration: window.__dg.state.sessionDurationSeconds,
      deadlineSet: window.__dg.state.sessionDeadline > window.__dg.state.startTime,
      timerVisible: !document.querySelector('#hud-session-time').classList.contains('hidden'),
    }));
    assert(quickState.goal === 3 && quickState.active === 3, 'quick hunt limits the mission to three chests');
    assert(quickState.duration === 600 && quickState.deadlineSet && quickState.timerVisible,
      'quick hunt starts a visible ten-minute session clock');
    await quick.evaluate(() => { window.__dg.state.sessionDeadline = performance.now() - 1; });
    await quick.waitForFunction(() => window.__dg.state.phase === 'victory');
    const quickExpired = await quick.evaluate(() => ({
      title: document.querySelector('#victory-title').textContent,
      visible: !document.querySelector('#victory-screen').classList.contains('hidden'),
    }));
    assert(quickExpired.visible && quickExpired.title.includes('時間到'), 'quick hunt reaches the time-up result when its deadline expires');
    await quick.close();

    const practice = await makePage();
    await practice.type('#player-name', 'PracticeAudit');
    await practice.click('[data-session="practice"]'); await practice.click('#start-btn');
    await practice.evaluate(() => window.__dg.openChest(window.__dg.chests[0]));
    const practiceQuestions = await practice.evaluate(() => window.__dg.quiz.questions.map(question => question.subject));
    assert(new Set(practiceQuestions).size === 3 && ['math', 'english', 'chinese'].every(subject => practiceQuestions.includes(subject)),
      'practice mode selects one Maths, one English and one Chinese question');
    await practice.close();

    const explore = await makePage();
    await explore.type('#player-name', 'ExploreAudit');
    await explore.click('[data-session="explore"]'); await explore.click('#start-btn');
    const exploreState = await explore.evaluate(() => ({ goal: window.__dg.state.chestGoal, traffic: window.__dg.state.trafficEnabled, active: window.__dg.chests.filter(ch => ch.userData.active).length }));
    assert(exploreState.goal === 0 && !exploreState.traffic && exploreState.active === 0, 'free exploration removes objectives and traffic penalties');
    await explore.close();

    const teacher = await makePage();
    await teacher.type('#player-name', 'TeacherAudit');
    await teacher.click('[data-session="teacher"]'); await teacher.click('#start-btn');
    await teacher.evaluate(() => window.__dg.openChest(window.__dg.chests[0]));
    const teacherState = await teacher.evaluate(() => ({ timed: window.__dg.state.sessionTimed, traffic: window.__dg.state.trafficEnabled, timer: document.getElementById('timer-bar').style.width }));
    assert(!teacherState.timed && !teacherState.traffic && teacherState.timer === '100%', 'teacher mode removes time pressure and traffic penalties');
    await teacher.close();
  }

  // Mouse raycasting opens the actual 3D chest model.
  {
    const page = await makePage({ path: '?inspect=chest' });
    const distant = await page.evaluate(() => {
      window.__dg.girl.position.set(0, 0, -15);
      const before = window.__dg.state.score;
      const result = window.__dg.interactions.activateByRef('chest', window.__dg.chests[0]);
      return { status: result.status, phase: window.__dg.state.phase, unchanged: before === window.__dg.state.score };
    });
    assert(distant.status === 'too-far' && distant.phase === 'play' && distant.unchanged,
      'distant interaction gives guidance without granting a reward');
    await page.evaluate(() => window.__dg.girl.position.set(-65, 0, 107));
    const point = await projectedPoint(page, 'window.__dg.chests[0]', 0.55);
    await page.mouse.click(point.x, point.y);
    await page.waitForFunction(() => window.__dg.state.phase === 'quiz');
    assert(true, 'mouse click opens the visible 3D chest');
    await page.close();
  }

  // Every interaction type resolves through the desktop pointer/raycast pipeline.
  {
    const page = await makePage();
    await startGame(page, { name: 'MouseAudit' });
    const clickObject = async (expression, offset, yOffset = 1) => {
      await teleport(page, expression, offset);
      const point = await projectedPoint(page, expression, yOffset);
      await page.mouse.click(point.x, point.y);
      await delay(180);
    };
    await clickObject('window.__dg.npcs[0].model', { x: 0, z: -1.5 }, 1.2);
    assert(await page.evaluate(() => window.__dg.npcs[0].talked), 'mouse click talks to an NPC');
    await clickObject('window.__dg.dog', { x: 0, z: -1.2 }, 0.6);
    assert(await page.evaluate(() => window.__dg.dogFollowing), 'mouse click adopts the puppy');
    await clickObject('window.__dg.luckyCat', { x: 0, z: -1.4 }, 1.1);
    assert(await page.evaluate(() => window.__dg.catRubbed), 'mouse click rubs the lucky cat');
    await page.evaluate(() => window.__dg.girl.position.set(12, 0, -68)); await delay(150);
    const mtrPoint = await projectedPoint(page, "window.__dg.interactions.find('mtr', 0).root", 0);
    await page.mouse.click(mtrPoint.x, mtrPoint.y);
    await page.waitForFunction(() => !window.__dg.mtrBusy && window.__dg.girl.position.z > 35);
    assert(true, 'mouse click rides the MTR');
    await page.close();
  }

  // NPC, puppy, lucky-cat and MTR interaction paths.
  {
    const page = await makePage();
    await startGame(page);
    await teleport(page, 'window.__dg.npcs[0].model', { x: 0, z: -1.5 });
    const scoreBefore = await page.evaluate(() => window.__dg.state.score);
    await page.keyboard.press('KeyE'); await delay(150);
    const npc = await page.evaluate(() => ({ score: window.__dg.state.score, talked: window.__dg.npcs[0].talked }));
    assert(npc.talked && npc.score === scoreBefore + 20, 'NPC conversation awards its one-time bonus');
    await page.keyboard.press('KeyE'); await delay(100);
    assert(await page.evaluate(expected => window.__dg.state.score === expected, npc.score),
      'completed NPC reward cannot be earned twice');

    await teleport(page, 'window.__dg.dog', { x: 0, z: -1.2 });
    await page.keyboard.press('KeyE'); await delay(150);
    assert(await page.evaluate(() => window.__dg.dogFollowing), 'puppy can be adopted with E');

    await teleport(page, 'window.__dg.luckyCat', { x: 0, z: -1.4 });
    await page.keyboard.press('KeyE'); await delay(150);
    assert(await page.evaluate(() => window.__dg.catRubbed), 'lucky cat can be rubbed with E');
    assert(await page.evaluate(() => window.__dg.interactions.activateByRef('cat', window.__dg.luckyCat).status === 'completed'),
      'completed pet interaction is rejected by the shared registry');

    await page.evaluate(() => window.__dg.girl.position.set(12, 0, -68));
    await delay(180);
    await page.keyboard.press('KeyE');
    await page.waitForFunction(() => !window.__dg.mtrBusy && window.__dg.girl.position.z > 35);
    assert(true, 'MTR fast travel reaches the other station');
    await page.close();
  }

  // Touch action button and direct tap are real mobile input paths.
  {
    const page = await makePage({ mobile: true });
    await startGame(page, { name: 'TouchAudit' });
    await teleport(page, 'window.__dg.dog', { x: 0, z: -1.2 });
    await page.waitForSelector('#action-btn:not(.hidden)');
    await page.click('#action-btn'); await delay(150);
    assert(await page.evaluate(() => window.__dg.dogFollowing), 'mobile action button adopts the puppy');

    await teleport(page, 'window.__dg.luckyCat', { x: 0, z: -1.4 });
    const point = await projectedPoint(page, 'window.__dg.luckyCat', 1.2);
    await page.touchscreen.tap(point.x, point.y); await delay(180);
    assert(await page.evaluate(() => window.__dg.catRubbed), 'touching the 3D lucky cat activates it');
    await page.close();
  }

  // Touch raycasting covers the remaining object types; dog/cat are covered above.
  {
    const page = await makePage({ mobile: true });
    await startGame(page, { name: 'TouchRayAudit' });
    const tapObject = async (expression, offset, yOffset = 1) => {
      await teleport(page, expression, offset);
      const point = await projectedPoint(page, expression, yOffset);
      await page.touchscreen.tap(point.x, point.y);
      await delay(180);
    };
    await tapObject('window.__dg.npcs[0].model', { x: 0, z: -1.5 }, 1.2);
    assert(await page.evaluate(() => window.__dg.npcs[0].talked), 'touch tap talks to an NPC');
    await page.evaluate(() => window.__dg.girl.position.set(12, 0, -68)); await delay(150);
    const mtrPoint = await projectedPoint(page, "window.__dg.interactions.find('mtr', 0).root", 0);
    await page.touchscreen.tap(mtrPoint.x, mtrPoint.y);
    await page.waitForFunction(() => !window.__dg.mtrBusy && window.__dg.girl.position.z > 35);
    assert(true, 'touch tap rides the MTR');
    await tapObject('window.__dg.chests[0]', { x: 0, z: -2 }, 0.55);
    await page.waitForFunction(() => window.__dg.state.phase === 'quiz');
    assert(true, 'touch tap opens a chest');
    await page.close();
  }

  // Pickup rewards and traffic penalty.
  {
    const page = await makePage();
    await startGame(page);
    const pickup = async (kind, index = 0) => {
      await page.evaluate(({ kind, index }) => {
        const item = window.__dg[kind][index];
        const source = item.group || item;
        window.__dg.girl.position.set(source.position.x, 0, source.position.z);
        window.__dg.checkPickups();
      }, { kind, index });
    };
    await pickup('coins'); await pickup('stars'); await pickup('gifts'); await pickup('foodStalls');
    const collected = await page.evaluate(() => ({
      coins: window.__dg.state.coinsCollected,
      stars: window.__dg.state.starsCollected,
      gift: window.__dg.gifts[0].userData.taken,
      food: window.__dg.foodStalls[0].eaten,
      boosted: window.__dg.state.boostUntil > performance.now(),
    }));
    assert(collected.coins === 1 && collected.stars === 1 && collected.gift && collected.food && collected.boosted,
      'coin, star, gift and food pickups grant their rewards');

    await page.evaluate(() => {
      window.__dg.state.score = 100;
      const vehicle = window.__dg.world.vehicles[0];
      window.__dg.girl.position.copy(vehicle.group.position);
      window.__dg.state.hitInvulnUntil = 0;
    });
    await page.waitForFunction(() => window.__dg.state.score === 90, { timeout: 3000 });
    assert(true, 'traffic collision applies the ten-point penalty');
    await page.close();
  }

  // First-session onboarding journey through the first chest.
  {
    const page = await makePage();
    await page.evaluate(() => localStorage.removeItem('dg-treasure-hunt-tutorial-v1'));
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.__dg?.state);
    await startGame(page, { name: 'TutorialAudit' });
    await page.keyboard.down('KeyW'); await delay(250); await page.keyboard.up('KeyW');
    await page.evaluate(() => {
      const coin = window.__dg.coins.find(item => !item.userData.taken);
      window.__dg.girl.position.set(coin.position.x, 0, coin.position.z);
      window.__dg.checkPickups();
      const chest = window.__dg.chests[0];
      window.__dg.girl.position.set(chest.position.x, 0, chest.position.z - 2);
    });
    await delay(150);
    await page.keyboard.press('KeyE');
    for (let i = 0; i < 3; i++) {
      await page.waitForSelector('#quiz-answers .answer-btn:not([disabled])');
      await page.click('#quiz-answers .answer-btn'); await delay(1450);
    }
    await page.waitForSelector('#chest-result:not(.hidden)');
    await page.click('#chest-continue-btn');
    const tutorialJourney = await page.evaluate(() => ({
      tutorialDone: localStorage.getItem('dg-treasure-hunt-tutorial-v1') === 'done',
      chests: window.__dg.state.chestsOpened,
      phase: window.__dg.state.phase,
    }));
    assert(tutorialJourney.tutorialDone && tutorialJourney.chests === 1 && tutorialJourney.phase === 'play',
      'a new player can follow move, collect and interact onboarding through the first chest');
    await page.close();
  }

  // First-session tutorial and settings persistence.
  {
    const page = await makePage();
    await page.evaluate(() => {
      localStorage.removeItem('dg-treasure-hunt-tutorial-v1');
      localStorage.removeItem('dg-treasure-hunt-settings-v1');
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.__dg?.state);
    await startGame(page, { name: 'SettingsAudit' });
    await page.waitForSelector('#tutorial-card:not(.hidden)');
    await page.click('#tutorial-skip');
    await page.waitForFunction(() => localStorage.getItem('dg-treasure-hunt-tutorial-v1') === 'done');
    await page.click('#pause-btn');
    await page.click('#reduced-motion-setting');
    await page.click('#invert-camera-setting');
    await page.click('#fixed-camera-setting');
    for (const [selector, value] of [
      ['#camera-sensitivity-setting', '1.4'], ['#music-volume-setting', '0.6'], ['#effects-volume-setting', '0.7'],
    ]) {
      await page.$eval(selector, (element, next) => {
        element.value = next; element.dispatchEvent(new Event('input', { bubbles: true }));
      }, value);
    }
    await page.select('#language-setting', 'en');
    await page.select('#text-size-setting', 'large');
    await page.select('#quality-setting', 'low');
    await page.click('#online-scores-setting');
    await page.click('#resume-btn');
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.__dg?.state);
    await startGame(page, { name: 'SettingsAudit' });
    const persisted = await page.evaluate(() => ({
      tutorialHidden: document.getElementById('tutorial-card').classList.contains('hidden'),
      reducedMotion: document.body.classList.contains('reduced-motion'),
      settingChecked: document.getElementById('reduced-motion-setting').checked,
      largeText: document.body.dataset.textSize === 'large',
      onlineScores: document.getElementById('online-scores-setting').checked,
      tutorialStored: localStorage.getItem('dg-treasure-hunt-tutorial-v1'),
      settings: JSON.parse(localStorage.getItem('dg-treasure-hunt-settings-v1') || '{}'),
    }));
    assert(persisted.tutorialHidden && persisted.reducedMotion && persisted.settingChecked && persisted.largeText && !persisted.onlineScores &&
      persisted.settings.invertCamera && persisted.settings.fixedCamera &&
      persisted.settings.cameraSensitivity === 1.4 && persisted.settings.musicVolume === 0.6 &&
      persisted.settings.effectsVolume === 0.7 && persisted.settings.language === 'en' && persisted.settings.textSize === 'large' &&
      persisted.settings.onlineScores === false &&
      persisted.settings.quality === 'low',
      'tutorial completion and accessibility settings survive refresh', JSON.stringify(persisted));
    await page.close();
  }

  // Last-chest progression, victory, local save and replay persistence.
  {
    const page = await makePage();
    await startGame(page, { name: 'VictoryAudit' });
    await page.evaluate(() => {
      window.__dg.chests.slice(0, 15).forEach(chest => { chest.userData.opened = true; });
      window.__dg.state.chestsOpened = 15;
      window.__dg.openChest(window.__dg.chests[15]);
    });
    for (let i = 0; i < 3; i++) {
      await page.waitForSelector('#quiz-answers .answer-btn:not([disabled])');
      await page.click('#quiz-answers .answer-btn');
      await delay(1450);
    }
    await page.waitForSelector('#chest-result:not(.hidden)');
    await page.click('#chest-continue-btn');
    await page.waitForSelector('#victory-screen:not(.hidden)');
    const victory = await page.evaluate(() => ({
      phase: window.__dg.state.phase,
      opened: window.__dg.state.chestsOpened,
      saved: JSON.parse(localStorage.getItem('dg-treasure-hunt-leaderboard-v1') || '[]')
        .some(entry => entry.name.includes('VictoryAudit')),
    }));
    assert(victory.phase === 'victory' && victory.opened === 16, 'sixteenth chest reaches the victory screen');
    assert(victory.saved, 'victory score is saved locally');
    await page.screenshot({ path: artifactPath('verify-victory.png') });

    await page.click('#replay-btn');
    await page.waitForFunction(() => window.__dg?.state?.phase === 'start');
    const replay = await page.evaluate(() => ({
      startVisible: !document.getElementById('start-screen').classList.contains('hidden'),
      saved: JSON.parse(localStorage.getItem('dg-treasure-hunt-leaderboard-v1') || '[]')
        .some(entry => entry.name.includes('VictoryAudit')),
    }));
    assert(replay.startVisible && replay.saved, 'replay resets the game without corrupting saved scores');
    await page.close();
  }
} catch (error) {
  errors.push(`AUDIT ${error.stack || error.message}`);
} finally {
  await browser.close();
}

console.log(results.join('\n'));
console.log(errors.length ? `FAIL\n${errors.join('\n')}` : `Functional audit passed (${results.length} checks).`);
process.exit(errors.length ? 1 : 0);
