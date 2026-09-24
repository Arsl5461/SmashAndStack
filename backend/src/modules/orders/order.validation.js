const { z } = require('zod');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../../constants/enums');

const itemLine = z.object({
  productId: z.string().optional(),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
});

const createOrderSchema = z.object({
  storeId: z.string().min(1),
  customer: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  items: z.array(itemLine).min(1),
  status: z.enum(Object.values(ORDER_STATUS)).optional(),
  paymentStatus: z.enum(Object.values(PAYMENT_STATUS)).optional(),
  paymentMethod: z.string().min(1).optional(),
  orderDate: z.string().optional(),
});

const updateOrderSchema = createOrderSchema.partial();

module.exports = { createOrderSchema, updateOrderSchema };
