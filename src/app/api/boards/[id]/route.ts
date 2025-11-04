import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { authenticateRequest, unauthorizedResponse, errorResponse, successResponse } from '@/lib/middleware/auth';
import { validateBody, boardSchema } from '@/lib/middleware/validation';

/**
 * GET /api/boards/[id]
 * Get a single board by ID with all its content blocks
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
    // Get board
    const { data: board, error: fetchError } = await supabaseAdmin
      .from('boards')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.userId)
      .single();

    if (fetchError || !board) {
      return errorResponse('Board not found', 404);
    }

    // Get all content blocks for this board
    const { data: blocks, error: blocksError } = await supabaseAdmin
      .from('content_blocks')
      .select('*')
      .eq('board_id', params.id)
      .order('position_index', { ascending: true });

    if (blocksError) {
      console.error('Fetch blocks error:', blocksError);
      // Continue without blocks if fetch fails
    }

    return successResponse({
      board,
      blocks: blocks || []
    });
  } catch (error: any) {
    console.error('Get board error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * PUT /api/boards/[id]
 * Update a board
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
      boardSchema.partial()
    );

    if (validationError || !validatedData) {
      return errorResponse(validationError || 'Invalid input');
    }

    // Update board
    const { data: updatedBoard, error: updateError } = await supabaseAdmin
      .from('boards')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('user_id', user.userId)
      .select()
      .single();

    if (updateError || !updatedBoard) {
      return errorResponse('Failed to update board', 500);
    }

    return successResponse({ board: updatedBoard });
  } catch (error: any) {
    console.error('Update board error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * DELETE /api/boards/[id]
 * Delete a board and all its content blocks
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
    // Delete board (content_blocks will be cascade deleted)
    const { error: deleteError } = await supabaseAdmin
      .from('boards')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.userId);

    if (deleteError) {
      console.error('Delete board error:', deleteError);
      return errorResponse('Failed to delete board', 500);
    }

    return successResponse({ message: 'Board deleted successfully' });
  } catch (error: any) {
    console.error('Delete board error:', error);
    return errorResponse('Internal server error', 500);
  }
}
