// مكوّنات الواجهة المشتركة — كلها بتتبع اللغة (المحاذاة) والوضع الليلي تلقائياً
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { F, POP, shadow } from '../theme';
import { useApp } from '../AppContext';
import { NAMES } from '../i18n';

const isWeb = Platform.OS === 'web';

// اهتزاز خفيف مع الضغط (على الويب: أندرويد بس بيدعمه، الآيفون لأ)
export const tap = (style = 'light') => {
  try {
    if (isWeb) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(style === 'success' ? [12, 40, 12] : 10);
      return;
    }
    if (style === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return;
    }
    const s = style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light;
    Haptics.impactAsync(s).catch(() => {});
  } catch {}
};

// رسالة بسيطة (Alert مش بيشتغل على الويب، فبنستخدم alert بتاع المتصفح)
export function notify(msg) {
  if (isWeb) window.alert(msg);
  else Alert.alert(msg);
}

export function confirmDelete(t, onYes) {
  if (isWeb) {
    if (window.confirm(t('deleteQ') + '\n' + t('deleteMsg'))) onYes();
    return;
  }
  Alert.alert(t('deleteQ'), t('deleteMsg'), [
    { text: t('no'), style: 'cancel' },
    { text: t('yesDelete'), style: 'destructive', onPress: onYes },
  ]);
}

// ===== نص =====
export function T({ style, w = 'regular', center, ...p }) {
  const { c, ta, rtl } = useApp();
  return (
    <Text
      {...p}
      style={[
        { fontFamily: F[w], color: c.ink, textAlign: center ? 'center' : ta, writingDirection: rtl ? 'rtl' : 'ltr' },
        style,
      ]}
    />
  );
}

