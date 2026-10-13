'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

/**
 * Newsletter subscribe form for the footer — posts to the public
 * /api/v1/newsletter/subscribe endpoint (idempotent on the backend).
 */
export default function FooterNewsletter() {
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
      const res = await api.subscribeNewsletter(trimmed, 'footer');
      setMessage(res?.message || 'Subscribed successfully!');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(null);
        }}
        placeholder="Enter your email"
        aria-label="Email address for newsletter"
        className="
          w-full
          bg-white
          text-[#102A43]
          text-sm
          rounded-lg
          px-4
          py-3
          placeholder-[#94A3B8]
          border border-transparent
          outline-none
          focus:border-[#F4B400]
          focus:ring-2
          focus:ring-[#F4B400]/20
          transition
        "
      />

      {error && (
        <p className="text-xs text-red-300" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="text-xs text-green-300" role="status">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="
          w-full
          bg-[#F4B400]
          text-[#062B49]
          py-3
          rounded-lg
          font-bold
          text-sm
          hover:bg-[#FFD35A]
          hover:-translate-y-0.5
          transition-all
          shadow-lg
          shadow-[#F4B400]/10
          disabled:opacity-60
          disabled:cursor-not-allowed
          disabled:hover:translate-y-0
        "
      >
        {loading ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  );
}
