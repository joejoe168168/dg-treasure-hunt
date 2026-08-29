import { pickQuestions } from '../questions.js';

export class QuizSystem {
  constructor() { this.reset(); }

  reset() {
    this.stopTimer();
    this.questions = [];
    this.index = 0;
    this.correct = 0;
    this.earned = 0;
    this.deadline = 0;
    this.chest = null;
    this.timeoutId = null;
  }

  start(chest, difficulty, count = 3, options = {}) {
    this.reset();
    this.chest = chest;
    this.questions = pickQuestions(count, difficulty, options);
    return this.current;
  }

  get current() { return this.questions[this.index]; }

  advance() {
    this.index++;
    return this.index < this.questions.length;
  }

  beginTimer(seconds, { onTick, onTimeout }) {
    this.stopTimer();
    this.deadline = performance.now() + seconds * 1000;
    let previousSecond = seconds;
    const tick = () => {
      const milliseconds = Math.max(0, this.deadline - performance.now());
      const secondsLeft = Math.ceil(milliseconds / 1000);
      onTick({ milliseconds, secondsLeft, previousSecond, ratio: milliseconds / (seconds * 1000) });
      previousSecond = secondsLeft;
      if (milliseconds <= 0) { this.timeoutId = null; onTimeout(); return; }
      this.timeoutId = requestAnimationFrame(tick);
    };
    tick();
  }

  stopTimer() {
    if (this.timeoutId != null) cancelAnimationFrame(this.timeoutId);
    this.timeoutId = null;
  }

  dispose() { this.reset(); }
}
