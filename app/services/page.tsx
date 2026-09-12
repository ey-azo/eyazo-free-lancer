import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "استكشف الخدمات" };

const PAGE_SIZE = 20;

interface Props {
  searchParams: {
    q?: string; category?: string; sort?: string; page?: string;
    min_price?: string; max_price?: string;
  };
}

// نظام بحث حسب القسم 16: كلمة مفتاحية، تصنيف، سعر، تقييم، مدة تسليم + فرز + Pagination
export default async function ServicesPage({ searchParams }: Props) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("services")
    .select("id, title, slug, price, delivery_days, category_id", { count: "exact" })
    .eq("status", "PUBLISHED")
    .range(from, to);

  if (searchParams.q) query = query.ilike("title", `%${searchParams.q}%`);
  if (searchParams.min_price) query = query.gte("price", Number(searchParams.min_price));
  if (searchParams.max_price) query = query.lte("price", Number(searchParams.max_price));

  switch (searchParams.sort) {
    case "price_asc": query = query.order("price", { ascending: true }); break;
    case "fastest": query = query.order("delivery_days", { ascending: true }); break;
    default: query = query.order("created_at", { ascending: false });
  }

  const { data: services, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">استكشف الخدمات</h1>

      <form className="mb-6 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="ما الخدمة التي تبحث عنها؟"
          className="min-w-[240px] flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm"
        />
        <select name="sort" defaultValue={searchParams.sort} className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
          <option value="">الأحدث</option>
          <option value="price_asc">الأقل سعرًا</option>
          <option value="fastest">الأسرع تسليمًا</option>
        </select>
        <button className="rounded-lg bg-primary px-4 py-2.5 text-sm text-white">تصفية</button>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(services ?? []).map((s) => (
          <Link key={s.id} href={`/services/${s.slug}`}>
            <Card className="hover:bg-surface-hover">
              <p className="mb-2 line-clamp-2 font-medium">{s.title}</p>
              <p className="text-sm text-muted">يبدأ من {s.price} ج.م · تسليم {s.delivery_days} يوم</p>
            </Card>
          </Link>
        ))}
        {(!services || services.length === 0) && <p className="text-sm text-muted">لا توجد نتائج مطابقة.</p>}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link
              key={i}
              href={`?${new URLSearchParams({ ...searchParams, page: String(i + 1) }).toString()}`}
              className={`rounded-md px-3 py-1.5 ${page === i + 1 ? "bg-primary text-white" : "border border-border text-muted"}`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
