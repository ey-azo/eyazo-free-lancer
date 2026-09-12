import { z } from "zod";

export const disputeSchema = z.object({
  order_id: z.string().uuid(),
  reason: z.string().min(5).max(200),
  description: z.string().max(3000).optional(),
});
export type DisputeInput = z.infer<typeof disputeSchema>;
