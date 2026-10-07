// مقياس المود: ٥ درجات (زي أغلب تطبيقات تتبع المزاج المعتمدة)
// والمشاعر متقسمة على أساس "Mood Meter" بتاع جامعة Yale:
// طاقة عالية + مريح / طاقة قليلة + مريح / طاقة عالية + مزعج / طاقة قليلة + مزعج
// تسمية المشاعر بدقة بتساعد على فهمها والتعامل معاها، والأسباب بتساعدك تلاحظي الأنماط
export const MOODS = [
  { v: 5, emoji: '🤩', key: 'mood5', color: '#FFB65C', soft: '#FFE3BF' },
  { v: 4, emoji: '😊', key: 'mood4', color: '#FF8FAB', soft: '#FFD6E0' },
  { v: 3, emoji: '😐', key: 'mood3', color: '#C4B5FD', soft: '#EDE7FF' },
  { v: 2, emoji: '😕', key: 'mood2', color: '#7DD3FC', soft: '#DCF2FF' },
  { v: 1, emoji: '😢', key: 'mood1', color: '#94A3B8', soft: '#E2E8F0' },
];
export const moodOf = (v) => MOODS.find((m) => m.v === v);

export const FEELINGS = [
  // طاقة عالية + مريح
  { k: 'fExcited', e: '🥳', q: 'hp' }, { k: 'fHappy', e: '😄', q: 'hp' }, { k: 'fProud', e: '🌟', q: 'hp' }, { k: 'fHopeful', e: '🌈', q: 'hp' },
  // طاقة قليلة + مريح
  { k: 'fCalm', e: '😌', q: 'lp' }, { k: 'fGrateful', e: '🤲', q: 'lp' }, { k: 'fRelaxed', e: '🛁', q: 'lp' }, { k: 'fLoved', e: '🥰', q: 'lp' },
  // طاقة عالية + مزعج
  { k: 'fAnxious', e: '😟', q: 'hu' }, { k: 'fStressed', e: '😣', q: 'hu' }, { k: 'fAngry', e: '😤', q: 'hu' }, { k: 'fOverwhelmed', e: '🌀', q: 'hu' },
  // طاقة قليلة + مزعج
  { k: 'fTired', e: '🥱', q: 'lu' }, { k: 'fSad', e: '😞', q: 'lu' }, { k: 'fLonely', e: '🫥', q: 'lu' }, { k: 'fBored', e: '😶', q: 'lu' },
];

export const FACTORS = [
  { k: 'xSleep', e: '😴' }, { k: 'xFamily', e: '👨‍👩‍👧' }, { k: 'xFriends', e: '👯‍♀️' }, { k: 'xWork', e: '💼' },
  { k: 'xStudy', e: '📚' }, { k: 'xHealth', e: '🩺' }, { k: 'xFaith', e: '🕌' }, { k: 'xMoney', e: '💰' },
  { k: 'xWeather', e: '🌦️' }, { k: 'xFood', e: '🍓' }, { k: 'xSport', e: '🏃‍♀️' }, { k: 'xRest', e: '🛋️' },
];

// متوسط المود لشهر معين
export function monthMoodStats(days, y, m) {
  const prefix = `${y}-${String(m + 1).padStart(2, '0')}-`;
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  let total = 0;
  for (const k in days) {
    if (k.startsWith(prefix) && days[k].mood) {
      counts[days[k].mood]++;
      sum += days[k].mood;
      total++;
    }
  }
  return { counts, total, avg: total ? sum / total : 0 };
}
