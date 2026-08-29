export class QuizView {
  constructor({ screen, result, category, progress, question, answers, feedback, timerBar,
    resultEmoji, resultTitle, resultText }) {
    Object.assign(this, { screen, result, category, progress, question, answers, feedback, timerBar,
      resultEmoji, resultTitle, resultText });
  }

  showQuestion({ item, index, total, category, onAnswer }) {
    this.screen.classList.remove('hidden');
    this.category.textContent = category.label;
    this.category.className = `cat-badge ${category.cls}`;
    this.progress.textContent = `第 ${index + 1} / ${total} 題`;
    this.question.textContent = item.q;
    this.feedback.className = 'hidden';
    this.answers.replaceChildren();
    item.a.forEach((text, choice) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer-btn';
      button.textContent = text;
      button.setAttribute('aria-label', `答案 ${choice + 1}: ${text}`);
      button.addEventListener('click', () => onAnswer(choice, button), { once: true });
      this.answers.appendChild(button);
    });
  }

  setTimer(ratio) { this.timerBar.style.width = `${Math.max(0, ratio) * 100}%`; }

  lockAnswers(correctChoice, wrongButton) {
    const buttons = [...this.answers.children];
    buttons.forEach(button => { button.disabled = true; });
    buttons[correctChoice]?.classList.add('correct');
    wrongButton?.classList.add('wrong');
  }

  showFeedback(text, kind) {
    this.feedback.textContent = text;
    this.feedback.className = kind;
  }

  hideQuestion() { this.screen.classList.add('hidden'); }

  showResult({ emoji, title, html }) {
    this.resultEmoji.textContent = emoji;
    this.resultTitle.textContent = title;
    this.resultText.innerHTML = html;
    this.result.classList.remove('hidden');
  }

  hideResult() { this.result.classList.add('hidden'); }
}
