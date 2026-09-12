import { requireRole } from "@/lib/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// الرسائل المشتبه بها (القسم 25 و32) — التي وضعها نظام الحماية عليها علامة
export default async function AdminSuspiciousMessagesPage() {
  await requireRole(["ADMIN"]);
  const admin = createAdminClient();
  const { data: messages } = await admin
    .from("messages")
    .select("*")
    .eq("is_flagged", true)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">رسائل مشتبه بها</h1>
      <div className="flex flex-col gap-2">
        {(messages ?? []).map((m) => (
          <Card key={m.id}>
            <p className="text-sm">{m.content}</p>
            <Badge tone="danger" className="mt-2">{m.flag_reason}</Badge>
          </Card>
        ))}
        {(!messages || messages.length === 0) && <p className="text-sm text-muted">لا توجد رسائل مشتبه بها.</p>}
      </div>
    </div>
  );
}
