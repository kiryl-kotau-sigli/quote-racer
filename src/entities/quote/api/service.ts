import { QUOTE_API_ENDPOINTS } from './config';
import type { QuoteApiResponse, QuoteApiError } from './types';
import type { Quote } from '../model/types';
import { API_CONFIG } from '@/shared/api/config';

type QuoteApiResult =
  | { success: true; result: QuoteApiResponse; source: string }
  | { success: false; error: Error; source: string };

function parseDummyJsonResponse(data: unknown): Quote {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid response format');
  }

  const obj = data as Record<string, unknown>;
  const id = String(obj.id ?? '');
  const quote = String(obj.quote ?? '');
  const author = obj.author ? String(obj.author) : undefined;

  if (!quote) {
    throw new Error('Missing quote text');
  }

  return {
    id,
    text: quote,
    author,
    source: 'dummyjson.com',
  };
}

function parseZenQuotesResponse(data: unknown): Quote {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid response format');
  }

  const item = data[0] as Record<string, unknown>;
  const quote = String(item.q ?? '');
  const author = item.a ? String(item.a) : undefined;

  if (!quote) {
    throw new Error('Missing quote text');
  }

  return {
    id: `zen-${Date.now()}-${Math.random()}`,
    text: quote,
    author,
    source: 'api.viewbits.com',
  };
}

function parseProgrammingQuotesResponse(data: unknown): Quote {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid response format');
  }

  const obj = data as Record<string, unknown>;
  const quote = String(obj.quote ?? '');
  const author = obj.author ? String(obj.author) : undefined;

  if (!quote) {
    throw new Error('Missing quote text');
  }

  return {
    id: `prog-${Date.now()}-${Math.random()}`,
    text: quote,
    author,
    source: 'programming-quotesapi.vercel.app',
  };
}

async function fetchQuoteFromEndpoint(
  endpoint: string,
  signal: AbortSignal,
): Promise<QuoteApiResponse> {
  const response = await fetch(endpoint, { signal });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  let quote: Quote;
  if (endpoint.includes('dummyjson.com')) {
    quote = parseDummyJsonResponse(data);
  } else if (endpoint.includes('viewbits.com')) {
    quote = parseZenQuotesResponse(data);
  } else if (endpoint.includes('programming-quotesapi.vercel.app')) {
    quote = parseProgrammingQuotesResponse(data);
  } else {
    throw new Error(`Unknown API endpoint: ${endpoint}`);
  }

  return {
    quote,
    source: endpoint,
  };
}

export async function raceQuoteApis(
  timeout: number = API_CONFIG.timeout,
): Promise<QuoteApiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const promises = QUOTE_API_ENDPOINTS.map((endpoint) =>
    fetchQuoteFromEndpoint(endpoint, controller.signal)
      .then((result): QuoteApiResult => ({ success: true, result, source: endpoint }))
      .catch((error): QuoteApiResult => ({ success: false, error, source: endpoint })),
  );

  const errors: QuoteApiError[] = [];

  try {
    const racePromises = promises.map((promise) =>
      promise.then(
        (value) => {
          if (value.success === true) {
            clearTimeout(timeoutId);
            controller.abort();
            return value.result;
          } else {
            errors.push({
              source: value.source,
              error: value.error as Error,
            });
            return Promise.reject(new Error('__REQUEST_FAILED__'));
          }
        },
        (error) => {
          return Promise.reject(error);
        },
      ),
    );

    const result = await Promise.race(racePromises);
    return result;
  } catch (error) {
    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success === true) {
        clearTimeout(timeoutId);
        return result.value.result;
      }
    }

    for (const result of results) {
      if (result.status === 'fulfilled' && !result.value.success) {
        errors.push({
          source: result.value.source,
          error: result.value.error as Error,
        });
      } else if (result.status === 'rejected') {
        errors.push({
          source: 'unknown',
          error: result.reason as Error,
        });
      }
    }

    throw new Error(
      `All quote APIs failed. Errors: ${errors
        .map((e) => `${e.source}: ${e.error.message}`)
        .join(', ')}`,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
