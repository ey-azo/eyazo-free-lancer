import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/**
 * Homepage — الأقسام محصورة فيما ورد في القسم 17 من المواصفات فقط:
 * Hero + بحث، تصنيفات شائعة، خدمات مميزة، فريلانسرز مميزون، كيف يعمل EYAZO،
 * لماذا EYAZO. بدون أي قسم إضافي.
 */
export default async function HomePage() {
  const supabase = createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_disabled", false)
    .limit(6);

  const { data: featuredServices } = await supabase
    .from("services")
    .select("id, title, slug, price")
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false })
    .limit(6);

  const { data: featuredFreelancers } = await supabase
    .from("freelancer_profiles")
    .select("profile_id, job_title, rating_average, profiles(full_name, username)")
    .order("rating_average", { ascending: false })
    .limit(6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-16 text-center">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
          أنجز أعمالك مع مستقلين تثق بهم
        </h1>
        <form action="/services" className="flex w-full max-w-xl items-center gap-2">
          <input
            name="q"
            placeholder="ما الخدمة التي تبحث عنها؟"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button type="submit">بحث</Button>
        </form>
        <div className="flex gap-3">
          <Link href="/services"><Button variant="secondary">ابحث عن خدمة</Button></Link>
          <Link href="/dashboard/client"><Button>انشر مشروعك</Button></Link>
        </div>
      </section>

      {/* تصنيفات شائعة */}
      <section className="py-8">
        <h2 className="mb-4 text-xl font-semibold">تصنيفات شائعة</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {(categories ?? []).map((c) => (
            <Link key={c.id} href={`/services?category=${c.slug}`}>
              <Card className="flex h-20 items-center justify-center text-center text-sm hover:bg-surface-hover">
                {c.name}
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* خدمات مميزة */}
      <section className="py-8">
        <h2 className="mb-4 text-xl font-semibold">خدمات مميزة</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(featuredServices ?? []).map((s) => (
            <Link key={s.id} href={`/services/${s.slug}`}>
              <Card className="hover:bg-surface-hover">
                <p className="mb-2 line-clamp-2 font-medium">{s.title}</p>
                <p className="text-sm text-muted">يبدأ من {s.price} ج.م</p>
              </Card>
            </Link>
          ))}
          {(!featuredServices || featuredServices.length === 0) && (
            <p className="text-sm text-muted">لا توجد خدمات منشورة حاليًا.</p>
          )}
        </div>
      </section>

      {/* فريلانسرز مميزون */}
      <section className="py-8">
        <h2 className="mb-4 text-xl font-semibold">فريلانسرز مميزون</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(featuredFreelancers ?? []).map((f: any) => (
            <Link key={f.profile_id} href={`/freelancer/${f.profiles?.username}`}>
              <Card className="hover:bg-surface-hover">
                <p className="font-medium">{f.profiles?.full_name}</p>
                <p className="text-sm text-muted">{f.job_title}</p>
              </Card>
            </Link>
          ))}
          {(!featuredFreelancers || featuredFreelancers.length === 0) && (
            <p className="text-sm text-muted">لا يوجد فريلانسرز حاليًا.</p>
          )}
        </div>
      </section>

      {/* كيف يعمل EYAZO */}
      <section className="py-8">
        <h2 className="mb-4 text-xl font-semibold">كيف يعمل EYAZO</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card><p>ابحث عن الخدمة أو انشر مشروعك.</p></Card>
          <Card><p>تواصل مع الفريلانسر واتفق على التفاصيل.</p></Card>
          <Card><p>ادفع بأمان واستلم عملك عبر EYAZO.</p></Card>
        </div>
      </section>

      {/* لماذا EYAZO */}
      <section className="py-8">
        <h2 className="mb-4 text-xl font-semibold">لماذا EYAZO</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card><p>منصة عربية بالكامل مصممة لسوقنا.</p></Card>
          <Card><p>حماية للطرفين عبر نظام طلبات ونزاعات واضح.</p></Card>
          <Card><p>دعم مباشر عبر واتساب عند الحاجة.</p></Card>
        </div>
      </section>
    </div>
  );
}
