import { requireRole } from "@/lib/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// مراجعة المدفوعات اليدوية المعلقة (القسم 41)
export default async function AdminPaymentsPage() {
  await requireRole(["ADMIN"]);
  const admin = createAdminClient();

  const { data: pending } = await admin
    .from("payments")
    .select("*, orders(id, price, client_id)")
    .eq("status", "PENDING_MANUAL_CONFIRMATION")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">مدفوعات بانتظار المراجعة</h1>
      <div className="flex flex-col gap-3">
        {(pending ?? []).map((p) => (
          <Card key={p.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">رقم العملية: {p.transaction_reference}</p>
              <p className="text-sm text-muted">المبلغ: {p.amount} ج.م — الطلب #{p.order_id}</p>
            </div>
            <Badge tone="warning">بانتظار المراجعة</Badge>
          </Card>
        ))}
        {(!pending || pending.length === 0) && <p className="text-sm text-muted">لا توجد مدفوعات بانتظار المراجعة.</p>}
      </div>
    </div>
  );
}