// ===== صف بيتقلب مع اللغة =====
export function Row({ style, children, gap = 0, wrap, between, center = true }) {
  const { row } = useApp();
  return (
    <View
      style={[
        {
          flexDirection: row,
          alignItems: center ? 'center' : 'flex-start',
          gap,
          flexWrap: wrap ? 'wrap' : 'nowrap',
          justifyContent: between ? 'space-between' : 'flex-start',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ===== زرار بيتنطط ويلف شوية مع كل ضغطة =====
export function Bouncy({ onPress, onLongPress, style, outer, children, haptic = 'light', disabled }) {
  const s = useRef(new Animated.Value(1)).current;
  const r = useRef(new Animated.Value(0)).current;
  return (
    <Pressable
      style={outer}
      disabled={disabled}
      delayLongPress={350}
      onLongPress={onLongPress ? () => { tap('medium'); onLongPress(); } : undefined}
      onPressIn={() => Animated.spring(s, { toValue: 0.92, useNativeDriver: true, speed: 40, bounciness: 0 }).start()}
      onPressOut={() =>
        Animated.parallel([
          Animated.spring(s, { toValue: 1, useNativeDriver: true, friction: 3, tension: 160 }),
          Animated.sequence([
            Animated.timing(r, { toValue: 1, duration: 80, useNativeDriver: true }),
            Animated.timing(r, { toValue: -1, duration: 80, useNativeDriver: true }),
            Animated.timing(r, { toValue: 0, duration: 80, useNativeDriver: true }),
          ]),
        ]).start()
      }
      onPress={() => {
        if (haptic) tap(haptic);
        onPress && onPress();
      }}
    >
      <Animated.View
        style={[
          style,
          { transform: [{ scale: s }, { rotate: r.interpolate({ inputRange: [-1, 1], outputRange: ['-2.5deg', '2.5deg'] }) }] },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

// ===== زرار متدرج لونه بيتغير مع كل ضغطة =====
export function GradButton({ label, onPress, small, style, outer }) {
  const [k, setK] = useState(0);
  return (
    <Bouncy
      haptic="medium"
      outer={outer}
      style={style}
      onPress={() => {
        setK((x) => x + 1);
        onPress && onPress();
      }}
    >
      <LinearGradient
        colors={[POP[k % POP.length], POP[(k + 1) % POP.length]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradBtn, small && { paddingVertical: 9, paddingHorizontal: 14 }, shadow]}
      >
        <T w="bold" center style={{ color: '#fff', fontSize: small ? 14 : 16 }}>
          {label}
        </T>
      </LinearGradient>
    </Bouncy>
  );
}

// ===== دخول ناعم =====
export function FadeIn({ delay = 0, children, style, from = 22 }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 480, delay: Math.min(delay, 600), easing: Easing.out(Easing.back(1.3)), useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: a,
          transform: [
            { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) },
            { scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// ===== كارت =====
export function Card({ children, style, colors }) {
  const { c } = useApp();
  if (colors) {
    return (
      <LinearGradient colors={colors} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={[styles.card, shadow, style]}>
        {children}
      </LinearGradient>
    );
  }
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderWidth: 1, borderColor: c.cardBorder }, shadow, style]}>
      {children}
    </View>
  );
}

// ===== عنوان قسم صغير =====
export function SectionTitle({ emoji, title, right }) {
  return (
    <Row between style={{ marginBottom: 10 }}>
      <Row gap={8}>
        {emoji ? <Text style={{ fontSize: 20 }}>{emoji}</Text> : null}
        <T w="bold" style={{ fontSize: 17 }}>{title}</T>
      </Row>
      {right}
    </Row>
  );
}

// ===== عنوان الصفحة =====
export function Header({ emoji, title, sub }) {
  const wob = useRef(new Animated.Value(0)).current;
  const { c } = useApp();
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(wob, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(wob, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <FadeIn style={{ marginBottom: 16 }}>
      <Row gap={10}>
        <Animated.Text
          style={{
            fontSize: 32,
            transform: [
              { rotate: wob.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '8deg'] }) },
              { translateY: wob.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) },
            ],
          }}
        >
          {emoji}
        </Animated.Text>
        <T w="black" style={{ fontSize: 28, flex: 1 }}>{title}</T>
      </Row>
      {sub ? <T style={{ color: c.inkSoft, marginTop: 4, fontSize: 14 }}>{sub}</T> : null}
    </FadeIn>
  );
}

// ===== تبويبات فرعية (سيجمنت) =====
export function Segments({ options, value, onChange }) {
  const { c, row } = useApp();
  return (
    <View style={[styles.segWrap, { backgroundColor: c.card, flexDirection: row, borderColor: c.cardBorder }]}>
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <Bouncy key={o.value} outer={{ flex: 1 }} onPress={() => onChange(o.value)}>
            {on ? (
              <LinearGradient colors={[POP[i % POP.length], POP[(i + 1) % POP.length]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.seg}>
                <T w="bold" center style={{ color: '#fff', fontSize: 14 }}>{o.label}</T>
              </LinearGradient>
            ) : (
              <View style={styles.seg}>
                <T w="medium" center style={{ color: c.inkSoft, fontSize: 14 }}>{o.label}</T>
              </View>
            )}
          </Bouncy>
        );
      })}
    </View>
  );
}

// ===== شيبس =====
export function Chips({ options, value, onChange, multi, style }) {
  const { c } = useApp();
  const isOn = (v) => (multi ? (value || []).includes(v) : value === v);
  const press = (v) => {
    if (!multi) return onChange(v);
    const cur = value || [];
    onChange(cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
  };
  return (
    <Row wrap gap={8} style={[{ marginBottom: 12 }, style]}>
      {options.map((o, i) => {
        const on = isOn(o.value);
        return (
          <Bouncy key={o.value} onPress={() => press(o.value)}>
            {on ? (
              <LinearGradient colors={[POP[i % POP.length], POP[(i + 1) % POP.length]]} style={styles.chip}>
                <T w="bold" style={{ color: '#fff', fontSize: 13 }}>{o.emoji ? o.emoji + ' ' : ''}{o.label}</T>
              </LinearGradient>
            ) : (
              <View style={[styles.chip, { backgroundColor: c.card, borderWidth: 1, borderColor: c.line }]}>
                <T w="medium" style={{ color: c.inkSoft, fontSize: 13 }}>{o.emoji ? o.emoji + ' ' : ''}{o.label}</T>
              </View>
            )}
          </Bouncy>
        );
      })}
    </Row>
  );
}

// ===== خانة كتابة =====
export function Input({ style, multiline, ...p }) {
  const { c, ta, rtl } = useApp();
  const [focus, setFocus] = useState(false);
  return (
    <TextInput
      placeholderTextColor={c.dark ? '#9C7A8C' : '#C49AAA'}
      multiline={multiline}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      {...p}
      style={[
        styles.input,
        {
          color: c.ink,
          textAlign: ta,
          writingDirection: rtl ? 'rtl' : 'ltr',
          backgroundColor: focus ? c.inputFocus : c.input,
          borderColor: focus ? c.orange : c.line,
        },
        multiline && { minHeight: 130, textAlignVertical: 'top' },
        style,
      ]}
    />
  );
}

// ===== شريط تقدم متدرج =====
export function Progress({ value, height = 12, colors }) {
  const { c, rtl } = useApp();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(a, { toValue: Math.max(0, Math.min(100, value)), useNativeDriver: false, friction: 6 }).start();
  }, [value]);
  return (
    <View style={{ height, borderRadius: 99, backgroundColor: c.track, overflow: 'hidden' }}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          [rtl ? 'right' : 'left']: 0,
          width: a.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
          borderRadius: 99,
          overflow: 'hidden',
        }}
      >
        <LinearGradient colors={colors || [c.pink, c.orange]} start={{ x: rtl ? 1 : 0, y: 0 }} end={{ x: rtl ? 0 : 1, y: 0 }} style={{ flex: 1 }} />
      </Animated.View>
    </View>
  );
}

