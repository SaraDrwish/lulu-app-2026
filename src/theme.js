// ألوان لولو: باستيل كتير، والأساس بينك هادي + برتقالي فاتح بيلمع
const LIGHT = {
  dark: false,
  bg: '#FFF6F2',
  card: 'rgba(255,255,255,0.80)',
  cardBorder: 'rgba(255,255,255,0.95)',
  ink: '#4A2C3A',
  inkSoft: '#8E6B7B',
  line: 'rgba(242,107,138,0.18)',
  input: 'rgba(255,255,255,0.78)',
  inputFocus: '#FFFFFF',
  sheet: ['#FFF6F2', '#FFE7EC'],
  bar: 'rgba(255,255,255,0.94)',
  track: 'rgba(242,107,138,0.12)',
  backdrop: 'rgba(74,44,58,0.25)',
  bgGrad: ['#FFD6E0', '#FFE3CC', '#FFF3E4'],
  blobOpacity: 0.28,
  statusBar: 'dark',
};

const DARK = {
  dark: true,
  bg: '#1D1320',
  card: 'rgba(52,34,52,0.82)',
  cardBorder: 'rgba(255,180,200,0.10)',
  ink: '#FCE9F0',
  inkSoft: '#C9A6B7',
  line: 'rgba(255,143,171,0.22)',
  input: 'rgba(70,46,68,0.75)',
  inputFocus: 'rgba(84,54,80,0.95)',
  sheet: ['#2A1C2C', '#24182A'],
  bar: 'rgba(44,28,46,0.95)',
  track: 'rgba(255,143,171,0.16)',
  backdrop: 'rgba(0,0,0,0.5)',
  bgGrad: ['#2B1830', '#251A2E', '#1D1320'],
  blobOpacity: 0.18,
  statusBar: 'light',
};

// ألوان ثابتة في الوضعين
export const BRAND = {
  pink: '#FF8FAB',
  pinkDeep: '#F26B8A',
  blush: '#FFD6DE',
  peach: '#FFC9A8',
  orange: '#FF9F45',
  glow: '#FFB65C',
  white: '#FFFFFF',
};

export const theme = (dark) => ({ ...(dark ? DARK : LIGHT), ...BRAND });

// باستيل للتغيير مع كل ضغطة
export const POP = ['#FF8FAB', '#FF9F45', '#FFB65C', '#F9A8D4', '#FB7185', '#FDBA74', '#C4B5FD', '#86EFAC', '#7DD3FC'];

// باستيل للكروت والتصنيفات
export const PASTEL = [
  ['#FFE0E8', '#FFC9D6'],
  ['#FFE9D6', '#FFD1A8'],
  ['#FFF1C9', '#FFE08F'],
  ['#FCE1F3', '#F5C2E7'],
  ['#E4F7EC', '#C3EDD4'],
  ['#E3F0FF', '#C7DFFF'],
  ['#EDE7FF', '#D7CCFF'],
];
export const PASTEL_DARK = [
  ['#5A2A3C', '#4A2234'],
  ['#5A3A28', '#4A2E20'],
  ['#55482A', '#463B22'],
  ['#55294A', '#45213C'],
  ['#28473A', '#203A2F'],
  ['#2A3C55', '#223146'],
  ['#3B2F5A', '#30264A'],
];

export const F = {
  regular: 'Tajawal_400Regular',
  medium: 'Tajawal_500Medium',
  bold: 'Tajawal_700Bold',
  black: 'Tajawal_800ExtraBold',
};

export const shadow = {
  shadowColor: '#F26B8A',
  shadowOpacity: 0.16,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 5,
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
