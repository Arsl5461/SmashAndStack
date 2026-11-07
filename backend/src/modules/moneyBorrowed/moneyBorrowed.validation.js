const { z } = require('zod');

const createBorrowedSchema = z.object({
  storeId: z.string().min(1),
  borrowedFrom: z.string().min(2).max(120),
  amount: z.coerce.number().positive(),
  borrowedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Select a borrowed date'),
  note: z.string().max(500).optional(),
});

const updateBorrowedSchema = createBorrowedSchema.partial();

module.exports = { createBorrowedSchema, updateBorrowedSchema };
