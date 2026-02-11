const { z } = require('zod');

// Create protected member validation schema
const createMemberSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string({ required_error: 'Last name is required' })
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  relationship: z
    .string({ required_error: 'Relationship is required' })
    .min(1, 'Relationship is required'),
  birthYear: z
    .number({ required_error: 'Birth year is required' })
    .int('Birth year must be a whole number')
    .min(1900, 'Birth year must be after 1900')
    .max(new Date().getFullYear(), 'Birth year cannot be in the future'),
  status: z
    .enum(['active', 'inactive'])
    .optional()
    .default('active')
});

// Update protected member validation schema (all fields optional)
const updateMemberSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name cannot be empty')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name cannot be empty')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  relationship: z
    .string()
    .min(1, 'Relationship cannot be empty')
    .optional(),
  birthYear: z
    .number()
    .int('Birth year must be a whole number')
    .min(1900, 'Birth year must be after 1900')
    .max(new Date().getFullYear(), 'Birth year cannot be in the future')
    .optional(),
  status: z
    .enum(['active', 'inactive'])
    .optional()
});

module.exports = {
  createMemberSchema,
  updateMemberSchema
};
