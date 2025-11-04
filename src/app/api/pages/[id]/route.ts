import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { authenticateRequest, unauthorizedResponse, errorResponse, successResponse } from '@/lib/middleware/auth';
import { validateBody, pageSchema } from '@/lib/middleware/validation';

/**
 * GET /api/pages/[id]
 * Get a single page by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  try {
    const { data: page, error: fetchError } = await supabaseAdmin
      .from('pages')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.userId)
      .single();

    if (fetchError || !page) {
      return errorResponse('Page not found', 404);
    }

    return successResponse({ page });
  } catch (error: any) {
    console.error('Get page error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * PUT /api/pages/[id]
 * Update a page
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  try {
    const body = await request.json();

    // Validate request body
    const { data: validatedData, error: validationError } = await validateBody(
      body,
      pageSchema.partial() // Allow partial updates
    );

    if (validationError || !validatedData) {
      return errorResponse(validationError || 'Invalid input');
    }

    // Update page
    const { data: updatedPage, error: updateError } = await supabaseAdmin
      .from('pages')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('user_id', user.userId)
      .select()
      .single();

    if (updateError || !updatedPage) {
      return errorResponse('Failed to update page', 500);
    }

    return successResponse({ page: updatedPage });
  } catch (error: any) {
    console.error('Update page error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * DELETE /api/pages/[id]
 * Delete a page
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  try {
    const { error: deleteError } = await supabaseAdmin
      .from('pages')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.userId);

    if (deleteError) {
      console.error('Delete page error:', deleteError);
      return errorResponse('Failed to delete page', 500);
    }

    return successResponse({ message: 'Page deleted successfully' });
  } catch (error: any) {
    console.error('Delete page error:', error);
    return errorResponse('Internal server error', 500);
  }
}
