import level1 from './level1.js';
import level2 from './level2/index.js';
import level3 from './level3/index.js';
import level4 from './level4/index.js';
import level5 from './level5/index.js';
import level6 from './level6.js';
import level7 from './level7.js';
import level8 from './level8.js';
import level9 from './level9.js';
import level10 from './level10.js';

// The progression, easiest -> hardest. game.js loads one by ?level=N (1-based).
// 1-5 are the original campaign; 6-10 are the extra chaotic multi-route courses.
export const LEVELS = [level1, level2, level3, level4, level5, level6, level7, level8, level9, level10];
