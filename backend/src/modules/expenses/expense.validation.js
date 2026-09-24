const { z } = require('zod');

const createExpenseSchema = z.object({
  storeId: z.string().min(1),
  title: z.string().min(2),
  description: z.string().optional(),
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
  paymentMethod: z.string().min(1),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Select an expense date'),
});

const updateExpenseSchema = createExpenseSchema.partial();

module.exports = { createExpenseSchema, updateExpenseSchema };
