import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { manualPaymentConfirmSchema } from "@/lib/validations/payment";

/**
 * "أنا حولت" — القسم 40: لا يجعل الطلب Paid مباشرة، بل PENDING_MANUAL_CONFIRMATION
 * وينتظر مراجعة Admin (القسم 41). العميل يرفع صورة الإثبات بشكل منفصل عبر
 * Supabase Storage (Signed URL) ويمرر مسارها هنا.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json();
  const parsed = manualPaymentConfirmSchema.safeParse({ ...body, order_id: params.id });
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  const { data: order } = await supabase.from("orders").select("*").eq("id", params.id).single();
  if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  if (order.client_id !== user.id) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  if (order.status !== "PENDING_PAYMENT") {
    return NextResponse.json({ error: "لا يمكن تأكيد الدفع في هذه الحالة" }, { status: 409 });
  }

  const { proof_storage_path } = body as { proof_storage_path?: string };

  const { error } = await supabase.from("payments").insert({
    order_id: order.id,
    amount: order.price,
    transaction_reference: parsed.data.transaction_reference,
    proof_storage_path: proof_storage_path ?? null,
    status: "PENDING_MANUAL_CONFIRMATION",
  });

  if (error) return NextResponse.json({ error: "تعذّر تسجيل بيانات التحويل" }, { status: 500 });

  return NextResponse.json({ status: "PENDING_MANUAL_CONFIRMATION" });
}
