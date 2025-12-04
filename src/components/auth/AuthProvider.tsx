'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getCurrentUser } from '@/store/slices/authSlice';

/**
 * AuthProvider component
 * Checks authentication status on mount and protects routes
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Try to get current user on mount (but only for protected routes)
    if (!isAuthenticated && !isPublicRoute) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated, isPublicRoute]);

  // Redirect to login if not authenticated and trying to access protected route
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, isPublicRoute, router, pathname]);

  // Show loading state while checking auth
  if (!isPublicRoute && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on public route, don't render
  if (!isPublicRoute && !isAuthenticated && !isLoading) {
    return null;
  }

  return <>{children}</>;
}
