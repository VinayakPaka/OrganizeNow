"use client";

import { useEffect } from 'react';

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  // Load Excalidraw CSS
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/@excalidraw/excalidraw@0.18.0/dist/prod/index.css';
    link.id = 'excalidraw-styles';

    // Check if already loaded
    if (!document.getElementById('excalidraw-styles')) {
      document.head.appendChild(link);
    }

    return () => {
      const existingLink = document.getElementById('excalidraw-styles');
      if (existingLink) {
        document.head.removeChild(existingLink);
      }
    };
  }, []);

  // Override root layout for board pages - no sidebar
  return <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>{children}</div>;
}
