// الطقس + مواعيد الصلاة + الهجري الدقيق
// خدمات مجانية من غير مفاتيح: Open-Meteo للطقس و AlAdhan للصلاة (تقويم أم القرى)
import * as Location from 'expo-location';
import { getCache, setCache } from '../storage';
import { dayKey } from './dates';

// لو رفضتي إذن الموقع، بنستخدم مكة كمكان افتراضي
const FALLBACK = { lat: 21.4225, lon: 39.8262, city: { ar: 'مكة المكرمة', en: 'Makkah' } };

// اسم المدينة من الإحداثيات — على الموبايل من النظام، وعلى الويب من خدمة مجانية
async function cityName(lat, lon) {
  try {
    const [g] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    const name = g?.city || g?.subregion || g?.region;
    if (name) return { ar: name, en: name };
  } catch {}
  try {
    const url = (l) => `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${l}`;
    const [a, e] = await Promise.all([fetch(url('ar')).then((r) => r.json()), fetch(url('en')).then((r) => r.json())]);
    const ar = a.city || a.locality || a.principalSubdivision;
    const en = e.city || e.locality || e.principalSubdivision;
    if (ar || en) return { ar: ar || en, en: en || ar };
  } catch {}
  return null;
}

export async function getPlace() {
  const cached = (await getCache('place'))?.data;
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return cached || FALLBACK;
    let pos = null;
    try {
      pos = await Location.getLastKnownPositionAsync();
    } catch {}
    if (!pos) pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    // لو لسه في نفس المكان تقريباً، بنستخدم اسم المدينة المحفوظ
    const same = cached && Math.abs(cached.lat - lat) < 0.05 && Math.abs(cached.lon - lon) < 0.05 && cached.city;
    const city = same ? cached.city : await cityName(lat, lon);
    const place = { lat, lon, city };
    setCache('place', place);
    return place;
  } catch {
    return cached || FALLBACK;
  }
}

const WEATHER = {
  0: [['صافي', 'Clear'], '☀️'],
  1: [['صافي غالباً', 'Mostly clear'], '🌤️'],
  2: [['غيوم خفيفة', 'Partly cloudy'], '⛅'],
  3: [['غائم', 'Cloudy'], '☁️'],
  45: [['ضباب', 'Fog'], '🌫️'],
  48: [['ضباب', 'Fog'], '🌫️'],
  51: [['رذاذ', 'Drizzle'], '🌦️'],
  53: [['رذاذ', 'Drizzle'], '🌦️'],
  55: [['رذاذ', 'Drizzle'], '🌦️'],
  61: [['مطر خفيف', 'Light rain'], '🌧️'],
  63: [['مطر', 'Rain'], '🌧️'],
  65: [['مطر غزير', 'Heavy rain'], '🌧️'],
  71: [['ثلج', 'Snow'], '🌨️'],
  73: [['ثلج', 'Snow'], '🌨️'],
  75: [['ثلج', 'Snow'], '❄️'],
  80: [['زخات مطر', 'Showers'], '🌦️'],
  81: [['زخات مطر', 'Showers'], '🌧️'],
  82: [['زخات قوية', 'Heavy showers'], '⛈️'],
  95: [['عاصفة رعدية', 'Thunderstorm'], '⛈️'],
  96: [['عاصفة رعدية', 'Thunderstorm'], '⛈️'],
  99: [['عاصفة رعدية', 'Thunderstorm'], '⛈️'],
};

export async function getWeather(place) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}` +
    `&current=temperature_2m,apparent_temperature,weather_code,is_day,relative_humidity_2m,wind_speed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
  try {
    const r = await fetch(url);
    const j = await r.json();
    const code = j.current.weather_code;
    const [label, icon0] = WEATHER[code] || [['—', '—'], '🌈'];
    const icon = !j.current.is_day && code <= 1 ? '🌙' : icon0;
    const data = {
      temp: Math.round(j.current.temperature_2m),
      humidity: Math.round(j.current.relative_humidity_2m),
      wind: Math.round(j.current.wind_speed_10m),
      max: Math.round(j.daily.temperature_2m_max[0]),
      min: Math.round(j.daily.temperature_2m_min[0]),
      label: { ar: label[0], en: label[1] },
      icon,
    };
    setCache('weather', data);
    return data;
  } catch {
    const c = await getCache('weather');
    return c ? { ...c.data, offline: true } : null;
  }
}

export const PRAYERS = [
  { key: 'Fajr', ar: 'الفجر', en: 'Fajr', emoji: '🌅' },
  { key: 'Sunrise', ar: 'الشروق', en: 'Sunrise', emoji: '🌄' },
  { key: 'Dhuhr', ar: 'الظهر', en: 'Dhuhr', emoji: '☀️' },
  { key: 'Asr', ar: 'العصر', en: 'Asr', emoji: '🌤️' },
  { key: 'Maghrib', ar: 'المغرب', en: 'Maghrib', emoji: '🌇' },
  { key: 'Isha', ar: 'العشاء', en: 'Isha', emoji: '🌙' },
];

export async function getPrayer(place, date = new Date()) {
  const key = 'prayer-' + dayKey(date);
  const d = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  try {
    const r = await fetch(`https://api.aladhan.com/v1/timings/${d}?latitude=${place.lat}&longitude=${place.lon}&method=4`);
    const j = await r.json();
    const t = j.data.timings;
    const h = j.data.date.hijri;
    const data = {
      times: Object.fromEntries(PRAYERS.map((p) => [p.key, String(t[p.key]).slice(0, 5)])),
      hijri: { day: Number(h.day), month: Number(h.month.number), year: Number(h.year) },
    };
    setCache(key, data);
    return data;
  } catch {
    const c = await getCache(key);
    return c?.data || null;
  }
}

export function nextPrayer(times, now = new Date()) {
  if (!times) return null;
  const list = PRAYERS.filter((p) => p.key !== 'Sunrise').map((p) => {
    const [h, m] = times[p.key].split(':').map(Number);
    return { ...p, at: new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m) };
  });
  let next = list.find((p) => p.at > now);
  if (!next) next = { ...list[0], at: new Date(list[0].at.getTime() + 86400000) };
  const diff = Math.max(0, next.at - now);
  return { ...next, hours: Math.floor(diff / 3600000), minutes: Math.floor((diff % 3600000) / 60000) };
}
