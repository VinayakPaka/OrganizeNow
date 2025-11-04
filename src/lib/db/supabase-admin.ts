import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // In production, use service role key

/**
 * Supabase admin client for server-side operations
 * This bypasses Row Level Security (RLS) policies
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
});

/**
 * Helper to execute database queries with error handling
 */
export async function executeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await queryFn();

    if (error) {
      console.error('Database query error:', error);
      return { data: null, error: error.message || 'Database query failed' };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Unexpected error in database query:', error);
    return { data: null, error: error.message || 'Unexpected error occurred' };
  }
}
