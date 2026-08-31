'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if current route is admin or dashboard
  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // Don't show Header/Footer on admin or dashboard routes
  if (isAdminRoute || isDashboardRoute) {
    return <>{children}</>;
  }

  // Show Header/Footer on regular routes
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
