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

    // First check if board belongs to user
    const { data: board, error: boardError } = await supabaseAdmin
      .from('boards')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.userId)
      .single();

    if (boardError || !board) {
      return errorResponse('Board not found or unauthorized', 404);
    }

    // Check if excalidraw data block exists
    const { data: existingBlock } = await supabaseAdmin
      .from('content_blocks')
      .select('id')
      .eq('board_id', id)
      .eq('content_type', 'excalidraw_data')
      .single();

    if (existingBlock) {
      // Update existing block
      const { error: updateError } = await supabaseAdmin
        .from('content_blocks')
        .update({
          content: { elements, appState, files },
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingBlock.id);

      if (updateError) {
        console.error('Update excalidraw data error:', updateError);
        return errorResponse('Failed to update canvas data', 500);
      }
    } else {
      // Create new block
      const { error: createError } = await supabaseAdmin
        .from('content_blocks')
        .insert({
          board_id: id,
          user_id: user.userId,
          content_type: 'excalidraw_data',
          content: { elements, appState, files },
          position_x: 0,
          position_y: 0,
          position_index: 0,
        });

      if (createError) {
        console.error('Create excalidraw data error:', createError);
        return errorResponse('Failed to save canvas data', 500);
      }
    }

    return successResponse({ message: 'Canvas saved successfully' });
  } catch (error: any) {
    console.error('Save excalidraw data error:', error);
    return errorResponse('Internal server error', 500);
  }
}
