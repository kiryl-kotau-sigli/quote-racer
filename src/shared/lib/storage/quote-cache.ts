import type { Quote } from '@/entities/quote';

const CACHE_KEY = 'quote-racer-cache';
const CACHE_SIZE = 10;
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

interface CachedQuote extends Quote {
  cachedAt: number;
}

export function getCachedQuotes(): Quote[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return [];

    const data: CachedQuote[] = JSON.parse(cached);
    const now = Date.now();

    const validQuotes = data.filter((quote) => now - quote.cachedAt < CACHE_EXPIRY);

    if (validQuotes.length !== data.length) {
      saveCachedQuotes(validQuotes);
    }

    return validQuotes.map(({ cachedAt, ...quote }) => quote);
  } catch {
    return [];
  }
}

export function saveQuoteToCache(quote: Quote): void {
  try {
    const cached = getCachedQuotes();
    const cachedWithTimestamp: CachedQuote[] = cached.map((q) => ({
      ...q,
      cachedAt: Date.now(),
    }));

    const filtered = cachedWithTimestamp.filter((q) => q.id !== quote.id);

    const updated: CachedQuote[] = [{ ...quote, cachedAt: Date.now() }, ...filtered].slice(
      0,
      CACHE_SIZE,
    );

    saveCachedQuotes(updated);
  } catch {}
}

function saveCachedQuotes(quotes: CachedQuote[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(quotes));
  } catch {}
}

export function getRandomCachedQuote(): Quote | null {
  const cached = getCachedQuotes();
  if (cached.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * cached.length);
  return cached[randomIndex];
}
