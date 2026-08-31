'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserAuthStore } from '@/store/userAuthStore';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function LeadsPage() {
  const router = useRouter();
  const { isAuthenticated } = useUserAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/dashboard/login');
    }
  }, [isAuthenticated, router, mounted]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Leads & Inquiries"
      pageSubtitle="Manage customer inquiries and leads"
    >
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-xl p-6 sm:p-8 lg:p-12 text-center border-2 border-dashed border-gray-300">
          <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Inquiries Yet</h3>
          <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 px-2">
            When customers contact you through your business listing, their inquiries will appear here.
          </p>
          <p className="text-xs sm:text-sm text-gray-500 px-2">
            This feature is coming soon. Customers will be able to send inquiries via email, phone, or WhatsApp.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
