// أذكاري: تعديل الأذكار اليومية وعددها
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Bouncy, Card, FadeIn, GradButton, Input, Row, Sheet, Stepper, T, confirmDelete } from '../../components/ui';
import { useApp, DEFAULT_ADHKAR } from '../../AppContext';
import { uid } from '../../theme';
import { dayKey } from '../../services/dates';

export default function AdhkarScreen({ registerFab }) {
  const { t, n, lang, c, adhkar, setAdhkar, updateDay, days } = useApp();
  const [edit, setEdit] = useState(null);
  const today = dayKey();
  const counts = days[today]?.dhikr || {};

  useEffect(() => {
    registerFab(() => setEdit({ text: '', target: 10 }));
    return () => registerFab(null);
  }, []);

  const save = () => {
    if (!edit.text.trim()) return setEdit(null);
    const text = edit.text.trim();
    setAdhkar((all) =>
      edit.id
        ? all.map((d) => (d.id === edit.id ? { ...d, [lang]: text, ...(d.custom ? { ar: text, en: text } : {}), target: edit.target } : d))
        : [...all, { id: uid(), ar: text, en: text, target: edit.target, custom: true }]
    );
    setEdit(null);
  };

  return (
    <View>
      {adhkar.map((d, i) => (
        <FadeIn key={d.id} delay={i * 40}>
          <Bouncy onPress={() => setEdit({ id: d.id, text: d[lang] || d.ar, target: d.target })} onLongPress={() => confirmDelete(t, () => setAdhkar((all) => all.filter((x) => x.id !== d.id)))}>
            <Card style={{ paddingVertical: 12, marginBottom: 10 }}>
              <Row gap={10}>
                <Text style={{ fontSize: 22 }}>📿</Text>
                <View style={{ flex: 1 }}>
                  <T w="bold" style={{ fontSize: 15 }}>{d[lang] || d.ar}</T>
                  <T style={{ fontSize: 12, color: c.inkSoft }}>{n(counts[d.id] || 0)} / {n(d.target)}</T>
                </View>
                <T w="black" style={{ color: c.pinkDeep }}>×{n(d.target)}</T>
              </Row>
            </Card>
          </Bouncy>
        </FadeIn>
      ))}
      <T style={{ fontSize: 11, color: c.inkSoft, marginBottom: 12 }}>{t('longPressDelete')}</T>
      <Row gap={10}>
        <GradButton outer={{ flex: 1 }} small label={'🔄 ' + t('resetCounts')} onPress={() => updateDay(today, { dhikr: {} })} />
        <GradButton outer={{ flex: 1 }} small label={'🌿 ' + t('adhkar')} onPress={() => setAdhkar((all) => [...DEFAULT_ADHKAR.filter((d) => !all.some((x) => x.id === d.id)), ...all])} />
      </Row>

      <Sheet visible={!!edit} onClose={() => setEdit(null)} title={edit?.id ? t('edit') : t('addDhikr') + ' 📿'}>
        {edit && (
          <>
            <Input value={edit.text} onChangeText={(text) => setEdit({ ...edit, text })} placeholder={t('dhikrText')} multiline style={{ minHeight: 70 }} />
            <Stepper label={t('count')} value={edit.target} min={1} max={1000} onChange={(target) => setEdit({ ...edit, target })} />
            <Row gap={8} style={{ marginBottom: 6 }}>
              {[3, 7, 10, 33, 100].map((v) => (
                <Bouncy key={v} onPress={() => setEdit({ ...edit, target: v })} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: edit.target === v ? c.pink : c.track }}>
                  <T w="bold" style={{ color: edit.target === v ? '#fff' : c.inkSoft }}>{n(v)}</T>
                </Bouncy>
              ))}
            </Row>
            <GradButton label={t('save')} style={{ marginTop: 14 }} onPress={save} />
          </>
        )}
      </Sheet>
    </View>
  );
}
