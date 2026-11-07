import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DentAgent AI — Dental Patient Re-Activation & Hygiene Booking Agent',
  description: 'Enterprise healthcare platform automating hygiene chair recall and two-way SMS patient re-engagement for modern dental practices.'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAFAFA] text-[#18181B] antialiased">
        {children}
      </body>
    </html>
  );
}
