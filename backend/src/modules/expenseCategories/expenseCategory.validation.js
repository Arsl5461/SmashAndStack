const { z } = require('zod');

const createCategorySchema = z.object({
  name: z.string().min(2).max(60),
  isActive: z.boolean().optional(),
});

const updateCategorySchema = createCategorySchema.partial();

module.exports = { createCategorySchema, updateCategorySchema };
