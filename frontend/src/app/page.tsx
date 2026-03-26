'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-indigo-600">LifeManager</h1>
          <div className="flex gap-4">
            <Link 
              href="/auth/login"
              className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Login
            </Link>
            <Link 
              href="/auth/register"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Organize Your Life
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Manage tasks, track finances, organize documents, set reminders, and keep notes all in one place.
          </p>
          
          <div className="grid md:grid-cols-5 gap-6 mb-12">
            {[
              { title: 'Tasks', icon: '✓', desc: 'Organize your to-dos' },
              { title: 'Finances', icon: '$', desc: 'Track income & expenses' },
              { title: 'Documents', icon: '📄', desc: 'Store important files' },
              { title: 'Reminders', icon: '🔔', desc: 'Never forget again' },
              { title: 'Notes', icon: '📝', desc: 'Capture your ideas' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="text-4xl mb-2">{item.icon}</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <Link 
            href="/auth/register"
            className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-lg transition"
          >
            Get Started Free
          </Link>
        </div>
      </main>
    </div>
  );
}
