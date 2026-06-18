// Thin wrapper over the DOM overlays defined in index.html.
export class Hud {
  constructor() {
    this.hud = document.getElementById('hud');
    this.timerEl = document.getElementById('timer');
    this.startScreen = document.getElementById('start-screen');
    this.winScreen = document.getElementById('win-screen');
    this.finalTimeEl = document.getElementById('final-time');
    this.playButton = document.getElementById('play-button');
    this.restartButton = document.getElementById('restart-button');
    this.loadingText = document.getElementById('loading-text');

    this.playButton.disabled = true;
  }

  onPlay(cb) {
    this.playButton.addEventListener('click', cb);
  }

  onRestart(cb) {
    this.restartButton.addEventListener('click', cb);
  }

  setLoading(text) {
    this.loadingText.textContent = text;
  }

  ready() {
    this.loadingText.textContent = '';
    this.playButton.disabled = false;
  }

  setTimer(seconds) {
    this.timerEl.textContent = seconds.toFixed(2);
  }

  showHud() {
    this.hud.classList.remove('hidden');
  }

  showStart() {
    this.startScreen.classList.remove('hidden');
    this.winScreen.classList.add('hidden');
  }

  startPlaying() {
    this.startScreen.classList.add('hidden');
    this.winScreen.classList.add('hidden');
    this.hud.classList.remove('hidden');
  }

  showWin(seconds) {
    this.finalTimeEl.textContent = seconds.toFixed(2);
    this.winScreen.classList.remove('hidden');
  }
}
