import { requireRole } from "@/lib/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function AdminReportsPage() {
  await requireRole(["ADMIN"]);
  const admin = createAdminClient();
  const { data: reports } = await admin.from("reports").select("*").eq("status", "OPEN").order("created_at");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">البلاغات</h1>
      <div className="flex flex-col gap-2">
        {(reports ?? []).map((r) => (
          <Card key={r.id} className="flex items-center justify-between">
            <p className="font-medium">{r.reason}</p>
            <Badge tone="warning">{r.status}</Badge>
          </Card>
        ))}
        {(!reports || reports.length === 0) && <p className="text-sm text-muted">لا توجد بلاغات مفتوحة.</p>}
      </div>
    </div>
  );
}
