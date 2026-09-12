import { requireRole } from "@/lib/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";

// إعدادات المنصة (القسم 33) — العمولة تُقرأ من هنا فقط ولا تُكتب Hard-coded
export default async function AdminSettingsPage() {
  await requireRole(["ADMIN"]);
  const admin = createAdminClient();
  const { data: settings } = await admin.from("platform_settings").select("*").single();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">إعدادات المنصة</h1>
      <Card className="flex flex-col gap-3 text-sm">
        <p>اسم المنصة: {settings?.platform_name}</p>
        <p>نسبة العمولة: {settings?.commission_percentage}%</p>
        <p>الحد الأدنى للطلب: {settings?.minimum_order_amount} ج.م</p>
        <p>الحد الأقصى لحجم الملف: {settings?.maximum_file_size_mb} ميجابايت</p>
        <p>وضع الصيانة: {settings?.maintenance_mode ? "مفعّل" : "غير مفعّل"}</p>
      </Card>
    </div>
  );
}
