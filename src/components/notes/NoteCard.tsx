'use client';

import { Page } from '@/store/slices/pagesSlice';
import { FileText, Trash2, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface NoteCardProps {
  note: Page;
  onClick: () => void;
  onDelete: () => void;
  isActive?: boolean;
}

/**
 * NoteCard component
 * Displays a note card in the notes list
 */
export function NoteCard({ note, onClick, onDelete, isActive }: NoteCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Extract plain text preview from BlockNote JSON content
  const getPreview = (content: string) => {
    if (!content) return 'No content';

    try {
      // Try to parse as BlockNote JSON
      const blocks = JSON.parse(content);

      if (Array.isArray(blocks)) {
        // Extract text from all blocks
        const textParts: string[] = [];

        blocks.forEach((block: any) => {
          if (block.content) {
            if (Array.isArray(block.content)) {
              // Extract text from content array
              block.content.forEach((item: any) => {
                if (item.type === 'text' && item.text) {
                  textParts.push(item.text);
                }
              });
            }
          }
        });

        const text = textParts.join(' ').trim();
        if (text.length === 0) return 'Empty note';
        return text.length > 80 ? text.substring(0, 80) + '...' : text;
      }
    } catch (e) {
      // If JSON parsing fails, treat as plain text/HTML
      const text = content.replace(/<[^>]*>/g, '').trim();
      if (text.length === 0) return 'Empty note';
      return text.length > 80 ? text.substring(0, 80) + '...' : text;
    }

    return 'Empty note';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className={`group relative p-4 rounded-2xl border cursor-pointer transition-all ${
        isActive
          ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
          : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {note.icon ? (
            <span className="text-xl flex-shrink-0">{note.icon}</span>
          ) : (
            <FileText size={20} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
          )}
          <h3 className={`font-semibold truncate ${
            isActive
              ? 'text-blue-700 dark:text-blue-400'
              : 'text-gray-900 dark:text-white'
          }`}>
            {note.title}
          </h3>
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            type="button"
            className={`p-1 rounded-lg transition-all ${
              isActive
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100'
            } hover:bg-gray-200 dark:hover:bg-gray-700`}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical size={16} className="text-gray-600 dark:text-gray-400" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              ></div>
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDelete();
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Preview */}
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
        {getPreview(note.content)}
      </p>

      {/* Footer */}
      <div className="text-xs text-gray-500 dark:text-gray-500">
        {formatDate(note.updated_at)}
      </div>
    </div>
  );
}
