'use client';

import { useState, useEffect, ReactNode } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle: string;
  pageSubtitle: string;
  showSaveButton?: boolean;
  onSaveClick?: () => void;
  saveButtonText?: string;
  loading?: boolean;
}

export default function DashboardLayout({
  children,
  pageTitle,
  pageSubtitle,
  showSaveButton = false,
  onSaveClick,
  saveButtonText,
  loading,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isDesktop) setSidebarOpen(true);
    else setSidebarOpen(false);
  }, [isDesktop]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isDesktop={isDesktop}
      />

      <DashboardHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        showSaveButton={showSaveButton}
        onSaveClick={onSaveClick}
        saveButtonText={saveButtonText}
        loading={loading}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        isDesktop={isDesktop}
      />

      {/* Main Content */}
      <div
        className={`pt-14 lg:pt-16 transition-all duration-300 ${
          isDesktop && sidebarOpen ? 'lg:ml-48' : 'lg:ml-0'
        }`}
      >
        {children}

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Khojya. All Rights Reserved.</p>
            <a
              href="https://codevixa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-600 transition flex items-center gap-1.5"
            >
              <span>Powered by</span>
              <span className="font-semibold text-gray-700">CodeVixa</span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
