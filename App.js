import React, { useCallback, useRef, useState } from 'react';
import { I18nManager, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold, Tajawal_800ExtraBold } from '@expo-google-fonts/tajawal';
import { AppProvider, useApp } from './src/AppContext';
import { Background, Sparkles } from './src/components/Background';
import TabBar from './src/components/TabBar';
import { Fab } from './src/components/ui';
import TodayScreen from './src/screens/TodayScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import PlanScreen from './src/screens/PlanScreen';
import JournalScreen from './src/screens/JournalScreen';
import MoreScreen from './src/screens/MoreScreen';

// المحاذاة (يمين/شمال) بنتحكم فيها بنفسنا حسب لغة التطبيق، مش لغة الموبايل
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

const SCREENS = {
  today: TodayScreen,
  calendar: CalendarScreen,
  plan: PlanScreen,
  journal: JournalScreen,
  more: MoreScreen,
};

function Shell() {
  const { c } = useApp();
  const insets = useSafeAreaInsets();
  const bg = useRef(null);
  const sparkles = useRef(null);
  const [nav, setNav] = useState({ tab: 'today', sub: null, k: 0 });
  const [fab, setFab] = useState(null);

  // كل شاشة بتسجّل زرار + بتاعها (لو عندها)
  const registerFab = useCallback((fn) => setFab(fn ? () => fn : null), []);
  const go = useCallback((tab, sub = null) => setNav((n) => ({ tab, sub, k: n.k + 1 })), []);

  const Screen = SCREENS[nav.tab];

  return (
    <View
      style={{ flex: 1, backgroundColor: c.bg }}
      onTouchStart={(e) => {
        // مع كل ضغطة: نجوم ملونة مكان صباعك + الخلفية بتغير لونها
        sparkles.current?.burst(e.nativeEvent.pageX, e.nativeEvent.pageY);
        bg.current?.tap();
      }}
    >
      <StatusBar style={c.statusBar} />
      <Background ref={bg} gradient={c.bgGrad} blobOpacity={c.blobOpacity} />
      <ScrollView
        key={nav.tab + nav.k}
        contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: insets.bottom + 150, paddingHorizontal: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Screen go={go} sub={nav.sub} registerFab={registerFab} />
      </ScrollView>
      {fab ? <Fab onPress={fab} bottom={insets.bottom + 96} /> : null}
      <TabBar current={nav.tab} onChange={(tab) => go(tab)} bottom={insets.bottom} />
      <Sparkles ref={sparkles} />
    </View>
  );
}

// لو حصل أي خطأ، بيظهر على الشاشة بدل صفحة فاضية (عشان نعرف المشكلة فين)
class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#FFF1F4' }} contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
        <Text style={{ fontSize: 40, textAlign: 'center' }}>🐰💔</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#F26B8A', textAlign: 'center', marginVertical: 12 }}>
          حصلت مشكلة — صوّري الشاشة دي وابعتيها
        </Text>
        <Text selectable style={{ fontSize: 13, color: '#4A2C3A', fontFamily: 'monospace' }}>
          {String(this.state.error?.message || this.state.error)}
          {'\n\n'}
          {String(this.state.error?.stack || '').slice(0, 1500)}
        </Text>
      </ScrollView>
    );
  }
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold, Tajawal_800ExtraBold });
  const [reloadKey, setReloadKey] = useState(0);
  // لو الخط ماتحمّلش لأي سبب، نكمّل بالخط العادي بدل ما نفضل على شاشة فاضية
  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, backgroundColor: '#FFF1F4' }} />;
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppProvider key={reloadKey} reload={() => setReloadKey((k) => k + 1)}>
          <Shell />
        </AppProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}