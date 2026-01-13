import { useState, useCallback, useEffect } from 'react';
import { getQuoteRating, saveQuoteRating } from '@/shared/lib/storage/quote-ratings';

interface UseRateQuoteResult {
  currentRating: number | null;
  rateQuote: (rating: number) => void;
  isLoading: boolean;
}

export function useRateQuote(quoteId: string | null): UseRateQuoteResult {
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (quoteId) {
      const rating = getQuoteRating(quoteId);
      setCurrentRating(rating);
    } else {
      setCurrentRating(null);
    }
  }, [quoteId]);

  const rateQuote = useCallback(
    (rating: number) => {
      if (!quoteId) return;

      setIsLoading(true);
      try {
        saveQuoteRating(quoteId, rating);
        setCurrentRating(rating);
      } catch (error) {
        console.error('Failed to save rating:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [quoteId],
  );

  return {
    currentRating,
    rateQuote,
    isLoading,
  };
}
