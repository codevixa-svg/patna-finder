/**
 * Converts a title into a URL-safe slug: lowercase, accents stripped,
 * non-alphanumerics collapsed into single hyphens, no leading/trailing
 * hyphens. Mirrors Laravel's `Str::slug()` closely enough that the
 * auto-generated preview matches what the backend produces.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents/diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Lenient sanitiser for live typing in the slug field — keeps trailing
 * hyphens so the admin can type "my-post-" naturally; final cleanup
 * happens on blur/submit.
 */
export function sanitizeSlugInput(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-');
}