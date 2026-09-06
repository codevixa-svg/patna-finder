'use client';

import { useEffect, useState } from 'react';
import { ListOrdered } from 'lucide-react';

type Heading = { id: string; text: string };

/**
 * Table of Contents for the blog article. Reads the rendered `.blog-content`
 * h2 headings after mount, assigns them ids and highlights the section
 * currently in view (scroll-spy). Renders nothing when there are no h2s.
 */
export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.blog-content h2'));
    if (els.length === 0) return;

    const items = els.map((el, i) => {
      const id = `section-${i}`;
      el.id = id;
      return { id, text: (el.textContent || '').trim() || `Section ${i + 1}` };
    });
    setHeadings(items);
    setActiveId(items[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      // Trigger a bit before the heading crosses the top of the viewport
      { rootMargin: '-90px 0px -70% 0px', threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
        <ListOrdered size={18} className="text-amber-500" /> Table of Contents
      </h3>
      <ol className="space-y-0.5">
        {headings.map((h, i) => {
          const active = activeId === h.id;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm leading-snug transition ${
                  active
                    ? 'bg-amber-50 font-semibold text-amber-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-amber-600'
                }`}
              >
                <span className={active ? 'text-amber-500' : 'text-gray-400'}>{i + 1}.</span>
                <span className="line-clamp-2">{h.text}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
