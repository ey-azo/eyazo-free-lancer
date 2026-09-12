import { requireRole } from "@/lib/rbac";
import Link from "next/link";

const links = [
  { href: "/dashboard/admin", label: "نظرة عامة" },
  { href: "/dashboard/admin/users", label: "المستخدمون" },
  { href: "/dashboard/admin/services", label: "الخدمات" },
  { href: "/dashboard/admin/categories", label: "التصنيفات" },
  { href: "/dashboard/admin/projects", label: "المشاريع" },
  { href: "/dashboard/admin/orders", label: "الطلبات" },
  { href: "/dashboard/admin/payments", label: "المدفوعات" },
  { href: "/dashboard/admin/disputes", label: "النزاعات" },
  { href: "/dashboard/admin/reports", label: "البلاغات" },
  { href: "/dashboard/admin/reviews", label: "التقييمات" },
  { href: "/dashboard/admin/messages", label: "الرسائل المشتبه بها" },
  { href: "/dashboard/admin/verification", label: "طلبات التوثيق" },
  { href: "/dashboard/admin/settings", label: "إعدادات المنصة" },
];

// لا يوجد زر WhatsApp هنا إطلاقًا (القسم 12) — مستبعد أيضًا عبر فحص المسار
// في WhatsAppButton كطبقة إضافية.
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["ADMIN"]);
  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8">
      <aside className="hidden w-56 shrink-0 flex-col gap-1 text-sm md:flex">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-muted hover:bg-surface hover:text-foreground">
            {l.label}
          </Link>
        ))}
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
