export default function makeCacheKey(base: string, params?: Record<string, string | number>): string {
  if (!params || Object.keys(params).length === 0) return base;
  const sortedKeys = Object.keys(params).sort();
  const query = sortedKeys.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`).join('&');
  return `${base}?${query}`;
}
