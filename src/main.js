import './style.css';
import { Game } from './Game.js';

const canvas = document.getElementById('game');
const game = new Game(canvas);

// Exposed for debugging / scripted screenshots.
window.game = game;

game.init().catch((err) => {
  console.error('Failed to start Pill Guys:', err);
  const loading = document.getElementById('loading-text');
  if (loading) loading.textContent = 'Failed to load. Check the console.';
});
