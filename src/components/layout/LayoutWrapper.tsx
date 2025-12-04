'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Routes that should NOT have sidebar
  const noSidebarRoutes = ['/', '/auth/login', '/auth/signup'];
  const showSidebar = !noSidebarRoutes.includes(pathname);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-black">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
