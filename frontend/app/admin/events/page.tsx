'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { adminEventsApi } from '@/lib/adminApi';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

const EVENT_TYPE_LABELS: Record<string, string> = {
  'kavi-samelan': 'Kavi Samelan',
  'job-mela': 'Job Interview & Rojgar Mela',
  'industrial': 'Industrial Function',
  'doctors-camp': 'Doctors Camp',
  'it-sector': 'IT Sector Event',
  'other': 'Other',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  'kavi-samelan': 'bg-purple-100 text-purple-700',
  'job-mela': 'bg-blue-100 text-blue-700',
  'industrial': 'bg-orange-100 text-orange-700',
  'doctors-camp': 'bg-red-100 text-red-700',
  'it-sector': 'bg-green-100 text-green-700',
  'other': 'bg-gray-100 text-gray-700',
};

export default function EventsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAdminAuthStore();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    fetchEvents();
  }, [isAuthenticated, router, mounted]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await adminEventsApi.getAll();
      setEvents(data.data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await adminEventsApi.delete(id);
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete event');
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await adminEventsApi.toggleActive(id);
      fetchEvents();
    } catch (error) {
      console.error('Failed to toggle:', error);
      alert('Failed to update event status');
    }
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-y-auto mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Government Events</h1>
              <p className="text-gray-600 text-sm mt-1">Manage recent government events for Patna & Bihar</p>
            </div>
            <button
              onClick={() => router.push('/admin/events/create')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Event
            </button>
          </div>
<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No events found. Click "Add Event" to create your first government event.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Venue</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{event.title}</div>
                        {event.organizer && (
                          <div className="text-xs text-gray-500">{event.organizer}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS['other']}`}>
                          {EVENT_TYPE_LABELS[event.event_type] || event.event_type || 'Other'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {event.event_date
                          ? new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '-'}
                        {event.is_featured && <span className="ml-2 text-xs font-bold text-amber-600">* Featured</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{event.venue || '-'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(event.id)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                          }`}
                          title="Toggle active"
                        >
                          {event.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
