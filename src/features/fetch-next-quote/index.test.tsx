import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFetchQuote } from './index';
import { raceQuoteApis } from '@/entities/quote/api/service';
import type { Quote } from '@/entities/quote';

vi.mock('@/entities/quote/api/service');

describe('useFetchQuote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null quote and no loading state', () => {
    const { result } = renderHook(() => useFetchQuote());

    expect(result.current.quote).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.source).toBeNull();
  });

  it('should fetch quote successfully', async () => {
    const mockQuote: Quote = {
      id: '1',
      text: 'Test quote',
      author: 'Test Author',
    };
    const mockSource = 'https://api.example.com';

    vi.mocked(raceQuoteApis).mockResolvedValueOnce({
      quote: mockQuote,
      source: mockSource,
    });

    const { result } = renderHook(() => useFetchQuote());

    await result.current.fetchQuote();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.quote).toEqual(mockQuote);
    });

    expect(result.current.source).toBe(mockSource);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Network error';
    vi.mocked(raceQuoteApis).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useFetchQuote());

    await result.current.fetchQuote();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    expect(result.current.quote).toBeNull();
    expect(result.current.source).toBeNull();
  });

  it('should handle non-Error rejection', async () => {
    vi.mocked(raceQuoteApis).mockRejectedValueOnce('String error');

    const { result } = renderHook(() => useFetchQuote());

    await result.current.fetchQuote();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to fetch quote');
    });
  });

  it('should set loading state during fetch', async () => {
    let resolvePromise: (value: { quote: Quote; source: string }) => void;
    const promise = new Promise<{ quote: Quote; source: string }>((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(raceQuoteApis).mockReturnValueOnce(promise);

    const { result } = renderHook(() => useFetchQuote());

    const fetchPromise = result.current.fetchQuote();

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    resolvePromise!({
      quote: { id: '1', text: 'Test', author: 'Author' },
      source: 'test',
    });

    await fetchPromise;

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should clear previous quote and error when fetching new quote', async () => {
    const mockQuote1: Quote = { id: '1', text: 'Quote 1', author: 'Author 1' };
    const mockQuote2: Quote = { id: '2', text: 'Quote 2', author: 'Author 2' };

    vi.mocked(raceQuoteApis)
      .mockResolvedValueOnce({ quote: mockQuote1, source: 'source1' })
      .mockResolvedValueOnce({ quote: mockQuote2, source: 'source2' });

    const { result } = renderHook(() => useFetchQuote());

    await result.current.fetchQuote();
    await waitFor(() => expect(result.current.quote).toEqual(mockQuote1));

    await result.current.fetchQuote();
    await waitFor(() => expect(result.current.quote).toEqual(mockQuote2));
  });
});
