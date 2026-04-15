/**
 * Design System — Aurora Airport Platform
 * Aesthetic: Premium dark airline + electric accents + glass depth
 */
export const C = {
  // ─── Brand Core ───────────────────────────────────────────────
  navy:       '#050E1F',   // near-black deep navy
  navyL:      '#0D1E3D',   // card surface
  navyM:      '#122648',   // elevated surface
  navyG:      '#1A3461',   // hover state
  electric:   '#2B7FFF',   // primary electric blue
  electricL:  '#5B9DFF',   // light electric
  electricD:  '#1565D8',   // deep electric
  amber:      '#F59E0B',   // warm accent
  amberL:     '#FCD34D',   // light amber
  cyan:       '#06B6D4',   // secondary accent
  cyanL:      '#67E8F9',   // light cyan

  // ─── Surfaces ─────────────────────────────────────────────────
  bg:         '#070F20',   // deepest background
  bgCard:     '#0D1E3D',   // card background
  bgElevated: '#122648',   // elevated card
  bgGlass:    'rgba(13,30,61,0.7)', // glassmorphism
  white:      '#FFFFFF',

  // ─── Text ─────────────────────────────────────────────────────
  text:       '#F0F4FF',   // primary text
  textSub:    '#CBD5E1',   // secondary text
  muted:      '#64748B',   // muted text
  light:      '#475569',   // very muted
  placeholder:'#334155',   // placeholder

  // ─── Borders ──────────────────────────────────────────────────
  border:     'rgba(255,255,255,0.08)',
  borderL:    'rgba(255,255,255,0.05)',
  borderE:    'rgba(43,127,255,0.3)',  // electric border

  // ─── Semantic ─────────────────────────────────────────────────
  success:    '#10B981',
  successBg:  'rgba(16,185,129,0.12)',
  successL:   'rgba(16,185,129,0.2)',
  warning:    '#F59E0B',
  warningBg:  'rgba(245,158,11,0.12)',
  warningL:   'rgba(245,158,11,0.2)',
  danger:     '#EF4444',
  dangerBg:   'rgba(239,68,68,0.12)',
  dangerL:    'rgba(239,68,68,0.2)',
  info:       '#2B7FFF',
  infoBg:     'rgba(43,127,255,0.12)',
  infoL:      'rgba(43,127,255,0.2)',

  // ─── Extended ─────────────────────────────────────────────────
  purple:     '#A855F7',
  purpleBg:   'rgba(168,85,247,0.12)',
  purpleL:    'rgba(168,85,247,0.2)',
  orange:     '#F97316',
  orangeBg:   'rgba(249,115,22,0.12)',
  orangeL:    'rgba(249,115,22,0.2)',
  teal:       '#14B8A6',
  tealBg:     'rgba(20,184,166,0.12)',
  tealL:      'rgba(20,184,166,0.2)',
  red:        '#EF4444',
  redBg:      'rgba(239,68,68,0.12)',
  redL:       'rgba(239,68,68,0.2)',
  green:      '#22C55E',
  greenBg:    'rgba(34,197,94,0.12)',
  greenL:     'rgba(34,197,94,0.2)',
  gray:       '#94A3B8',
  grayBg:     'rgba(148,163,184,0.10)',
  grayL:      'rgba(148,163,184,0.15)',
  pink:       '#EC4899',
  pinkBg:     'rgba(236,72,153,0.12)',
  sky:        '#38BDF8',
  skyBg:      'rgba(56,189,248,0.12)',

  // ─── Shadows ──────────────────────────────────────────────────
  shadow:     'rgba(0,0,0,0.4)',
  shadowMd:   'rgba(0,0,0,0.6)',
  shadowElectric: 'rgba(43,127,255,0.3)',

  // ─── Gradients (as string arrays for LinearGradient) ──────────
  gradNavy:   ['#050E1F', '#0D1E3D'],
  gradElectric:['#1565D8', '#2B7FFF', '#5B9DFF'],
  gradAmber:  ['#D97706', '#F59E0B', '#FCD34D'],
  gradSuccess:['#059669', '#10B981'],
  gradDanger: ['#B91C1C', '#EF4444'],
  gradPurple: ['#7C3AED', '#A855F7'],
} as const;

