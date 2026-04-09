import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export const useDefaultCurrency = () => {
  const { data: currencies = [], isLoading } = useQuery({
    queryKey: ["currencies"],
    queryFn: () => api.settings.getCurrencies(),
  });

  const defaultCurrency = currencies.find((c: any) => c.isDefault) || currencies[0];
  
  return {
    symbol: defaultCurrency?.symbol || "$",
    code: defaultCurrency?.code || "USD",
    isLoading,
  };
};
