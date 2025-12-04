import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { authenticateRequest, unauthorizedResponse, errorResponse, successResponse } from '@/lib/middleware/auth';

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export async function GET(request: NextRequest) {
  // Authenticate request
  const { user: authUser, error: authError } = await authenticateRequest(request);

  if (authError || !authUser) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  try {
    // Fetch user from database
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, profile_picture, created_at')
      .eq('id', authUser.userId)
      .single();

    if (fetchError || !user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: user.profile_picture,
        createdAt: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return errorResponse('Internal server error', 500);
  }
}
