/**
 * Normalizes Arabic text for consistent, insensitive searching.
 * - Strips Arabic diacritics (tashkeel & tatweel).
 * - Unifies alef variants (أ, إ, آ, ٱ -> ا).
 * - Unifies yaa / alef maqsura (ى -> ي).
 * - Unifies taa marbuta / haa (ة -> ه) for flexible name matching (e.g. فاطمة / فاطمه).
 * - Trims and lowercases Latin characters.
 */
export const normalizeArabic = (text: string | null | undefined): string => {
  if (!text) return "";
  return String(text)
    .trim()
    .toLowerCase()
    // Remove Arabic diacritics (tashkeel) and tatweel (\u0640)
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    // Normalize Alef variants
    .replace(/[أإآٱ]/g, "ا")
    // Normalize Alef Maqsura to Yaa
    .replace(/ى/g, "ي")
    // Normalize Taa Marbuta to Haa
    .replace(/ة/g, "ه");
};

/**
 * Checks if a search query matches any of the candidate fields using normalized Arabic matching.
 * Returns true if query is empty or if any field includes the normalized query.
 */
export const matchesSearch = (
  query: string | null | undefined,
  ...fields: (string | null | undefined)[]
): boolean => {
  if (!query || !query.trim()) return true;
  const normalizedQuery = normalizeArabic(query);
  return fields.some((field) => {
    if (!field) return false;
    return normalizeArabic(field).includes(normalizedQuery);
  });
};
