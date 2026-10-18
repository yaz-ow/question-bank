# بنك الأسئلة · Question Bank

مشروع جامعي للتدريب على أسئلة الاختيار من متعدد، مبني باستخدام Laravel وInertia وReact. يدعم واجهة عربية وإنجليزية؛ محتوى الأسئلة والمقررات يبقى باللغة التي يكتبها المدرّس.

## الوظائف والصلاحيات

| الحساب | الوظائف |
| --- | --- |
| الطالب | التسجيل واستعادة كلمة المرور، تصفح المستويات والمقررات، التدريب، متابعة المحاولة، سجل النتائج ومراجعة الإجابات |
| المدرّس | إدارة المقررات والأسئلة، استيراد Excel/CSV بعد المعاينة، نتائج الطلاب وتنزيل إجابات المحاولات المكتملة |
| المؤسس (`admin`) | جميع وظائف المدرّس، إدارة حسابات الطلاب والمدرّسين |

اختيار اللغة متاح في الواجهة العامة والتسجيل واستعادة كلمة المرور. يحفظ المتصفح الاختيار، وتستخدمه واجهات الحساب بعد تسجيل الدخول. لتغيير اللغة يعود المستخدم إلى الصفحة الرئيسية. يتغير الاتجاه RTL/LTR دون تبديل صور البطاقات أو ترجمة المحتوى المدخل.

الاختبارات تدريبية بلا مؤقت، بأعداد 10 أو 20 أو 30 سؤالًا حسب المتاح. تُحفظ الإجابة قبل إظهار تصحيح السؤال، وتظهر الدرجة فقط بعد اكتمال المحاولة. المحاولة غير المكتملة قابلة للاستئناف. حذف سؤال من البنك لا يغير نسخة السؤال المحفوظة في محاولة سابقة، بينما حذف مقرر يحذف أسئلته ومحاولاته ونتائجه كما يوضح تأكيد الحذف.

## المتطلبات

- Git وComposer 2 وNode.js 22 مع npm.
- PHP وإضافات Laravel/Excel عند تشغيل Composer خارج Docker: `mbstring`, `pdo`, `dom`, `xml`, `xmlreader`, `xmlwriter`, `simplexml`, `zip`, `gd`, `fileinfo`، وإضافة قاعدة البيانات المناسبة.
- إعداد Sail المرفق يستخدم PHP 8.4 وMySQL 8.4. الفحوص الآلية مهيأة أيضًا لـPHP 8.3 مع SQLite.
- في Windows: WSL 2 مع تفعيل تكامل التوزيعة في Docker Desktop. يفضل وضع المشروع داخل `~/projects` في WSL.

## تثبيت جديد باستخدام Sail

هذه الخطوات لنسخة جديدة، وليست لاستبدال إعدادات مشروع يعمل مسبقًا:

```bash
composer install
cp .env.example .env
docker compose -p projectqb up -d --build
docker compose -p projectqb exec laravel.test php artisan key:generate
docker compose -p projectqb exec laravel.test php artisan migrate
docker compose -p projectqb exec laravel.test npm ci
docker compose -p projectqb exec laravel.test npm run build
docker compose -p projectqb exec laravel.test php artisan app:create-founder
```

افتح `http://localhost`. إذا كانت صلاحيات مستخدم WSL مختلفة، اضبط `WWWUSER` و`WWWGROUP` في `.env` حسب `id -u` و`id -g` قبل البناء. بيانات MySQL في المثال مخصصة للتطوير المحلي؛ غيّرها في أي بيئة منشورة.

أمر `app:create-founder` يطلب الاسم والبريد وكلمة مرور مخفية وتأكيدها. يتوقف إذا كان أي مؤسس موجودًا، ولا يعدّل أو يرقّي حسابًا سابقًا. تُفحص كلمات المرور الجديدة أيضًا لتناسب bcrypt (72 بايت كحد أقصى، مع رفض محرف NUL)، دون تعديل بيانات الدخول السابقة. لا توجد حسابات دخول افتراضية، و`db:seed` لا ينشئ حسابات تجريبية. أمر الإنشاء لا يلزم للنسخ التي لديها حساب مؤسس بالفعل.

لإضافة المدرّسين من الواجهة، ضع قيمة خاصة وقوية لـ`ADMIN_CREATION_CODE` في `.env` ثم نفّذ `php artisan config:clear` داخل الحاوية. لا تضع الرمز أو كلمات المرور في Git.

