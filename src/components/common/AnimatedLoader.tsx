'use client';

import { useEffect, useState } from 'react';

interface AnimatedLoaderProps {
  message?: string;
}

/**
 * AnimatedLoader component
 * Shows animated "Organize" and "Now" text coming from left and right
 */
export function AnimatedLoader({ message = 'Loading...' }: AnimatedLoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-black">
      <div className="text-center">
        {/* Animated Logo Text */}
        <div className="relative h-24 flex items-center justify-center mb-8 overflow-hidden">
          {/* Organize - Coming from left */}
          <div
            className={`text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent transition-all duration-1000 ease-out ${
              mounted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            }`}
          >
            Organize
          </div>
          
          {/* Now - Coming from right */}
          <div
            className={`text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent transition-all duration-1000 ease-out ${
              mounted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
          >
            Now
          </div>
        </div>

        {/* Animated dots */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div
            className="w-3 h-3 rounded-full bg-purple-600 dark:bg-purple-400 animate-bounce"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="w-3 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>

        {/* Loading message */}
        <p className="text-gray-600 dark:text-gray-400 text-sm animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
