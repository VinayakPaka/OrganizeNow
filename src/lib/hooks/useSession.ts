import { useEffect, useRef, useState, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UseSessionOptions {
  onError?: (error: Error) => void;
  onAuthStateChange?: (session: Session | null) => void;
}

export function useSession(options: UseSessionOptions = {}) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (isMountedRef.current) {
        setSession(currentSession);
        options.onAuthStateChange?.(currentSession);
      }
    } catch (err) {
      console.error('Error getting session:', err);
      if (isMountedRef.current) {
        setError(err as Error);
        options.onError?.(err as Error);

        // Retry after delay if not authenticated
        if (!session && !retryTimeoutRef.current) {
          retryTimeoutRef.current = setTimeout(() => {
            retryTimeoutRef.current = undefined;
            if (isMountedRef.current) {
              handleSession();
            }
          }, 5000);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [options]); // Removed 'session' from dependency array

  useEffect(() => {
    handleSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (isMountedRef.current) {
          setSession(currentSession);
          options.onAuthStateChange?.(currentSession);

          // Clear any retry timeouts on successful auth change
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = undefined;
          }
        }
      }
    );

    return () => {
      isMountedRef.current = false;
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      subscription.unsubscribe();
    };
  }, [handleSession, options]);

  return {
    session,
    error,
    loading,
    isAuthenticated: !!session,
  };
}


