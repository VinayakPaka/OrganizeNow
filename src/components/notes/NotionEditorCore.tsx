"use client";

import { useEffect, useMemo, useImperativeHandle, forwardRef } from "react";
import { PartialBlock, BlockNoteEditor } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/style.css";
import "@blocknote/mantine/style.css";

interface NotionEditorCoreProps {
  initialContent?: string;
  onChange: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
}

export interface NotionEditorHandle {
  insertText: (text: string) => void;
  getEditor: () => BlockNoteEditor | null;
}

/**
 * BlockNote Editor Component
 * Uses the latest BlockNote with Mantine UI
 */
export const NotionEditorCore = forwardRef<NotionEditorHandle, NotionEditorCoreProps>(({
  initialContent,
  onChange,
  editable = true,
  placeholder = "Type '/' for commands...",
}, ref) => {
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

  // Expose editor methods via ref
  useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      if (!editor) return;

      try {
        // Get cursor position safely
        const cursorPosition = editor.getTextCursorPosition();
        if (!cursorPosition || !cursorPosition.block) {
          console.warn('[NotionEditor] No valid cursor position, appending to end');
          // If no cursor position, append to end
          editor.insertBlocks([
            {
              type: 'paragraph',
              content: [{ type: 'text', text, styles: {} }],
            },
          ]);
          return;
        }

        // Insert a new paragraph block with the text at the current cursor position
        editor.insertBlocks(
          [
            {
              type: 'paragraph',
              content: [{ type: 'text', text, styles: {} }],
            },
          ],
          cursorPosition.block,
          'after'
        );
      } catch (error) {
        console.error('[NotionEditor] Failed to insert text:', error);
      }
    },
    getEditor: () => editor,
  }), [editor]);

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
    <div className="notion-editor-wrapper" style={{ height: '100%', width: '100%' }}>
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme="light"
      />
    </div>
  );
});
