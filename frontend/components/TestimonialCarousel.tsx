'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  text: string;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Amit Sinha',
    role: 'Student, Patna',
    text: 'Patna Finder has made it so easy to find trusted businesses and stay updated about city events. Truly a helpful platform!',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Neha Verma',
    role: 'Business Owner',
    text: 'A great initiative for our city. It not only helps users but also supports local businesses. Keep up the good work!',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    name: 'Rohit Raj',
    role: 'Working Professional',
    text: 'I love how Patna Finder brings everything about Patna in one place — businesses, events, blogs and more!',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    name: 'Sneha Gupta',
    role: 'Teacher',
    text: 'From coaching centres to cafés, I find everything here. The verified listings really build trust.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'Ankur Kumar',
    role: 'Gym Owner',
    text: 'Listing my gym on Patna Finder brought in new members within weeks. Amazing platform for local businesses!',
    avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
  },
  {
    name: 'Ritu Singh',
    role: 'Homemaker',
    text: 'Clean design, accurate information and genuine reviews. Patna Finder is my go-to app for the city.',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
];

/**
 * "What People Say" carousel used on the About page.
 * Scroll-snap based track with prev/next round buttons — 3 cards on
 * desktop, 2 on tablet and 1 on mobile (matches the reference design).
 */
export default function TestimonialCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('[data-card]');
    const amount = card ? card.offsetWidth + 24 : track.clientWidth;
    track.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  return (
    <div className="mt-10">
      {/* Prev / Next controls */}
      <div className="flex justify-end gap-3 mb-6">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Previous testimonials"
          className="w-10 h-10 rounded-full border border-gray-300 text-gray-600 hover:bg-[#062B49] hover:border-[#062B49] hover:text-white transition flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Next testimonials"
          className="w-10 h-10 rounded-full border border-gray-300 text-gray-600 hover:bg-[#062B49] hover:border-[#062B49] hover:text-white transition flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
      >
        {TESTIMONIALS.map((t) => (
          <article
            key={t.name}
            data-card
            className="snap-start shrink-0 w-[88%] sm:w-[47%] lg:w-[calc((100%-3rem)/3)] bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-1 text-[#F4B400]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4" fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <Quote className="w-8 h-8 text-[#FFF4CC]" fill="currentColor" strokeWidth={0} />
            </div>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
            <div className="mt-5 flex items-center gap-3">
              <Image
                src={t.avatar}
                alt={t.name}
                width={44}
                height={44}
                className="w-11 h-11 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-bold text-[#102A43]">{t.name}</p>
                <p className="text-xs text-gray-500">{t.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
