import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { useFetchQuote } from '@/features/fetch-next-quote';
import { useRateQuote } from '@/features/rate-quote';
import { useShareQuote } from '@/features/share-quote';
import { Loader } from '@/shared/ui/loader';
import { StarRating } from '@/shared/ui/star-rating';
import { ShareButton } from '@/shared/ui/share-button';
import {
  getSlideshowSettings,
  saveSlideshowSettings,
  type SlideshowSettings,
} from '@/shared/lib/storage/slideshow-settings';

function formatSourceLabel(source?: string | null): string | null {
  if (!source) {
    return null;
  }

  if (source === 'cache') {
    return 'Cached result';
  }

  if (source === 'offline') {
    return 'Offline fallback';
  }

  if (source.startsWith('http://') || source.startsWith('https://')) {
    try {
      const url = new URL(source);
      return url.hostname;
    } catch {
      return source;
    }
  }

  return source;
}

export function HomePage() {
  const { quote, loading, error, source, fetchQuote } = useFetchQuote();
  const { currentRating, rateQuote } = useRateQuote(quote?.id ?? null);
  const { shareQuote, isSharing } = useShareQuote(quote);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideshowSettings, setSlideshowSettings] = useState<SlideshowSettings>(() =>
    getSlideshowSettings(),
  );
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const sourceLabel = useMemo(() => formatSourceLabel(source), [source]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (quote && !loading && !error && slideshowSettings.enabled) {
      const intervalMs = slideshowSettings.intervalSeconds * 1000;

      intervalRef.current = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          fetchQuote();
          setIsAnimating(false);
        }, 300);
      }, intervalMs);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [
    quote,
    loading,
    error,
    fetchQuote,
    slideshowSettings.enabled,
    slideshowSettings.intervalSeconds,
  ]);

  const handleSettingsChange = useCallback(
    (newSettings: Partial<SlideshowSettings>) => {
      const updated = { ...slideshowSettings, ...newSettings };
      setSlideshowSettings(updated);
      saveSlideshowSettings(updated);
    },
    [slideshowSettings],
  );

  useEffect(() => {
    if (quote) {
      setIsAnimating(false);
    }
  }, [quote]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((event.key === 'Enter' || event.key === ' ') && !loading) {
        event.preventDefault();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsAnimating(true);
        setTimeout(() => {
          fetchQuote();
          setIsAnimating(false);
        }, 300);
      }
    },
    [fetchQuote, loading],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex justify-between items-center mb-4 sm:mb-12'>
          <h1 className='text-2xl sm:text-4xl md:text-5xl font-bold text-gray-800'>Quote Racer</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className='px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-xs sm:text-sm font-medium cursor-pointer'
            aria-label='Toggle settings'
          >
            Settings
          </button>
        </div>

        {showSettings && (
          <div className='bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6'>
            <h2 className='text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800'>
              Slideshow Settings
            </h2>
            <div className='space-y-3 sm:space-y-4'>
              <label className='flex items-center gap-2 sm:gap-3 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={slideshowSettings.enabled}
                  onChange={(e) => handleSettingsChange({ enabled: e.target.checked })}
                  className='w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer'
                />
                <span className='text-sm sm:text-base text-gray-700 font-medium'>
                  Enable automatic slideshow
                </span>
              </label>
              {slideshowSettings.enabled && (
                <div className='pl-6 sm:pl-8'>
                  <label className='block text-sm sm:text-base text-gray-700 mb-2'>
                    Interval: {slideshowSettings.intervalSeconds} second
                    {slideshowSettings.intervalSeconds !== 1 ? 's' : ''}
                  </label>
                  <input
                    type='range'
                    min='3'
                    max='30'
                    value={slideshowSettings.intervalSeconds}
                    onChange={(e) =>
                      handleSettingsChange({ intervalSeconds: parseInt(e.target.value, 10) })
                    }
                    className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600'
                  />
                  <div className='flex justify-between text-xs text-gray-500 mt-1'>
                    <span>3s</span>
                    <span>30s</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className='bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8 min-h-[200px] sm:min-h-[300px] flex flex-col justify-center'>
          {loading && (
            <div className='flex flex-col items-center justify-center py-4 sm:py-8'>
              <Loader />
              <p className='mt-3 sm:mt-4 text-sm sm:text-base text-gray-600'>
                Racing APIs for the fastest quote...
              </p>
            </div>
          )}

          {error && (
            <div className='text-center py-4 sm:py-8'>
              <p className='text-red-600 text-sm sm:text-lg mb-3 sm:mb-4 whitespace-pre-line text-left'>
                {error}
              </p>
              <button
                onClick={fetchQuote}
                className='px-4 sm:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base'
              >
                Try Again
              </button>
            </div>
          )}

          {quote && !loading && (
            <div
              className={`space-y-3 sm:space-y-4 md:space-y-6 transition-opacity duration-300 ${
                isAnimating ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <blockquote className='text-lg sm:text-xl md:text-2xl text-gray-800 italic text-center leading-relaxed px-2'>
                &ldquo;{quote.text}&rdquo;
              </blockquote>
              {quote.author && (
                <p className='text-base sm:text-lg md:text-xl text-gray-600 text-center font-semibold px-2'>
                  &mdash; {quote.author}
                </p>
              )}
              {sourceLabel && (
                <p className='text-xs sm:text-sm text-gray-400 text-center mt-2 sm:mt-4'>
                  Source: {sourceLabel}
                </p>
              )}
              <div className='flex flex-col items-center gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4 md:mt-6'>
                <div className='flex flex-col items-center gap-1 sm:gap-2'>
                  <p className='text-xs sm:text-sm text-gray-600 font-medium'>Rate this quote:</p>
                  <StarRating rating={currentRating} onRate={rateQuote} size='lg' />
                </div>
                <div className='flex flex-col items-center gap-2 sm:gap-3 w-full max-w-xs'>
                  <ShareButton onShare={shareQuote} isSharing={isSharing} />
                  <button
                    onClick={() => {
                      if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                      }
                      setIsAnimating(true);
                      setTimeout(() => {
                        fetchQuote();
                        setIsAnimating(false);
                      }, 300);
                    }}
                    className='w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-semibold text-sm sm:text-base md:text-lg cursor-pointer'
                  >
                    Next Quote
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
