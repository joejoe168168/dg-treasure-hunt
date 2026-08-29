export const INPUT_ACTIONS = Object.freeze({
  move: 'move', interact: 'interact', pause: 'pause', cameraReset: 'cameraReset',
});

export class InputController {
  constructor({ onAction, canAction }) {
    this.keys = {};
    this.joy = { active: false, dx: 0, dy: 0, cx: 0, cy: 0, id: null, moved: false };
    this.onAction = onAction;
    this.canAction = canAction;

    window.addEventListener('keydown', event => {
      this.keys[event.code] = true;
      const action = event.code === 'KeyE' ? INPUT_ACTIONS.interact
        : event.code === 'Escape' ? INPUT_ACTIONS.pause
          : event.code === 'KeyR' ? INPUT_ACTIONS.cameraReset : null;
      if (action && this.canAction(action)) this.onAction(action);
    });
    window.addEventListener('keyup', event => { this.keys[event.code] = false; });
    window.addEventListener('blur', () => {
      this.keys = {};
      this.resetJoystick();
    });
  }

  bindJoystick({ zone, base, knob, onTap }) {
    this.joyElements = { zone, base, knob };

    zone.addEventListener('pointerdown', event => {
      event.preventDefault();
      const joy = this.joy;
      joy.active = true;
      joy.id = event.pointerId;
      joy.cx = event.clientX;
      joy.cy = event.clientY;
      joy.moved = false;
      const rect = zone.getBoundingClientRect();
      base.style.display = 'block';
      base.style.left = `${event.clientX - rect.left - 60}px`;
      base.style.top = `${event.clientY - rect.top - 60}px`;
      base.style.bottom = 'auto';
      zone.setPointerCapture(event.pointerId);
    });

    zone.addEventListener('pointermove', event => {
      const joy = this.joy;
      if (!joy.active || event.pointerId !== joy.id) return;
      let dx = event.clientX - joy.cx;
      let dy = event.clientY - joy.cy;
      const length = Math.hypot(dx, dy);
      if (length > 10) joy.moved = true;
      if (length > 48) {
        dx = dx / length * 48;
        dy = dy / length * 48;
      }
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      joy.dx = dx / 48;
      joy.dy = dy / 48;
    });

    const finish = event => {
      const joy = this.joy;
      if (event.pointerId !== joy.id) return;
      const wasTap = !joy.moved;
      this.resetJoystick();
      if (wasTap && this.canAction(INPUT_ACTIONS.interact)) onTap(event.clientX, event.clientY);
    };
    zone.addEventListener('pointerup', finish);
    zone.addEventListener('pointercancel', finish);
  }

  resetJoystick() {
    const joy = this.joy;
    joy.active = false;
    joy.dx = 0;
    joy.dy = 0;
    joy.id = null;
    if (this.joyElements) {
      this.joyElements.knob.style.transform = 'translate(-50%, -50%)';
      this.joyElements.base.style.display = 'none';
    }
  }

  movement() {
    let x = 0;
    let z = 0;
    if (this.keys.KeyW || this.keys.ArrowUp) z += 1;
    if (this.keys.KeyS || this.keys.ArrowDown) z -= 1;
    if (this.keys.KeyA || this.keys.ArrowLeft) x += 1;
    if (this.keys.KeyD || this.keys.ArrowRight) x -= 1;
    if (this.joy.active) {
      x = -this.joy.dx;
      z = -this.joy.dy;
    }
    return { action: INPUT_ACTIONS.move, x, z };
  }
}
