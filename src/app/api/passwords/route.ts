import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { authenticateRequest, unauthorizedResponse, errorResponse, successResponse } from '@/lib/middleware/auth';
import { validateBody, passwordSchema } from '@/lib/middleware/validation';
import { encryptPassword } from '@/lib/auth/encryption';

/**
 * GET /api/passwords
 * Get all passwords for authenticated user
 */
export async function GET(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest(request);

  if (authError || !user) {
    return unauthorizedResponse(authError || 'Not authenticated');
  }

  try {
    const { data: passwords, error: fetchError } = await supabaseAdmin
      .from('passwords')
      .select('id, user_id, service_name, username, url, notes, created_at, updated_at')
      .eq('user_id', user.userId)
      .order('updated_at', { ascending: false });

    if (fetchError) {
      console.error('Fetch passwords error:', fetchError);
      return errorResponse('Failed to fetch passwords', 500);
    }

    // Note: We don't send encrypted passwords in the list view
    // Passwords are only decrypted on individual GET request
    return successResponse({ passwords: passwords || [] });
  } catch (error: any) {
    console.error('Get passwords error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/passwords
 * Create a new password entry
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
      passwordSchema
    );

    if (validationError || !validatedData) {
      return errorResponse(validationError || 'Invalid input');
    }

    const { service_name, username, password, url, notes } = validatedData;

    // Encrypt the password
    const encryptedPassword = encryptPassword(password);

    // Create password entry
    const { data: newPassword, error: createError } = await supabaseAdmin
      .from('passwords')
      .insert({
        user_id: user.userId,
        service_name,
        username,
        encrypted_password: encryptedPassword,
        url: url || null,
        notes: notes || null,
      })
      .select('id, user_id, service_name, username, url, notes, created_at, updated_at')
      .single();

    if (createError || !newPassword) {
      console.error('Create password error:', createError);
      return errorResponse('Failed to create password', 500);
    }

    return successResponse({ password: newPassword }, 201);
  } catch (error: any) {
    console.error('Create password error:', error);
    return errorResponse('Internal server error', 500);
  }
}
