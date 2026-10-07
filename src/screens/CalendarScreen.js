// التقويم: شهري (بألوان المود والمناسبات) + يومي (كل تفاصيل اليوم)
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Bouncy, Card, FadeIn, Header, Input, Row, Segments, SectionTitle, T } from '../components/ui';
import MoodPicker from '../components/MoodPicker';
import { BarList } from '../components/Charts';
import { useApp } from '../AppContext';
import { NAMES } from '../i18n';
import { MOODS, moodOf, monthMoodStats } from '../services/mood';
import { builtInBetween, eventEmoji, eventTitle, userEventsInMonth } from '../services/events';
import { dayKey, gregText, hijriText, monthGrid, monthKey, toHijri } from '../services/dates';

export default function CalendarScreen() {
  const { t, n, lang, c, days, events, diary, months, setMonths, tasks, settings } = useApp();
  const today = new Date();
  const [mode, setMode] = useState('month');
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [sel, setSel] = useState(today);

  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const weekStart = lang === 'ar' ? 6 : 0; // السبت بالعربي، الأحد بالإنجليزي
  const cells = monthGrid(y, m, weekStart);
  const header = Array.from({ length: 7 }, (_, i) => NAMES[lang].dShort[(weekStart + i) % 7]);

  const monthEvents = [
    ...userEventsInMonth(events, y, m),
    ...builtInBetween(new Date(y, m, 1), new Date(y, m + 1, 0)),
  ];
  const evOn = (d) => monthEvents.filter((e) => e.date.getDate() === d.getDate());

  const stats = monthMoodStats(days, y, m);
  const mk = monthKey(cursor);
  const monthInfo = months[mk] || {};
  const setMonthInfo = (patch) => setMonths((all) => ({ ...all, [mk]: { ...(all[mk] || {}), ...patch } }));

  const shiftMonth = (k) => setCursor(new Date(y, m + k, 1));
  const shiftDay = (k) => setSel(new Date(sel.getFullYear(), sel.getMonth(), sel.getDate() + k));

  const openDay = (d) => {
    setSel(d);
    setMode('day');
  };

  // ===== تفاصيل اليوم =====
  const sk = dayKey(sel);
  const sd = days[sk] || {};
  const selEvents = [
    ...userEventsInMonth(events, sel.getFullYear(), sel.getMonth()),
    ...builtInBetween(sel, sel),
  ].filter((e) => e.date.getDate() === sel.getDate());
  const selDiary = diary.filter((d) => d.date === sk);
  const selTasks = tasks.filter((x) => x.due === sk);

  const Arrow = ({ dir, onPress }) => (
    <Bouncy onPress={onPress} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, color: c.pinkDeep, fontWeight: '800' }}>{dir}</Text>
    </Bouncy>
  );
  // الأسهم بتتقلب مع اللغة
  const prevSym = lang === 'ar' ? '›' : '‹';
  const nextSym = lang === 'ar' ? '‹' : '›';

  return (
    <View>
      <Header emoji="🗓️" title={t('calTitle')} />
      <Segments
        value={mode}
        onChange={setMode}
        options={[
          { value: 'month', label: '🗓️ ' + t('monthly') },
          { value: 'day', label: '📍 ' + t('daily') },
        ]}
      />

      {mode === 'month' ? (
        <>
          <FadeIn key={mk}>
            <Card>
              <Row between style={{ marginBottom: 12 }}>
                <Arrow dir={prevSym} onPress={() => shiftMonth(-1)} />
                <View style={{ alignItems: 'center' }}>
                  <T w="black" center style={{ fontSize: 19 }}>{NAMES[lang].g[m]} {n(y)}</T>
                  <T center style={{ fontSize: 12, color: c.inkSoft }}>
                    {(() => {
                      const a = toHijri(new Date(y, m, 1));
                      const b = toHijri(new Date(y, m + 1, 0));
                      return a.month === b.month
                        ? `${NAMES[lang].h[a.month - 1]} ${n(a.year)}`
                        : `${NAMES[lang].h[a.month - 1]} – ${NAMES[lang].h[b.month - 1]} ${n(b.year)}`;
                    })()}
                  </T>
                </View>
                <Arrow dir={nextSym} onPress={() => shiftMonth(1)} />
              </Row>

              <Row>
                {header.map((h, i) => (
                  <View key={i} style={{ width: '14.2857%' }}>
                    <T w="bold" center style={{ fontSize: 12, color: c.inkSoft }}>{h}</T>
                  </View>
                ))}
              </Row>
              <Row wrap style={{ marginTop: 6 }}>
                {cells.map((d, i) => {
                  if (!d) return <View key={i} style={{ width: '14.2857%', aspectRatio: 1 }} />;
                  const k = dayKey(d);
                  const mood = moodOf(days[k]?.mood);
                  const isToday = k === dayKey(today);
                  const ev = evOn(d);
                  return (
                    <Bouncy key={i} outer={{ width: '14.2857%', aspectRatio: 1, padding: 2 }} style={{ flex: 1 }} onPress={() => openDay(d)}>
                      <View
                        style={{
                          flex: 1,
                          borderRadius: 14,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: mood ? (c.dark ? mood.color + '55' : mood.soft) : 'transparent',
                          borderWidth: isToday ? 2 : 0,
                          borderColor: c.orange,
                        }}
                      >
                        {mood ? <Text style={{ fontSize: 13 }}>{mood.emoji}</Text> : null}
                        <T w={isToday ? 'black' : 'medium'} center style={{ fontSize: mood ? 11 : 14 }}>{n(d.getDate())}</T>
                        {ev.length > 0 ? (
                          <View style={{ flexDirection: 'row', gap: 2, position: 'absolute', bottom: 3 }}>
                            {ev.slice(0, 3).map((e, j) => (
                              <View key={j} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: e.kind === 'mine' ? c.pinkDeep : e.kind === 'islamic' ? '#22C55E' : c.orange }} />
                            ))}
                          </View>
                        ) : null}
                      </View>
                    </Bouncy>
                  );
                })}
              </Row>
            </Card>
          </FadeIn>

          {/* ملخص الشهر */}
          <FadeIn delay={80}>
            <Card>
              <SectionTitle
                emoji="📊"
                title={t('moodDays')}
                right={stats.total ? <T w="bold" style={{ color: c.pinkDeep }}>{t('avgMood')}: {moodOf(Math.round(stats.avg))?.emoji}</T> : null}
              />
              {stats.total ? (
                <BarList
                  items={MOODS.map((md) => ({ key: md.v, label: `${md.emoji} ${t(md.key)}`, value: stats.counts[md.v], color: md.color }))}
                  format={(v) => n(v)}
                />
              ) : (
                <T style={{ color: c.inkSoft }}>{t('noMood')}</T>
              )}
            </Card>
          </FadeIn>

          <FadeIn delay={140}>
            <Card>
              <SectionTitle emoji="🌙" title={t('monthMood')} />
              <Row between style={{ marginBottom: 10 }}>
                {MOODS.map((md) => (
                  <Bouncy key={md.v} onPress={() => setMonthInfo({ mood: monthInfo.mood === md.v ? undefined : md.v })}>
                    <View style={{ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: monthInfo.mood === md.v ? md.color : c.track }}>
                      <Text style={{ fontSize: 28 }}>{md.emoji}</Text>
                    </View>
                  </Bouncy>
                ))}
              </Row>
              <Input value={monthInfo.note || ''} onChangeText={(note) => setMonthInfo({ note })} placeholder={t('monthNote')} multiline style={{ minHeight: 80 }} />
            </Card>
          </FadeIn>

          {monthEvents.length > 0 && (
            <FadeIn delay={200}>
              <Card>
                <SectionTitle emoji="🎀" title={t('eventsThisDay')} />
                {monthEvents
                  .sort((a, b) => a.date - b.date)
                  .map((e, i) => (
                    <Row key={i} gap={8} style={{ paddingVertical: 4 }}>
                      <Text style={{ fontSize: 18 }}>{eventEmoji(e)}</Text>
                      <T w="medium" style={{ flex: 1, fontSize: 14 }}>{eventTitle(e, lang, t)}</T>
                      <T style={{ color: c.inkSoft, fontSize: 12 }}>{n(e.date.getDate())} {NAMES[lang].g[e.date.getMonth()]}</T>
                    </Row>
                  ))}
              </Card>
            </FadeIn>
          )}
        </>
      ) : (
        <>
          <FadeIn key={sk}>
            <Card colors={[c.pink, c.orange]}>
              <Row between>
                <Arrow dir={prevSym} onPress={() => shiftDay(-1)} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <T w="black" center style={{ color: '#fff', fontSize: 17 }}>{gregText(sel, lang, n)}</T>
                  <T center style={{ color: '#fff', fontSize: 13 }}>{hijriText(toHijri(sel), lang, n)}</T>
                </View>
                <Arrow dir={nextSym} onPress={() => shiftDay(1)} />
              </Row>
              {sk !== dayKey(today) ? (
                <Bouncy onPress={() => setSel(today)} style={{ alignSelf: 'center', marginTop: 10, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 5 }}>
                  <T w="bold" center style={{ color: '#fff', fontSize: 12 }}>{t('today')}</T>
                </Bouncy>
              ) : null}
            </Card>
          </FadeIn>

          <FadeIn delay={60} key={sk + 'm'}>
            <Card>
              <SectionTitle emoji="💭" title={t('moodToday')} />
              <MoodPicker dKey={sk} />
            </Card>
          </FadeIn>

          <FadeIn delay={120} key={sk + 's'}>
            <Row gap={10}>
              <Card style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 22 }}>💧</Text>
                <T w="black" center>{n(sd.water || 0)}/{n(settings.waterGoal)}</T>
              </Card>
              <Card style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 22 }}>📗</Text>
                <T w="black" center>{n(sd.wird || 0)} {t('pages')}</T>
              </Card>
              <Card style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 22 }}>📿</Text>
                <T w="black" center>{n(Object.values(sd.dhikr || {}).reduce((a, b) => a + b, 0))}</T>
              </Card>
            </Row>
          </FadeIn>

          <FadeIn delay={180} key={sk + 'e'}>
            <Card>
              <SectionTitle emoji="🎀" title={t('eventsThisDay')} />
              {selEvents.length ? (
                selEvents.map((e, i) => (
                  <Row key={i} gap={8} style={{ paddingVertical: 4 }}>
                    <Text style={{ fontSize: 18 }}>{eventEmoji(e)}</Text>
                    <T w="medium" style={{ flex: 1 }}>{eventTitle(e, lang, t)}</T>
                  </Row>
                ))
              ) : (
                <T style={{ color: c.inkSoft }}>{t('nothingHere')}</T>
              )}
              {selTasks.length ? (
                <>
                  <T w="bold" style={{ marginTop: 12, marginBottom: 4 }}>✅ {t('tasksThisDay')}</T>
                  {selTasks.map((x) => (
                    <T key={x.id} style={{ paddingVertical: 2, textDecorationLine: x.done ? 'line-through' : 'none' }}>• {x.text}</T>
                  ))}
                </>
              ) : null}
            </Card>
          </FadeIn>

          <FadeIn delay={240} key={sk + 'd'}>
            <Card>
              <SectionTitle emoji="📖" title={t('diaryThisDay')} />
              {selDiary.length ? (
                selDiary.map((d) => (
                  <T key={d.id} style={{ lineHeight: 24, marginBottom: 8 }}>{d.text}</T>
                ))
              ) : (
                <T style={{ color: c.inkSoft }}>{t('nothingHere')}</T>
              )}
            </Card>
          </FadeIn>
        </>
      )}
    </View>
  );
}
