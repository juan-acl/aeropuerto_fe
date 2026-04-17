/**
 * Design System — Aurora Airport Platform
 * Aesthetic: Premium Graphite + Emerald accents
 */
export const C = {
  // ─── Brand Core ───────────────────────────────────────────────
  navy:       '#09090B',   // zinc-950 (super deep black)
  navyL:      '#18181B',   // zinc-900 (card surface)
  navyM:      '#27272A',   // zinc-800 (elevated surface)
  navyG:      '#3F3F46',   // zinc-700 (hover)
  electric:   '#10B981',   // Emerald primary
  electricL:  '#34D399',   // Emerald light
  electricD:  '#059669',   // Emerald deep
  amber:      '#F59E0B',   // warm accent
  amberL:     '#FCD34D',   // light amber
  cyan:       '#0EA5E9',   // Sky accent fallback
  cyanL:      '#7DD3FC',   // light sky

  // ─── Surfaces ─────────────────────────────────────────────────
  bg:         '#09090B',   // deepest background (zinc-950)
  bgCard:     '#18181B',   // card background (zinc-900)
  bgElevated: '#27272A',   // elevated card (zinc-800)
  bgGlass:    'rgba(24,24,27,0.7)', // glassmorphism on zinc-900
  white:      '#FFFFFF',

  // ─── Text ─────────────────────────────────────────────────────
  text:       '#FAFAFA',   // primary text (zinc-50)
  textSub:    '#A1A1AA',   // secondary text (zinc-400)
  muted:      '#71717A',   // muted text (zinc-500)
  light:      '#52525B',   // very muted (zinc-600)
  placeholder:'#3F3F46',   // placeholder

  // ─── Borders ──────────────────────────────────────────────────
  border:     'rgba(255,255,255,0.08)',
  borderL:    'rgba(255,255,255,0.04)',
  borderE:    'rgba(16,185,129,0.3)',  // emerald border

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
  info:       '#0EA5E9',
  infoBg:     'rgba(14,165,233,0.12)',
  infoL:      'rgba(14,165,233,0.2)',

  // ─── Extended ─────────────────────────────────────────────────
  purple:     '#8B5CF6',
  purpleBg:   'rgba(139,92,246,0.12)',
  purpleL:    'rgba(139,92,246,0.2)',
  orange:     '#F97316',
  orangeBg:   'rgba(249,115,22,0.12)',
  orangeL:    'rgba(249,115,22,0.2)',
  teal:       '#14B8A6',
  tealBg:     'rgba(20,184,166,0.12)',
  tealL:      'rgba(20,184,166,0.2)',
  red:        '#EF4444',
  redBg:      'rgba(239,68,68,0.12)',
  redL:       'rgba(239,68,68,0.2)',
  green:      '#10B981',
  greenBg:    'rgba(16,185,129,0.12)',
  greenL:     'rgba(16,185,129,0.2)',
  gray:       '#71717A',
  grayBg:     'rgba(113,113,122,0.10)',
  grayL:      'rgba(113,113,122,0.15)',
  pink:       '#EC4899',
  pinkBg:     'rgba(236,72,153,0.12)',
  sky:        '#0EA5E9',
  skyBg:      'rgba(14,165,233,0.12)',

  // ─── Shadows ──────────────────────────────────────────────────
  shadow:     'rgba(0,0,0,0.5)',
  shadowMd:   'rgba(0,0,0,0.7)',
  shadowElectric: 'rgba(16,185,129,0.3)',

  // ─── Gradients (as string arrays for LinearGradient) ──────────
  gradNavy:   ['#09090B', '#18181B'],
  gradElectric:['#059669', '#10B981', '#34D399'],
  gradAmber:  ['#D97706', '#F59E0B', '#FCD34D'],
  gradSuccess:['#059669', '#10B981'],
  gradDanger: ['#B91C1C', '#EF4444'],
  gradPurple: ['#7C3AED', '#8B5CF6'],
} as const;

// Keep Colors for Expo compatibility
export const Colors = {
  light: { text: '#09090B', background: '#FAFAFA', tint: '#10B981', icon: '#71717A', tabIconDefault: '#A1A1AA', tabIconSelected: '#10B981' },
  dark:  { text: C.text, background: C.bg, tint: C.electric, icon: C.muted, tabIconDefault: C.light, tabIconSelected: C.electric },
};

