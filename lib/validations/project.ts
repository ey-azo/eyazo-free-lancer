import { z } from "zod";

export const projectSchema = z
  .object({
    title: z.string().min(10).max(120),
    description: z.string().min(30).max(5000),
    category_id: z.string().uuid("اختر تصنيفًا"),
    required_skills: z.array(z.string()).max(20).default([]),
    budget_min: z.number().nonnegative().optional(),
    budget_max: z.number().nonnegative().optional(),
    deadline: z.string().optional(),
  })
  .refine(
    (d) => d.budget_min === undefined || d.budget_max === undefined || d.budget_max >= d.budget_min,
    { message: "الحد الأقصى للميزانية يجب أن يكون أكبر من أو يساوي الحد الأدنى", path: ["budget_max"] }
  );
export type ProjectInput = z.infer<typeof projectSchema>;
