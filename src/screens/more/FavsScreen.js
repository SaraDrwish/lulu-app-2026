// مفضلاتي: أغاني، أفلام، مسلسلات، كتب، بودكاست — المفضلة + اللي عايزة أشوفها/أقراها + اللي خلصتها
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Bouncy, Card, Chips, Empty, FadeIn, GradButton, Input, Row, Segments, Sheet, T, confirmDelete } from '../../components/ui';
import { useApp } from '../../AppContext';
import { PASTEL, PASTEL_DARK, uid } from '../../theme';

const KINDS = [
  { k: 'song', e: '🎵' },
  { k: 'movie', e: '🎬' },
  { k: 'series', e: '📺' },
  { k: 'book', e: '📚' },
  { k: 'podcast', e: '🎧' },
];
const STATUS = [
  { k: 'fav', e: '💖' },
  { k: 'wantTo', e: '🔖' },
  { k: 'finishedIt', e: '✅' },
];

export default function FavsScreen({ registerFab }) {
  const { t, c, favs, setFavs } = useApp();
  const [kind, setKind] = useState('all');
  const [status, setStatus] = useState('fav');
  const [edit, setEdit] = useState(null);

  useEffect(() => {
    registerFab(() => setEdit({ kind: kind === 'all' ? 'book' : kind, status, title: '', by: '', stars: 0 }));
    return () => registerFab(null);
  }, [kind, status]);

  const list = favs.filter((f) => (kind === 'all' || f.kind === kind) && f.status === status);
  const save = () => {
    if (!edit.title.trim()) return setEdit(null);
    setFavs((all) => (edit.id ? all.map((f) => (f.id === edit.id ? edit : f)) : [{ ...edit, id: uid(), at: Date.now() }, ...all]));
    setEdit(null);
  };

  return (
    <View>
      <Segments value={status} onChange={setStatus} options={STATUS.map((s) => ({ value: s.k, label: `${s.e} ${t(s.k)}` }))} />
      <Chips
        value={kind}
        onChange={setKind}
        options={[{ value: 'all', label: t('all') }, ...KINDS.map((x) => ({ value: x.k, label: t(x.k), emoji: x.e }))]}
      />
      {list.length === 0 ? (
        <Empty emoji="💖" text={t('noFavs')} />
      ) : (
        list.map((f, i) => {
          const k = KINDS.find((x) => x.k === f.kind);
          const pal = (c.dark ? PASTEL_DARK : PASTEL)[KINDS.indexOf(k) % PASTEL.length];
          return (
            <FadeIn key={f.id} delay={Math.min(i, 10) * 40}>
              <Bouncy onPress={() => setEdit(f)} onLongPress={() => confirmDelete(t, () => setFavs((all) => all.filter((x) => x.id !== f.id)))}>
                <Card colors={pal} style={{ paddingVertical: 12, marginBottom: 10 }}>
                  <Row gap={12}>
                    <Text style={{ fontSize: 28 }}>{k?.e}</Text>
                    <View style={{ flex: 1 }}>
                      <T w="bold" style={{ fontSize: 15 }}>{f.title}</T>
                      {f.by ? <T style={{ fontSize: 12, color: c.inkSoft }}>{f.by}</T> : null}
                    </View>
                    <Row gap={2}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Bouncy key={s} onPress={() => setFavs((all) => all.map((x) => (x.id === f.id ? { ...x, stars: x.stars === s ? 0 : s } : x)))}>
                          <Text style={{ fontSize: 14, opacity: s <= (f.stars || 0) ? 1 : 0.25 }}>⭐</Text>
                        </Bouncy>
                      ))}
                    </Row>
                  </Row>
                </Card>
              </Bouncy>
            </FadeIn>
          );
        })
      )}

      <Sheet visible={!!edit} onClose={() => setEdit(null)} title={edit?.id ? t('edit') : t('favs') + ' 💖'}>
        {edit && (
          <>
            <Chips value={edit.kind} onChange={(k) => setEdit({ ...edit, kind: k })} options={KINDS.map((x) => ({ value: x.k, label: t(x.k), emoji: x.e }))} />
            <Segments value={edit.status} onChange={(s) => setEdit({ ...edit, status: s })} options={STATUS.map((s) => ({ value: s.k, label: `${s.e} ${t(s.k)}` }))} />
            <Input value={edit.title} onChangeText={(title) => setEdit({ ...edit, title })} placeholder={t('favTitle')} style={{ marginBottom: 10 }} />
            <Input value={edit.by} onChangeText={(by) => setEdit({ ...edit, by })} placeholder={t('by')} />
            <GradButton label={t('save') + ' 💾'} style={{ marginTop: 16 }} onPress={save} />
          </>
        )}
      </Sheet>
    </View>
  );
}
