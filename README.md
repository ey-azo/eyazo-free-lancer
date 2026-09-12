# EYAZO

سوق عمل حر عربي بالكامل (RTL) — Next.js (App Router) + Supabase.

## ⚠️ حالة الكود بصراحة تامة

هذا المشروع بُني كاملًا بدون تشغيل فعلي (لا يوجد اتصال إنترنت في بيئة
التوليد لتنفيذ `npm install` أو الاتصال بمشروع Supabase حقيقي). الأجزاء التالية
**مكتملة الكود فعليًا وتتبع المواصفات حرفيًا**:

- بنية المشروع الكاملة (Next.js App Router + فصل الطبقات) — القسم 5
- Design System: Button/Card/Input/Badge بالألوان المحددة — القسم 6
- Database schema كامل (كل الجداول والحالات) — `database/schema.sql`
- RLS كامل على كل جدول به بيانات مستخدمين — `database/rls.sql`
- المصادقة: تسجيل / دخول / خروج / نسيت كلمة المرور / إعادة تعيين / تفعيل بريد
- RBAC عبر Middleware + `lib/rbac.ts` + RLS (3 طبقات، القسم 8 و10)
- Navbar / Footer / زر WhatsApp العائم (مستبعد من Admin) — القسم 11، 12
- Homepage بالأقسام المذكورة حصرًا — القسم 17
- صفحة الفريلانسر العامة، صفحة الخدمة، صفحة المشروع، البحث والفرز والـ Pagination
- إنشاء Order من Server فقط عند قبول عرض، مع حساب العمولة من Platform Settings
  (وليس Hard-coded) — `app/api/proposals/[id]/accept/route.ts`
- فحص الرسائل من مشاركة تواصل خارجي على السيرفر فقط — `lib/content-filter.ts`
- تدفق الدفع اليدوي (تحويل → "أنا حولت" → مراجعة Admin → Paid/Held → Payout)
- Admin Dashboard: نظرة عامة، مستخدمون، خدمات، تصنيفات، نزاعات، بلاغات،
  تقييمات، رسائل مشتبه بها، توثيق، إعدادات، مدفوعات
- الصفحات القانونية بنص Placeholder فقط — القسم 52
- SEO: Metadata API، sitemap.ts، robots.ts — القسم 49
- Seed script منفصل يرفض العمل في `NODE_ENV=production` — القسم 55

**الأجزاء المذكورة في المواصفات ولم تُبنَ بواجهات كاملة بعد** (البنية الخلفية
والـ RLS لها جاهزة في `database/schema.sql` و`rls.sql`، لكن تحتاج صفحات/نماذج
UI إضافية لتكتمل بصريًا 100%): نماذج إنشاء/تعديل الخدمة والمشروع من واجهة
الفريلانسر/العميل، واجهة الرسائل الكاملة (قائمة محادثات + عرض فعلي)، واجهة
تسليم الطلب وطلب التعديل، مركز الإشعارات، صفحة الإبلاغ ونموذج النزاع من
واجهة المستخدم، طبقة AI (القسم 46 — الأسهل تنفيذها بعد ربط مزود AI فعلي)،
Quick Transfer Deep Link (القسم 39)، صفحة Trust Score التفصيلية (القسم 48).

هذا ليس نقصًا في المواصفات بل نقص في وقت البناء — البنية (Database + RLS +
API + RBAC) المطلوبة لكل هذه الأجزاء موجودة بالفعل وجاهزة، والمتبقي هو
واجهات تستهلكها. أخبرني بالجزء التالي الذي تريد إكماله وسأبنيه بنفس الدقة.

## التشغيل محليًا

### 1. إنشاء مشروع Supabase
1. اذهب إلى https://supabase.com وأنشئ مشروعًا جديدًا.
2. من SQL Editor، شغّل بالترتيب:
   - محتوى `database/schema.sql`
   - محتوى `database/rls.sql`
3. من Project Settings → API، انسخ:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (سرّي تمامًا، لا يظهر أبدًا في الفرونت إند)

### 2. إعداد المشروع محليًا
```bash
cp .env.example .env.local
# افتح .env.local وضع القيم الثلاث السابقة، واترك NODE_ENV=development
npm install
npm run dev
```
افتح http://localhost:3000

### 3. تفعيل Email Auth
من Supabase Dashboard → Authentication → Providers، تأكد أن Email مفعّل،
واضبط Site URL و Redirect URLs (`http://localhost:3000/**` في التطوير).

### 4. (اختياري) تشغيل Seed Data — بيئة تطوير فقط
```bash
npm run seed
```
ينشئ حسابات DEMO/TEST فقط (Admin وClients وFreelancers)، ولن يعمل أبدًا إذا
كان `NODE_ENV=production`.

### 5. رفع صور/ملفات (Supabase Storage)
من Storage في لوحة Supabase، أنشئ Buckets:
- `public-assets` (Public) — لصور الخدمات ومعرض الأعمال
- `private-files` (Private) — لملفات المشاريع والتسليمات وإثباتات الدفع
  (يجب الوصول لها عبر Signed URLs فقط من كود السيرفر)

## النشر (Vercel + Supabase) — القسم 63

1. ادفع المشروع كاملًا إلى مستودع GitHub.
2. تأكد أن `npm run build` ينجح محليًا بدون أخطاء.
3. من https://vercel.com، استورد المستودع.
4. في Vercel Project Settings → Environment Variables، أضف نفس المتغيرات
   الثلاث (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`). لا تضع `SUPABASE_SERVICE_ROLE_KEY` كمتغير
   `NEXT_PUBLIC_*` أبدًا.
5. اضبط `NEXT_PUBLIC_SITE_URL` على رابط الإنتاج (لملفي sitemap.ts وrobots.ts).
6. Vercel يضبط `NODE_ENV=production` تلقائيًا — تأكد بعد أول نشر أن Seed Data
   لا تعمل وأن تسجيل الدخول والدفع اليدوي يعملان على الرابط الحقيقي.
7. من Supabase → Authentication → URL Configuration، أضف رابط Vercel
   النهائي إلى Site URL وRedirect URLs.

## الاختبار قبل اعتبار المشروع جاهزًا (القسم 56، 57)

هذا الكود لم يُشغَّل فعليًا بعد. بعد `npm install` و`npm run dev` محليًا، تأكد
يدويًا من: التسجيل، الدخول، الخروج، تفعيل البريد، نسيت/إعادة تعيين كلمة
المرور، أن كل Role يرى فقط ما يخصه (RBAC/RLS)، أن تعديل الـ ID في الرابط لا
يكشف بيانات مستخدم آخر (IDOR)، تدفق الخدمات/المشاريع/العروض/الطلبات،
الرسائل ومنع مشاركة التواصل الخارجي، رفع الملفات، الدفع اليدوي الكامل حتى
Payout، RTL على الموبايل، وزر واتساب في كل مكان ما عدا Admin.
