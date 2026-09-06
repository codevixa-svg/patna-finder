'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Breadcrumbs from '@/components/Breadcrumbs';

// Styles per government event type (kept in sync with the homepage slider)
const eventTypeStyles: Record<string, { color: string; iconColor: string; icon: string }> = {
  'kavi-samelan': { color: 'bg-purple-100', iconColor: 'text-purple-600', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  'job-mela': { color: 'bg-blue-100', iconColor: 'text-blue-600', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  'industrial': { color: 'bg-orange-100', iconColor: 'text-orange-600', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  'doctors-camp': { color: 'bg-red-100', iconColor: 'text-red-600', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  'it-sector': { color: 'bg-green-100', iconColor: 'text-green-600', icon: 'M2.5 7a2.5 2.5 0 012.5-2.5h10A2.5 2.5 0 0117.5 7v7a2.5 2.5 0 01-2.5 2.5H7.5A2.5 2.5 0 015 14V7zM8 19h8' },
  'other': { color: 'bg-gray-100', iconColor: 'text-gray-600', icon: 'M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z' },
};

const eventTypeLabels: Record<string, string> = {
  'kavi-samelan': 'Kavi Samelan',
  'job-mela': 'Job Mela / Recruitment',
  'industrial': 'Industrial',
  'doctors-camp': 'Doctors Camp',
  'it-sector': 'IT Sector',
  'other': 'Government Event',
};

const formatEventDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('');

  useEffect(() => {
    api.getEvents({ per_page: 60 })
      .then((data: any) => setEvents(Array.isArray(data) ? data : data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = activeType ? events.filter((e: any) => e.event_type === activeType) : events;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gray-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-3">Government Events in Patna</h1>
          <p className="text-gray-300 max-w-2xl">
            Kavi Samelan, Rojgar Mela, industrial functions, doctors camps, IT sector events & other
            government programmes across Patna, Bihar.
          </p>
        </div>
      </div>

      {/* Breadcrumb — same UI as the business details page */}
      <Breadcrumbs items={[{ label: 'Events' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Type Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveType('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeType === '' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400'}`}
          >
            All Events
          </button>
          {Object.entries(eventTypeLabels).map(([type, label]) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeType === type ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No events found right now.</p>
            <p className="text-gray-400 text-sm mt-1">Please check back soon — new government events are added regularly.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event: any) => {
              const style = eventTypeStyles[event.event_type] || eventTypeStyles['other'];
              return (
                <div key={event.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${style.color} rounded-xl flex items-center justify-center`}>
                      <svg className={`w-6 h-6 ${style.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.icon} />
                      </svg>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">Govt Event</span>
                      {event.is_featured && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">Featured</span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-1">{event.title}</h3>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    {eventTypeLabels[event.event_type] || 'Government Event'}
                  </p>
                  {event.description && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-1">{event.description}</p>
                  )}

                  <div className="space-y-1.5 text-xs text-gray-500 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                      </svg>
                      {formatEventDate(event.event_date)}
                      {event.start_time && <span className="text-gray-400">• {event.start_time}</span>}
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{event.venue}, {event.city || 'Patna'}</span>
                      </div>
                    )}
                    {event.organizer && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="truncate">Organized by {event.organizer}</span>
                      </div>
                    )}
                  </div>

                  {event.registration_url && (
                    <a
                      href={event.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 text-center bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-800 transition"
                    >
                      Register Now
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
