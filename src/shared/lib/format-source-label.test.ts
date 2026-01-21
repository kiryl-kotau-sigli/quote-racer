import { describe, it, expect } from 'vitest';
import { formatSourceLabel } from './format-source-label';

describe('formatSourceLabel', () => {
  it('should return null for null or undefined', () => {
    expect(formatSourceLabel(null)).toBeNull();
    expect(formatSourceLabel(undefined)).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(formatSourceLabel('')).toBeNull();
  });

  it('should extract hostname from http URL', () => {
    expect(formatSourceLabel('http://example.com/path')).toBe('example.com');
    expect(formatSourceLabel('http://api.example.com:8080/endpoint')).toBe('api.example.com');
  });

  it('should extract hostname from https URL', () => {
    expect(formatSourceLabel('https://dummyjson.com/quotes')).toBe('dummyjson.com');
    expect(formatSourceLabel('https://api.github.com/users')).toBe('api.github.com');
  });

  it('should return original source if URL parsing fails', () => {
    expect(formatSourceLabel('http://[invalid')).toBe('http://[invalid');
  });

  it('should return original source for non-URL strings', () => {
    expect(formatSourceLabel('custom-source')).toBe('custom-source');
    expect(formatSourceLabel('api-v1')).toBe('api-v1');
  });
});
