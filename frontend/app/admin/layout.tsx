import AdminToaster from '@/components/admin/AdminToaster';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminToaster />
      {children}
    </>
  );
}

export const metadata = {
  title: 'Admin Dashboard - Patna Finder',
  description: 'Admin management portal for Patna Finder',
};
