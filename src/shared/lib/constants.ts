import type { Quote } from '@/entities/quote';

export const FALLBACK_QUOTES: Quote[] = [
  {
    id: 'fallback-1',
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
    source: 'offline',
  },
  {
    id: 'fallback-2',
    text: 'Innovation distinguishes between a leader and a follower.',
    author: 'Steve Jobs',
    source: 'offline',
  },
  {
    id: 'fallback-3',
    text: 'Life is what happens to you while you are busy making other plans.',
    author: 'John Lennon',
    source: 'offline',
  },
  {
    id: 'fallback-4',
    text: 'The future belongs to those who believe in the beauty of their dreams.',
    author: 'Eleanor Roosevelt',
    source: 'offline',
  },
  {
    id: 'fallback-5',
    text: 'It is during our darkest moments that we must focus to see the light.',
    author: 'Aristotle',
    source: 'offline',
  },
  {
    id: 'fallback-6',
    text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    author: 'Winston Churchill',
    source: 'offline',
  },
  {
    id: 'fallback-7',
    text: 'The way to get started is to quit talking and begin doing.',
    author: 'Walt Disney',
    source: 'offline',
  },
  {
    id: 'fallback-8',
    text: "Don't let yesterday take up too much of today.",
    author: 'Will Rogers',
    source: 'offline',
  },
  {
    id: 'fallback-9',
    text: 'You learn more from failure than from success.',
    author: 'Unknown',
    source: 'offline',
  },
  {
    id: 'fallback-10',
    text: "If you are working on something exciting that you really care about, you don't have to be pushed. The vision pulls you.",
    author: 'Steve Jobs',
    source: 'offline',
  },
];

export function getRandomFallbackQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
  return FALLBACK_QUOTES[randomIndex];
}
