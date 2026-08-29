const FOCUSABLE = [
  'button:not([disabled])', 'input:not([disabled])', 'select:not([disabled])',
  'textarea:not([disabled])', 'a[href]', '[tabindex]:not([tabindex="-1"])',
].join(',');

export class DialogAccessibility {
  constructor(document) {
    this.document = document;
    this.activeDialog = null;
    this.previousFocus = null;
    this.dialogs = [...document.querySelectorAll('[role="dialog"]')];
    this.onKeyDown = this.onKeyDown.bind(this);
    document.addEventListener('keydown', this.onKeyDown);
    this.observer = new MutationObserver(records => this.onMutations(records));
    this.dialogs.forEach(dialog => this.observer.observe(dialog, { attributes: true, attributeFilter: ['class'] }));
    const initial = this.dialogs.find(dialog => !dialog.classList.contains('hidden'));
    if (initial) this.activate(initial, false);
  }

  focusable(dialog = this.activeDialog) {
    if (!dialog) return [];
    return [...dialog.querySelectorAll(FOCUSABLE)].filter(element =>
      element.getAttribute('aria-hidden') !== 'true' && element.getClientRects().length > 0);
  }

  activate(dialog, remember = true) {
    if (remember && this.activeDialog !== dialog) this.previousFocus = this.document.activeElement;
    this.activeDialog = dialog;
    requestAnimationFrame(() => {
      if (this.activeDialog !== dialog || dialog.classList.contains('hidden')) return;
      const preferred = dialog.querySelector('[autofocus]') || this.focusable(dialog)[0];
      preferred?.focus({ preventScroll: true });
    });
  }

  deactivate(dialog) {
    if (this.activeDialog !== dialog) return;
    this.activeDialog = null;
    const next = this.dialogs.find(candidate => !candidate.classList.contains('hidden'));
    if (next) { this.activate(next, false); return; }
    if (this.previousFocus && this.previousFocus.getClientRects().length > 0) {
      this.previousFocus.focus({ preventScroll: true });
    }
    this.previousFocus = null;
  }

  onMutations(records) {
    for (const { target } of records) {
      if (target.classList.contains('hidden')) this.deactivate(target);
      else this.activate(target);
    }
  }

  onKeyDown(event) {
    if (event.key !== 'Tab' || !this.activeDialog) return;
    const elements = this.focusable();
    if (!elements.length) { event.preventDefault(); return; }
    const first = elements[0], last = elements[elements.length - 1];
    if (event.shiftKey && this.document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && this.document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }

  dispose() {
    this.observer.disconnect();
    this.document.removeEventListener('keydown', this.onKeyDown);
  }
}
