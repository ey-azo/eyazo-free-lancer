import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * "تم التحويل للفريلانسر" — القسم 42: يتم فقط من Admin Dashboard يدويًا،
 * ولا يُسمح بأي مسار آخر لتحديث حالة Payout.
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "ADMIN") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("*").eq("id", params.id).single();
  if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  if (order.status !== "COMPLETED") {
    return NextResponse.json({ error: "لا يمكن صرف الأرباح قبل اكتمال الطلب" }, { status: 409 });
  }

  const { error } = await admin.from("payouts").insert({
    order_id: order.id,
    freelancer_id: order.freelancer_id,
    amount: order.freelancer_earnings,
    status: "PAID",
    processed_by: user.id,
    paid_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: "تعذّر تسجيل التحويل" }, { status: 500 });

  await admin.from("audit_logs").insert({
    admin_id: user.id,
    action: "PAYOUT_FREELANCER",
    target_type: "order",
    target_id: order.id,
    metadata: { amount: order.freelancer_earnings },
  });

  return NextResponse.json({ status: "PAID" });
}
