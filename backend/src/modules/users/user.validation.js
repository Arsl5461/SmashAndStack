const { z } = require('zod');

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  roleId: z.string().min(1),
  stores: z.array(z.string()).default([]),
  defaultStore: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  roleId: z.string().optional(),
  stores: z.array(z.string()).optional(),
  defaultStore: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  avatar: z.string().optional(),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
};
