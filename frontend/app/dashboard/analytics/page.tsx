'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserAuthStore } from '@/store/userAuthStore';
import { userBusinessApi, userDashboardApi } from '@/lib/userApi';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const RANGES = [
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' },
];

const EVENT_LABELS: Record<string, string> = {
  view: 'Profile Views',
  call: 'Call Clicks',
  website: 'Website Clicks',
  whatsapp: 'WhatsApp Clicks',
  directions: 'Direction Requests',
  share: 'Shares',
};

const EVENT_ICONS: Record<string, string> = {
  view: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zm7-8a7 7 0 01-7 7c-1.4 0-2.7-.4-3.8-1.1L2 21l4.1-1.7A7 7 0 1122 4z',
  call: 'M3 5a2 2 0 012-2h3.3a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2L8.5 10.5a12 12 0 005 5l1.12-1.75a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2C10.4 21 3 13.6 3 5z',
  website: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 000 18M12 3a15 15 0 010 18',
  whatsapp: 'M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72A7.6 7.6 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  directions: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  share: 'M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6L15.316 5.316m0 0A3 3 0 1018 3a3 3 0 00-2.684 2.316zm0 12.684a3 3 0 102.684 4.684 3 3 0 00-2.684-4.684z',
};

const EVENT_CARD_COLORS: Record<string, { bg: string; text: string }> = {
  view: { bg: 'bg-blue-100', text: 'text-blue-600' },
  call: { bg: 'bg-orange-100', text: 'text-orange-600' },
  website: { bg: 'bg-purple-100', text: 'text-purple-600' },
  whatsapp: { bg: 'bg-green-100', text: 'text-green-600' },
  directions: { bg: 'bg-teal-100', text: 'text-teal-600' },
  share: { bg: 'bg-pink-100', text: 'text-pink-600' },
};

const CHANGE_ORDER = ['view', 'call', 'website', 'whatsapp', 'directions', 'share'];

const formatNumber = (n: number) => new Intl.NumberFormat('en-IN').format(n);

const formatDay = (date: string) => {
  try {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return date;
  }
};

