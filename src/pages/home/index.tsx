import { useEffect, useState, useCallback } from 'react';
import { useFetchQuote } from '@/features/fetch-next-quote';
import { useRateQuote } from '@/features/rate-quote';
import { useShareQuote } from '@/features/share-quote';
import { useSlideshowControl } from '@/features/slideshow-control';
import { Loader } from '@/shared/ui/loader';
import { QuoteDisplay } from '@/widgets/quote-display';
import { QuoteSlideshow } from '@/widgets/quote-slideshow';
import {
  getSlideshowSettings,
  type SlideshowSettings,
} from '@/shared/lib/storage/slideshow-settings';

export function HomePage() {
  const { quote, loading, error, source, fetchQuote } = useFetchQuote();
  const { currentRating, rateQuote } = useRateQuote(quote?.id ?? null);
  const { shareQuote, isSharing } = useShareQuote(quote);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideshowSettings, setSlideshowSettings] = useState<SlideshowSettings>(() =>
    getSlideshowSettings(),
  );

  const handleNextQuote = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      fetchQuote();
      setIsAnimating(false);
    }, 300);
  }, [fetchQuote]);

  const { stopAnimation } = useSlideshowControl({
    enabled: slideshowSettings.enabled,
    intervalSeconds: slideshowSettings.intervalSeconds,
    onNext: handleNextQuote,
    isReady: !!quote && !loading && !error,
  });

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

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
        stopAnimation();
        handleNextQuote();
      }
    },
    [loading, stopAnimation, handleNextQuote],
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
        <QuoteSlideshow settings={slideshowSettings} onSettingsChange={setSlideshowSettings} />

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
            <QuoteDisplay
              quote={quote}
              source={source}
              currentRating={currentRating}
              isAnimating={isAnimating}
              isSharing={isSharing}
              onRate={rateQuote}
              onShare={shareQuote}
              onNext={() => {
                stopAnimation();
                handleNextQuote();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
