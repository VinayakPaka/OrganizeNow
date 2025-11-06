'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchPages,
  createPage,
  updatePage,
  deletePage,
  Page,
} from '@/store/slices/pagesSlice';
import { NotesList } from '@/components/notes/NotesList';
import { NotionEditor } from '@/components/notes/NotionEditor';
import { Save, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Notes Dashboard Page
 * Notion-like notes interface with BlockNote editor
 */
export default function NotesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { pages, isLoading, error } = useAppSelector((state) => state.pages);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [selectedNote, setSelectedNote] = useState<Page | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteIcon, setNoteIcon] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch pages on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPages());
    }
  }, [dispatch, isAuthenticated]);

  // Auto-select first note if none selected
  useEffect(() => {
    if (pages.length > 0 && !selectedNote) {
      handleSelectNote(pages[0]);
    }
  }, [pages]);

  // Handle note selection
  const handleSelectNote = (note: Page) => {
    // Save current note if there are unsaved changes
    if (hasUnsavedChanges && selectedNote) {
      handleSaveNote();
    }

    setSelectedNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteIcon(note.icon || '');
    setHasUnsavedChanges(false);
  };

  // Handle create new note
  const handleCreateNote = async () => {
    const result = await dispatch(
      createPage({
        title: 'Untitled Note',
        content: '',
        icon: '📝',
      })
    );

    if (createPage.fulfilled.match(result)) {
      const newNote = result.payload;
      setSelectedNote(newNote);
      setNoteTitle(newNote.title);
      setNoteContent(newNote.content);
      setNoteIcon(newNote.icon || '');
      setHasUnsavedChanges(false);
    }
  };

  // Handle save note
  const handleSaveNote = async () => {
    if (!selectedNote) return;

    setIsSaving(true);
    await dispatch(
      updatePage({
        id: selectedNote.id,
        title: noteTitle,
        content: noteContent,
        icon: noteIcon || undefined,
      })
    );
    setIsSaving(false);
    setHasUnsavedChanges(false);
  };

  // Handle delete note
  const handleDeleteNote = async (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await dispatch(deletePage(id));

      // Clear selection if deleted note was selected
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setNoteTitle('');
        setNoteContent('');
        setNoteIcon('');
      }
    }
  };

  // Auto-save debounced
  useEffect(() => {
    if (!hasUnsavedChanges || !selectedNote) return;

    const timer = setTimeout(() => {
      handleSaveNote();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [noteTitle, noteContent, noteIcon, hasUnsavedChanges]);

  // Track changes
  const handleTitleChange = (value: string) => {
    setNoteTitle(value);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (value: string) => {
    setNoteContent(value);
    setHasUnsavedChanges(true);
  };

  const handleIconChange = (value: string) => {
    setNoteIcon(value);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar - Notes List */}
      <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
        <NotesList
          notes={pages}
          selectedNoteId={selectedNote?.id || null}
          onSelectNote={handleSelectNote}
          onDeleteNote={handleDeleteNote}
          onCreateNote={handleCreateNote}
        />
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedNote ? (
          <div className="flex-1 flex flex-col">
            {/* Editor Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  {/* Icon Input */}
                  <input
                    type="text"
                    value={noteIcon}
                    onChange={(e) => handleIconChange(e.target.value)}
                    placeholder="📝"
                    className="w-12 text-2xl text-center bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    maxLength={2}
                  />

                  {/* Title Input */}
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Untitled"
                    className="flex-1 text-3xl font-bold bg-transparent focus:outline-none"
                  />
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {hasUnsavedChanges ? 'Save' : 'Saved'}
                    </>
                  )}
                </button>
              </div>

              {/* Metadata */}
              <div className="text-sm text-gray-500">
                Last edited{' '}
                {new Date(selectedNote.updated_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
            </div>

            {/* Notion-like Block Editor */}
            <div className="flex-1 overflow-y-auto bg-white">
              <NotionEditor
                key={selectedNote.id}
                initialContent={noteContent}
                onChange={handleContentChange}
                placeholder="Type '/' for commands..."
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-12">
            <div>
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Select a note or create a new one
              </h2>
              <p className="text-gray-500 mb-6">
                Your notes will appear here for editing
              </p>
              <button
                type="button"
                onClick={handleCreateNote}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                Create Your First Note
              </button>
            </div>
          </div>
        )}

        {/* Loading/Error States */}
        {isLoading && pages.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <Loader2 size={32} className="animate-spin text-purple-600" />
          </div>
        )}

        {error && (
          <div className="absolute top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
