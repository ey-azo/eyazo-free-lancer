import { z } from "zod";

export const serviceSchema = z.object({
  title: z.string().min(10, "العنوان قصير جدًا").max(120),
  description: z.string().min(30, "الوصف قصير جدًا").max(5000),
  category_id: z.string().uuid("اختر تصنيفًا"),
  price: z.number().positive("السعر يجب أن يكون أكبر من صفر"),
  delivery_days: z.number().int().positive("مدة التسليم مطلوبة"),
  revisions: z.number().int().min(0),
  tags: z.array(z.string()).max(10).default([]),
});
export type ServiceInput = z.infer<typeof serviceSchema>;
