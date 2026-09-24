const { z } = require('zod');
const { PRODUCT_CATEGORIES } = require('../../constants/enums');

const createProductSchema = z.object({
  storeId: z.string().optional().nullable(),
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.enum(Object.values(PRODUCT_CATEGORIES)),
  price: z.coerce.number().nonnegative(),
  costPrice: z.coerce.number().nonnegative().optional(),
  image: z.string().optional(),
  sku: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

const updateProductSchema = createProductSchema.partial();

module.exports = { createProductSchema, updateProductSchema };
