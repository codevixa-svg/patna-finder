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
      </div>
    </div>
  );
}
