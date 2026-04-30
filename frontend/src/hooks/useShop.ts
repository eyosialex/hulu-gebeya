import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export type ShopItem = {
  id: string;
  name: string;
  price: number;
  type: string;
  description: string;
  detail?: string;
  tint?: string;
};

export function useShop() {
  const { data, isLoading, error, refetch } = useQuery<ShopItem[]>({
    queryKey: ["shop"],
    queryFn: () => apiRequest("/shop/items"),
  });

  return { 
    shopItems: data || [], 
    isLoading, 
    error, 
    refresh: refetch 
  };
}
