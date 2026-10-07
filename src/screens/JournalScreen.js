// يومياتي: مذكرات + ملاحظات + رسم
import React, { useEffect, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bouncy, Card, Empty, FadeIn, GradButton, Header, Input, Row, Segments, Sheet, T, confirmDelete } from '../components/ui';
import DrawPad, { DrawingThumb } from '../components/DrawPad';
import { useApp } from '../AppContext';
import { PASTEL, PASTEL_DARK, shadow, uid } from '../theme';
import { dayKey, fromKey, gregText, shortDate } from '../services/dates';
import { moodOf } from '../services/mood';

// ================= المذكرات =================
function Diary({ registerFab }) {
  const { t, n, lang, c, diary, setDiary, days } = useApp();
  const [edit, setEdit] = useState(null);

  useEffect(() => {
    registerFab(() => setEdit({ date: dayKey(), text: '' }));
    return () => registerFab(null);
  }, []);

  const list = [...diary].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.at - a.at));
  const save = () => {
    if (!edit.text.trim()) return setEdit(null);
    setDiary((all) =>
      edit.id ? all.map((d) => (d.id === edit.id ? { ...d, text: edit.text, date: edit.date } : d)) : [{ id: uid(), date: edit.date, text: edit.text, at: Date.now() }, ...all]
    );
    setEdit(null);
  };

  return (
    <View>
      {list.length === 0 ? (
        <Empty emoji="📖" text={t('noDiary')} />
      ) : (
        list.map((d, i) => {
          const mood = moodOf(days[d.date]?.mood);
          const pal = (c.dark ? PASTEL_DARK : PASTEL)[i % PASTEL.length];
          return (
            <FadeIn key={d.id} delay={i * 50}>
              <Bouncy onPress={() => setEdit(d)} onLongPress={() => confirmDelete(t, () => setDiary((all) => all.filter((x) => x.id !== d.id)))}>
                <Card colors={pal}>
                  <Row between style={{ marginBottom: 8 }}>
                    <T w="bold" style={{ fontSize: 13, color: c.inkSoft }}>{gregText(fromKey(d.date), lang, n)}</T>
                    {mood ? <Text style={{ fontSize: 20 }}>{mood.emoji}</Text> : null}
                  </Row>
                  <T style={{ fontSize: 15, lineHeight: 25 }} numberOfLines={6}>{d.text}</T>
                </Card>
              </Bouncy>
            </FadeIn>
          );
        })
      )}
      <Sheet visible={!!edit} onClose={() => setEdit(null)} title={edit?.id ? t('edit') : t('newEntry') + ' 📖'}>
        {edit && (
          <>
            <T w="medium" style={{ color: c.inkSoft, marginBottom: 8 }}>{gregText(fromKey(edit.date), lang, n)}</T>
            <Input value={edit.text} onChangeText={(text) => setEdit({ ...edit, text })} placeholder={t('writeDiary')} multiline style={{ minHeight: 220 }} autoFocus={!edit.id} />
            <GradButton label={t('save') + ' 💾'} style={{ marginTop: 14 }} onPress={save} />
          </>
        )}
      </Sheet>
    </View>
  );
}

// ================= الملاحظات =================
function NoteCard({ note, i, onOpen, onRemove }) {
  const { c, lang, n } = useApp();
  const pal = (c.dark ? PASTEL_DARK : PASTEL)[note.color % PASTEL.length];
  return (
    <FadeIn delay={i * 50}>
      <Bouncy onPress={() => onOpen(note)} onLongPress={() => onRemove(note.id)} style={{ marginBottom: 12 }}>
        <LinearGradient colors={pal} style={[{ borderRadius: 22, padding: 14 }, shadow]}>
          {note.title ? <T w="bold" style={{ fontSize: 15, marginBottom: 6 }} numberOfLines={2}>{note.title}</T> : null}
          <T style={{ fontSize: 13, color: c.inkSoft, lineHeight: 21 }} numberOfLines={8}>{note.body}</T>
          <T style={{ fontSize: 10, color: c.inkSoft, marginTop: 8, opacity: 0.7 }}>{shortDate(note.at, lang, n)}</T>
        </LinearGradient>
      </Bouncy>
    </FadeIn>
  );
}

