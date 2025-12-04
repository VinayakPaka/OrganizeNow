"use client";

import { useEffect, useMemo, useImperativeHandle, forwardRef } from "react";
import { PartialBlock, BlockNoteEditor } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme } from "@/contexts/ThemeContext";
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
  // Get current theme from context
  const { theme } = useTheme();

  // Parse initial content with migration for BlockNote 0.42.0
  const initialBlocks = useMemo(() => {
    if (!initialContent) {
      console.log("[NotionEditor] No initial content, starting fresh");
      return undefined;
    }

    try {
      const parsed = JSON.parse(initialContent);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log("[NotionEditor] Loaded", parsed.length, "blocks");

        // Migrate old BlockNote 0.15.0 content to 0.42.0 format
        const migratedBlocks = parsed.map((block: any) => {
          // If it's a numbered list without start attribute, add it
          if (block.type === 'numberedListItem' && !block.props?.start) {
            return {
              ...block,
              props: {
                ...block.props,
                start: 1, // Default start value for numbered lists
              }
            };
          }
          return block;
        });

        return migratedBlocks as PartialBlock[];
      }
    } catch (error) {
      console.error("[NotionEditor] Failed to parse content:", error);
      // Return empty content on parse error instead of crashing
      return undefined;
    }

    return undefined;
  }, [initialContent]);

  // Create editor instance with proper error handling for schema
  const editor = useCreateBlockNote({
    initialContent: initialBlocks,
    // Don't customize schema - use defaults from BlockNote 0.42.0
  });

  // Expose editor methods via ref
  useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      if (!editor) return;

      try {
        // Get current block or last block in document
        const cursorPosition = editor.getTextCursorPosition();
        const targetBlock = cursorPosition?.block || editor.document[editor.document.length - 1];

        if (!targetBlock) {
          console.warn('[NotionEditor] No valid block found, cannot insert text');
          return;
        }

        // Insert a new paragraph block with the text after the target block
        editor.insertBlocks(
          [
            {
              type: 'paragraph',
              content: [{ type: 'text', text, styles: {} }],
            },
          ],
          targetBlock,
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
    <div className={`notion-editor-wrapper ${theme}`} style={{ height: '100%', width: '100%' }}>
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={theme}
      />
    </div>
  );
});
