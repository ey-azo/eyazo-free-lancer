import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Metadata } from "next";

interface Props {
  params: { username: string };
}

async function getFreelancer(username: string) {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, freelancer_profiles(*), portfolio_items:freelancer_profiles(portfolio_items(*))")
    .eq("username", username)
    .single();
  return profile;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getFreelancer(params.username);
  if (!profile) return {};
  return {
    title: profile.full_name,
    description: profile.bio ?? undefined,
    openGraph: { title: profile.full_name, description: profile.bio ?? undefined },
  };
}

// الصفحة العامة للمستخدم (القسم 13) — تعرض فقط الحقول المذكورة صراحة.
export default async function FreelancerPublicPage({ params }: Props) {
  const profile = await getFreelancer(params.username);
  if (!profile) notFound();

  const fp = Array.isArray(profile.freelancer_profiles)
    ? profile.freelancer_profiles[0]
    : profile.freelancer_profiles;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 shrink-0 rounded-full bg-surface-hover" />
        <div>
          <h1 className="text-2xl font-bold">{profile.full_name}</h1>
          <p className="text-sm text-muted">@{profile.username}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{profile.role === "FREELANCER" ? "فريلانسر" : "عميل"}</Badge>
            {fp && <Badge tone={fp.verification_status === "VERIFIED" ? "success" : "default"}>
              {fp.verification_status === "VERIFIED" ? "موثّق" : "غير موثّق"}
            </Badge>}
          </div>
        </div>
      </div>

      {profile.bio && <p className="mt-6 text-sm text-muted">{profile.bio}</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <Card><p className="text-muted">الدولة</p><p>{profile.country ?? "—"}</p></Card>
        <Card><p className="text-muted">اللغات</p><p>{(profile.languages ?? []).join("، ") || "—"}</p></Card>
        <Card><p className="text-muted">تاريخ الانضمام</p><p>{new Date(profile.created_at).toLocaleDateString("ar-EG")}</p></Card>
        {fp && <Card><p className="text-muted">التقييم</p><p>{fp.rating_average} ({fp.rating_count})</p></Card>}
      </div>

      {fp && (
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Card><p className="text-muted">المسمى الوظيفي</p><p>{fp.job_title ?? "—"}</p></Card>
          <Card><p className="text-muted">مستوى الخبرة</p><p>{fp.experience_level ?? "—"}</p></Card>
          <Card><p className="text-muted">السعر الابتدائي</p><p>{fp.starting_price ?? "—"}</p></Card>
          <Card><p className="text-muted">الطلبات المكتملة</p><p>{fp.completed_orders_count}</p></Card>
        </div>
      )}

      {fp?.skills?.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm text-muted">المهارات</h2>
          <div className="flex flex-wrap gap-2">
            {fp.skills.map((s: string) => <Badge key={s}>{s}</Badge>)}
          </div>
        </div>
      )}
    </div>
  );
}
