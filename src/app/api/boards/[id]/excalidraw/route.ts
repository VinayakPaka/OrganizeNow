import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { authenticateRequest, unauthorizedResponse, errorResponse, successResponse } from '@/lib/middleware/auth';

/**
 * PUT /api/boards/:id/excalidraw
 * Save Excalidraw canvas data
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { elements, appState, files } = body;

    console.log(`[Excalidraw Save] Attempting to save ${elements?.length || 0} elements for board ${id}`);
    console.log(`[Excalidraw Save] User ID: ${user.userId}`);

    if (!elements || elements.length === 0) {
      console.log('[Excalidraw Save] Saving empty canvas - all elements have been deleted');
    }

    // First check if board belongs to user
    const { data: board, error: boardError } = await supabaseAdmin
      .from('boards')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.userId)
      .single();

    if (boardError) {
      console.error('[Excalidraw Save] Board query error:', boardError);
      return errorResponse(`Board query failed: ${boardError.message}`, 404);
    }

    if (!board) {
      console.error('[Excalidraw Save] Board not found for user');
      return errorResponse('Board not found or unauthorized', 404);
    }

    console.log('[Excalidraw Save] Board verified, checking for existing block...');

    // Check if excalidraw data block exists
    // Use maybeSingle() instead of single() to handle multiple results gracefully
    const { data: existingBlock, error: blockError } = await supabaseAdmin
      .from('content_blocks')
      .select('id')
      .eq('board_id', id)
      .eq('content_type', 'excalidraw_data')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (blockError) {
      console.error('[Excalidraw Save] Block query error:', blockError);
    }

    if (existingBlock) {
      console.log('[Excalidraw Save] Updating existing block:', existingBlock.id);
      // Update existing block
      const { error: updateError } = await supabaseAdmin
        .from('content_blocks')
        .update({
          content: { elements, appState, files },
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingBlock.id);

      if (updateError) {
        console.error('[Excalidraw Save] Update error:', updateError);
        return errorResponse(`Failed to update canvas data: ${updateError.message}`, 500);
      }
      console.log('[Excalidraw Save] Block updated successfully');
    } else {
      console.log('[Excalidraw Save] Creating new block...');
      // Create new block
      const { data: newBlock, error: createError } = await supabaseAdmin
        .from('content_blocks')
        .insert({
          board_id: id,
          user_id: user.userId,
          content_type: 'excalidraw_data',
          content: { elements, appState, files },
          position_x: 0,
          position_y: 0,
          position_index: 0,
        })
        .select();

      if (createError) {
        console.error('[Excalidraw Save] Create error:', createError);
        return errorResponse(`Failed to save canvas data: ${createError.message}`, 500);
      }
      console.log('[Excalidraw Save] Block created successfully:', newBlock);
    }

    console.log('[Excalidraw Save] Save operation completed successfully');
    return successResponse({ message: 'Canvas saved successfully' });
  } catch (error: any) {
    console.error('[Excalidraw Save] Unexpected error:', error);
    return errorResponse(`Internal server error: ${error.message}`, 500);
  }
}
