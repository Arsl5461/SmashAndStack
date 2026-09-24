const { ValidationError } = require('../utils/AppError');

const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const payload = source === 'query' ? req.query : source === 'params' ? req.params : req.body;
    const result = schema.safeParse(payload);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ValidationError('Validation failed', errors));
    }

    if (source === 'query') {
      req.validatedQuery = result.data;
    } else if (source === 'params') {
      req.validatedParams = result.data;
    } else {
      req.body = result.data;
    }

    return next();
  };

module.exports = {
  validate,
};
