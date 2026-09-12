import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRole } from "@/lib/rbac";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Props { params: { id: string } }

export default async function ProjectDetailPage({ params }: Props) {
  const supabase = createClient();
  const user = await getCurrentUserWithRole();

  const { data: project } = await supabase
    .from("projects")
    .select("*, profiles:client_id(full_name, username)")
    .eq("id", params.id)
    .single();

  if (!project) notFound();

  // RLS تمنع أصلًا وصول من ليس له صلاحية رؤية هذا المشروع، لكن نتحقق أيضًا هنا
  // لعرض رسالة واضحة بدل صفحة فارغة.
  const isOwner = user?.id === project.client_id;

  let myProposal = null;
  if (user?.role === "FREELANCER") {
    const { data } = await supabase
      .from("proposals")
      .select("*")
      .eq("project_id", project.id)
      .eq("freelancer_id", user.id)
      .maybeSingle();
    myProposal = data;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <Badge>{project.status}</Badge>
      </div>
      <p className="text-sm text-muted">
        بواسطة {project.profiles?.full_name} (@{project.profiles?.username})
      </p>
      <p className="mt-6 whitespace-pre-line text-sm leading-7">{project.description}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <Card><p className="text-muted">الميزانية</p><p>{project.budget_min ?? "—"} - {project.budget_max ?? "—"} ج.م</p></Card>
        <Card><p className="text-muted">الموعد النهائي</p><p>{project.deadline ?? "—"}</p></Card>
        <Card><p className="text-muted">المهارات المطلوبة</p><p>{(project.required_skills ?? []).join("، ") || "—"}</p></Card>
      </div>

      {user?.role === "FREELANCER" && !isOwner && (
        <Card className="mt-8">
          <p className="mb-2 font-medium">تقديم عرض</p>
          {myProposal ? (
            <p className="text-sm text-muted">لقد قدّمت عرضًا بالفعل بحالة: {myProposal.status}</p>
          ) : (
            <p className="text-sm text-muted">نموذج تقديم العرض (رسالة، سعر، مدة تسليم) — يُرسل عبر Server Action آمن.</p>
          )}
        </Card>
      )}
    </div>
  );
}
