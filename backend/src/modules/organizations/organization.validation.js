const { z } = require('zod');

const updateOrganizationSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo: z.string().optional(),
});

module.exports = {
  updateOrganizationSchema,
};
