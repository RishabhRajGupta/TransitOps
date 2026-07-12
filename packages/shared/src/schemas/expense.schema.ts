import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { expenses } from "@transitops/db/schema";

export const expenseSelectSchema = createSelectSchema(expenses);

export const createExpenseSchema = createInsertSchema(expenses, {
  amount: z.string().transform((v) => Number(v)).pipe(z.number().positive()),
  incurredAt: z.string().date(),
}).omit({
  id: true,
  createdBy: true,
});

export type Expense = z.infer<typeof expenseSelectSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
