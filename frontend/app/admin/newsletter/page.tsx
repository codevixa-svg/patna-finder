'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { useAdminAuthStore } from '@/store/adminAuthStore';
import { adminNewsletterApi } from '@/lib/adminApi';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  source: string;
  status: 'active' | 'unsubscribed';
  subscribed_at: string | null;
  unsubscribed_at: string | null;
}

interface Campaign {
  id: number;
  subject: string;
  body: string;
  status: string;
  total_subscribers: number;
  sent_count: number;
  failed_count: number;
  sent_at: string | null;
  sender?: { id: number; name: string; email: string } | null;
}

interface Stats {
  total: number;
  active: number;
  unsubscribed: number;
  campaigns: number;
}

type Tab = 'subscribers' | 'compose' | 'campaigns';

/** Extract a friendly message from an axios/Laravel error response. */
function apiErrorMsg(error: unknown, fallback: string): string {
  const err = error as {
    response?: { data?: { message?: string; errors?: Record<string, string[]> } };
  };
  const validation = err?.response?.data?.errors
    ? (Object.values(err.response.data.errors).flat()[0] as string | undefined)
    : undefined;
  return (
    validation ||
    err?.response?.data?.message ||
    (error instanceof Error && error.message) ||
    fallback
  );
}

export default function AdminNewsletterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAdminAuthStore();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('subscribers');

  // Subscribers table
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);

  // Add subscriber modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addName, setAddName] = useState('');
  const [adding, setAdding] = useState(false);

  // Compose
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  // Campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const data = await adminNewsletterApi.getSubscribers({
        page,
        per_page: 15,
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      const list = Array.isArray(data) ? data : data.data || [];
      setSubscribers(list);
      setTotal(data.total ?? list.length);
      setLastPage(data.last_page ?? 1);
      setFrom(data.from ?? 0);
      setTo(data.to ?? 0);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
      toast.error(apiErrorMsg(error, 'Failed to load subscribers'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminNewsletterApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch newsletter stats:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setCampaignsLoading(true);
      const data = await adminNewsletterApi.getCampaigns({ per_page: 20 });
      const list = Array.isArray(data) ? data : data.data || [];
      setCampaigns(list);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      toast.error(apiErrorMsg(error, 'Failed to load campaign history'));
    } finally {
      setCampaignsLoading(false);
    }
  };

  useEffect(() => {
    // Hydration gate used by all admin pages in this codebase.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    // Loading flags are intentionally set synchronously before fetching.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSubscribers();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, mounted, page, search, statusFilter]);

  // Debounced server-side search — resets to first page on new query
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Campaign history loads when its tab opens
  useEffect(() => {
    if (!mounted || !isAuthenticated || tab !== 'campaigns') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCampaigns();
  }, [tab, mounted, isAuthenticated]);

  const handleAddSubscriber = async () => {
    const email = addEmail.trim();
    if (!email) {
      toast.error('Email is required');
      return;
    }
    setAdding(true);
    try {
      const res = await adminNewsletterApi.addSubscriber({
        email,
        ...(addName.trim() ? { name: addName.trim() } : {}),
      });
      toast.success(res?.message || 'Subscriber added');
      setShowAddModal(false);
      setAddEmail('');
      setAddName('');
      fetchSubscribers();
      fetchStats();
    } catch (error) {
      toast.error(apiErrorMsg(error, 'Failed to add subscriber'));
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (sub: Subscriber) => {
    try {
      const res = await adminNewsletterApi.toggleActive(sub.id);
      toast.success(res?.message || 'Subscriber updated');
      fetchSubscribers();
      fetchStats();
    } catch (error) {
      toast.error(apiErrorMsg(error, 'Failed to update subscriber'));
    }
  };

  const handleDelete = async (sub: Subscriber) => {
    if (!window.confirm(`Delete subscriber ${sub.email}? This cannot be undone.`)) return;
    try {
      const res = await adminNewsletterApi.deleteSubscriber(sub.id);
      toast.success(res?.message || 'Subscriber deleted');
      fetchSubscribers();
      fetchStats();
    } catch (error) {
      toast.error(apiErrorMsg(error, 'Failed to delete subscriber'));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    const recipientCount = stats?.active ?? 0;
    if (recipientCount === 0) {
      toast.error('No active subscribers to send to');
      return;
    }
    if (!window.confirm(`Send this newsletter to ${recipientCount} active subscriber(s)?`)) {
      return;
    }

    setSending(true);
    try {
      const res = await adminNewsletterApi.send({ subject: subject.trim(), body: body.trim() });
      toast.success(res?.message || 'Newsletter sent');
      setSubject('');
      setBody('');
      fetchStats();
      setTab('campaigns');
      fetchCampaigns();
    } catch (error) {
      toast.error(apiErrorMsg(error, 'Failed to send newsletter'));
    } finally {
      setSending(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'subscribers', label: stats ? `Subscribers (${stats.total})` : 'Subscribers' },
    { key: 'compose', label: 'Compose' },
    { key: 'campaigns', label: 'Campaign History' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto mt-16">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage subscribers and send newsletters to your audience.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
              >
                + Add Subscriber
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Active Subscribers', value: stats?.active, color: 'text-green-600' },
                { label: 'Total Subscribers', value: stats?.total, color: 'text-blue-600' },
                { label: 'Unsubscribed', value: stats?.unsubscribed, color: 'text-gray-600' },
                { label: 'Campaigns Sent', value: stats?.campaigns, color: 'text-amber-600' },
              ].map((card) => (
                <div key={card.label} className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">{card.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${card.color}`}>
                    {card.value ?? '—'}
                  </p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition ${
                    tab === t.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Subscribers tab ── */}
            {tab === 'subscribers' && (
              <div className="bg-white rounded-lg border border-gray-200">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-200">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by email or name…"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="unsubscribed">Unsubscribed</option>
                  </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-gray-500 border-b border-gray-200">
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Source</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Subscribed</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                            Loading…
                          </td>
                        </tr>
                      ) : subscribers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                            No subscribers found.
                          </td>
                        </tr>
                      ) : (
                        subscribers.map((sub) => (
                          <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{sub.email}</td>
                            <td className="px-4 py-3 text-gray-600">{sub.name || '—'}</td>
                            <td className="px-4 py-3 text-gray-600 capitalize">{sub.source}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                  sub.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {sub.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {sub.subscribed_at
                                ? new Date(sub.subscribed_at).toLocaleDateString()
                                : '—'}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleToggle(sub)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium mr-3"
                              >
                                {sub.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDelete(sub)}
                                className="text-xs text-red-600 hover:text-red-800 font-medium"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    {total > 0 ? `Showing ${from}\u2013${to} of ${total}` : '0 results'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-2 py-1.5 text-xs text-gray-500">
                      Page {page} of {lastPage}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                      disabled={page >= lastPage}
                      className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Compose tab ── */}
            {tab === 'compose' && (
              <form onSubmit={handleSend} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">Compose Newsletter</h2>
                  <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full self-start">
                    {stats?.active ?? 0} active subscriber(s)
                  </span>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={150}
                  placeholder="e.g. This week in Patna — events, offers & more"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  maxLength={20000}
                  placeholder={'Hi there,\n\nHere\u2019s what\u2019s happening in Patna this week\u2026'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    Line breaks are preserved in the email. Every email includes an unsubscribe link.
                  </p>
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Sending…' : 'Send Newsletter'}
                  </button>
                </div>
              </form>
            )}

            {/* ── Campaigns tab ── */}
            {tab === 'campaigns' && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-gray-500 border-b border-gray-200">
                        <th className="px-4 py-3">Subject</th>
                        <th className="px-4 py-3">Sent by</th>
                        <th className="px-4 py-3">Recipients</th>
                        <th className="px-4 py-3">Failed</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Sent at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignsLoading ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                            Loading…
                          </td>
                        </tr>
                      ) : campaigns.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                            No newsletters sent yet.
                          </td>
                        </tr>
                      ) : (
                        campaigns.map((c) => (
                          <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{c.subject}</td>
                            <td className="px-4 py-3 text-gray-600">{c.sender?.name || '—'}</td>
                            <td className="px-4 py-3 text-gray-600">
                              {c.sent_count} / {c.total_subscribers}
                            </td>
                            <td className="px-4 py-3">
                              {c.failed_count > 0 ? (
                                <span className="text-red-600 font-medium">{c.failed_count}</span>
                              ) : (
                                <span className="text-gray-500">0</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-1 text-xs rounded-full capitalize ${
                                  c.status === 'sent'
                                    ? 'bg-green-100 text-green-700'
                                    : c.status === 'failed'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {c.sent_at ? new Date(c.sent_at).toLocaleString() : '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add subscriber modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Subscriber</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="reader@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddEmail('');
                  setAddName('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubscriber}
                disabled={adding}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-60"
              >
                {adding ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







