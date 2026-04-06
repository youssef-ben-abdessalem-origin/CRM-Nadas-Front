import { useEffect, useState } from 'react';

type CurrencyInfo = {
  currency: string;
  symbol: string;
};

export function useProfileCurrency() {
  const [currency, setCurrency] = useState<CurrencyInfo | null>(null);

  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const t = localStorage.getItem('token');
    if (t) return t;
    // Try cookie-based token fallback
    const match = document.cookie.match(/(^|;)\s*token=([^;]+)/);
    return match ? match[2] : null;
  };

  const fetchCurrency = async (): Promise<CurrencyInfo> => {
    const token = getToken();
    const res = await fetch('/api/v1/profile/currency', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch currency');
    const data = await res.json();
    // Expect { currency: 'USD', symbol: '$' } or fallback
    const info: CurrencyInfo = {
      currency: data?.currency ?? 'USD',
      symbol: data?.symbol ?? '$',
    };
    setCurrency(info);
    localStorage.setItem('profile.currency', JSON.stringify(info));
    return info;
  };

  useEffect(() => {
    const cached = typeof window !== 'undefined' ? localStorage.getItem('profile.currency') : null;
    if (cached) {
      setCurrency(JSON.parse(cached));
    } else {
      fetchCurrency().catch(() => {
        // Fallback if fetch fails
        setCurrency({ currency: 'USD', symbol: '$' });
      });
    }
  }, []);

  const refresh = async () => {
    try {
      await fetchCurrency();
    } catch {
      // ignore errors; keep existing currency
    }
  };

  const loading = currency === null;
  return { currency, loading, refresh };
}
