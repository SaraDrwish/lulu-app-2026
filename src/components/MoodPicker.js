import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { Bouncy, Chips, FadeIn, Input, Row, Segments, T } from './ui';
import { useApp } from '../AppContext';
import { FACTORS, FEELINGS, MOODS } from '../services/mood';

function MoodFace({ m, on, onPress }) {
  const a = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(a, { toValue: on ? 1 : 0, friction: 3, tension: 150, useNativeDriver: true }).start();
  }, [on]);
  const { t, c } = useApp();
  return (
    <Bouncy outer={{ flex: 1 }} onPress={onPress} haptic="medium" style={{ alignItems: 'center' }}>
      <Animated.View
        style={{
          width: 54,
          height: 54,
          borderRadius: 27,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: on ? m.color : c.track,
          transform: [
            { scale: a.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) },
            { rotate: a.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '-12deg', '0deg'] }) },
          ],
        }}
      >
        <Text style={{ fontSize: 30 }}>{m.emoji}</Text>
      </Animated.View>
      <T center w={on ? 'bold' : 'regular'} numberOfLines={1} style={{ fontSize: 11, marginTop: 6, color: on ? c.ink : c.inkSoft }}>
        {t(m.key)}
      </T>
    </Bouncy>
  );
}

export default function MoodPicker({ dKey, compact }) {
  const { t, days, updateDay, row } = useApp();
  const day = days[dKey] || {};
  const [open, setOpen] = useState(!compact);

  return (
    <View>
      <View style={{ flexDirection: row, marginBottom: 6 }}>
        {MOODS.map((m) => (
          <MoodFace
            key={m.v}
            m={m}
            on={day.mood === m.v}
            onPress={() => {
              updateDay(dKey, { mood: day.mood === m.v ? undefined : m.v });
              setOpen(true);
            }}
          />
        ))}
      </View>

      {open && day.mood ? (
        <FadeIn from={10}>
          <T w="bold" style={{ marginTop: 12, marginBottom: 8 }}>{t('feelings')}</T>
          <Chips
            multi
            value={day.feelings}
            onChange={(feelings) => updateDay(dKey, { feelings })}
            options={FEELINGS.map((f) => ({ value: f.k, label: t(f.k), emoji: f.e }))}
          />
          <T w="bold" style={{ marginBottom: 8 }}>{t('factors')}</T>
          <Chips
            multi
            value={day.factors}
            onChange={(factors) => updateDay(dKey, { factors })}
            options={FACTORS.map((f) => ({ value: f.k, label: t(f.k), emoji: f.e }))}
          />
          <Row gap={10} style={{ marginBottom: 6 }}>
            <T w="bold">{t('energy')} ⚡</T>
          </Row>
          <Segments
            value={day.energy || 0}
            onChange={(energy) => updateDay(dKey, { energy })}
            options={[
              { value: 1, label: '🔋 ' + t('eLow') },
              { value: 2, label: '🔋🔋 ' + t('eMid') },
              { value: 3, label: '⚡ ' + t('eHigh') },
            ]}
          />
          <Input
            value={day.note || ''}
            onChangeText={(note) => updateDay(dKey, { note })}
            placeholder={t('moodNote')}
            multiline
            style={{ minHeight: 70 }}
          />
        </FadeIn>
      ) : null}
    </View>
  );
}
