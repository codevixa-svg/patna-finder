'use client';

import { Toaster } from 'react-hot-toast';

/**
 * Client wrapper that mounts react-hot-toast once for the whole /admin
 * section (the admin layout itself stays a server component for metadata).
 */
export default function AdminToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#111827',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow:
            '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        },
        success: { iconTheme: { primary: '#16a34a', secondary: '#ffffff' } },
        error: { iconTheme: { primary: '#dc2626', secondary: '#ffffff' } },
      }}
    />
  );
}