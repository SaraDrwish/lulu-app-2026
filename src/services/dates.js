// التاريخ الهجري والميلادي
// الهجري هنا حساب "تقريبي" (جدولي) بيشتغل من غير نت.
// لما يكون فيه نت، الشاشة الرئيسية بتاخد الهجري الدقيق (أم القرى) من خدمة الصلاة.
import { NAMES } from '../i18n';

function gToJd(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}

export function toHijri(date = new Date()) {
  const jd = gToJd(date.getFullYear(), date.getMonth() + 1, date.getDate());
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const m = Math.floor((24 * l) / 709);
  const d = l - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;
  return { day: d, month: m, year: y };
}

export const hijriText = (h, lang, n) => `${n(h.day)} ${NAMES[lang].h[h.month - 1]} ${n(h.year)} ${NAMES[lang].hSuffix}`;

export const gregText = (d, lang, n) =>
  lang === 'ar'
    ? `${NAMES.ar.d[d.getDay()]} ${n(d.getDate())} ${NAMES.ar.g[d.getMonth()]} ${n(d.getFullYear())}`
    : `${NAMES.en.d[d.getDay()]}, ${NAMES.en.g[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

export const shortDate = (ts, lang, n) => {
  const d = new Date(ts);
  return lang === 'ar'
    ? `${n(d.getDate())} ${NAMES.ar.g[d.getMonth()]} ${n(d.getFullYear())}`
    : `${NAMES.en.g[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
};

export const monthText = (y, m, lang, n) => `${NAMES[lang].g[m]} ${n(y)}`;

export function clock(date, lang, n) {
  let h = date.getHours();
  const period = h < 12 ? NAMES[lang].am : NAMES[lang].pm;
  h = h % 12 || 12;
  return {
    main: n(`${h}:${String(date.getMinutes()).padStart(2, '0')}`),
    sec: n(String(date.getSeconds()).padStart(2, '0')),
    period,
  };
}

export const time12 = (hhmm, lang, n) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${n(`${h % 12 || 12}:${String(m).padStart(2, '0')}`)} ${h < 12 ? NAMES[lang].am : NAMES[lang].pm}`;
};

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
export const fromKey = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d || 1);
};

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / 86400000);

export function greetingKey(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return ['gNight', '🌙'];
  if (h < 12) return ['gMorning', '☀️'];
  if (h < 17) return ['gNoon', '🌤️'];
  if (h < 20) return ['gEvening', '🌸'];
  return ['gNight2', '✨'];
}

// شبكة الشهر للكاليندر (بتبدأ السبت زي التقويم العربي، أو الأحد بالإنجليزي)
export function monthGrid(y, m, weekStart) {
  const first = new Date(y, m, 1);
  const offset = (first.getDay() - weekStart + 7) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(y, m, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}
