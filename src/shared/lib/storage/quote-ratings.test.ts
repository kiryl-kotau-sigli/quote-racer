import { describe, it, expect, beforeEach } from 'vitest';
import { getQuoteRating, saveQuoteRating, getAllRatings, removeQuoteRating } from './quote-ratings';

describe('quote-ratings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getQuoteRating', () => {
    it('should return null when no ratings exist', () => {
      expect(getQuoteRating('quote-1')).toBeNull();
    });

    it('should return null for non-existent quote ID', () => {
      saveQuoteRating('quote-1', 5);
      expect(getQuoteRating('quote-2')).toBeNull();
    });

    it('should return saved rating for quote ID', () => {
      saveQuoteRating('quote-1', 4);
      expect(getQuoteRating('quote-1')).toBe(4);
    });

    it('should return null when localStorage has invalid JSON', () => {
      localStorage.setItem('quote-racer-ratings', 'invalid-json');
      expect(getQuoteRating('quote-1')).toBeNull();
    });
  });

  describe('saveQuoteRating', () => {
    it('should save rating for a quote', () => {
      saveQuoteRating('quote-1', 5);
      expect(getQuoteRating('quote-1')).toBe(5);
    });

    it('should overwrite existing rating', () => {
      saveQuoteRating('quote-1', 3);
      saveQuoteRating('quote-1', 5);
      expect(getQuoteRating('quote-1')).toBe(5);
    });

    it('should save multiple ratings independently', () => {
      saveQuoteRating('quote-1', 4);
      saveQuoteRating('quote-2', 5);
      saveQuoteRating('quote-3', 3);

      expect(getQuoteRating('quote-1')).toBe(4);
      expect(getQuoteRating('quote-2')).toBe(5);
      expect(getQuoteRating('quote-3')).toBe(3);
    });

    it('should handle localStorage errors gracefully', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('Storage quota exceeded');
      };

      expect(() => saveQuoteRating('quote-1', 5)).not.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });

  describe('getAllRatings', () => {
    it('should return empty object when no ratings exist', () => {
      expect(getAllRatings()).toEqual({});
    });

    it('should return all ratings', () => {
      saveQuoteRating('quote-1', 4);
      saveQuoteRating('quote-2', 5);
      saveQuoteRating('quote-3', 3);

      const allRatings = getAllRatings();
      expect(allRatings).toEqual({
        'quote-1': 4,
        'quote-2': 5,
        'quote-3': 3,
      });
    });

    it('should return empty object when localStorage has invalid JSON', () => {
      localStorage.setItem('quote-racer-ratings', 'invalid-json');
      expect(getAllRatings()).toEqual({});
    });
  });

  describe('removeQuoteRating', () => {
    it('should remove rating for a quote', () => {
      saveQuoteRating('quote-1', 5);
      removeQuoteRating('quote-1');
      expect(getQuoteRating('quote-1')).toBeNull();
    });

    it('should not affect other ratings when removing one', () => {
      saveQuoteRating('quote-1', 4);
      saveQuoteRating('quote-2', 5);
      saveQuoteRating('quote-3', 3);

      removeQuoteRating('quote-2');

      expect(getQuoteRating('quote-1')).toBe(4);
      expect(getQuoteRating('quote-2')).toBeNull();
      expect(getQuoteRating('quote-3')).toBe(3);
    });

    it('should handle removing non-existent rating gracefully', () => {
      expect(() => removeQuoteRating('non-existent')).not.toThrow();
    });

    it('should handle localStorage errors gracefully', () => {
      saveQuoteRating('quote-1', 5);

      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('Storage quota exceeded');
      };

      expect(() => removeQuoteRating('quote-1')).not.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });
});
