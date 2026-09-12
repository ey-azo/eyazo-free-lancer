import { requireRole } from "@/lib/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function AdminDisputesPage() {
  await requireRole(["ADMIN"]);
  const admin = createAdminClient();
  const { data: disputes } = await admin
    .from("disputes")
    .select("*")
    .in("status", ["OPEN", "UNDER_REVIEW", "WAITING_FOR_USER"])
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">النزاعات</h1>
      <div className="flex flex-col gap-2">
        {(disputes ?? []).map((d) => (
          <Card key={d.id} className="flex items-center justify-between">
            <p className="font-medium">{d.reason}</p>
            <Badge tone="warning">{d.status}</Badge>
          </Card>
        ))}
        {(!disputes || disputes.length === 0) && <p className="text-sm text-muted">لا توجد نزاعات مفتوحة.</p>}
      </div>
    </div>
  );
}
