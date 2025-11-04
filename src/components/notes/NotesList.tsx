'use client';

import { Page } from '@/store/slices/pagesSlice';
import { NoteCard } from './NoteCard';
import { FileText } from 'lucide-react';

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
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
        <button
          type="button"
          onClick={onCreateNote}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition"
        >
          + New Note
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <FileText size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Create your first note to get started
            </p>
            <button
              type="button"
              onClick={onCreateNote}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition"
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
