import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendMessageSchema } from "@/lib/validations/message";
import { detectExternalContactAttempt, BLOCKED_MESSAGE_TEXT } from "@/lib/content-filter";

/**
 * إرسال رسالة — الفحص من محاولات مشاركة تواصل/دفع خارجي يتم هنا على السيرفر
 * فقط (القسم 25)، وليس في الواجهة. لا نمنع الرسالة نهائيًا بل نرفض حفظها
 * ونعرض الرسالة المطلوبة، مع تسجيل المخالفة لمراجعة Admin.
 */
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json();
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }
  const { conversation_id, content } = parsed.data;

  // تأكيد أن المستخدم طرف في هذه المحادثة (RLS تفرض هذا أيضًا كطبقة أساسية)
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, participant_one, participant_two")
    .eq("id", conversation_id)
    .single();

  if (!conversation || (conversation.participant_one !== user.id && conversation.participant_two !== user.id)) {
    return NextResponse.json({ error: "غير مصرح بالوصول لهذه المحادثة" }, { status: 403 });
  }

  const detection = detectExternalContactAttempt(content);

  if (detection.flagged) {
    // تُسجَّل المخالفة كرسالة مشار عليها لمراجعة Admin، ولا تُعرض للطرف الآخر
    await supabase.from("messages").insert({
      conversation_id,
      sender_id: user.id,
      content,
      is_flagged: true,
      flag_reason: detection.reason,
    });
    return NextResponse.json({ error: BLOCKED_MESSAGE_TEXT, flagged: true }, { status: 422 });
  }

  const { data: message, error } = await supabase
    .from("messages")
    .insert({ conversation_id, sender_id: user.id, content })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "تعذّر إرسال الرسالة" }, { status: 500 });

  const recipientId =
    conversation.participant_one === user.id ? conversation.participant_two : conversation.participant_one;

  await supabase.from("notifications").insert({
    user_id: recipientId,
    type: "NEW_MESSAGE",
    title: "رسالة جديدة",
    link: `/dashboard/messages/${conversation_id}`,
  });

  return NextResponse.json({ message });
}
