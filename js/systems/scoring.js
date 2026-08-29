export function scoreCorrectAnswer({ timeLeft, multiplier, previousStreak }) {
  const streak = previousStreak + 1;
  const speedBonus = Math.round(Math.max(0, timeLeft) * 5);
  let points = Math.round((100 + speedBonus) * multiplier);
  let streakBonus = 0;
  if (streak >= 3) {
    streakBonus = Math.round(streak * 10 * multiplier);
    points += streakBonus;
  }
  return { points, streak, streakBonus };
}

export function perfectChestBonus(multiplier) {
  return Math.round(150 * multiplier);
}

export function scoreMissedAnswer(reason = 'incorrect') {
  return { points: 0, streak: 0, reason: reason === 'timeout' ? 'timeout' : 'incorrect' };
}
