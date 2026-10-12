// بيقرا التذكيرات من reminders.json، ويبعت اللي ميعاده جه — GitHub Actions بيشغّله كل ١٠ دقايق
import fs from 'node:fs';
import webpush from 'web-push';

const { VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, PUSH_SUBSCRIPTIONS, TEST } = process.env;
const STATE_FILE = '.state/last-run.json'; // آخر مرة اشتغلنا فيها (بيتحفظ بالـ cache بين التشغيلات)
const MAX_LOOKBACK = 3 * 60 * 60 * 1000; // لو GitHub وقف فترة طويلة، منبعتش تذكيرات قديمة أكتر من ٣ ساعات
const FIRST_RUN_LOOKBACK = 15 * 60 * 1000;

for (const [name, value] of Object.entries({ VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, PUSH_SUBSCRIPTIONS })) {
  if (!value) {
    console.error(`❌ ${name} مش موجود — ضيفيه في Settings ← Secrets and variables ← Actions`);
    process.exit(1);
  }
}
webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:lulu@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
const subscriptions = [].concat(JSON.parse(PUSH_SUBSCRIPTIONS));

// ===== الوقت بتوقيتك =====
// بيرجّع الفرق بين توقيتك و UTC بالمللي ثانية في لحظة معينة
function tzOffset(ts, timeZone) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .formatToParts(ts)
      .map((x) => [x.type, Number(x.value)])
  );
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ts / 1000) * 1000;
}
// "يوم كذا الساعة ١٠:٣٠ بتوقيتك" ← لحظة حقيقية (timestamp)
function localToTs(y, m, d, hh, mm, timeZone) {
  const guess = Date.UTC(y, m, d, hh, mm);
  return guess - tzOffset(guess, timeZone);
}
function localDate(ts, timeZone) {
  const shifted = new Date(ts + tzOffset(ts, timeZone));
  return { y: shifted.getUTCFullYear(), m: shifted.getUTCMonth(), d: shifted.getUTCDate() };
}

async function send(payload) {
  let ok = 0;
  for (const [i, sub] of subscriptions.entries()) {
    try {
      await webpush.sendNotification(sub, JSON.stringify(payload), { TTL: 60 * 60, urgency: 'normal' });
      ok++;
    } catch (err) {
      console.error(`❌ device ${i + 1}: ${err.statusCode || ''} ${err.body || err.message}`);
      if (err.statusCode === 404 || err.statusCode === 410) {
        console.error('   اشتراك الجهاز ده انتهى: شغّلي الإشعارات تاني من لولو وحدّثي PUSH_SUBSCRIPTIONS');
      }
    }
  }
  return ok;
}

// ===== تجربة من زرار Run workflow =====
if (TEST === 'true') {
  const ok = await send({ title: 'تجربة 🔔', body: 'لو الإشعار ده وصلك، يبقى كل حاجة شغالة 🐰✨', tag: 'test' });
  console.log(`🧪 test → ${ok}/${subscriptions.length} device(s)`);
  process.exit(ok ? 0 : 1);
}

// ===== التذكيرات اللي ميعادها جه =====
const config = JSON.parse(fs.readFileSync('reminders.json', 'utf8'));
const tz = config.timezone || 'Asia/Riyadh';
const now = Date.now();

let lastRun = now - FIRST_RUN_LOOKBACK;
try {
  lastRun = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')).lastRun;
} catch {
  console.log('ℹ️ first run (no saved state)');
}
lastRun = Math.max(lastRun, now - MAX_LOOKBACK);

// بندوّر على كل ميعاد وقع بين آخر تشغيل ودلوقتي (النهارده وامبارح عشان نص الليل)
const due = [];
for (const r of config.reminders || []) {
  if (!r.enabled) continue;
  for (const dayShift of [0, -1]) {
    const { y, m, d } = localDate(now + dayShift * 86400000, tz);
    const weekday = new Date(Date.UTC(y, m, d)).getUTCDay();
    if (!r.days.includes(weekday)) continue;
    for (const hhmm of r.times) {
      const [hh, mm] = hhmm.split(':').map(Number);
      const at = localToTs(y, m, d, hh, mm, tz);
      if (at > lastRun && at <= now) due.push({ r, at });
    }
  }
}

console.log(`🕒 ${tz} | window ${new Date(lastRun).toISOString()} → ${new Date(now).toISOString()} | due: ${due.length}`);

// لو نفس التذكير طلع أكتر من مرة (تأخير طويل)، نبعته مرة واحدة بس
const seen = new Set();
for (const { r } of due) {
  if (seen.has(r.id)) continue;
  seen.add(r.id);
  const ok = await send({ title: r.title, body: r.body || '', tag: r.id });
  console.log(`🔔 ${r.id}: "${r.title}" → ${ok}/${subscriptions.length} device(s)`);
}

fs.mkdirSync('.state', { recursive: true });
fs.writeFileSync(STATE_FILE, JSON.stringify({ lastRun: now }));
