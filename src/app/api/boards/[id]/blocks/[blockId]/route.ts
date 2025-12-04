import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { authenticateRequest, unauthorizedResponse, errorResponse, successResponse } from '@/lib/middleware/auth';

/**
 * PUT /api/boards/[id]/blocks/[blockId]
 * Update a single content block
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  // Await params in Next.js 15+
  const { id, blockId } = await params;

  try {
    const body = await request.json();

    // Update block
    const { data: updatedBlock, error: updateError } = await supabaseAdmin
      .from('content_blocks')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', blockId)
      .eq('user_id', user.userId)
      .eq('board_id', id)
      .select()
      .single();

    if (updateError || !updatedBlock) {
      return errorResponse('Failed to update block', 500);
    }

    return successResponse({ block: updatedBlock });
  } catch (error: any) {
    console.error('Update block error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * DELETE /api/boards/[id]/blocks/[blockId]
 * Delete a content block
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  // Await params in Next.js 15+
  const { id, blockId } = await params;

  try {
    const { error: deleteError } = await supabaseAdmin
      .from('content_blocks')
      .delete()
      .eq('id', blockId)
      .eq('user_id', user.userId)
      .eq('board_id', id);

    if (deleteError) {
      console.error('Delete block error:', deleteError);
      return errorResponse('Failed to delete block', 500);
    }

    return successResponse({ message: 'Block deleted successfully' });
  } catch (error: any) {
    console.error('Delete block error:', error);
    return errorResponse('Internal server error', 500);
  }
}
