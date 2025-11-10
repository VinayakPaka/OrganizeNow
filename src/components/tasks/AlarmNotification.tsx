'use client';

import { Task } from '@/store/slices/tasksSlice';
import { X, Bell, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { ALARM_CONFIG } from '@/lib/constants/notifications';
import { escapeHTML } from '@/lib/utils/sanitize';

interface AlarmNotificationProps {
  task: Task;
  onDismiss: () => void;
  onSnooze: () => void;
  onTaskClick: () => void;
}

/**
 * AlarmNotification component
 * WhatsApp-style notification with continuous alarm sound
 * Fixed: Memory leaks, audio context, accessibility, performance
 */
export function AlarmNotification({ task, onDismiss, onSnooze, onTaskClick }: AlarmNotificationProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Focus trap for accessibility
  const modalRef = useFocusTrap(true);

  // Memoize formatted values for performance
  const formattedTime = useMemo(() => formatTime(task.due_time), [task.due_time]);
  const formattedDate = useMemo(() => formatDate(task.due_date), [task.due_date]);
  const priorityColors = useMemo(() => getPriorityColors(task.priority), [task.priority]);

  // Sanitize task data to prevent XSS (defense in depth, even though React escapes by default)
  const sanitizedTitle = useMemo(() => escapeHTML(task.title || ''), [task.title]);
  const sanitizedDescription = useMemo(() => escapeHTML(task.description || ''), [task.description]);
  const sanitizedCategory = useMemo(() => escapeHTML(task.category || ''), [task.category]);

  // Alarm functions (defined before useEffects that use them)
  const playAlarmLoop = useCallback(() => {
    if (!audioContextRef.current || !isPlaying) return;

    try {
      const ctx = audioContextRef.current;

      // Create oscillator and gain node
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Configure alarm sound - alternating tones like phone alarm
      oscillator.type = ALARM_CONFIG.OSCILLATOR_TYPE;
      const now = ctx.currentTime;

      // Create beeping pattern: beep-beep-pause-beep-beep-pause
      const pattern = [
        { freq: ALARM_CONFIG.FREQUENCY, duration: ALARM_CONFIG.BEEP_DURATION },
        { freq: 0, duration: ALARM_CONFIG.SHORT_PAUSE },
        { freq: ALARM_CONFIG.FREQUENCY, duration: ALARM_CONFIG.BEEP_DURATION },
        { freq: 0, duration: ALARM_CONFIG.LONG_PAUSE },
        { freq: ALARM_CONFIG.FREQUENCY, duration: ALARM_CONFIG.BEEP_DURATION },
        { freq: 0, duration: ALARM_CONFIG.SHORT_PAUSE },
        { freq: ALARM_CONFIG.FREQUENCY, duration: ALARM_CONFIG.BEEP_DURATION },
        { freq: 0, duration: ALARM_CONFIG.LONG_PAUSE },
      ];

      let time = now;
      pattern.forEach(({ freq, duration }) => {
        oscillator.frequency.setValueAtTime(freq, time);
        if (freq === 0) {
          gainNode.gain.setValueAtTime(0, time);
        } else {
          gainNode.gain.setValueAtTime(ALARM_CONFIG.VOLUME, time);
          gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration);
        }
        time += duration;
      });

      oscillator.start(now);
      oscillator.stop(time);

      // Schedule next loop - FIX: Track timeout to prevent memory leak
      const loopDuration = (time - now) * 1000;
      timeoutRef.current = setTimeout(() => {
        if (isPlaying && audioContextRef.current) {
          playAlarmLoop();
        }
      }, loopDuration);
    } catch (error) {
      console.error('[AlarmNotification] Error in playAlarmLoop:', error);
      setError('Alarm playback interrupted');
    }
  }, [isPlaying]);

  const startAlarm = useCallback(async () => {
    try {
      // Create audio context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

      if (!AudioContext) {
        throw new Error('Web Audio API not supported');
      }

      audioContextRef.current = new AudioContext();

      // Resume context if suspended (required by modern browsers)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Create continuous alarm sound
      playAlarmLoop();
      setIsPlaying(true);

      console.log('[AlarmNotification] Started continuous alarm');
    } catch (error) {
      console.error('[AlarmNotification] Failed to start alarm:', error);
      setError('Failed to play alarm sound');

      // Fallback: Try to play a simple beep
      try {
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = ALARM_CONFIG.FREQUENCY;
        gainNode.gain.value = ALARM_CONFIG.VOLUME;
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 1);

        // Close AudioContext after beep completes to prevent memory leak
        oscillator.onended = () => {
          audioCtx.close();
        };
      } catch (fallbackError) {
        console.error('[AlarmNotification] Fallback also failed:', fallbackError);
      }
    }
  }, [playAlarmLoop]);

  const stopAlarm = useCallback(() => {
    setIsPlaying(false);

    // Clear timeout to prevent memory leak
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {
        // Oscillator might already be stopped
      }
      oscillatorRef.current = null;
    }

    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    console.log('[AlarmNotification] Stopped alarm');
  }, []);

  const handleDismiss = useCallback(() => {
    stopAlarm();
    onDismiss();
  }, [stopAlarm, onDismiss]);

  const handleSnooze = useCallback(() => {
    stopAlarm();
    onSnooze();
  }, [stopAlarm, onSnooze]);

  const handleTaskClickInternal = useCallback(() => {
    stopAlarm();
    onTaskClick();
  }, [stopAlarm, onTaskClick]);

  // Start continuous alarm sound on mount
  useEffect(() => {
    startAlarm();

    return () => {
      stopAlarm();
    };
  }, [startAlarm, stopAlarm]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        handleSnooze();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleTaskClickInternal();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [handleDismiss, handleSnooze, handleTaskClickInternal]);

  // Handle backdrop click - snooze
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleSnooze();
    }
  }, [handleSnooze]);

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-[9998] backdrop-blur-sm"
        onClick={handleBackdropClick}
        aria-hidden="true"
      ></div>

      {/* WhatsApp-style notification */}
      <div
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alarm-title"
        aria-describedby="alarm-description"
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-[440px] max-w-[90vw] border-2 rounded-2xl shadow-2xl overflow-hidden ${priorityColors.bg}`}
        style={{
          animation: 'alarmScaleIn 0.3s ease-out, alarmShake 0.5s ease-in-out infinite',
        }}
      >
        {/* Priority indicator bar */}
        <div className={`h-3 ${priorityColors.badge} relative overflow-hidden`}>
          <div
            className="absolute inset-0 bg-white opacity-30 alarm-shimmer"
          ></div>
        </div>

        <div className="p-6">
          {/* Header with alarm icon */}
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full ${priorityColors.badge} relative`}>
              <Bell size={32} className="text-white alarm-ring" />
              <div className="absolute inset-0 rounded-full bg-white opacity-50 alarm-ping"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={20} className={priorityColors.icon} />
                <h2 id="alarm-title" className="text-xl font-bold text-gray-900">Task Reminder</h2>
              </div>
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${priorityColors.badge} text-white uppercase tracking-wider`}>
                {task.priority} Priority
              </span>
            </div>
          </div>

          {/* Error message if any */}
          {error && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              {error}
            </div>
          )}

          {/* Task content */}
          <div id="alarm-description" className="mb-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2 break-words">
              {sanitizedTitle}
            </h3>
            {sanitizedDescription && (
              <p className="text-sm text-gray-700 mb-3 break-words">
                {sanitizedDescription}
              </p>
            )}

            {/* Task metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {formattedDate && (
                <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                  <Calendar size={16} aria-hidden="true" />
                  <span>{formattedDate}</span>
                </div>
              )}
              {formattedTime && (
                <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                  <Clock size={16} aria-hidden="true" />
                  <span>{formattedTime}</span>
                </div>
              )}
              {sanitizedCategory && (
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  {sanitizedCategory}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDismiss}
              className={`flex-1 px-5 py-3 ${priorityColors.badge} hover:opacity-90 text-white rounded-xl font-bold transition text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${priorityColors.ring}`}
              aria-label="Turn off alarm and dismiss notification"
            >
              Turn Off Alarm
            </button>
            <button
              type="button"
              onClick={handleSnooze}
              className="px-5 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              aria-label="Snooze alarm for 5 minutes"
            >
              Snooze 5m
            </button>
          </div>

          {/* View task link */}
          <button
            type="button"
            onClick={handleTaskClickInternal}
            className="w-full mt-3 px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            aria-label="View task details"
          >
            View Task Details
          </button>

          {/* Keyboard shortcuts hint */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">ESC</kbd> Dismiss •
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded ml-1">Space</kbd> Snooze •
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded ml-1">Enter</kbd> View
          </div>
        </div>
      </div>

      {/* CSS Animations - Moved to external stylesheet would be better for production */}
      <style jsx>{`
        @keyframes alarmScaleIn {
          from {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }

        @keyframes alarmShake {
          0%, 100% { transform: translate(-50%, -50%) translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-50%, -50%) translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translate(-50%, -50%) translateX(5px); }
        }

        :global(.alarm-ring) {
          animation: alarmRing 1s ease-in-out infinite;
        }

        @keyframes alarmRing {
          0%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(-15deg); }
          20%, 40% { transform: rotate(15deg); }
        }

        :global(.alarm-ping) {
          animation: alarmPing 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes alarmPing {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        :global(.alarm-shimmer) {
          animation: alarmShimmer 2s infinite;
        }

        @keyframes alarmShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}

// Helper functions (memoized)
function formatTime(time?: string): string | null {
  if (!time) return null;

  try {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch {
    return null;
  }
}

function formatDate(dateString?: string): string | null {
  if (!dateString) return null;

  try {
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
  } catch {
    return null;
  }
}

function getPriorityColors(priority: string) {
  switch (priority) {
    case 'high':
      return {
        bg: 'bg-red-50 border-red-500',
        badge: 'bg-red-600',
        icon: 'text-red-600',
        ring: 'focus:ring-red-500',
      };
    case 'medium':
      return {
        bg: 'bg-yellow-50 border-yellow-500',
        badge: 'bg-yellow-600',
        icon: 'text-yellow-600',
        ring: 'focus:ring-yellow-500',
      };
    case 'low':
      return {
        bg: 'bg-green-50 border-green-500',
        badge: 'bg-green-600',
        icon: 'text-green-600',
        ring: 'focus:ring-green-500',
      };
    default:
      return {
        bg: 'bg-white border-gray-300',
        badge: 'bg-gray-600',
        icon: 'text-gray-600',
        ring: 'focus:ring-gray-500',
      };
  }
}
