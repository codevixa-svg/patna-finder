'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserAuthStore } from '@/store/userAuthStore';
import { userAuthApi } from '@/lib/userApi';

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useUserAuthStore();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call backend logout API
        await userAuthApi.logout();
      } catch (error) {
        console.error('Logout error:', error);
        // Continue with logout even if API call fails
      } finally {
        // Clear local state and redirect
        logout();
        router.push('/');
      }
    };

    performLogout();
  }, [logout, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Logging you out...</h2>
        <p className="text-gray-600">Please wait while we securely log you out.</p>
        
        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