function Notes({ registerFab }) {
  const { t, c, notes, setNotes, row } = useApp();
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState(null);

  useEffect(() => {
    registerFab(() => setEdit({ title: '', body: '', color: Math.floor(Math.random() * PASTEL.length) }));
    return () => registerFab(null);
  }, []);

  const save = () => {
    if (!edit.title.trim() && !edit.body.trim()) return setEdit(null);
    setNotes((all) => (edit.id ? all.map((x) => (x.id === edit.id ? { ...edit, at: Date.now() } : x)) : [{ ...edit, id: uid(), at: Date.now() }, ...all]));
    setEdit(null);
  };
  const remove = (id) => confirmDelete(t, () => setNotes((all) => all.filter((x) => x.id !== id)));

  const list = notes.filter((x) => (x.title + ' ' + x.body).toLowerCase().includes(q.toLowerCase()));
  const colA = list.filter((_, i) => i % 2 === 0);
  const colB = list.filter((_, i) => i % 2 === 1);

  return (
    <View>
      <Input value={q} onChangeText={setQ} placeholder={t('searchNotes')} style={{ marginBottom: 6 }} />
      <T style={{ fontSize: 11, color: c.inkSoft, marginBottom: 12 }}>{t('longPressDelete')}</T>
      {list.length === 0 ? (
        <Empty emoji="🧸" text={t('noNotes')} />
      ) : (
        <View style={{ flexDirection: row, gap: 12, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>{colA.map((x, i) => <NoteCard key={x.id} note={x} i={i * 2} onOpen={setEdit} onRemove={remove} />)}</View>
          <View style={{ flex: 1 }}>{colB.map((x, i) => <NoteCard key={x.id} note={x} i={i * 2 + 1} onOpen={setEdit} onRemove={remove} />)}</View>
        </View>
      )}
      <Sheet visible={!!edit} onClose={() => setEdit(null)} title={edit?.id ? t('edit') : t('newNote')}>
        {edit && (
          <>
            <Input value={edit.title} onChangeText={(title) => setEdit({ ...edit, title })} placeholder={t('title')} style={{ marginBottom: 10 }} />
            <Input value={edit.body} onChangeText={(body) => setEdit({ ...edit, body })} placeholder={t('writeHere')} multiline style={{ minHeight: 180 }} />
            <Row gap={10} style={{ marginTop: 12 }}>
              {(c.dark ? PASTEL_DARK : PASTEL).map((p, i) => (
                <Bouncy key={i} onPress={() => setEdit({ ...edit, color: i })}>
                  <LinearGradient colors={p} style={{ width: 32, height: 32, borderRadius: 16, borderWidth: edit.color === i ? 3 : 1, borderColor: edit.color === i ? c.orange : c.line }} />
                </Bouncy>
              ))}
            </Row>
            <GradButton label={t('save') + ' 💾'} style={{ marginTop: 16 }} onPress={save} />
          </>
        )}
      </Sheet>
    </View>
  );
}

// ================= الرسم =================
function Drawings({ registerFab }) {
  const { t, drawings, setDrawings, row } = useApp();
  const [open, setOpen] = useState(null); // {id?} أو null
  const size = (Dimensions.get('window').width - 32 - 12) / 2;

  useEffect(() => {
    registerFab(() => setOpen({ key: uid() }));
    return () => registerFab(null);
  }, []);

  return (
    <View>
      {drawings.length === 0 ? (
        <>
          <Empty emoji="🎨" text={t('noDrawings')} />
          <GradButton label={t('newDrawing') + ' 🖌️'} onPress={() => setOpen({ key: uid() })} />
        </>
      ) : (
        <View style={{ flexDirection: row, flexWrap: 'wrap', gap: 12 }}>
          {drawings.map((d, i) => (
            <FadeIn key={d.id} delay={i * 50}>
              <Bouncy
                onPress={() => setOpen({ key: d.id, drawing: d })}
                onLongPress={() => confirmDelete(t, () => setDrawings((all) => all.filter((x) => x.id !== d.id)))}
                style={[{ borderRadius: 22, overflow: 'hidden' }, shadow]}
              >
                <DrawingThumb drawing={d} size={size} />
              </Bouncy>
            </FadeIn>
          ))}
        </View>
      )}
      {open && (
        <DrawPad
          key={open.key}
          visible
          initial={open.drawing}
          onClose={() => setOpen(null)}
          onSave={(data) =>
            setDrawings((all) =>
              open.drawing ? all.map((x) => (x.id === open.drawing.id ? { ...x, ...data, at: Date.now() } : x)) : [{ id: uid(), ...data, at: Date.now() }, ...all]
            )
          }
        />
      )}
    </View>
  );
}

export default function JournalScreen({ registerFab, sub }) {
  const { t } = useApp();
  const [tab, setTab] = useState(sub || 'diary');
  useEffect(() => {
    if (sub) setTab(sub);
  }, [sub]);
  return (
    <View>
      <Header emoji="📖" title={t('tabJournal')} />
      <Segments
        value={tab}
        onChange={setTab}
        options={[
          { value: 'diary', label: '📖 ' + t('diary') },
          { value: 'notes', label: '📝 ' + t('notes') },
          { value: 'draw', label: '🎨 ' + t('draw') },
        ]}
      />
      {tab === 'diary' && <Diary registerFab={registerFab} />}
      {tab === 'notes' && <Notes registerFab={registerFab} />}
      {tab === 'draw' && <Drawings registerFab={registerFab} />}
    </View>
  );
}
