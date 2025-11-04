import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { authenticateRequest, unauthorizedResponse, errorResponse, successResponse } from '@/lib/middleware/auth';

/**
 * GET /api/passwords/search?q=serviceName
 * Search passwords by service name
 */
export async function GET(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query) {
      return errorResponse('Search query is required');
    }

    // Search passwords by service name
    const { data: passwords, error: searchError } = await supabaseAdmin
      .from('passwords')
      .select('id, user_id, service_name, username, url, notes, created_at, updated_at')
      .eq('user_id', user.userId)
      .ilike('service_name', `%${query}%`)
      .order('service_name', { ascending: true });

    if (searchError) {
      console.error('Search passwords error:', searchError);
      return errorResponse('Failed to search passwords', 500);
    }

    return successResponse({ passwords: passwords || [] });
  } catch (error: any) {
    console.error('Search passwords error:', error);
    return errorResponse('Internal server error', 500);
  }
}