const formatCompact = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white/95 backdrop-blur px-3 py-2.5 shadow-xl">
      <p className="text-xs font-semibold text-gray-700 mb-1.5">{label}</p>
      <div className="space-y-1">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-6 text-xs">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: entry.color || entry.stroke }}
              />
              {entry.name}
            </span>
            <span className="font-bold text-gray-900 tabular-nums">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AnalyticsData {
  range: number;
  totals: Record<string, number>;
  previous: Record<string, number>;
  changes: Record<string, number | null>;
  daily: Array<Record<string, any>>;
  businesses: Array<{
    id: number;
    name: string;
    slug: string;
    all_time_views: number;
    totals: Record<string, number>;
  }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated } = useUserAuthStore();
  const [mounted, setMounted] = useState(false);

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [range, setRange] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/dashboard/login');
    }
  }, [mounted, isAuthenticated, router]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userDashboardApi.getAnalytics({
        business_id: selectedBusiness || undefined,
        range,
      });
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness, range]);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;

    const load = async () => {
      try {
        const res = await userBusinessApi.getAll();
        const list = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
        setBusinesses(list);
      } catch {
        setBusinesses([]);
      }
      fetchAnalytics();
    };
    load();
  }, [mounted, isAuthenticated, fetchAnalytics]);

  const changeLabel = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '—';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value}%`;
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const totals = data?.totals || {};
  const changes = data?.changes || {};
  const daily = data?.daily || [];

  const chartData = daily.map((d) => ({
    label: formatDay(d.date),
    fullDate: d.date,
    Views: Number(d.view) || 0,
    Calls: Number(d.call) || 0,
    Website: Number(d.website) || 0,
    WhatsApp: Number(d.whatsapp) || 0,
    Directions: Number(d.directions) || 0,
    Shares: Number(d.share) || 0,
  }));

  return (
    <DashboardLayout
      pageTitle="Performance"
      pageSubtitle="How customers interact with your listings — GMB style insights"
      showSaveButton={false}
    >
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="inline-flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm self-start">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRange(r.value)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition ${
                  range === r.value
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {businesses.length > 1 && (
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition cursor-pointer max-w-xs"
            >
              <option value="">All Businesses</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse h-28" />
              ))}
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse h-64" />
          </div>
        ) : !data ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">Could not load performance data. Please try again.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
              {CHANGE_ORDER.map((event) => {
                const colors = EVENT_CARD_COLORS[event];
                const change = changes[event];
                const isUp = typeof change === 'number' && change > 0;
                const isDown = typeof change === 'number' && change < 0;
                return (
                  <div
                    key={event}
                    className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                        <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={EVENT_ICONS[event]} />
                        </svg>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isUp
                            ? 'text-green-700 bg-green-50 border border-green-200'
                            : isDown
                              ? 'text-red-700 bg-red-50 border border-red-200'
                              : 'text-gray-500 bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {changeLabel(change)}
                      </span>
                    </div>
                    <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1">
                      {EVENT_LABELS[event]}
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {formatNumber(Number(totals[event]) || 0)}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      vs previous {data.range} days: {formatNumber(Number((data.previous || {})[event]) || 0)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Daily Chart */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Daily Activity
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Last {data.range} days
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Auto-tracked
                </span>
              </div>

              {daily.every((d) =>
                ['view', 'call', 'website', 'whatsapp', 'directions', 'share'].every(
                  (k) => (Number(d[k]) || 0) === 0
                )
              ) ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-900 font-semibold mb-1">No activity yet</p>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    When customers view your listing or click your Call, Website,
                    WhatsApp or Directions buttons, the data will show up here.
                  </p>
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 8, right: 6, left: -6, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1d4ed8" stopOpacity={0.28} />
                          <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="gradCalls" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ea580c" stopOpacity={0.22} />
                          <stop offset="100%" stopColor="#ea580c" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        minTickGap={28}
                        dy={6}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        allowDecimals={false}
                        tickFormatter={formatCompact}
                        width={40}
                      />
                      <Tooltip
                        content={<ChartTooltip />}
                        cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Views"
                        stroke="#1d4ed8"
                        strokeWidth={2.5}
                        fill="url(#gradViews)"
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Calls"
                        stroke="#ea580c"
                        strokeWidth={2.5}
                        fill="url(#gradCalls)"
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Line type="monotone" dataKey="Website" stroke="#7c3aed" strokeWidth={2} dot={false} activeDot={{ r: 3.5 }} />
                      <Line type="monotone" dataKey="WhatsApp" stroke="#16a34a" strokeWidth={2} dot={false} activeDot={{ r: 3.5 }} />
                      <Line type="monotone" dataKey="Directions" stroke="#0d9488" strokeWidth={2} dot={false} activeDot={{ r: 3.5 }} />
                      <Line type="monotone" dataKey="Shares" stroke="#db2777" strokeWidth={2} dot={false} activeDot={{ r: 3.5 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Per-business breakdown */}
            {data.businesses.length > 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Business-wise Performance
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Last {data.range} days
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                        <th className="px-4 sm:px-6 py-3 font-semibold">Business</th>
                        <th className="px-3 py-3 font-semibold text-right">Views</th>
                        <th className="px-3 py-3 font-semibold text-right">Calls</th>
                        <th className="px-3 py-3 font-semibold text-right">Website</th>
                        <th className="px-3 py-3 font-semibold text-right">WhatsApp</th>
                        <th className="px-3 py-3 font-semibold text-right">Directions</th>
                        <th className="px-4 sm:px-6 py-3 font-semibold text-right">All-Time Views</th>
                        <th className="px-4 sm:px-6 py-3 font-semibold text-right">Public Page</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.businesses.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50/60 transition">
                          <td className="px-4 sm:px-6 py-3.5 font-semibold text-gray-900 max-w-[220px] truncate">
                            {b.name}
                          </td>
                          <td className="px-3 py-3.5 text-right text-blue-600 font-semibold">
                            {formatNumber(b.totals.view || 0)}
                          </td>
                          <td className="px-3 py-3.5 text-right text-orange-600 font-semibold">
                            {formatNumber(b.totals.call || 0)}
                          </td>
                          <td className="px-3 py-3.5 text-right text-purple-600 font-semibold">
                            {formatNumber(b.totals.website || 0)}
                          </td>
                          <td className="px-3 py-3.5 text-right text-green-600 font-semibold">
                            {formatNumber(b.totals.whatsapp || 0)}
                          </td>
                          <td className="px-3 py-3.5 text-right text-teal-600 font-semibold">
                            {formatNumber(b.totals.directions || 0)}
                          </td>
                          <td className="px-4 sm:px-6 py-3.5 text-right text-gray-600">
                            {formatNumber(b.all_time_views || 0)}
                          </td>
                          <td className="px-4 sm:px-6 py-3.5 text-right">
                            <Link
                              href={`/business/${b.slug}`}
                              target="_blank"
                              className="text-xs font-semibold text-[#153b78] hover:text-orange-600 transition"
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

