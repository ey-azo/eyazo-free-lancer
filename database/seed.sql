-- ============================================================================
-- EYAZO — SEED DATA (DEMO / TEST DATA فقط — ليست مستخدمين حقيقيين)
-- لا يُشغَّل هذا الملف تلقائيًا. شغّله يدويًا فقط في بيئة تطوير:
--   psql <connection-string> -f database/seed.sql
-- ممنوع تشغيله في NODE_ENV=production — انظر database/run-seed.ts الذي يفرض هذا الشرط.
-- ============================================================================

-- ملاحظة: إنشاء مستخدمي auth.users نفسه يجب أن يتم عبر Supabase Auth Admin API
-- (لأن كلمات المرور وتشفيرها تُدار داخليًا من Supabase)، لذلك السكربت الفعلي
-- الذي ينفّذ هذا كاملًا هو database/run-seed.ts (يستخدم Service Role).
-- هذا الملف يوثّق فقط بيانات الفئات الأساسية التي لا تعتمد على auth.users.

insert into categories (name, slug) values
  ('برمجة', 'programming'),
  ('تصميم', 'design'),
  ('فيديو وصوت', 'video-audio'),
  ('كتابة وترجمة', 'writing-translation'),
  ('تسويق', 'marketing'),
  ('أعمال', 'business')
on conflict (slug) do nothing;
