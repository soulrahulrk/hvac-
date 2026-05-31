import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'HVAC Revenue Recovery System',
  description:
    'AI-powered revenue recovery platform for HVAC businesses. Automate follow-ups, recover lost leads, and maximize your revenue.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div className="app-layout">
          <Sidebar />
          <div className="app-main">
            <Header />
            <main className="app-content">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
