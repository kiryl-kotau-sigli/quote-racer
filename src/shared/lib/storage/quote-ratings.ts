const RATINGS_KEY = 'quote-racer-ratings';

export function getQuoteRating(quoteId: string): number | null {
  try {
    const cached = localStorage.getItem(RATINGS_KEY);
    if (!cached) return null;

    const ratings: Record<string, number> = JSON.parse(cached);
    return ratings[quoteId] ?? null;
  } catch {
    return null;
  }
}

export function saveQuoteRating(quoteId: string, rating: number): void {
  try {
    const cached = localStorage.getItem(RATINGS_KEY);
    const ratings: Record<string, number> = cached ? JSON.parse(cached) : {};

    ratings[quoteId] = rating;
    localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  } catch {}
}

export function getAllRatings(): Record<string, number> {
  try {
    const cached = localStorage.getItem(RATINGS_KEY);
    if (!cached) return {};

    return JSON.parse(cached) as Record<string, number>;
  } catch {
    return {};
  }
}

export function removeQuoteRating(quoteId: string): void {
  try {
    const cached = localStorage.getItem(RATINGS_KEY);
    if (!cached) return;

    const ratings: Record<string, number> = JSON.parse(cached);
    delete ratings[quoteId];
    localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  } catch {}
}
