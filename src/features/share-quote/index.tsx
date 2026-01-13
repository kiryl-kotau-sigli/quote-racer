import { useCallback, useState } from 'react';
import type { Quote } from '@/entities/quote';

interface UseShareQuoteResult {
  shareQuote: () => Promise<void>;
  isSharing: boolean;
  isSupported: boolean;
  error: string | null;
}

function formatQuoteForSharing(quote: Quote): string {
  let text = `"${quote.text}"`;

  if (quote.author) {
    text += `\n\n— ${quote.author}`;
  }

  text += '\n\nShared via Quote Racer';

  return text;
}

function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function useShareQuote(quote: Quote | null): UseShareQuoteResult {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = typeof navigator !== 'undefined' && 'share' in navigator;

  const shareQuote = useCallback(async () => {
    if (!quote) {
      setError('No quote to share');
      return;
    }

    setIsSharing(true);
    setError(null);

    try {
      const shareText = formatQuoteForSharing(quote);
      const shareData: ShareData = {
        title: 'Quote Racer',
        text: shareText,
      };

      if (isSupported && navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (shareError) {
          if ((shareError as Error).name !== 'AbortError') {
            throw shareError;
          }
          return;
        }
      } else {
        await copyToClipboard(shareText);
        alert('Quote copied to clipboard!');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share quote';
      setError(errorMessage);
      console.error('Share error:', err);
    } finally {
      setIsSharing(false);
    }
  }, [quote, isSupported]);

  return {
    shareQuote,
    isSharing,
    isSupported,
    error,
  };
}
