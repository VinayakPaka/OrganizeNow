import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { authenticateRequest, unauthorizedResponse, errorResponse, successResponse } from '@/lib/middleware/auth';
import { validateBody, boardSchema } from '@/lib/middleware/validation';

/**
 * GET /api/boards
 * Get all boards for authenticated user
 */
export async function GET(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  try {
    const { data: boards, error: fetchError } = await supabaseAdmin
      .from('boards')
      .select('*')
      .eq('user_id', user.userId)
      .order('updated_at', { ascending: false });

    if (fetchError) {
      console.error('Fetch boards error:', fetchError);
      return errorResponse('Failed to fetch boards', 500);
    }

    return successResponse({ boards: boards || [] });
  } catch (error: any) {
    console.error('Get boards error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/boards
 * Create a new board
 */
export async function POST(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  try {
    const body = await request.json();

    // Validate request body
    const { data: validatedData, error: validationError } = await validateBody(
      body,
      boardSchema
    );

    if (validationError || !validatedData) {
      return errorResponse(validationError || 'Invalid input');
    }

    const { title, description, color, icon } = validatedData;

    // Log the data being inserted for debugging
    console.log('Creating board with data:', {
      user_id: user.userId,
      title,
      description: description || null,
      color: color || null,
      icon: icon || null,
    });

    // First verify the user exists
    const { data: userExists, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', user.userId)
      .single();

    console.log('User check result:', { userExists, userCheckError });

    if (userCheckError || !userExists) {
      console.error('User does not exist in database:', user.userId);
      return errorResponse('User not found in database. Please logout and login again.', 401);
    }

    // Create board
    const { data: newBoard, error: createError } = await supabaseAdmin
      .from('boards')
      .insert({
        user_id: user.userId,
        title,
        description: description || null,
        color: color || null,
        icon: icon || null,
      })
      .select()
      .single();

    if (createError || !newBoard) {
      console.error('Create board error details:', {
        error: createError,
        message: createError?.message,
        details: createError?.details,
        hint: createError?.hint,
        code: createError?.code,
      });
      return errorResponse(`Failed to create board: ${createError?.message || 'Unknown error'}`, 500);
    }

    console.log('Board created successfully:', newBoard);
    return successResponse({ board: newBoard }, 201);
  } catch (error: any) {
    console.error('Unexpected create board error:', error);
    return errorResponse(`Internal server error: ${error.message}`, 500);
  }
}
