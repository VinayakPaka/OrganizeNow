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
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  // Await params in Next.js 15+
  const { id } = await params;

  try {
    // Get board
    const { data: board, error: fetchError } = await supabaseAdmin
      .from('boards')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.userId)
      .single();

    if (fetchError || !board) {
      return errorResponse('Board not found', 404);
    }

    // Get all content blocks for this board
    // Order by updated_at DESC first to get newest excalidraw_data first
    const { data: blocks, error: blocksError } = await supabaseAdmin
      .from('content_blocks')
      .select('*')
      .eq('board_id', id)
      .order('updated_at', { ascending: false });

    if (blocksError) {
      console.error('Fetch blocks error:', blocksError);
      // Continue without blocks if fetch fails
    }

    // Filter to keep only the most recent excalidraw_data block if duplicates exist
    const filteredBlocks = blocks ? (() => {
      const excalidrawBlocks: any[] = [];
      const otherBlocks: any[] = [];
      let foundExcalidraw = false;

      blocks.forEach((block: any) => {
        if (block.content_type === 'excalidraw_data') {
          if (!foundExcalidraw) {
            // Keep only the first (most recent) excalidraw_data block
            excalidrawBlocks.push(block);
            foundExcalidraw = true;
          }
        } else {
          otherBlocks.push(block);
        }
      });

      return [...excalidrawBlocks, ...otherBlocks];
    })() : [];

    if (blocks && blocks.length > filteredBlocks.length) {
      console.log(`[Board GET] Filtered ${blocks.length - filteredBlocks.length} duplicate excalidraw_data blocks`);
    }

    return successResponse({
      board,
      blocks: filteredBlocks
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  // Await params in Next.js 15+
  const { id } = await params;

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
      .eq('id', id)
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  // Await params in Next.js 15+
  const { id } = await params;

  try {
    console.log(`[Board Delete] Starting deletion of board ${id}`);

    // First verify the board belongs to the user
    const { data: board, error: boardError } = await supabaseAdmin
      .from('boards')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.userId)
      .single();

    if (boardError || !board) {
      console.error('[Board Delete] Board not found or unauthorized:', boardError);
      return errorResponse('Board not found or unauthorized', 404);
    }

    // Get all content block IDs to delete in batches
    const { data: blocksData, error: blocksError } = await supabaseAdmin
      .from('content_blocks')
      .select('id')
      .eq('board_id', id);

    if (blocksError) {
      console.error('[Board Delete] Error fetching blocks:', blocksError);
      return errorResponse(`Failed to fetch content blocks: ${blocksError.message}`, 500);
    }

    const blockIds = blocksData || [];
    console.log(`[Board Delete] Found ${blockIds.length} content blocks to delete`);

    // Delete content blocks in batches to avoid timeout
    if (blockIds.length > 0) {
      const BATCH_SIZE = 100; // Delete 100 blocks at a time
      const totalBatches = Math.ceil(blockIds.length / BATCH_SIZE);
      console.log(`[Board Delete] Deleting in ${totalBatches} batches of ${BATCH_SIZE}...`);

      const startTime = Date.now();

      for (let i = 0; i < blockIds.length; i += BATCH_SIZE) {
        const batch = blockIds.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

        console.log(`[Board Delete] Deleting batch ${batchNumber}/${totalBatches} (${batch.length} blocks)...`);

        const { error: batchDeleteError } = await supabaseAdmin
          .from('content_blocks')
          .delete()
          .in('id', batch.map(b => b.id));

        if (batchDeleteError) {
          console.error(`[Board Delete] Error deleting batch ${batchNumber}:`, batchDeleteError);
          return errorResponse(`Failed to delete content blocks (batch ${batchNumber}): ${batchDeleteError.message}`, 500);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`[Board Delete] All ${blockIds.length} content blocks deleted successfully in ${duration}ms`);
    }

    // Now delete the board
    console.log('[Board Delete] Deleting board...');
    const { error: deleteError } = await supabaseAdmin
      .from('boards')
      .delete()
      .eq('id', id)
      .eq('user_id', user.userId);

    if (deleteError) {
      console.error('[Board Delete] Error deleting board:', deleteError);
      return errorResponse(`Failed to delete board: ${deleteError.message}`, 500);
    }

    console.log('[Board Delete] Board deleted successfully');
    return successResponse({ message: 'Board deleted successfully' });
  } catch (error: any) {
    console.error('[Board Delete] Unexpected error:', error);
    return errorResponse(`Internal server error: ${error.message}`, 500);
  }
}

// Increase timeout for DELETE operations with many blocks
export const maxDuration = 60; // 60 seconds timeout
