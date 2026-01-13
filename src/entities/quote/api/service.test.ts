import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { raceQuoteApis } from './service';

// Mock fetch globally
globalThis.fetch = vi.fn() as typeof fetch;

describe('raceQuoteApis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return the fastest successful response from dummyjson.com', async () => {
    const dummyJsonResponse = {
      id: 420,
      quote: 'The highest person is he who is of most use to humankind.',
      author: 'Ali ibn Abi Talib (R.A)',
    };

    const catFactResponse = {
      fact: "A cat's nose is as unique as a human's fingerprint.",
      length: 51,
    };

    // Mock fetch to return dummyjson faster
    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(dummyJsonResponse),
        }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve(catFactResponse),
                }),
              100,
            );
          }),
      );

    const result = await raceQuoteApis();

    expect(result.quote.text).toBe(dummyJsonResponse.quote);
    expect(result.quote.author).toBe(dummyJsonResponse.author);
    expect(result.quote.id).toBe('420');
    expect(result.source).toContain('dummyjson.com');
  });

  it('should handle missing author field in dummyjson response', async () => {
    const dummyJsonResponse = {
      id: 123,
      quote: 'A quote without an author',
    };

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(dummyJsonResponse),
    });

    const result = await raceQuoteApis();

    expect(result.quote.text).toBe(dummyJsonResponse.quote);
    expect(result.quote.author).toBeUndefined();
  });

  it('should parse catfact.ninja response correctly', async () => {
    const catFactResponse = {
      fact: "A cat's nose is as unique as a human's fingerprint.",
      length: 51,
    };

    let callCount = 0;
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call (dummyjson) - will fail
        return new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: false,
                status: 500,
              }),
            50,
          );
        });
      } else {
        // Second call (catfact) - succeeds
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(catFactResponse),
        });
      }
    });

    const result = await raceQuoteApis();

    expect(result.quote.text).toBe(catFactResponse.fact);
    expect(result.quote.author).toBe('Random Cat Facts');
    expect(result.quote.id).toContain('cat-');
    expect(result.source).toContain('catfact.ninja');
  });

  it('should throw error when all APIs fail', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    await expect(raceQuoteApis()).rejects.toThrow();
  });

  it('should throw error when API returns invalid response format', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ invalid: 'data' }),
    });

    await expect(raceQuoteApis()).rejects.toThrow();
  });

  it('should throw error when API returns empty quote text', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, quote: '', author: 'Test' }),
    });

    await expect(raceQuoteApis()).rejects.toThrow('Missing quote text');
  });

  it('should handle HTTP error responses', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(raceQuoteApis()).rejects.toThrow();
  });

  it('should respect timeout configuration', async () => {
    // Mock fetch to delay longer than timeout and respect abort signal
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      (_url: string, options?: { signal?: AbortSignal }) => {
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            if (options?.signal?.aborted) {
              const abortError = new Error('The operation was aborted');
              abortError.name = 'AbortError';
              reject(abortError);
            } else {
              resolve({
                ok: true,
                json: () =>
                  Promise.resolve({
                    id: 1,
                    quote: 'Test quote',
                    author: 'Test Author',
                  }),
              });
            }
          }, 200); // 200ms delay

          // Listen for abort
          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              clearTimeout(timeoutId);
              const abortError = new Error('The operation was aborted');
              abortError.name = 'AbortError';
              reject(abortError);
            });
          }
        });
      },
    );

    // Use a short timeout (50ms) - should abort before responses arrive
    await expect(raceQuoteApis(50)).rejects.toThrow();
  }, 5000); // Increase test timeout to 5 seconds
});
