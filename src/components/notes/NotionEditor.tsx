"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import the core editor component with SSR disabled
const NotionEditorCore = dynamic(
  () => import("./NotionEditorCore").then(mod => ({ default: mod.NotionEditorCore })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    )
  }
);

interface NotionEditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
}

/**
 * Notion-like Block Editor Component
 * Built with BlockNote - provides Notion-style editing experience
 *
 * Features:
 * - Slash commands (type "/" to insert blocks)
 * - Drag & drop blocks (reorder content)
 * - Floating toolbar (select text to format)
 * - Side menu (hover left for block actions)
 * - Nested blocks (indentation)
 * - Tables, images, code blocks
 * - Keyboard shortcuts
 */
export function NotionEditor({
  initialContent,
  onChange,
  editable = true,
  placeholder = "Type '/' for commands...",
}: NotionEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Wait for client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <NotionEditorCore
      initialContent={initialContent}
      onChange={onChange}
      editable={editable}
      placeholder={placeholder}
    />
  );
}
