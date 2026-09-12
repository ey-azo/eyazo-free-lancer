import { z } from "zod";

export const manualPaymentConfirmSchema = z.object({
  order_id: z.string().uuid(),
  transaction_reference: z.string().min(3, "رقم العملية مطلوب").max(100),
});
export type ManualPaymentConfirmInput = z.infer<typeof manualPaymentConfirmSchema>;
