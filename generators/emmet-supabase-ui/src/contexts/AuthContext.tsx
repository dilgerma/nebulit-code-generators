import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  tenantId: string | null;
  setTenantId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  tenantId: null,
  setTenantId: () => {},
});

export const useAuth = () => useContext(AuthContext);

const fetchAssignedTenant = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("slice_assigned_restaurants")
      .select("restaurant_id")
      .eq("owner_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching assigned tenant:", error);
      return null;
    }
    return data?.restaurant_id ?? null;
  } catch (error) {
    console.error("Error fetching assigned tenant:", error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Initialize session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        fetchAssignedTenant(session.user.id).then((id) => {
          if (!cancelled) setTenantId(id);
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (cancelled) return;
        console.log('Auth event:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_OUT') {
          setTenantId(null);
        } else if (session?.user) {
          fetchAssignedTenant(session.user.id).then((id) => {
            if (!cancelled) setTenantId(id);
          });
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, tenantId, setTenantId }}>
      {children}
    </AuthContext.Provider>
  );
};
