import { z } from "zod";

export const proposalSchema = z.object({
  project_id: z.string().uuid(),
  message: z.string().min(20, "الرسالة قصيرة جدًا").max(2000),
  price: z.number().positive("السعر مطلوب"),
  delivery_days: z.number().int().positive("مدة التسليم مطلوبة"),
});
export type ProposalInput = z.infer<typeof proposalSchema>;
