'use client';

import { useRouter } from 'next/navigation';

/**
 * Sort dropdown for the blog listing — pushes ?sort= into the URL and
 * resets pagination. Server component re-fetches with the new params.
 */
export default function BlogSortSelect({ value, category }: { value: string; category?: string }) {
  const router = useRouter();

  const handleChange = (v: string) => {
    const sp = new URLSearchParams();
    if (category) sp.set('category', category);
    if (v !== 'latest') sp.set('sort', v);
    const qs = sp.toString();
    router.push(qs ? `/blog?${qs}` : '/blog');
  };

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="Sort blogs"
      className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition focus:outline-none focus:ring-2 focus:ring-amber-500"
    >
      <option value="latest">Latest</option>
      <option value="oldest">Oldest</option>
    </select>
  );
}