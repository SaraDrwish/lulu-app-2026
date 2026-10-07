// الإعدادات: اللغة، الوضع الليلي، الأهداف اليومية، النسخة الاحتياطية
import React, { useState } from 'react';
import { Platform, Share, View } from 'react-native';
import { Card, FadeIn, GradButton, Input, Row, Segments, SectionTitle, Sheet, Stepper, T, notify } from '../../components/ui';
import { useApp } from '../../AppContext';
import { exportAll, importAll } from '../../storage';
import { juzOf } from '../TodayScreen';

export default function SettingsScreen() {
  const { t, n, c, settings, set, reload } = useApp();
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreText, setRestoreText] = useState('');

  return (
    <View>
      <FadeIn>
        <Card>
          <SectionTitle emoji="🌍" title={t('language')} />
          <Segments
            value={settings.lang}
            onChange={(lang) => set({ lang })}
            options={[
              { value: 'ar', label: 'العربية' },
              { value: 'en', label: 'English' },
            ]}
          />
          <SectionTitle emoji="🌗" title={t('appearance')} />
          <Segments
            value={settings.appearance}
            onChange={(appearance) => set({ appearance })}
            options={[
              { value: 'light', label: '☀️ ' + t('light') },
              { value: 'dark', label: '🌙 ' + t('dark') },
              { value: 'auto', label: '✨ ' + t('auto') },
            ]}
          />
        </Card>
      </FadeIn>

      <FadeIn delay={60}>
        <Card>
          <SectionTitle emoji="💕" title={t('yourName')} />
          <Input value={settings.name} onChangeText={(name) => set({ name })} placeholder={t('yourName')} />
        </Card>
      </FadeIn>

      <FadeIn delay={120}>
        <Card>
          <Stepper label={'💧 ' + t('waterGoal')} value={settings.waterGoal} min={1} max={20} onChange={(waterGoal) => set({ waterGoal })} />
          <Stepper label={'📗 ' + t('wirdGoal')} value={settings.wirdGoal} min={1} max={60} onChange={(wirdGoal) => set({ wirdGoal })} />
          <Stepper label={'📖 ' + t('quranPage')} value={settings.quranPage} min={1} max={604} onChange={(quranPage) => set({ quranPage })} />
          <T style={{ fontSize: 12, color: c.inkSoft, marginTop: 4 }}>{t('wirdAt', { p: n(settings.quranPage), j: n(juzOf(settings.quranPage)) })}</T>
          <Stepper label={'⏩ ±' + n(10)} value={settings.quranPage} min={1} max={604} step={10} onChange={(quranPage) => set({ quranPage })} />
          <Row gap={10} style={{ marginTop: 8 }}>
            <T w="medium" style={{ flex: 1 }}>💰 {t('currencyL')}</T>
            <Input value={settings.currency} onChangeText={(currency) => set({ currency })} placeholder={t('currency')} style={{ width: 110, paddingVertical: 8 }} />
          </Row>
        </Card>
      </FadeIn>

      <FadeIn delay={180}>
        <Card>
          <SectionTitle emoji="💾" title={t('backup')} />
          <T style={{ fontSize: 13, color: c.inkSoft, marginBottom: 12, lineHeight: 21 }}>{t('backupSub')}</T>
          <Row gap={10}>
            <GradButton
              outer={{ flex: 1 }}
              small
              label={t('makeBackup')}
              onPress={async () => {
                const data = await exportAll();
                try {
                  await Share.share({ message: data, title: 'Lulu backup' });
                } catch {
                  // على الويب لو المشاركة مش متاحة: بننسخ النسخة للحافظة
                  if (Platform.OS === 'web' && navigator.clipboard) {
                    await navigator.clipboard.writeText(data);
                    notify(t('backupCopied'));
                  }
                }
              }}
            />
            <GradButton outer={{ flex: 1 }} small label={t('restore')} onPress={() => setRestoreOpen(true)} />
          </Row>
        </Card>
      </FadeIn>

      <T center style={{ color: c.inkSoft, marginTop: 6 }}>{t('about')}</T>
      <T center style={{ color: c.inkSoft, fontSize: 12, marginTop: 4 }}>{t('dataSafe')}</T>

      <Sheet visible={restoreOpen} onClose={() => setRestoreOpen(false)} title={t('restore')}>
        <Input value={restoreText} onChangeText={setRestoreText} placeholder={t('restoreHint')} multiline style={{ minHeight: 160, fontSize: 12 }} />
        <GradButton
          label={t('restore')}
          style={{ marginTop: 14 }}
          onPress={async () => {
            try {
              await importAll(restoreText.trim());
              setRestoreOpen(false);
              notify(t('restored'));
              reload && reload();
            } catch {
              notify(t('restoreFail'));
            }
          }}
        />
      </Sheet>
    </View>
  );
}
