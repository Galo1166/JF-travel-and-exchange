import { useEffect, useState, useCallback } from 'react';
import { getLiveExchangeRates, clearRatesCache } from '../utils/currencyConverter';

interface UseLiveExchangeRatesReturn {
  rates: Record<string, number> | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  clearCache: () => void;
}

/**
 * Custom hook to fetch and manage live exchange rates
 * Automatically fetches on mount and caches for 1 hour
 */
export function useLiveExchangeRates(baseCurrency: string = 'USD'): UseLiveExchangeRatesReturn {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedRates = await getLiveExchangeRates(baseCurrency);
      
      if (fetchedRates) {
        setRates(fetchedRates);
      } else {
        setError('Failed to fetch exchange rates. Using fallback rates.');
        setRates(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error fetching rates: ${message}`);
      console.error('useLiveExchangeRates error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [baseCurrency]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleClearCache = useCallback(() => {
    clearRatesCache();
    fetchRates();
  }, [fetchRates]);

  return {
    rates,
    isLoading,
    error,
    refetch: fetchRates,
    clearCache: handleClearCache,
  };
}
