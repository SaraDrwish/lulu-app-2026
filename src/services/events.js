// المناسبات: إسلامية (بالهجري) + أيام عالمية/وطنية (بالميلادي) + مناسباتك وأعياد ميلاد حبايبك
import { daysBetween, startOfDay, toHijri } from './dates';

const HIJRI_EVENTS = [
  { m: 1, d: 1, ar: 'رأس السنة الهجرية', en: 'Islamic New Year', emoji: '🌙' },
  { m: 1, d: 10, ar: 'يوم عاشوراء', en: 'Day of Ashura', emoji: '🤍' },
  { m: 9, d: 1, ar: 'أول رمضان', en: 'Ramadan begins', emoji: '🏮' },
  { m: 9, d: 27, ar: 'ليلة ٢٧ رمضان', en: '27th night of Ramadan', emoji: '✨' },
  { m: 10, d: 1, ar: 'عيد الفطر', en: 'Eid al-Fitr', emoji: '🎉' },
  { m: 12, d: 9, ar: 'يوم عرفة', en: 'Day of Arafah', emoji: '🕋' },
  { m: 12, d: 10, ar: 'عيد الأضحى', en: 'Eid al-Adha', emoji: '🐑' },
];

const GREG_EVENTS = [
  { m: 1, d: 1, ar: 'رأس السنة الميلادية', en: 'New Year', emoji: '🎆' },
  { m: 2, d: 22, ar: 'يوم التأسيس السعودي', en: 'Saudi Founding Day', emoji: '🇸🇦' },
  { m: 3, d: 8, ar: 'يوم المرأة العالمي', en: 'International Women’s Day', emoji: '💐' },
  { m: 3, d: 20, ar: 'اليوم العالمي للسعادة', en: 'International Day of Happiness', emoji: '😊' },
  { m: 3, d: 21, ar: 'عيد الأم', en: 'Mother’s Day (Arab world)', emoji: '💗' },
  { m: 4, d: 7, ar: 'يوم الصحة العالمي', en: 'World Health Day', emoji: '🩺' },
  { m: 4, d: 22, ar: 'يوم الأرض', en: 'Earth Day', emoji: '🌍' },
  { m: 4, d: 23, ar: 'اليوم العالمي للكتاب', en: 'World Book Day', emoji: '📚' },
  { m: 6, d: 5, ar: 'يوم البيئة العالمي', en: 'World Environment Day', emoji: '🌿' },
  { m: 9, d: 23, ar: 'اليوم الوطني السعودي', en: 'Saudi National Day', emoji: '🇸🇦' },
  { m: 10, d: 5, ar: 'يوم المعلم العالمي', en: 'World Teachers’ Day', emoji: '🍎' },
  { m: 10, d: 6, ar: 'ذكرى نصر أكتوبر', en: 'October Victory Day (Egypt)', emoji: '🇪🇬' },
  { m: 10, d: 10, ar: 'اليوم العالمي للصحة النفسية', en: 'World Mental Health Day', emoji: '💚' },
  { m: 11, d: 13, ar: 'يوم اللطف العالمي', en: 'World Kindness Day', emoji: '🫶' },
  { m: 12, d: 18, ar: 'اليوم العالمي للغة العربية', en: 'World Arabic Language Day', emoji: '✍️' },
];

export const EVENT_TYPES = [
  { key: 'birthday', emoji: '🎂' },
  { key: 'social', emoji: '💌' },
  { key: 'other', emoji: '📌' },
];

export function builtInBetween(from, to) {
  const out = [];
  const base = startOfDay(from);
  const total = daysBetween(from, to);
  for (let i = 0; i <= total; i++) {
    const day = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    const h = toHijri(day);
    for (const e of HIJRI_EVENTS) {
      if (h.month === e.m && h.day === e.d) {
        out.push({ id: `h${e.m}-${e.d}-${h.year}`, title: e, emoji: e.emoji, date: day, kind: 'islamic', approx: true });
      }
    }
    for (const e of GREG_EVENTS) {
      if (day.getMonth() + 1 === e.m && day.getDate() === e.d) {
        out.push({ id: `g${e.m}-${e.d}-${day.getFullYear()}`, title: e, emoji: e.emoji, date: day, kind: 'world' });
      }
    }
  }
  return out;
}

// أقرب تكرار جاي لمناسبة بتتكرر كل سنة
export function nextOccurrence(ev, from = new Date()) {
  const d = new Date(ev.date);
  if (!ev.yearly) return startOfDay(d);
  const today = startOfDay(from);
  let n = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (n < today) n = new Date(today.getFullYear() + 1, d.getMonth(), d.getDate());
  return n;
}

// مناسباتي في شهر معين (للكاليندر)
export function userEventsInMonth(userEvents, y, m) {
  return userEvents
    .map((e) => {
      const d = new Date(e.date);
      const date = e.yearly ? new Date(y, d.getMonth(), d.getDate()) : startOfDay(d);
      return { ...e, date, kind: 'mine' };
    })
    .filter((e) => e.date.getFullYear() === y && e.date.getMonth() === m);
}

export function allUpcoming(userEvents, from = new Date(), days = 380) {
  const mine = userEvents
    .map((e) => ({ ...e, origDate: e.date, date: nextOccurrence(e, from), kind: 'mine' }))
    .filter((e) => daysBetween(from, e.date) >= 0);
  const end = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
  return [...mine, ...builtInBetween(from, end)].sort((a, b) => a.date - b.date);
}

// عنوان المناسبة باللغة الحالية
export function eventTitle(e, lang, t) {
  if (e.kind === 'mine') {
    if (e.type === 'birthday' && e.person) return t('bdayOf', { p: e.person });
    return e.title || e.person || '';
  }
  return e.title[lang];
}

export function eventEmoji(e) {
  if (e.kind !== 'mine') return e.emoji;
  return e.emoji || EVENT_TYPES.find((x) => x.key === e.type)?.emoji || '📌';
}

export function countdown(n, t, num) {
  if (n === 0) return t('cdToday');
  if (n === 1) return t('cdTomorrow');
  if (n === 2) return t('cd2');
  return t(n <= 10 ? 'cdDays' : 'cdDaysMany', { n: num(n) });
}
