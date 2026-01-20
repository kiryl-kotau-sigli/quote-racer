import { useMemo } from 'react';
import { StarRating } from '@/shared/ui/star-rating';
import { ShareButton } from '@/shared/ui/share-button';
import { formatSourceLabel } from '@/shared/lib/format-source-label';
import type { Quote } from '@/entities/quote';

interface QuoteDisplayProps {
  quote: Quote;
  source: string | null;
  currentRating: number | null;
  isSharing: boolean;
  isLoadingNext: boolean;
  onRate: (rating: number) => void;
  onShare: () => Promise<void>;
  onNext: () => void;
}

export function QuoteDisplay({
  quote,
  source,
  currentRating,
  isSharing,
  isLoadingNext,
  onRate,
  onShare,
  onNext,
}: QuoteDisplayProps) {
  const sourceLabel = useMemo(() => formatSourceLabel(source), [source]);

  return (
    <div className='space-y-3 sm:space-y-4 md:space-y-6'>
      <div className='flex flex-col items-center gap-2 sm:gap-3 w-full max-w-xs mx-auto'>
        <button
          onClick={onNext}
          disabled={isLoadingNext}
          className='w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-semibold text-sm sm:text-base md:text-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed'
        >
          {isLoadingNext ? 'Loading...' : 'Next Quote'}
        </button>
      </div>

      <blockquote className='min-h-26 sm:min-h-28 md:min-h-30 text-lg sm:text-xl md:text-2xl text-gray-800 italic text-center leading-relaxed px-2'>
        &ldquo;{quote.text}&rdquo;
      </blockquote>
      <p className='min-h-7 text-base sm:text-lg md:text-xl text-gray-600 text-center font-semibold px-2'>
        {quote.author ? <>&mdash; {quote.author}</> : '\u00A0'}
      </p>
      <p className='min-h-5 text-xs sm:text-sm text-gray-400 text-center mt-2 sm:mt-4'>
        {sourceLabel ? <>Source: {sourceLabel}</> : '\u00A0'}
      </p>
      <div className='flex flex-col items-center gap-2 sm:gap-3 md:gap-4'>
        <div className='flex flex-col items-center gap-1 sm:gap-2'>
          <p className='text-xs sm:text-sm text-gray-600 font-medium'>Rate this quote:</p>
          <StarRating rating={currentRating} onRate={onRate} size='lg' />
        </div>
        <ShareButton onShare={onShare} isSharing={isSharing} />
      </div>
    </div>
  );
}
