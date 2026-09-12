import { z } from "zod";

export const reportSchema = z.object({
  target_type: z.enum(["USER", "SERVICE", "PROJECT", "MESSAGE", "REVIEW"]),
  target_id: z.string().uuid(),
  reason: z.string().min(5).max(200),
  description: z.string().max(2000).optional(),
});
export type ReportInput = z.infer<typeof reportSchema>;
