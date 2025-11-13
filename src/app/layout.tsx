import { Inter } from 'next/font/google';
import './globals.css';
import { SupabaseProvider } from '@/components/providers/supabase-provider';
import { ReduxProvider } from '@/components/providers/redux-provider';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'OrganizeNow - Smart Task Manager',
  description: 'Organize your tasks with smart reminders',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress MetaMask injection errors
              window.addEventListener('error', function(e) {
                if (e.message && (e.message.includes('MetaMask') || e.message.includes('ethereum'))) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              });
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && e.reason.message && (e.reason.message.includes('MetaMask') || e.reason.message.includes('ethereum'))) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              });
            `,
          }}
        />
      </head>
      <body className={`${jakarta.className} bg-white dark:bg-black`}>
        <ThemeProvider>
          <ReduxProvider>
            <SupabaseProvider>
              <AuthProvider>
                <div className="flex h-screen bg-white dark:bg-black">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">{children}</main>
                  </div>
                </div>
              </AuthProvider>
            </SupabaseProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
