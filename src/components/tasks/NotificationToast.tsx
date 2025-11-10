'use client';

import { Task } from '@/store/slices/tasksSlice';
import { X, Bell, Calendar, Clock, Flag } from 'lucide-react';
import { useEffect } from 'react';

interface NotificationToastProps {
  task: Task;
  onClose: () => void;
  onTaskClick: () => void;
}

/**
 * NotificationToast component
 * Custom UI notification with sound for task reminders
 */
export function NotificationToast({ task, onClose, onTaskClick }: NotificationToastProps) {
  // Play notification sound on mount
  useEffect(() => {
    playNotificationSound();
  }, []);

  const playNotificationSound = () => {
    try {
      // Create audio context and play notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create oscillator for notification sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure sound - pleasant notification tone
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);

      // Close audio context after sound completes to prevent memory leak
      oscillator.onended = () => {
        audioContext.close().catch((err) => console.error('[NotificationToast] Error closing AudioContext:', err));
      };

      console.log('[NotificationToast] Played notification sound');
    } catch (error) {
      console.error('[NotificationToast] Failed to play sound:', error);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate.getTime() === today.getTime()) {
      return 'Today';
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dueDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const getPriorityTextColor = () => {
    switch (task.priority) {
      case 'high':
        return 'text-red-700';
      case 'medium':
        return 'text-yellow-700';
      case 'low':
        return 'text-green-700';
      default:
        return 'text-gray-700';
    }
  };

  const getPriorityBadgeColor = () => {
    switch (task.priority) {
      case 'high':
        return 'bg-red-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'low':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] w-96 border-2 rounded-xl shadow-2xl overflow-hidden animate-slide-in-right ${getPriorityColor()}`}
      style={{
        animation: 'slideInRight 0.3s ease-out, pulse 2s ease-in-out infinite',
      }}
    >
      {/* Priority Bar */}
      <div className={`h-2 ${getPriorityBadgeColor()}`}></div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${getPriorityBadgeColor()}`}>
              <Bell size={20} className="text-white animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Task Reminder</h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getPriorityBadgeColor()} text-white uppercase`}
                >
                  {task.priority} Priority
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Task Title */}
        <div
          className="mb-3 cursor-pointer hover:opacity-80 transition"
          onClick={onTaskClick}
        >
          <h4 className={`text-lg font-semibold ${getPriorityTextColor()}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Task Details */}
        <div className="flex items-center gap-4 text-sm">
          {task.due_date && (
            <div className="flex items-center gap-1 text-gray-700">
              <Calendar size={14} />
              <span className="font-medium">{formatDate(task.due_date)}</span>
            </div>
          )}
          {task.due_time && (
            <div className="flex items-center gap-1 text-gray-700">
              <Clock size={14} />
              <span className="font-medium">{formatTime(task.due_time)}</span>
            </div>
          )}
        </div>

        {/* Category */}
        {task.category && (
          <div className="mt-3">
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {task.category}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onTaskClick}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition text-sm"
          >
            View Task
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition text-sm"
          >
            Dismiss
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(147, 51, 234, 0);
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