## تحديث نسخة موجودة

احتفظ بملف `.env` وقاعدة البيانات والمفتاح الحالي. انسخ قاعدة البيانات احتياطيًا قبل التحديثات التي تشمل تغييرات في هيكلها.

```bash
git pull --rebase --autostash origin main
docker compose -p projectqb up -d --build
docker compose -p projectqb exec laravel.test composer install --no-interaction --prefer-dist
docker compose -p projectqb exec laravel.test npm ci
docker compose -p projectqb exec laravel.test php artisan optimize:clear
docker compose -p projectqb exec laravel.test php artisan migrate
docker compose -p projectqb exec laravel.test npm run build
```

شغّل الحاويات أولًا إذا كانت متوقفة. لا تُعد إنشاء `APP_KEY` أو نسخ `.env.example` فوق إعداداتك عند التحديث. مراجعة أكتوبر 2026 لا تضيف migration جديدة. تتطلب إعادة بناء حاوية التطبيق لأنها توحّد إصدار PHP على 8.4؛ مكتبة Excel المثبتة لا تدعم PHP 8.5. يبقى مجلد بيانات MySQL المحفوظ في Docker volume كما هو.

## استيراد الأسئلة

حمّل القالب من إدارة أسئلة المقرر. أسماء الأعمدة ثابتة:

```text
question_text,option_a,option_b,option_c,option_d,correct_answer
```

الملف XLSX/XLS/CSV بحد 5 MB و1000 سؤال غير فارغ. نص السؤال بحد 10000 حرف، وكل خيار بحد 255 حرفًا. المفتاح الصحيح A/B/C/D، ويقبل الاستيراد أيضًا أحرف الخيارات العربية. تُعرض الأخطاء والتكرارات قبل الاعتماد؛ وجود خطأ يمنع الاستيراد كله. تنتهي المعاينة بعد 15 دقيقة وتخص الحساب والمقرر والجلسة الحالية. الأسئلة المطابقة تُتخطى عند المعاينة والتأكيد.

## التحقق

داخل الحاوية، أو مباشرة إذا توفرت المتطلبات محليًا:

```bash
php artisan config:clear
php artisan test
npm ci
npm run build
npm audit
composer audit --locked
```

استخدم `docker compose -p projectqb exec laravel.test` قبل كل أمر لتشغيله في Sail. تستخدم الاختبارات SQLite في الذاكرة افتراضيًا، ولا تختبر على قاعدة بيانات حقيقية تحتوي بيانات المستخدمين. GitHub Actions يهيئ مسارين: PHP 8.3/SQLite وPHP 8.4/MySQL 8.4 مع قاعدة منفصلة للاختبار، إضافة إلى البناء وتدقيق الاعتمادات.

## البريد والتشغيل المنشور

`MAIL_MAILER=log` مخصص للتطوير؛ لا يرسل رابط الاستعادة إلى صندوق بريد حقيقي. اضبط `MAIL_MAILER=smtp` وبيانات `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SCHEME`, `MAIL_FROM_ADDRESS` حسب مزودك. اضبط `APP_URL` على عنوان الموقع الحقيقي؛ روابط الاستعادة تعتمد عليه دائمًا لحمايتها من تغيير عنوان الطلب. جرّب استعادة كلمة مرور الطالب والإدارة من بريد فعلي.

قبل الإطلاق اضبط `APP_ENV=production`, `APP_DEBUG=false` واستخدم HTTPS و`SESSION_SECURE_COOKIE=true`. وجّه خادم الويب إلى `public/` فقط، واجعل `storage/` و`bootstrap/cache/` قابلين للكتابة للمستخدم المناسب. ملف Compose المرفق للتطوير المحلي ويعرض منفذ قاعدة البيانات؛ جهّز استضافة الإنتاج حسب بيئتك. احتفظ بنسخ احتياطية لقاعدة البيانات وجرّب الاستعادة منها. لا تشغّل خادم Vite التطويري على الموقع المنشور.

راجع [تقرير الفحص وحدود التحقق](docs/AUDIT.md). ملاحظات المراحل السابقة محفوظة في [docs/history](docs/history) للتاريخ، وقد تصف واجهات استُبدلت لاحقًا.
