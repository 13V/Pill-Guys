// Tracks pressed keys and exposes a tiny query API.
export class Input {
  constructor() {
    this.keys = new Set();

    this._onKeyDown = (e) => {
      // Stop the page from scrolling when using arrows / space.
      if (
        ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
          e.code,
        )
      ) {
        e.preventDefault();
      }
      this.keys.add(e.code);
    };
    this._onKeyUp = (e) => this.keys.delete(e.code);
    this._onBlur = () => this.keys.clear();

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
  }

  has(code) {
    return this.keys.has(code);
  }

  get forward() {
    return this.has('KeyW') || this.has('ArrowUp');
  }
  get back() {
    return this.has('KeyS') || this.has('ArrowDown');
  }
  get left() {
    return this.has('KeyA') || this.has('ArrowLeft');
  }
  get right() {
    return this.has('KeyD') || this.has('ArrowRight');
  }
  get jump() {
    return this.has('Space');
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onBlur);
  }
}
