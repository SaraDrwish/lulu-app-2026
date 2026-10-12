// الإشعارات (Web Push) — بتشتغل على الويب بس، ولازم التطبيق يكون متضاف للشاشة الرئيسية على الآيفون
import { Platform } from 'react-native';
import { VAPID_PUBLIC_KEY } from '../config';

// 'ok' | 'install' (لازم يتضاف للشاشة الرئيسية الأول) | 'unsupported' | 'native'
export function pushSupport() {
  if (Platform.OS !== 'web') return 'native';
  const hasApis = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  if (hasApis) return 'ok';
  const standalone = window.navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  return standalone ? 'unsupported' : 'install';
}

export const keyConfigured = () => VAPID_PUBLIC_KEY && !VAPID_PUBLIC_KEY.startsWith('PASTE_');

// المفتاح بيتكتب base64url، والمتصفح محتاجه bytes
function keyToBytes(base64) {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (ch) => ch.charCodeAt(0));
}

// بنستنى الـ service worker، بس مش أكتر من ٨ ثواني
function swReady() {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker not ready')), 8000)),
  ]);
}

export async function currentSubscription() {
  try {
    const reg = await swReady();
    const sub = await reg.pushManager.getSubscription();
    return sub ? JSON.stringify(sub) : null;
  } catch {
    return null;
  }
}

// لازم تتنادى من ضغطة زرار (الآيفون بيرفض طلب الإذن من غير ضغطة)
export async function subscribe() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('denied');
  const reg = await swReady();
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(VAPID_PUBLIC_KEY) });
  }
  return JSON.stringify(sub);
}

export async function unsubscribe() {
  const reg = await swReady();
  const sub = await reg.pushManager.getSubscription();
  if (sub) await sub.unsubscribe();
}
