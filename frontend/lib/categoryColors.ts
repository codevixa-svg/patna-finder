// Stable "random" colour pairs for category icons across pages. A hash of the
// category name/id picks a pastel background + matching icon text colour, so
// every category gets its own colours that stay identical on every page load
// (no hydration mismatch) while looking random across the list.
export interface CategoryColorPair {
  bg: string;   // Tailwind bg-* class for the chip/circle
  text: string; // Tailwind text-* class for the icon
}

export const CATEGORY_COLOR_PAIRS: CategoryColorPair[] = [
  { bg: 'bg-[#FFF4CC]', text: 'text-[#B58200]' },
  { bg: 'bg-sky-100', text: 'text-sky-600' },
  { bg: 'bg-[#FFF4CC]', text: 'text-[#B58200]' },
  { bg: 'bg-violet-100', text: 'text-violet-600' },
  { bg: 'bg-rose-100', text: 'text-rose-600' },
  { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  { bg: 'bg-orange-100', text: 'text-orange-600' },
  { bg: 'bg-teal-100', text: 'text-teal-600' },
  { bg: 'bg-pink-100', text: 'text-pink-600' },
  { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  { bg: 'bg-lime-100', text: 'text-lime-600' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-600' },
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-purple-100', text: 'text-purple-600' },
  { bg: 'bg-red-100', text: 'text-red-600' },
  { bg: 'bg-[#FFF4CC]', text: 'text-[#062B49]' },
];

/**
 * Pick a stable colour pair from a seed (category name or id). Same seed
 * always returns the same pair; different seeds spread across the palette.
 */
export function pickCategoryColorPair(
  seed: string | number | undefined | null,
): CategoryColorPair {
  const str = String(seed ?? 'category');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_COLOR_PAIRS[hash % CATEGORY_COLOR_PAIRS.length];
}