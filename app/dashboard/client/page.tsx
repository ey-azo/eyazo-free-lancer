import { requireRole } from "@/lib/rbac";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";

export default async function ClientOverviewPage() {
  const profile = await requireRole(["CLIENT"]);
  const supabase = createClient();

  const { count: activeOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("client_id", profile.id)
    .in("status", ["PAID", "IN_PROGRESS", "DELIVERED", "REVISION_REQUESTED"]);

  const { count: openProjects } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("client_id", profile.id)
    .eq("status", "OPEN");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">نظرة عامة</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card><p className="text-muted">الطلبات النشطة</p><p className="text-xl font-bold">{activeOrders ?? 0}</p></Card>
        <Card><p className="text-muted">مشاريعي المفتوحة</p><p className="text-xl font-bold">{openProjects ?? 0}</p></Card>
      </div>
    </div>
  );
}
