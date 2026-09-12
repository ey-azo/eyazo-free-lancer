import { requireRole } from "@/lib/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function AdminUsersPage() {
  await requireRole(["ADMIN"]);
  const admin = createAdminClient();
  const { data: users } = await admin.from("profiles").select("*").order("created_at", { ascending: false }).limit(50);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">إدارة المستخدمين</h1>
      <div className="flex flex-col gap-2">
        {(users ?? []).map((u) => (
          <Card key={u.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{u.full_name} — @{u.username}</p>
              <p className="text-sm text-muted">{u.role}</p>
            </div>
            <Badge tone={u.is_banned ? "danger" : "success"}>{u.is_banned ? "محظور" : "نشط"}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
