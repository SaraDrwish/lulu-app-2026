import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useStored } from './storage';
import { theme } from './theme';
import { makeN, makeT } from './i18n';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export const DEFAULT_ADHKAR = [
  { id: 'salawat', ar: 'اللهم صلِّ وسلم على نبينا محمد', en: 'Salawat upon the Prophet ﷺ', target: 10 },
  { id: 'istighfar', ar: 'أستغفر الله', en: 'Astaghfirullah', target: 10 },
  { id: 'subhan', ar: 'سبحان الله', en: 'SubhanAllah', target: 10 },
  { id: 'hamd', ar: 'الحمد لله', en: 'Alhamdulillah', target: 10 },
  { id: 'tahlil', ar: 'لا إله إلا الله', en: 'La ilaha illa Allah', target: 10 },
  { id: 'takbir', ar: 'الله أكبر', en: 'Allahu Akbar', target: 10 },
];

const DEFAULT_SETTINGS = {
  name: '',
  lang: 'ar',
  appearance: 'auto', // light | dark | auto
  waterGoal: 8,
  wirdGoal: 3,
  quranPage: 1, // الصفحة اللي واقفة عندها (من ٦٠٤)
  khatmas: 0,
  currency: '',
  budget: 0,
  savingGoal: 0,
  weightGoal: 0,
};

export function AppProvider({ children, reload }) {
  const system = useColorScheme();
  const [settings, setSettings, r1] = useStored('settings', DEFAULT_SETTINGS);
  const [tasks, setTasks, r2] = useStored('tasks', []);
  const [notes, setNotes, r3] = useStored('notes', []);
  const [diary, setDiary, r4] = useStored('diary', []);
  const [drawings, setDrawings, r5] = useStored('drawings', []);
  const [days, setDays, r6] = useStored('days', {}); // { 'YYYY-MM-DD': { mood, feelings, factors, energy, note, water, wird, dhikr:{} } }
  const [months, setMonths, r7] = useStored('months', {}); // { 'YYYY-MM': { mood, note } }
  const [yearGoals, setYearGoals, r8] = useStored('yearGoals', []);
  const [monthGoals, setMonthGoals, r9] = useStored('monthGoals', []);
  const [events, setEvents, r10] = useStored('events', []);
  const [tx, setTx, r11] = useStored('money', []);
  const [favs, setFavs, r12] = useStored('favs', []);
  const [weights, setWeights, r13] = useStored('weights', []);
  const [adhkar, setAdhkar, r14] = useStored('adhkar', DEFAULT_ADHKAR);

  const ready = r1 && r2 && r3 && r4 && r5 && r6 && r7 && r8 && r9 && r10 && r11 && r12 && r13 && r14;
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const dark = s.appearance === 'auto' ? system === 'dark' : s.appearance === 'dark';
  const lang = s.lang;
  const rtl = lang === 'ar';

  const value = useMemo(() => {
    const t = makeT(lang);
    const n = makeN(lang);
    const set = (patch) => setSettings((old) => ({ ...DEFAULT_SETTINGS, ...old, ...patch }));
    // تعديل بيانات يوم معين
    const updateDay = (key, patch) =>
      setDays((all) => {
        const cur = all[key] || {};
        const next = typeof patch === 'function' ? patch(cur) : { ...cur, ...patch };
        return { ...all, [key]: next };
      });
    return {
      c: theme(dark),
      dark,
      lang,
      rtl,
      t,
      n,
      // مساعدات المحاذاة: بتقلب تلقائي بين العربي والإنجليزي
      row: rtl ? 'row-reverse' : 'row',
      ta: rtl ? 'right' : 'left',
      start: rtl ? 'flex-end' : 'flex-start',
      end: rtl ? 'flex-start' : 'flex-end',
      settings: s,
      reload,
      set,
      currency: s.currency || t('currency'),
      tasks, setTasks,
      notes, setNotes,
      diary, setDiary,
      drawings, setDrawings,
      days, setDays, updateDay,
      months, setMonths,
      yearGoals, setYearGoals,
      monthGoals, setMonthGoals,
      events, setEvents,
      tx, setTx,
      favs, setFavs,
      weights, setWeights,
      adhkar, setAdhkar,
    };
  }, [dark, lang, settings, tasks, notes, diary, drawings, days, months, yearGoals, monthGoals, events, tx, favs, weights, adhkar]);

  // منستناش نرسم الشاشات قبل ما كل البيانات المحفوظة تتحمّل
  if (!ready) return null;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
