// Global Next.js App Layout
// Location: /app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Money — Personal Finance Tracker',
  description: 'Understand your spending, set budgets, and grow your wealth. The financial mirror for Indian professionals with automated statement uploads.',
  keywords: ['personal finance', 'smart money', 'money tracker', 'sip calculator', 'fd calculator', 'indian bank statement parser', 'budget planner'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <div className="ambient-glow glow-top-right"></div>
        <div className="ambient-glow glow-bottom-left"></div>
        {children}
      </body>
    </html>
  );
}
