# 🐰 لولو — Lulu

تطبيق صديقة لطيفة لليوم كله: مود، مية، ورد القرآن، أذكار، مهام، أهداف، مذكرات، ملاحظات، رسم، تقويم، مناسبات، فلوس، مفضلات، ووزن.
عربي/إنجليزي، فاتح/ليلي، وكل البيانات بتتحفظ على الموبايل نفسه.

مبني بـ **Expo (React Native)**، يعني JavaScript زي الفرونت بالظبط. نفس الكود بيشتغل **ويب** و iPhone و Android.

---

## ⭐ الطريقة المجانية: تطبيق ويب على الشاشة الرئيسية (PWA)

### أ) جرّبيه على اللابتوب الأول
```bash
cd lulu-app
npm install
npx expo install --fix     # بيظبط نسخ المكتبات مع بعض
npm run web                # بيفتح لولو في المتصفح
```
> من Chrome اضغطي F12 ← أيقونة الموبايل، عشان تشوفيه بمقاس الآيفون.

### ب) ارفعيه على GitHub (مرة واحدة بس)
1. اعملي repo جديد على GitHub اسمه **`lulu-app`** بالظبط.
   (لو اخترتي اسم تاني، غيّري `"baseUrl": "/lulu-app"` في `app.json` لنفس الاسم.)
2. ارفعي المشروع:
```bash
git init
git add .
git commit -m "Lulu web app 🌸"
git branch -M main
git remote add origin https://github.com/SaraDrwish/lulu-app.git
git push -u origin main
```
3. على GitHub: **Settings ← Pages ← Source** واختاري **GitHub Actions**.
4. افتحي تبويب **Actions** واستني العلامة الخضرا ✅ (حوالي ٣ دقايق). لو كانت أول مرة ومشتغلتش، اضغطي **Run workflow**.
5. التطبيق هيبقى على: **https://saradrwish.github.io/lulu-app/**

بعد كده، أي `git push` بيرفع النسخة الجديدة لوحده 🚀

### ج) نزّليه على الآيفون
1. افتحي الرابط من **Safari** (لازم Safari بالذات).
2. اضغطي زرار **المشاركة** ⬆️، وبعدين **"إضافة إلى الشاشة الرئيسية"**.
3. هتلاقي أيقونة الأرنوبة 🐰 على شاشتك، وبتفتح ملء الشاشة زي أي تطبيق.

على **أندرويد**: افتحيه من Chrome ← القايمة ⋮ ← **"تثبيت التطبيق"**.

### معلومات مهمة
- **بياناتك** بتتحفظ جوه التطبيق على الموبايل. لو مسحتي التطبيق من الشاشة الرئيسية أو مسحتي بيانات Safari، البيانات بتتمسح معاه. فاعملي **نسخة احتياطية** من الإعدادات كل فترة.
- بعد أول فتحة، التطبيق **بيفتح من غير نت**. الطقس والصلاة محتاجين نت عشان يتحدّثوا.
- الاهتزاز الخفيف مع الضغط مش متاح للويب على الآيفون. كل الحركات والألوان التانية شغالة.
- لو التحديث الجديد مش ظاهر، اقفلي التطبيق خالص وافتحيه تاني.

### 🛠️ ملف النشر التلقائي سطر بسطر — `.github/workflows/deploy-web.yml`
مكانه لازم يكون `.github/workflows/` بالظبط، عشان GitHub بيدوّر على الـ workflows هناك بس.

```yaml
name: Deploy Lulu web app
```
اسم الـ workflow اللي هيظهر في تبويب Actions.

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```
- `on:` معناها "امتى يشتغل".
- `push` على `branches: [main]`: كل مرة ترفعي كود على فرع main. الأقواس `[ ]` معناها list، فممكن تحطي أكتر من فرع.
- `workflow_dispatch:` بيظهر زرار **Run workflow** عشان تشغليه بإيدك. سايبينه فاضي لأنه مش محتاج إعدادات.

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```
الصلاحيات اللي الـ workflow بياخدها، وبنديله أقل حاجة محتاجها:
- `contents: read`: يقرا الكود بس، ميعدّلش فيه.
- `pages: write`: ينشر على GitHub Pages.
- `id-token: write`: يثبت لـ GitHub Pages إنه الـ workflow بتاع الـ repo ده فعلاً (OIDC)، من غير ما نحط أي باسورد.