// Keep Colors for Expo compatibility
export const Colors = {
  light: { text: '#0F172A', background: '#F8FAFC', tint: '#2B7FFF', icon: '#64748B', tabIconDefault: '#94A3B8', tabIconSelected: '#2B7FFF' },
  dark:  { text: C.text, background: C.bg, tint: C.electric, icon: C.muted, tabIconDefault: C.light, tabIconSelected: C.electric },
};

export const MOD_COLORS: Record<number, { color: string; bg: string; icon: string; gradient: string[] }> = {
  1:  { color: C.electric, bg: C.infoBg,    icon: '🏢', gradient: ['#0D1E3D','#1565D8'] },
  2:  { color: C.teal,     bg: C.tealBg,    icon: '✈️', gradient: ['#0D9488','#14B8A6'] },
  3:  { color: C.cyan,     bg: C.skyBg,     icon: '🛫', gradient: ['#0284C7','#06B6D4'] },
  4:  { color: C.purple,   bg: C.purpleBg,  icon: '📅', gradient: ['#7C3AED','#A855F7'] },
  5:  { color: C.electric, bg: C.infoBg,    icon: '🛬', gradient: ['#1565D8','#2B7FFF'] },
  6:  { color: C.teal,     bg: C.tealBg,    icon: '👨‍✈️', gradient: ['#0D9488','#0891B2'] },
  7:  { color: C.cyan,     bg: C.skyBg,     icon: '🧍', gradient: ['#0284C7','#06B6D4'] },
  8:  { color: C.purple,   bg: C.purpleBg,  icon: '🎟️', gradient: ['#7C3AED','#A855F7'] },
  9:  { color: C.success,  bg: C.successBg, icon: '✅', gradient: ['#059669','#10B981'] },
  10: { color: C.danger,   bg: C.dangerBg,  icon: '🛡️', gradient: ['#B91C1C','#EF4444'] },
  11: { color: C.red,      bg: C.redBg,     icon: '🔒', gradient: ['#B91C1C','#DC2626'] },
  12: { color: C.orange,   bg: C.orangeBg,  icon: '🔍', gradient: ['#C2410C','#F97316'] },
  13: { color: C.amber,    bg: C.warningBg, icon: '🛍️', gradient: ['#B45309','#F59E0B'] },
  14: { color: C.teal,     bg: C.tealBg,    icon: '🧳', gradient: ['#0D9488','#14B8A6'] },
  15: { color: C.electric, bg: C.infoBg,    icon: '👥', gradient: ['#0D1E3D','#1565D8'] },
  16: { color: C.green,    bg: C.greenBg,   icon: '💰', gradient: ['#15803D','#22C55E'] },
  18: { color: C.purple,   bg: C.purpleBg,  icon: '👶', gradient: ['#7C3AED','#A855F7'] },
  19: { color: C.orange,   bg: C.orangeBg,  icon: '📦', gradient: ['#C2410C','#F97316'] },
  20: { color: C.red,      bg: C.redBg,     icon: '🔧', gradient: ['#B91C1C','#EF4444'] },
  21: { color: C.cyan,     bg: C.skyBg,     icon: '📡', gradient: ['#0284C7','#38BDF8'] },
  22: { color: C.amber,    bg: C.warningBg, icon: '⛽', gradient: ['#B45309','#F59E0B'] },
  23: { color: C.green,    bg: C.greenBg,   icon: '🌿', gradient: ['#15803D','#0D9488'] },
  24: { color: C.red,      bg: C.redBg,     icon: '🔐', gradient: ['#B91C1C','#7C3AED'] },
  25: { color: C.pink,     bg: C.pinkBg,    icon: '📣', gradient: ['#9D174D','#EC4899'] },
  26: { color: C.electric, bg: C.infoBg,    icon: '📋', gradient: ['#1565D8','#2B7FFF'] },
  27: { color: C.teal,     bg: C.tealBg,    icon: '🚗', gradient: ['#0D9488','#06B6D4'] },
  28: { color: C.danger,   bg: C.dangerBg,  icon: '🚨', gradient: ['#B91C1C','#F97316'] },
  29: { color: C.gray,     bg: C.grayBg,    icon: '🌐', gradient: ['#334155','#64748B'] },
};

// Shared style primitives
export const CARD = {
  borderRadius: 20,
  backgroundColor: C.bgCard,
  borderWidth: 1,
  borderColor: C.border,
} as const;

export const GLASS = {
  borderRadius: 20,
  backgroundColor: C.bgGlass,
  borderWidth: 1,
  borderColor: C.border,
} as const;
