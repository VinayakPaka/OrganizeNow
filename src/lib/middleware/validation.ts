import { z } from 'zod';

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T>(
  body: any,
  schema: z.ZodSchema<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = schema.parse(body);
    return { data, error: null };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return { data: null, error: errorMessages.join(', ') };
    }
    return { data: null, error: 'Validation failed' };
  }
}

// Common validation schemas
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const pageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  icon: z.string().optional(),
});

export const boardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const passwordSchema = z.object({
  service_name: z.string().min(1, 'Service name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  url: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
});

export const blockSchema = z.object({
  board_id: z.string().uuid(),
  content_type: z.enum(['text', 'image', 'shape', 'grid']),
  content: z.record(z.any()),
  position_x: z.number().optional(),
  position_y: z.number().optional(),
  position_index: z.number().optional(),
});
