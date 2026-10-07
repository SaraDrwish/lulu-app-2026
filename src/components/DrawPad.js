// لوحة الرسم: صوابعك = الفرشة 🎨
import React, { useMemo, useRef, useState } from 'react';
import { Modal, PanResponder, Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bouncy, GradButton, Row, T } from './ui';
import { useApp } from '../AppContext';

export const INKS = ['#4A2C3A', '#F26B8A', '#FF8FAB', '#FF9F45', '#FFB65C', '#FDE68A', '#86EFAC', '#7DD3FC', '#C4B5FD', '#FFFFFF'];
const SIZES = [3, 6, 12, 22];
export const PAPERS = ['#FFFDFB', '#FFF1F4', '#FFF4E8', '#2B1830'];

const toD = (pts) => {
  if (!pts.length) return '';
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
  if (pts.length === 1) d += ` L ${(pts[0][0] + 0.1).toFixed(1)} ${pts[0][1].toFixed(1)}`;
  return d;
};

// عرض رسمة محفوظة بحجم صغير (المسارات محفوظة بإحداثيات من ٠ لـ ١٠٠٠)
export function DrawingThumb({ drawing, size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1000 1000">
      <Rect x="0" y="0" width="1000" height="1000" fill={drawing.paper || PAPERS[0]} />
      {drawing.paths.map((p, i) => (
        <Path key={i} d={p.d} stroke={p.color} strokeWidth={p.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  );
}

export default function DrawPad({ visible, initial, onClose, onSave }) {
  const { t, c } = useApp();
  const insets = useSafeAreaInsets();
  const [paths, setPaths] = useState(initial?.paths || []);
  const [paper, setPaper] = useState(initial?.paper || PAPERS[0]);
  const [color, setColor] = useState(INKS[1]);
  const [size, setSize] = useState(SIZES[1]);
  const [current, setCurrent] = useState([]);
  const [box, setBox] = useState(1);
  const pts = useRef([]);
  const canvasRef = useRef(null);
  const origin = useRef({ x: 0, y: 0 });
  const conf = useRef({ color, size, box });
  conf.current = { color, size, box };

  // مكان اللوحة على الشاشة: بنحسب منه مكان صباعك جوه اللوحة (بيشتغل صح على الموبايل والويب)
  const measure = () =>
    canvasRef.current?.measureInWindow((x, y) => {
      origin.current = { x, y };
    });
  const point = (e) => {
    const k = 1000 / conf.current.box;
    return [(e.nativeEvent.pageX - origin.current.x) * k, (e.nativeEvent.pageY - origin.current.y) * k];
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          measure();
          pts.current = [point(e)];
          setCurrent(pts.current);
        },
        onPanResponderMove: (e) => {
          pts.current = [...pts.current, point(e)];
          setCurrent(pts.current);
        },
        onPanResponderRelease: () => {
          const k = 1000 / conf.current.box;
          const stroke = { d: toD(pts.current), color: conf.current.color, width: conf.current.size * k };
          setPaths((p) => [...p, stroke]);
          pts.current = [];
          setCurrent([]);
        },
      }),
    []
  );

  const k = 1000 / box;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <LinearGradient colors={c.bgGrad} style={{ flex: 1, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 10, paddingHorizontal: 16 }}>
        <Row between style={{ marginBottom: 10 }}>
          <T w="black" style={{ fontSize: 22 }}>🎨 {t('draw')}</T>
          <Row gap={8}>
            <Bouncy onPress={() => setPaths((p) => p.slice(0, -1))} style={[styles.tool, { backgroundColor: c.card }]}>
              <Text style={{ fontSize: 18 }}>↩️</Text>
            </Bouncy>
            <Bouncy onPress={() => setPaths([])} style={[styles.tool, { backgroundColor: c.card }]}>
              <Text style={{ fontSize: 18 }}>🧽</Text>
            </Bouncy>
            <Bouncy onPress={onClose} style={[styles.tool, { backgroundColor: c.card }]}>
              <Text style={{ fontSize: 16, color: c.pinkDeep, fontWeight: '700' }}>✕</Text>
            </Bouncy>
          </Row>
        </Row>

        <View
          ref={canvasRef}
          style={[styles.canvas, { backgroundColor: paper }, Platform.OS === 'web' && { touchAction: 'none', cursor: 'crosshair' }]}
          onLayout={(e) => {
            setBox(e.nativeEvent.layout.width);
            setTimeout(measure, 350); // بعد ما أنيميشن فتح اللوحة يخلص
          }}
          {...responder.panHandlers}
        >
          <Svg width="100%" height="100%" viewBox="0 0 1000 1000" pointerEvents="none">
            {paths.map((p, i) => (
              <Path key={i} d={p.d} stroke={p.color} strokeWidth={p.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {current.length > 0 && (
              <Path d={toD(current)} stroke={color} strokeWidth={size * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </Svg>
        </View>

        <Row wrap gap={10} style={{ marginTop: 14, justifyContent: 'center' }}>
          {INKS.map((ink) => (
            <Bouncy key={ink} onPress={() => setColor(ink)}>
              <View
                style={[
                  styles.ink,
                  { backgroundColor: ink, borderColor: color === ink ? c.orange : 'rgba(0,0,0,0.08)', borderWidth: color === ink ? 3 : 1 },
                  color === ink && { transform: [{ scale: 1.15 }] },
                ]}
              />
            </Bouncy>
          ))}
        </Row>
        <Row gap={14} style={{ marginTop: 12, justifyContent: 'center' }}>
          {SIZES.map((s) => (
            <Bouncy key={s} onPress={() => setSize(s)} style={[styles.sizeBtn, { backgroundColor: size === s ? c.pink : c.card }]}>
              <View style={{ width: s + 2, height: s + 2, borderRadius: 99, backgroundColor: size === s ? '#fff' : color }} />
            </Bouncy>
          ))}
          {PAPERS.map((p) => (
            <Bouncy key={p} onPress={() => setPaper(p)}>
              <View style={[styles.paper, { backgroundColor: p, borderColor: paper === p ? c.orange : c.line }]} />
            </Bouncy>
          ))}
        </Row>
        <GradButton
          label={t('save') + ' 💾'}
          style={{ marginTop: 16 }}
          onPress={() => {
            if (paths.length) onSave({ paths, paper });
            onClose();
          }}
        />
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tool: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  canvas: { width: '100%', aspectRatio: 1, borderRadius: 26, overflow: 'hidden' },
  ink: { width: 30, height: 30, borderRadius: 15 },
  sizeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  paper: { width: 30, height: 30, borderRadius: 8, borderWidth: 2 },
});
