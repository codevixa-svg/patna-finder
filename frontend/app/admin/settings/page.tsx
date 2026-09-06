'use client';

import toast from 'react-hot-toast';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { adminAuthApi } from '@/lib/adminApi';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAdminAuthStore();
  const [mounted, setMounted] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router, mounted]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }

    setChangingPassword(true);
    try {
      await adminAuthApi.changePassword(currentPassword, newPassword, confirmPassword);
      toast.success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to change password.';
      toast.error(message);
    } finally {
      setChangingPassword(false);
    }
  };

  const roleBadge: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-800',
    admin: 'bg-blue-100 text-blue-800',
    moderator: 'bg-yellow-100 text-yellow-800',
  };

  const roleLabel: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    moderator: 'Moderator',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-y-auto mt-16">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 text-sm mt-1">Manage your account and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Profile Settings</h2>
              <p className="text-sm text-gray-500 mb-6">View your account details and change your password.</p>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.name || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.email || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Role</label>
                  <p className="mt-1 text-sm text-gray-900">{roleLabel[user?.role || ''] || user?.role || '—'}</p>
                </div>
              </div>

              <hr className="border-gray-200 mb-6" />

              <h3 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Admin Info</h2>
              <p className="text-sm text-gray-500 mb-6">Your role, permissions, and account details.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Role</label>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      roleBadge[user?.role || ''] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {roleLabel[user?.role || ''] || user?.role || '—'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Permissions</label>
                  {user?.permissions && user.permissions.length > 0 ? (
                    <ul className="space-y-1">
                      {user.permissions.map((perm) => (
                        <li key={perm} className="flex items-center text-sm text-gray-700">
                          <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {perm}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No specific permissions assigned</p>
                  )}
                </div>

                <hr className="border-gray-200" />

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Account Created</label>
                  <p className="text-sm text-gray-900">—</p>
                  <p className="text-xs text-gray-400 mt-1">Retrieve from API for accurate date</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Last Login</label>
                  <p className="text-sm text-gray-900">—</p>
                  <p className="text-xs text-gray-400 mt-1">Retrieve from API for accurate date</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
