export function normalizeQuery(query: string): string {
  if (!query) return "";
  return query
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();
}

export function stripS(str: string): string {
  if (!str) return "";
  return str.endsWith('s') ? str.slice(0, -1) : str;
}

// Basic synonym dictionary for jewelry
export const searchSynonyms: Record<string, string> = {
  'band': 'rings',
  'bands': 'rings',
  'chain': 'necklaces',
  'chains': 'necklaces',
  'anklet': 'anklets',
  'anklets': 'anklets',
  'mens': 'mens',
  'men': 'mens',
  'bangle': 'bangles'
};
