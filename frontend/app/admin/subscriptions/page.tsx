'use client';

import toast from 'react-hot-toast';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { adminSubscriptionsApi } from '@/lib/adminApi';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

interface Subscription {
  id: number;
  user: { id: number; name: string; email: string };
  plan: string;
  amount: number;
  status: string;
  razorpay_payment_id: string | null;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export default function AdminSubscriptionsPage() {
  const { isAuthenticated } = useAdminAuthStore();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/admin/login'); return; }
    fetchSubscriptions();
  }, [isAuthenticated, statusFilter, planFilter, page]);

  async function fetchSubscriptions() {
    try {
      setLoading(true);
      const params: any = { page, per_page: 15 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (planFilter !== 'all') params.plan = planFilter;
      if (search) params.search = search;
      const data = await adminSubscriptionsApi.getAll(params);
      setSubscriptions(data.data || []);
      setLastPage(data.last_page || 1);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchSubscriptions();
  }

  async function handleCancel(id: number) {
    if (!confirm('Cancel this subscription?')) return;
    try {
      await adminSubscriptionsApi.cancel(id);
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  }

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      expired: 'bg-gray-100 text-gray-600 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-y-auto mt-16">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscriptions</h1>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="failed">Failed</option>
                </select>
                <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Plans</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                </select>
                <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name or email..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Search</button>
                  </div>
                </form>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Loading subscriptions...</p>
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  <p className="text-sm">No subscriptions found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Expires</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.map((sub) => (
                          <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-gray-900">{sub.user?.name || 'N/A'}</p>
                              <p className="text-xs text-gray-500">{sub.user?.email || ''}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium capitalize">{sub.plan}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-900">₹{Number(sub.amount).toFixed(0)}</span>
                            </td>
                            <td className="px-4 py-3">{statusBadge(sub.status)}</td>
                            <td className="px-4 py-3">
                              {sub.expires_at ? (
                                <span className={`text-sm ${new Date(sub.expires_at) > new Date() ? 'text-gray-900' : 'text-gray-400'}`}>
                                  {new Date(sub.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-500">
                                {new Date(sub.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {sub.status === 'active' && (
                                <button onClick={() => handleCancel(sub.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {lastPage > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                      <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40">
                        Previous
                      </button>
                      <span className="text-sm text-gray-500">Page {page} of {lastPage}</span>
                      <button onClick={() => setPage(Math.min(lastPage, page + 1))} disabled={page === lastPage}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40">
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
