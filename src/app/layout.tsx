import { Inter } from 'next/font/google';
import './globals.css';
import { SupabaseProvider } from '@/components/providers/supabase-provider';
import { ReduxProvider } from '@/components/providers/redux-provider';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'OrganizeNow - Smart Task Manager',
  description: 'Organize your tasks with smart reminders',
  icons: {
    icon: '/favicon-new.svg',
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
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </AuthProvider>
            </SupabaseProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
