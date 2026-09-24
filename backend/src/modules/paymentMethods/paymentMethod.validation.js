const { z } = require('zod');

const createPaymentMethodSchema = z.object({
  name: z.string().min(2).max(60),
  isActive: z.boolean().optional(),
});

const updatePaymentMethodSchema = createPaymentMethodSchema.partial();

module.exports = { createPaymentMethodSchema, updatePaymentMethodSchema };
