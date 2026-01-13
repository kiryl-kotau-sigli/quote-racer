export interface Quote {
  id: string;
  text: string;
  author?: string;
  source?: string;
}

export interface QuoteRating {
  quoteId: string;
  rating: number;
}
