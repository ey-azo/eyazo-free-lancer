import { requireRole } from "@/lib/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function AdminServicesPage() {
  await requireRole(["ADMIN"]);
  const admin = createAdminClient();
  const { data: services } = await admin
    .from("services")
    .select("*")
    .eq("status", "PENDING_REVIEW")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">مراجعة الخدمات</h1>
      <div className="flex flex-col gap-2">
        {(services ?? []).map((s) => (
          <Card key={s.id} className="flex items-center justify-between">
            <p className="font-medium">{s.title}</p>
            <Badge tone="warning">بانتظار المراجعة</Badge>
          </Card>
        ))}
        {(!services || services.length === 0) && <p className="text-sm text-muted">لا توجد خدمات بانتظار المراجعة.</p>}
      </div>
    </div>
  );
}
