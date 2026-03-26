import type { Metadata } from 'next';
import { useLoadUser } from '@/hooks/useLoadUser';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'LifeManager - Your Personal Life Admin Tool',
  description: 'Manage tasks, finances, documents, reminders, and notes in one place',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
