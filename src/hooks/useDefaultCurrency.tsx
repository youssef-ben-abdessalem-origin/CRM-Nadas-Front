import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export const useDefaultCurrency = () => {
  const { data: user } = useQuery({
    queryKey: ["auth-profile"],
    queryFn: api.auth.profile,
  });

  const language = user?.language || "EN";

  const { data: currencies = [], isLoading } = useQuery({
    queryKey: ["currencies"],
    queryFn: () => api.settings.getCurrencies(),
  });

  const defaultCurrency = currencies.find((c: any) => c.isDefault && c.isActive) || currencies.find((c: any) => c.isDefault) || currencies[0];
  
  const symAr = defaultCurrency?.symbolArabic;
  const symEn = defaultCurrency?.symbolEnglish;
  const fallbackSym = defaultCurrency?.symbol || "$";

  let displaySymbol = fallbackSym;
  if (language === "AR" && symAr) {
    displaySymbol = symAr;
  } else if (symEn) {
    displaySymbol = symEn;
  }

  return {
    symbol: displaySymbol,
    code: defaultCurrency?.code || "USD",
    isLoading,
  };
};
