import { requireRole } from "@/lib/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";

export default async function AdminReviewsPage() {
  await requireRole(["ADMIN"]);
  const admin = createAdminClient();
  const { data: reviews } = await admin.from("reviews").select("*").order("created_at", { ascending: false }).limit(50);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">مراجعة التقييمات</h1>
      <div className="flex flex-col gap-2">
        {(reviews ?? []).map((r) => (
          <Card key={r.id}>
            <p className="font-medium">{r.rating} / 5</p>
            <p className="text-sm text-muted">{r.comment}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
