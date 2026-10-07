// رسم بياني خطي بسيط وناعم (للوزن والتحويش)
import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Path, Stop, Line } from 'react-native-svg';
import { useApp } from '../AppContext';
import { T } from './ui';

export function LineChart({ values, height = 160, goal }) {
  const { c, rtl } = useApp();
  const [w, setW] = useState(0);
  if (values.length === 0) return null;
  const pad = 14;
  const all = goal ? [...values, goal] : values;
  const min = Math.min(...all) - 1;
  const max = Math.max(...all) + 1;
  const xs = (i) => {
    const x = values.length === 1 ? w / 2 : pad + (i * (w - pad * 2)) / (values.length - 1);
    return rtl ? w - x : x; // بالعربي القديم يمين والجديد شمال (مع اتجاه القراءة)
  };
  const ys = (v) => pad + ((max - v) * (height - pad * 2)) / (max - min || 1);
  const pts = values.map((v, i) => [xs(i), ys(v)]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    d += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
  }
  const area = `${d} L ${pts[pts.length - 1][0]} ${height} L ${pts[0][0]} ${height} Z`;

  return (
    <View style={{ height }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <Svg width={w} height={height}>
          <Defs>
            <SvgGrad id="line" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={c.pink} />
              <Stop offset="1" stopColor={c.orange} />
            </SvgGrad>
            <SvgGrad id="area" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={c.pink} stopOpacity="0.35" />
              <Stop offset="1" stopColor={c.pink} stopOpacity="0" />
            </SvgGrad>
          </Defs>
          {goal ? (
            <Line x1={0} x2={w} y1={ys(goal)} y2={ys(goal)} stroke={c.orange} strokeDasharray="6 6" strokeWidth={1.5} opacity={0.7} />
          ) : null}
          {pts.length > 1 && <Path d={area} fill="url(#area)" />}
          {pts.length > 1 && <Path d={d} stroke="url(#line)" strokeWidth={3.5} fill="none" strokeLinecap="round" />}
          {pts.map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 6 : 4} fill={i === pts.length - 1 ? c.orange : '#fff'} stroke={c.pink} strokeWidth={2} />
          ))}
        </Svg>
      )}
    </View>
  );
}

// شريط أفقي لتوزيع (مصاريف حسب التصنيف / أيام المود)
export function BarList({ items, format }) {
  const { c, row, rtl } = useApp();
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <View style={{ gap: 10 }}>
      {items.map((it) => (
        <View key={it.key}>
          <View style={{ flexDirection: row, justifyContent: 'space-between' }}>
            <T w="medium" style={{ fontSize: 13 }}>{it.label}</T>
            <T w="bold" style={{ fontSize: 13 }}>{format ? format(it.value) : it.value}</T>
          </View>
          <View style={{ height: 10, borderRadius: 99, backgroundColor: c.track, marginTop: 4, overflow: 'hidden', alignItems: rtl ? 'flex-end' : 'flex-start' }}>
            <View style={{ width: `${(it.value / max) * 100}%`, height: '100%', borderRadius: 99, backgroundColor: it.color || c.pink }} />
          </View>
        </View>
      ))}
    </View>
  );
}
