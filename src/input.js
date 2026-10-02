export class InputController {
  constructor(target) {
    this.held = false;
    this.justPressed = false;
    this.justReleased = false;
    const down = (e) => { e?.preventDefault?.(); if (!this.held) this.justPressed = true; this.held = true; };
    const up = () => { if (this.held) this.justReleased = true; this.held = false; };
    target.addEventListener('pointerdown', down, { passive: false });
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
    window.addEventListener('keydown', e => { if (e.code === 'Space') down(e); });
    window.addEventListener('keyup', e => { if (e.code === 'Space') up(); });
  }
  frame() { const state = { held:this.held, pressed:this.justPressed, released:this.justReleased }; this.justPressed=false; this.justReleased=false; return state; }
  clear() { this.held=false; this.justPressed=false; this.justReleased=false; }
}
