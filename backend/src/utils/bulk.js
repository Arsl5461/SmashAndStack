const { z } = require('zod');

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500),
});

module.exports = {
  bulkDeleteSchema,
};
