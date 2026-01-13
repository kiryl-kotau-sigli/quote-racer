import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { QuoteSlideshow } from './index';
import type { SlideshowSettings } from '@/shared/lib/storage/slideshow-settings';
import { saveSlideshowSettings } from '@/shared/lib/storage/slideshow-settings';

vi.mock('@/shared/lib/storage/slideshow-settings', () => ({
  saveSlideshowSettings: vi.fn(),
}));

describe('QuoteSlideshow', () => {
  const defaultSettings: SlideshowSettings = {
    enabled: false,
    intervalSeconds: 10,
  };

  const defaultProps = {
    settings: defaultSettings,
    onSettingsChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title and settings button', () => {
    render(<QuoteSlideshow {...defaultProps} />);

    expect(screen.getByText('Quote Racer')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should not show settings panel initially', () => {
    render(<QuoteSlideshow {...defaultProps} />);

    expect(screen.queryByText('Slideshow Settings')).not.toBeInTheDocument();
  });

  it('should show settings panel when settings button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuoteSlideshow {...defaultProps} />);

    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);

    expect(screen.getByText('Slideshow Settings')).toBeInTheDocument();
  });

  it('should hide settings panel when settings button is clicked again', async () => {
    const user = userEvent.setup();
    render(<QuoteSlideshow {...defaultProps} />);

    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);
    expect(screen.getByText('Slideshow Settings')).toBeInTheDocument();

    await user.click(settingsButton);
    expect(screen.queryByText('Slideshow Settings')).not.toBeInTheDocument();
  });

  it('should render enabled checkbox', async () => {
    const user = userEvent.setup();
    render(<QuoteSlideshow {...defaultProps} />);

    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);

    const checkbox = screen.getByLabelText(/Enable automatic slideshow/i);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('should toggle enabled setting when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onSettingsChange = vi.fn();

    render(<QuoteSlideshow {...defaultProps} onSettingsChange={onSettingsChange} />);

    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);

    const checkbox = screen.getByLabelText(/Enable automatic slideshow/i);
    await user.click(checkbox);

    expect(onSettingsChange).toHaveBeenCalledWith({
      enabled: true,
      intervalSeconds: 10,
    });
    expect(saveSlideshowSettings).toHaveBeenCalledWith({
      enabled: true,
      intervalSeconds: 10,
    });
  });

  it('should show interval slider when enabled is true', async () => {
    const user = userEvent.setup();
    const enabledSettings: SlideshowSettings = {
      enabled: true,
      intervalSeconds: 15,
    };

    render(<QuoteSlideshow {...defaultProps} settings={enabledSettings} />);

    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);

    expect(screen.getByText(/Interval: 15 seconds/)).toBeInTheDocument();
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveValue('15');
  });

  it('should not show interval slider when enabled is false', async () => {
    const user = userEvent.setup();
    render(<QuoteSlideshow {...defaultProps} />);

    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);

    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('should update interval when slider is changed', async () => {
    const user = userEvent.setup();
    const onSettingsChange = vi.fn();
    const enabledSettings: SlideshowSettings = {
      enabled: true,
      intervalSeconds: 10,
    };

    render(
      <QuoteSlideshow
        {...defaultProps}
        settings={enabledSettings}
        onSettingsChange={onSettingsChange}
      />,
    );

    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);

    const slider = screen.getByRole('slider') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '20' } });

    expect(onSettingsChange).toHaveBeenCalledWith({
      enabled: true,
      intervalSeconds: 20,
    });
    expect(saveSlideshowSettings).toHaveBeenCalledWith({
      enabled: true,
      intervalSeconds: 20,
    });
  });

  it('should display singular "second" when interval is 1', async () => {
    const user = userEvent.setup();
    const enabledSettings: SlideshowSettings = {
      enabled: true,
      intervalSeconds: 1,
    };

    render(<QuoteSlideshow {...defaultProps} settings={enabledSettings} />);

    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);

    expect(screen.getByText(/Interval: 1 second$/)).toBeInTheDocument();
  });

  it('should display plural "seconds" when interval is not 1', async () => {
    const user = userEvent.setup();
    const enabledSettings: SlideshowSettings = {
      enabled: true,
      intervalSeconds: 5,
    };

    render(<QuoteSlideshow {...defaultProps} settings={enabledSettings} />);

    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);

    expect(screen.getByText(/Interval: 5 seconds/)).toBeInTheDocument();
  });

  it('should show min and max labels for interval slider', async () => {
    const user = userEvent.setup();
    const enabledSettings: SlideshowSettings = {
      enabled: true,
      intervalSeconds: 10,
    };

    render(<QuoteSlideshow {...defaultProps} settings={enabledSettings} />);

    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);

    expect(screen.getByText('3s')).toBeInTheDocument();
    expect(screen.getByText('30s')).toBeInTheDocument();
  });

  it('should have correct slider min and max attributes', async () => {
    const user = userEvent.setup();
    const enabledSettings: SlideshowSettings = {
      enabled: true,
      intervalSeconds: 10,
    };

    render(<QuoteSlideshow {...defaultProps} settings={enabledSettings} />);

    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '3');
    expect(slider).toHaveAttribute('max', '30');
  });
});