// ===== حالة فاضية =====
export function Empty({ emoji, text }) {
  const { c } = useApp();
  const b = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(b, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(b, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={{ alignItems: 'center', paddingVertical: 34 }}>
      <Animated.Text style={{ fontSize: 52, transform: [{ translateY: b.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }] }}>
        {emoji}
      </Animated.Text>
      <T center style={{ color: c.inkSoft, marginTop: 10 }}>{text}</T>
    </View>
  );
}

// ===== شيت بيطلع من تحت =====
export function Sheet({ visible, onClose, title, children, footer }) {
  const { c } = useApp();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={{ flex: 1, backgroundColor: c.backdrop }} onPress={onClose} />
        <LinearGradient colors={c.sheet} style={styles.sheet}>
          <View style={[styles.grabber, { backgroundColor: c.pink }]} />
          <Row between style={{ marginBottom: 12 }}>
            <T w="black" style={{ fontSize: 21, flex: 1 }}>{title}</T>
            <Bouncy onPress={onClose} style={[styles.closeBtn, { backgroundColor: c.card }]}>
              <Text style={{ color: c.pinkDeep, fontSize: 16, fontWeight: '700' }}>✕</Text>
            </Bouncy>
          </Row>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {footer}
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ===== زرار + العايم =====
export function Fab({ onPress, bottom }) {
  const { rtl } = useApp();
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(p, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(p, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={[styles.fabWrap, { bottom, [rtl ? 'left' : 'right']: 22 }]} pointerEvents="box-none">
      <Animated.View
        pointerEvents="none"
        style={[
          styles.fab,
          {
            position: 'absolute',
            backgroundColor: '#FF8FAB',
            opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
            transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }],
          },
        ]}
      />
      <Bouncy onPress={onPress} haptic="medium">
        <LinearGradient colors={['#FF8FAB', '#FF9F45']} style={[styles.fab, shadow]}>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '600', marginTop: -2 }}>+</Text>
        </LinearGradient>
      </Bouncy>
    </View>
  );
}

