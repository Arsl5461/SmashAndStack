const { z } = require('zod');
const { ALL_PERMISSIONS } = require('../../constants/permissions');

const upsertRoleSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  permissions: z.array(z.enum(ALL_PERMISSIONS)).default([]),
  isActive: z.boolean().optional(),
});

const updateRoleSchema = upsertRoleSchema.partial();

module.exports = {
  upsertRoleSchema,
  updateRoleSchema,
};
