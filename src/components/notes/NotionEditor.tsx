"use client";

import { useState, useEffect, forwardRef, useImperativeHandle, useRef, ComponentType } from "react";
import dynamic from "next/dynamic";
import { NotionEditorHandle } from "./NotionEditorCore";

interface NotionEditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
}

export type { NotionEditorHandle };

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
export const NotionEditor = forwardRef<NotionEditorHandle, NotionEditorProps>(({
  initialContent,
  onChange,
  editable = true,
  placeholder = "Type '/' for commands...",
}, ref) => {
  const [isMounted, setIsMounted] = useState(false);
  const [EditorComponent, setEditorComponent] = useState<ComponentType<any> | null>(null);
  const editorRef = useRef<NotionEditorHandle>(null);

  // Expose the editor ref methods
  useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      if (editorRef.current) {
        editorRef.current.insertText(text);
      } else {
        console.error('[NotionEditor] Editor ref not ready');
      }
    },
    getEditor: () => {
      return editorRef.current?.getEditor() || null;
    },
  }), []);

  // Wait for client-side mount and load component
  useEffect(() => {
    setIsMounted(true);

    // Dynamically import the editor
    import("./NotionEditorCore").then((mod) => {
      setEditorComponent(() => mod.NotionEditorCore);
    });
  }, []);

  if (!isMounted || !EditorComponent) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <EditorComponent
      ref={editorRef}
      initialContent={initialContent}
      onChange={onChange}
      editable={editable}
      placeholder={placeholder}
    />
  );
});
