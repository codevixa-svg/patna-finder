'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Breadcrumbs from '@/components/Breadcrumbs';

const eventTypeLabels: Record<string, string> = {
  'kavi-samelan': 'Kavi Samelan',
  'job-mela': 'Job Mela / Recruitment',
  'industrial': 'Industrial',
  'doctors-camp': 'Doctors Camp',
  'it-sector': 'IT Sector',
  'other': 'Government Event',
};

const formatEventDate = (dateStr: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function EventDetailsPage({ params }: { params: { slug: string } }) {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.getEvent(params.slug)
      .then((data: any) => setEvent(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center py-32">
        <div className="w-full max-w-3xl px-4 animate-pulse space-y-4">
          <div className="h-56 bg-gray-200 rounded-2xl" />
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center py-32 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-500 text-sm mb-6">This event may have been removed or the link is incorrect.</p>
          <Link href="/events" className="inline-block bg-[#062B49] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#0d2a5c] transition">
            ← Back to All Events
          </Link>
        </div>
      </div>
    );
  }

  const label = eventTypeLabels[event.event_type] || 'Government Event';
  const details = [
    { icon: 'M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z', label: 'Date', value: formatEventDate(event.event_date) },
    ...(event.start_time ? [{ icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Time', value: `${event.start_time}${event.end_time ? ` – ${event.end_time}` : ''}` }] : []),
    ...(event.venue ? [{ icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z', label: 'Venue', value: `${event.venue}${event.city ? `, ${event.city}` : ', Patna'}` }] : []),
    ...(event.organizer ? [{ icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', label: 'Organizer', value: event.organizer }] : []),
    ...(event.department ? [{ icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9', label: 'Department', value: event.department }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0d2a5c] via-[#062B49] to-[#1e4a94] text-white py-12 sm:py-16 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#F4B400]/10 blur-3xl" aria-hidden="true" />
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative">
          <span className="inline-block bg-[#F4B400]/20 text-[#FFDF80] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
            {label}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-3">{event.title}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-blue-100/90">
            {event.event_date && <span>📅 {formatEventDate(event.event_date)}</span>}
            {event.venue && <span>📍 {event.venue}</span>}
            {event.is_featured && <span className="text-[#FFDF80] font-semibold">★ Featured Event</span>}
          </div>
        </div>
      </div>

      <Breadcrumbs items={[{ label: 'Events', href: '/events' }, { label: event.title }]} />



      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {event.featured_image_url && (
              <img src={event.featured_image_url} alt={event.title} className="w-full h-64 sm:h-80 object-cover rounded-2xl shadow-sm" />
            )}
            {event.description && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
                <h2 className="text-lg font-extrabold text-gray-900 mb-3">About This Event</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-extrabold text-gray-900 mb-4">Event Details</h2>
              <ul className="space-y-4">
                {details.map((d) => (
                  <li key={d.label} className="flex gap-3">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-blue-50 text-[#062B49] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d.icon} />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{d.label}</p>
                      <p className="text-sm font-semibold text-gray-900 break-words">{d.value}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {event.registration_url && (
                <a
                  href={event.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 block text-center bg-[#062B49] text-white text-sm font-semibold px-4 py-3 rounded-xl hover:bg-[#0d2a5c] transition"
                >
                  Register Now →
                </a>
              )}
            </div>

            <div className="bg-gradient-to-br from-[#062B49] to-[#1e4a94] rounded-2xl p-6 text-white">
              <h3 className="font-extrabold mb-2">Looking for more events?</h3>
              <p className="text-blue-100/80 text-sm mb-4">Browse all upcoming government events across Patna.</p>
              <Link href="/events" className="inline-block bg-[#F4B400] text-[#062B49] text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#FFDF80] transition">
                View All Events
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
