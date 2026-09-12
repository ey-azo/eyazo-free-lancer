import { requireRole } from "@/lib/rbac";
import Link from "next/link";

const links = [
  { href: "/dashboard/freelancer", label: "نظرة عامة" },
  { href: "/dashboard/freelancer/orders", label: "الطلبات" },
  { href: "/dashboard/freelancer/services", label: "الخدمات" },
  { href: "/dashboard/freelancer/proposals", label: "العروض المقدَّمة" },
  { href: "/dashboard/freelancer/earnings", label: "الأرباح" },
  { href: "/dashboard/freelancer/reviews", label: "التقييمات" },
  { href: "/dashboard/freelancer/portfolio", label: "معرض الأعمال" },
];

export default async function FreelancerDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["FREELANCER"]);
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
