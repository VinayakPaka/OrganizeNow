/**
 * Calendar Page
 * Shows calendar with daily notes
 */

'use client';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState, useRef, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPages, createPage, updatePage, deletePage, Page } from '@/store/slices/pagesSlice';
import type { View } from 'react-big-calendar';
import type { NotionEditorHandle } from '@/components/notes/NotionEditor';
import { AlertModal, ConfirmModal } from '@/components/ui/Modal';
import { Loader2, Calendar as CalendarIcon, X, Save, Trash2, Bell, Settings, Search } from 'lucide-react';

// Dynamically import heavy libraries
const ReactBigCalendar = dynamic(
  () => import('react-big-calendar').then(mod => ({ default: mod.Calendar })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading calendar...</span>
      </div>
    ),
  }
);

const NotionEditor = dynamic(
  () => import('@/components/notes/NotionEditor').then(mod => ({ default: mod.NotionEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    ),
  }
);

// Import date-fns and create localizer dynamically
let localizer: any = null;
const getLocalizer = async () => {
  if (localizer) return localizer;

  const { dateFnsLocalizer } = await import('react-big-calendar');
  const { format, parse, startOfWeek, getDay } = await import('date-fns');
  const { enUS } = await import('date-fns/locale/en-US');

  localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: { 'en-US': enUS },
  });

  return localizer;
};

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Page;
}