```yaml
concurrency:
  group: pages
  cancel-in-progress: true
```
لو عملتي push مرتين ورا بعض، النشر القديم بيتلغي والجديد بس هو اللي يكمل، عشان النسخ متدخلش في بعض.

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
```
- `jobs:` المهام. عندنا اتنين: `build` و `deploy`.
- `runs-on: ubuntu-latest`: الـ job بيشتغل على جهاز Linux جديد ونضيف بيدهولك GitHub مجاناً، وبيتمسح بعد ما يخلص.

```yaml
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
```
- `steps:` الخطوات بالترتيب. كل `-` خطوة جديدة.
- `uses:` معناها "استخدم action جاهز". `actions/checkout` بينزّل الكود بتاعك على الجهاز ده، و`@v4` رقم النسخة عشان ميتغيرش فجأة.

```yaml
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
```
بيسطّب Node.js نسخة 22. `with:` هي الإعدادات اللي بنبعتها للـ action.

```yaml
      - name: Install dependencies
        run: npm install
```
`run:` بتشغّل أمر في الترمينال. الأمر ده بينزّل المكتبات اللي في `package.json`.

```yaml
      - name: Build web version
        run: npx expo export --platform web
```
بيحوّل كود React Native لموقع عادي (HTML + JS + صور) جوه فولدر `dist`. `--platform web` معناها ويب بس، من غير iOS وAndroid.

```yaml
      - name: Add 404 fallback
        run: cp dist/index.html dist/404.html
```
بينسخ الصفحة الرئيسية باسم `404.html`. لو حد فتح رابط غلط جوه الموقع، GitHub Pages هيعرض لولو بدل صفحة الخطأ.

```yaml
      - name: Upload site
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist
```
بيضغط فولدر `dist` ويرفعه كـ "artifact"، يعني ملف مؤقت الـ job التاني هياخده.

```yaml
  deploy:
    needs: build
    runs-on: ubuntu-latest
```
- `needs: build`: متبدأش غير لما `build` يخلص بنجاح. لو البناء فشل، مفيش نشر، والموقع القديم يفضل شغال.

```yaml
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
```
- `environment`: بيسجّل النشر تحت بيئة اسمها `github-pages`، وهتلاقيها في صفحة الـ repo.
- `${{ ... }}`: متغيّر بيتحسب وقت التشغيل. هنا بياخد رابط الموقع من الخطوة اللي `id` بتاعها `deployment`، ويحطه زرار في صفحة Actions.

```yaml
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
بياخد الـ artifact اللي اترفع وينشره على GitHub Pages. `id: deployment` اسم للخطوة عشان نقدر نقرا الرابط منها فوق.

### ملفات الويب التانية
| الملف | فيه إيه |
|---|---|
| `public/index.html` | الصفحة الأساسية: إعدادات الشاشة الكاملة على الآيفون والأيقونة، وبتشغّل الـ service worker |
| `public/manifest.json` | بيعرّف المتصفح إن ده "تطبيق": الاسم والأيقونات والألوان، وإنه يفتح من غير شريط المتصفح |
| `public/sw.js` | الـ service worker: بيحفظ ملفات التطبيق عشان يفتح من غير نت |
| `public/icons/` | أيقونات الشاشة الرئيسية |

---

## ١) (اختياري) شغّليه بـ Expo Go

محتاجة: **Node.js LTS** على اللابتوب + تطبيق **Expo Go** على الآيفون من الآب ستور.

```bash
cd lulu-app
npm install
npx expo install expo@latest     # بيحدّث لآخر نسخة Expo (لازم عشان Expo Go)
npx expo install --fix           # بيظبط نسخ باقي المكتبات على النسخة دي
npx expo start
```

امسحي الـ QR اللي هيظهر بكاميرا الآيفون، والتطبيق هيفتح في Expo Go 🎉
أي تعديل في الكود بيظهر على الموبايل فوراً.

