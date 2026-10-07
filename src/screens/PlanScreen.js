// خطتي: المهام + أهداف السنة (مقسمة على الشهور) + أهداف الشهر
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bouncy, Card, Chips, Empty, FadeIn, GradButton, Header, Input, Progress, Row, Segments, Sheet, T, confirmDelete, tap,
} from '../components/ui';
import { useApp } from '../AppContext';
import { NAMES, parseNum } from '../i18n';
import { POP, uid } from '../theme';
import { dayKey, monthKey } from '../services/dates';

export const CATS = [
  { key: 'catFaith', emoji: '🕌', color: '#86EFAC' },
  { key: 'catSocial', emoji: '🤝', color: '#FF8FAB' },
  { key: 'catWork', emoji: '💼', color: '#FFB65C' },
  { key: 'catStudy', emoji: '📚', color: '#C4B5FD' },
  { key: 'catHealth', emoji: '🌿', color: '#7DD3FC' },
  { key: 'catMoney', emoji: '💰', color: '#FDE68A' },
  { key: 'catSelf', emoji: '🌸', color: '#F9A8D4' },
  { key: 'catFun', emoji: '🎨', color: '#FDBA74' },
];
const catOf = (k) => CATS.find((x) => x.key === k) || CATS[6];

const PRI = [
  { color: '#FFB3C6', key: 'pNormal' },
  { color: '#FFB65C', key: 'pImportant' },
  { color: '#F26B8A', key: 'pUrgent' },
];

// ================= المهام =================
function Check({ done }) {
  const { c } = useApp();
  const a = useRef(new Animated.Value(done ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(a, { toValue: done ? 1 : 0, friction: 3, tension: 140, useNativeDriver: true }).start();
  }, [done]);
  return (
    <View style={{ width: 30, height: 30, borderRadius: 10, borderWidth: 2, borderColor: c.pink, backgroundColor: c.input, overflow: 'hidden' }}>
      <Animated.View
        style={{
          position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
          opacity: a,
          transform: [{ scale: a }, { rotate: a.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] }) }],
        }}
      >
        <LinearGradient colors={[c.pink, c.orange]} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>✓</Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function TaskRow({ item, index, onToggle, onDelete, onPriority }) {
  const { t, c } = useApp();
  const out = useRef(new Animated.Value(1)).current;
  const pr = PRI[item.priority || 0];
  const remove = () => {
    tap('medium');
    Animated.timing(out, { toValue: 0, duration: 260, useNativeDriver: true }).start(() => onDelete(item.id));
  };
  return (
    <FadeIn delay={index * 40}>
      <Animated.View style={{ opacity: out, transform: [{ scale: out }] }}>
        <Card style={{ paddingVertical: 13, marginBottom: 10 }}>
          <Row gap={10}>
            <Bouncy onPress={() => onToggle(item.id)} haptic={item.done ? 'light' : 'success'}>
              <Check done={item.done} />
            </Bouncy>
            <T w="medium" style={{ flex: 1, fontSize: 15, color: item.done ? c.inkSoft : c.ink, textDecorationLine: item.done ? 'line-through' : 'none' }}>
              {item.text}
            </T>
            <Bouncy onPress={() => onPriority(item.id)} style={{ paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99, backgroundColor: pr.color }}>
              <T w="bold" center style={{ fontSize: 10, color: '#fff' }}>{t(pr.key)}</T>
            </Bouncy>
            <Bouncy onPress={remove} style={{ padding: 4 }}>
              <Text style={{ fontSize: 15 }}>🗑️</Text>
            </Bouncy>
          </Row>
        </Card>
      </Animated.View>
    </FadeIn>
  );
}

