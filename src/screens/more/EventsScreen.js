// المناسبات: أعياد ميلاد الحبايب + مناسبات اجتماعية + المناسبات العامة
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Bouncy, Card, Chips, FadeIn, GradButton, Input, Row, Sheet, T, Toggle, DateField, confirmDelete } from '../../components/ui';
import { useApp } from '../../AppContext';
import { uid } from '../../theme';
import { allUpcoming, countdown, eventEmoji, eventTitle, EVENT_TYPES } from '../../services/events';
import { daysBetween, shortDate } from '../../services/dates';

const EMOJIS = ['🎂', '💐', '💍', '👶', '🎓', '🏡', '✈️', '💌', '🎁', '🌹', '👩‍❤️‍👨', '📌'];

export default function EventsScreen({ registerFab }) {
  const { t, n, lang, c, events, setEvents } = useApp();
  const [filter, setFilter] = useState('all');
  const [edit, setEdit] = useState(null);
  const now = new Date();

  const blank = () => ({ type: 'birthday', title: '', person: '', date: Date.now(), yearly: true, emoji: '🎂' });
  useEffect(() => {
    registerFab(() => setEdit(blank()));
    return () => registerFab(null);
  }, []);

  const list = allUpcoming(events, now, 366).filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'mine') return e.kind === 'mine';
    return e.kind === filter;
  });

  const save = () => {
    if (!edit.title.trim() && !edit.person.trim()) return setEdit(null);
    const clean = { ...edit, title: edit.title.trim(), person: edit.person.trim() };
    setEvents((all) => (edit.id ? all.map((e) => (e.id === edit.id ? clean : e)) : [{ ...clean, id: uid() }, ...all]));
    setEdit(null);
  };

  return (
    <View>
      <Chips
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: t('all') },
          { value: 'mine', label: t('mine'), emoji: '💖' },
          { value: 'islamic', label: t('islamic'), emoji: '🌙' },
          { value: 'world', label: t('world'), emoji: '🌍' },
        ]}
      />
      {list.map((e, i) => {
        const d = daysBetween(now, e.date);
        const age = e.kind === 'mine' && e.type === 'birthday' && e.yearly ? e.date.getFullYear() - new Date(e.origDate).getFullYear() : 0;
        const soon = d <= 7;
        return (
          <FadeIn key={e.id + String(e.date)} delay={Math.min(i, 10) * 40}>
            <Bouncy
              onPress={() => e.kind === 'mine' && setEdit(events.find((x) => x.id === e.id))}
              onLongPress={() => e.kind === 'mine' && confirmDelete(t, () => setEvents((all) => all.filter((x) => x.id !== e.id)))}
            >
              <Card colors={soon ? (c.dark ? ['#5A2A3C', '#5A3A28'] : ['#FFE0E8', '#FFE9D6']) : undefined} style={{ paddingVertical: 12, marginBottom: 10 }}>
                <Row gap={12}>
                  <View style={{ width: 46, height: 46, borderRadius: 16, backgroundColor: c.track, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 24 }}>{eventEmoji(e)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <T w="bold" style={{ fontSize: 15 }}>{eventTitle(e, lang, t)}</T>
                    <T style={{ fontSize: 12, color: c.inkSoft }}>
                      {shortDate(e.date, lang, n)}
                      {e.approx ? ` · ${t('approx')}` : ''}
                      {age > 0 ? ` · ${t('turns', { n: n(age) })}` : ''}
                    </T>
                  </View>
                  <View style={{ backgroundColor: soon ? c.pinkDeep : c.track, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 }}>
                    <T w="bold" center style={{ fontSize: 11, color: soon ? '#fff' : c.inkSoft }}>{countdown(d, t, n)}</T>
                  </View>
                </Row>
              </Card>
            </Bouncy>
          </FadeIn>
        );
      })}

      <Sheet visible={!!edit} onClose={() => setEdit(null)} title={edit?.id ? t('edit') : t('events') + ' 🎀'}>
        {edit && (
          <>
            <T w="bold" style={{ marginBottom: 8 }}>{t('type')}</T>
            <Chips
              value={edit.type}
              onChange={(type) => setEdit({ ...edit, type, emoji: EVENT_TYPES.find((x) => x.key === type).emoji })}
              options={EVENT_TYPES.map((x) => ({ value: x.key, label: t(x.key), emoji: x.emoji }))}
            />
            {edit.type === 'birthday' ? (
              <Input value={edit.person} onChangeText={(person) => setEdit({ ...edit, person })} placeholder={t('person')} style={{ marginBottom: 10 }} />
            ) : (
              <Input value={edit.title} onChangeText={(title) => setEdit({ ...edit, title })} placeholder={t('eventTitle')} style={{ marginBottom: 10 }} />
            )}
            <T w="bold">{t('date')}</T>
            <DateField value={edit.date} onChange={(date) => setEdit({ ...edit, date })} />
            <Toggle value={edit.yearly} onChange={(yearly) => setEdit({ ...edit, yearly })} label={t('yearly') + ' 🔁'} />
            <Row wrap gap={8} style={{ marginTop: 8 }}>
              {EMOJIS.map((em) => (
                <Bouncy key={em} onPress={() => setEdit({ ...edit, emoji: em })}>
                  <View style={{ width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: edit.emoji === em ? c.pink : c.track }}>
                    <Text style={{ fontSize: 22 }}>{em}</Text>
                  </View>
                </Bouncy>
              ))}
            </Row>
            <GradButton label={t('save') + ' 🎉'} style={{ marginTop: 16 }} onPress={save} />
          </>
        )}
      </Sheet>
    </View>
  );
}
