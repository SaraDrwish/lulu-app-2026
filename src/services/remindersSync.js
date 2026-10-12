// مزامنة التذكيرات مع GitHub
// التذكيرات متخزنة في ملف push/reminders.json جوه الـ repo، وGitHub Actions بيقراه كل ١٠ دقايق.
// لولو بتعدّل الملف ده بـ GitHub API باستخدام token إنتي بتديهولها مرة واحدة.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const REPO = { owner: 'SaraDrwish', repo: 'lulu-app-2026', path: 'push/reminders.json', branch: 'main' };

// الـ token متخزن لوحده (برّه النسخة الاحتياطية) عشان ميتبعتش مع الباك أب بالغلط
const TOKEN_KEY = 'lulu-secret:github-token';
export const getToken = () => AsyncStorage.getItem(TOKEN_KEY).catch(() => null);
export const setToken = (v) => (v ? AsyncStorage.setItem(TOKEN_KEY, v.trim()) : AsyncStorage.removeItem(TOKEN_KEY));

const api = () => `https://api.github.com/repos/${REPO.owner}/${REPO.repo}/contents/${REPO.path}`;

// GitHub بيرجّع الملف base64، ولازم نفكّه بطريقة بتدعم العربي والإيموجي
const decode = (b64) => decodeURIComponent(escape(atob(b64.replace(/\n/g, ''))));
const encode = (str) => btoa(unescape(encodeURIComponent(str)));

function headers(token) {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fail(res) {
  let msg = '';
  try {
    msg = (await res.json()).message;
  } catch {}
  const e = new Error(`${res.status} ${msg}`);
  e.status = res.status;
  return e;
}

export async function loadReminders(token) {
  const res = await fetch(`${api()}?ref=${REPO.branch}&t=${Date.now()}`, { headers: headers(token) });
  if (!res.ok) throw await fail(res);
  const j = await res.json();
  return { data: JSON.parse(decode(j.content)), sha: j.sha };
}

export async function saveReminders(token, data, sha, message = 'Update reminders from Lulu 🔔') {
  const body = JSON.stringify({
    message,
    content: encode(JSON.stringify(data, null, 2) + '\n'),
    sha,
    branch: REPO.branch,
  });
  let res = await fetch(api(), { method: 'PUT', headers: headers(token), body });
  if (res.status === 409) {
    // الملف اتغيّر من مكان تاني: نجيب أحدث نسخة ونحاول تاني مرة واحدة
    const fresh = await loadReminders(token);
    res = await fetch(api(), { method: 'PUT', headers: headers(token), body: body.replace(`"sha":"${sha}"`, `"sha":"${fresh.sha}"`) });
  }
  if (!res.ok) throw await fail(res);
  const j = await res.json();
  return j.content.sha;
}

export const deviceTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Riyadh';
  } catch {
    return 'Asia/Riyadh';
  }
};
