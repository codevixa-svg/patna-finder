'use client';

import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const STORAGE_KEY = 'pf-saved-posts';

function readSaved(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * "Save for later" pill shown over the blog hero image. Stores post slugs in
 * localStorage so readers can bookmark articles without an account.
 */
export default function SaveForLaterButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSaved().includes(slug));
  }, [slug]);

  const toggle = () => {
    const current = readSaved();
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable (private mode etc.) — still show feedback
    }
    setSaved(next.includes(slug));
    if (next.includes(slug)) {
      toast.success('Saved for later');
    } else {
      toast('Removed from saved posts', { icon: '🔖' });
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={saved}
        className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-semibold text-gray-800 shadow-md backdrop-blur transition hover:bg-white"
      >
        <Bookmark
          size={14}
          className={saved ? 'fill-amber-500 text-amber-500' : 'text-gray-500'}
        />
        {saved ? 'Saved' : 'Save for later'}
      </button>
    </>
  );
}
