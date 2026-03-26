'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLoadUser } from '@/hooks/useLoadUser';
import { useAuthStore } from '@/hooks/useAuth';

export default function DashboardPage() {
  const router = useRouter();
  const isLoading = useLoadUser();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-indigo-600">LifeManager</h1>
          <div className="flex gap-4">
            <span className="text-gray-700">Welcome, {user?.first_name || user?.username}!</span>
            <button
              onClick={() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                router.push('/');
              }}
              className="px-4 py-2 text-red-600 hover:text-red-800 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-5 gap-6">
          {[
            { title: 'Tasks', href: '/tasks', icon: '✓', color: 'blue' },
            { title: 'Finances', href: '/finances', icon: '$', color: 'green' },
            { title: 'Documents', href: '/documents', icon: '📄', color: 'yellow' },
            { title: 'Reminders', href: '/reminders', icon: '🔔', color: 'red' },
            { title: 'Notes', href: '/notes', icon: '📝', color: 'purple' },
          ].map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition hover:scale-105"
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-xl text-gray-900">{item.title}</h3>
              <p className="text-gray-600 text-sm mt-2">Manage your {item.title.toLowerCase()}</p>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
