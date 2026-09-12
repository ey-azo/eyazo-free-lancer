import { z } from "zod";

export const sendMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  content: z.string().min(1, "الرسالة فارغة").max(4000),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
