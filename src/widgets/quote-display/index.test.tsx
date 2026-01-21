import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuoteDisplay } from './index';
import type { Quote } from '@/entities/quote';

vi.mock('@/shared/ui/star-rating', () => ({
  StarRating: ({ rating, onRate }: { rating: number | null; onRate: (r: number) => void }) => (
    <div data-testid='star-rating'>
      <button onClick={() => onRate(5)}>Rate 5</button>
      <span>Rating: {rating ?? 'none'}</span>
    </div>
  ),
}));

vi.mock('@/shared/ui/share-button', () => ({
  ShareButton: ({ onShare, isSharing }: { onShare: () => Promise<void>; isSharing: boolean }) => (
    <button onClick={onShare} disabled={isSharing} data-testid='share-button'>
      {isSharing ? 'Sharing...' : 'Share'}
    </button>
  ),
}));

describe('QuoteDisplay', () => {
  const mockQuote: Quote = {
    id: '1',
    text: 'Test quote text',
    author: 'Test Author',
  };

  const defaultProps = {
    quote: mockQuote,
    source: 'https://api.example.com',
    currentRating: null,
    isSharing: false,
    isLoadingNext: false,
    onRate: vi.fn(),
    onShare: vi.fn().mockResolvedValue(undefined),
    onNext: vi.fn(),
  };

  it('should render quote text', () => {
    render(<QuoteDisplay {...defaultProps} />);

    expect(screen.getByText(/Test quote text/)).toBeInTheDocument();
  });

  it('should render author when provided', () => {
    render(<QuoteDisplay {...defaultProps} />);

    expect(screen.getByText(/Test Author/)).toBeInTheDocument();
  });

  it('should not show author dash when author not provided', () => {
    const quoteWithoutAuthor: Quote = {
      id: '2',
      text: 'Quote without author',
    };

    render(<QuoteDisplay {...defaultProps} quote={quoteWithoutAuthor} />);

    expect(screen.queryByText(/—/)).not.toBeInTheDocument();
  });

  it('should render source label when source is provided', () => {
    render(<QuoteDisplay {...defaultProps} />);

    expect(screen.getByText(/Source: api.example.com/)).toBeInTheDocument();
  });

  it('should not render source when source is null', () => {
    render(<QuoteDisplay {...defaultProps} source={null} />);

    expect(screen.queryByText(/Source:/)).not.toBeInTheDocument();
  });

  it('should show Loading and disable Next button when isLoadingNext', () => {
    render(<QuoteDisplay {...defaultProps} isLoadingNext={true} />);

    const nextButton = screen.getByRole('button', { name: /Loading/ });
    expect(nextButton).toHaveTextContent('Loading...');
    expect(nextButton).toBeDisabled();
  });

  it('should show Next Quote and enable button when not loading next', () => {
    render(<QuoteDisplay {...defaultProps} isLoadingNext={false} />);

    const nextButton = screen.getByRole('button', { name: /Next Quote/ });
    expect(nextButton).toHaveTextContent('Next Quote');
    expect(nextButton).not.toBeDisabled();
  });

  it('should call onRate when rating is selected', async () => {
    const user = userEvent.setup();
    const onRate = vi.fn();

    render(<QuoteDisplay {...defaultProps} onRate={onRate} />);

    const rateButton = screen.getByText('Rate 5');
    await user.click(rateButton);

    expect(onRate).toHaveBeenCalledWith(5);
  });

  it('should call onShare when share button is clicked', async () => {
    const user = userEvent.setup();
    const onShare = vi.fn().mockResolvedValue(undefined);

    render(<QuoteDisplay {...defaultProps} onShare={onShare} />);

    const shareButton = screen.getByTestId('share-button');
    await user.click(shareButton);

    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it('should disable share button when isSharing is true', () => {
    render(<QuoteDisplay {...defaultProps} isSharing={true} />);

    const shareButton = screen.getByTestId('share-button');
    expect(shareButton).toBeDisabled();
    expect(shareButton).toHaveTextContent('Sharing...');
  });

  it('should call onNext when Next Quote button is clicked', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();

    render(<QuoteDisplay {...defaultProps} onNext={onNext} />);

    const nextButton = screen.getByText('Next Quote');
    await user.click(nextButton);

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('should display current rating', () => {
    render(<QuoteDisplay {...defaultProps} currentRating={4} />);

    expect(screen.getByText('Rating: 4')).toBeInTheDocument();
  });

  it('should display "none" when no rating is set', () => {
    render(<QuoteDisplay {...defaultProps} currentRating={null} />);

    expect(screen.getByText('Rating: none')).toBeInTheDocument();
  });
});
