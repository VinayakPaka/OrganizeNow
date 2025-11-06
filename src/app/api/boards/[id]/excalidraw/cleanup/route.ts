import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { authenticateRequest, unauthorizedResponse, errorResponse, successResponse } from '@/lib/middleware/auth';

/**
 * DELETE /api/boards/:id/excalidraw/cleanup
 * Clean up duplicate excalidraw_data blocks, keeping only the most recent one
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  try {
    const { id } = await params;

    console.log(`[Cleanup] Starting cleanup for board ${id}`);

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

    // Get all excalidraw_data blocks for this board
    const { data: blocks, error: blocksError } = await supabaseAdmin
      .from('content_blocks')
      .select('id, updated_at')
      .eq('board_id', id)
      .eq('content_type', 'excalidraw_data')
      .order('updated_at', { ascending: false });

    if (blocksError) {
      console.error('[Cleanup] Error fetching blocks:', blocksError);
      return errorResponse('Failed to fetch blocks', 500);
    }

    if (!blocks || blocks.length === 0) {
      return successResponse({ message: 'No blocks to clean up', deletedCount: 0 });
    }

    console.log(`[Cleanup] Found ${blocks.length} excalidraw_data blocks`);

    // Keep the most recent one (first in the sorted list)
    const blocksToDelete = blocks.slice(1);

    if (blocksToDelete.length === 0) {
      return successResponse({ message: 'Only one block found, no cleanup needed', deletedCount: 0 });
    }

    console.log(`[Cleanup] Keeping block ${blocks[0].id}, deleting ${blocksToDelete.length} duplicates`);

    // Delete all duplicate blocks
    const idsToDelete = blocksToDelete.map(b => b.id);
    const { error: deleteError } = await supabaseAdmin
      .from('content_blocks')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error('[Cleanup] Error deleting blocks:', deleteError);
      return errorResponse('Failed to delete duplicate blocks', 500);
    }

    console.log(`[Cleanup] Successfully deleted ${blocksToDelete.length} duplicate blocks`);

    return successResponse({
      message: 'Cleanup completed successfully',
      deletedCount: blocksToDelete.length,
      keptBlockId: blocks[0].id
    });
  } catch (error: any) {
    console.error('[Cleanup] Unexpected error:', error);
    return errorResponse(`Internal server error: ${error.message}`, 500);
  }
}
