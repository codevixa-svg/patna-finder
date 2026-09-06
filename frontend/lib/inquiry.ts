const CONTACT_EMAIL = 'hello@patnafinder.com';

/**
 * Submits an inquiry (contact / claim-business). Tries the backend endpoint
 * first; if the API is unavailable it gracefully falls back to opening the
 * visitor's email client with the message pre-filled, so a submission is
 * never silently lost.
 */
export async function submitInquiry(
  topic: string,
  payload: Record<string, string>,
): Promise<{ via: 'api' | 'mailto' }> {
  const readable = Object.entries(payload)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/inquiries`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ topic, ...payload }),
      },
    );
    if (res.ok) return { via: 'api' };
  } catch {
    // API down — fall through to the mailto hand-off
  }

  const subject = encodeURIComponent(`[${topic}] Patna Finder inquiry`);
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${encodeURIComponent(readable)}`;
  return { via: 'mailto' };
}
