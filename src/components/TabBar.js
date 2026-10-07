import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bouncy, T } from './ui';
import { shadow } from '../theme';
import { useApp } from '../AppContext';

export const TABS = [
  { key: 'today', emoji: '🌸', label: 'tabToday' },
  { key: 'calendar', emoji: '🗓️', label: 'tabCal' },
  { key: 'plan', emoji: '🎯', label: 'tabPlan' },
  { key: 'journal', emoji: '📖', label: 'tabJournal' },
  { key: 'more', emoji: '🧁', label: 'tabMore' },
];

function Tab({ tab, active, onPress }) {
  const { t, c } = useApp();
  const a = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(a, { toValue: active ? 1 : 0, friction: 4, tension: 120, useNativeDriver: true }).start();
  }, [active]);

  return (
    <Bouncy onPress={onPress} outer={{ flex: 1 }} style={styles.tab}>
      <Animated.View
        style={[styles.bubble, { opacity: a, transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }] }]}
      >
        <LinearGradient colors={[c.pink, c.orange]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
      </Animated.View>
      <Animated.Text
        style={{
          fontSize: 22,
          transform: [
            { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
            { scale: a.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) },
          ],
        }}
      >
        {tab.emoji}
      </Animated.Text>
      <T w={active ? 'bold' : 'medium'} center numberOfLines={1} style={{ fontSize: 11, color: active ? '#fff' : c.inkSoft }}>
        {t(tab.label)}
      </T>
    </Bouncy>
  );
}

export default function TabBar({ current, onChange, bottom }) {
  const { c, row } = useApp();
  return (
    <View style={[styles.wrap, { bottom: bottom + 8 }]}>
      <View style={[styles.bar, shadow, { backgroundColor: c.bar, borderColor: c.cardBorder, flexDirection: row }]}>
        {TABS.map((tb) => (
          <Tab key={tb.key} tab={tb} active={current === tb.key} onPress={() => onChange(tb.key)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, right: 12 },
  bar: { borderRadius: 30, paddingVertical: 7, paddingHorizontal: 6, borderWidth: 1 },
  tab: { alignItems: 'center', justifyContent: 'center', height: 58 },
  bubble: { position: 'absolute', top: 0, bottom: 0, left: 3, right: 3, borderRadius: 22, overflow: 'hidden' },
});
