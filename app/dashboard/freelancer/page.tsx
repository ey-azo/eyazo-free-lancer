import { requireRole } from "@/lib/rbac";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";

export default async function FreelancerOverviewPage() {
  const profile = await requireRole(["FREELANCER"]);
  const supabase = createClient();

  const { data: fp } = await supabase
    .from("freelancer_profiles")
    .select("rating_average, completed_orders_count")
    .eq("profile_id", profile.id)
    .single();

  const { count: activeOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("freelancer_id", profile.id)
    .in("status", ["PAID", "IN_PROGRESS", "DELIVERED", "REVISION_REQUESTED"]);

  const { data: payouts } = await supabase
    .from("payouts")
    .select("amount")
    .eq("freelancer_id", profile.id)
    .eq("status", "PAID");

  const totalEarnings = (payouts ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">نظرة عامة</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><p className="text-muted">إجمالي الأرباح</p><p className="text-xl font-bold">{totalEarnings} ج.م</p></Card>
        <Card><p className="text-muted">الطلبات النشطة</p><p className="text-xl font-bold">{activeOrders ?? 0}</p></Card>
        <Card><p className="text-muted">التقييم</p><p className="text-xl font-bold">{fp?.rating_average ?? 0}</p></Card>
      </div>
    </div>
  );
}
