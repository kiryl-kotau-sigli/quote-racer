import type { Quote } from '../model/types';

export interface QuoteApiResponse {
  quote: Quote;
  source: string;
}

export interface QuoteApiError {
  source: string;
  error: Error;
}
