import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "CLIENT" | "FREELANCER" | "ADMIN";

/**
 * يجلب المستخدم الحالي مع الدور من جدول profiles.
 * يُستخدم داخل Server Components / Server Actions / Route Handlers فقط.
 */
export async function getCurrentUserWithRole() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, is_banned, username, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) return null;
  return profile;
}

/**
 * يفرض أن يكون المستخدم مسجّلًا وله أحد الأدوار المسموحة، وإلا يعيد التوجيه.
 * يجب استدعاء هذه الدالة في أعلى كل صفحة/API محمية — لا يُعتمد على إخفاء
 * العناصر في الواجهة فقط.
 */
export async function requireRole(allowed: Role[]) {
  const profile = await getCurrentUserWithRole();

  if (!profile) redirect("/login");
  if (profile.is_banned) redirect("/login?banned=1");
  if (!allowed.includes(profile.role as Role)) redirect("/");

  return profile;
}
