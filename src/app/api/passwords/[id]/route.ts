import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { authenticateRequest, unauthorizedResponse, errorResponse, successResponse } from '@/lib/middleware/auth';
import { validateBody, passwordSchema } from '@/lib/middleware/validation';
import { encryptPassword, decryptPassword } from '@/lib/auth/encryption';

/**
 * GET /api/passwords/[id]
 * Get a single password by ID (with decryption)
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
    const { data: passwordEntry, error: fetchError } = await supabaseAdmin
      .from('passwords')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.userId)
      .single();

    if (fetchError || !passwordEntry) {
      return errorResponse('Password entry not found', 404);
    }

    // Decrypt the password
    let decryptedPassword = '';
    try {
      decryptedPassword = decryptPassword(passwordEntry.encrypted_password);
    } catch (decryptError) {
      console.error('Decryption error:', decryptError);
      return errorResponse('Failed to decrypt password', 500);
    }

    return successResponse({
      password: {
        id: passwordEntry.id,
        user_id: passwordEntry.user_id,
        service_name: passwordEntry.service_name,
        username: passwordEntry.username,
        password: decryptedPassword, // Decrypted password
        url: passwordEntry.url,
        notes: passwordEntry.notes,
        created_at: passwordEntry.created_at,
        updated_at: passwordEntry.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Get password error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * PUT /api/passwords/[id]
 * Update a password entry
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
      passwordSchema.partial()
    );

    if (validationError || !validatedData) {
      return errorResponse(validationError || 'Invalid input');
    }

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    // If password is being updated, encrypt it
    if (validatedData.password) {
      updateData.encrypted_password = encryptPassword(validatedData.password);
      delete updateData.password; // Remove plain password from update
    }

    // Update password entry
    const { data: updatedPassword, error: updateError } = await supabaseAdmin
      .from('passwords')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.userId)
      .select('id, user_id, service_name, username, url, notes, created_at, updated_at')
      .single();

    if (updateError || !updatedPassword) {
      return errorResponse('Failed to update password', 500);
    }

    return successResponse({ password: updatedPassword });
  } catch (error: any) {
    console.error('Update password error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * DELETE /api/passwords/[id]
 * Delete a password entry
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
    const { error: deleteError } = await supabaseAdmin
      .from('passwords')
      .delete()
      .eq('id', id)
      .eq('user_id', user.userId);

    if (deleteError) {
      console.error('Delete password error:', deleteError);
      return errorResponse('Failed to delete password', 500);
    }

    return successResponse({ message: 'Password deleted successfully' });
  } catch (error: any) {
    console.error('Delete password error:', error);
    return errorResponse('Internal server error', 500);
  }
}
