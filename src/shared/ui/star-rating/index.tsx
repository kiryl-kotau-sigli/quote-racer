interface StarRatingProps {
  rating: number | null;
  onRate: (rating: number) => void;
  maxRating?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({
  rating,
  onRate,
  maxRating = 5,
  disabled = false,
  size = 'md',
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const starSize = sizeClasses[size];

  return (
    <div className='flex items-center gap-1 justify-center'>
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = rating !== null && starValue <= rating;

        return (
          <button
            key={starValue}
            type='button'
            onClick={() => !disabled && onRate(starValue)}
            disabled={disabled}
            className={`${starSize} transition-all duration-200 ${
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
            }`}
            aria-label={`Rate ${starValue} out of ${maxRating}`}
            aria-pressed={isFilled}
          >
            <svg
              className={`${starSize} ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
              fill='currentColor'
              viewBox='0 0 20 20'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
