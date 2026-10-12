// العادات اليومية: المية + الورد + الأذكار
// بيحسب كل يوم خلص فيه إيه، عشان شاشة اليوم والتقويم يعرضوه
export const HABITS = [
  { key: 'water', emoji: '💧', label: 'hWater', color: '#7DD3FC' },
  { key: 'wird', emoji: '📗', label: 'hWird', color: '#86EFAC' },
  { key: 'dhikr', emoji: '📿', label: 'hDhikr', color: '#F9A8D4' },
];

export function dayHabits(day, settings, adhkar) {
  const d = day || {};
  const water = Math.min(1, (d.water || 0) / Math.max(1, settings.waterGoal));
  const wird = Math.min(1, (d.wird || 0) / Math.max(1, settings.wirdGoal));
  const counts = d.dhikr || {};
  const total = adhkar.reduce((s, x) => s + x.target, 0);
  const got = adhkar.reduce((s, x) => s + Math.min(x.target, counts[x.id] || 0), 0);
  const dhikr = total ? got / total : 0;
  const done = { water: water >= 1, wird: wird >= 1, dhikr: total > 0 && dhikr >= 1 };
  const doneCount = Object.values(done).filter(Boolean).length;
  return {
    progress: { water, wird, dhikr },
    done,
    doneCount,
    all: doneCount === HABITS.length,
    score: (water + wird + dhikr) / 3,
  };
}

// إحصائيات الشهر: كام يوم خلصتي فيه كل عادة
export function monthHabitStats(days, settings, adhkar, y, m) {
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = new Date();
  const isCurrent = today.getFullYear() === y && today.getMonth() === m;
  const isFuture = new Date(y, m, 1) > today;
  // الشهر الحالي: لحد النهارده بس، والشهور الجاية: لسه مفيش أيام
  const counted = isFuture ? 0 : isCurrent ? today.getDate() : daysInMonth;
  const out = { water: 0, wird: 0, dhikr: 0, all: 0, counted };
  for (let d = 1; d <= counted; d++) {
    const k = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const h = dayHabits(days[k], settings, adhkar);
    for (const key in h.done) if (h.done[key]) out[key]++;
    if (h.all) out.all++;
  }
  return out;
}
