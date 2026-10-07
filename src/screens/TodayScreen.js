// الشاشة الرئيسية: اليوم
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Bouncy, Card, FadeIn, GradButton, Input, Progress, Row, SectionTitle, Sheet, T } from '../components/ui';
import MoodPicker from '../components/MoodPicker';
import { useApp } from '../AppContext';
import { FRIEND } from '../i18n';
import { POP } from '../theme';
import { clock, dayKey, daysBetween, greetingKey, gregText, hijriText, monthKey, time12, toHijri } from '../services/dates';
import { PRAYERS, getPlace, getPrayer, getWeather, nextPrayer } from '../services/live';
import { allUpcoming, countdown, eventEmoji, eventTitle } from '../services/events';

const TOTAL_PAGES = 604;
export const juzOf = (p) => (p <= 21 ? 1 : Math.min(30, Math.floor((p - 22) / 20) + 2));

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function Spinner() {
  const r = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(r, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true })).start();
  }, []);
  return (
    <Animated.Text style={{ fontSize: 26, textAlign: 'center', transform: [{ rotate: r.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
      🌸
    </Animated.Text>
  );
}

function ClockCard({ now }) {
  const { lang, n, c } = useApp();
  const t = clock(now, lang, n);
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    pulse.setValue(1.3);
    Animated.spring(pulse, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [t.sec]);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
      <T w="black" center style={{ fontSize: 56, color: '#fff', lineHeight: 68 }}>{t.main}</T>
      <View style={{ marginHorizontal: 8, marginBottom: 12, alignItems: 'center' }}>
        <Animated.Text style={{ fontSize: 18, color: '#fff', fontWeight: '700', transform: [{ scale: pulse }] }}>{t.sec}</Animated.Text>
        <T w="bold" center style={{ color: '#fff', fontSize: 15 }}>{t.period}</T>
      </View>
    </View>
  );
}

// دايرة عدّاد للذكر
function Ring({ value, target, color, size = 64 }) {
  const r = (size - 8) / 2;
  const len = 2 * Math.PI * r;
  const pct = Math.min(1, value / target);
  return (
    <Svg width={size} height={size} style={{ position: 'absolute' }}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,143,171,0.18)" strokeWidth={6} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${len} ${len}`}
        strokeDashoffset={len * (1 - pct)}
        rotation={-90}
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

function DhikrItem({ d, count, onTap, i }) {
  const { lang, n, c } = useApp();
  const pop = useRef(new Animated.Value(0)).current;
  const done = count >= d.target;
  const color = POP[i % POP.length];
  const press = () => {
    pop.setValue(0);
    Animated.timing(pop, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    onTap();
  };
  return (
    <Bouncy outer={{ width: '48%' }} onPress={press} haptic={count + 1 === d.target ? 'success' : 'light'}>
      <View style={{ backgroundColor: done ? color + '33' : c.track, borderRadius: 22, padding: 12, marginBottom: 10, alignItems: 'center' }}>
        <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
          <Ring value={count} target={d.target} color={color} />
          <T w="black" center style={{ fontSize: done ? 22 : 18 }}>{done ? '✓' : n(count)}</T>
          <Animated.Text
            style={{
              position: 'absolute',
              fontSize: 16,
              color,
              fontWeight: '800',
              opacity: pop.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
              transform: [{ translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [0, -36] }) }],
            }}
          >
            +1
          </Animated.Text>
        </View>
        <T w="bold" center numberOfLines={2} style={{ fontSize: 13, marginTop: 6 }}>{d[lang] || d.ar}</T>
        <T center style={{ fontSize: 11, color: c.inkSoft }}>{n(Math.min(count, 9999))} / {n(d.target)}</T>
      </View>
    </Bouncy>
  );
}

function WaterDrop({ filled, onPress, i }) {
  const a = useRef(new Animated.Value(filled ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(a, { toValue: filled ? 1 : 0, friction: 4, useNativeDriver: true }).start();
  }, [filled]);
  return (
    <Bouncy onPress={onPress}>
      <Animated.Text
        style={{
          fontSize: 28,
          opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
          transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.1] }) }],
        }}
      >
        💧
      </Animated.Text>
    </Bouncy>
  );
}

