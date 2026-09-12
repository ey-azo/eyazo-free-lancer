import { requireRole } from "@/lib/rbac";
import Link from "next/link";

const links = [
  { href: "/dashboard/client", label: "نظرة عامة" },
  { href: "/dashboard/client/orders", label: "الطلبات" },
  { href: "/dashboard/client/projects", label: "المشاريع" },
  { href: "/dashboard/client/proposals", label: "العروض الواردة" },
  { href: "/dashboard/client/favorites", label: "المفضلة" },
  { href: "/dashboard/client/reviews", label: "التقييمات" },
];

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["CLIENT"]);
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
