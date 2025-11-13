'use client';

import { useState } from 'react';
import { Task } from '@/store/slices/tasksSlice';
import { ConfirmModal } from '@/components/ui/Modal';
import { CheckCircle2, Circle, Clock, Trash2, Calendar, Flag } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

/**
 * TaskCard component
 * Displays a single task card with actions
 */
export function TaskCard({ task, onToggleComplete, onDelete, onClick }: TaskCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Format date and time
  const formatDueDate = () => {
    if (!task.due_date) return null;

    const dueDate = new Date(task.due_date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if it's today
    if (dueDate.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if it's tomorrow
    if (dueDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    // Check if overdue
    if (dueDate < today && !task.completed) {
      return 'Overdue';
    }

    // Otherwise return formatted date
    return dueDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: dueDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatTime = () => {
    if (!task.due_time) return null;

    // Validate HH:MM format (24-hour format)
    const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(task.due_time)) {
      console.warn('[TaskCard] Invalid time format:', task.due_time);
      return null;
    }

    // Parse HH:MM format
    const timeParts = task.due_time.split(':');
    const hours = Number(timeParts[0]);
    const minutes = Number(timeParts[1]);

    // Guard against NaN
    if (isNaN(hours) || isNaN(minutes)) {
      return null;
    }

    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const dueDateLabel = formatDueDate();
  const timeLabel = formatTime();

  // Get priority color
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // Check if task is overdue
  const isOverdue = () => {
    if (!task.due_date || task.completed) return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  return (
    <div
      className={`group p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
        task.completed
          ? 'bg-gray-50 border-gray-200 opacity-70'
          : isOverdue()
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-gray-200 hover:border-purple-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task);
          }}
          className="flex-shrink-0 mt-0.5"
        >
          {task.completed ? (
            <CheckCircle2 size={20} className="text-green-600" />
          ) : (
            <Circle size={20} className="text-gray-400 hover:text-purple-600" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium text-gray-900 ${
              task.completed ? 'line-through text-gray-500' : ''
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-3 mt-2 text-xs">
            {/* Due date */}
            {dueDateLabel && (
              <div
                className={`flex items-center gap-1 ${
                  isOverdue() ? 'text-red-600 font-medium' : 'text-gray-600'
                }`}
              >
                <Calendar size={12} />
                <span>{dueDateLabel}</span>
              </div>
            )}

            {/* Time */}
            {timeLabel && (
              <div className="flex items-center gap-1 text-gray-600">
                <Clock size={12} />
                <span>{timeLabel}</span>
              </div>
            )}

            {/* Priority */}
            <div className={`flex items-center gap-1 ${getPriorityColor()}`}>
              <Flag size={12} />
              <span className="capitalize">{task.priority}</span>
            </div>

            {/* Category */}
            {task.category && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                {task.category}
              </span>
            )}
          </div>
        </div>

        {/* Delete Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmDelete(true);
          }}
          className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-600 transition-opacity"
        >
          <Trash2 size={16} />
        </button>
      </div>
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          onDelete(task.id);
          setConfirmDelete(false);
        }}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
