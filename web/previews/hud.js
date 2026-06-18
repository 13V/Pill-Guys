// HUD preview: builds the DOM HUD over a flat colored backdrop so we can judge
// the coin counter + win banner look against the bright toy aesthetic.
import { createHUD } from '../src/hud.js';

const hud = createHUD(8);
hud.setCoins(3, 8);
hud.win();

window.__ready = true;
