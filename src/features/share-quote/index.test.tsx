import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useShareQuote } from './index';
import type { Quote } from '@/entities/quote';

describe('useShareQuote', () => {
  const mockQuote: Quote = {
    id: '1',
    text: 'Test quote text',
    author: 'Test Author',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.share
    globalThis.navigator.share = vi.fn();
    // Mock navigator.clipboard
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
    // Mock alert
    globalThis.alert = vi.fn();
    // Mock document.execCommand (deprecated but used as fallback in implementation)
    document.execCommand = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with correct state', () => {
    const { result } = renderHook(() => useShareQuote(mockQuote));

    expect(result.current.isSharing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.shareQuote).toBe('function');
  });

  it('should detect Web Share API support', () => {
    const { result } = renderHook(() => useShareQuote(mockQuote));

    // Should be true if navigator.share exists
    expect(result.current.isSupported).toBe(true);
  });

  it('should detect lack of Web Share API support', () => {
    // Remove share from navigator
    const originalShare = globalThis.navigator.share;
    delete (globalThis.navigator as any).share;

    const { result } = renderHook(() => useShareQuote(mockQuote));

    expect(result.current.isSupported).toBe(false);

    // Restore
    globalThis.navigator.share = originalShare;
  });

  it('should share using Web Share API when available', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    globalThis.navigator.share = shareMock;

    const { result } = renderHook(() => useShareQuote(mockQuote));

    await result.current.shareQuote();

    await waitFor(() => {
      expect(result.current.isSharing).toBe(false);
    });

    expect(shareMock).toHaveBeenCalledWith({
      title: 'Quote Racer',
      text: '"Test quote text"\n\n— Test Author\n\nShared via Quote Racer',
    });
    expect(result.current.error).toBeNull();
  });

  it('should fallback to clipboard when Web Share API fails', async () => {
    const shareError = new Error('Share failed');
    shareError.name = 'NotAllowedError';
    const shareMock = vi.fn().mockRejectedValue(shareError);
    globalThis.navigator.share = shareMock;
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useShareQuote(mockQuote));

    await result.current.shareQuote();

    await waitFor(() => {
      expect(result.current.isSharing).toBe(false);
    });

    expect(globalThis.navigator.clipboard.writeText).toHaveBeenCalledWith(
      '"Test quote text"\n\n— Test Author\n\nShared via Quote Racer',
    );
    expect(globalThis.alert).toHaveBeenCalledWith('Quote copied to clipboard!');
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('should not show alert when user aborts share', async () => {
    const abortError = new Error('User aborted');
    abortError.name = 'AbortError';
    const shareMock = vi.fn().mockRejectedValue(abortError);
    globalThis.navigator.share = shareMock;

    const { result } = renderHook(() => useShareQuote(mockQuote));

    await result.current.shareQuote();

    await waitFor(() => {
      expect(result.current.isSharing).toBe(false);
    });

    expect(globalThis.alert).not.toHaveBeenCalled();
    expect(globalThis.navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('should use clipboard when Web Share API is not available', async () => {
    delete (globalThis.navigator as any).share;

    const { result } = renderHook(() => useShareQuote(mockQuote));

    await result.current.shareQuote();

    await waitFor(() => {
      expect(result.current.isSharing).toBe(false);
    });

    expect(globalThis.navigator.clipboard.writeText).toHaveBeenCalled();
    expect(globalThis.alert).toHaveBeenCalledWith('Quote copied to clipboard!');
  });

  it('should handle quote without author', async () => {
    const quoteWithoutAuthor: Quote = {
      id: '2',
      text: 'Quote without author',
    };

    delete (globalThis.navigator as any).share;

    const { result } = renderHook(() => useShareQuote(quoteWithoutAuthor));

    await result.current.shareQuote();

    await waitFor(() => {
      expect(result.current.isSharing).toBe(false);
    });

    expect(globalThis.navigator.clipboard.writeText).toHaveBeenCalledWith(
      '"Quote without author"\n\nShared via Quote Racer',
    );
  });

  it('should set error when quote is null', async () => {
    const { result } = renderHook(() => useShareQuote(null));

    await result.current.shareQuote();

    await waitFor(() => {
      expect(result.current.error).toBe('No quote to share');
      expect(result.current.isSharing).toBe(false);
    });
  });

  it('should set loading state during share', async () => {
    let resolveShare: (() => void) | undefined;
    const sharePromise = new Promise<void>((resolve) => {
      resolveShare = resolve;
    });

    const shareMock = vi.fn().mockReturnValue(sharePromise);
    globalThis.navigator.share = shareMock;

    const { result } = renderHook(() => useShareQuote(mockQuote));

    const sharePromiseCall = result.current.shareQuote();

    await waitFor(() => {
      expect(result.current.isSharing).toBe(true);
    });

    resolveShare!();
    await sharePromiseCall;

    await waitFor(() => {
      expect(result.current.isSharing).toBe(false);
    });
  });

  it('should handle clipboard errors gracefully', async () => {
    delete (globalThis.navigator as any).share;
    const clipboardError = new Error('Clipboard failed');
    globalThis.navigator.clipboard.writeText = vi.fn().mockRejectedValue(clipboardError);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useShareQuote(mockQuote));

    await result.current.shareQuote();

    await waitFor(() => {
      expect(result.current.isSharing).toBe(false);
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(globalThis.alert).toHaveBeenCalledWith('Failed to copy to clipboard. Please try again.');

    consoleErrorSpy.mockRestore();
  });
});
