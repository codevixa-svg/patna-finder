'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserAuthStore } from '@/store/userAuthStore';
import { userAuthApi } from '@/lib/userApi';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, updateUser } = useUserAuthStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [errors, setErrors] = useState<any>({});

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/dashboard/login');
      return;
    }

    setProfileData({
      name: user?.name || '',
      phone: user?.phone || '',
    });
  }, [isAuthenticated, router, mounted, user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await userAuthApi.updateProfile(profileData);
      if (response.success) {
        updateUser(response.data);
        alert('Profile updated successfully!');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      setErrors(error.response?.data?.errors || {});
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setErrors({ new_password_confirmation: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await userAuthApi.changePassword(
        passwordData.current_password,
        passwordData.new_password,
        passwordData.new_password_confirmation
      );
      alert('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (error: any) {
      console.error('Password change error:', error);
      setErrors(error.response?.data?.errors || {});
      alert(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Profile Settings"
      pageSubtitle="Manage your account information"
      showSaveButton={false}
    >
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl">
          {/* Tabs */}
          <div className="flex gap-3 sm:gap-4 mb-5 sm:mb-6 border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 sm:px-4 py-2 font-medium transition text-sm sm:text-base ${
                activeTab === 'profile'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-3 sm:px-4 py-2 font-medium transition text-sm sm:text-base ${
                activeTab === 'password'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Change Password
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl p-5 sm:p-6 lg:p-8 shadow-sm border">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl lg:text-4xl flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-600 text-sm sm:text-base break-all">{user?.email}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Business Owner</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-5 lg:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50 text-sm sm:text-base"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-xl p-5 sm:p-6 lg:p-8 shadow-sm border">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-5 sm:mb-6">Change Password</h3>

              <form onSubmit={handlePasswordChange} className="space-y-4 sm:space-y-5 lg:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Current Password *</label>
                  <input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">New Password *</label>
                  <input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Min 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Confirm New Password *</label>
                  <input
                    type="password"
                    value={passwordData.new_password_confirmation}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base ${
                      errors.new_password_confirmation ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.new_password_confirmation && (
                    <p className="mt-1 text-sm text-red-600">{errors.new_password_confirmation}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50 text-sm sm:text-base"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
