/*import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiContext } from "@/hooks/useApiContext";
import * as api from "@/lib/api";

export function useRegisterRestaurant() {
  const queryClient = useQueryClient();
  const ctx = useApiContext();

  return useMutation({
    mutationFn: (params: api.RegisterRestaurantParams) => api.registerRestaurant(params, ctx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
}*/