> لو اللابتوب والموبايل مش على نفس الواي فاي: `npx expo start --tunnel`

---

## ٢) (لما تحبي بعدين) الآب ستور — اشتراك أبل ٩٩$ في السنة

١. اشتركي في **Apple Developer Program** من developer.apple.com (اشتراك سنوي).
٢. على اللابتوب:

```bash
npm install -g eas-cli
eas login                         # حساب expo.dev (مجاني)
eas build:configure
eas build --platform ios --profile production    # البناء بيحصل على سيرفرات Expo، مش محتاجة ماك
eas submit --platform ios                        # بيرفع النسخة على App Store Connect
```

٣. في **App Store Connect**:
   - هتلاقي النسخة في **TestFlight**، ونزّليها على موبايلك قبل النشر.
   - كمّلي بيانات المتجر:
     - الاسم والوصف وصور الشاشات
     - رابط **سياسة خصوصية**: تقدري تعمليها صفحة بسيطة على GitHub Pages، وتكتبي فيها إن البيانات بتتحفظ على الجهاز بس، والموقع بيُستخدم للطقس والصلاة
   - ابعتيها للمراجعة.

**أندرويد كمان؟** `eas build --platform android --profile preview` بيطلع ملف APK تنزليه مباشرة.

> قبل كل رفع جديد، `autoIncrement` في eas.json بيزوّد رقم البناء لوحده.
> عايزة تغيري الاسم أو المعرّف؟ من `app.json` → `name` و `ios.bundleIdentifier`.

---

## ٣) خريطة الملفات

| الملف | فيه إيه |
|---|---|
| `App.js` | الهيكل: الخلفية المتحركة، التبويبات، زرار +، النجوم مع كل ضغطة |
| `src/AppContext.js` | كل البيانات + الإعدادات + اللغة والوضع الليلي في مكان واحد |
| `src/storage.js` | الحفظ الدائم على الجهاز + النسخة الاحتياطية |
| `src/i18n.js` | كل النصوص بالعربي والإنجليزي |
| `src/theme.js` | الألوان (فاتح/ليلي) والباستيل |
| `src/components/ui.js` | الأزرار المتنططة، الكروت، الشيتات، الحقول… |
| `src/components/MoodPicker.js` | اختيار المود + المشاعر + الأسباب |
| `src/components/DrawPad.js` | لوحة الرسم |
| `src/screens/TodayScreen.js` | اليوم: الساعة، الهجري والميلادي، الطقس، الصلاة، المود، المية، الورد، الأذكار |
| `src/screens/CalendarScreen.js` | التقويم الشهري واليومي + ملخص مود الشهر |
| `src/screens/PlanScreen.js` | المهام + أهداف السنة (خطوة كل شهر) + أهداف الشهر |
| `src/screens/JournalScreen.js` | المذكرات + الملاحظات + الرسم |
| `src/screens/more/*` | المناسبات، فلوسي، مفضلاتي، وزني، أذكاري، الإعدادات |
| `src/services/*` | الطقس والصلاة (من النت)، الهجري، المناسبات، مقياس المود |

### نصايح سريعة
- **نص جديد؟** ضيفيه في `src/i18n.js` في `ar` و `en` بنفس المفتاح، واستخدميه بـ `t('key')`.
- **مناسبة عامة جديدة؟** من `GREG_EVENTS` أو `HIJRI_EVENTS` في `src/services/events.js`.
- **ألوان؟** من `src/theme.js`.
- **المكان الافتراضي** لو رفضتي الموقع: `FALLBACK` في `src/services/live.js`.

### ملاحظات
- الطقس من **Open-Meteo**، ومواعيد الصلاة والهجري الدقيق (تقويم أم القرى) من **AlAdhan**. الاتنين مجانيين ومن غير مفاتيح.
- لو مفيش نت: بيظهر آخر طقس اتسجّل، والهجري بيتحسب تقريبي على الجهاز.
- مقياس المود ٥ درجات. المشاعر متقسمة على ٤ مجموعات حسب **Mood Meter** (طاقة عالية/قليلة × مريح/مزعج). المقياس ده بيستخدمه مركز Yale للذكاء العاطفي.
