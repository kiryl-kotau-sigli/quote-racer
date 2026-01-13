import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSlideshowControl } from './index';

describe('useSlideshowControl', () => {
  const mockOnNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should not start interval when disabled', () => {
    renderHook(() =>
      useSlideshowControl({
        enabled: false,
        intervalSeconds: 5,
        onNext: mockOnNext,
        isReady: true,
      }),
    );

    vi.advanceTimersByTime(6000);

    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('should not start interval when not ready', () => {
    renderHook(() =>
      useSlideshowControl({
        enabled: true,
        intervalSeconds: 5,
        onNext: mockOnNext,
        isReady: false,
      }),
    );

    vi.advanceTimersByTime(6000);

    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('should call onNext after interval when enabled and ready', () => {
    renderHook(() =>
      useSlideshowControl({
        enabled: true,
        intervalSeconds: 5,
        onNext: mockOnNext,
        isReady: true,
      }),
    );

    // Advance past the initial delay (300ms) + interval (5000ms)
    vi.advanceTimersByTime(5300);

    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('should call onNext multiple times with correct interval', () => {
    renderHook(() =>
      useSlideshowControl({
        enabled: true,
        intervalSeconds: 2,
        onNext: mockOnNext,
        isReady: true,
      }),
    );

    // First call: 2300ms (300ms delay + 2000ms interval)
    vi.advanceTimersByTime(2300);
    expect(mockOnNext).toHaveBeenCalledTimes(1);

    // Second call: another 2000ms
    vi.advanceTimersByTime(2000);
    expect(mockOnNext).toHaveBeenCalledTimes(2);

    // Third call: another 2000ms
    vi.advanceTimersByTime(2000);
    expect(mockOnNext).toHaveBeenCalledTimes(3);
  });

  it('should stop animation when stopAnimation is called', () => {
    const { result } = renderHook(() =>
      useSlideshowControl({
        enabled: true,
        intervalSeconds: 5,
        onNext: mockOnNext,
        isReady: true,
      }),
    );

    result.current.stopAnimation();

    vi.advanceTimersByTime(10000);

    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('should restart interval when settings change', () => {
    const { rerender } = renderHook(
      ({ enabled, intervalSeconds, isReady }) =>
        useSlideshowControl({
          enabled,
          intervalSeconds,
          onNext: mockOnNext,
          isReady,
        }),
      {
        initialProps: {
          enabled: true,
          intervalSeconds: 5,
          isReady: true,
        },
      },
    );

    // Advance partway through first interval
    vi.advanceTimersByTime(3000);
    expect(mockOnNext).not.toHaveBeenCalled();

    // Change interval
    rerender({
      enabled: true,
      intervalSeconds: 2,
      isReady: true,
    });

    // Should restart, so need to wait full new interval
    vi.advanceTimersByTime(2300);
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('should clear interval on unmount', () => {
    const { unmount } = renderHook(() =>
      useSlideshowControl({
        enabled: true,
        intervalSeconds: 5,
        onNext: mockOnNext,
        isReady: true,
      }),
    );

    unmount();

    vi.advanceTimersByTime(10000);

    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('should handle rapid enable/disable changes', () => {
    const { rerender } = renderHook(
      ({ enabled }) =>
        useSlideshowControl({
          enabled,
          intervalSeconds: 2,
          onNext: mockOnNext,
          isReady: true,
        }),
      {
        initialProps: { enabled: true },
      },
    );

    vi.advanceTimersByTime(1000);

    rerender({ enabled: false });
    vi.advanceTimersByTime(2000);

    rerender({ enabled: true });
    vi.advanceTimersByTime(2300);

    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });
});
