import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * قبول عرض (Proposal) وإنشاء Order — القسم 19: "إنشاء Order يجب أن يتم بأمان
 * من Server فقط. ممنوع إنشاء الطلب من Frontend مباشرة."
 * كل القيم المالية (السعر، العمولة، أرباح الفريلانسر) تُحسب هنا فقط على
 * السيرفر، ولا تُقرأ أي قيمة مالية من الطلب القادم من العميل.
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { data: proposal } = await supabase
    .from("proposals")
    .select("*, projects!inner(id, client_id, status)")
    .eq("id", params.id)
    .single();

  if (!proposal) return NextResponse.json({ error: "العرض غير موجود" }, { status: 404 });

  // فقط صاحب المشروع يمكنه قبول العرض — تحقق صريح رغم وجود RLS كطبقة إضافية
  if (proposal.projects.client_id !== user.id) {
    return NextResponse.json({ error: "غير مصرح بهذا الإجراء" }, { status: 403 });
  }
  if (proposal.status !== "PENDING") {
    return NextResponse.json({ error: "لا يمكن قبول هذا العرض في حالته الحالية" }, { status: 409 });
  }

  const admin = createAdminClient();

  const { data: settings } = await admin.from("platform_settings").select("commission_percentage").single();
  const commissionPercentage = settings?.commission_percentage ?? 0;

  const price = Number(proposal.price);
  const platformFee = Math.round(price * (commissionPercentage / 100) * 100) / 100;
  const freelancerEarnings = Math.round((price - platformFee) * 100) / 100;

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      client_id: proposal.projects.client_id,
      freelancer_id: proposal.freelancer_id,
      project_id: proposal.projects.id,
      proposal_id: proposal.id,
      price,
      platform_fee: platformFee,
      freelancer_earnings: freelancerEarnings,
      status: "PENDING_PAYMENT",
    })
    .select()
    .single();

  if (orderError) return NextResponse.json({ error: "تعذّر إنشاء الطلب" }, { status: 500 });

  await admin.from("proposals").update({ status: "ACCEPTED" }).eq("id", proposal.id);
  await admin.from("projects").update({ status: "IN_PROGRESS" }).eq("id", proposal.projects.id);
  await admin
    .from("proposals")
    .update({ status: "REJECTED" })
    .eq("project_id", proposal.projects.id)
    .neq("id", proposal.id);

  await admin.from("notifications").insert({
    user_id: proposal.freelancer_id,
    type: "PROPOSAL_ACCEPTED",
    title: "تم قبول عرضك",
    link: `/dashboard/freelancer/orders/${order.id}`,
  });

  return NextResponse.json({ order });
}