export default function TodayScreen({ go }) {
  const app = useApp();
  const { t, n, lang, c, settings, set, days, updateDay, tasks, adhkar, events, weights, yearGoals } = app;
  const now = useNow();
  const key = dayKey(now);
  const day = days[key] || {};
  const [gKey, gEmoji] = greetingKey(now);
  const lines = FRIEND[lang];
  const [line, setLine] = useState(() => Math.floor(Math.random() * lines.length));
  const [place, setPlace] = useState(null);
  const [weather, setWeather] = useState(null);
  const [prayer, setPrayer] = useState(null);
  const [allTimes, setAllTimes] = useState(false);
  const [editName, setEditName] = useState(!settings.name);
  const [draft, setDraft] = useState(settings.name);

  useEffect(() => {
    let alive = true;
    (async () => {
      const p = await getPlace();
      if (!alive) return;
      setPlace(p);
      const [w, pr] = await Promise.all([getWeather(p), getPrayer(p, now)]);
      if (!alive) return;
      setWeather(w);
      setPrayer(pr);
    })();
    return () => {
      alive = false;
    };
  }, [key]);

  const hijri = prayer?.hijri || toHijri(now);
  const next = nextPrayer(prayer?.times, now);

  // ===== المية =====
  const water = day.water || 0;
  const waterGoal = settings.waterGoal;
  const setWater = (v) => updateDay(key, { water: Math.max(0, v) });

  // ===== الورد =====
  const wird = day.wird || 0;
  const page = settings.quranPage;
  const addPages = (k) => {
    if (k < 0 && wird <= 0) return;
    let p = page + k;
    let kh = settings.khatmas;
    if (p > TOTAL_PAGES) {
      p = p - TOTAL_PAGES;
      kh += 1;
    }
    if (p < 1) p = 1;
    set({ quranPage: p, khatmas: kh });
    updateDay(key, { wird: Math.max(0, wird + k) });
  };
  let streak = 0;
  for (let i = wird >= settings.wirdGoal ? 0 : 1; i < 400; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    if ((days[dayKey(d)]?.wird || 0) >= settings.wirdGoal) streak++;
    else break;
  }

  // ===== الأذكار =====
  const counts = day.dhikr || {};
  const allDhikr = adhkar.length > 0 && adhkar.every((d) => (counts[d.id] || 0) >= d.target);

  // ===== ملخصات =====
  const left = tasks.filter((x) => !x.done).length;
  const upcoming = allUpcoming(events, now, 120).slice(0, 4);
  const lastW = [...weights].sort((a, b) => b.date - a.date)[0];
  const sinceW = lastW ? daysBetween(new Date(lastW.date), now) : null;
  const mKey = monthKey(now);
  const steps = yearGoals
    .filter((g) => g.year === now.getFullYear() && g.months?.[now.getMonth() + 1]?.step)
    .map((g) => ({ g, s: g.months[now.getMonth() + 1] }));

  const cityName = place?.city ? place.city[lang] : t('yourLocation');

  return (
    <View>
      {/* التحية */}
      <FadeIn>
        <Bouncy onPress={() => { setDraft(settings.name); setEditName(true); }}>
          <T w="black" style={{ fontSize: 28 }}>
            {t(gKey)}{settings.name ? (lang === 'ar' ? ` يا ${settings.name}` : `, ${settings.name}`) : ''} {gEmoji}
          </T>
        </Bouncy>
        <Bouncy onPress={() => setLine((l) => (l + 1 + Math.floor(Math.random() * (lines.length - 1))) % lines.length)}>
          <Card style={{ marginTop: 12, paddingVertical: 14 }}>
            <Row gap={10}>
              <Text style={{ fontSize: 28 }}>🐰</Text>
              <T w="medium" style={{ flex: 1, fontSize: 15, lineHeight: 24 }}>{lines[line % lines.length]}</T>
            </Row>
          </Card>
        </Bouncy>
      </FadeIn>

      {/* الساعة والتاريخ */}
      <FadeIn delay={60}>
        <Card colors={[c.pink, c.orange]}>
          <ClockCard now={now} />
          <Row wrap gap={6} style={{ justifyContent: 'center', marginTop: 6 }}>
            <View style={pill}><T w="bold" center style={{ color: '#fff', fontSize: 13 }}>📅 {gregText(now, lang, n)}</T></View>
            <View style={pill}><T w="bold" center style={{ color: '#fff', fontSize: 13 }}>🌙 {hijriText(hijri, lang, n)}</T></View>
          </Row>
        </Card>
      </FadeIn>

      {/* الطقس + الصلاة */}
      <FadeIn delay={120}>
        <Card>
          {weather ? (
            <Row gap={12}>
              <Text style={{ fontSize: 48 }}>{weather.icon}</Text>
              <View style={{ flex: 1 }}>
                <T w="black" style={{ fontSize: 32 }}>{n(weather.temp)}°</T>
                <T w="medium" style={{ color: c.inkSoft, fontSize: 13 }}>
                  {weather.label[lang]} · {cityName}{weather.offline ? ' · ' + t('lastUpdate') : ''}
                </T>
              </View>
              <View>
                <T style={{ fontSize: 12, color: c.inkSoft }}>⬆ {n(weather.max)}°  ⬇ {n(weather.min)}°</T>
                <T style={{ fontSize: 12, color: c.inkSoft }}>💧 {n(weather.humidity)}%</T>
                <T style={{ fontSize: 12, color: c.inkSoft }}>💨 {n(weather.wind)} {t('kmh')}</T>
              </View>
            </Row>
          ) : (
            <Spinner />
          )}
        </Card>
      </FadeIn>

      <FadeIn delay={180}>
        <Bouncy onPress={() => setAllTimes((s) => !s)}>
          <Card colors={c.dark ? ['#4A2638', '#4A3024'] : ['#FFE3EA', '#FFE9D2']}>
            {prayer && next ? (
              <>
                <Row gap={10}>
                  <Text style={{ fontSize: 32 }}>{next.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <T style={{ color: c.inkSoft, fontSize: 13 }}>{t('nextPrayer')}</T>
                    <T w="black" style={{ fontSize: 21 }}>{next[lang]} · {time12(prayer.times[next.key], lang, n)}</T>
                  </View>
                  <View style={[pill, { backgroundColor: c.pinkDeep }]}>
                    <T w="bold" center style={{ color: '#fff', fontSize: 12 }}>
                      {t('in')} {next.hours ? `${n(next.hours)}${t('h')} ` : ''}{n(next.minutes)}{t('m')}
                    </T>
                  </View>
                </Row>
                {allTimes ? (
                  <Row between style={{ marginTop: 14 }}>
                    {PRAYERS.map((p, i) => {
                      const on = p.key === next.key;
                      return (
                        <FadeIn key={p.key} delay={i * 50} from={10}>
                          <View style={[slot, { backgroundColor: on ? POP[i % POP.length] : c.card }]}>
                            <Text style={{ fontSize: 17, textAlign: 'center' }}>{p.emoji}</Text>
                            <T w="bold" center style={{ fontSize: 10, color: on ? '#fff' : c.ink }}>{p[lang]}</T>
                            <T center style={{ fontSize: 10, color: on ? '#fff' : c.inkSoft }}>{time12(prayer.times[p.key], lang, n).split(' ')[0]}</T>
                          </View>
                        </FadeIn>
                      );
                    })}
                  </Row>
                ) : (
                  <T style={{ fontSize: 12, color: c.inkSoft, marginTop: 8 }}>{t('tapAllTimes')}</T>
                )}
              </>
            ) : (
              <Spinner />
            )}
          </Card>
        </Bouncy>
      </FadeIn>

      {/* المود */}
      <FadeIn delay={240}>
        <Card>
          <SectionTitle emoji="💭" title={t('moodToday')} />
          <MoodPicker dKey={key} compact />
        </Card>
      </FadeIn>

      {/* المية */}
      <FadeIn delay={300}>
        <Card>
          <SectionTitle
            emoji="🥤"
            title={t('waterQ')}
            right={<T w="black" style={{ color: c.pinkDeep }}>{n(water)}/{n(waterGoal)}</T>}
          />
          <Row wrap gap={6} style={{ justifyContent: 'center', marginBottom: 10 }}>
            {Array.from({ length: Math.max(waterGoal, water) }).map((_, i) => (
              <WaterDrop key={i} i={i} filled={i < water} onPress={() => setWater(i < water ? i : i + 1)} />
            ))}
          </Row>
          <Progress value={(water / waterGoal) * 100} colors={['#7DD3FC', '#FF8FAB']} />
          <Row between style={{ marginTop: 10 }}>
            <T w="medium" style={{ color: c.inkSoft, fontSize: 13, flex: 1 }}>
              {water >= waterGoal ? t('waterDone') : t('waterLeft', { n: n(waterGoal - water) })}
            </T>
            <GradButton small label={'+ 💧'} onPress={() => setWater(water + 1)} />
          </Row>
        </Card>
      </FadeIn>

      {/* الورد */}
      <FadeIn delay={360}>
        <Card>
          <SectionTitle
            emoji="📗"
            title={t('wirdQ')}
            right={streak > 0 ? <T w="bold" style={{ color: c.orange, fontSize: 13 }}>{t('streak', { n: n(streak) })}</T> : null}
          />
          <Row gap={12} style={{ marginBottom: 10 }}>
            <View style={{ flex: 1 }}>
              <T w="black" style={{ fontSize: 30 }}>
                {n(wird)} <T style={{ fontSize: 15, color: c.inkSoft }}>/ {n(settings.wirdGoal)} {t('pages')}</T>
              </T>
              <T style={{ color: c.inkSoft, fontSize: 13 }}>{t('wirdAt', { p: n(page), j: n(juzOf(page)) })}</T>
            </View>
            <Bouncy onPress={() => addPages(-1)} style={[round, { backgroundColor: c.track }]}><Text style={{ fontSize: 18, color: c.pinkDeep, fontWeight: '700' }}>−</Text></Bouncy>
            <Bouncy onPress={() => addPages(1)} haptic={wird + 1 === settings.wirdGoal ? 'success' : 'light'} style={[round, { backgroundColor: c.pink }]}><Text style={{ fontSize: 18, color: '#fff', fontWeight: '700' }}>+</Text></Bouncy>
          </Row>
          <Progress value={(wird / settings.wirdGoal) * 100} colors={['#86EFAC', '#FFB65C']} />
          <T w="medium" style={{ color: c.inkSoft, fontSize: 13, marginTop: 8 }}>
            {wird >= settings.wirdGoal ? t('wirdDone') : t('wirdLeft', { n: n(settings.wirdGoal - wird) })}
          </T>
          <View style={{ height: 1, backgroundColor: c.line, marginVertical: 12 }} />
          <Row between style={{ marginBottom: 6 }}>
            <T w="bold" style={{ fontSize: 13 }}>{t('khatma')} 🕌</T>
            <T w="bold" style={{ fontSize: 13, color: c.pinkDeep }}>{n(Math.round(((page - 1) / TOTAL_PAGES) * 100))}%</T>
          </Row>
          <Progress value={((page - 1) / TOTAL_PAGES) * 100} height={8} />
          {settings.khatmas > 0 ? <T style={{ fontSize: 12, color: c.inkSoft, marginTop: 6 }}>{t('khatmas', { n: n(settings.khatmas) })} 🤍</T> : null}
          <GradButton small label={`+${n(settings.wirdGoal)} ${t('pages')}`} style={{ marginTop: 12 }} onPress={() => addPages(settings.wirdGoal)} />
        </Card>
      </FadeIn>

      {/* الأذكار */}
      <FadeIn delay={420}>
        <Card>
          <SectionTitle emoji="📿" title={t('dhikrQ')} right={<Bouncy onPress={() => go('more', 'adhkar')}><Text style={{ fontSize: 18 }}>⚙️</Text></Bouncy>} />
          <T style={{ color: c.inkSoft, fontSize: 12, marginBottom: 10 }}>{allDhikr ? t('dhikrAll') : t('tapToCount')}</T>
          <Row wrap between>
            {adhkar.map((d, i) => (
              <DhikrItem
                key={d.id}
                d={d}
                i={i}
                count={counts[d.id] || 0}
                onTap={() => updateDay(key, (cur) => ({ ...cur, dhikr: { ...(cur.dhikr || {}), [d.id]: ((cur.dhikr || {})[d.id] || 0) + 1 } }))}
              />
            ))}
          </Row>
        </Card>
      </FadeIn>

      {/* خطوات أهداف السنة لهذا الشهر */}
      {steps.length > 0 && (
        <FadeIn delay={460}>
          <Bouncy onPress={() => go('plan', 'year')}>
            <Card colors={c.dark ? ['#3B2F5A', '#4A2638'] : ['#EDE7FF', '#FFE0E8']}>
              <SectionTitle emoji="🪜" title={t('thisMonthStep')} />
              {steps.slice(0, 3).map(({ g, s }) => (
                <Row key={g.id} gap={8} style={{ paddingVertical: 4 }}>
                  <Text>{s.done ? '✅' : '⬜'}</Text>
                  <T w="medium" style={{ flex: 1, fontSize: 14, textDecorationLine: s.done ? 'line-through' : 'none' }}>{s.step}</T>
                </Row>
              ))}
            </Card>
          </Bouncy>
        </FadeIn>
      )}

      {/* ملخص */}
      <FadeIn delay={500}>
        <Row gap={12}>
          <Bouncy outer={{ flex: 1 }} onPress={() => go('plan', 'tasks')}>
            <Card style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 26 }}>✅</Text>
              <T w="black" center style={{ fontSize: 24 }}>{n(left)}</T>
              <T center style={{ fontSize: 12, color: c.inkSoft }}>{t('tasksLeft')}</T>
            </Card>
          </Bouncy>
          <Bouncy outer={{ flex: 1 }} onPress={() => go('more', 'weight')}>
            <Card style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 26 }}>⚖️</Text>
              <T w="black" center style={{ fontSize: 24 }}>{lastW ? n(lastW.kg) : '—'}</T>
              <T center style={{ fontSize: 12, color: c.inkSoft }}>{t('kg')}</T>
            </Card>
          </Bouncy>
        </Row>
        {sinceW != null && sinceW >= 7 ? (
          <Bouncy onPress={() => go('more', 'weight')}>
            <Card style={{ paddingVertical: 12 }}>
              <T w="medium" style={{ fontSize: 13 }}>⚖️ {t('weighReminder', { n: n(sinceW) })}</T>
            </Card>
          </Bouncy>
        ) : null}
      </FadeIn>

      {/* المناسبات الجاية */}
      <FadeIn delay={540}>
        <Bouncy onPress={() => go('more', 'events')}>
          <Card>
            <SectionTitle emoji="🎀" title={t('upcoming')} />
            {upcoming.map((e) => (
              <Row key={e.id + String(e.date)} gap={8} style={{ paddingVertical: 5 }}>
                <Text style={{ fontSize: 20 }}>{eventEmoji(e)}</Text>
                <T w="medium" style={{ flex: 1, fontSize: 14 }} numberOfLines={1}>{eventTitle(e, lang, t)}</T>
                <T w="bold" style={{ color: c.pinkDeep, fontSize: 12 }}>{countdown(daysBetween(now, e.date), t, n)}</T>
              </Row>
            ))}
          </Card>
        </Bouncy>
      </FadeIn>

      <Sheet visible={editName} onClose={() => setEditName(false)} title={t('callYou')}>
        <Input value={draft} onChangeText={setDraft} placeholder={t('yourName')} />
        <Row gap={10} style={{ marginTop: 14 }}>
          <GradButton outer={{ flex: 1 }} label={'العربية'} onPress={() => set({ lang: 'ar' })} small />
          <GradButton outer={{ flex: 1 }} label={'English'} onPress={() => set({ lang: 'en' })} small />
        </Row>
        <GradButton
          label={t('save') + ' 💕'}
          style={{ marginTop: 14 }}
          onPress={() => {
            set({ name: draft.trim() });
            setEditName(false);
          }}
        />
      </Sheet>
    </View>
  );
}

const pill = { backgroundColor: 'rgba(255,255,255,0.28)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 };
const slot = { borderRadius: 14, paddingVertical: 8, paddingHorizontal: 4, minWidth: 48 };
const round = { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' };
