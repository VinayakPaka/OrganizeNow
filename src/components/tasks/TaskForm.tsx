'use client';

import { Task } from '@/store/slices/tasksSlice';
import { X, Calendar, Clock, Flag, Bell, AlertCircle } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { REMINDER_LIMITS } from '@/lib/constants/notifications';
import { sanitizeTaskTitle, sanitizeTaskDescription, sanitizeNumber } from '@/lib/utils/sanitize';

/**
 * Task form data interface
 * Represents the payload for creating/updating tasks
 */
export interface TaskFormData {
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  reminder_enabled: boolean;
  reminder_minutes_before: number;
}

interface TaskFormProps {
  task?: Task | null;
  onSave: (data: TaskFormData) => void;
  onClose: () => void;
}

/**
 * TaskForm component
 * Form for creating and editing tasks
 * Fixed: Inline errors, input sanitization, validation, UX improvements
 */
export function TaskForm({ task, onSave, onClose }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.due_date || '');
  const [dueTime, setDueTime] = useState(task?.due_time || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    task?.priority || 'medium'
  );
  const [category, setCategory] = useState(task?.category || '');
  const [reminderEnabled, setReminderEnabled] = useState(
    task?.reminder_enabled ?? true
  );
  const [reminderMinutes, setReminderMinutes] = useState(
    task?.reminder_minutes_before || 15
  );
  const [customMinutes, setCustomMinutes] = useState('');

  // Error states
  const [titleError, setTitleError] = useState('');
  const [customMinutesError, setCustomMinutesError] = useState('');

  // Validate title
  const validateTitle = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setTitleError('Task title is required');
      return false;
    }
    if (trimmed.length > 200) {
      setTitleError('Title must be less than 200 characters');
      return false;
    }
    setTitleError('');
    return true;
  }, []);

  // Validate custom minutes
  const validateCustomMinutes = useCallback((value: string) => {
    if (!value) {
      setCustomMinutesError('Please enter a custom reminder time');
      return false;
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue < REMINDER_LIMITS.MIN_MINUTES || numValue > REMINDER_LIMITS.MAX_MINUTES) {
      setCustomMinutesError(
        `Enter a value between ${REMINDER_LIMITS.MIN_MINUTES} and ${REMINDER_LIMITS.MAX_MINUTES} minutes`
      );
      return false;
    }

    setCustomMinutesError('');
    return true;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate title
    if (!validateTitle(title)) {
      return;
    }

    // Use custom minutes if selected, otherwise use dropdown value
    let finalReminderMinutes = reminderMinutes;
    if (reminderMinutes === 0) {
      if (!validateCustomMinutes(customMinutes)) {
        return;
      }
      finalReminderMinutes = Number(customMinutes);
    }

    // Sanitize and prepare data
    const taskData = {
      title: sanitizeTaskTitle(title),
      description: sanitizeTaskDescription(description) || undefined,
      due_date: dueDate || undefined,
      due_time: dueTime || undefined,
      priority,
      category: category.trim().slice(0, 50) || undefined,
      reminder_enabled: reminderEnabled,
      reminder_minutes_before: finalReminderMinutes,
    };

    onSave(taskData);
  };

  // Quick date setters (memoized)
  const setToday = useCallback(() => {
    const today = new Date();
    setDueDate(today.toISOString().split('T')[0]);
  }, []);

  const setTomorrow = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const setNextWeek = useCallback(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setDueDate(nextWeek.toISOString().split('T')[0]);
  }, []);

  // Handle title change with validation
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    if (titleError) {
      validateTitle(value);
    }
  }, [titleError, validateTitle]);

  // Handle custom minutes change with sanitization
  const handleCustomMinutesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeNumber(e.target.value);
    setCustomMinutes(sanitized);
    if (customMinutesError) {
      validateCustomMinutes(sanitized);
    }
  }, [customMinutesError, validateCustomMinutes]);

  // Character count for title
  const titleLength = title.length;
  const titleMaxLength = 200;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-900 dark:text-white"
            aria-label="Close form"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Title *
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={() => validateTitle(title)}
              placeholder="e.g., Complete project report"
              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition ${
                titleError
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
              }`}
              maxLength={titleMaxLength}
              aria-required="true"
              aria-invalid={!!titleError}
              aria-describedby={titleError ? "title-error" : undefined}
            />
            <div className="flex items-center justify-between mt-1">
              {titleError ? (
                <p id="title-error" className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {titleError}
                </p>
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {titleLength}/{titleMaxLength} characters
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this task..."
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description.length}/1000 characters
            </p>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Due Date
            </label>
            <div className="space-y-2">
              {/* Quick date buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={setToday}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={setTomorrow}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={setNextWeek}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition"
                >
                  Next Week
                </button>
              </div>

              {/* Date input */}
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Due Time */}
          <div>
            <label htmlFor="task-due-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock size={16} className="inline mr-1" />
              Due Time
            </label>
            <input
              id="task-due-time"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Flag size={16} className="inline mr-1" />
              Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPriority('low')}
                className={`px-4 py-3 rounded-lg border-2 transition ${
                  priority === 'low'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 text-gray-900 dark:text-white'
                }`}
                aria-pressed={priority === 'low'}
              >
                Low
              </button>
              <button
                type="button"
                onClick={() => setPriority('medium')}
                className={`px-4 py-3 rounded-lg border-2 transition ${
                  priority === 'medium'
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600 text-gray-900 dark:text-white'
                }`}
                aria-pressed={priority === 'medium'}
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`px-4 py-3 rounded-lg border-2 transition ${
                  priority === 'high'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 text-gray-900 dark:text-white'
                }`}
                aria-pressed={priority === 'high'}
              >
                High
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="task-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category (Optional)
            </label>
            <input
              id="task-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Work, Personal, Shopping"
              maxLength={50}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Reminder Settings */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <Bell size={16} className="mr-2" />
                Enable Reminder
              </label>
              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  reminderEnabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
                role="switch"
                aria-checked={reminderEnabled}
                aria-label="Toggle reminder"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {reminderEnabled && (
              <div className="space-y-3">
                <label htmlFor="reminder-minutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Remind me before
                </label>
                <select
                  id="reminder-minutes"
                  value={reminderMinutes}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setReminderMinutes(value);
                    if (value !== 0) {
                      setCustomMinutes('');
                      setCustomMinutesError('');
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={1440}>1 day</option>
                  <option value={0}>Custom time</option>
                </select>

                {reminderMinutes === 0 && (
                  <div>
                    <label htmlFor="custom-minutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Custom minutes before
                    </label>
                    <input
                      id="custom-minutes"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={customMinutes}
                      onChange={handleCustomMinutesChange}
                      onBlur={() => validateCustomMinutes(customMinutes)}
                      placeholder="Enter minutes (e.g., 45)"
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition ${
                        customMinutesError
                          ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                      }`}
                      aria-invalid={!!customMinutesError}
                      aria-describedby={customMinutesError ? "custom-minutes-error" : "custom-minutes-help"}
                    />
                    {customMinutesError ? (
                      <p id="custom-minutes-error" className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {customMinutesError}
                      </p>
                    ) : (
                      <p id="custom-minutes-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Enter any value from {REMINDER_LIMITS.MIN_MINUTES} to {REMINDER_LIMITS.MAX_MINUTES} minutes (1 week)
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!!titleError || (reminderMinutes === 0 && !!customMinutesError)}
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
