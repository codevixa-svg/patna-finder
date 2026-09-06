'use client';

import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

/**
 * "Stay Updated" newsletter form for the blog sidebar. The newsletter
 * backend isn't wired yet — validate + acknowledge with a toast so the
 * interaction feels complete.
 */
export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEmail('');
      toast.success('Subscribed! Latest blogs will land in your inbox.');
    }, 400);
  };

  return (
    <>
      <Toaster position="top-right" />
      <form onSubmit={handleSubscribe} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="w-full rounded-lg border border-amber-100 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-400 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
    </>
  );
}