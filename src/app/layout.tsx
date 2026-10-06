import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PatternWaves from '@/components/PatternWaves';

export const metadata: Metadata = {
  title: 'EntryX | Event Entry, Reimagined.',
  description: 'A real-time event registration and QR-based entry verification platform.',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-cream-50 min-h-screen flex flex-col relative selection:bg-brand-gold selection:text-background">
        {/* Animated Ticket-themed WebGL Background */}
        <PatternWaves speed={0.35} waveFrequency={2.2} waveAmplitude={0.12} />

        {/* Global Navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 z-10">
          {children}
        </main>

        {/* Global Footer */}
        <Footer />
      </body>
    </html>
  );
}
