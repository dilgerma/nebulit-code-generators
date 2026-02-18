import { useAuth } from "@/contexts/AuthContext";
import { ApiContext } from "@/lib/api-client";

export function useApiContext(): ApiContext {
  const { session, user, tenantId } = useAuth();
  return {
    token: session?.access_token ?? "",
    tenantId: tenantId ?? undefined,
    userId: user?.id ?? undefined,
  };
}
