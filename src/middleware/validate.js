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
      // Zod validation error
      if (error.errors) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages
        });
      }

      // Unknown error
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

module.exports = validate;
