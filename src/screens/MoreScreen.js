// المزيد: المناسبات، فلوسي، مفضلاتي، وزني، أذكاري، الإعدادات
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bouncy, FadeIn, Header, T } from '../components/ui';
import { useApp } from '../AppContext';
import { PASTEL, PASTEL_DARK, shadow } from '../theme';
import EventsScreen from './more/EventsScreen';
import MoneyScreen from './more/MoneyScreen';
import FavsScreen from './more/FavsScreen';
import WeightScreen from './more/WeightScreen';
import AdhkarScreen from './more/AdhkarScreen';
import SettingsScreen from './more/SettingsScreen';

const ITEMS = [
  { key: 'events', emoji: '🎀', title: 'events', sub: 'eventsSub', C: EventsScreen },
  { key: 'money', emoji: '💰', title: 'money', sub: 'moneySub', C: MoneyScreen },
  { key: 'favs', emoji: '💖', title: 'favs', sub: 'favsSub', C: FavsScreen },
  { key: 'weight', emoji: '⚖️', title: 'weight', sub: 'weightSub', C: WeightScreen },
  { key: 'adhkar', emoji: '📿', title: 'adhkar', sub: 'adhkarSub', C: AdhkarScreen },
  { key: 'settings', emoji: '⚙️', title: 'settings', sub: 'settingsSub', C: SettingsScreen },
];

export default function MoreScreen({ sub, registerFab }) {
  const { t, c, lang, row } = useApp();
  const [page, setPage] = useState(sub || null);
  useEffect(() => {
    setPage(sub || null);
  }, [sub]);
  useEffect(() => {
    if (!page) registerFab(null);
  }, [page]);

  const item = ITEMS.find((i) => i.key === page);

  if (item) {
    const Screen = item.C;
    return (
      <View>
        <Bouncy onPress={() => setPage(null)} style={{ alignSelf: lang === 'ar' ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
          <View style={{ backgroundColor: c.card, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 6 }}>
            <T w="bold" style={{ color: c.pinkDeep }}>{lang === 'ar' ? '→ ' + t('tabMore') : '← ' + t('tabMore')}</T>
          </View>
        </Bouncy>
        <Header emoji={item.emoji} title={t(item.title)} />
        <Screen registerFab={registerFab} />
      </View>
    );
  }

  return (
    <View>
      <Header emoji="🧁" title={t('moreTitle')} />
      <View style={{ flexDirection: row, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {ITEMS.map((it, i) => (
          <FadeIn key={it.key} delay={i * 60} style={{ width: '48%', marginBottom: 14 }}>
            <Bouncy onPress={() => setPage(it.key)} haptic="medium">
              <LinearGradient colors={(c.dark ? PASTEL_DARK : PASTEL)[i % PASTEL.length]} style={[{ borderRadius: 26, padding: 16, minHeight: 130 }, shadow]}>
                <T style={{ fontSize: 36 }}>{it.emoji}</T>
                <T w="black" style={{ fontSize: 17, marginTop: 10 }}>{t(it.title)}</T>
                <T style={{ fontSize: 12, color: c.inkSoft, marginTop: 2 }}>{t(it.sub)}</T>
              </LinearGradient>
            </Bouncy>
          </FadeIn>
        ))}
      </View>
    </View>
  );
}
