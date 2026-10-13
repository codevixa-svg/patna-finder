'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

/**
 * "Never Miss an Event" newsletter form (events sidebar) — posts to the
 * public /api/v1/newsletter/subscribe endpoint.
 */
export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await api.subscribeNewsletter(trimmed, 'events');
      setMessage(res?.message || 'Subscribed successfully!');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(null);
        }}
        placeholder="Your email address"
        aria-label="Email address for newsletter"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3A63]"
      />

      {error && (
        <p className="text-xs text-red-600 mb-2" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="text-xs text-green-700 mb-2" role="status">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#062B49] hover:bg-[#062B49] text-white font-semibold py-2 px-4 rounded-lg transition text-xs disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  );
}
