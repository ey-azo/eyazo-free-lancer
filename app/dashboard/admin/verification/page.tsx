import { requireRole } from "@/lib/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function AdminVerificationPage() {
  await requireRole(["ADMIN"]);
  const admin = createAdminClient();
  const { data: requests } = await admin
    .from("verification_requests")
    .select("*")
    .eq("status", "PENDING")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">طلبات التوثيق</h1>
      <div className="flex flex-col gap-2">
        {(requests ?? []).map((r) => (
          <Card key={r.id} className="flex items-center justify-between">
            <p className="font-medium">فريلانسر: {r.freelancer_id}</p>
            <Badge tone="warning">بانتظار المراجعة</Badge>
          </Card>
        ))}
        {(!requests || requests.length === 0) && <p className="text-sm text-muted">لا توجد طلبات توثيق معلقة.</p>}
      </div>
    </div>
  );
}
