import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '../auth/jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Middleware to verify JWT token from cookies
 * Returns the authenticated user or null
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: JWTPayload | null; error: string | null }> {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return { user: null, error: 'No authentication token provided' };
    }

    // Verify token
    const user = verifyToken(token);

    if (!user) {
      return { user: null, error: 'Invalid or expired token' };
    }

    return { user, error: null };
  } catch (error: any) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

/**
 * Helper to create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Helper to create error response
 */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

/**
 * Helper to create success response
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}
