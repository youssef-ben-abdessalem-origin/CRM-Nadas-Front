import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrencyNumbersProps {
  amount: number | string;
  className?: string;
  valueClassName?: string;
  symbolClassName?: string;
}

/**
 * CurrencyNumbers Component
 * Displays a number with a superscripted default currency symbol.
 * Automatically fetches and filters the default active currency.
 */
export const CurrencyNumbers = ({ 
  amount, 
  className = "", 
  valueClassName = "", 
  symbolClassName = "" 
}: CurrencyNumbersProps) => {
  // Fetch the user profile to get language preference
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["auth-profile"],
    queryFn: api.auth.profile,
  });

  const language = user?.language || "EN";

  // Find the currency that is BOTH active and default
  const { data: currencies = [], isLoading: isCurrenciesLoading } = useQuery({
    queryKey: ["currencies"],
    queryFn: api.settings.getCurrencies,
  });

  const defaultCurrency = currencies.find(
    (c: any) => c.isActive && c.isDefault
  );

  // Dynamic Symbol Selection based on system language
  const symAr = defaultCurrency?.symbolArabic;
  const symEn = defaultCurrency?.symbolEnglish;
  const fallbackSym = defaultCurrency?.symbol || "$";

  // Determine primary symbol
  let displaySymbol = fallbackSym;
  if (language === "AR" && symAr) {
    displaySymbol = symAr;
  } else if (symEn) {
    displaySymbol = symEn;
  }

  if (isUserLoading || isCurrenciesLoading) {
    return <Skeleton className="h-6 w-16 inline-block" />;
  }

  // Format the number for better readability (e.g., 1,234.56)
  const formattedValue = Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return (
    <div className={`inline-flex items-baseline gap-1 ${className}`}>
      <span className={`font-semibold ${valueClassName}`}>
        {formattedValue}
      </span>
      <sup className={`text-[0.6em] font-medium ${symbolClassName}`}>
        {displaySymbol}
      </sup>
    </div>
  );
};
