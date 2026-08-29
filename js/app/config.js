export const GAME_CONFIG = Object.freeze({
  totalQuestionsPerChest: 3,
  playerRadius: 0.45,
  playerSpeed: 9,
  cameraOffset: Object.freeze({ x: 0, y: 9.5, z: -11.5 }),
  interactionDistance: Object.freeze({
    chest: 5.2,
    npc: 4.2,
    dog: 4.2,
    cat: 4.2,
    mtr: 7.5,
  }),
});

export const STORAGE_KEYS = Object.freeze({
  tutorial: 'dg-treasure-hunt-tutorial-v1',
  settings: 'dg-treasure-hunt-settings-v1',
});
