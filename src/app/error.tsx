'use client';

import { useEffect } from 'react';

/**
 * Global error boundary
 * Catches errors like MetaMask injection issues
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error but ignore MetaMask errors
    if (!error.message.includes('MetaMask')) {
      console.error('Application error:', error);
    }
  }, [error]);

  // Don't show UI for MetaMask errors
  if (error.message.includes('MetaMask') || error.message.includes('ethereum')) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