// ===== عداد + و - =====
export function Stepper({ value, onChange, min = 0, max = 9999, step = 1, label }) {
  const { c, n } = useApp();
  return (
    <Row between style={{ paddingVertical: 6 }}>
      <T w="medium" style={{ flex: 1 }}>{label}</T>
      <Row gap={10}>
        <Bouncy onPress={() => onChange(Math.max(min, value - step))} style={[styles.stepBtn, { backgroundColor: c.track }]}>
          <Text style={{ fontSize: 18, color: c.pinkDeep, fontWeight: '700' }}>−</Text>
        </Bouncy>
        <T w="black" center style={{ minWidth: 44, fontSize: 18 }}>{n(value)}</T>
        <Bouncy onPress={() => onChange(Math.min(max, value + step))} style={[styles.stepBtn, { backgroundColor: c.track }]}>
          <Text style={{ fontSize: 18, color: c.pinkDeep, fontWeight: '700' }}>+</Text>
        </Bouncy>
      </Row>
    </Row>
  );
}

// ===== اختيار تاريخ بسيط (يوم / شهر / سنة) =====
export function DateField({ value, onChange }) {
  const { t, lang, n, c } = useApp();
  const d = new Date(value);
  const setPart = (y, m, day) => {
    const maxDay = new Date(y, m + 1, 0).getDate();
    onChange(new Date(y, m, Math.min(day, maxDay)).getTime());
  };
  const Part = ({ label, text, onMinus, onPlus }) => (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <T center style={{ fontSize: 12, color: c.inkSoft, marginBottom: 4 }}>{label}</T>
      <Bouncy onPress={onPlus} style={[styles.dateBtn, { backgroundColor: c.track }]}><Text style={{ color: c.pinkDeep }}>▲</Text></Bouncy>
      <T w="bold" center style={{ marginVertical: 6, fontSize: 15 }}>{text}</T>
      <Bouncy onPress={onMinus} style={[styles.dateBtn, { backgroundColor: c.track }]}><Text style={{ color: c.pinkDeep }}>▼</Text></Bouncy>
    </View>
  );
  const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
  return (
    <Row gap={8} style={{ marginVertical: 8 }}>
      <Part label={t('day')} text={n(day)} onPlus={() => setPart(y, m, day + 1 > new Date(y, m + 1, 0).getDate() ? 1 : day + 1)} onMinus={() => setPart(y, m, day - 1 < 1 ? new Date(y, m + 1, 0).getDate() : day - 1)} />
      <Part label={t('month')} text={NAMES[lang].g[m]} onPlus={() => setPart(y, (m + 1) % 12, day)} onMinus={() => setPart(y, (m + 11) % 12, day)} />
      <Part label={t('year')} text={n(y)} onPlus={() => setPart(y + 1, m, day)} onMinus={() => setPart(y - 1, m, day)} />
    </Row>
  );
}

// ===== مفتاح تشغيل =====
export function Toggle({ value, onChange, label }) {
  const { c, rtl } = useApp();
  const a = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(a, { toValue: value ? 1 : 0, friction: 5, useNativeDriver: true }).start();
  }, [value]);
  return (
    <Bouncy onPress={() => onChange(!value)}>
      <Row between style={{ paddingVertical: 8 }}>
        <T w="medium" style={{ flex: 1 }}>{label}</T>
        <View style={[styles.toggle, { backgroundColor: value ? c.orange : c.track }]}>
          <Animated.View
            style={[
              styles.knob,
              { transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: rtl ? [20, 0] : [0, 20] }) }] },
            ]}
          />
        </View>
      </Row>
    </Bouncy>
  );
}

export const styles = StyleSheet.create({
  card: { borderRadius: 26, padding: 16, marginBottom: 14 },
  gradBtn: { paddingVertical: 13, paddingHorizontal: 20, borderRadius: 20, alignItems: 'center' },
  chip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 99 },
  segWrap: { borderRadius: 22, padding: 4, marginBottom: 16, borderWidth: 1 },
  seg: { paddingVertical: 10, borderRadius: 18, alignItems: 'center' },
  input: { fontFamily: F.medium, fontSize: 16, borderRadius: 18, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 12 },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20, paddingBottom: 34, maxHeight: '90%' },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, marginBottom: 12, opacity: 0.5 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  fabWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  fab: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  stepBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dateBtn: { width: 44, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toggle: { width: 50, height: 30, borderRadius: 15, padding: 3 },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
});
