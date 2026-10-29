/** Formation / hold / morph timings (seconds). */
export const FORM_DURATION = 1.8;
export const HOLD_DURATION = 4;
export const MORPH_DURATION = 1.8;
export const CYCLE_DURATION = HOLD_DURATION + MORPH_DURATION; // 5.8

export const DESKTOP_PARTICLES = 3800;
export const MOBILE_PARTICLES = 1200;

export const LOOP_SHAPE_KEYS = [
  'football',
  'cricket',
  'badminton',
  'basketball',
  'tennis',
  'pool',
];

export const ALL_SHAPE_KEYS = [...LOOP_SHAPE_KEYS, 'swimming'];

export const SHAPE_LABELS = {
  football: 'Football',
  cricket: 'Cricket bat',
  badminton: 'Badminton shuttlecock',
  basketball: 'Basketball',
  tennis: 'Tennis racket & ball',
  pool: '8-ball & cue',
  swimming: 'Swimming goggles',
};

function rgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

/** Light mode — deep navy bodies + lime accents on white surface. */
export const PALETTE_LIGHT = [
  rgb('#092636'), // 0 brand navy
  rgb('#c7f84b'), // 1 accent lime
  rgb('#a3e635'), // 2 accent strong
  rgb('#061032'), // 3 deep navy / seams
  rgb('#152c6e'), // 4 brand action
  rgb('#0c3144'), // 5 mid navy
  rgb('#314c5e'), // 6 soft teal
  rgb('#d4ff5a'), // 7 bright lime
  rgb('#edf4f8'), // 8 cool off-white
];

/**
 * Dark mode — brand navy/lime with lift so forms read on #0d1726
 * (exact accent tokens; body fills stay cool ink, not generic cyan).
 */
export const PALETTE_DARK = [
  rgb('#e8f2f6'), // 0 body fill (ink-cool, pops on dark surface)
  rgb('#d4ff5a'), // 1 accent lime (lifted for dark chroma)
  rgb('#c7f84b'), // 2 accent strong (exact --accent)
  rgb('#245a70'), // 3 seams (lifted brand navy for dark-surface contrast)
  rgb('#3b6fd4'), // 4 brand action (lifted #152c6e)
  rgb('#1a4558'), // 5 mid brand (lifted #0c3144)
  rgb('#4d7a8c'), // 6 soft brand teal
  rgb('#f0ff70'), // 7 bright lime (high-visibility accents)
  rgb('#f8fafc'), // 8 highlight (--ink)
];

/** Default export alias (light) for compatibility. */
export const PALETTE = PALETTE_LIGHT;

export function paletteForMode(mode = 'light') {
  return mode === 'dark' ? PALETTE_DARK : PALETTE_LIGHT;
}

export function smoothstep(v) {
  const x = Math.max(0, Math.min(1, v));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

export function particleBudget(isMobile) {
  return isMobile ? MOBILE_PARTICLES : DESKTOP_PARTICLES;
}
