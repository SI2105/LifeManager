'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoadUser } from '@/hooks/useLoadUser';
import { useAuthStore } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';

export default function NotesPage() {
  const router = useRouter();
  const isLoading = useLoadUser();
  const { isAuthenticated } = useAuthStore();
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadNotes = async () => {
      try {
        setIsLoadingNotes(true);
        const response = await apiClient.getNotes();
        setNotes(response.results || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoadingNotes(false);
      }
    };

    loadNotes();
  }, [isAuthenticated]);

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
            <a href="/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</a>
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Notes</h2>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
            + New Note
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isLoadingNotes ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm text-center">
            <p className="text-gray-600 text-lg">No notes yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
                <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">{note.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>
                {note.tags && (
                  <div className="flex flex-wrap gap-2">
                    {note.tags.split(',').map((tag: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
