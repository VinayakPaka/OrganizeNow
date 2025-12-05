'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-black px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
              404
            </h1>
            <div className="absolute -top-4 -right-4 animate-bounce">
              <Search className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl"
          >
            <Home size={20} />
            Go to Dashboard
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Looking for something specific?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Link
              href="/tasks"
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300 font-medium"
            >
              Tasks
            </Link>
            <Link
              href="/notes"
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300 font-medium"
            >
              Notes
            </Link>
            <Link
              href="/calendar"
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300 font-medium"
            >
              Calendar
            </Link>
            <Link
              href="/vault"
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300 font-medium"
            >
              Vault
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
