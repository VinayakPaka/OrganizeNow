import { useEffect, useRef, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UseRealtimeOptions {
  table: string;
  schema?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | 'TRUNCATE' | '*';
  filter?: string;
  onError?: (error: Error) => void;
  onSubscriptionError?: (error: Error) => void;
}

// Define the structure of the payload from Supabase postgres_changes
interface RealtimePostgresChangesPayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | 'TRUNCATE';
  schema: string;
  table: string;
  commit_timestamp: string;
  errors: string[];
  old: T | null; // For DELETE, old record is present
  new: T | null; // For INSERT/UPDATE, new record is present
}

export function useRealtime<T = any>(
  callback: (payload: T | null, eventType: 'INSERT' | 'UPDATE' | 'DELETE' | 'TRUNCATE') => void,
  options: UseRealtimeOptions
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const setupRealtimeSubscription = useCallback(async () => {
    try {
      // Clean up existing subscription if any
      if (channelRef.current) {
        try {
          await channelRef.current.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from channel:', error);
        }
        channelRef.current = null;
      }

      // Create new subscription
      const channel = supabase.channel('realtime')
        .on<RealtimePostgresChangesPayload<T>>(
          'postgres_changes' as any,
          {
            event: options.event || '*',
            schema: options.schema || 'public',
            table: options.table,
            filter: options.filter,
          },
          (payload: any) => {
          try {
            // Pass the relevant record and eventType to the callback
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              callback(payload.new, payload.eventType);
            } else if (payload.eventType === 'DELETE') {
              callback(payload.old, payload.eventType);
            } else { // TRUNCATE or other unexpected event types
              callback(null, payload.eventType);
            }
          } catch (error) {
            console.error('Error in callback:', error);
            options.onError?.(error as Error);
          }
        })
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
              retryTimeoutRef.current = undefined;
            }
          } else if (err) {
            console.error('Subscription error:', err);
            options.onSubscriptionError?.(err);
            
            // Retry subscription after delay
            if (!retryTimeoutRef.current) {
              retryTimeoutRef.current = setTimeout(() => {
                retryTimeoutRef.current = undefined;
                if (!isSubscribedRef.current) {
                  setupRealtimeSubscription();
                }
              }, 5000);
            }
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
      options.onSubscriptionError?.(error as Error);
      
      // Retry subscription after delay
      if (!retryTimeoutRef.current) {
        retryTimeoutRef.current = setTimeout(() => {
          retryTimeoutRef.current = undefined;
          if (!isSubscribedRef.current) {
            setupRealtimeSubscription();
          }
        }, 5000);
      }
    }
  }, [callback, options]);

  useEffect(() => {
    setupRealtimeSubscription();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from channel during cleanup:', error);
        }
        channelRef.current = null;
      }
      
      isSubscribedRef.current = false;
    };
  }, [setupRealtimeSubscription]);
}


