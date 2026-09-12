import { requireRole } from "@/lib/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";

export const metadata = { robots: { index: false, follow: false } };

// إحصائيات Admin (القسم 36) — الأرقام المطلوبة فقط، بدون إضافة مقاييس أخرى.
export default async function AdminOverviewPage() {
  await requireRole(["ADMIN"]);
  const admin = createAdminClient();

  const [{ count: totalUsers }, { count: totalOrders }, { data: paidOrders }, { count: pendingDisputes }, { count: pendingVerifications }] =
    await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("orders").select("id", { count: "exact", head: true }),
      admin.from("orders").select("price, platform_fee").in("status", ["PAID", "IN_PROGRESS", "DELIVERED", "COMPLETED"]),
      admin.from("disputes").select("id", { count: "exact", head: true }).in("status", ["OPEN", "UNDER_REVIEW", "WAITING_FOR_USER"]),
      admin.from("verification_requests").select("id", { count: "exact", head: true }).eq("status", "PENDING"),
    ]);

  const totalTransactionValue = (paidOrders ?? []).reduce((s, o) => s + Number(o.price), 0);
  const platformRevenue = (paidOrders ?? []).reduce((s, o) => s + Number(o.platform_fee), 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">نظرة عامة — لوحة الأدمن</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card><p className="text-muted">إجمالي المستخدمين</p><p className="text-xl font-bold">{totalUsers ?? 0}</p></Card>
        <Card><p className="text-muted">إجمالي الطلبات</p><p className="text-xl font-bold">{totalOrders ?? 0}</p></Card>
        <Card><p className="text-muted">إجمالي قيمة المعاملات</p><p className="text-xl font-bold">{totalTransactionValue} ج.م</p></Card>
        <Card><p className="text-muted">إيرادات المنصة</p><p className="text-xl font-bold">{platformRevenue} ج.م</p></Card>
        <Card><p className="text-muted">النزاعات المعلقة</p><p className="text-xl font-bold">{pendingDisputes ?? 0}</p></Card>
        <Card><p className="text-muted">التوثيقات المعلقة</p><p className="text-xl font-bold">{pendingVerifications ?? 0}</p></Card>
      </div>
    </div>
  );
}
