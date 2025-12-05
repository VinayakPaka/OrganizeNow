'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getCurrentUser } from '@/store/slices/authSlice';
import { AnimatedLoader } from '@/components/common/AnimatedLoader';

/**
 * AuthProvider component
 * Checks authentication status on mount and protects routes
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const hasCheckedAuth = useRef(false);

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/signup', '/not-found'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Valid protected routes (routes that should be protected by auth)
  const validProtectedRoutes = [
    '/dashboard',
    '/tasks',
    '/notes',
    '/calendar',
    '/vault',
    '/whiteboards',
    '/board',
    '/settings',
    '/search',
    '/ai-assistant',
  ];
  
  // Check if the current path starts with any valid route
  const isValidRoute = publicRoutes.includes(pathname) || 
                       validProtectedRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    // Try to get current user on mount for all routes
    // This ensures auth state is always up-to-date even when navigating to /
    if (!hasCheckedAuth.current && !isAuthenticated) {
      hasCheckedAuth.current = true;
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  // Handle invalid routes
  useEffect(() => {
    if (!isValidRoute && !isLoading) {
      router.push('/not-found');
    }
  }, [isValidRoute, isLoading, router]);

  // Redirect to login if not authenticated and trying to access protected route
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute && isValidRoute) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, isPublicRoute, isValidRoute, router, pathname]);

  // Show loading state while checking auth
  if (!isPublicRoute && isLoading) {
    return <AnimatedLoader message="Authenticating..." />;
  }

  // If not authenticated and not on public route, don't render
  if (!isPublicRoute && !isAuthenticated && !isLoading) {
    return null;
  }

  return <>{children}</>;
}
