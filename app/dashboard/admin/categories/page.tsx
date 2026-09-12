import { requireRole } from "@/lib/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function AdminCategoriesPage() {
  await requireRole(["ADMIN"]);
  const admin = createAdminClient();
  const { data: categories } = await admin.from("categories").select("*").order("name");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">إدارة التصنيفات</h1>
      <div className="flex flex-col gap-2">
        {(categories ?? []).map((c) => (
          <Card key={c.id} className="flex items-center justify-between">
            <p className="font-medium">{c.name}</p>
            <Badge tone={c.is_disabled ? "danger" : "success"}>{c.is_disabled ? "معطّل" : "نشط"}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
