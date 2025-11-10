import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { authenticateRequest, unauthorizedResponse, errorResponse, successResponse } from '@/lib/middleware/auth';

/**
 * GET /api/tasks/[id]
 * Get a single task by ID
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
    const { data: task, error: fetchError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.userId)
      .single();

    if (fetchError || !task) {
      return errorResponse('Task not found', 404);
    }

    return successResponse({ task });
  } catch (error: any) {
    console.error('Get task error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * PUT /api/tasks/[id]
 * Update a task
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

    // Build update object with only provided fields
    const updateData: {
      updated_at: string;
      title?: string;
      description?: string;
      due_date?: string | null;
      due_time?: string | null;
      reminder_enabled?: boolean;
      reminder_minutes_before?: number;
      completed?: boolean;
      completed_at?: string | null;
      priority?: 'low' | 'medium' | 'high';
      category?: string | null;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.due_date !== undefined) updateData.due_date = body.due_date;
    if (body.due_time !== undefined) updateData.due_time = body.due_time;
    if (body.reminder_enabled !== undefined) updateData.reminder_enabled = body.reminder_enabled;
    if (body.reminder_minutes_before !== undefined) updateData.reminder_minutes_before = body.reminder_minutes_before;
    if (body.completed !== undefined) {
      updateData.completed = body.completed;
      // Only set completed_at if not explicitly provided
      if (body.completed_at === undefined) {
        updateData.completed_at = body.completed ? new Date().toISOString() : null;
      }
    }
    // Only set completed_at explicitly if completed is not being set
    if (body.completed_at !== undefined && body.completed === undefined) {
      updateData.completed_at = body.completed_at;
    }
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.category !== undefined) updateData.category = body.category;

    // Update task
    const { data: updatedTask, error: updateError } = await supabaseAdmin
      .from('tasks')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.userId)
      .select()
      .single();

    if (updateError) {
      console.error('Update task error:', updateError);
      return errorResponse('Failed to update task', 500);
    }

    if (!updatedTask) {
      return errorResponse('Task not found', 404);
    }

    return successResponse({ task: updatedTask });
  } catch (error: any) {
    console.error('Update task error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task
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
      .from('tasks')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.userId);

    if (deleteError) {
      console.error('Delete task error:', deleteError);
      return errorResponse('Failed to delete task', 500);
    }

    return successResponse({ message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('Delete task error:', error);
    return errorResponse('Internal server error', 500);
  }
}
