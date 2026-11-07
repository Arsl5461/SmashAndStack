const { z } = require('zod');

const productLine = z.object({
  productId: z.string().optional(),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
});

const saleFields = z.object({
  storeId: z.string().min(1),
  orderReference: z.string().optional(),
  customerName: z.string().optional(),
  products: z.array(productLine).optional(),
  totalAmount: z.coerce.number().positive().optional(),
  paymentMethod: z.string().min(1),
  category: z.string().min(1),
  saleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Select a sale date'),
});

const createSaleSchema = saleFields.refine(
  (value) => (value.products && value.products.length > 0) || Boolean(value.totalAmount),
  {
    message: 'Sale amount is required',
    path: ['totalAmount'],
  }
);

const updateSaleSchema = saleFields.partial();

module.exports = { createSaleSchema, updateSaleSchema };
