export const COLORS = {
  bgDeep: '#04030a',
  bgMid: '#07050e',
  bgPurple: '#0a0516',

  ringIdle: 'rgba(139,92,246,0.18)',
  ringListen: 'rgba(192,132,252,0.35)',
  ringThink: 'rgba(109,40,217,0.22)',
  ringSpeak: 'rgba(216,180,254,0.38)',
  ringQuestion: 'rgba(139,92,246,0.20)',

  glowIdle: 'rgba(109,40,217,0.08)',
  glowListen: 'rgba(147,51,234,0.18)',
  glowThink: 'rgba(76,29,149,0.08)',
  glowSpeak: 'rgba(168,85,247,0.22)',

  purple100: '#c4b5fd',
  purple200: '#a855f7',
  purple300: '#9333ea',
  purple400: '#7c3aed',
  purple500: '#6d28d9',
  purple600: '#5b21b6',
  purple700: '#4c1d95',
  purple800: '#3b0764',
  purple900: '#2e1065',

  textPrimary: '#c4b5fd',
  textMuted: '#6d28d9',
  textDim: '#3b1c6a',
  textFaint: '#2e1065',

  hudActive: '#a855f7',
  hudDim: '#4c1d95',
  white: '#ffffff',
  starColor: '#faf5ff',
};

export const RING_COLORS_BY_STATE = {
  IDLE: COLORS.ringIdle,
  LISTENING: COLORS.ringListen,
  THINKING: COLORS.ringThink,
  SPEAKING: COLORS.ringSpeak,
  QUESTIONS: COLORS.ringQuestion,
};

export const GLOW_COLORS_BY_STATE = {
  IDLE: COLORS.glowIdle,
  LISTENING: COLORS.glowListen,
  THINKING: COLORS.glowThink,
  SPEAKING: COLORS.glowSpeak,
  QUESTIONS: COLORS.glowIdle,
};
