'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchPages,
  createPage,
  updatePage,
  deletePage,
  Page,
} from '@/store/slices/pagesSlice';
import { NotesList } from '@/components/notes/NotesList';
import { NotionEditor, NotionEditorHandle } from '@/components/notes/NotionEditor';
import { NotesAIToolbar } from '@/components/notes/NotesAIToolbar';
import { Save, Loader2, Search, Bell, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Notes Dashboard Page
 * Notion-like notes interface with BlockNote editor
 */
export default function NotesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { pages, isLoading, error } = useAppSelector((state) => state.pages);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Filter out archived notes (calendar notes)
  const regularNotes = pages.filter((page) => !page.is_archived);

  const editorRef = useRef<NotionEditorHandle>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [selectedNote, setSelectedNote] = useState<Page | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteIcon, setNoteIcon] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  // Fetch pages on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPages());
    }
  }, [dispatch, isAuthenticated]);

  // Handle save note
  const handleSaveNote = useCallback(async () => {
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
  }, [selectedNote, noteTitle, noteContent, noteIcon, dispatch]);

  // Handle note selection
  const handleSelectNote = useCallback(async (note: Page) => {
    // Save current note if there are unsaved changes
    if (hasUnsavedChanges && selectedNote) {
      await handleSaveNote();
    }

    setSelectedNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteIcon(note.icon || '');
    setHasUnsavedChanges(false);
  }, [hasUnsavedChanges, selectedNote, handleSaveNote]);

  // Auto-select first note if none selected
  useEffect(() => {
    if (regularNotes.length > 0 && !selectedNote) {
      handleSelectNote(regularNotes[0]);
    }
  }, [regularNotes, selectedNote, handleSelectNote]);

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
    }, 2000);

    return () => clearTimeout(timer);
  }, [noteTitle, noteContent, noteIcon, hasUnsavedChanges, selectedNote, handleSaveNote]);

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

  // Handle AI text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();

      if (selection && selection.rangeCount > 0 && editorContainerRef.current) {
        const range = selection.getRangeAt(0);
        if (editorContainerRef.current.contains(range.commonAncestorContainer)) {
          const text = selection.toString();
          setSelectedText(text);
          return;
        }
      }

      setSelectedText('');
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  // Handle AI result application
  const handleApplyAIResult = (newText: string) => {
    if (editorRef.current) {
      editorRef.current.insertText(newText);
      setHasUnsavedChanges(true);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Left Sidebar - Notes List */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex-shrink-0">
        <NotesList
          notes={regularNotes}
          selectedNoteId={selectedNote?.id || null}
          onSelectNote={handleSelectNote}
          onDeleteNote={handleDeleteNote}
          onCreateNote={handleCreateNote}
        />
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Title Section */}
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xl">📝</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedNote ? noteTitle || 'Untitled' : 'Notes'}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedNote
                      ? `Last edited ${new Date(selectedNote.updated_at).toLocaleDateString()}`
                      : `${regularNotes.length} notes total`}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                {selectedNote && (
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    disabled={isSaving || !hasUnsavedChanges}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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
                )}
                <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  <Bell size={18} className="text-gray-600 dark:text-gray-300" />
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  <Settings size={18} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {selectedNote ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Editor Header */}
            <div className="bg-white dark:bg-gray-800 px-8 py-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                {/* Icon Input */}
                <input
                  type="text"
                  value={noteIcon}
                  onChange={(e) => handleIconChange(e.target.value)}
                  placeholder="📝"
                  className="w-16 h-16 text-3xl text-center bg-gray-50 dark:bg-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border border-gray-200 dark:border-gray-600"
                  maxLength={2}
                />

                {/* Title Input */}
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Untitled"
                  className="flex-1 text-4xl font-bold bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* Metadata */}
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
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

            {/* AI Toolbar */}
            <NotesAIToolbar
              selectedText={selectedText}
              onApplyResult={handleApplyAIResult}
            />

            {/* Notion-like Block Editor */}
            <div ref={editorContainerRef} className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 p-8">
              <div className="max-w-4xl mx-auto">
                <NotionEditor
                  ref={editorRef}
                  key={selectedNote.id}
                  initialContent={noteContent}
                  onChange={handleContentChange}
                  placeholder="Type '/' for commands..."
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-12 bg-white dark:bg-gray-800">
            <div>
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-6xl">📝</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Select a note or create a new one
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                Your notes will appear here for editing
              </p>
              <button
                type="button"
                onClick={handleCreateNote}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl transition-all shadow-lg"
              >
                Create Your First Note
              </button>
            </div>
          </div>
        )}

        {/* Loading/Error States */}
        {isLoading && regularNotes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <Loader2 size={48} className="animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        )}

        {error && (
          <div className="absolute top-4 right-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-2xl shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
