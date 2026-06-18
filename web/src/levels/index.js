import level1 from './level1.js';
import level2 from './level2/index.js';
import level3 from './level3/index.js';
import level4 from './level4/index.js';
import level5 from './level5/index.js';

// The progression, easiest -> hardest. game.js loads one by ?level=N (1-based).
export const LEVELS = [level1, level2, level3, level4, level5];
