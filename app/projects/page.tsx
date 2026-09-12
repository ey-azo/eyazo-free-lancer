import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "استكشف المشاريع" };

export default async function ProjectsPage() {
  const supabase = createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, budget_min, budget_max, status, deadline")
    .eq("status", "OPEN")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">استكشف المشاريع</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(projects ?? []).map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`}>
            <Card className="hover:bg-surface-hover">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">{p.title}</p>
                <Badge>مفتوح</Badge>
              </div>
              <p className="text-sm text-muted">
                الميزانية: {p.budget_min ?? "—"} - {p.budget_max ?? "—"} ج.م
              </p>
            </Card>
          </Link>
        ))}
        {(!projects || projects.length === 0) && <p className="text-sm text-muted">لا توجد مشاريع مفتوحة حاليًا.</p>}
      </div>
    </div>
  );
}
