// الحفظ الدائم على الجهاز (AsyncStorage)
// كل تغيير بيتحفظ فوراً، فلما تفتحي التطبيق تاني يوم تلاقي كل حاجة زي ما هي
import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'lulu:';

export function useStored(key, initial) {
  const [value, setValue] = useState(initial);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(PREFIX + key)
      .then((raw) => {
        if (raw != null) setValue(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, [key]);

  // بيحفظ بعد كل تغيير (بعد ما البيانات القديمة تتحمّل بس، عشان منكتبش فوقها)
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(PREFIX + key, JSON.stringify(value)).catch(() => {});
  }, [key, value]);

  const set = useCallback((v) => setValue(v), []);
  return [value, set, ready];
}

export async function getCache(key) {
  try {
    const raw = await AsyncStorage.getItem('lulu-cache:' + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setCache(key, data) {
  try {
    await AsyncStorage.setItem('lulu-cache:' + key, JSON.stringify({ at: Date.now(), data }));
  } catch {}
}

// ===== نسخة احتياطية =====
export async function exportAll() {
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
  const pairs = await AsyncStorage.multiGet(keys);
  const out = { app: 'lulu', v: 1, at: new Date().toISOString(), data: {} };
  for (const [k, v] of pairs) out.data[k.slice(PREFIX.length)] = v != null ? JSON.parse(v) : null;
  return JSON.stringify(out);
}

export async function importAll(text) {
  const obj = JSON.parse(text);
  if (!obj || obj.app !== 'lulu' || !obj.data) throw new Error('bad backup');
  const pairs = Object.entries(obj.data).map(([k, v]) => [PREFIX + k, JSON.stringify(v)]);
  await AsyncStorage.multiSet(pairs);
}
