const { z } = require('zod');
const { STORE_STATUS } = require('../../constants/enums');

const createStoreSchema = z.object({
  name: z.string().min(2),
  storeCode: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  manager: z.string().optional().nullable(),
  openingDate: z.string().optional(),
  status: z.enum(Object.values(STORE_STATUS)).optional(),
});

const updateStoreSchema = createStoreSchema.partial();

const statusSchema = z.object({
  status: z.enum(Object.values(STORE_STATUS)),
});

const assignUsersSchema = z.object({
  userIds: z.array(z.string()).default([]),
});

module.exports = {
  createStoreSchema,
  updateStoreSchema,
  statusSchema,
  assignUsersSchema,
};
