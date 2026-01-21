import { z } from 'zod';
import { QUOTE_API_ENDPOINTS } from './config';
import type { QuoteApiResponse, QuoteApiError } from './types';
import type { Quote } from '../model/types';
import { API_CONFIG } from '@/shared/api/config';
import { getRandomFallbackQuote } from '@/shared/lib/constants';
import { getRandomCachedQuote, saveQuoteToCache } from '@/shared/lib/storage/quote-cache';

type QuoteApiResult =
  | { success: true; result: QuoteApiResponse; source: string }
  | { success: false; error: Error; source: string };

const DummyJsonSchema = z.object({
  id: z
    .unknown()
    .optional()
    .transform((v) => String(v ?? '')),
  quote: z.string().min(1, 'Missing quote text'),
  author: z
    .unknown()
    .optional()
    .transform((a) => (a == null ? undefined : String(a))),
});

const CatFactSchema = z.object({
  fact: z.string().min(1, 'Missing fact text'),
});

const RandomUserResultSchema = z.object({
  name: z.object({
    title: z.string().optional().default(''),
    first: z.string().optional().default(''),
    last: z.string().optional().default(''),
  }),
  location: z
    .object({
      city: z.string().optional().default(''),
      country: z.string().optional().default(''),
    })
    .optional()
    .default({ city: '', country: '' }),
});

const RandomUserSchema = z.object({
  results: z.array(RandomUserResultSchema).min(1, 'Invalid response format'),
});

function parseDummyJsonResponse(data: unknown): Quote {
  const parsed = DummyJsonSchema.parse(data);
  return {
    id: parsed.id,
    text: parsed.quote,
    author: parsed.author,
    source: 'dummyjson.com',
  };
}

function parseCatFactResponse(data: unknown): Quote {
  const parsed = CatFactSchema.parse(data);
  return {
    id: `cat-${Date.now()}-${Math.random()}`,
    text: parsed.fact,
    author: 'Random Cat Facts',
    source: 'catfact.ninja',
  };
}

function parseRandomUserResponse(data: unknown): Quote {
  const { results } = RandomUserSchema.parse(data);
  const user = results[0];
  const { name, location } = user;
  const quoteText = `${name.title} ${name.first} ${name.last}`.trim();
  const authorText = `${location.city} ${location.country}`.trim();

  if (!quoteText) {
    throw new Error('Missing name information');
  }

  return {
    id: `user-${Date.now()}-${Math.random()}`,
    text: quoteText,
    author: authorText || undefined,
    source: 'randomuser.me',
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
  } else if (endpoint.includes('catfact.ninja')) {
    quote = parseCatFactResponse(data);
  } else if (endpoint.includes('randomuser.me')) {
    quote = parseRandomUserResponse(data);
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

  try {
    const racePromises = promises.map((promise) =>
      promise.then(
        (value) => {
          if (value.success === true) {
            clearTimeout(timeoutId);
            controller.abort();
            saveQuoteToCache(value.result.quote);
            return value.result;
          } else {
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
  } catch {
    const results = await Promise.allSettled(promises);
    const errors: QuoteApiError[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success === true) {
        clearTimeout(timeoutId);
        const apiResult = result.value.result;
        saveQuoteToCache(apiResult.quote);
        return apiResult;
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

    const cachedQuote = getRandomCachedQuote();
    if (cachedQuote) {
      clearTimeout(timeoutId);
      return {
        quote: cachedQuote,
        source: 'cache',
      };
    }

    const fallbackQuote = getRandomFallbackQuote();
    clearTimeout(timeoutId);
    return {
      quote: fallbackQuote,
      source: 'offline',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
