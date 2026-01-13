const SETTINGS_KEY = 'quote-racer-slideshow-settings';

export interface SlideshowSettings {
  enabled: boolean;
  intervalSeconds: number;
}

const DEFAULT_SETTINGS: SlideshowSettings = {
  enabled: true,
  intervalSeconds: 7,
};

export function getSlideshowSettings(): SlideshowSettings {
  try {
    const cached = localStorage.getItem(SETTINGS_KEY);
    if (!cached) return DEFAULT_SETTINGS;

    const settings = JSON.parse(cached) as SlideshowSettings;
    return {
      enabled: settings.enabled ?? DEFAULT_SETTINGS.enabled,
      intervalSeconds: settings.intervalSeconds ?? DEFAULT_SETTINGS.intervalSeconds,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSlideshowSettings(settings: SlideshowSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}
