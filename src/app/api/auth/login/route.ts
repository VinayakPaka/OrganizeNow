import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { validateBody, loginSchema } from '@/lib/middleware/validation';
import { generateToken, setAuthCookie } from '@/lib/auth/jwt';
import { errorResponse, successResponse } from '@/lib/middleware/auth';

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const { data: validatedData, error: validationError } = await validateBody(
      body,
      loginSchema
    );

    if (validationError || !validatedData) {
      return errorResponse(validationError || 'Invalid input');
    }

    const { email, password } = validatedData;

    // Find user by email
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, password_hash, profile_picture, created_at')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Create response
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: user.profile_picture,
      },
      token,
    });

    // Set auth cookie on response
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}
