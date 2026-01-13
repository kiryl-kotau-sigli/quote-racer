import { useEffect } from 'react';
import { useFetchQuote } from '@/features/fetch-next-quote';
import { Loader } from '@/shared/ui/loader';

export function HomePage() {
  const { quote, loading, error, source, fetchQuote } = useFetchQuote();

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-5xl font-bold text-center text-gray-800 mb-12'>Quote Racer</h1>

        <div className='bg-white rounded-lg shadow-xl p-8 min-h-[300px] flex flex-col justify-center'>
          {loading && (
            <div className='flex flex-col items-center justify-center'>
              <Loader />
              <p className='mt-4 text-gray-600'>Racing APIs for the fastest quote...</p>
            </div>
          )}

          {error && (
            <div className='text-center'>
              <p className='text-red-600 text-lg mb-4'>Error: {error}</p>
              <button
                onClick={fetchQuote}
                className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
              >
                Try Again
              </button>
            </div>
          )}

          {quote && !loading && (
            <div className='space-y-6'>
              <blockquote className='text-2xl text-gray-800 italic text-center leading-relaxed'>
                &ldquo;{quote.text}&rdquo;
              </blockquote>
              {quote.author && (
                <p className='text-xl text-gray-600 text-center font-semibold'>
                  &mdash; {quote.author}
                </p>
              )}
              {source && (
                <p className='text-sm text-gray-400 text-center mt-4'>
                  Source: {new URL(source).hostname}
                </p>
              )}
              <div className='flex justify-center mt-8'>
                <button
                  onClick={fetchQuote}
                  className='px-8 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-semibold text-lg'
                >
                  Fetch Next Quote
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
