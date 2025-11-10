import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/db/supabase-admin';
import { validateBody, signupSchema } from '@/lib/middleware/validation';
import { generateToken, setAuthCookie } from '@/lib/auth/jwt';
import { errorResponse, successResponse } from '@/lib/middleware/auth';

/**
 * POST /api/auth/signup
 * Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return errorResponse('Invalid JSON in request body', 400);
    }

    // Validate request body
    const { data: validatedData, error: validationError } = await validateBody(
      body,
      signupSchema
    );

    if (validationError || !validatedData) {
      return errorResponse(validationError || 'Invalid input');
    }

    const { email, password, name } = validatedData;

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return errorResponse('User with this email already exists', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in database
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name: name || null,
      })
      .select('id, email, name, created_at')
      .single();

    if (createError || !newUser) {
      console.error('User creation error:', createError);
      return errorResponse('Failed to create user', 500);
    }

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
    });

    // Create response
    const response = NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
        token,
      },
      { status: 201 }
    );

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
    console.error('Signup error:', error);
    return errorResponse('Internal server error', 500);
  }
}
