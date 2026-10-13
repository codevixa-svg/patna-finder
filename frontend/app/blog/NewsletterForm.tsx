'use client';

import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/api';

/**
 * "Stay Updated" newsletter form for the blog sidebar — posts to the
 * public /api/v1/newsletter/subscribe endpoint.
 */
export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const res = await api.subscribeNewsletter(email.trim(), 'blog');
      setEmail('');
      toast.success(res?.message || 'Subscribed! Latest blogs will land in your inbox.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
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
          className="w-full rounded-lg border border-[#FFF4CC] bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D89E00]"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#F4B400] py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-[#D89E00] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
    </>
  );
}