// وزني: متابعة أسبوعية هادية برسم بياني
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Bouncy, Card, Empty, FadeIn, GradButton, Input, Row, SectionTitle, Sheet, T, confirmDelete } from '../../components/ui';
import { LineChart } from '../../components/Charts';
import { useApp } from '../../AppContext';
import { parseNum } from '../../i18n';
import { uid } from '../../theme';
import { daysBetween, shortDate } from '../../services/dates';

export default function WeightScreen({ registerFab }) {
  const { t, n, lang, c, weights, setWeights, settings, set } = useApp();
  const [edit, setEdit] = useState(null);
  const [goalSheet, setGoalSheet] = useState(false);
  const [goalDraft, setGoalDraft] = useState('');

  useEffect(() => {
    registerFab(() => setEdit({ kg: '' }));
    return () => registerFab(null);
  }, []);

  const list = [...weights].sort((a, b) => a.date - b.date);
  const first = list[0];
  const last = list[list.length - 1];
  const diff = first && last ? Math.round((last.kg - first.kg) * 10) / 10 : 0;
  const since = last ? daysBetween(new Date(last.date), new Date()) : null;

  const save = () => {
    const kg = parseNum(edit.kg);
    if (!kg) return setEdit(null);
    setWeights((all) => (edit.id ? all.map((w) => (w.id === edit.id ? { ...w, kg } : w)) : [...all, { id: uid(), kg, date: Date.now() }]));
    setEdit(null);
  };

  return (
    <View>
      {list.length === 0 ? (
        <>
          <Empty emoji="⚖️" text={t('noWeight')} />
          <GradButton label={t('addWeight')} onPress={() => setEdit({ kg: '' })} />
        </>
      ) : (
        <>
          <FadeIn>
            <Card>
              <LineChart values={list.slice(-16).map((w) => w.kg)} goal={settings.weightGoal || undefined} />
              <Row between style={{ marginTop: 12 }}>
                {[
                  ['start', first.kg],
                  ['current', last.kg],
                  ['change', (diff > 0 ? '+' : '') + diff],
                ].map(([k, v]) => (
                  <View key={k} style={{ flex: 1, alignItems: 'center' }}>
                    <T center style={{ fontSize: 12, color: c.inkSoft }}>{t(k)}</T>
                    <T w="black" center style={{ fontSize: 20 }}>{n(v)}</T>
                    <T center style={{ fontSize: 11, color: c.inkSoft }}>{t('kg')}</T>
                  </View>
                ))}
              </Row>
            </Card>
          </FadeIn>
          {since >= 7 ? (
            <Card colors={c.dark ? ['#5A3A28', '#5A2A3C'] : ['#FFE9D6', '#FFE0E8']} style={{ paddingVertical: 12 }}>
              <T w="medium">⏰ {t('weighReminder', { n: n(since) })}</T>
            </Card>
          ) : null}
          <Bouncy onPress={() => { setGoalDraft(settings.weightGoal ? String(settings.weightGoal) : ''); setGoalSheet(true); }}>
            <Card style={{ paddingVertical: 12 }}>
              <Row between>
                <T w="bold">🎯 {t('weightGoal')}</T>
                <T w="black" style={{ color: c.orange }}>{settings.weightGoal ? `${n(settings.weightGoal)} ${t('kg')}` : '✏️'}</T>
              </Row>
            </Card>
          </Bouncy>
          <T style={{ color: c.inkSoft, fontSize: 12, marginBottom: 12 }}>{t('weightNote')}</T>
          <Card>
            <SectionTitle emoji="📒" title={t('weight')} />
            {[...list].reverse().map((w) => (
              <Bouncy key={w.id} onPress={() => setEdit({ ...w, kg: String(w.kg) })} onLongPress={() => confirmDelete(t, () => setWeights((all) => all.filter((x) => x.id !== w.id)))}>
                <Row between style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.line }}>
                  <T style={{ color: c.inkSoft }}>{shortDate(w.date, lang, n)}</T>
                  <T w="bold">{n(w.kg)} {t('kg')}</T>
                </Row>
              </Bouncy>
            ))}
          </Card>
        </>
      )}

      <Sheet visible={!!edit} onClose={() => setEdit(null)} title={t('addWeight') + ' ⚖️'}>
        {edit && (
          <>
            <Input value={edit.kg} onChangeText={(kg) => setEdit({ ...edit, kg })} placeholder={t('kg')} keyboardType="decimal-pad" style={{ fontSize: 26 }} autoFocus />
            <GradButton label={t('save')} style={{ marginTop: 14 }} onPress={save} />
          </>
        )}
      </Sheet>
      <Sheet visible={goalSheet} onClose={() => setGoalSheet(false)} title={t('weightGoal') + ' 🎯'}>
        <Input value={goalDraft} onChangeText={setGoalDraft} placeholder={t('kg')} keyboardType="decimal-pad" />
        <GradButton label={t('save')} style={{ marginTop: 14 }} onPress={() => { set({ weightGoal: parseNum(goalDraft) }); setGoalSheet(false); }} />
      </Sheet>
    </View>
  );
}
