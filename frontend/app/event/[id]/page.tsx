'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const BACKEND_URL = API_URL.replace('/api/v1', '');

const getImageUrl = (value: any): string => {
  if (!value) return '/images/event-placeholder.jpg';
  const raw = typeof value === 'string' ? value : value?.url || value?.image || '';
  if (!raw) return '/images/event-placeholder.jpg';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  if (raw.startsWith('/storage/')) return `${BACKEND_URL}${raw}`;
  if (raw.startsWith('storage/')) return `${BACKEND_URL}/${raw}`;
  if (raw.startsWith('/')) return `${BACKEND_URL}${raw}`;
  return raw;
};

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [interested, setInterested] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/events/${eventId}`);
      
      if (!response.ok) {
        throw new Error('Event not found');
      }
      
      const result = await response.json();
      setEvent(result.data || result);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      toast.error('Event not found');
      router.push('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleInterested = async () => {
    try {
      if (interested) {
        await api.removeEventInterested(event.id);
        setInterested(false);
        toast.success('Removed from interested');
      } else {
        await api.markEventInterested(event.id);
        setInterested(true);
        toast.success('Marked as interested!');
      }
      fetchEvent(); // Refresh to get updated count
    } catch (error) {
      console.error('Failed to update interest:', error);
      toast.error('Something went wrong');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      // User cancelled
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/events')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      <main className="bg-gray-50 min-h-screen">
        {/* Back Button */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <button
              onClick={() => router.push('/events')}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Events
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Event Image */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="relative h-96">
                  <img
                    src={getImageUrl(event.banner_image || event.featured_image)}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-full">
                      {event.event_category}
                    </span>
                  </div>

                  {/* Event Mode Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`inline-block px-4 py-2 text-white text-sm font-bold rounded-full ${
                      event.event_mode === 'online' ? 'bg-purple-600' :
                      event.event_mode === 'hybrid' ? 'bg-orange-600' :
                      'bg-[#062B49]'
                    }`}>
                      {event.event_mode.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {event.title}
                  </h1>

                  {/* Event Meta Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Date</div>
                        <div className="font-semibold text-gray-900">{formatDate(event.event_date)}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#FFF4CC] rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-[#062B49]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Time</div>
                        <div className="font-semibold text-gray-900">{event.start_time} - {event.end_time}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Venue</div>
                        <div className="font-semibold text-gray-900">{event.venue}</div>
                        <div className="text-sm text-gray-500">{event.address}, {event.city}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Organizer</div>
                        <div className="font-semibold text-gray-900">{event.organizer}</div>
                        {event.department && (
                          <div className="text-sm text-gray-500">{event.department}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">About This Event</h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {event.description}
                    </div>
                  </div>

                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gallery */}
                  {event.gallery && event.gallery.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Event Gallery</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {event.gallery.map((img: any, index: number) => (
                          <img
                            key={index}
                            src={getImageUrl(img)}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Price & Registration Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="mb-6">
                    {event.price_type === 'free' ? (
                      <div>
                        <div className="text-3xl font-bold text-[#062B49] mb-1">FREE</div>
                        <div className="text-sm text-gray-600">Free admission for all</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          ₹{event.price}
                        </div>
                        <div className="text-sm text-gray-600">Per person entry fee</div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleInterested}
                      className={`w-full py-3 rounded-lg font-semibold transition ${
                        interested
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {interested ? '✓ Interested' : '⭐ I\'m Interested'}
                    </button>

                    {event.registration_url && (
                      <a
                        href={event.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3 bg-[#062B49] hover:bg-[#062B49] text-white text-center rounded-lg font-semibold transition"
                      >
                        Register Now →
                      </a>
                    )}

                    <button
                      onClick={handleShare}
                      className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      📤 Share Event
                    </button>
                  </div>

                  {/* Interest Count */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-semibold">{event.interested_count || 0} people interested</span>
                    </div>
                  </div>
                </div>

                {/* Contact Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
                  
                  <div className="space-y-3">
                    {event.contact_phone && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Phone</div>
                          <a href={`tel:${event.contact_phone}`} className="font-semibold text-blue-600 hover:underline">
                            {event.contact_phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {event.contact_email && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#FFF4CC] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#062B49]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Email</div>
                          <a href={`mailto:${event.contact_email}`} className="font-semibold text-blue-600 hover:underline break-all">
                            {event.contact_email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Map Card */}
                {(event.latitude && event.longitude) && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Location</h3>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm">Map view coming soon</p>
                      </div>
                    </div>
                    <button className="w-full mt-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-semibold">
                      Get Directions
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
