import { useState, useCallback } from 'react';
import type { SlideshowSettings } from '@/shared/lib/storage/slideshow-settings';
import { saveSlideshowSettings } from '@/shared/lib/storage/slideshow-settings';

interface QuoteSlideshowProps {
  settings: SlideshowSettings;
  onSettingsChange: (settings: SlideshowSettings) => void;
}

export function QuoteSlideshow({ settings, onSettingsChange }: QuoteSlideshowProps) {
  const [showSettings, setShowSettings] = useState(false);

  const handleSettingsChange = useCallback(
    (newSettings: Partial<SlideshowSettings>) => {
      const updated = { ...settings, ...newSettings };
      saveSlideshowSettings(updated);
      onSettingsChange(updated);
    },
    [settings, onSettingsChange],
  );

  return (
    <>
      <div className='flex justify-between items-center mb-4 sm:mb-12'>
        <h1 className='text-2xl sm:text-4xl md:text-5xl font-bold text-gray-800'>Quote Racer</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className='px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-xs sm:text-sm font-medium cursor-pointer'
          aria-label='Toggle settings'
        >
          Settings
        </button>
      </div>

      {showSettings && (
        <div className='bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6'>
          <h2 className='text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800'>
            Slideshow Settings
          </h2>
          <div className='space-y-3 sm:space-y-4'>
            <label className='flex items-center gap-2 sm:gap-3 cursor-pointer'>
              <input
                type='checkbox'
                checked={settings.enabled}
                onChange={(e) => handleSettingsChange({ enabled: e.target.checked })}
                className='w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer'
              />
              <span className='text-sm sm:text-base text-gray-700 font-medium'>
                Enable automatic slideshow
              </span>
            </label>
            {settings.enabled && (
              <div className='pl-6 sm:pl-8'>
                <label className='block text-sm sm:text-base text-gray-700 mb-2'>
                  Interval: {settings.intervalSeconds} second
                  {settings.intervalSeconds !== 1 ? 's' : ''}
                </label>
                <input
                  type='range'
                  min='3'
                  max='30'
                  value={settings.intervalSeconds}
                  onChange={(e) =>
                    handleSettingsChange({ intervalSeconds: parseInt(e.target.value, 10) })
                  }
                  className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600'
                />
                <div className='flex justify-between text-xs text-gray-500 mt-1'>
                  <span>3s</span>
                  <span>30s</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
