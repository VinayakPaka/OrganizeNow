import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { authenticateRequest, unauthorizedResponse, errorResponse, successResponse } from '@/lib/middleware/auth';
import { validateBody, pageSchema } from '@/lib/middleware/validation';

/**
 * GET /api/pages
 * Get all pages for authenticated user
 */
export async function GET(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  try {
    const { data: pages, error: fetchError } = await supabaseAdmin
      .from('pages')
      .select('*')
      .eq('user_id', user.userId)
      .order('updated_at', { ascending: false });

    if (fetchError) {
      console.error('Fetch pages error:', fetchError);
      return errorResponse('Failed to fetch pages', 500);
    }

    return successResponse({ pages: pages || [] });
  } catch (error: any) {
    console.error('Get pages error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/pages
 * Create a new page
 */
export async function POST(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  try {
    const body = await request.json();

    // Validate request body
    const { data: validatedData, error: validationError } = await validateBody(
      body,
      pageSchema
    );

    if (validationError || !validatedData) {
      return errorResponse(validationError || 'Invalid input');
    }

    const { title, content, icon, is_archived } = validatedData;

    // Create page
    const { data: newPage, error: createError } = await supabaseAdmin
      .from('pages')
      .insert({
        user_id: user.userId,
        title,
        content: content || '',
        icon: icon || null,
        is_archived: is_archived || false,
      })
      .select()
      .single();

    if (createError || !newPage) {
      console.error('Create page error:', createError);
      return errorResponse('Failed to create page', 500);
    }

    return successResponse({ page: newPage }, 201);
  } catch (error: any) {
    console.error('Create page error:', error);
    return errorResponse('Internal server error', 500);
  }
}
