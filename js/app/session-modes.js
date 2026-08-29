export const SESSION_MODES = Object.freeze({
  full: { label: '完整尋寶 Full hunt', goal: 16, timed: true, traffic: true, durationSeconds: null, description: '探索全部十六個地標。' },
  quick: { label: '十分鐘快線 Quick hunt', goal: 3, timed: true, traffic: true, durationSeconds: 600, description: '在十分鐘內完成三個精選地標挑戰。' },
  practice: { label: '三科練習 Balanced practice', goal: 5, timed: true, traffic: false, durationSeconds: null, description: '每個寶箱都有數學、英文和中文各一題。' },
  explore: { label: '自由探索 Free exploration', goal: 0, timed: false, traffic: false, durationSeconds: null, description: '沒有寶箱目標，自由探索尖沙咀。' },
  teacher: { label: '教師模式 Teacher mode', goal: 16, timed: false, traffic: false, durationSeconds: null, description: '沒有時間壓力或交通扣分。' },
});

export function configureSession(state, chests, mode = 'full') {
  const config = SESSION_MODES[mode] || SESSION_MODES.full;
  state.sessionMode = mode;
  state.chestGoal = config.goal;
  state.sessionTimed = config.timed;
  state.sessionDurationSeconds = config.durationSeconds;
  state.sessionDeadline = 0;
  state.trafficEnabled = config.traffic;
  chests.forEach((chest, index) => {
    chest.userData.active = mode === 'explore' ? false : index < config.goal;
    chest.visible = chest.userData.active;
  });
  return config;
}

export function startSessionClock(state, now = performance.now()) {
  state.startTime = now;
  state.sessionPausedAt = 0;
  state.sessionDeadline = state.sessionDurationSeconds == null
    ? 0
    : now + state.sessionDurationSeconds * 1000;
}

export function pauseSessionClock(state, now = performance.now()) {
  if (state.sessionDeadline && !state.sessionPausedAt) state.sessionPausedAt = now;
}

export function resumeSessionClock(state, now = performance.now()) {
  if (!state.sessionPausedAt) return;
  if (state.sessionDeadline) state.sessionDeadline += Math.max(0, now - state.sessionPausedAt);
  state.sessionPausedAt = 0;
}

export function sessionSecondsRemaining(state, now = performance.now()) {
  if (!state.sessionDeadline) return null;
  return Math.max(0, Math.ceil((state.sessionDeadline - now) / 1000));
}

export function sessionHasExpired(state, now = performance.now()) {
  return state.sessionDeadline > 0 && now >= state.sessionDeadline;
}
