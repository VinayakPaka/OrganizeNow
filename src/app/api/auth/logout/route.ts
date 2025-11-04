import { NextRequest } from 'next/server';
import { removeAuthCookie } from '@/lib/auth/jwt';
import { successResponse } from '@/lib/middleware/auth';

/**
 * POST /api/auth/logout
 * Logout user by removing auth cookie
 */
export async function POST(request: NextRequest) {
  await removeAuthCookie();

  return successResponse({
    message: 'Logout successful',
  });
}
