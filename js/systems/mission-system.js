export function completeChest(state, totalChests) {
  state.chestsOpened = Math.min(totalChests, state.chestsOpened + 1);
  return { complete: state.chestsOpened >= totalChests, remaining: totalChests - state.chestsOpened };
}

export function missionStatus(state, totalChests) {
  return { complete: state.chestsOpened >= totalChests, remaining: Math.max(0, totalChests - state.chestsOpened) };
}
