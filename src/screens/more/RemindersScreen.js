// تذكيراتي: إشعارات الجهاز + ربط GitHub + إضافة وتعديل ومسح أي تذكير
import React, { useEffect, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import {
  Bouncy, Card, Chips, Empty, FadeIn, GradButton, Input, Row, SectionTitle, Sheet, Stepper, T, Toggle, confirmDelete, notify,
} from '../../components/ui';
import { useApp } from '../../AppContext';
import { NAMES } from '../../i18n';
import { uid } from '../../theme';
import { currentSubscription, keyConfigured, pushSupport, subscribe, unsubscribe } from '../../services/push';
import { deviceTimezone, getToken, loadReminders, saveReminders, setToken } from '../../services/remindersSync';

const EMOJIS = ['💧', '📿', '📗', '🌅', '🌇', '🤍', '🕌', '💊', '🏃‍♀️', '📚', '😴', '🍎', '💼', '🌸', '⏰', '🎂'];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

const to12 = (hhmm, lang, n) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${n(`${h % 12 || 12}:${String(m).padStart(2, '0')}`)} ${h < 12 ? NAMES[lang].am : NAMES[lang].pm}`;
};

// ===== ١) تفعيل الإشعارات على الجهاز ده =====
function DeviceSetup() {
  const { t, c } = useApp();
  const support = pushSupport();
  const [code, setCode] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (support === 'ok') currentSubscription().then(setCode);
  }, []);

  if (support === 'native') return null;

  const enable = async () => {
    if (!keyConfigured()) return notify(t('remindersNoKey'));
    setBusy(true);
    try {
      setCode(await subscribe());
    } catch (e) {
      notify(e.message === 'denied' ? t('remindersDenied') : String(e.message || e));
    }
    setBusy(false);
  };

  return (
    <Card>
      <SectionTitle emoji="📱" title={t('stepDevice')} />
      {support === 'install' ? (
        <T style={{ color: c.inkSoft, lineHeight: 22 }}>{t('remindersInstall')}</T>
      ) : support === 'unsupported' ? (
        <T style={{ color: c.inkSoft, lineHeight: 22 }}>{t('remindersUnsupported')}</T>
      ) : !code ? (
        <>
          <T style={{ color: c.inkSoft, marginBottom: 12, lineHeight: 22 }}>{t('remindersSub')}</T>
          <GradButton label={busy ? '…' : t('enableReminders')} onPress={busy ? undefined : enable} />
        </>
      ) : (
        <>
          <T style={{ color: c.inkSoft, marginBottom: 10, lineHeight: 22 }}>{t('remindersStep')}</T>
          <Input value={code} editable={false} multiline style={{ minHeight: 80, fontSize: 11 }} />
          <Row gap={10} style={{ marginTop: 12 }}>
            <GradButton
              outer={{ flex: 1 }}
              small
              label={t('copyCode')}
              onPress={async () => {
                try {
                  await navigator.clipboard.writeText(code);
                  notify(t('codeCopied'));
                } catch {
                  notify(code);
                }
              }}
            />
            <GradButton
              outer={{ flex: 1 }}
              small
              label={t('disableReminders')}
              onPress={async () => {
                await unsubscribe().catch(() => {});
                setCode(null);
              }}
            />
          </Row>
        </>
      )}
    </Card>
  );
}

// ===== ٢) ربط GitHub (عشان لولو تقدر تعدّل ملف التذكيرات) =====
function GithubLink({ token, onToken }) {
  const { t, c } = useApp();
  const [draft, setDraft] = useState('');
  if (token) {
    return (
      <Card style={{ paddingVertical: 12 }}>
        <Row between>
          <T w="medium" style={{ flex: 1 }}>🔗 {t('githubLinked')}</T>
          <Bouncy
            onPress={() => confirmDelete(t, async () => {
              await setToken(null);
              onToken(null);
            })}
          >
            <T w="bold" style={{ color: c.pinkDeep }}>{t('unlink')}</T>
          </Bouncy>
        </Row>
      </Card>
    );
  }
  return (
    <Card>
      <SectionTitle emoji="🔗" title={t('stepGithub')} />
      <T style={{ color: c.inkSoft, marginBottom: 10, lineHeight: 22 }}>{t('githubHint')}</T>
      <Bouncy onPress={() => Linking.openURL('https://github.com/settings/personal-access-tokens/new')}>
        <T w="bold" style={{ color: c.pinkDeep, marginBottom: 10 }}>↗ github.com/settings/personal-access-tokens</T>
      </Bouncy>
      <Input value={draft} onChangeText={setDraft} placeholder="github_pat_..." autoCapitalize="none" autoCorrect={false} />
      <GradButton
        label={t('link')}
        style={{ marginTop: 12 }}
        onPress={async () => {
          if (!draft.trim()) return;
          try {
            await loadReminders(draft.trim()); // نتأكد إن الـ token شغال قبل ما نحفظه
            await setToken(draft.trim());
            onToken(draft.trim());
          } catch (e) {
            notify(t('githubError') + '\n' + e.message);
          }
        }}
      />
    </Card>
  );
}

// ===== ٣) تعديل تذكير =====
function ReminderSheet({ edit, setEdit, onSave }) {
  const { t, n, lang, c } = useApp();
  const [h, setH] = useState(9);
  const [m, setM] = useState(0);
  if (!edit) return null;
  const times = [...edit.times].sort();
  return (
    <Sheet visible onClose={() => setEdit(null)} title={edit.isNew ? t('newReminder') : t('edit')}>
      <Row wrap gap={8} style={{ marginBottom: 12 }}>
        {EMOJIS.map((e) => (
          <Bouncy key={e} onPress={() => setEdit({ ...edit, emoji: e })}>
            <View style={{ width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: edit.emoji === e ? c.pink : c.track }}>
              <Text style={{ fontSize: 20 }}>{e}</Text>
            </View>
          </Bouncy>
        ))}
      </Row>
      <Input value={edit.title} onChangeText={(title) => setEdit({ ...edit, title })} placeholder={t('reminderTitle')} style={{ marginBottom: 10 }} />
      <Input value={edit.body} onChangeText={(body) => setEdit({ ...edit, body })} placeholder={t('reminderBody')} multiline style={{ minHeight: 70 }} />

      <T w="bold" style={{ marginTop: 14, marginBottom: 8 }}>⏰ {t('times')}</T>
      <Row wrap gap={8} style={{ marginBottom: 8 }}>
        {times.map((tm) => (
          <Bouncy key={tm} onPress={() => setEdit({ ...edit, times: edit.times.filter((x) => x !== tm) })}>
            <View style={{ backgroundColor: c.pink, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 }}>
              <T w="bold" style={{ color: '#fff', fontSize: 13 }}>{to12(tm, lang, n)}  ✕</T>
            </View>
          </Bouncy>
        ))}
      </Row>
      <Stepper label={t('hour')} value={h} min={0} max={23} onChange={setH} />
      <Stepper label={t('minute')} value={m} min={0} max={55} step={5} onChange={setM} />
      <GradButton
        small
        label={`＋ ${to12(`${h}:${m}`, lang, n)}`}
        onPress={() => {
          const tm = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          if (!edit.times.includes(tm)) setEdit({ ...edit, times: [...edit.times, tm] });
        }}
      />

      <T w="bold" style={{ marginTop: 14, marginBottom: 8 }}>📅 {t('days')}</T>
      <Chips
        multi
        value={edit.days}
        onChange={(days) => setEdit({ ...edit, days })}
        options={ALL_DAYS.map((d) => ({ value: d, label: NAMES[lang].d[d] }))}
      />
      <Row gap={10}>
        <Bouncy onPress={() => setEdit({ ...edit, days: ALL_DAYS })}><T w="bold" style={{ color: c.pinkDeep }}>{t('everyDay')}</T></Bouncy>
        <Bouncy onPress={() => setEdit({ ...edit, days: [5] })}><T w="bold" style={{ color: c.pinkDeep }}>{t('fridayOnly')}</T></Bouncy>
      </Row>

      <GradButton
        label={t('save') + ' ☁️'}
        style={{ marginTop: 18 }}
        onPress={() => {
          if (!edit.title.trim()) return notify(t('reminderTitle'));
          if (!edit.times.length) return notify(t('needTime'));
          if (!edit.days.length) return notify(t('needDay'));
          const { isNew, ...clean } = edit;
          onSave({ ...clean, title: clean.title.trim(), body: clean.body.trim(), times: [...clean.times].sort(), days: [...clean.days].sort() });
          setEdit(null);
        }}
      />
    </Sheet>
  );
}

// ===== الشاشة =====
export default function RemindersScreen({ registerFab }) {
  const { t, n, lang, c } = useApp();
  const [token, setTok] = useState(undefined);
  const [file, setFile] = useState(null); // { data, sha }
  const [status, setStatus] = useState('idle'); // idle | loading | saving | saved | error
  const [error, setError] = useState('');
  const [edit, setEdit] = useState(null);

  useEffect(() => {
    getToken().then((tk) => setTok(tk || null));
  }, []);

  useEffect(() => {
    if (!token) return;
    setStatus('loading');
    loadReminders(token)
      .then((f) => {
        setFile(f);
        setStatus('idle');
      })
      .catch((e) => {
        setError(e.message);
        setStatus('error');
      });
  }, [token]);

  useEffect(() => {
    if (!token || !file) return registerFab(null);
    registerFab(() => setEdit({ isNew: true, id: uid(), emoji: '⏰', title: '', body: '', times: [], days: ALL_DAYS, enabled: true }));
    return () => registerFab(null);
  }, [token, !!file]);

  // أي تعديل: بنحدّث القايمة ونرفعها على GitHub على طول
  const commit = async (reminders, message) => {
    const data = { ...file.data, timezone: deviceTimezone(), reminders };
    setFile({ ...file, data });
    setStatus('saving');
    try {
      const sha = await saveReminders(token, data, file.sha, message);
      setFile({ data, sha });
      setStatus('saved');
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  };

  const list = file?.data?.reminders || [];
  const statusText = {
    loading: '⏳ ' + t('syncLoading'),
    saving: '☁️ ' + t('syncSaving'),
    saved: '✅ ' + t('syncSaved'),
    error: '⚠️ ' + error,
  }[status];

  return (
    <View>
      <DeviceSetup />
      {token !== undefined && <GithubLink token={token} onToken={setTok} />}

      {token && (
        <>
          {statusText ? <T center style={{ color: status === 'error' ? c.pinkDeep : c.inkSoft, marginBottom: 10, fontSize: 13 }}>{statusText}</T> : null}
          {file && list.length === 0 ? <Empty emoji="🔔" text={t('noReminders')} /> : null}
          {list.map((r, i) => (
            <FadeIn key={r.id} delay={Math.min(i, 8) * 40}>
              <Bouncy
                onPress={() => setEdit({ ...r })}
                onLongPress={() => confirmDelete(t, () => commit(list.filter((x) => x.id !== r.id), `Delete reminder: ${r.title}`))}
              >
                <Card style={{ paddingVertical: 12, marginBottom: 10, opacity: r.enabled ? 1 : 0.55 }}>
                  <Row gap={10}>
                    <Text style={{ fontSize: 26 }}>{r.emoji || '⏰'}</Text>
                    <View style={{ flex: 1 }}>
                      <T w="bold" style={{ fontSize: 15 }}>{r.title}</T>
                      <T style={{ fontSize: 12, color: c.inkSoft }} numberOfLines={2}>
                        {r.times.map((tm) => to12(tm, lang, n)).join(' · ')}
                      </T>
                      <T style={{ fontSize: 11, color: c.inkSoft }}>
                        {r.days.length === 7 ? t('everyDay') : r.days.map((d) => NAMES[lang].d[d]).join('، ')}
                      </T>
                    </View>
                    <View style={{ width: 60 }}>
                      <Toggle value={r.enabled} onChange={(enabled) => commit(list.map((x) => (x.id === r.id ? { ...x, enabled } : x)), `${enabled ? 'Enable' : 'Disable'} reminder: ${r.title}`)} label="" />
                    </View>
                  </Row>
                </Card>
              </Bouncy>
            </FadeIn>
          ))}
          {file ? <T style={{ fontSize: 11, color: c.inkSoft, textAlign: 'center' }}>{t('remindersFooter')}</T> : null}
        </>
      )}

      <ReminderSheet
        edit={edit}
        setEdit={setEdit}
        onSave={(r) => {
          const exists = list.some((x) => x.id === r.id);
          commit(exists ? list.map((x) => (x.id === r.id ? r : x)) : [...list, r], `${exists ? 'Edit' : 'Add'} reminder: ${r.title}`);
        }}
      />
    </View>
  );
}