function Tasks() {
  const { t, n, c, tasks, setTasks } = useApp();
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('left');
  const [cheer, setCheer] = useState(0);
  const cheerA = useRef(new Animated.Value(0)).current;
  const CHEERS = ['cheer1', 'cheer2', 'cheer3', 'cheer4', 'cheer5'];

  const add = () => {
    if (!text.trim()) return;
    setTasks((all) => [{ id: uid(), text: text.trim(), done: false, priority: 0, due: dayKey() }, ...all]);
    setText('');
  };
  const toggle = (id) => {
    const was = tasks.find((x) => x.id === id)?.done;
    setTasks((all) => all.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
    if (!was) {
      setCheer((k) => k + 1);
      cheerA.setValue(0);
      Animated.sequence([
        Animated.spring(cheerA, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.delay(800),
        Animated.timing(cheerA, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  };
  const list = tasks
    .filter((x) => (filter === 'all' ? true : filter === 'left' ? !x.done : x.done))
    .sort((a, b) => a.done - b.done || (b.priority || 0) - (a.priority || 0));
  const done = tasks.filter((x) => x.done).length;

  return (
    <View>
      <T style={{ color: c.inkSoft, marginBottom: 10 }}>{t('tasksSub', { d: n(done), a: n(tasks.length) })}</T>
      <Progress value={tasks.length ? (done / tasks.length) * 100 : 0} />
      <Row gap={10} style={{ marginVertical: 14 }}>
        <Input style={{ flex: 1 }} value={text} onChangeText={setText} placeholder={t('whatToDo')} onSubmitEditing={add} returnKeyType="done" />
        <GradButton label="＋" onPress={add} />
      </Row>
      <Chips
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'left', label: t('left') },
          { value: 'done', label: t('doneF') },
          { value: 'all', label: t('all') },
        ]}
      />
      {list.length === 0 ? (
        <Empty emoji="🍓" text={filter === 'done' ? t('noDone') : t('noTasks')} />
      ) : (
        list.map((x, i) => (
          <TaskRow
            key={x.id}
            item={x}
            index={i}
            onToggle={toggle}
            onDelete={(id) => setTasks((all) => all.filter((y) => y.id !== id))}
            onPriority={(id) => setTasks((all) => all.map((y) => (y.id === id ? { ...y, priority: ((y.priority || 0) + 1) % PRI.length } : y)))}
          />
        ))
      )}
      <Animated.View
        pointerEvents="none"
        style={{ position: 'absolute', top: 40, alignSelf: 'center', opacity: cheerA, transform: [{ scale: cheerA.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] }}
      >
        <LinearGradient colors={[POP[cheer % POP.length], POP[(cheer + 2) % POP.length]]} style={{ paddingHorizontal: 22, paddingVertical: 12, borderRadius: 99 }}>
          <T w="black" center style={{ color: '#fff', fontSize: 20 }}>{t(CHEERS[cheer % CHEERS.length])}</T>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

// ================= أهداف السنة =================
function YearGoals({ registerFab }) {
  const { t, n, lang, c, yearGoals, setYearGoals } = useApp();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [edit, setEdit] = useState(null); // هدف جديد/تعديل
  const [stepEdit, setStepEdit] = useState(null); // { id, m, step }
  const [open, setOpen] = useState(null);

  useEffect(() => {
    registerFab(() => setEdit({ title: '', cat: 'catSelf', template: '' }));
    return () => registerFab(null);
  }, []);

  const list = yearGoals.filter((g) => g.year === year);

  const save = () => {
    if (!edit.title.trim()) return setEdit(null);
    if (edit.id) {
      setYearGoals((all) => all.map((g) => (g.id === edit.id ? { ...g, title: edit.title, cat: edit.cat } : g)));
    } else {
      // بنقسم الهدف لخطوة صغيرة كل شهر
      const months = {};
      for (let i = 1; i <= 12; i++) months[i] = { step: edit.template.trim() || '', done: false };
      setYearGoals((all) => [{ id: uid(), title: edit.title.trim(), cat: edit.cat, year, months }, ...all]);
    }
    setEdit(null);
  };

  const toggleMonth = (g, m) =>
    setYearGoals((all) =>
      all.map((x) => (x.id === g.id ? { ...x, months: { ...x.months, [m]: { ...x.months[m], done: !x.months[m]?.done } } } : x))
    );

  return (
    <View>
      <Row between style={{ marginBottom: 12 }}>
        <Bouncy onPress={() => setYear(year - 1)}><T w="black" style={{ fontSize: 22, color: c.pinkDeep }}>{lang === 'ar' ? '›' : '‹'}</T></Bouncy>
        <T w="black" center style={{ fontSize: 20 }}>{n(year)}</T>
        <Bouncy onPress={() => setYear(year + 1)}><T w="black" style={{ fontSize: 22, color: c.pinkDeep }}>{lang === 'ar' ? '‹' : '›'}</T></Bouncy>
      </Row>

      {list.length === 0 ? (
        <Empty emoji="🪜" text={t('noYearGoals')} />
      ) : (
        list.map((g, gi) => {
          const cat = catOf(g.cat);
          const doneCount = Object.values(g.months || {}).filter((x) => x.done).length;
          const isOpen = open === g.id;
          return (
            <FadeIn key={g.id} delay={gi * 60}>
              <Card>
                <Bouncy onPress={() => setOpen(isOpen ? null : g.id)} onLongPress={() => confirmDelete(t, () => setYearGoals((all) => all.filter((x) => x.id !== g.id)))}>
                  <Row gap={10}>
                    <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: cat.color + '55', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 22 }}>{cat.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <T w="bold" style={{ fontSize: 16 }}>{g.title}</T>
                      <T style={{ fontSize: 12, color: c.inkSoft }}>{t(cat.key)} · {t('monthsDone', { d: n(doneCount) })}</T>
                    </View>
                    <Bouncy onPress={() => setEdit({ id: g.id, title: g.title, cat: g.cat, template: '' })}><Text style={{ fontSize: 16 }}>✏️</Text></Bouncy>
                  </Row>
                  <View style={{ marginTop: 10 }}>
                    <Progress value={(doneCount / 12) * 100} colors={[cat.color, c.orange]} />
                  </View>
                </Bouncy>
                {isOpen && (
                  <FadeIn from={8}>
                    <View style={{ marginTop: 12, gap: 6 }}>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                        const st = g.months?.[m] || {};
                        const cur = year === now.getFullYear() && m === now.getMonth() + 1;
                        return (
                          <Row key={m} gap={8} style={{ backgroundColor: cur ? c.track : 'transparent', borderRadius: 12, padding: 6 }}>
                            <Bouncy onPress={() => toggleMonth(g, m)} haptic={st.done ? 'light' : 'success'}>
                              <Text style={{ fontSize: 18 }}>{st.done ? '✅' : '⬜'}</Text>
                            </Bouncy>
                            <T w="bold" style={{ width: 70, fontSize: 12, color: cur ? c.pinkDeep : c.inkSoft }}>{NAMES[lang].g[m - 1]}</T>
                            <Bouncy outer={{ flex: 1 }} onPress={() => setStepEdit({ id: g.id, m, step: st.step || '' })}>
                              <T style={{ fontSize: 13, color: st.step ? c.ink : c.inkSoft, textDecorationLine: st.done ? 'line-through' : 'none' }}>
                                {st.step || '✍️ ' + t('monthStep')}
                              </T>
                            </Bouncy>
                          </Row>
                        );
                      })}
                    </View>
                  </FadeIn>
                )}
              </Card>
            </FadeIn>
          );
        })
      )}

      <Sheet visible={!!edit} onClose={() => setEdit(null)} title={edit?.id ? t('edit') : t('newGoal') + ' 🎯'}>
        {edit && (
          <>
            <T style={{ color: c.inkSoft, marginBottom: 10 }}>{t('yearGoalHint')}</T>
            <Input value={edit.title} onChangeText={(title) => setEdit({ ...edit, title })} placeholder={t('goalTitle')} style={{ marginBottom: 12 }} />
            <T w="bold" style={{ marginBottom: 8 }}>{t('category')}</T>
            <Chips value={edit.cat} onChange={(cat) => setEdit({ ...edit, cat })} options={CATS.map((x) => ({ value: x.key, label: t(x.key), emoji: x.emoji }))} />
            {!edit.id && (
              <Input value={edit.template} onChangeText={(template) => setEdit({ ...edit, template })} placeholder={t('monthStep') + ' (' + t('autoSteps') + ')'} />
            )}
            <GradButton label={t('save') + ' ✨'} style={{ marginTop: 16 }} onPress={save} />
          </>
        )}
      </Sheet>

      <Sheet visible={!!stepEdit} onClose={() => setStepEdit(null)} title={stepEdit ? t('stepFor', { m: NAMES[lang].g[stepEdit.m - 1] }) : ''}>
        {stepEdit && (
          <>
            <Input value={stepEdit.step} onChangeText={(step) => setStepEdit({ ...stepEdit, step })} placeholder={t('monthStep')} multiline style={{ minHeight: 80 }} />
            <GradButton
              label={t('save')}
              style={{ marginTop: 14 }}
              onPress={() => {
                setYearGoals((all) =>
                  all.map((g) => (g.id === stepEdit.id ? { ...g, months: { ...g.months, [stepEdit.m]: { ...(g.months[stepEdit.m] || {}), step: stepEdit.step } } } : g))
                );
                setStepEdit(null);
              }}
            />
          </>
        )}
      </Sheet>
    </View>
  );
}

// ================= أهداف الشهر =================
function MonthGoals({ registerFab }) {
  const { t, n, lang, c, monthGoals, setMonthGoals } = useApp();
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [edit, setEdit] = useState(null);
  const mk = monthKey(cursor);

  useEffect(() => {
    registerFab(() => setEdit({ title: '', cat: 'catSelf', target: '10', unit: '' }));
    return () => registerFab(null);
  }, []);

  const list = monthGoals.filter((g) => g.month === mk);
  const bump = (g, k) => {
    const v = Math.max(0, Math.min(g.target, g.current + k));
    if (v === g.target && g.current < g.target) tap('success');
    setMonthGoals((all) => all.map((x) => (x.id === g.id ? { ...x, current: v } : x)));
  };
  const save = () => {
    if (!edit.title.trim()) return setEdit(null);
    const target = Math.max(1, Math.round(parseNum(edit.target)) || 1);
    if (edit.id) setMonthGoals((all) => all.map((g) => (g.id === edit.id ? { ...g, title: edit.title, cat: edit.cat, target, unit: edit.unit } : g)));
    else setMonthGoals((all) => [{ id: uid(), month: mk, title: edit.title.trim(), cat: edit.cat, target, unit: edit.unit.trim(), current: 0 }, ...all]);
    setEdit(null);
  };

  return (
    <View>
      <Row between style={{ marginBottom: 12 }}>
        <Bouncy onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
          <T w="black" style={{ fontSize: 22, color: c.pinkDeep }}>{lang === 'ar' ? '›' : '‹'}</T>
        </Bouncy>
        <T w="black" center style={{ fontSize: 19 }}>{NAMES[lang].g[cursor.getMonth()]} {n(cursor.getFullYear())}</T>
        <Bouncy onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
          <T w="black" style={{ fontSize: 22, color: c.pinkDeep }}>{lang === 'ar' ? '‹' : '›'}</T>
        </Bouncy>
      </Row>

      {list.length === 0 ? (
        <Empty emoji="🌱" text={t('noMonthGoals')} />
      ) : (
        list.map((g, i) => {
          const cat = catOf(g.cat);
          const pct = (g.current / g.target) * 100;
          return (
            <FadeIn key={g.id} delay={i * 60}>
              <Card>
                <Bouncy
                  onPress={() => setEdit({ id: g.id, title: g.title, cat: g.cat, target: String(g.target), unit: g.unit })}
                  onLongPress={() => confirmDelete(t, () => setMonthGoals((all) => all.filter((x) => x.id !== g.id)))}
                >
                  <Row gap={10}>
                    <Text style={{ fontSize: 24 }}>{pct >= 100 ? '🏆' : cat.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <T w="bold" style={{ fontSize: 15 }}>{g.title}</T>
                      <T style={{ fontSize: 12, color: c.inkSoft }}>
                        {t(cat.key)} · {n(g.current)} / {n(g.target)} {g.unit}
                      </T>
                    </View>
                  </Row>
                </Bouncy>
                <View style={{ marginVertical: 10 }}>
                  <Progress value={pct} colors={[cat.color, c.orange]} />
                </View>
                <Row between>
                  <T w="bold" style={{ color: pct >= 100 ? c.orange : c.inkSoft, fontSize: 13 }}>{pct >= 100 ? t('goalDone') : n(Math.round(pct)) + '%'}</T>
                  <Row gap={8}>
                    <Bouncy onPress={() => bump(g, -1)} style={[rb, { backgroundColor: c.track }]}><Text style={{ color: c.pinkDeep, fontSize: 18, fontWeight: '700' }}>−</Text></Bouncy>
                    <Bouncy onPress={() => bump(g, 1)} style={[rb, { backgroundColor: c.pink }]}><Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>+</Text></Bouncy>
                  </Row>
                </Row>
              </Card>
            </FadeIn>
          );
        })
      )}

      <Sheet visible={!!edit} onClose={() => setEdit(null)} title={edit?.id ? t('edit') : t('newGoal') + ' 🌱'}>
        {edit && (
          <>
            <Input value={edit.title} onChangeText={(title) => setEdit({ ...edit, title })} placeholder={t('goalTitle')} style={{ marginBottom: 12 }} />
            <T w="bold" style={{ marginBottom: 8 }}>{t('category')}</T>
            <Chips value={edit.cat} onChange={(cat) => setEdit({ ...edit, cat })} options={CATS.map((x) => ({ value: x.key, label: t(x.key), emoji: x.emoji }))} />
            <Row gap={10}>
              <Input style={{ flex: 1 }} value={edit.target} onChangeText={(target) => setEdit({ ...edit, target })} placeholder={t('target')} keyboardType="number-pad" />
              <Input style={{ flex: 1.4 }} value={edit.unit} onChangeText={(unit) => setEdit({ ...edit, unit })} placeholder={t('unitHint')} />
            </Row>
            <GradButton label={t('save') + ' ✨'} style={{ marginTop: 16 }} onPress={save} />
          </>
        )}
      </Sheet>
    </View>
  );
}

export default function PlanScreen({ sub, registerFab }) {
  const { t } = useApp();
  const [tab, setTab] = useState(sub || 'tasks');
  useEffect(() => {
    if (sub) setTab(sub);
  }, [sub]);
  useEffect(() => {
    if (tab === 'tasks') registerFab(null);
  }, [tab]);
  return (
    <View>
      <Header emoji="🎯" title={t('tabPlan')} />
      <Segments
        value={tab}
        onChange={setTab}
        options={[
          { value: 'tasks', label: '✅ ' + t('tasks') },
          { value: 'year', label: '🪜 ' + t('yearGoals') },
          { value: 'month', label: '🌱 ' + t('monthGoals') },
        ]}
      />
      {tab === 'tasks' && <Tasks />}
      {tab === 'year' && <YearGoals registerFab={registerFab} />}
      {tab === 'month' && <MonthGoals registerFab={registerFab} />}
    </View>
  );
}

const rb = { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' };
