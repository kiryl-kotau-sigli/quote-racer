import { useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { raceQuoteApis } from '@/entities/quote/api/service';
import type { QuoteApiResponse } from '@/entities/quote';
import type { Quote } from '@/entities/quote';
import { getRandomCachedQuote } from '@/shared/lib/storage/quote-cache';
import { getRandomFallbackQuote } from '@/entities/quote/model/fallback-quotes';

interface UseFetchQuoteResult {
  quote: Quote | null;
  loading: boolean;
  error: string | null;
  source: string | null;
  fetchQuote: (options?: { keepPrevious?: boolean }) => Promise<void>;
}

const QUERY_KEY = ['quote'] as const;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Failed to fetch quote';
}

export function useFetchQuote(): UseFetchQuoteResult {
  const queryClient = useQueryClient();
  const keepPreviousRef = useRef(false);

  const { data, isLoading, error, refetch, isFetching } = useQuery<QuoteApiResponse, unknown>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        return await raceQuoteApis();
      } catch {
        const cachedQuote = getRandomCachedQuote();
        if (cachedQuote) {
          return {
            quote: cachedQuote,
            source: 'cached',
          };
        }

        const fallbackQuote = getRandomFallbackQuote();
        return {
          quote: fallbackQuote,
          source: 'fallback',
        };
      }
    },
    enabled: false,
    retry: false,
    placeholderData: (previous) => {
      return keepPreviousRef.current ? previous : undefined;
    },
  });

  const fetchQuote = useCallback(
    async (options?: { keepPrevious?: boolean }) => {
      const keepPrevious = options?.keepPrevious ?? false;
      keepPreviousRef.current = keepPrevious;

      if (!keepPrevious) {
        queryClient.setQueryData(QUERY_KEY, undefined);
      }

      await refetch();
    },
    [refetch, queryClient],
  );

  const hasData = data?.quote != null;
  const displayError = error && !hasData ? getErrorMessage(error) : null;

  return {
    quote: data?.quote ?? null,
    loading: isLoading || isFetching,
    error: displayError,
    source: data?.source ?? null,
    fetchQuote,
  };
}
