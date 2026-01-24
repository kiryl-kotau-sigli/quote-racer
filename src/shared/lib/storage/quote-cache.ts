import type { Quote } from '@/entities/quote';

const CACHE_KEY = 'quote-racer-cache';
const MAX_CACHED_QUOTES = 50;

export function getCachedQuotes(): Quote[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return [];

    const quotes: Quote[] = JSON.parse(cached);
    return Array.isArray(quotes) ? quotes : [];
  } catch {
    return [];
  }
}

export function addQuoteToCache(quote: Quote): void {
  const cached = getCachedQuotes();

  const exists = cached.some((q) => q.id === quote.id);
  if (exists) return;

  const updated = [quote, ...cached].slice(0, MAX_CACHED_QUOTES);
  localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
}

export function getRandomCachedQuote(): Quote | null {
  const cached = getCachedQuotes();
  if (cached.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * cached.length);
  return cached[randomIndex];
}
