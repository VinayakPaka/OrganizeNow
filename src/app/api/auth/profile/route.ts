import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { authenticateRequest, unauthorizedResponse, errorResponse, successResponse } from '@/lib/middleware/auth';

/**
 * PATCH /api/auth/profile
 * Update user profile (name and profile picture)
 */
export async function PATCH(request: NextRequest) {
  // Authenticate request
  const { user: authUser, error: authError } = await authenticateRequest(request);

  if (authError || !authUser) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return errorResponse('Invalid JSON in request body', 400);
    }

    const { name, profilePicture } = body;

    // Validate input
    if (name === undefined && profilePicture === undefined) {
      return errorResponse('At least one field (name or profilePicture) must be provided', 400);
    }

    if (name !== undefined && typeof name !== 'string') {
      return errorResponse('Name must be a string', 400);
    }

    if (name !== undefined && typeof name === 'string' && name.trim() === '') {
      return errorResponse('Name cannot be empty', 400);
    }

    if (profilePicture !== null && profilePicture !== undefined && typeof profilePicture !== 'string') {
      return errorResponse('Profile picture must be a string or null', 400);
    }

    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (profilePicture !== undefined) updateData.profile_picture = profilePicture;

    // Update user in database
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', authUser.userId)
      .select('id, email, name, profile_picture, created_at')
      .single();

    if (updateError || !updatedUser) {
      console.error('Profile update error:', updateError);
      return errorResponse('Failed to update profile', 500);
    }

    return successResponse({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        profilePicture: updatedUser.profile_picture,
        createdAt: updatedUser.created_at,
      },
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return errorResponse('Internal server error', 500);
  }
}
