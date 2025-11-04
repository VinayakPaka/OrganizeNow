import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { authenticateRequest, unauthorizedResponse, errorResponse, successResponse } from '@/lib/middleware/auth';

/**
 * GET /api/search?q=query
 * Unified search across pages, boards, and passwords
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

    // Search pages
    const pagesPromise = supabaseAdmin
      .from('pages')
      .select('id, title, content, icon, created_at, updated_at')
      .eq('user_id', user.userId)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('updated_at', { ascending: false })
      .limit(10);

    // Search boards
    const boardsPromise = supabaseAdmin
      .from('boards')
      .select('id, title, description, color, icon, created_at, updated_at')
      .eq('user_id', user.userId)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('updated_at', { ascending: false })
      .limit(10);

    // Search passwords (by service name and username)
    const passwordsPromise = supabaseAdmin
      .from('passwords')
      .select('id, service_name, username, url, notes, created_at, updated_at')
      .eq('user_id', user.userId)
      .or(`service_name.ilike.%${query}%,username.ilike.%${query}%`)
      .order('updated_at', { ascending: false })
      .limit(10);

    // Execute all searches in parallel
    const [pagesResult, boardsResult, passwordsResult] = await Promise.all([
      pagesPromise,
      boardsPromise,
      passwordsPromise,
    ]);

    // Handle errors
    if (pagesResult.error) {
      console.error('Search pages error:', pagesResult.error);
    }
    if (boardsResult.error) {
      console.error('Search boards error:', boardsResult.error);
    }
    if (passwordsResult.error) {
      console.error('Search passwords error:', passwordsResult.error);
    }

    // Format results with type indicators
    const pages = (pagesResult.data || []).map((page) => ({
      ...page,
      type: 'page' as const,
    }));

    const boards = (boardsResult.data || []).map((board) => ({
      ...board,
      type: 'board' as const,
    }));

    const passwords = (passwordsResult.data || []).map((password) => ({
      ...password,
      type: 'password' as const,
    }));

    // Combine all results
    const results = [...pages, ...boards, ...passwords];

    return successResponse({
      query,
      results,
      count: {
        pages: pages.length,
        boards: boards.length,
        passwords: passwords.length,
        total: results.length,
      },
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return errorResponse('Internal server error', 500);
  }
}
