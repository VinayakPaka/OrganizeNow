"use client";

import { useEffect, useMemo } from "react";
import { PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

interface NotionEditorCoreProps {
  initialContent?: string;
  onChange: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
}

/**
 * BlockNote Editor Component
 * Uses the latest BlockNote with Mantine UI
 */
export function NotionEditorCore({
  initialContent,
  onChange,
  editable = true,
  placeholder = "Type '/' for commands...",
}: NotionEditorCoreProps) {
  // Parse initial content
  const initialBlocks = useMemo(() => {
    if (!initialContent) {
      console.log("[NotionEditor] No initial content, starting fresh");
      return undefined;
    }

    try {
      const parsed = JSON.parse(initialContent);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log("[NotionEditor] Loaded", parsed.length, "blocks");
        return parsed as PartialBlock[];
      }
    } catch (error) {
      console.error("[NotionEditor] Failed to parse content:", error);
    }

    return undefined;
  }, [initialContent]);

  // Create editor instance
  const editor = useCreateBlockNote({
    initialContent: initialBlocks,
  });

  // Listen to changes
  useEffect(() => {
    if (!editor) return;

    const handleChange = () => {
      const currentBlocks = editor.document;
      const contentString = JSON.stringify(currentBlocks);
      console.log("[NotionEditor] Content changed, saving", currentBlocks.length, "blocks");
      onChange(contentString);
    };

    // Subscribe to editor changes
    return editor.onChange(handleChange);
  }, [editor, onChange]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-gray-500">Initializing editor...</div>
      </div>
    );
  }

  return (
    <div className="notion-editor-wrapper min-h-[500px]">
      <BlockNoteView editor={editor} editable={editable} theme="light" />
    </div>
  );
}
