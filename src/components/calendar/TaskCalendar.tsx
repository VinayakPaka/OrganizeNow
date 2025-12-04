/**
 * TaskCalendar Component
 * Displays tasks on a calendar view based on their due dates
 */

'use client';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Task } from '@/store/slices/tasksSlice';
import { useState, useMemo } from 'react';
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
  resource: Task;
}

interface TaskCalendarProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

/**
 * TaskCalendar Component
 * Shows tasks on calendar by due date
 */
export function TaskCalendar({ tasks, onSelectTask }: TaskCalendarProps) {
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Convert tasks to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return tasks
      .filter((task) => task.due_date)
      .map((task) => {
        const dueDate = new Date(task.due_date!);

        // If task has due time, use it
        if (task.due_time) {
          const [hours, minutes] = task.due_time.split(':').map(Number);
          dueDate.setHours(hours, minutes, 0, 0);
        } else {
          // Default to 9 AM if no time specified
          dueDate.setHours(9, 0, 0, 0);
        }

        // Event duration: 1 hour
        const endDate = new Date(dueDate);
        endDate.setHours(endDate.getHours() + 1);

        return {
          id: task.id,
          title: task.title,
          start: dueDate,
          end: endDate,
          resource: task,
        };
      });
  }, [tasks]);

  // Custom event style based on priority
  const eventStyleGetter = (event: CalendarEvent) => {
    const task = event.resource;
    let backgroundColor = '#9333ea'; // Default purple
    let borderColor = '#7c3aed';

    if (task.priority === 'high') {
      backgroundColor = '#dc2626'; // Red
      borderColor = '#b91c1c';
    } else if (task.priority === 'medium') {
      backgroundColor = '#f59e0b'; // Yellow/Orange
      borderColor = '#d97706';
    } else if (task.priority === 'low') {
      backgroundColor = '#10b981'; // Green
      borderColor = '#059669';
    }

    // Gray out completed tasks
    if (task.completed) {
      backgroundColor = '#9ca3af';
      borderColor = '#6b7280';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderLeft: `4px solid ${borderColor}`,
        color: 'white',
        borderRadius: '6px',
        padding: '4px 8px',
        fontSize: '13px',
        fontWeight: '500',
        opacity: task.completed ? 0.6 : 1,
        textDecoration: task.completed ? 'line-through' : 'none',
      },
    };
  };

  // Handle event click
  const handleSelectEvent = (event: CalendarEvent) => {
    onSelectTask(event.resource);
  };

  // Handle slot selection (clicking on empty date)
  const handleSelectSlot = ({ start, action }: { start: Date; action: 'select' | 'click' | 'doubleClick' }) => {
    // On double-click, create a placeholder task to allow editing
    if (action === 'doubleClick') {
      // Create a temporary task for editing
      console.log('Double-clicked on date:', start);
      // This will be handled by the parent component
      onSelectTask({
        id: 'new',
        title: '',
        description: '',
        due_date: start.toISOString().split('T')[0],
        due_time: `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`,
        priority: 'medium',
        completed: false,
        user_id: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Task);
    }
  };

  return (
    <div className="h-full bg-white rounded-xl shadow-sm">
      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
          height: 100%;
        }

        .rbc-header {
          padding: 12px 6px;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          background-color: #f9fafb;
        }

        .rbc-today {
          background-color: #f3f4f6;
        }

        .rbc-off-range-bg {
          background-color: #fafafa;
        }

        .rbc-date-cell {
          padding: 8px;
          text-align: right;
        }

        .rbc-event {
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .rbc-event:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .rbc-event-label {
          font-size: 11px;
        }

        .rbc-event-content {
          font-size: 13px;
        }

        .rbc-toolbar {
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
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

        .rbc-toolbar button:hover {
          background-color: #f3f4f6;
          border-color: #9ca3af;
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

        .rbc-month-view {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .rbc-day-bg {
          border-left: 1px solid #e5e7eb;
        }

        .rbc-month-row {
          border-top: 1px solid #e5e7eb;
          min-height: 140px;
          flex: 1 0 0;
          display: flex;
        }

        .rbc-row-content {
          min-height: 140px;
          flex: 1;
        }

        .rbc-month-view .rbc-row {
          flex: 1 0 0;
          display: flex;
        }

        .rbc-month-view {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .rbc-month-view .rbc-row-bg {
          display: flex;
          flex: 1 0 0;
        }

        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #e5e7eb;
        }

        /* Agenda view styling */
        .rbc-agenda-view {
          padding: 20px;
        }

        .rbc-agenda-table {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .rbc-agenda-date-cell,
        .rbc-agenda-time-cell {
          padding: 12px;
          font-weight: 600;
          color: #374151;
        }

        .rbc-agenda-event-cell {
          padding: 12px;
        }
      `}</style>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%', padding: '20px' }}
        view={view}
        onView={(newView) => {
          if (newView === 'month' || newView === 'week' || newView === 'day' || newView === 'agenda') {
            setView(newView);
          }
        }}
        date={currentDate}
        onNavigate={setCurrentDate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        popup
        tooltipAccessor={(event: CalendarEvent) => {
          const task = event.resource;
          return `${task.title}${task.description ? ` - ${task.description}` : ''}`;
        }}
      />
    </div>
  );
}
