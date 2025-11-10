import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { authenticateRequest, unauthorizedResponse, errorResponse, successResponse } from '@/lib/middleware/auth';

/**
 * GET /api/tasks
 * Get all tasks for authenticated user
 */
export async function GET(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  try {
    const { data: tasks, error: fetchError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', user.userId)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('due_time', { ascending: true, nullsFirst: false });

    if (fetchError) {
      console.error('Fetch tasks error:', fetchError);
      return errorResponse('Failed to fetch tasks', 500);
    }

    return successResponse({ tasks: tasks || [] });
  } catch (error: any) {
    console.error('Get tasks error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  try {
    const body = await request.json();

    const {
      title,
      description,
      due_date,
      due_time,
      reminder_enabled = true,
      reminder_minutes_before = 15,
      priority = 'medium',
      category,
    } = body;

    // Validate required fields
    if (!title || title.trim() === '') {
      return errorResponse('Title is required', 400);
    }

    // Create task
    const { data: newTask, error: createError } = await supabaseAdmin
      .from('tasks')
      .insert({
        user_id: user.userId,
        title: title.trim(),
        description: description || null,
        due_date: due_date || null,
        due_time: due_time || null,
        reminder_enabled,
        reminder_minutes_before,
        priority,
        category: category || null,
        completed: false,
      })
      .select()
      .single();

    if (createError || !newTask) {
      console.error('Create task error:', createError);
      return errorResponse('Failed to create task', 500);
    }

    return successResponse({ task: newTask }, 201);
  } catch (error: any) {
    console.error('Create task error:', error);
    return errorResponse('Internal server error', 500);
  }
}
