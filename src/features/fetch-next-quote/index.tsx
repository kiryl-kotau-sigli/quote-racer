import { useState, useCallback } from 'react';
import { raceQuoteApis } from '@/entities/quote/api/service';
import type { QuoteApiResponse } from '@/entities/quote';
import type { Quote } from '@/entities/quote';

interface UseFetchQuoteResult {
  quote: Quote | null;
  loading: boolean;
  error: string | null;
  source: string | null;
  fetchQuote: () => Promise<void>;
}

export function useFetchQuote(): UseFetchQuoteResult {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    setError(null);
    setQuote(null);
    setSource(null);

    try {
      const result: QuoteApiResponse = await raceQuoteApis();
      setQuote(result.quote);
      setSource(result.source);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quote';
      setError(errorMessage);
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
