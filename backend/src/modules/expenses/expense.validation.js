const { z } = require('zod');

const paymentLineSchema = z.object({
  method: z.string().min(1),
  amount: z.coerce.number().positive(),
});

function parsePaymentMethods(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

const createExpenseSchema = z
  .object({
    storeId: z.string().min(1),
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    category: z.string().min(1),
    amount: z.coerce.number().positive().optional(),
    paymentMethod: z.string().min(1).optional(),
    paymentMethods: z.preprocess(parsePaymentMethods, z.array(paymentLineSchema).min(1, 'Add at least one payment method')),
    expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Select an expense date'),
  })
  .superRefine((value, ctx) => {
    const total = value.paymentMethods.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    if (total <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Expense total must be greater than zero',
        path: ['paymentMethods'],
      });
    }
  });

const updateExpenseSchema = z.object({
  storeId: z.string().min(1).optional(),
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  amount: z.coerce.number().positive().optional(),
  paymentMethod: z.string().min(1).optional(),
  paymentMethods: z.preprocess((value) => {
    if (value === undefined || value === null || value === '') return undefined;
    return parsePaymentMethods(value);
  }, z.array(paymentLineSchema).min(1).optional()),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Select an expense date').optional(),
});

module.exports = { createExpenseSchema, updateExpenseSchema };