export default function CalendarPage() {
  const dispatch = useAppDispatch();
  const { pages, isLoading, error } = useAppSelector((state) => state.pages);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const editorRef = useRef<NotionEditorHandle>(null);
  const [view, setView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedNote, setSelectedNote] = useState<Page | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorAlert, setErrorAlert] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; noteId: string | null }>({ show: false, noteId: null });
  const [calendarLocalizer, setCalendarLocalizer] = useState<any>(null);

  // Load localizer lazily
  useEffect(() => {
    getLocalizer().then(setCalendarLocalizer);
  }, []);

  // Fetch pages on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPages());
    }
  }, [dispatch, isAuthenticated]);

  // Convert pages to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return pages
      .filter((page) => {
        const dateMatch = page.title.match(/\d{4}-\d{2}-\d{2}/);
        return page.is_archived && dateMatch !== null;
      })
      .map((page) => {
        const dateMatch = page.title.match(/\d{4}-\d{2}-\d{2}/);
        const dateStr = dateMatch![0];
        const date = new Date(dateStr);
        date.setHours(10, 0, 0, 0);

        let preview = 'Notes';
        if (page.content) {
          try {
            const blocks = JSON.parse(page.content);
            if (Array.isArray(blocks) && blocks.length > 0) {
              for (const block of blocks) {
                if (block.content && Array.isArray(block.content)) {
                  const text = block.content
                    .filter((item: any) => item.type === 'text' && item.text)
                    .map((item: any) => item.text)
                    .join(' ')
                    .trim();

                  if (text) {
                    preview = text.length > 50 ? text.substring(0, 50) + '...' : text;
                    break;
                  }
                }
              }
            }
          } catch (e) {
            if (page.content.trim()) {
              preview = page.content.length > 50
                ? page.content.substring(0, 50) + '...'
                : page.content;
            }
          }
        }

        return {
          id: page.id,
          title: preview,
          start: date,
          end: date,
          resource: page,
        };
      });
  }, [pages]);

  const handleSelectSlot = ({ start }: { start: Date; action: 'select' | 'click' | 'doubleClick' }) => {
    const dateStr = format(start, 'yyyy-MM-dd');
    const existingNote = pages.find((page) => page.is_archived && page.title.includes(dateStr));

    if (existingNote) {
      setSelectedNote(existingNote);
      setNoteTitle(existingNote.title);
      setNoteContent(existingNote.content);
    } else {
      const newTitle = `Daily Note - ${dateStr}`;
      setSelectedNote(null);
      setNoteTitle(newTitle);
      setNoteContent('');
    }

    setSelectedDate(start);
  };

  const handleSelectEvent = (event: object) => {
    const calEvent = event as CalendarEvent;
    setSelectedNote(calEvent.resource);
    setNoteTitle(calEvent.resource.title);
    setNoteContent(calEvent.resource.content);
    setSelectedDate(calEvent.start);
  };

  const handleSaveNote = async () => {
    if (!selectedDate) return;

    setIsSaving(true);

    try {
      if (selectedNote) {
        const result = await dispatch(
          updatePage({
            id: selectedNote.id,
            title: noteTitle,
            content: noteContent,
            is_archived: true,
          })
        );

        if (updatePage.fulfilled.match(result)) {
          console.log('[Calendar] Note updated successfully');
        } else {
          setErrorAlert({ show: true, message: 'Failed to save note. Please try again.' });
        }
      } else {
        const result = await dispatch(
          createPage({
            title: noteTitle,
            content: noteContent,
            icon: '📅',
            is_archived: true,
          })
        );

        if (createPage.fulfilled.match(result)) {
          setSelectedNote(result.payload);
        } else {
          setErrorAlert({ show: true, message: 'Failed to save note. Please try again.' });
        }
      }
    } catch (error) {
      setErrorAlert({ show: true, message: 'An error occurred while saving. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote || isDeleting) return;
    setConfirmDelete({ show: true, noteId: selectedNote.id });
  };

  const confirmDeleteNote = async () => {
    if (!confirmDelete.noteId || isDeleting) return;

    setIsDeleting(true);
    try {
      const result = await dispatch(deletePage(confirmDelete.noteId));

      if (deletePage.fulfilled.match(result)) {
        handleClose();
      } else {
        setErrorAlert({ show: true, message: 'Failed to delete note. Please try again.' });
      }
    } catch (error) {
      setErrorAlert({ show: true, message: 'An error occurred while deleting. Please try again.' });
    } finally {
      setIsDeleting(false);
      setConfirmDelete({ show: false, noteId: null });
    }
  };

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedNote(null);
    setNoteTitle('');
    setNoteContent('');
  };

  const eventStyleGetter = () => {
    return {
      style: {
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderLeft: '3px solid #2563eb',
        color: 'white',
        borderRadius: '8px',
        padding: '3px 6px',
        fontSize: '11px',
        fontWeight: '500',
      },
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-black dark:via-gray-900 dark:to-black">
      {/* Top Header Bar */}
      <div className="bg-white/80 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <span className="text-white text-xl">📅</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Calendar</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track your daily notes</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                />
              </div>
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

      {/* Calendar */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {isLoading && pages.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 size={48} className="animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
                Error loading notes
              </div>
              <div className="text-gray-600 dark:text-gray-400">{error}</div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-8 border border-gray-100 dark:border-gray-700" style={{ height: '700px' }}>
            <style jsx global>{`
              .rbc-calendar {
                font-family: inherit;
                height: 100%;
              }

              .rbc-header {
                padding: 12px 8px;
                font-weight: 600;
                font-size: 14px;
                color: #374151;
                border-bottom: 2px solid #e5e7eb;
                background-color: #f9fafb;
              }

              .dark .rbc-header {
                color: #d1d5db;
                background-color: #1f2937;
                border-bottom-color: #374151;
              }

              .rbc-today {
                background-color: #dbeafe;
              }

              .dark .rbc-today {
                background-color: #1e3a8a;
              }

              .rbc-toolbar {
                padding: 16px 20px;
                border-bottom: 1px solid #e5e7eb;
                margin-bottom: 20px;
              }

              .dark .rbc-toolbar {
                border-bottom-color: #374151;
              }

              .rbc-toolbar button {
                padding: 10px 20px;
                border: 1px solid #d1d5db;
                background-color: white;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 500;
                color: #374151;
                cursor: pointer;
                transition: all 0.2s;
              }

              .dark .rbc-toolbar button {
                background-color: #374151;
                border-color: #4b5563;
                color: #d1d5db;
              }

              .rbc-toolbar button:hover {
                background-color: #f3f4f6;
              }

              .dark .rbc-toolbar button:hover {
                background-color: #4b5563;
              }

              .rbc-toolbar button.rbc-active {
                background-color: #3b82f6;
                color: white;
                border-color: #3b82f6;
              }

              .rbc-toolbar-label {
                font-size: 20px;
                font-weight: 700;
                color: #111827;
              }

              .dark .rbc-toolbar-label {
                color: #f3f4f6;
              }

              .rbc-month-view {
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                overflow: hidden;
              }

              .dark .rbc-month-view {
                border-color: #374151;
              }
            `}</style>

            {calendarLocalizer ? (
              <ReactBigCalendar
                localizer={calendarLocalizer}
                events={events}
                startAccessor={(event: object) => (event as CalendarEvent).start}
                endAccessor={(event: object) => (event as CalendarEvent).end}
                style={{ height: '100%' }}
                view={view}
                onView={(newView) => setView(newView)}
                date={currentDate}
                onNavigate={setCurrentDate}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                eventPropGetter={eventStyleGetter}
              />
            ) : (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading calendar...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notes Editor Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-8 py-6">
              <div className="flex items-center gap-4 flex-1">
                <CalendarIcon size={24} className="text-green-600 dark:text-green-400" />
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note title"
                  className="flex-1 text-2xl font-bold bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div className="flex items-center gap-3">
                {selectedNote && (
                  <button
                    type="button"
                    onClick={handleDeleteNote}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete
                      </>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl disabled:opacity-50 transition shadow-lg font-medium"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto">
                <NotionEditor
                  ref={editorRef}
                  key={selectedNote?.id || selectedDate.toISOString()}
                  initialContent={noteContent}
                  onChange={setNoteContent}
                  placeholder="Write your daily note here..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Error Alert Modal */}
      <AlertModal
        isOpen={errorAlert.show}
        onClose={() => setErrorAlert({ show: false, message: '' })}
        title="Error"
        message={errorAlert.message}
        type="error"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDelete.show}
        onClose={() => setConfirmDelete({ show: false, noteId: null })}
        onConfirm={confirmDeleteNote}
        title="Delete Daily Note"
        message="Are you sure you want to delete this daily note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
