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
  // Check if Clipboard API is available (requires secure context - HTTPS or localhost)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }

  // Fallback for non-secure contexts (HTTP)
  return new Promise((resolve, reject) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        resolve();
      } else {
        reject(new Error('Failed to copy using execCommand'));
      }
    } catch (err) {
      document.body.removeChild(textArea);
      reject(err);
    }
  });
}

export function useShareQuote(quote: Quote | null): UseShareQuoteResult {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported =
    typeof navigator !== 'undefined' &&
    'share' in navigator &&
    typeof navigator.share === 'function';

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

      const canShare =
        typeof navigator !== 'undefined' &&
        'share' in navigator &&
        typeof navigator.share === 'function';

      if (canShare) {
        try {
          await navigator.share(shareData);
        } catch (shareError) {
          const error = shareError as Error;
          if (error.name === 'AbortError') {
            return;
          }
          console.warn('Web Share API failed, falling back to clipboard:', error);
          try {
            await copyToClipboard(shareText);
            alert('Quote copied to clipboard!');
          } catch (clipboardError) {
            console.error('Clipboard copy failed:', clipboardError);
            alert('Failed to share. Please try again.');
          }
        }
      } else {
        try {
          await copyToClipboard(shareText);
          alert('Quote copied to clipboard!');
        } catch (clipboardError) {
          console.error('Clipboard copy failed:', clipboardError);
          alert('Failed to copy to clipboard. Please try again.');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share quote';
      setError(errorMessage);
      console.error('Share error:', err);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSharing(false);
    }
  }, [quote]);

  return {
    shareQuote,
    isSharing,
    isSupported,
    error,
  };
}
