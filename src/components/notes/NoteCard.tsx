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

  // Extract plain text preview from HTML content
  const getPreview = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
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
      className={`group relative p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
        isActive
          ? 'border-purple-500 bg-purple-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-purple-300'
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {note.icon ? (
            <span className="text-xl">{note.icon}</span>
          ) : (
            <FileText size={20} className="text-gray-400 flex-shrink-0" />
          )}
          <h3 className="font-medium text-gray-900 truncate">{note.title}</h3>
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            type="button"
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              ></div>
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
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
      {note.content && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {getPreview(note.content)}
        </p>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-500">
        {formatDate(note.updated_at)}
      </div>
    </div>
  );
}
