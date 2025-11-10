/**
 * Calendar Page
 * Shows calendar with daily notes
 */

'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPages, createPage, updatePage, deletePage, Page } from '@/store/slices/pagesSlice';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { NotionEditor, NotionEditorHandle } from '@/components/notes/NotionEditor';
import { Loader2, Calendar as CalendarIcon, X, Save, Trash2 } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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

  // Fetch pages on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPages());
    }
  }, [dispatch, isAuthenticated]);

  // Convert pages to calendar events (only archived pages with dates - calendar notes)
  const events: CalendarEvent[] = useMemo(() => {
    return pages
      .filter((page) => {
        // Filter only archived pages (calendar notes) that have a date in the title
        const dateMatch = page.title.match(/\d{4}-\d{2}-\d{2}/);
        return page.is_archived && dateMatch !== null;
      })
      .map((page) => {
        const dateMatch = page.title.match(/\d{4}-\d{2}-\d{2}/);
        const dateStr = dateMatch![0];
        const date = new Date(dateStr);
        date.setHours(10, 0, 0, 0);

        // Extract preview from content (first 50 chars of text content)
        let preview = 'Notes';
        if (page.content) {
          try {
            const blocks = JSON.parse(page.content);
            if (Array.isArray(blocks) && blocks.length > 0) {
              // Find first block with text content
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
            // If content is not JSON, use it as-is
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

  // Handle date selection
  const handleSelectSlot = ({ start }: { start: Date; action: 'select' | 'click' | 'doubleClick' }) => {
    const dateStr = format(start, 'yyyy-MM-dd');

    // Check if calendar note exists for this date (only archived notes)
    const existingNote = pages.find((page) => page.is_archived && page.title.includes(dateStr));

    if (existingNote) {
      // Open existing note
      setSelectedNote(existingNote);
      setNoteTitle(existingNote.title);
      setNoteContent(existingNote.content);
    } else {
      // Create new note for this date
      const newTitle = `Daily Note - ${dateStr}`;
      setSelectedNote(null);
      setNoteTitle(newTitle);
      setNoteContent('');
    }

    setSelectedDate(start);
  };

  // Handle event click
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedNote(event.resource);
    setNoteTitle(event.resource.title);
    setNoteContent(event.resource.content);
    setSelectedDate(event.start);
  };

  // Handle save note
  const handleSaveNote = async () => {
    if (!selectedDate) return;

    setIsSaving(true);

    try {
      if (selectedNote) {
        // Update existing note - preserve is_archived flag
        const result = await dispatch(
          updatePage({
            id: selectedNote.id,
            title: noteTitle,
            content: noteContent,
            is_archived: true, // Keep it archived so it won't show in /notes
          })
        );

        if (updatePage.fulfilled.match(result)) {
          console.log('[Calendar] Note updated successfully');
        } else {
          console.error('[Calendar] Failed to update note:', result);
          alert('Failed to save note. Please try again.');
        }
      } else {
        // Create new calendar note (archived so it won't show in /notes)
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
          console.log('[Calendar] Note created successfully:', result.payload);
        } else {
          console.error('[Calendar] Failed to create note:', result);
          alert('Failed to save note. Please try again.');
        }
      }
    } catch (error) {
      console.error('[Calendar] Error saving note:', error);
      alert('An error occurred while saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete note
  const handleDeleteNote = async () => {
    if (!selectedNote || isDeleting) return;

    if (confirm('Are you sure you want to delete this daily note?')) {
      setIsDeleting(true);
      try {
        const result = await dispatch(deletePage(selectedNote.id));

        if (deletePage.fulfilled.match(result)) {
          console.log('[Calendar] Note deleted successfully');
          handleClose();
        } else {
          console.error('[Calendar] Failed to delete note:', result);
          alert('Failed to delete note. Please try again.');
        }
      } catch (error) {
        console.error('[Calendar] Error deleting note:', error);
        alert('An error occurred while deleting. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Handle close modal
  const handleClose = () => {
    setSelectedDate(null);
    setSelectedNote(null);
    setNoteTitle('');
    setNoteContent('');
  };

  // Custom event styling
  const eventStyleGetter = () => {
    return {
      style: {
        backgroundColor: '#9333ea',
        borderColor: '#7c3aed',
        borderLeft: '3px solid #7c3aed',
        color: 'white',
        borderRadius: '4px',
        padding: '2px 4px',
        fontSize: '11px',
        fontWeight: '500',
      },
    };
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
        <div className="flex items-center gap-3">
          <CalendarIcon size={32} className="text-purple-600 dark:text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Click on any date to create or view daily notes
            </p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 p-8 overflow-hidden">
        {isLoading && pages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={48} className="animate-spin text-purple-600 dark:text-purple-400" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
                Error loading notes
              </div>
              <div className="text-gray-600 dark:text-gray-400">{error}</div>
            </div>
          </div>
        ) : (
          <div className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <style jsx global>{`
              .rbc-calendar {
                font-family: inherit;
                height: 100%;
              }

              .rbc-header {
                padding: 8px 4px;
                font-weight: 600;
                font-size: 13px;
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
                background-color: #f3f4f6;
              }

              .dark .rbc-today {
                background-color: #1f2937;
              }

              .rbc-off-range-bg {
                background-color: #fafafa;
              }

              .dark .rbc-off-range-bg {
                background-color: #111827;
              }

              .rbc-date-cell {
                padding: 4px;
                text-align: right;
                font-size: 12px;
                color: #374151;
              }

              .dark .rbc-date-cell {
                color: #d1d5db;
              }

              .rbc-event {
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
              }

              .rbc-event:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }

              .rbc-toolbar {
                padding: 16px 20px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 12px;
                margin-bottom: 20px;
              }

              .dark .rbc-toolbar {
                border-bottom-color: #374151;
              }

              .rbc-toolbar button {
                padding: 8px 16px;
                border: 1px solid #d1d5db;
                background-color: white;
                border-radius: 8px;
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
                border-color: #9ca3af;
              }

              .dark .rbc-toolbar button:hover {
                background-color: #4b5563;
                border-color: #6b7280;
              }

              .rbc-toolbar button.rbc-active {
                background-color: #9333ea;
                color: white;
                border-color: #9333ea;
              }

              .rbc-toolbar button.rbc-active:hover {
                background-color: #7c3aed;
              }

              .rbc-toolbar-label {
                font-size: 18px;
                font-weight: 700;
                color: #111827;
              }

              .dark .rbc-toolbar-label {
                color: #f3f4f6;
              }

              .rbc-month-view {
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
                height: 100%;
                display: flex;
                flex-direction: column;
              }

              .dark .rbc-month-view {
                border-color: #374151;
                background-color: #1f2937;
              }

              .rbc-day-bg {
                border-left: 1px solid #e5e7eb;
              }

              .dark .rbc-day-bg {
                border-left-color: #374151;
              }

              .rbc-month-row {
                border-top: 1px solid #e5e7eb;
                min-height: 80px;
                flex: 1 0 0;
                display: flex;
              }

              .dark .rbc-month-row {
                border-top-color: #374151;
              }

              .rbc-row-content {
                min-height: 80px;
                flex: 1;
              }

              .rbc-month-view .rbc-row {
                flex: 1 0 0;
                display: flex;
              }

              .rbc-month-view .rbc-row-bg {
                display: flex;
                flex: 1 0 0;
              }
            `}</style>

            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
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
          </div>
        )}
      </div>

      {/* Notes Editor Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center gap-3 flex-1">
                <CalendarIcon size={24} className="text-purple-600 dark:text-purple-400" />
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note title"
                  className="flex-1 text-xl font-bold bg-transparent focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div className="flex items-center gap-2">
                {selectedNote && (
                  <button
                    type="button"
                    onClick={handleDeleteNote}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete this note"
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
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 transition"
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
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Body - Editor */}
            <div className="flex-1 overflow-y-auto p-6">
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
      )}
    </div>
  );
}
