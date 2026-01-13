import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSlideshowSettings,
  saveSlideshowSettings,
  type SlideshowSettings,
} from './slideshow-settings';

describe('slideshow-settings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getSlideshowSettings', () => {
    it('should return default settings when localStorage is empty', () => {
      const settings = getSlideshowSettings();
      expect(settings).toEqual({
        enabled: false,
        intervalSeconds: 10,
      });
    });

    it('should return saved settings from localStorage', () => {
      const savedSettings: SlideshowSettings = {
        enabled: true,
        intervalSeconds: 15,
      };
      localStorage.setItem('quote-racer-slideshow-settings', JSON.stringify(savedSettings));

      const settings = getSlideshowSettings();
      expect(settings).toEqual(savedSettings);
    });

    it('should handle partial settings and use defaults for missing fields', () => {
      localStorage.setItem('quote-racer-slideshow-settings', JSON.stringify({ enabled: true }));

      const settings = getSlideshowSettings();
      expect(settings.enabled).toBe(true);
      expect(settings.intervalSeconds).toBe(10);
    });

    it('should return default settings when localStorage has invalid JSON', () => {
      localStorage.setItem('quote-racer-slideshow-settings', 'invalid-json');

      const settings = getSlideshowSettings();
      expect(settings).toEqual({
        enabled: false,
        intervalSeconds: 10,
      });
    });
  });

  describe('saveSlideshowSettings', () => {
    it('should save settings to localStorage', () => {
      const settings: SlideshowSettings = {
        enabled: true,
        intervalSeconds: 20,
      };

      saveSlideshowSettings(settings);

      const saved = localStorage.getItem('quote-racer-slideshow-settings');
      expect(saved).toBe(JSON.stringify(settings));
    });

    it('should overwrite existing settings', () => {
      const initialSettings: SlideshowSettings = {
        enabled: false,
        intervalSeconds: 5,
      };
      saveSlideshowSettings(initialSettings);

      const newSettings: SlideshowSettings = {
        enabled: true,
        intervalSeconds: 25,
      };
      saveSlideshowSettings(newSettings);

      const saved = JSON.parse(localStorage.getItem('quote-racer-slideshow-settings') || '{}');
      expect(saved).toEqual(newSettings);
    });

    it('should handle localStorage errors gracefully', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('Storage quota exceeded');
      };

      const settings: SlideshowSettings = {
        enabled: true,
        intervalSeconds: 15,
      };

      expect(() => saveSlideshowSettings(settings)).not.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });
});
