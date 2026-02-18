import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type RefreshScope = 'all' | 'appointments' | 'tasks' | 'documents' | 'cases' | string;

interface RefreshContextType {
  /**
   * Trigger a refresh for specific scope(s) or all components
   */
  triggerRefresh: (scope?: RefreshScope | RefreshScope[]) => void;

  /**
   * Subscribe to refresh events for a specific scope
   * Returns true when a refresh is triggered for this scope
   */
  shouldRefresh: (scope: RefreshScope) => boolean;

  /**
   * Acknowledge that a component has completed its refresh
   */
  acknowledgeRefresh: (scope: RefreshScope) => void;

  /**
   * Enable/disable Supabase Realtime auto-refresh
   */
  realtimeEnabled: boolean;
  setRealtimeEnabled: (enabled: boolean) => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

interface RefreshProviderProps {
  children: ReactNode;
  /**
   * Enable Supabase Realtime auto-refresh by default
   */
  enableRealtime?: boolean;
}

export function RefreshProvider({ children, enableRealtime = false }: RefreshProviderProps) {
  const [activeRefreshes, setActiveRefreshes] = useState<Set<RefreshScope>>(new Set());
  const [realtimeEnabled, setRealtimeEnabled] = useState(enableRealtime);
  const { user } = useAuth();

  // Log provider initialization
  useEffect(() => {
    console.log('🚀 [PROVIDER] RefreshProvider initialized:', {
      realtimeEnabled,
      hasUser: !!user?.id,
      userId: user?.id
    });
  }, [realtimeEnabled, user?.id]);

  const triggerRefresh = useCallback((scope: RefreshScope | RefreshScope[] = 'all') => {
    const scopes = Array.isArray(scope) ? scope : [scope];
    console.log('🔄 [TRIGGER] triggerRefresh called with scope(s):', scopes);

    setActiveRefreshes(prev => {
      const next = new Set(prev);
      const prevSize = next.size;
      scopes.forEach(s => next.add(s));
      // 'all' scope triggers everything
      if (scopes.includes('all')) {
        next.add('all');
      }
      console.log('🔄 [TRIGGER] Active refreshes updated:', {
        previous: Array.from(prev),
        current: Array.from(next),
        added: next.size - prevSize
      });
      return next;
    });
  }, []);

  const shouldRefresh = useCallback((scope: RefreshScope): boolean => {
      const result = activeRefreshes.has(scope) || activeRefreshes.has('all');
    return result;
  }, [activeRefreshes]);

  const acknowledgeRefresh = useCallback((scope: RefreshScope) => {
    setActiveRefreshes(prev => {
      const next = new Set(prev);
      next.delete(scope);
      // If no specific scopes left and 'all' was set, clear it
      if (next.size === 1 && next.has('all')) {
        next.delete('all');
      }
      console.log('✅ [ACK] Active refreshes after acknowledgment:', {
        scope,
        previous: Array.from(prev),
        current: Array.from(next)
      });
      return next;
    });
  }, []);

    // Supabase Realtime integration
    useEffect(() => {
        if (!realtimeEnabled || !user?.id) {
            console.log('📡 [REALTIME] Skipping subscription:', {
                realtimeEnabled,
                hasUserId: !!user?.id
            });
            return;
        }

        console.log('📡 [REALTIME] Subscribing to Supabase Realtime for user:', user.id);

        // Channel name can be anything; using 'ui-refresh' makes intent clear
        const channel = supabase.channel(`ui-refresh:${user.id}`);

        channel
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',           // your schema
                    table: 'ui_refresh_events',
                    filter: undefined
                },
                (payload) => {
                    // The inserted row is in payload.new
                    const scope = payload.new?.scope || 'all';

                    console.log('📡 [REALTIME] DB refresh event received:', {
                        payload,
                        scope,
                        timestamp: new Date().toISOString()
                    });

                    triggerRefresh(scope);
                }
            )
            .subscribe((status) => {
                console.log('📡 [REALTIME] Subscription status changed:', {
                    status,
                    channelName: `ui-refresh:${user.id}`,
                    timestamp: new Date().toISOString()
                });

                if (status === 'SUBSCRIBED') {
                    console.log(`✅ [REALTIME] Successfully subscribed to channel: ui-refresh:${user.id}`);
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('❌ [REALTIME] Failed to subscribe to realtime channel');
                }
            });

        // Cleanup on unmount
        return () => {
            console.log(`🔌 [REALTIME] Unsubscribing from channel: ui-refresh:${user.id}`);
            supabase.removeChannel(channel);
        };
    }, [realtimeEnabled, user?.id, triggerRefresh]);

  return (
    <RefreshContext.Provider
      value={{
        triggerRefresh,
        shouldRefresh,
        acknowledgeRefresh,
        realtimeEnabled,
        setRealtimeEnabled,
      }}
    >
      {children}
    </RefreshContext.Provider>
  );
}

/**
 * Hook to trigger refreshes from any component
 */
export function useRefreshTrigger() {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefreshTrigger must be used within RefreshProvider');
  }

  console.log('🔌 [TRIGGER_HOOK] Component using useRefreshTrigger hook');

  return {
    triggerRefresh: context.triggerRefresh,
    realtimeEnabled: context.realtimeEnabled,
    setRealtimeEnabled: context.setRealtimeEnabled,
  };
}

/**
 * Hook for components to subscribe to refresh events
 *
 * @param scope - The scope this component listens to (e.g., 'appointments', 'tasks', or 'all')
 * @param onRefresh - Async function to call when refresh is triggered
 *
 * @example
 * ```tsx
 * function AppointmentsList() {
 *   const { refetch } = useQuery(...);
 *
 *   useRefreshSubscription('appointments', refetch);
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useRefreshSubscription(
  scope: RefreshScope,
  onRefresh: () => Promise<void> | void
) {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefreshSubscription must be used within RefreshProvider');
  }

  const { shouldRefresh, acknowledgeRefresh } = context;

  useEffect(() => {

      console.log(`{1}should refresh ${scope}`)
    if (shouldRefresh(scope)) {
        console.log(`{1}yes`)

      const doRefresh = async () => {
        try {
          await onRefresh();
        } catch (error) {
          console.error('❌ [SUBSCRIPTION] Refresh failed for scope:', scope, error);
        } finally {
          acknowledgeRefresh(scope);
        }
      };

      doRefresh();
    }
  }, [shouldRefresh, scope, onRefresh, acknowledgeRefresh]);
}
