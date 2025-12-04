import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { authenticateRequest, unauthorizedResponse, errorResponse, successResponse } from '@/lib/middleware/auth';
import { validateBody, blockSchema } from '@/lib/middleware/validation';

/**
 * POST /api/boards/[id]/blocks
 * Create a new content block in a board
 */
export async function POST(
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
      blockSchema
    );

    if (validationError || !validatedData) {
      return errorResponse(validationError || 'Invalid input');
    }

    // Verify board belongs to user
    const { data: board } = await supabaseAdmin
      .from('boards')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.userId)
      .single();

    if (!board) {
      return errorResponse('Board not found', 404);
    }

    // Create block
    const { data: newBlock, error: createError } = await supabaseAdmin
      .from('content_blocks')
      .insert({
        user_id: user.userId,
        board_id: id,
        content_type: validatedData.content_type,
        content: validatedData.content,
        position_x: validatedData.position_x || 0,
        position_y: validatedData.position_y || 0,
        position_index: validatedData.position_index || 0,
      })
      .select()
      .single();

    if (createError || !newBlock) {
      console.error('Create block error:', createError);
      return errorResponse('Failed to create block', 500);
    }

    return successResponse({ block: newBlock }, 201);
  } catch (error: any) {
    console.error('Create block error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * PUT /api/boards/[id]/blocks
 * Bulk update content blocks (for batch operations)
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
    const { blocks } = body;

    if (!Array.isArray(blocks)) {
      return errorResponse('Blocks must be an array');
    }

    // Verify board belongs to user
    const { data: board } = await supabaseAdmin
      .from('boards')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.userId)
      .single();

    if (!board) {
      return errorResponse('Board not found', 404);
    }

    // Update each block
    const updatePromises = blocks.map((block: any) => {
      return supabaseAdmin
        .from('content_blocks')
        .update({
          content: block.content,
          position_x: block.position_x,
          position_y: block.position_y,
          position_index: block.position_index,
          updated_at: new Date().toISOString(),
        })
        .eq('id', block.id)
        .eq('user_id', user.userId)
        .select();
    });

    const results = await Promise.all(updatePromises);

    return successResponse({
      message: 'Blocks updated successfully',
      blocks: results.map(r => r.data).flat()
    });
  } catch (error: any) {
    console.error('Update blocks error:', error);
    return errorResponse('Internal server error', 500);
  }
}
