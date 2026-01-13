import { useMemo } from 'react';
import { StarRating } from '@/shared/ui/star-rating';
import { ShareButton } from '@/shared/ui/share-button';
import { formatSourceLabel } from '@/shared/lib/format-source-label';
import type { Quote } from '@/entities/quote';

interface QuoteDisplayProps {
  quote: Quote;
  source: string | null;
  currentRating: number | null;
  isAnimating: boolean;
  isSharing: boolean;
  onRate: (rating: number) => void;
  onShare: () => Promise<void>;
  onNext: () => void;
}

export function QuoteDisplay({
  quote,
  source,
  currentRating,
  isAnimating,
  isSharing,
  onRate,
  onShare,
  onNext,
}: QuoteDisplayProps) {
  const sourceLabel = useMemo(() => formatSourceLabel(source), [source]);

  return (
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
          <StarRating rating={currentRating} onRate={onRate} size='lg' />
        </div>
        <div className='flex flex-col items-center gap-2 sm:gap-3 w-full max-w-xs'>
          <ShareButton onShare={onShare} isSharing={isSharing} />
          <button
            onClick={onNext}
            className='w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-semibold text-sm sm:text-base md:text-lg cursor-pointer'
          >
            Next Quote
          </button>
        </div>
      </div>
    </div>
  );
}
