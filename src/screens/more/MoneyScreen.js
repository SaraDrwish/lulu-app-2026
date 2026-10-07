// فلوسي: المصاريف + الدخل + التحويش، وميزانية الشهر
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Bouncy, Card, Chips, Empty, FadeIn, GradButton, Input, Progress, Row, Segments, SectionTitle, Sheet, T, confirmDelete } from '../../components/ui';
import { BarList } from '../../components/Charts';
import { useApp } from '../../AppContext';
import { NAMES, parseNum } from '../../i18n';
import { POP, uid } from '../../theme';
import { shortDate } from '../../services/dates';

export const MCATS = [
  { k: 'mFood', e: '🍔' }, { k: 'mTransport', e: '🚕' }, { k: 'mShopping', e: '🛍️' }, { k: 'mBills', e: '🧾' },
  { k: 'mHealth', e: '💊' }, { k: 'mGifts', e: '🎁' }, { k: 'mFun', e: '🎡' }, { k: 'mEdu', e: '📚' },
  { k: 'mHome', e: '🏠' }, { k: 'mCharity', e: '🤲' }, { k: 'mOther', e: '✨' },
];
const TYPE_E = { expense: '💸', income: '💵', saving: '🐷' };

export default function MoneyScreen({ registerFab }) {
  const { t, n, lang, c, tx, setTx, settings, set, currency } = useApp();
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [edit, setEdit] = useState(null);
  const [goalsSheet, setGoalsSheet] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState('');
  const [goalDraft, setGoalDraft] = useState('');

  useEffect(() => {
    registerFab(() => setEdit({ type: 'expense', amount: '', cat: 'mFood', note: '' }));
    return () => registerFab(null);
  }, []);

  const money = (v) => `${n(Math.round(v * 100) / 100)} ${currency}`;
  const inMonth = tx.filter((x) => {
    const d = new Date(x.date);
    return d.getFullYear() === cursor.getFullYear() && d.getMonth() === cursor.getMonth();
  });
  const sum = (type, arr = inMonth) => arr.filter((x) => x.type === type).reduce((s, x) => s + x.amount, 0);
  const spent = sum('expense');
  const earned = sum('income');
  const saved = sum('saving');
  const totalSaved = sum('saving', tx);
  const budget = settings.budget;

  const byCat = MCATS.map((m, i) => ({
    key: m.k,
    label: `${m.e} ${t(m.k)}`,
    value: inMonth.filter((x) => x.type === 'expense' && x.cat === m.k).reduce((s, x) => s + x.amount, 0),
    color: POP[i % POP.length],
  }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value);

  const save = () => {
    const amount = parseNum(edit.amount);
    if (!amount) return setEdit(null);
    const item = { ...edit, amount, date: edit.date || Date.now() };
    setTx((all) => (edit.id ? all.map((x) => (x.id === edit.id ? item : x)) : [{ ...item, id: uid() }, ...all]));
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

      <FadeIn>
        <Row gap={10}>
          {[
            ['spent', spent, ['#FF8FAB', '#FB7185']],
            ['earned', earned, ['#86EFAC', '#34D399']],
            ['saved', saved, ['#FFB65C', '#FF9F45']],
          ].map(([k, v, g]) => (
            <Card key={k} colors={g} style={{ flex: 1, paddingHorizontal: 10 }}>
              <T center style={{ color: '#fff', fontSize: 12 }}>{t(k)}</T>
              <T w="black" center numberOfLines={1} adjustsFontSizeToFit style={{ color: '#fff', fontSize: 17 }}>{n(Math.round(v))}</T>
              <T center style={{ color: '#fff', fontSize: 10 }}>{currency}</T>
            </Card>
          ))}
        </Row>
      </FadeIn>

      <FadeIn delay={60}>
        <Bouncy onPress={() => { setBudgetDraft(budget ? String(budget) : ''); setGoalDraft(settings.savingGoal ? String(settings.savingGoal) : ''); setGoalsSheet(true); }}>
          <Card>
            <SectionTitle emoji="🧮" title={t('budget')} right={<Text>✏️</Text>} />
            {budget ? (
              <>
                <Progress value={(spent / budget) * 100} colors={spent > budget ? ['#FB7185', '#F43F5E'] : ['#86EFAC', '#FFB65C']} />
                <T style={{ marginTop: 8, fontSize: 13, color: spent > budget ? '#F43F5E' : c.inkSoft }}>
                  {spent > budget ? t('overBudget', { n: money(spent - budget) }) : `${t('remaining')}: ${money(budget - spent)} / ${money(budget)}`}
                </T>
              </>
            ) : (
              <T style={{ color: c.inkSoft }}>＋ {t('budget')}</T>
            )}
            <View style={{ height: 1, backgroundColor: c.line, marginVertical: 12 }} />
            <Row between style={{ marginBottom: 6 }}>
              <T w="bold">🐷 {t('totalSaved')}</T>
              <T w="black" style={{ color: c.orange }}>{money(totalSaved)}</T>
            </Row>
            {settings.savingGoal ? (
              <>
                <Progress value={(totalSaved / settings.savingGoal) * 100} colors={['#FFB65C', '#FF8FAB']} />
                <T style={{ marginTop: 6, fontSize: 12, color: c.inkSoft }}>
                  {t('savingGoal')}: {money(settings.savingGoal)} · {n(Math.min(100, Math.round((totalSaved / settings.savingGoal) * 100)))}%
                </T>
              </>
            ) : null}
          </Card>
        </Bouncy>
      </FadeIn>

      {byCat.length > 0 && (
        <FadeIn delay={120}>
          <Card>
            <SectionTitle emoji="📊" title={t('byCategory')} />
            <BarList items={byCat} format={(v) => money(v)} />
          </Card>
        </FadeIn>
      )}

      {inMonth.length === 0 ? (
        <Empty emoji="🐷" text={t('noTx')} />
      ) : (
        [...inMonth]
          .sort((a, b) => b.date - a.date)
          .map((x, i) => {
            const cat = MCATS.find((m) => m.k === x.cat);
            const sign = x.type === 'expense' ? '−' : '+';
            const color = x.type === 'expense' ? c.pinkDeep : x.type === 'income' ? '#22C55E' : c.orange;
            return (
              <FadeIn key={x.id} delay={Math.min(i, 10) * 40}>
                <Bouncy
                  onPress={() => setEdit({ ...x, amount: String(x.amount) })}
                  onLongPress={() => confirmDelete(t, () => setTx((all) => all.filter((y) => y.id !== x.id)))}
                >
                  <Card style={{ paddingVertical: 12, marginBottom: 8 }}>
                    <Row gap={10}>
                      <Text style={{ fontSize: 24 }}>{x.type === 'expense' && cat ? cat.e : TYPE_E[x.type]}</Text>
                      <View style={{ flex: 1 }}>
                        <T w="bold" style={{ fontSize: 14 }}>{x.note || (x.type === 'expense' && cat ? t(cat.k) : t(x.type))}</T>
                        <T style={{ fontSize: 11, color: c.inkSoft }}>{shortDate(x.date, lang, n)}</T>
                      </View>
                      <T w="black" style={{ color, fontSize: 15 }}>{sign}{money(x.amount)}</T>
                    </Row>
                  </Card>
                </Bouncy>
              </FadeIn>
            );
          })
      )}

      <Sheet visible={!!edit} onClose={() => setEdit(null)} title={edit?.id ? t('edit') : t('money') + ' 💰'}>
        {edit && (
          <>
            <Segments
              value={edit.type}
              onChange={(type) => setEdit({ ...edit, type })}
              options={[
                { value: 'expense', label: '💸 ' + t('expense') },
                { value: 'income', label: '💵 ' + t('income') },
                { value: 'saving', label: '🐷 ' + t('saving') },
              ]}
            />
            <Input value={edit.amount} onChangeText={(amount) => setEdit({ ...edit, amount })} placeholder={`${t('amount')} (${currency})`} keyboardType="decimal-pad" style={{ marginBottom: 12, fontSize: 22 }} />
            {edit.type === 'expense' && (
              <Chips value={edit.cat} onChange={(cat) => setEdit({ ...edit, cat })} options={MCATS.map((m) => ({ value: m.k, label: t(m.k), emoji: m.e }))} />
            )}
            <Input value={edit.note} onChangeText={(note) => setEdit({ ...edit, note })} placeholder={t('note')} />
            <GradButton label={t('save') + ' 💾'} style={{ marginTop: 16 }} onPress={save} />
          </>
        )}
      </Sheet>

      <Sheet visible={goalsSheet} onClose={() => setGoalsSheet(false)} title={t('budget') + ' 🧮'}>
        <T w="bold" style={{ marginBottom: 6 }}>{t('budget')} ({currency})</T>
        <Input value={budgetDraft} onChangeText={setBudgetDraft} keyboardType="decimal-pad" placeholder="0" style={{ marginBottom: 12 }} />
        <T w="bold" style={{ marginBottom: 6 }}>{t('savingGoal')} ({currency})</T>
        <Input value={goalDraft} onChangeText={setGoalDraft} keyboardType="decimal-pad" placeholder="0" />
        <GradButton
          label={t('save')}
          style={{ marginTop: 16 }}
          onPress={() => {
            set({ budget: parseNum(budgetDraft), savingGoal: parseNum(goalDraft) });
            setGoalsSheet(false);
          }}
        />
      </Sheet>
    </View>
  );
}
