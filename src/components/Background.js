import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { POP } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

// خلفية فيها فقاعات ملونة بتعوم، وبتغير لونها مع كل ضغطة
const BLOBS = [
  { size: 260, x: -80, y: -60, dur: 9000 },
  { size: 200, x: W - 120, y: H * 0.25, dur: 11000 },
  { size: 300, x: -60, y: H * 0.6, dur: 13000 },
  { size: 160, x: W - 90, y: H - 220, dur: 8000 },
];

const cyclic = [...POP, POP[0]];
const inputRange = cyclic.map((_, i) => i);

function Blob({ b, i, colorStep, opacity }) {
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: b.dur, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(float, { toValue: 0, duration: b.dur, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const color = colorStep.interpolate({
    inputRange,
    outputRange: cyclic.map((_, k) => cyclic[(k + i) % POP.length]),
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: b.x,
        top: b.y,
        width: b.size,
        height: b.size,
        borderRadius: b.size / 2,
        backgroundColor: color,
        opacity,
        transform: [
          { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, 40] }) },
          { translateX: float.interpolate({ inputRange: [0, 1], outputRange: [0, i % 2 ? -30 : 30] }) },
          { scale: float.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) },
        ],
      }}
    />
  );
}

function Sparkle({ x, y, onDone }) {
  const t = useRef(new Animated.Value(0)).current;
  const parts = useRef(
    Array.from({ length: 8 }, (_, k) => ({
      angle: (Math.PI * 2 * k) / 8 + Math.random() * 0.4,
      dist: 30 + Math.random() * 30,
      color: POP[Math.floor(Math.random() * POP.length)],
      size: 6 + Math.random() * 6,
      star: Math.random() > 0.5,
    }))
  ).current;

  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(onDone);
  }, []);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: x, top: y }}>
      {parts.map((p, k) => (
        <Animated.Text
          key={k}
          style={{
            position: 'absolute',
            fontSize: p.size + 4,
            color: p.color,
            opacity: t.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0.8, 0] }),
            transform: [
              { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(p.angle) * p.dist] }) },
              { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(p.angle) * p.dist] }) },
              { scale: t.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.2, 1.2, 0.6] }) },
              { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
            ],
          }}
        >
          {p.star ? '✦' : '●'}
        </Animated.Text>
      ))}
    </View>
  );
}

export const Background = forwardRef(function Background({ gradient, blobOpacity = 0.28 }, ref) {
  const colorStep = useRef(new Animated.Value(0)).current;
  const step = useRef(0);

  useImperativeHandle(ref, () => ({
    tap() {
      step.current = step.current + 1;
      const target = step.current % POP.length;
      if (target === 0) {
        Animated.timing(colorStep, { toValue: POP.length, duration: 500, useNativeDriver: false }).start(() =>
          colorStep.setValue(0)
        );
      } else {
        Animated.timing(colorStep, { toValue: target, duration: 500, useNativeDriver: false }).start();
      }
    },
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      {BLOBS.map((b, i) => (
        <Blob key={i} b={b} i={i} colorStep={colorStep} opacity={blobOpacity} />
      ))}
    </View>
  );
});

// طبقة النجوم اللي بتطلع مكان كل ضغطة (فوق كل حاجة)
export const Sparkles = forwardRef(function Sparkles(_, ref) {
  const [sparks, setSparks] = useState([]);
  useImperativeHandle(ref, () => ({
    burst(x, y) {
      const id = Math.random().toString(36).slice(2);
      setSparks((s) => [...s.slice(-6), { id, x, y }]);
    },
  }));
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 999, elevation: 999 }]}>
      {sparks.map((s) => (
        <Sparkle key={s.id} x={s.x} y={s.y} onDone={() => setSparks((all) => all.filter((a) => a.id !== s.id))} />
      ))}
    </View>
  );
});
