'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function FaqAccordion({
  faqs,
}: {
  faqs: { q: string; a: string }[];
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div
            key={faq.q}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-semibold text-sm text-[#102A43]">{faq.q}</span>
              <Plus
                className={`w-4 h-4 text-[#F4B400] shrink-0 transition-transform ${isOpen ? 'rotate-45' : ''}`}
              />
            </button>
            {isOpen && (
              <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}