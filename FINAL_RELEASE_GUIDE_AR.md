# دليل إنهاء ونشر Satellite Ops Intelligence v1.4.0

## ما الذي تم إعداده؟
- واجهة افتراضية عالية التباين: شريط تنقل كحلي ومساحة عمل فاتحة، مع وضع داكن اختياري.
- خط أكبر في التنقل والحقول والشروح والجداول وصفحة التدريب.
- صفحة Guided Learning بالإنجليزية والعربية، تعرض مثالًا افتراضيًا مرتبطًا بمختبرات التطبيق.
- اختبارات الحسابات، وفحص JavaScript، وفحوصات أصول الموقع وPWA.
- سير عمل GitHub Pages ينشر ملفات الموقع فقط، بدل نشر التوثيق والاختبارات مع واجهة الويب.

## المرحلة 1 — النسخة المحلية
1. فك ضغط `Satellite_Ops_Intelligence_v1.4.0_Source_and_PWA.zip` في مجلد جديد.
2. افتح المجلد الذي يحتوي مباشرة على `index.html` و`app.js` و`core.js` و`package.json` في VS Code.
3. افتح Terminal وشغّل `npm run verify`.
4. إذا نجحت الاختبارات، شغّل `start-website.bat` وافتح `http://localhost:8080`.
5. جرّب Guided Learning، وغيّر اللغة، وجرّب Link Budget، وسعة الترانسبوندر، ورسم fade margin، والتقارير.

## المرحلة 2 — النشر عبر GitHub Pages
1. أنشئ مستودع GitHub فارغًا باسم `satellite-ops-intelligence`؛ لا تضف أسرارًا أو بيانات تشغيل حقيقية.
2. ارفع محتويات مجلد المشروع إلى جذر المستودع، بما فيها المجلد المخفي `.github/workflows/pages.yml`.
3. من VS Code Terminal داخل جذر المشروع نفّذ:

   ```powershell
   git init
   git branch -M main
   git add .
   git commit -m "Release Satellite Ops Intelligence v1.4.0"
   git remote add origin https://github.com/YOUR-USERNAME/satellite-ops-intelligence.git
   git push -u origin main
   ```

   استبدل `YOUR-USERNAME` باسم مستخدم GitHub الحقيقي. إذا كان لديك remote سابق، استخدم `git remote set-url origin ...` بدل إضافة remote جديد.
4. من المستودع اختر `Settings → Pages → Build and deployment → Source → GitHub Actions`.
5. افتح تبويب `Actions` وانتظر نجاح مهمة `Deploy Satellite Ops Intelligence to GitHub Pages`.
6. انسخ رابط Pages الذي يظهر بعد النشر. عادةً يكون `https://YOUR-USERNAME.github.io/satellite-ops-intelligence/`، لكن اعتمد الرابط الذي يعرضه GitHub لا التخمين.

## المرحلة 3 — فحص الرابط العام
- افتح الرابط في نافذة Incognito على الكمبيوتر.
- افحص أن الصفحة والملفات `app.js` و`core.js` و`styles.css` و`manifest.webmanifest` و`sw.js` تتحمل بنجاح.
- جرّب تبديل اللغة والوضع، التنقل بين المختبرات، الرسم، واستيراد/تصدير ملفات التقارير.
- افتح Developer Tools → Console وتحقق من عدم وجود أخطاء تصدر من ملفات التطبيق. رسائل `chrome-extension://` غالبًا ترتبط بإضافات المتصفح.

## المرحلة 4 — تثبيت PWA على Android
1. افتح رابط HTTPS العام في Chrome على هاتف Android.
2. انتظر اكتمال تحميل الصفحة أول مرة.
3. افتح قائمة Chrome وابحث عن `Install app` أو `Add to Home screen`.
4. شغّل التطبيق من الأيقونة واختبر اتجاه الهاتف العمودي والأفقي والعربية والتقارير.
5. اختبر دون اتصال فقط بعد التأكد مما يخزنه Service Worker؛ لا تفترض أن كل وظائف استيراد/تصدير الملفات تعمل دون إنترنت.

## المرحلة 5 — هل نحتاج APK/AAB؟
تثبيت PWA لا يحتاج ملف APK. إذا كان الهدف النشر عبر Google Play أو توزيع ملف Android مستقل، أنشئ Trusted Web Activity باستخدام Bubblewrap أو PWABuilder بعد استقرار الدومين. يتطلب ذلك إعداد package ID والتوقيع وDigital Asset Links واختبار الحزمة. لا تشارك keystore أو كلمات مرور التوقيع.

## المرحلة 6 — إطلاق LinkedIn
- استخدم `LINKEDIN_CASE_STUDY_AR_EN.md` للدراسة التعليمية والمنشورين بالإنجليزية والعربية.
- استبدل نص `[Insert deployed HTTPS URL]` بالرابط العام الحقيقي قبل النشر.
- سجّل فيديو 45–60 ثانية: الصفحة الرئيسية، Guided Learning، Link Budget، Transponder Capacity، fade-margin chart، ثم تقرير القرار.
- وضّح أن بيانات العرض اصطناعية أو مدخلة من المستخدم وأن المشروع أداة تدريب وفحص هندسي أولي، وليس نموذج تشغيل معتمدًا أو اتصالًا بتليمترية أقمار حية.

## أرقام المثال التدريبي
- FSPL ≈ 205.63 dB عند 12 GHz و38,000 km.
- C/N0 ≈ 92.97 dB-Hz.
- Eb/N0 ≈ 18.20 dB عند 30 Mbps.
- Residual link margin ≈ +8.70 dB وفق العتبة والاحتياطيات الافتراضية.
- Occupied span = 28.50 MHz، available bandwidth = 34 MHz، utilization ≈ 83.82%.
- 20 dBW = 100 W؛ ومع OBO افتراضي 3 dB تكون ميزانية الخرج التشغيلية المبسطة ≈ 50.12 W.
- Carrier power allocated = 9 W، power loading ≈ 17.96%.
- Fade scenario: 8.7 + 2 − 6 = +4.7 dB؛ وعند fade depth 12 dB يصبح −1.3 dB.

## الحدود الفنية التي يجب الإفصاح عنها
هذا نموذج توضيحي بقيم اصطناعية. مختبر التوافر يعتمد على ساعات انقطاع يدخلها المستخدم ولا يستنتج احتمال الانقطاع من fade margin. لا يطبق الإصدار تنبؤ ITU-R P.618 كاملًا، ولا نمذجة DVB-S2/S2X متكاملة للـ MODCOD، ولا تأثيرات payload غير الخطية، ولا اتصالًا مباشرًا بمشغّلي الأقمار الصناعية. نتائج المختبر ليست اعتمادًا تشغيليًا أو التزامًا تجاريًا بالسعة.
