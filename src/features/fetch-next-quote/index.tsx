import { useState, useCallback } from 'react';
import { raceQuoteApis } from '@/entities/quote/api/service';
import type { QuoteApiResponse } from '@/entities/quote';
import type { Quote } from '@/entities/quote';

interface UseFetchQuoteResult {
  quote: Quote | null;
  loading: boolean;
  error: string | null;
  source: string | null;
  fetchQuote: (options?: { keepPrevious?: boolean }) => Promise<void>;
}

export function useFetchQuote(): UseFetchQuoteResult {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  const fetchQuote = useCallback(async (options?: { keepPrevious?: boolean }) => {
    const keepPrevious = options?.keepPrevious ?? false;
    setLoading(true);
    setError(null);
    if (!keepPrevious) {
      setQuote(null);
      setSource(null);
    }

    try {
      const result: QuoteApiResponse = await raceQuoteApis();
      setQuote(result.quote);
      setSource(result.source);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quote';
      setError(errorMessage);
      if (!keepPrevious) {
        setQuote(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    quote,
    loading,
    error,
    source,
    fetchQuote,
  };
}
