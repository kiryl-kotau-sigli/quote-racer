export function formatSourceLabel(source?: string | null): string | null {
  if (!source) {
    return null;
  }

  if (source.startsWith('http://') || source.startsWith('https://')) {
    try {
      const url = new URL(source);
      return url.hostname;
    } catch {
      return source;
    }
  }

  return source;
}
