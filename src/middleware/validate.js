const { ZodError } = require('zod');

/**
 * Validation middleware using Zod
 * Validates request body against a Zod schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Parse and validate the request body
      const validatedData = schema.parse(req.body);

      // Replace req.body with validated/transformed data
      req.body = validatedData;

      next();
    } catch (error) {
      // Zod validation error (Zod v3+ uses 'issues')
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages
        });
      }

      // Unknown error - log it for debugging
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

module.exports = validate;