// Removed Emojis, replacing with valid Ionicons names.
export const MOD_COLORS: Record<number, { color: string; bg: string; icon: string; gradient: string[] }> = {
  1:  { color: C.electric, bg: C.infoBg,    icon: 'business-outline', gradient: ['#18181B','#059669'] },
  2:  { color: C.teal,     bg: C.tealBg,    icon: 'airplane-outline', gradient: ['#18181B','#14B8A6'] },
  3:  { color: C.cyan,     bg: C.skyBg,     icon: 'paper-plane-outline', gradient: ['#18181B','#0EA5E9'] },
  4:  { color: C.purple,   bg: C.purpleBg,  icon: 'calendar-outline', gradient: ['#18181B','#8B5CF6'] },
  5:  { color: C.electric, bg: C.infoBg,    icon: 'navigate-outline', gradient: ['#18181B','#10B981'] },
  6:  { color: C.teal,     bg: C.tealBg,    icon: 'person-outline', gradient: ['#18181B','#14B8A6'] },
  7:  { color: C.cyan,     bg: C.skyBg,     icon: 'people-outline', gradient: ['#18181B','#0EA5E9'] },
  8:  { color: C.purple,   bg: C.purpleBg,  icon: 'ticket-outline', gradient: ['#18181B','#8B5CF6'] },
  9:  { color: C.success,  bg: C.successBg, icon: 'checkmark-circle-outline', gradient: ['#18181B','#10B981'] },
  10: { color: C.danger,   bg: C.dangerBg,  icon: 'shield-checkmark-outline', gradient: ['#18181B','#EF4444'] },
  11: { color: C.red,      bg: C.redBg,     icon: 'lock-closed-outline', gradient: ['#18181B','#EF4444'] },
  12: { color: C.orange,   bg: C.orangeBg,  icon: 'search-outline', gradient: ['#18181B','#F97316'] },
  13: { color: C.amber,    bg: C.warningBg, icon: 'bag-handle-outline', gradient: ['#18181B','#F59E0B'] },
  14: { color: C.teal,     bg: C.tealBg,    icon: 'bag-check-outline', gradient: ['#18181B','#14B8A6'] },
  15: { color: C.electric, bg: C.infoBg,    icon: 'person-add-outline', gradient: ['#18181B','#10B981'] },
  16: { color: C.green,    bg: C.greenBg,   icon: 'wallet-outline', gradient: ['#18181B','#10B981'] },
  18: { color: C.purple,   bg: C.purpleBg,  icon: 'happy-outline', gradient: ['#18181B','#8B5CF6'] },
  19: { color: C.orange,   bg: C.orangeBg,  icon: 'cube-outline', gradient: ['#18181B','#F97316'] },
  20: { color: C.red,      bg: C.redBg,     icon: 'build-outline', gradient: ['#18181B','#EF4444'] },
  21: { color: C.cyan,     bg: C.skyBg,     icon: 'radio-outline', gradient: ['#18181B','#0EA5E9'] },
  22: { color: C.amber,    bg: C.warningBg, icon: 'flash-outline', gradient: ['#18181B','#F59E0B'] },
  23: { color: C.green,    bg: C.greenBg,   icon: 'leaf-outline', gradient: ['#18181B','#10B981'] },
  24: { color: C.red,      bg: C.redBg,     icon: 'key-outline', gradient: ['#18181B','#EF4444'] },
  25: { color: C.pink,     bg: C.pinkBg,    icon: 'megaphone-outline', gradient: ['#18181B','#EC4899'] },
  26: { color: C.electric, bg: C.infoBg,    icon: 'clipboard-outline', gradient: ['#18181B','#10B981'] },
  27: { color: C.teal,     bg: C.tealBg,    icon: 'car-sport-outline', gradient: ['#18181B','#14B8A6'] },
  28: { color: C.danger,   bg: C.dangerBg,  icon: 'alert-circle-outline', gradient: ['#18181B','#EF4444'] },
  29: { color: C.gray,     bg: C.grayBg,    icon: 'earth-outline', gradient: ['#18181B','#71717A'] },
};

// Shared style primitives
export const CARD = {
  borderRadius: 8,
  backgroundColor: C.bgCard,
  borderWidth: 1,
  borderColor: C.border,
} as const;

export const GLASS = {
  borderRadius: 8,
  backgroundColor: C.bgGlass,
  borderWidth: 1,
  borderColor: C.border,
} as const;
