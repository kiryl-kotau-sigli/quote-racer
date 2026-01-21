import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRateQuote } from './index';
import { getQuoteRating, saveQuoteRating } from '@/shared/lib/storage/quote-ratings';

vi.mock('@/shared/lib/storage/quote-ratings');

describe('useRateQuote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with null rating when quoteId is null', () => {
    const { result } = renderHook(() => useRateQuote(null));

    expect(result.current.currentRating).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should load existing rating from storage', () => {
    vi.mocked(getQuoteRating).mockReturnValue(4);

    const { result } = renderHook(() => useRateQuote('quote-1'));

    expect(result.current.currentRating).toBe(4);
    expect(getQuoteRating).toHaveBeenCalledWith('quote-1');
  });

  it('should initialize with null when no rating exists', () => {
    vi.mocked(getQuoteRating).mockReturnValue(null);

    const { result } = renderHook(() => useRateQuote('quote-1'));

    expect(result.current.currentRating).toBeNull();
  });

  it('should update rating when quoteId changes', () => {
    vi.mocked(getQuoteRating).mockReturnValueOnce(3).mockReturnValueOnce(5);

    const { result, rerender } = renderHook(
      ({ quoteId }: { quoteId: string | null }) => useRateQuote(quoteId),
      {
        initialProps: { quoteId: 'quote-1' },
      },
    );

    expect(result.current.currentRating).toBe(3);

    rerender({ quoteId: 'quote-2' });

    expect(result.current.currentRating).toBe(5);
    expect(getQuoteRating).toHaveBeenCalledWith('quote-2');
  });

  it('should clear rating when quoteId becomes null', () => {
    vi.mocked(getQuoteRating).mockReturnValue(4);

    const { result, rerender } = renderHook(
      ({ quoteId }: { quoteId: string | null }) => useRateQuote(quoteId),
      {
        initialProps: { quoteId: 'quote-1' as string | null },
      },
    );

    expect(result.current.currentRating).toBe(4);

    rerender({ quoteId: null });

    expect(result.current.currentRating).toBeNull();
  });

  it('should save rating when rateQuote is called', async () => {
    vi.mocked(getQuoteRating).mockReturnValue(null);
    vi.mocked(saveQuoteRating).mockImplementation(() => {});

    const { result } = renderHook(() => useRateQuote('quote-1'));

    result.current.rateQuote(5);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.currentRating).toBe(5);
    });

    expect(saveQuoteRating).toHaveBeenCalledWith('quote-1', 5);
  });

  it('should not save rating when quoteId is null', () => {
    const { result } = renderHook(() => useRateQuote(null));

    result.current.rateQuote(5);

    expect(saveQuoteRating).not.toHaveBeenCalled();
    expect(result.current.currentRating).toBeNull();
  });

  it('should handle save errors gracefully', async () => {
    vi.mocked(getQuoteRating).mockReturnValue(null);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(saveQuoteRating).mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useRateQuote('quote-1'));

    result.current.rateQuote(5);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to save rating:', expect.any(Error));
    expect(result.current.currentRating).toBeNull();

    consoleErrorSpy.mockRestore();
  });

  it('should set loading state during save', async () => {
    vi.mocked(getQuoteRating).mockReturnValue(null);
    vi.mocked(saveQuoteRating).mockImplementation(() => {});

    const { result } = renderHook(() => useRateQuote('quote-1'));

    result.current.rateQuote(5);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(saveQuoteRating).toHaveBeenCalledWith('quote-1', 5);
  });
});
