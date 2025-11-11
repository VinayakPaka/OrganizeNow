'use client';

import { Page } from '@/store/slices/pagesSlice';
import { NoteCard } from './NoteCard';
import { FileText, Plus } from 'lucide-react';

interface NotesListProps {
  notes: Page[];
  selectedNoteId: string | null;
  onSelectNote: (note: Page) => void;
  onDeleteNote: (id: string) => void;
  onCreateNote: () => void;
}

/**
 * NotesList component
 * Displays a list of notes in a sidebar
 */
export function NotesList({
  notes,
  selectedNoteId,
  onSelectNote,
  onDeleteNote,
  onCreateNote,
}: NotesListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notes</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{notes.length}</span>
        </div>
        <button
          type="button"
          onClick={onCreateNote}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl transition-all shadow-sm font-medium"
        >
          <Plus size={20} />
          New Note
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mb-4">
              <FileText size={32} className="text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No notes yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Create your first note to get started
            </p>
            <button
              type="button"
              onClick={onCreateNote}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl transition-all shadow-sm font-medium text-sm"
            >
              Create Note
            </button>
          </div>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isActive={note.id === selectedNoteId}
              onClick={() => onSelectNote(note)}
              onDelete={() => onDeleteNote(note.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
